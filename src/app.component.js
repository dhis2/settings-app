import React from 'react';
import log from 'loglevel';

// Material UI
import Snackbar from 'material-ui/lib/snackbar';
import RaisedButton from 'material-ui/lib/raised-button';

import Card from 'material-ui/lib/card/card';
import CardHeader from 'material-ui/lib/card/card-header';
import CardText from 'material-ui/lib/card/card-text';

// D2 UI
import HeaderBar from 'd2-ui/lib/header-bar/HeaderBar.component';
import Sidebar from 'd2-ui/lib/sidebar/Sidebar.component';
import Form from 'd2-ui/lib/forms/Form.component';
import {wordToValidatorMap} from 'd2-ui/lib/forms/Validators';

// App
import DataApprovalLevels from './data-approval-levels/DataApprovalLevels.component';
import Oauth2ClientEditor from './oauth2-client-editor/OAuth2ClientEditor.component';
import MuiThemeMixin from './mui-theme.mixin.js';
import HackyTextField from './form-fields/text-field';
import HackyDropDown from './form-fields/drop-down';
import HackyCheckbox from './form-fields/check-box';
import FileUpload from './form-fields/file-upload.js';
import AppTheme from './theme';

import settingsKeyMapping from './settingsKeyMapping';


function getValidatorFunctions(settingsMapping) {
    return (settingsMapping.hasOwnProperty('validators') ? settingsMapping.validators : [])
        .filter(validatorName => wordToValidatorMap.has(validatorName))
        .map(validatorName => wordToValidatorMap.get(validatorName));
}


export default React.createClass({
    propTypes: {
        categories: React.PropTypes.object.isRequired,
        categoryOrder: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        settingsStore: React.PropTypes.object.isRequired,
        configOptionStore: React.PropTypes.object.isRequired,
        settingsActions: React.PropTypes.object.isRequired,
        d2: React.PropTypes.object.isRequired,
    },

    childContextTypes: {
        d2: React.PropTypes.object,
    },

    mixins: [MuiThemeMixin],

    getChildContext() {
        return {
            d2: this.props.d2,
        };
    },

    getInitialState() {
        return {
            category: this.props.categoryOrder[0],
            currentSettings: this.props.categories[this.props.categoryOrder[0]].settings,
            snackbarMessage: '',
            showSnackbar: false,
        };
    },

    componentDidMount() {
        this.props.settingsStore.subscribe(() => {
            this.forceUpdate();
        });
        this.props.configOptionStore.subscribe(() => {
            this.forceUpdate();
        });
        this.props.settingsActions.setCategory.subscribe((arg) => {
            const category = arg.data.key || arg.data || this.props.categoryOrder[0];
            const searchResult = arg.data.settings || [];
            if (category === 'search') {
                this.setState({
                    category: category,
                    currentSettings: searchResult,
                });
            } else {
                this.sidebar.clearSearchBox();
                this.setState({
                    category: category,
                    currentSettings: this.props.categories[category].settings,
                });
            }
        });
        this.props.settingsActions.showSnackbarMessage.subscribe(params => {
            const message = typeof params.data === 'string' || params.data instanceof String ? params.data : '';
            this.setState({snackbarMessage: message, showSnackbar: true});
        });
    },

    render() {
        const d2 = this.props.d2;
        const settingsStore = this.props.settingsStore;
        const theme = AppTheme;
        const currentSettings = this.state.currentSettings;

        const fieldConfigs = currentSettings.map(settingsKey => {
            const mapping = settingsKeyMapping[settingsKey];
            if (!mapping) {
                log.warn('Missing mapping for key:', settingsKey);
                return undefined;
            }

            const defaultValue = settingsStore.state ? settingsStore.state[settingsKey] : '';
            const value = this.state.values && this.state.values[settingsKey];
            const fieldConfig = {
                name: settingsKey,
                fieldOptions: {},
            };

            switch (mapping.type) {
            case 'dropdown':
                fieldConfig.type = HackyDropDown;
                fieldConfig.fieldOptions = {
                    floatingLabelText: d2.i18n.getTranslation(mapping.label),
                    value: defaultValue,
                    menuItems: Object.keys(mapping.options || {}).map(val => {
                        const label = mapping.options[val];
                        return {
                            payload: val,
                            text: isNaN(label) ? d2.i18n.getTranslation(mapping.options[val]) : label,
                        };
                    }),
                    includeEmpty: !!mapping.includeEmpty,
                    emptyLabel: mapping.emptyLabel ? d2.i18n.getTranslation(mapping.emptyLabel) : '',
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
                fieldConfig.type = RaisedButton;
                fieldConfig.fieldOptions = {
                    label: d2.i18n.getTranslation(mapping.label),
                    onClick: () => {
                        const qry = mapping.query_type === 'DELETE' ? d2.Api.getApi().delete(mapping.uri) : d2.Api.getApi().post(mapping.uri);
                        qry.then(result => {
                            log.info(result && result.message || 'Ok');
                            this.props.settingsActions.load(true);
                            this.props.settingsActions.showSnackbarMessage(result.message);
                        }).catch(error => {
                            log.error(error.message);
                            this.props.settingsActions.showSnackbarMessage(error.message);
                        });
                    },
                    style: {minWidth: 'initial', maxWidth: 'initial', marginTop: '1em'},
                };
                break;

            case 'indicatorGroups':
            case 'dataElementGroups':
            case 'userGroups':
            case 'organisationUnitLevels':
            case 'userRoles':
            case 'organisationUnits':
            case 'startModules':
            case 'flags':
            case 'styles':
                fieldConfig.type = HackyDropDown;
                const opts = this.props.configOptionStore;
                fieldConfig.fieldOptions = {
                    floatingLabelText: d2.i18n.getTranslation(mapping.label),
                    value: defaultValue || 'null',
                    menuItems: opts.state ? opts.state[mapping.type] : [],
                    includeEmpty: !!mapping.includeEmpty,
                    emptyLabel: mapping.emptyLabel ? d2.i18n.getTranslation(mapping.emptyLabel) : '',
                };

                if (['startModules', 'styles'].indexOf(mapping.type) >= 0) {
                    break;
                } else if (mapping.type === 'flags') {
                    // Treat 'no flag' as flag='dhis2'
                    if (!settingsStore.state[settingsKey]) {
                        fieldConfig.fieldOptions.value = 'dhis2';
                    }
                    break;
                }

                d2.system.configuration.get(settingsKey).then(val => {
                    fieldConfig.fieldOptions.defaultValue = val === null ? 'null' : val.id;
                }).catch((err) => {
                    log.info('Failed to get value for ' + settingsKey, err);
                });
                break;

            case 'editlist':
                fieldConfig.type = HackyTextField;
                fieldConfig.fieldOptions = {
                    floatingLabelText: d2.i18n.getTranslation(mapping.label),
                    value: value || defaultValue,
                    multiLine: true,
                };
                fieldConfig.updateEvent = 'onBlur';
                break;

            case 'password':
                fieldConfig.type = HackyTextField;
                fieldConfig.fieldOptions = {
                    floatingLabelText: d2.i18n.getTranslation(mapping.label),
                    value: value || defaultValue,
                    type: 'password',
                };
                fieldConfig.updateEvent = 'onBlur';
                break;

            case 'dataapproval':
                fieldConfig.type = DataApprovalLevels;
                break;

            case 'oauth2clients':
                fieldConfig.type = Oauth2ClientEditor;
                break;

            case 'staticContent':
                fieldConfig.type = FileUpload;
                fieldConfig.fieldOptions = {
                    label: d2.i18n.getTranslation(mapping.label),
                    name: mapping.name,
                    isEnabled: settingsStore.state.hasOwnProperty(settingsKey),
                    defaultValue: defaultValue === 'true' || defaultValue === true,
                    value: defaultValue === 'true' || defaultValue === true,
                };
                break;

            default:
                fieldConfig.type = HackyTextField;
                fieldConfig.updateEvent = 'onBlur';
                fieldConfig.fieldOptions = {
                    floatingLabelText: d2.i18n.getTranslation(mapping.label),
                    value: value || defaultValue,
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

            if (mapping.helpText && !fieldConfig.fieldOptions.helpText) {
                fieldConfig.fieldOptions.helpText = d2.i18n.getTranslation(mapping.helpText);
                fieldConfig.fieldOptions.dynamicHelpText = true;
            }

            fieldConfig.validators = getValidatorFunctions(mapping);

            return fieldConfig;
        });

        const sections = Object.keys(this.props.categories).map(catKey => {
            return {key: catKey, label: d2.i18n.getTranslation(this.props.categories[catKey].label)};
        });
        const styles = {
            card: {
                marginTop: 8,
                marginRight: '1rem',
            },
            cardTitle: {
                background: '#5892BE',
            },
            cardTitleText: {
                fontSize: 28,
                fontWeight: 100,
                color: 'white',
            },
        };

        return (
            <div className="app">
                <HeaderBar />
                <Snackbar
                    message={this.state.snackbarMessage || ''}
                    autoHideDuration={1250}
                    open={this.state.showSnackbar}
                    onRequestClose={this.closeSnackbar}
                    style={{left: 24, right: 'inherit'}}/>
                <Sidebar
                    sections={sections}
                    onChangeSection={this.props.settingsActions.setCategory}
                    currentSection={this.state.category}
                    showSearchField
                    ref={ref => { this.sidebar = ref; }}
                    onChangeSearchText={this.props.settingsActions.searchSettings}/>

                <div className="content-area" style={theme.forms}>
                    <Card style={styles.card}>
                        <CardHeader
                            title={this.props.categories[this.state.category] ?
                                d2.i18n.getTranslation(this.props.categories[this.state.category].pageLabel) :
                                d2.i18n.getTranslation('search_results')}
                            style={styles.cardTitle}
                            titleStyle={styles.cardTitleText}/>
                        <CardText>
                            {!this.state.currentSettings.length ?
                                <div>{d2.i18n.getTranslation('no_settings_found_that_match')}</div> : null}
                            <Form source={this.props.settingsStore.state || {}} fieldConfigs={fieldConfigs}
                                  onFormFieldUpdate={this._saveSetting}/>
                        </CardText>
                    </Card>
                </div>
            </div>
        );
    },

    closeSnackbar() {
        this.setState({showSnackbar: false});
    },

    _saveSetting(key, value) {
        this.props.settingsActions.saveKey(key, value);
    },
});
