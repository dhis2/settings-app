import React from 'react';
import ReactDOM from 'react-dom';

import Action from 'd2-ui/lib/action/Action';
import { getInstance as getD2 } from 'd2/lib/d2';
import { Observable } from 'rxjs';
import log from 'loglevel';

import App from './app.component';
import { categories } from './settingsCategories';
import settingsKeyMapping from './settingsKeyMapping';
import settingsStore from './settingsStore';

const settingsActions = Action.createActionsFromNames([
    'load',
    'setCategory',
    'saveKey',
    'searchSettings',
    'showSnackbarMessage',
]);

const saveLocalizedAppearanceSetting = (d2, key, value, locale) => {
    const api = d2.Api.getApi();
    const localeSuffix = locale ? `&locale=${locale}` : '';
    const url = `/systemSettings/${key}?value=${value}${localeSuffix}`;

    return api.post(url)
        .then(() => {
            settingsActions.showSnackbarMessage(d2.i18n.getTranslation('settings_updated'));
        })
        .catch((err) => {
            log.warn('Failed to save localized setting:', err);
        });
}

const saveConfiguration = (d2, key, value) => d2.system.configuration.set(key, value)
    .then(() => {
        settingsActions.showSnackbarMessage(d2.i18n.getTranslation('settings_updated'));
    })
    .catch((err) => {
        log.warn('Failed to save configuration:', err);
    });

const saveSetting = (d2, key, value) => d2.system.settings.set(key, value)
    .then(() => {
        settingsActions.showSnackbarMessage(d2.i18n.getTranslation('settings_updated'));
    })
    .catch((err) => {
        log.warn('Failed to save setting:', err);
    });

// settingsActions.saveKey handler
settingsActions.saveKey.subscribe((args) => {
    const [key, value, locale] = args.data;
    const mapping = settingsKeyMapping[key];

    getD2().then((d2) => {
        if (mapping.appendLocale && locale) {
            saveLocalizedAppearanceSetting(d2, key, value, locale)
        }
        else if (mapping.configuration) {
            saveConfiguration(d2, key, value)
        } else {
            saveSetting(d2, key, value)
        }

        settingsStore.state[key] = value;
        settingsStore.setState(settingsStore.state);
    });
});

const settingsSearchMap = Observable.fromPromise(new Promise((resolve) => {
    settingsActions.load.subscribe((args) => {
        getD2().then((d2) => {
            // Get current settings and configuration
            Promise.all([
                d2.system.settings.all(),
                d2.system.configuration.all(args.data === true),
            ]).then((results) => {
                const cfg = Object.keys(results[1])
                    .filter(key => key !== 'systemId')
                    .map((key) => {
                        const value = results[1][key];
                        return { key, value };
                    })
                    .reduce((prev, curr) => {
                        let value = curr.value;
                        if (value === null || value === 'null' || value === undefined) {
                            value = 'null';
                        } else if (value.hasOwnProperty('id')) {
                            value = value.id;
                        }
                        prev[curr.key] = value; // eslint-disable-line no-param-reassign
                        return prev;
                    }, {});
                cfg.corsWhitelist = (results[1].corsWhitelist || []).filter(v => v.trim().length > 0).sort().join('\n');
                // Stupid fix for the fact that old controllers will save numbers as numbers,
                // even though the API only allows string values, which creates a silly mismatch!
                Object.keys(results[0]).forEach((key) => {
                    const v = results[0][key];
                    results[0][key] = v !== null && !isNaN(v) ? v.toString() : v; // eslint-disable-line no-param-reassign
                });
                settingsStore.setState(Object.assign({}, results[0], cfg));
                log.debug('System settings loaded successfully.', settingsStore.state);
                ReactDOM.render(<App d2={d2} />, document.getElementById('app'));
            }, (error) => {
                log.warn('Failed to load system settings:', error);
            });

            // Build the search index
            const searchMapping = Object.keys(categories)
                .filter(categoryKey => (
                    !categories[categoryKey].authority ||
                    d2.currentUser.authorities.has(categories[categoryKey].authority)
                ))
                .map(categoryKey => categories[categoryKey].settings)
                .reduce((searchArray, categoryKeys) => searchArray.concat(categoryKeys), [])
                .reduce((translatedKeyValueMap, settingsKey) => {
                    if (!settingsKeyMapping[settingsKey]) {
                        log.warn('No mapping found for', settingsKey);
                        return translatedKeyValueMap;
                    }

                    if (settingsKeyMapping[settingsKey].searchLabels) {
                        settingsKeyMapping[settingsKey].searchLabels.forEach((label) => {
                            if (!d2.i18n.isTranslated(label)) {
                                log.warn(`No translation found for ${label} under ${settingsKey}`);
                            }
                        });

                        return translatedKeyValueMap.concat(
                            settingsKeyMapping[settingsKey].searchLabels
                                .filter(label => d2.i18n.isTranslated(label))
                                .map(label => [d2.i18n.getTranslation(label), settingsKey]),
                        );
                    }

                    return translatedKeyValueMap.concat([
                        [d2.i18n.getTranslation(settingsKeyMapping[settingsKey].label), settingsKey],
                    ]);
                }, []);

            resolve(searchMapping);
        });
    });
}));

function getSearchResultsFor(searchTerms) {
    return settingsSearchMap
        .flatMap(val => Observable.from(val))
        .filter(keyValue => searchTerms.every(term => keyValue[0].toLowerCase().includes(term.toLowerCase())))
        .map(([, value]) => value)
        .distinct()
        .reduce((acc, value) => acc.concat(value), [])
        .map((results) => {
            if (searchTerms.length === 1 && settingsKeyMapping.hasOwnProperty(searchTerms[0])) {
                results.push(searchTerms[0]);
            }
            return results;
        });
}

let searchTerms;
settingsActions.searchSettings
    .distinctUntilChanged()
    .debounceTime(150)
    .map(action => action.data.trim().split(/\s+/).filter(t => t.length > 0))
    .do((searchValue) => {
        searchTerms = searchValue;
        if (searchValue.length === 0) {
            settingsActions.setCategory('general');
        }
    })
    .filter(searchValue => searchValue.length)
    .map(searchValue => getSearchResultsFor(searchValue))
    .concatAll()
    .subscribe((searchResultSettings) => {
        settingsActions.setCategory({ key: 'search', settings: searchResultSettings, searchTerms });
    });

export default settingsActions;
