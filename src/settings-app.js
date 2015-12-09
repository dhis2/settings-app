if (process.env.NODE_ENV !== 'production') {
    require('../dev-jquery-auth.js');
}

import React from 'react';
import ReactDOM from 'react-dom';
import log from 'loglevel';

import {init, config, getUserSettings, getManifest} from 'd2/lib/d2';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import settingsActions from './settingsActions';
import settingsStore from './settingsStore';
import configOptionStore from './configOptionStore';

import {categoryOrder, categories} from './settingsCategories';

// D2 UI
import {wordToValidatorMap} from 'd2-ui/lib/forms/Validators';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

import App from './app.component.js';

// Styles
require('../scss/settings-app.scss');

log.setLevel(log.levels.TRACE);

function getValidatorFunctions(settingsMapping) {
    return (settingsMapping.validators || [])
        .filter(validatorName => wordToValidatorMap.has(validatorName))
        .map(validatorName => wordToValidatorMap.get(validatorName));
}

function configI18n({uiLocale}) {
    if (uiLocale !== 'en') {
        config.i18n.sources.add('i18n/module/i18n_module_' + uiLocale + '.properties');
    }
    config.i18n.sources.add('i18n/module/i18n_module_en.properties');
}

ReactDOM.render(<LoadingMask />, document.getElementById('app'));

getManifest(process.env.NODE_ENV === 'production' ? 'manifest.webapp' : 'dev_manifest.webapp')
    .then(manifest => {
        config.baseUrl = manifest.getBaseUrl() + '/api';
    })
    .then(getUserSettings)
    .then(configI18n)
    .then(init)
    .then(d2 => {
        function renderApp() {
            ReactDOM.render(<App
                d2={d2}
                settingsStore={settingsStore}
                configOptionStore={configOptionStore}
                settingsActions={settingsActions}
                categoryOrder={categoryOrder}
                categories={categories}
            />, document.getElementById('app'));
        }

        // settingsActions.load handler
        settingsActions.load.subscribe((args) => {
            Promise.all([
                d2.system.settings.all(),
                d2.system.configuration.all(args.data === true),
            ]).then(results => {
                const cfg = Object.keys(results[1])
                    .filter(key => {
                        return key !== 'systemId';
                    })
                    .map(key => {
                        return {key: key, value: results[1][key]};
                    })
                    .reduce((prev, curr) => {
                        let value = curr.value;
                        if (value === null || value === 'null' || value === undefined) {
                            value = 'null';
                        } else if (value.hasOwnProperty('id')) {
                            value = value.id;
                        }
                        prev[curr.key] = value;
                        return prev;
                    }, {});
                cfg.corsWhitelist = (results[1].corsWhitelist || []).filter(v => v.trim().length > 0).sort().join('\n');
                // Stupid fix for the fact that old controllers will save numbers as numbers,
                // even though the API only allows string values, which creates a silly mismatch!
                Object.keys(results[0]).map(key => {
                    const v = results[0][key];
                    results[0][key] = v !== null && !isNaN(v) ? v.toString() : v;
                });
                settingsStore.setState(Object.assign({}, results[0], cfg));
                log.info('System settings loaded successfully.', settingsStore.state);
                renderApp();
            }, error => {
                log.error('Failed to load system settings:', error);
            });
        });

        // settingsActions.saveKey handler
        settingsActions.saveKey.subscribe((args) => {
            const [fieldName, value] = args.data;
            const settingsKeyMapping = d2.system.settings.mapping[fieldName];

            if (getValidatorFunctions(d2.system.settings.mapping[fieldName]).every(validatorFn => validatorFn(value) === true)) {
                if (settingsKeyMapping.configuration) {
                    d2.system.configuration.set(fieldName, value)
                        .then(() => {
                            window.snackbar && window.snackbar.show();
                        })
                        .catch((err) => {
                            log.error('Failed to save configuration:', err);
                        });
                } else {
                    d2.system.settings.set(fieldName, value)
                        .then(() => {
                            window.snackbar && window.snackbar.show();
                        })
                        .catch((err) => {
                            log.error('Failed to save setting:', err);
                        });
                }
            }

            const newState = settingsStore.state;
            newState[fieldName] = value;
            settingsStore.setState(newState);
        });

        // App init
        log.info('D2 initialized', d2);

        // Load translations
        d2.i18n.addStrings(d2.system.getI18nStrings());
        d2.i18n.addStrings(['access_denied', 'settings_updated', 'save', 'delete', 'level', 'category_option_group_set', 'search', 'yes', 'no', 'edit']);
        d2.i18n.load().then(() => {
            if (!d2.currentUser.authorities.has('F_SYSTEM_SETTING')) {
                document.write(d2.i18n.getTranslation('access_denied'));
                return;
            }

            settingsActions.load();
            // Load alternatives
            Promise.all([
                d2.models.indicatorGroup.list({paging: false, fields: 'id,displayName', order: 'displayName:asc'}),
                d2.models.dataElementGroup.list({paging: false, fields: 'id,displayName', order: 'displayName:asc'}),
                d2.models.userGroup.list({paging: false, fields: 'id,displayName', order: 'displayName:asc'}),
                d2.models.organisationUnitLevel.list({
                    paging: false,
                    fields: 'id,level,displayName',
                    order: 'level:asc',
                }),
                d2.models.userRole.list({paging: false, fields: 'id,displayName', order: 'displayName:asc'}),
                d2.models.organisationUnit.list({paging: false, fields: 'id,displayName', filter: ['level:in:[1,2]']}),
                d2.Api.getApi().get('../dhis-web-commons/menu/getModules.action'),
                d2.Api.getApi().get('system/flags'),
                d2.Api.getApi().get('system/styles'),
            ]).then(results => {
                function collectionToOptionArray(collection) {
                    return collection.toArray().map((item) => {
                        return {
                            payload: item.id,
                            text: item.displayName,
                        };
                    });
                }

                const indicatorGroups = collectionToOptionArray(results[0]);
                const dataElementGroups = collectionToOptionArray(results[1]);
                const userGroups = collectionToOptionArray(results[2]);
                userGroups.unshift({payload: 'null', text: d2.i18n.getTranslation('no_feedback_recipients')});
                const organisationUnitLevels = collectionToOptionArray(results[3]);
                const userRoles = collectionToOptionArray(results[4]);
                const organisationUnits = collectionToOptionArray(results[5]);

                const startModules = (results[6].modules || []).map(module => {
                    return {
                        payload: module.name,
                        text: module.displayName || module.name,
                    };
                });

                const flags = (results[7] || []).map(flagName => {
                    return {
                        payload: flagName.key,
                        text: flagName.name,
                    };
                });

                const styles = (results[8] || []).map(styleName => {
                    return {
                        payload: styleName.path,
                        text: styleName.name,
                    };
                });

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
                });
            });
        });
    }, (err) => {
        log.error('Failed to initialize D2:', JSON.stringify(err));
        document.write('D2 initialization error: ' + err);
    });
