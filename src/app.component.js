import React from 'react/addons';
import log from 'loglevel';

// Material UI
import Snackbar from 'material-ui/lib/snackbar';
import FlatButton from 'material-ui/lib/flat-button';

// D2 UI
import HeaderBar from 'd2-ui/lib/header-bar/HeaderBar.component';
import Sidebar from './Sidebar.component';
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


function getValidatorFunctions(settingsMapping) {
    if (settingsMapping.hasOwnProperty('validators')) {
        return (settingsMapping.validators || [])
            .filter(validatorName => wordToValidatorMap.has(validatorName))
            .map(validatorName => wordToValidatorMap.get(validatorName));
    }
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
            const category = arg.data;
            this.setState({
                category: category,
                currentSettings: category.searchResult ? category.settings : this.props.categories[category].settings,
            });
        });
    },

    render() {
        const d2 = this.props.d2;
        const settingsStore = this.props.settingsStore;
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
            case 'startModules':
            case 'flags':
            case 'styles':
                fieldConfig.type = HackyDropDown;
                const opts = this.props.configOptionStore;
                fieldConfig.fieldOptions = {
                    floatingLabelText: d2.i18n.getTranslation(mapping.label),
                    value: defaultValue || 'null',
                    menuItems: opts.state ? opts.state[mapping.type] : [],
                };

                if (['startModules', 'flags', 'styles'].indexOf(mapping.type) >= 0) {
                    break;
                }

                d2.system.configuration.get(settingsKey).then(value => {
                    fieldConfig.fieldOptions.defaultValue = value === null ? 'null' : value.id;
                }).catch(() => {});
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

            if (mapping.helpText && !fieldConfig.fieldOptions.helpText) {
                fieldConfig.fieldOptions.helpText = d2.i18n.getTranslation(mapping.helpText);
                fieldConfig.fieldOptions.dynamicHelpText = true;
            }

            fieldConfig.validators = getValidatorFunctions(mapping);

            return fieldConfig;
        });
        return (
            <div className="app">
                <HeaderBar />
                <Snackbar
                    message={d2.i18n.getTranslation('settings_updated')}
                    autoHideDuration={1250}
                    ref={(ref) => { this._uglySnackbarRefExportFn(ref); }}
                    />
                <Sidebar
                    d2={d2}
                    categoryOrder={this.props.categoryOrder}
                    categories={this.props.categories}
                    currentCategory={this.state.category}
                    settingsActions={this.props.settingsActions}
                    />

                <div className="content-area" style={theme.forms}>
                    <h1 style={{fontSize: '1.75rem'}}>{
                        this.props.categories[this.state.category] ?
                        d2.i18n.getTranslation(this.props.categories[this.state.category].pageLabel) :
                        d2.i18n.getTranslation('search_results')
                    }</h1>
                    {!this.state.currentSettings.length ?
                        <div>{d2.i18n.getTranslation('no_settings_found_that_match')}</div> : null}
                    <Form source={this.props.settingsStore.state || {}} fieldConfigs={fieldConfigs} onFormFieldUpdate={this._saveSetting}/>
                </div>
            </div>
        );
    },

    _uglySnackbarRefExportFn(ref) {
        this._snackbar = ref;
        window.snackbar = this._snackbar;
    },

    _saveSetting(key, value) {
        this.props.settingsActions.saveKey(key, value);
    },
});
