const dhisDevConfig = DHIS_CONFIG;
if (process.env.NODE_ENV !== 'production') {
    jQuery.ajaxSetup({ headers: { Authorization: dhisDevConfig.authorization } });
}

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import log from 'loglevel';

import { init, config, getUserSettings, getManifest } from 'd2/lib/d2';

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
    const uiLocale = userSettings.keyUiLocale;

    if (uiLocale !== 'en') {
        config.i18n.sources.add(`i18n/module/i18n_module_${uiLocale}.properties`);
    }
    config.i18n.sources.add('i18n/module/i18n_module_en.properties');
}

ReactDOM.render(<LoadingMask />, document.getElementById('app'));


getManifest('manifest.webapp')
    .then(manifest => {
        const baseUrl = process.env.NODE_ENV === 'production' ? manifest.getBaseUrl() : dhisDevConfig.baseUrl;
        config.baseUrl = `${baseUrl}/api`;
        log.info(`Loading: ${manifest.name} v${manifest.version}`);
        log.info(`Built ${manifest.manifest_generated_at}`);
    })
    .then(getUserSettings)
    .then(configI18n)
    .then(init)
    .then(d2 => {
        // App init
        log.debug('D2 initialized', d2);

        // Load translations
        function getI18nStrings() {
            const strings = new Set();
            /* eslint-disable complexity */
            Object.keys(settingsKeyMapping).forEach(key => {
                const val = settingsKeyMapping[key];

                if (val.hasOwnProperty('label')) {
                    strings.add(val.label);
                }

                if (val.hasOwnProperty('description')) {
                    strings.add(val.description);
                }

                if (val.hasOwnProperty('options')) {
                    for (const opt in val.options) {
                        if (val.options.hasOwnProperty(opt) && isNaN(val.options[opt])) {
                            strings.add(val.options[opt]);
                        }
                    }
                }
            });
            /* eslint-enable complexity */

            return strings;
        }

        d2.i18n.addStrings(getI18nStrings());
        d2.i18n.addStrings([
            'access_denied',
            'settings_updated',
            'save',
            'delete',
            'level',
            'category_option_group_set',
            'search',
            'yes',
            'no',
            'edit',
            'app_search_placeholder',
            'manage_my_apps',
            'settings',
            'profile',
            'account',
            'help',
            'about_dhis2',
            'log_out',
            'no_results_found',
        ]);
        d2.i18n.load().then(() => {
            if (!d2.currentUser.authorities.has('F_SYSTEM_SETTING')) {
                document.write(d2.i18n.getTranslation('access_denied'));
                return;
            }

            settingsActions.load();

            // Load alternatives
            const api = d2.Api.getApi();
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
                api.get('../dhis-web-commons/menu/getModules.action'),
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

                d2.currentUser.userSettingsNoFallback = results[10]; // eslint-disable-line

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
                });
                log.debug('Got settings options:', configOptionStore.getState());
            });
        });
    }, (err) => {
        log.error('Failed to initialize D2:', JSON.stringify(err));
        document.write(`D2 initialization error: ${err}`);
    });
