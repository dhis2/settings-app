const dhisDevConfig = DHIS_CONFIG;

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import log from 'loglevel';

import { init, config, getUserSettings, getManifest } from 'd2/lib/d2';
import getBaseUrlFromD2ApiUrl from 'd2-ui/lib/app-header/getBaseUrlFromD2ApiUrl';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import settingsActions from './settingsActions';
import configOptionStore from './configOptionStore';
import settingsKeyMapping from './settingsKeyMapping';

// D2 UI
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

// Styles
require('../scss/settings-app.scss');

log.setLevel(process.env.NODE_ENV === 'production' ? log.levels.INFO : log.levels.TRACE);

function configI18n(userSettings) {
    // Sources
    const uiLocale = userSettings.keyUiLocale;

    if (uiLocale !== 'en') {
        config.i18n.sources.add(`i18n/module/i18n_module_${uiLocale}.properties`);
    }
    config.i18n.sources.add('i18n/module/i18n_module_en.properties');

    // Strings
    Object.keys(settingsKeyMapping).forEach(key => {
        const val = settingsKeyMapping[key];

        if (val.hasOwnProperty('label')) {
            config.i18n.strings.add(val.label);
        }

        if (val.hasOwnProperty('description')) {
            config.i18n.strings.add(val.description);
        }

        if (val.hasOwnProperty('options')) {
            for (const opt in val.options) {
                if (val.options.hasOwnProperty(opt) && isNaN(val.options[opt])) {
                    config.i18n.strings.add(val.options[opt]);
                }
            }
        }
    });
    config.i18n.strings.add('access_denied');
    config.i18n.strings.add('settings_updated');
    config.i18n.strings.add('save');
    config.i18n.strings.add('delete');
    config.i18n.strings.add('level');
    config.i18n.strings.add('category_option_group_set');
    config.i18n.strings.add('yes');
    config.i18n.strings.add('no');
    config.i18n.strings.add('edit');
}

ReactDOM.render(<LoadingMask />, document.getElementById('app'));


getManifest('manifest.webapp')
    .then(manifest => {
        const baseUrl = process.env.NODE_ENV === 'production' ? manifest.getBaseUrl() : dhisDevConfig.baseUrl;
        config.baseUrl = `${baseUrl}/api/25`;
        log.info(`Loading: ${manifest.name} v${manifest.version}`);
        log.info(`Built ${manifest.manifest_generated_at}`);
    })
    .then(getUserSettings)
    .then(configI18n)
    .then(init)
    .then(d2 => {
        // App init
        log.debug('D2 initialized', d2);

        if (!d2.currentUser.authorities.has('F_SYSTEM_SETTING')) {
            document.write(d2.i18n.getTranslation('access_denied'));
            return;
        }

        // Load current system settings and configuration
        settingsActions.load();

        // Load alternatives
        const api = d2.Api.getApi();
        const baseUrl = getBaseUrlFromD2ApiUrl(d2);
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
        ]).then(results => {
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
            flags.unshift({ id: 'dhis2', displayName: d2.i18n.getTranslation('no_flag') });

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
        });
    }, (err) => {
        log.error('Failed to initialize D2:', JSON.stringify(err));
        document.write(`D2 initialization error: ${err}`);
    });
