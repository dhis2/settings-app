import React from 'react';
import log from 'loglevel';

// Material UI
import Snackbar from 'material-ui/lib/snackbar';
import RaisedButton from 'material-ui/lib/raised-button';
import TextField from 'material-ui/lib/text-field';
import Card from 'material-ui/lib/card/card';
import CardText from 'material-ui/lib/card/card-text';

// D2 UI
import HeaderBar from 'd2-ui/lib/header-bar/HeaderBar.component';
import Sidebar from 'd2-ui/lib/sidebar/Sidebar.component';
import { wordToValidatorMap } from 'd2-ui/lib/forms/Validators';
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';

// App
import DataApprovalLevels from './data-approval-levels/DataApprovalLevels.component';
import Oauth2ClientEditor from './oauth2-client-editor/OAuth2ClientEditor.component';
import MuiThemeMixin from './mui-theme.mixin.js';
import HackyDropDown from './form-fields/drop-down';
import HackyCheckbox from './form-fields/check-box';
import FileUpload from './form-fields/file-upload.js';
import AppTheme from './theme';

import settingsActions from './settingsActions';
import settingsStore from './settingsStore';
import settingsKeyMapping from './settingsKeyMapping';
import { categoryOrder, categories } from './settingsCategories';
import configOptionStore from './configOptionStore';


// TODO: Rewrite as ES6 class
/* eslint-disable react/prefer-es6-class */
export default React.createClass({
    propTypes: {
        d2: React.PropTypes.object.isRequired,
    },

    childContextTypes: {
        d2: React.PropTypes.object,
    },

    mixins: [MuiThemeMixin],

    getInitialState() {
        return {
            category: categoryOrder[0],
            currentSettings: categories[categoryOrder[0]].settings,
            snackbarMessage: '',
            showSnackbar: false,
            formValidator: undefined,
        };
    },

    getChildContext() {
        return {
            d2: this.props.d2,
        };
    },

    componentDidMount() {
        this.subscriptions = [];

        this.subscriptions.push(settingsStore.subscribe(() => {
            log.info('Settings store updated');
        }));

        this.subscriptions.push(configOptionStore.subscribe(() => {
            log.info('Config options loaded');
            // Must force update here in order to redraw form fields that require config options
            // TODO: Replace this with async select fields
            this.forceUpdate();
        }));

        /* eslint-disable complexity */
        this.subscriptions.push(settingsActions.setCategory.subscribe((arg) => {
            const category = arg.data.key || arg.data || categoryOrder[0];
            const searchResult = arg.data.settings || [];
            const currentSettings = category === 'search' ? searchResult : categories[category].settings;

            if (category !== 'search') {
                this.sidebar.clearSearchBox();
            }
            this.setState({ category, currentSettings });
        }));
        /* eslint-enable complexity */

        this.subscriptions.push(settingsActions.showSnackbarMessage.subscribe(params => {
            const message = params.data;
            this.setState({ snackbarMessage: message, showSnackbar: !!message });
        }));
    },

    componentWillUnmount() {
        this.subscriptions.forEach(sub => {
            sub.dispose();
        });
    },

    closeSnackbar() {
        this.setState({ showSnackbar: false });
    },

    renderFields(styles, settings) {
        /* eslint-disable complexity */
        const fields = settings
            .map(key => {
                const mapping = settingsKeyMapping[key];

                // Base config, common for all component types
                const fieldBase = {
                    name: key,
                    value: settingsStore.state ? settingsStore.state[key] : '',
                    component: TextField,
                    props: {
                        floatingLabelText: this.props.d2.i18n.getTranslation(mapping.label),
                        style: { width: '100%' },
                    },
                    validators: (mapping.validators || []).map(name => wordToValidatorMap.has(name) ? {
                        validator: wordToValidatorMap.get(name),
                        message: this.props.d2.i18n.getTranslation(wordToValidatorMap.get(name).message),
                    } : false)
                    .filter(v => v),
                };

                switch (mapping.type) {
                case 'textfield':
                case undefined:
                    return Object.assign({}, fieldBase, {
                        props: Object.assign({}, fieldBase.props, {
                            changeEvent: 'onBlur',
                            multiLine: !!mapping.multiLine,
                        }),
                    });

                case 'password':
                    return Object.assign({}, fieldBase, {
                        props: Object.assign({}, fieldBase.props, {
                            type: 'password',
                            changeEvent: 'onBlur',
                        }),
                    });

                case 'dropdown':
                    return Object.assign({}, fieldBase, {
                        component: HackyDropDown,
                        props: Object.assign({}, fieldBase.props, {
                            menuItems: mapping.source ?
                            configOptionStore.state && configOptionStore.state[mapping.source] || [] :
                                Object.keys(mapping.options).map(id => {
                                    const displayName = !isNaN(mapping.options[id]) ?
                                        mapping.options[id] :
                                        this.props.d2.i18n.getTranslation(mapping.options[id]);
                                    return { id, displayName };
                                }),
                            includeEmpty: !!mapping.includeEmpty,
                            emptyLabel: !!mapping.includeEmpty && mapping.emptyLabel ?
                                this.props.d2.i18n.getTranslation(mapping.emptyLabel) : '',
                        }),
                    });

                case 'checkbox':
                    return Object.assign({}, fieldBase, {
                        component: HackyCheckbox,
                        props: {
                            label: fieldBase.props.floatingLabelText,
                            style: fieldBase.props.style,
                            checked: fieldBase.value === 'true',
                            onCheck: (e, v) => {
                                settingsActions.saveKey(key, v ? 'true' : 'false');
                            },
                        },
                    });

                case 'staticContent':
                    return Object.assign({}, fieldBase, {
                        component: FileUpload,
                        props: {
                            label: fieldBase.props.floatingLabelText,
                            name: mapping.name,
                            isEnabled: settingsStore.state.hasOwnProperty(key),
                            value: fieldBase.value === 'true' || fieldBase.value === true,
                        },
                    });

                case 'dataApproval':
                    return Object.assign({}, fieldBase, {
                        component: DataApprovalLevels,
                    });

                case 'oauth2clients':
                    return Object.assign({}, fieldBase, {
                        component: Oauth2ClientEditor,
                    });

                case 'postButton':
                    return Object.assign({}, fieldBase, {
                        component: RaisedButton,
                        props: {
                            label: fieldBase.props.floatingLabelText,
                            onClick: () => {
                                const qry = mapping.query_type === 'DELETE' ?
                                    this.props.d2.Api.getApi().delete(mapping.uri) :
                                    this.props.d2.Api.getApi().post(mapping.uri);
                                qry.then(result => {
                                    log.info(result && result.message || 'Ok');
                                    settingsActions.load(true);
                                    settingsActions.showSnackbarMessage(result.message);
                                }).catch(error => {
                                    log.error(error.message);
                                    settingsActions.showSnackbarMessage(error.message);
                                });
                            },
                            style: { minWidth: 'initial', maxWidth: 'initial', marginTop: '1em' },
                        },
                    });

                default:
                    log.warn(`Unknown control type "${mapping.type}" encountered for field "${key}"`);
                    return {};
                }
            })
            .filter(f => !!f.name);
        /* eslint-enable complexity */

        return (
            <Card style={styles.card}>
                <CardText>
                    <FormBuilder fields={fields} onUpdateField={settingsActions.saveKey} />
                </CardText>
            </Card>
        );
    },

    render() {
        const sections = Object.keys(categories).map(category => {
            const key = category;
            const label = this.props.d2.i18n.getTranslation(categories[category].label);
            return { key, label };
        });
        const styles = {
            header: {
                fontSize: 24,
                fontWeight: 100,
                color: AppTheme.rawTheme.palette.textColor,
                padding: '6px 16px',
            },
            card: {
                marginTop: 8,
                marginRight: '1rem',
            },
            cardTitle: {
                background: AppTheme.rawTheme.palette.primary2Color,
                height: 62,
            },
            cardTitleText: {
                fontSize: 28,
                fontWeight: 100,
                color: AppTheme.rawTheme.palette.alternateTextColor,
            },
            forms: {
                minWidth: AppTheme.forms.minWidth,
                maxWidth: AppTheme.forms.maxWidth,
            },
        };
        const setSidebar = (ref) => { this.sidebar = ref; };

        return (
            <div className="app">
                <HeaderBar />
                <Snackbar
                    message={this.state.snackbarMessage || ''}
                    autoHideDuration={1250}
                    open={this.state.showSnackbar}
                    onRequestClose={this.closeSnackbar}
                    style={{ left: 24, right: 'inherit' }}
                />
                <Sidebar
                    sections={sections}
                    onChangeSection={settingsActions.setCategory}
                    currentSection={this.state.category}
                    showSearchField
                    ref={setSidebar}
                    onChangeSearchText={settingsActions.searchSettings}
                />

                <div className="content-area" style={styles.forms}>
                    <div style={styles.header}>{categories[this.state.category] ?
                        this.props.d2.i18n.getTranslation(categories[this.state.category].pageLabel) :
                        this.props.d2.i18n.getTranslation('search_results')}
                    </div>
                    {this.renderFields(styles, this.state.currentSettings)}
                </div>
            </div>
        );
    },
});
