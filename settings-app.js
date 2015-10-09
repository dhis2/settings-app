import React from 'react/addons';
import log from 'loglevel';

import {init, config, getUserSettings, getManifest} from 'd2/src/d2';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import settingsActions from './settingsActions';
import settingsStore from './settingsStore';
import configOptionStore from './configOptionStore';

import {categoryOrder, categories} from './settingsCategories';

// Material UI

// const ThemeManager = require('material-ui/lib/styles/theme-manager');
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import ColorTheme from './theme';
// import AppBar from 'material-ui/lib/app-bar';
import TextField from 'material-ui/lib/text-field';
// import RaisedButton from 'material-ui/lib/raised-button';
import SelectField from 'material-ui/lib/select-field';
import Checkbox from 'material-ui/lib/checkbox';
import Snackbar from 'material-ui/lib/snackbar';

// Custom Components

import Sidebar from './Sidebar.component';
// import SettingsTable from './SettingsTable.component';

// D2 UI

import Form from 'd2-ui/src/forms/Form.component';

// Styles

require('./scss/settings-app.scss');


log.setLevel(log.levels.TRACE);

let currentCategory = '';

const MuiThemeMixin = {
    childContextTypes: {
        muiTheme: React.PropTypes.object,
    },

    getChildContext() {
        return {
            muiTheme: ThemeManager.getMuiTheme(ColorTheme),
        };
    },
};

const HackyTextField = React.createClass({
    mixins: [MuiThemeMixin],

    onBlur(e) {
    },

    render() {
        return (
            <TextField {...this.props}/>
        );
    },
});

const HackyDropDown = React.createClass({
    propTypes: {
        defaultValue: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number,
            React.PropTypes.bool,
        ]),
    },

    mixins: [MuiThemeMixin],

    getInitialState() {
        return {value: this.props.defaultValue === null ? 'null' : this.props.defaultValue};
    },

    render() {
        return (
            <SelectField
                value={this.state.value.toString()}
                {...this.props}/>
        );
    },
});

const HackyCheckbox = React.createClass({
    propTypes: {
        onChange: React.PropTypes.func.isRequired,
    },

    mixins: [MuiThemeMixin],

    render() {
        return (
            <Checkbox onCheck={this.props.onChange} {...this.props}/>
        );
    },
});

const App = React.createClass({
    propTypes: {
        categories: React.PropTypes.object.isRequired,
        categoryOrder: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        settingsStore: React.PropTypes.object.isRequired,
        configOptionStore: React.PropTypes.object.isRequired,
        settingsActions: React.PropTypes.object.isRequired,
        currentCategory: React.PropTypes.string.isRequired,
        d2: React.PropTypes.object.isRequired,
    },

    mixins: [MuiThemeMixin],

    childContextTypes: {
        d2: React.PropTypes.object,
    },

    render() {
        const d2 = this.props.d2;
        const currentSettings = categories[currentCategory].settings;
        const fieldConfigs = currentSettings.map(settingsKey => {
            const mapping = d2.system.settings.mapping[settingsKey];
            const defaultValue = settingsStore.state ? settingsStore.state[settingsKey] : '';
            const fieldConfig = {
                name: settingsKey,
            };

            switch (mapping.type) {
            case 'dropdown':
                fieldConfig.type = HackyDropDown;
                fieldConfig.fieldOptions = {
                    floatingLabelText: d2.i18n.getTranslation(mapping.label),
                    defaultValue: defaultValue,
                    menuItems: Object.keys(mapping.options || {}).map(value => {
                        const label = mapping.options[value];
                        return {
                            payload: value,
                            text: isNaN(label) ? d2.i18n.getTranslation(mapping.options[value]) : label,
                        };
                    }),
                };
                break;

            case 'checkbox':
                fieldConfig.type = HackyCheckbox;
                fieldConfig.fieldOptions = {
                    label: d2.i18n.getTranslation(mapping.label),
                    defaultChecked: defaultValue === 'true',
                    onCheck: (e, v) => {
                        this.props.settingsActions.saveKey(settingsKey, v ? 'true' : 'false');
                    },
                };
                break;

            case 'indicatorGroups':
            case 'dataElementGroups':
            case 'userGroups':
            case 'organisationUnitLevels':
            case 'userRoles':
            case 'organisationUnits':
                fieldConfig.type = HackyDropDown;
                const opts = this.props.configOptionStore;
                fieldConfig.fieldOptions = {
                    floatingLabelText: d2.i18n.getTranslation(mapping.label),
                    defaultValue: defaultValue,
                    menuItems: opts.state ? opts.state[mapping.type] : [],
                };
                d2.system.configuration.get(settingsKey).then(value => {
                    fieldConfig.fieldOptions.defaultValue = value === null ? 'null' : value.id;
                });
                break;

            case 'editlist':
                fieldConfig.type = HackyTextField;
                fieldConfig.fieldOptions = {
                    floatingLabelText: d2.i18n.getTranslation(mapping.label),
                    multiLine: true,
                };
                fieldConfig.updateEvent = 'onBlur';
                break;

            case 'password':
                fieldConfig.type = HackyTextField;
                fieldConfig.fieldOptions = {
                    floatingLabelText: d2.i18n.getTranslation(mapping.label),
                    type: 'password',
                };
                fieldConfig.updateEvent = 'onBlur';
                break;

            default:
                fieldConfig.type = HackyTextField;
                fieldConfig.updateEvent = 'onBlur';
                fieldConfig.fieldOptions = {
                    floatingLabelText: d2.i18n.getTranslation(mapping.label),
                    defaultValue: defaultValue,
                    multiLine: mapping.multiLine && mapping.multiLine === true,
                };
            }
            fieldConfig.fieldOptions.style = {width: '100%', minWidth: 350, maxWidth: 500};
            return fieldConfig;
        });
        const out = (
            <div className="app">
                <Snackbar
                    message={d2.i18n.getTranslation('settings_updated')}
                    autoHideDuration={1250}
                    ref={(ref) => {this.snackOut(ref);}}
                    />
                {/* <AppBar title={d2.i18n.getTranslation('system_settings')}/> */}
                <Sidebar
                    d2={d2}
                    categoryOrder={this.props.categoryOrder}
                    categories={this.props.categories}
                    currentCategory={this.props.currentCategory}
                    settingsActions={this.props.settingsActions}
                    />

                <div className="content-area">
                    <h1>{d2.i18n.getTranslation(this.props.categories[this.props.currentCategory].label)}</h1>

                    <Form source={this.props.settingsStore.state || {}} fieldConfigs={fieldConfigs} onFormFieldUpdate={this.props.settingsActions.saveKey} />
                </div>
            </div>
        );
        return out;
    },

    snackOut(ref) {
        this._snackbar = ref;
        window.snackbar = this._snackbar;
    },
});

function configI18n({uiLocale}) {
    if (uiLocale !== 'en') {
        config.i18n.sources.add(`i18n/module/i18n_module_${uiLocale}.properties`);
    }
    config.i18n.sources.add('i18n/module/i18n_module_en.properties');
}

getManifest(`./manifest.webapp`)
    .then(manifest => {
        config.baseUrl = manifest.getBaseUrl();
        config.baseUrl = 'http://localhost:8080/api';
    })
    .then(getUserSettings)
    .then(configI18n)
    .then(init)
    .then(d2 => {
        function renderApp() {
            React.render(<App
                d2={d2}
                settingsStore={settingsStore}
                configOptionStore={configOptionStore}
                settingsActions={settingsActions}
                categoryOrder={categoryOrder}
                categories={categories}
                currentCategory={currentCategory}
                />, document.getElementById('app'));
        }

        // settingsActions.load handler
        settingsActions.load.subscribe((args) => {
            Promise.all([
                d2.system.settings.all(),
                d2.system.configuration.all(args.data === true),
            ]).then(results => {
                const cfg = Object.keys(results[1])
                    .filter(key => { return key !== 'systemId'; })
                    .map(key => { return { key: key, value: results[1][key] ? results[1][key].id : 'null' }; })
                    .reduce((prev, curr) => {
                        prev[curr.key] = curr.value;
                        return prev;
                    }, {});
                cfg.corsWhitelist = results[1].corsWhitelist.filter(v => v.trim().length > 0).sort().join('\n');
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
                log.error(error);
            });
        });

        // settingsActions.setCategory handler
        settingsActions.setCategory.subscribe((category) => {
            currentCategory = category.data;
            renderApp();
        });

        // settingsActions.saveKey handler
        settingsActions.saveKey.subscribe((args) => {
            const [fieldName, value] = args.data;
            const settingsKeyMapping = d2.system.settings.mapping[fieldName];
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
            settingsStore.state[fieldName] = value;
            renderApp();
        });

        // App init
        log.info('D2 initialized', d2);

        log.info('Can settings:', d2.currentUser.authorities.has('F_SYSTEM_SETTING'), 'Can Oauth:', d2.currentUser.authorities.has('F_OAUTH2_CLIENT_MANAGE'));
        // Load translations
        d2.i18n.addStrings(d2.system.getI18nStrings());
        d2.i18n.addStrings(['access_denied', 'settings_updated']);
        d2.i18n.load().then(() => {
            if (!d2.currentUser.authorities.has('F_SYSTEM_SETTING')) {
                document.write(d2.i18n.getTranslation('access_denied'));
                return;
            }

            settingsActions.load();
            settingsActions.setCategory(categoryOrder[0]);

            Promise.all([
                d2.models.indicatorGroup.list({paging: false, fields: 'id,displayName', order: 'displayName:asc'}),
                d2.models.dataElementGroup.list({paging: false, fields: 'id,displayName', order: 'displayName:asc'}),
                d2.models.userGroup.list({paging: false, fields: 'id,displayName', order: 'displayName:asc'}),
                d2.models.organisationUnitLevel.list({paging: false, fields: 'id,level,displayName', order: 'level:asc'}),
                d2.models.userRole.list({paging: false, fields: 'id,displayName', order: 'displayName:asc'}),
                d2.models.organisationUnit.list({paging: false, fields: 'id,displayName', filter: ['level:in:[1,2]']}),
            ]).then(results => {
                function optionalize(collection) {
                    return collection.toArray().map((item) => {
                        return {
                            payload: item.id,
                            text: item.displayName,
                        };
                    });
                }

                const indicatorGroups = optionalize(results[0]);
                const dataElementGroups = optionalize(results[1]);
                const userGroups = optionalize(results[2]);
                userGroups.unshift({
                    payload: 'null',
                    text: d2.i18n.getTranslation('no_feedback_recipients'),
                });
                const organisationUnitLevels = results[3].toArray().map(item => {
                    return {
                        payload: item.id,
                        text: item.level + ': ' + item.displayName,
                    };
                });
                const userRoles = optionalize(results[4]);
                const organisationUnits = optionalize(results[5]);

                configOptionStore.setState({
                    indicatorGroups: indicatorGroups,
                    dataElementGroups: dataElementGroups,
                    userGroups: userGroups,
                    organisationUnitLevels: organisationUnitLevels,
                    userRoles: userRoles,
                    organisationUnits: organisationUnits,
                });
                renderApp();
            });
        });
    }, () => {
        document.write('Failed to initialize D2.');
    });
