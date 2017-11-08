import React from 'react';
import log from 'loglevel';

// Material UI
import { Card, CardText } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';

// D2 UI
import { wordToValidatorMap } from 'd2-ui/lib/forms/Validators';
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';

// App
import Oauth2ClientEditor from './oauth2-client-editor/OAuth2ClientEditor.component';
import LocalizedAppearance from './localized-text/LocalizedAppearanceEditor.component';
import metadataSettings from './metadata-settings/metadataSettings.component';
import RaisedButton from './form-fields/raised-button';
import SelectField from './form-fields/drop-down';
import Checkbox from './form-fields/check-box';
import FileUpload from './form-fields/file-upload';
import TextField from './form-fields/text-field';
import AppTheme from './theme';

import settingsActions from './settingsActions';
import settingsStore from './settingsStore';
import settingsKeyMapping from './settingsKeyMapping';
import { categories } from './settingsCategories';
import configOptionStore from './configOptionStore';

import i18next from 'i18next';

const styles = {
    header: {
        fontSize: 24,
        fontWeight: 300,
        color: AppTheme.rawTheme.palette.textColor,
        padding: '24px 0 12px 16px',
    },
    card: {
        marginTop: 8,
        marginRight: '1rem',
        padding: '0 1rem',
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
    noHits: {
        padding: '1rem',
        marginTop: '1rem',
        fontWeight: 300,
    },
    userSettingsOverride: {
        color: AppTheme.rawTheme.palette.primary1Color,
        position: 'absolute',
        right: 0,
        top: 24,
    },
    menuIcon: {
        color: '#757575',
    },
    menuLabel: {
        position: 'relative',
        top: -6,
        marginLeft: 16,
    },
};

function wrapUserSettingsOverride(d2, component, valueLabel) {
    return class extends component {
        render() {
            const labelStyle = Object.assign({}, styles.userSettingsOverride);
            if (component === Checkbox) {
                labelStyle.top = -8;
            }

            const labelText = valueLabel !== undefined
                ? `${i18next.t('This setting will be overridden by the current user setting')}: ${valueLabel}`
                : i18next.t('This setting can be overridden by user settings');

            return (
                <div style={{ marginRight: 48 }}>
                    {super.render()}
                    <div style={labelStyle}>
                        <IconButton
                            iconClassName="material-icons"
                            tooltip={labelText}
                            tooltipPosition="bottom-left"
                            iconStyle={{ color: AppTheme.rawTheme.palette.primary1Color }}
                            tooltipStyles={{ fontSize: '.75rem', marginRight: 32, marginTop: -32 }}
                        >info_outline</IconButton>
                    </div>
                </div>
            );
        }
    };
}

class SettingsFields extends React.Component {
    componentDidMount() {
        this.subscriptions = [];
        this.subscriptions.push(settingsStore.subscribe(() => this.forceUpdate()));
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.currentSettings.join(',') !== this.props.currentSettings.join(',');
    }

    componentWillUnmount() {
        if (Array.isArray(this.subscriptions)) {
            this.subscriptions.forEach(sub => sub.unsubscribe());
        }
    }

    renderFields(settings) {
        const d2 = this.context.d2;
        if (settings.length === 0) {
            return (
                <div style={styles.noHits}>
                    { i18next.t('No settings matched the search term') }
                </div>
            );
        }

        /* eslint-disable complexity */
        const fields = settings
            .map((key) => {
                const mapping = settingsKeyMapping[key];

                // Base config, common for all component types
                const validators = [];
                if (mapping.validators) {
                    mapping.validators.forEach((name) => {
                        if (wordToValidatorMap.has(name)) {
                            validators.push({
                                validator: wordToValidatorMap.get(name),
                                message: i18next.t(wordToValidatorMap.get(name).message),
                            });
                        }
                    });
                }

                const fieldBase = {
                    name: key,
                    value: (settingsStore.state && settingsStore.state[key]) || '',
                    component: TextField,
                    props: {
                        floatingLabelText: i18next.t(mapping.label),
                        style: { width: '100%' },
                        hintText: mapping.hintText && i18next.t(mapping.hintText),
                    },
                    validators,
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
                    if (mapping.includeEmpty && fieldBase.value === '') {
                        fieldBase.value = 'null';
                    }

                    return Object.assign({}, fieldBase, {
                        component: SelectField,
                        props: Object.assign({}, fieldBase.props, {
                            menuItems: mapping.source
                                ? (configOptionStore.state && configOptionStore.state[mapping.source]) || []
                                : Object.keys(mapping.options).map((id) => {
                                    const displayName = !isNaN(mapping.options[id]) ?
                                        mapping.options[id] :
                                        i18next.t(mapping.options[id]);
                                    return { id, displayName };
                                }),
                            includeEmpty: !!mapping.includeEmpty,
                            emptyLabel: (
                                (mapping.includeEmpty &&
                                mapping.emptyLabel && i18next.t(mapping.emptyLabel)) || undefined
                            ),
                            noOptionsLabel: i18next.t('No options'),
                        }),
                    });

                case 'checkbox':
                    return Object.assign({}, fieldBase, {
                        component: Checkbox,
                        props: {
                            label: fieldBase.props.floatingLabelText,
                            style: fieldBase.props.style,
                            defaultChecked: fieldBase.value === 'true',
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
                                d2.Api.getApi().post(mapping.uri)
                                    .then((result) => {
                                        log.info((result && result.message) || 'Ok');
                                        settingsActions.load(true);
                                        settingsActions.showSnackbarMessage(result.message);
                                    }).catch((error) => {
                                        log.warn('Error when performing API query:', error.message);
                                        settingsActions.showSnackbarMessage(error.message);
                                    });
                            },
                            style: { minWidth: 'initial', maxWidth: 'initial', marginTop: '1em' },
                        },
                    });

                case 'localizedAppearance':
                    return Object.assign({}, fieldBase, {
                        component: LocalizedAppearance,
                    });

                case 'metadataSettings':
                    return Object.assign({}, fieldBase, {
                        component: metadataSettings,
                    });

                default:
                    log.warn(`Unknown control type "${mapping.type}" encountered for field "${key}"`);
                    return {};
                }
            })
            .filter(f => !!f.name)
            .map((field) => {
                const mapping = settingsKeyMapping[field.name];
                const options = configOptionStore.getState();

                if (mapping.userSettingsOverride) {
                    const userSettingsNoFallback = (options && options.userSettingsNoFallback) || {};
                    const userSettingValue = userSettingsNoFallback && userSettingsNoFallback[field.name] !== null
                        ? userSettingsNoFallback[field.name]
                        : '';
                    let component = field.component;

                    if (userSettingValue === '') {
                        component = wrapUserSettingsOverride(d2, component);
                    } else if (mapping.source) {
                        const userSettingLabel = ((options && options[mapping.source]) || [])
                            .filter(opt => opt.id === userSettingValue)
                            .map(opt => opt.displayName)
                            .pop();

                        component = wrapUserSettingsOverride(d2, component, userSettingLabel);
                    } else {
                        component = wrapUserSettingsOverride(d2, component, i18next.t(userSettingValue));
                    }

                    return Object.assign(field, { component });
                }

                return field;
            });
        /* eslint-enable complexity */

        return (
            <Card style={styles.card} key={this.props.category}>
                <CardText>
                    <FormBuilder fields={fields} onUpdateField={settingsActions.saveKey} />
                </CardText>
            </Card>
        );
    }

    render() {
        const categories = {
            general: {
                pageLabel: i18next.t('General settings')
            },
            analytics: {
                pageLabel: i18next.t('Analytics settings')
            },
            server: {
                pageLabel: i18next.t('Server settings')
            },
            appearance: {
                pageLabel: i18next.t('Appearance settings')
            },
            email: {
                pageLabel: i18next.t('Email settings')
            },
            messaging: {
                pageLabel: i18next.t('Messaging settings')
            },
            access: {
                pageLabel: i18next.t('Access settings')
            },
            calendar: {
                pageLabel: i18next.t('Calendar settings')
            },
            import: {
                pageLabel: i18next.t('Data import settings')
            },
            sync: {
                pageLabel: i18next.t('Synchronization settings')
            },
            monitoring: {
                pageLabel: i18next.t('System monitoring settings')
            },
            oauth2: {
                pageLabel: i18next.t('OAuth2 Clients')
            },
        };

        return (
            <div className="content-area">
                <div style={styles.header}>{categories[this.props.category] ?
                    i18next.t(categories[this.props.category].pageLabel) :
                    i18next.t('Search results')}
                </div>
                {this.renderFields(this.props.currentSettings)}
            </div>
        );
    }
}

SettingsFields.propTypes = {
    category: React.PropTypes.string.isRequired,
    currentSettings: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
};
SettingsFields.contextTypes = {
    d2: React.PropTypes.object.isRequired,
};


export default SettingsFields;
