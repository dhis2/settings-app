import React from 'react/addons';
import log from 'loglevel';

import {init, config, getUserSettings, getManifest} from 'd2/lib/d2';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import settingsActions from './settingsActions';
import settingsStore from './settingsStore';
import configOptionStore from './configOptionStore';

import {categoryOrder, categories} from './settingsCategories';

// Material UI
import AppTheme from './theme';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import Checkbox from 'material-ui/lib/checkbox';
import Snackbar from 'material-ui/lib/snackbar';
import FlatButton from 'material-ui/lib/flat-button';

// Custom Components
import Sidebar from './Sidebar.component';
import Oauth2ClientEditor from './oauth2-client-editor/OAuth2ClientEditor.component';
// import SettingsTable from './SettingsTable.component';

// D2 UI
import Form from 'd2-ui/lib/forms/Form.component';
import HeaderBar from 'd2-ui/lib/header-bar/HeaderBar.component';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

// Settings specific FormFields
import DataApprovalLevels from './data-approval-levels/DataApprovalLevels.component';

// Styles

require('./scss/settings-app.scss');

/* eslint react/no-multi-comp: 0 */
log.setLevel(log.levels.TRACE);

const MuiThemeMixin = {
    childContextTypes: {
        muiTheme: React.PropTypes.object,
    },

    getChildContext() {
        return {
            muiTheme: AppTheme,
        };
    },
};

const HackyTextField = React.createClass({
    mixins: [MuiThemeMixin],

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
        return {value: this.props.defaultValue ? this.props.defaultValue : 'null'};
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
        d2: React.PropTypes.object.isRequired,
    },

    mixins: [MuiThemeMixin],

    childContextTypes: {
        d2: React.PropTypes.object,
    },

    getChildContext() {
        return {
            d2: this.props.d2,
        };
    },

    getInitialState() {
        return {
            category: categoryOrder[0],
            currentSettings: categories[categoryOrder[0]].settings,
        };
    },

    componentWillMount() {
        this.props.settingsStore.subscribe(() => {
            this.forceUpdate();
        });
        this.props.configOptionStore.subscribe(() => {
            this.forceUpdate();
        });
        this.props.settingsActions.setCategory.subscribe((arg) => {
            const category = arg.data;
            this.setState({
                category: category,
                currentSettings: category.searchResult ? category.settings : categories[category].settings,
            });
        });
    },

    render() {
        const d2 = this.props.d2;
        const theme = AppTheme;
        const currentSettings = this.state.currentSettings;
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
                    value: defaultValue,
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
                    checked: defaultValue === 'true',
                    onCheck: (e, v) => {
                        this.props.settingsActions.saveKey(settingsKey, v ? 'true' : 'false');
                    },
                };
                break;

            case 'post_button':
                fieldConfig.type = FlatButton;
                fieldConfig.fieldOptions = {
                    label: d2.i18n.getTranslation(mapping.label),
                    onClick: () => {
                        d2.Api.getApi().post(mapping.uri).then(result => {
                            // TODO: Show a useful snackbar
                            log.info(result.message);
                            window.snackbar.show();
                        });
                    },
                    secondary: true,
                    style: {minWidth: 'initial', maxWidth: 'initial', float: 'right', marginTop: '1em'},
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
                    value: defaultValue || 'null',
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

            case 'dataapproval':
                fieldConfig.type = DataApprovalLevels;
                fieldConfig.fieldOptions = {
                    columns: ['level', 'name', 'categoryOptionGroupSet'],
                };
                break;

            case 'oauth2clients':
                fieldConfig.type = Oauth2ClientEditor;
                fieldConfig.fieldOptions = {d2};
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
            if (fieldConfig.fieldOptions && fieldConfig.fieldOptions.style) {
                fieldConfig.fieldOptions.style = Object.assign({}, theme.forms, fieldConfig.fieldOptions.style);
            } else {
                fieldConfig.fieldOptions.style = {
                    width: '100%',
                    minWidth: theme.forms.minWidth,
                    maxWidth: theme.forms.maxWidth,
                };
            }
            return fieldConfig;
        });
        const out = (
            <div className="app">
                <HeaderBar />
                <Snackbar
                    message={d2.i18n.getTranslation('settings_updated')}
                    autoHideDuration={1250}
                    ref={(ref) => {this._uglySnackbarRefExportFn(ref);}}
                    />
                <Sidebar
                    d2={d2}
                    categoryOrder={this.props.categoryOrder}
                    categories={this.props.categories}
                    currentCategory={this.state.category}
                    settingsActions={this.props.settingsActions}
                    />

                <div className="content-area" style={theme.forms}>
                    <h1>{this.props.categories[this.state.category] ? d2.i18n.getTranslation(this.props.categories[this.state.category].label) : 'Search result'}</h1>
                    {!this.state.currentSettings.length ? <div>{d2.i18n.getTranslation('no_settings_found_that_match')}</div> : null}
                    <Form source={this.props.settingsStore.state || {}} fieldConfigs={fieldConfigs}
                          onFormFieldUpdate={this._saveSetting}/>
                </div>
            </div>
        );
        return out;
    },

    _uglySnackbarRefExportFn(ref) {
        this._snackbar = ref;
        window.snackbar = this._snackbar;
    },

    _saveSetting(key, value) {
        this.props.settingsActions.saveKey(key, value);
    },
});

function configI18n({uiLocale}) {
    if (uiLocale !== 'en') {
        config.i18n.sources.add('i18n/module/i18n_module_' + uiLocale + '.properties');
    }
    config.i18n.sources.add('i18n/module/i18n_module_en.properties');
}

React.render(<LoadingMask />, document.getElementById('app'));

getManifest('manifest.webapp')
    .then(manifest => {
        config.baseUrl = manifest.getBaseUrl() + '/api';
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
            const newState = settingsStore.state;
            newState[fieldName] = value;
            settingsStore.setState(newState);
        });

        // App init
        log.info('D2 initialized', d2);

        log.info('Can settings:', d2.currentUser.authorities.has('F_SYSTEM_SETTING'), 'Can Oauth:', d2.currentUser.authorities.has('F_OAUTH2_CLIENT_MANAGE'));
        // Load translations
        d2.i18n.addStrings(d2.system.getI18nStrings());
        d2.i18n.addStrings(['access_denied', 'settings_updated', 'save', 'delete', 'level', 'category_option_group_set', 'search', 'yes', 'no', 'edit']);
        d2.i18n.load().then(() => {
            if (!d2.currentUser.authorities.has('F_SYSTEM_SETTING')) {
                document.write(d2.i18n.getTranslation('access_denied'));
                return;
            }

            settingsActions.load();
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
            });
        });
    }, (err) => {
        log.error('Failed to initialize D2:', err);
        document.write('Failed to initialize D2.');
    });
