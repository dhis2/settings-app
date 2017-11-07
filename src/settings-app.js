import React from 'react';
import ReactDOM from 'react-dom';
import log from 'loglevel';

import { init, config, getUserSettings, getManifest } from 'd2/lib/d2';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// D2 UI
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

import appTheme from './theme';

import settingsActions from './settingsActions';
import configOptionStore from './configOptionStore';
import settingsKeyMapping from './settingsKeyMapping';

import i18next from 'i18next';
import XHR from 'i18next-xhr-backend';

const dhisDevConfig = DHIS_CONFIG; // eslint-disable-line

// Styles
require('../scss/settings-app.scss');

log.setLevel(process.env.NODE_ENV === 'production' ? log.levels.INFO : log.levels.DEBUG);

const a = document.createElement('a');
function getAbsoluteUrl(url) {
    a.href = url;
    return a.href;
}

function configI18n(userSettings) {

    const uiLocale = userSettings.keyUiLocale;
    i18next
      .use(XHR)
      .init({
        returnEmptyString: false,
        fallbackLng: false,
        keySeparator: '|',
        backend: {
          loadPath: '/i18n/{{lng}}.json'
        }
    }, function(err, t) {
      const uiLocale = userSettings.keyUiLocale;
      if (uiLocale && uiLocale !== 'en') {
        i18next.changeLanguage(uiLocale);
      }
    });
}

ReactDOM.render(
    <MuiThemeProvider muiTheme={appTheme}><LoadingMask /></MuiThemeProvider>,
    document.getElementById('app'),
);


getManifest('manifest.webapp')
    .then((manifest) => {
        const baseUrl = process.env.NODE_ENV === 'production' ? manifest.getBaseUrl() : dhisDevConfig.baseUrl;
        config.baseUrl = `${baseUrl}/api/26`;
        log.info(`Loading: ${manifest.name} v${manifest.version}`);
        log.info(`Built ${manifest.manifest_generated_at}`);

        config.schemas = [
            'indicatorGroup',
            'dataElementGroup',
            'userGroup',
            'organisationUnitLevel',
            'userRole',
            'organisationUnit',
            'categoryOptionGroupSet',
            'oAuth2Client',
        ];
    })
    .then(getUserSettings)
    .then(configI18n)
    .then(init)
    .then((d2) => {
        // App init
        log.debug('D2 initialized', d2);

        if (!d2.currentUser.authorities.has('F_SYSTEM_SETTING')) {
            document.write(i18next.t('Access denied'));
            return;
        }

        // Load alternatives
        const api = d2.Api.getApi();
        const apiBaseUrl = getAbsoluteUrl(api.baseUrl);
        const baseUrl = apiBaseUrl.substr(0, apiBaseUrl.lastIndexOf('/api/'));
        Promise.all([
            d2.models.indicatorGroup.list({ paging: false, fields: 'id,displayName', order: 'displayName:asc' }),
            d2.models.dataElementGroup.list({ paging: false, fields: 'id,displayName', order: 'displayName:asc' }),
            d2.models.userGroup.list({ paging: false, fields: 'id,displayName', order: 'displayName:asc' }),
            d2.models.organisationUnitLevel.list({
                paging: false,
                fields: 'id,level,displayName',
                order: 'level:asc',
            }),
            d2.models.userRole.list({ paging: false, fields: 'id,displayName', order: 'displayName:asc' }),
            d2.models.organisationUnit.list({
                paging: false,
                fields: 'id,displayName',
                filter: ['level:in:[1,2]'],
            }),
            api.get(`${baseUrl}/dhis-web-commons/menu/getModules.action`),
            api.get('system/flags'),
            api.get('system/styles'),
            api.get('locales/ui'),
            api.get('userSettings', { useFallback: false }),
        ]).then((results) => {
            const [
                indicatorGroups,
                dataElementGroups,
                userGroups,
                organisationUnitLevels,
                userRoles,
                organisationUnits] = results;

            // Apps/modules
            const startModules = (results[6].modules || []).map(module => ({
                id: module.defaultAction.substr(0, 3) === '../'
                    ? module.name
                    : `app:${module.name}`,
                displayName: module.displayName || module.name,
            }));

            // Flags
            const flags = (results[7] || []).map(flag => ({ id: flag.key, displayName: flag.name }));
            flags.unshift({ id: 'dhis2', displayName: i18next.t('No flag') });

            // Stylesheets
            const styles = (results[8] || []).map(style => ({ id: style.path, displayName: style.name }));

            // Locales
            const locales = (results[9] || []).map(locale => ({ id: locale.locale, displayName: locale.name }));

            const userSettingsNoFallback = results[10];

            configOptionStore.setState({
                indicatorGroups,
                dataElementGroups,
                userGroups,
                organisationUnitLevels,
                userRoles,
                organisationUnits,
                startModules,
                flags,
                styles,
                locales,
                userSettingsNoFallback,
            });
            log.debug('Got settings options:', configOptionStore.getState());

            // Load current system settings and configuration
            settingsActions.load();
        });
    }, (err) => {
        log.error('Failed to initialize D2:', JSON.stringify(err));
        document.write(`D2 initialization error: ${err}`);
    });
