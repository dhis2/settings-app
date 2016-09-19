import React from 'react';
import ReactDOM from 'react-dom';
import App from './app.component';

import Action from 'd2-ui/lib/action/Action';
import { categories } from './settingsCategories';
import { getInstance as getD2 } from 'd2/lib/d2';
import { Observable } from 'rx';
import log from 'loglevel';

import settingsKeyMapping from './settingsKeyMapping';
import settingsStore from './settingsStore';

const settingsActions = Action.createActionsFromNames([
    'load',
    'setCategory',
    'saveKey',
    'searchSettings',
    'showSnackbarMessage',
]);

// settingsActions.saveKey handler
settingsActions.saveKey.subscribe((args) => {
    const [fieldData, value] = args.data;
    const key = Array.isArray(fieldData) ? fieldData.join('') : fieldData;
    const mappingKey = Array.isArray(fieldData) ? fieldData[0] : fieldData;
    const mapping = settingsKeyMapping[mappingKey];

    getD2().then(d2 => {
        if (mapping.configuration) {
            d2.system.configuration.set(key, value)
                .then(() => {
                    settingsActions.showSnackbarMessage(d2.i18n.getTranslation('settings_updated'));
                })
                .catch((err) => {
                    log.warn('Failed to save configuration:', err);
                });
        } else {
            d2.system.settings.set(key, value)
                .then(() => {
                    settingsActions.showSnackbarMessage(d2.i18n.getTranslation('settings_updated'));
                })
                .catch((err) => {
                    log.warn('Failed to save setting:', err);
                });
        }

        settingsStore.state[key] = value;
        settingsStore.setState(settingsStore.state);
    });
});

const settingsSearchMap = Observable.fromPromise(new Promise((resolve) => {
    settingsActions.load.subscribe((args) => {
        getD2().then(d2 => {
            // Get current settings and configuration
            Promise.all([
                d2.system.settings.all(),
                d2.system.configuration.all(args.data === true),
            ]).then(results => {
                const cfg = Object.keys(results[1])
                    .filter(key => key !== 'systemId')
                    .map(key => {
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
                Object.keys(results[0]).forEach(key => {
                    const v = results[0][key];
                    results[0][key] = v !== null && !isNaN(v) ? v.toString() : v; // eslint-disable-line no-param-reassign
                });
                settingsStore.setState(Object.assign({}, results[0], cfg));
                log.debug('System settings loaded successfully.', settingsStore.state);
                ReactDOM.render(<App d2={d2} />, document.getElementById('app'));
            }, error => {
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
                        settingsKeyMapping[settingsKey].searchLabels.forEach(label => {
                            if (!d2.i18n.isTranslated(label)) {
                                log.warn(`No translation found for ${label} under ${settingsKey}`);
                            }
                        });

                        return translatedKeyValueMap.concat(
                            settingsKeyMapping[settingsKey].searchLabels
                                .filter(label => d2.i18n.isTranslated(label))
                                .map(label => [d2.i18n.getTranslation(label), settingsKey])
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

function getSearchResultsFor(searchValue) {
    return settingsSearchMap
        .flatMap(val => Observable.fromArray(val))
        .filter(keyValue => RegExp(searchValue.toLowerCase()).test(keyValue[0].toLowerCase()))
        .map(([, value]) => value)
        .distinct()
        .reduce((acc, value) => acc.concat(value), [])
        .map(results => {
            if (settingsKeyMapping.hasOwnProperty(searchValue)) {
                results.push(searchValue);
            }
            return results;
        });
}

settingsActions.searchSettings
    .distinctUntilChanged()
    .debounce(150)
    .map(action => action.data)
    .map(searchValue => searchValue.trim())
    .tap(searchValue => {
        if (!searchValue) {
            settingsActions.setCategory('general');
        }
    })
    .filter(searchValue => searchValue)
    .map(searchValue => getSearchResultsFor(searchValue))
    .concatAll()
    .subscribe((searchResultSettings) => {
        settingsActions.setCategory({ key: 'search', settings: searchResultSettings });
    });

export default settingsActions;
