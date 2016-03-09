import Action from 'd2-ui/lib/action/Action';
import { categories } from './settingsCategories';
import { getInstance as getD2 } from 'd2/lib/d2';
import { Observable } from 'rx';
import log from 'loglevel';

import settingsKeyMapping from './settingsKeyMapping';

const settingsActions = Action.createActionsFromNames([
    'load',
    'setCategory',
    'saveKey',
    'searchSettings',
    'showSnackbarMessage',
]);

const settingsSearchMap = Observable.fromPromise(new Promise((resolve, reject) => {
    settingsActions.load.subscribe(() => {
        getD2()
            .then(d2 => Object.keys(categories)
                    .filter(categoryKey => !categories[categoryKey].authority ||
                        d2.currentUser.authorities.has(categories[categoryKey].authority))
                    .map(categoryKey => categories[categoryKey].settings)
                    .reduce((searchArray, categoryKeys) => searchArray.concat(categoryKeys), [])
                    .reduce((translatedKeyValueMap, settingsKey) => {
                        if (!settingsKeyMapping[settingsKey]) {
                            log.warn('No mapping found for', settingsKey);
                            return translatedKeyValueMap;
                        }

                        return translatedKeyValueMap.concat([
                            [d2.i18n.getTranslation(settingsKeyMapping[settingsKey].label), settingsKey],
                        ]);
                    }, [])
            )
            .then(searchMapping => resolve(searchMapping))
            .catch(error => reject(error));
    }, error => reject(error));
}));

function getSearchResultsFor(searchValue) {
    return settingsSearchMap
        .flatMap(val => Observable.fromArray(val))
        .filter(keyValue => RegExp(searchValue.toLowerCase()).test(keyValue[0].toLowerCase()))
        .map(([, value]) => value)
        .reduce((acc, value) => acc.concat(value), []);
}

settingsActions.searchSettings
    .distinctUntilChanged()
    .debounce(150)
    .map(action => action.data)
    .map(searchValue => searchValue.toLowerCase().trim())
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
