import i18n from '@dhis2/d2-i18n'
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component'
import { wordToValidatorMap } from 'd2-ui/lib/forms/Validators'
import { Card, CardText } from 'material-ui/Card'
import IconButton from 'material-ui/IconButton'
import PropTypes from 'prop-types'
import React from 'react'
import configOptionStore from './configOptionStore'
import Checkbox from './form-fields/check-box'
import SelectField from './form-fields/drop-down'
import FileUpload from './form-fields/file-upload'
import RaisedButton from './form-fields/raised-button'
import TextField from './form-fields/text-field'
import LocalizedAppearance from './localized-text/LocalizedAppearanceEditor.component'
import metadataSettings from './metadata-settings/metadataSettings.component'
import Oauth2ClientEditor from './oauth2-client-editor/OAuth2ClientEditor.component'
import settingsActions from './settingsActions'
import { categories } from './settingsCategories'
import settingsKeyMapping from './settingsKeyMapping'
import settingsStore from './settingsStore'
import AppTheme from './theme'

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
}

function wrapUserSettingsOverride(d2, component, valueLabel) {
    return class extends component {
        render() {
            const labelStyle = Object.assign({}, styles.userSettingsOverride)
            if (component === Checkbox) {
                labelStyle.top = -8
            }

            const labelText =
                valueLabel !== undefined
                    ? `${d2.i18n.getTranslation(
                          'will_be_overridden_by_current_user_setting'
                      )}: ${valueLabel}`
                    : d2.i18n.getTranslation(
                          'can_be_overridden_by_user_settings'
                      )

            return (
                <div style={{ marginRight: 48 }}>
                    {super.render()}
                    <div style={labelStyle}>
                        <IconButton
                            iconClassName="material-icons"
                            tooltip={labelText}
                            tooltipPosition="bottom-left"
                            iconStyle={{
                                color: AppTheme.rawTheme.palette.primary1Color,
                            }}
                            tooltipStyles={{
                                fontSize: '.75rem',
                                marginRight: 32,
                                marginTop: -32,
                            }}
                        >
                            info_outline
                        </IconButton>
                    </div>
                </div>
            )
        }
    }
}

function addConditionallyHiddenStyles(mapping) {
    if (!mapping || !mapping.hideWhen) {
        return {}
    }

    const { settingsKey, settingsValue } = mapping.hideWhen
    const currentValue = settingsStore.state[settingsKey]

    return settingsValue === currentValue ? { display: 'none' } : {}
}

class SettingsFields extends React.Component {
    componentDidMount() {
        this.subscriptions = []
        this.subscriptions.push(
            settingsStore.subscribe(() => this.forceUpdate())
        )
    }

    shouldComponentUpdate(nextProps) {
        return (
            nextProps.currentSettings.join(',') !==
            this.props.currentSettings.join(',')
        )
    }

    componentWillUnmount() {
        if (Array.isArray(this.subscriptions)) {
            this.subscriptions.forEach(sub => sub.unsubscribe())
        }
    }

    fieldForMapping({ mapping, fieldBase, key, d2 }) {
        switch (mapping.type) {
            case 'textfield':
            case undefined:
                return Object.assign({}, fieldBase, {
                    props: Object.assign({}, fieldBase.props, {
                        changeEvent: 'onBlur',
                        multiLine: !!mapping.multiLine,
                    }),
                })

            case 'password':
                return Object.assign({}, fieldBase, {
                    props: Object.assign({}, fieldBase.props, {
                        type: 'password',
                        changeEvent: 'onBlur',
                        autoComplete: 'new-password',
                    }),
                })

            case 'dropdown':
                if (mapping.includeEmpty && fieldBase.value === '') {
                    fieldBase.value = 'null'
                }

                return Object.assign({}, fieldBase, {
                    component: SelectField,
                    props: Object.assign({}, fieldBase.props, {
                        menuItems: mapping.source
                            ? (configOptionStore.state &&
                                  configOptionStore.state[mapping.source]) ||
                              []
                            : Object.keys(mapping.options).map(id => {
                                  const displayName = !isNaN(
                                      mapping.options[id]
                                  )
                                      ? mapping.options[id]
                                      : d2.i18n.getTranslation(
                                            mapping.options[id]
                                        )
                                  return { id, displayName }
                              }),
                        includeEmpty: !!mapping.includeEmpty,
                        emptyLabel:
                            (mapping.includeEmpty &&
                                mapping.emptyLabel &&
                                d2.i18n.getTranslation(mapping.emptyLabel)) ||
                            undefined,
                        noOptionsLabel: d2.i18n.getTranslation('no_options'),
                    }),
                })

            case 'checkbox':
                return Object.assign({}, fieldBase, {
                    component: Checkbox,
                    props: {
                        label: fieldBase.props.floatingLabelText,
                        sectionLabel:
                            (mapping.sectionLabel &&
                                d2.i18n.getTranslation(mapping.sectionLabel)) ||
                            undefined,
                        style: fieldBase.props.style,
                        onCheck: (e, v) => {
                            settingsActions.saveKey(key, v ? 'true' : 'false')
                        },
                    },
                })

            case 'staticContent':
                return Object.assign({}, fieldBase, {
                    component: FileUpload,
                    props: {
                        label: fieldBase.props.floatingLabelText,
                        name: mapping.name,
                        isEnabled:
                            settingsStore.state &&
                            Object.hasOwnProperty.call(
                                settingsStore.state,
                                key
                            ),
                        value:
                            fieldBase.value === 'true' ||
                            fieldBase.value === true,
                    },
                })

            case 'oauth2clients':
                return Object.assign({}, fieldBase, {
                    component: Oauth2ClientEditor,
                })

            case 'postButton':
                return Object.assign({}, fieldBase, {
                    component: RaisedButton,
                    props: {
                        label: fieldBase.props.floatingLabelText,
                        onClick: () => {
                            d2.Api.getApi()
                                .post(mapping.uri)
                                .then(result => {
                                    settingsActions.load(true)
                                    settingsActions.showSnackbarMessage(
                                        result.message
                                    )
                                })
                                .catch(error => {
                                    settingsActions.showSnackbarMessage(
                                        error.message
                                    )
                                })
                        },
                        style: {
                            minWidth: 'initial',
                            maxWidth: 'initial',
                            marginTop: '1em',
                        },
                    },
                })

            case 'localizedAppearance':
                return Object.assign({}, fieldBase, {
                    component: LocalizedAppearance,
                })

            case 'metadataSettings':
                return Object.assign({}, fieldBase, {
                    component: metadataSettings,
                })

            default:
                console.warn(
                    `Unknown control type "${mapping.type}" encountered for field "${key}"`
                )
                return {}
        }
    }

    renderFields(settings) {
        const d2 = this.context.d2
        if (settings.length === 0) {
            return (
                <div style={styles.noHits}>
                    {d2.i18n.getTranslation(
                        'no_settings_matched_the_search_term'
                    )}
                </div>
            )
        }

        const fields = settings
            .map(key => {
                const mapping = settingsKeyMapping[key]

                // Base config, common for all component types
                const validators = []
                if (mapping.validators) {
                    mapping.validators.forEach(name => {
                        if (wordToValidatorMap.has(name)) {
                            validators.push({
                                validator: wordToValidatorMap.get(name),
                                message: d2.i18n.getTranslation(
                                    wordToValidatorMap.get(name).message
                                ),
                            })
                        }
                    })
                }

                const fieldBase = {
                    name: key,
                    value:
                        (settingsStore.state && settingsStore.state[key]) || '',
                    component: TextField,
                    props: {
                        floatingLabelText: d2.i18n.getTranslation(
                            mapping.label
                        ),
                        style: {
                            width: '100%',
                            ...addConditionallyHiddenStyles(mapping),
                        },
                        hintText:
                            mapping.hintText &&
                            d2.i18n.getTranslation(mapping.hintText),
                    },
                    validators,
                }

                return this.fieldForMapping({ mapping, fieldBase, key, d2 })
            })
            .filter(f => !!f.name)
            .map(field => {
                const mapping = settingsKeyMapping[field.name]
                const options = configOptionStore.getState()

                if (mapping.userSettingsOverride) {
                    const userSettingsNoFallback =
                        (options && options.userSettingsNoFallback) || {}
                    const userSettingValue =
                        userSettingsNoFallback &&
                        userSettingsNoFallback[field.name] !== null
                            ? userSettingsNoFallback[field.name]
                            : ''
                    let component = field.component

                    if (userSettingValue === '') {
                        component = wrapUserSettingsOverride(d2, component)
                    } else if (mapping.source) {
                        const userSettingLabel = (
                            (options && options[mapping.source]) ||
                            []
                        )
                            .filter(opt => opt.id === userSettingValue)
                            .map(opt => opt.displayName)
                            .pop()

                        component = wrapUserSettingsOverride(
                            d2,
                            component,
                            userSettingLabel
                        )
                    } else {
                        component = wrapUserSettingsOverride(
                            d2,
                            component,
                            d2.i18n.getTranslation(userSettingValue)
                        )
                    }

                    return Object.assign(field, { component })
                }

                return field
            })

        return (
            <Card style={styles.card} key={this.props.category}>
                <CardText>
                    <FormBuilder
                        fields={fields}
                        onUpdateField={settingsActions.saveKey}
                    />
                </CardText>
            </Card>
        )
    }

    render() {
        return (
            <div className="content-area">
                <div style={styles.header}>
                    {categories[this.props.category]
                        ? categories[this.props.category].pageLabel
                        : i18n.t('Search results')}
                </div>
                {this.renderFields(this.props.currentSettings)}
            </div>
        )
    }
}

SettingsFields.propTypes = {
    category: PropTypes.string.isRequired,
    currentSettings: PropTypes.arrayOf(PropTypes.string).isRequired,
}
SettingsFields.contextTypes = {
    d2: PropTypes.object.isRequired,
}

export default SettingsFields
