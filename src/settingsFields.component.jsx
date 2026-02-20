import i18n from '@dhis2/d2-i18n'
import {
    Button,
    Card,
    CenteredContent,
    CircularLoader,
    IconInfo24,
    Tooltip,
} from '@dhis2/ui'
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component.js'
import { wordToValidatorMap } from 'd2-ui/lib/forms/Validators.js'
import PropTypes from 'prop-types'
import React from 'react'
import configOptionStore from './configOptionStore.js'
import Checkbox from './form-fields/check-box.jsx'
import SelectField from './form-fields/drop-down.jsx'
import FileUpload from './form-fields/file-upload.jsx'
import TextField from './form-fields/text-field.jsx'
import LocalizedAppearance from './localized-text/LocalizedAppearanceEditor.component.jsx'
import metadataSettings from './metadata-settings/metadataSettings.component.jsx'
import Oauth2ClientEditor from './oauth2-client-editor/OAuth2ClientEditor.component.jsx'
import Oauth2ClientEditor41 from './oauth2-client-editor-41/OAuth2ClientEditor.component.jsx'
import PeriodTypes from './period-types/PeriodTypes.component.jsx'
import settingsActions from './settingsActions.js'
import { categories } from './settingsCategories.js'
import classes from './SettingsFields.module.css'
import settingsKeyMapping from './settingsKeyMapping.js'
import settingsStore from './settingsStore.js'
import AppTheme from './theme.js'

const styles = {
    header: {
        fontSize: 24,
        fontWeight: 500,
        color: 'var(--colors-grey900)',
        padding: '24px 0 12px 16px',
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
        top: 36,
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

const translateValidatorMessage = (validatorMessage) => {
    switch (validatorMessage) {
        case 'value_required':
            return i18n.t('This field is required')
        case 'value_should_be_a_url':
            return i18n.t('This field should be a URL')
        case 'value_should_be_list_of_urls':
            return i18n.t('This field should contain a list of URLs')
        case 'value_should_be_a_number':
            return i18n.t('This field should be a number')
        case 'value_should_be_a_positive_number':
            return i18n.t('This field should be a positive number')
        case 'value_should_be_an_email':
            return i18n.t('This field should be an email')
    }
    return validatorMessage
}

function wrapUserSettingsOverride({ component, valueLabel }) {
    return class extends component {
        render() {
            const labelStyle = Object.assign({}, styles.userSettingsOverride)
            if (component === Checkbox) {
                labelStyle.top = -8
            }

            const labelText = valueLabel
                ? `${i18n.t(
                    'This setting will be overridden by the current user setting: {{settingName}}',
                    {
                        settingName: valueLabel,
                        nsSeparator: '-:-',
                    }
                )}`
                : i18n.t('This setting can be overridden by user settings')

            return (
                <div style={{ marginRight: 36 }}>
                    {super.render()}
                    <div style={labelStyle}>
                        <Tooltip content={labelText}>
                            <IconInfo24 />
                        </Tooltip>
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
    const currentValue = settingsStore.state && settingsStore.state[settingsKey]

    return settingsValue === currentValue ? { display: 'none' } : {}
}

function getMenuItems(mapping, apiVersion) {
    const sourceMenuItems =
        (configOptionStore.state && configOptionStore.state[mapping.source]) ||
        []

    const options =
        typeof mapping.options === 'function'
            ? mapping.options(apiVersion)
            : mapping.options

    const optionsMenuItems = Object.entries(options || []).map(
        ([id, displayName]) => ({
            id,
            displayName,
        })
    )
    return optionsMenuItems.concat(sourceMenuItems)
}

function isEmailConfigured(d2) {
    const emailHostName = d2.system.settings.settings.keyEmailHostName
    const emailUserName = d2.system.settings.settings.keyEmailUsername
    return emailHostName && emailUserName
}

class SettingsFields extends React.Component {
    componentDidMount() {
        this.subscriptions = []
        this.subscriptions.push(
            settingsStore.subscribe(() => this.forceUpdate())
        )
        this.subscriptions.push(
            configOptionStore.subscribe(() => this.forceUpdate())
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
            this.subscriptions.forEach((sub) => sub.unsubscribe())
        }
    }

    fieldForMapping({ mapping, fieldBase, key, d2, apiVersion }) {
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

            case 'dropdown': {
                if (mapping.includeEmpty && fieldBase.value === '') {
                    fieldBase.value = 'null'
                }

                const helpText =
                    typeof mapping.helpText === 'function'
                        ? mapping.helpText(fieldBase.value, {
                              configOptions: configOptionStore.getState(),
                              settings: settingsStore.state,
                          })
                        : mapping.helpText

                return Object.assign({}, fieldBase, {
                    component: SelectField,
                    props: Object.assign({}, fieldBase.props, {
                        menuItems: getMenuItems(mapping, apiVersion),
                        includeEmpty: !!mapping.includeEmpty,
                        emptyLabel:
                            (mapping.includeEmpty && mapping.emptyLabel) ||
                            undefined,
                        noOptionsLabel: i18n.t('No options'),
                        warning:
                            (mapping.showWarning && mapping.warning) ||
                            undefined,
                        helpText,
                    }),
                })
            }
            case 'emailCheckbox': {
                const emailConfigured = isEmailConfigured(d2)
                const explanatoryText =
                    !emailConfigured &&
                    i18n.t(
                        'Settings must be configured to send emails to enforce verified emails'
                    )
                return Object.assign({}, fieldBase, {
                    component: Checkbox,
                    props: {
                        label: fieldBase.props.floatingLabelText,
                        sectionLabel:
                            (mapping.sectionLabel && mapping.sectionLabel) ||
                            undefined,
                        style: fieldBase.props.style,
                        onCheck: (_event, checked) => {
                            if (!emailConfigured && checked === true) {
                                settingsActions.showSnackbarMessage(
                                    i18n.t(
                                        'You cannot enable "Enforce Verified Email" until email settings are configured.'
                                    )
                                )
                                return
                            }
                            if (!emailConfigured && checked === false) {
                                settingsActions.saveKey(key, 'false')
                                return
                            }
                            settingsActions.saveKey(
                                key,
                                checked ? 'true' : 'false'
                            )
                        },
                        explanatoryText,
                    },
                })
            }
            case 'checkbox':
                return Object.assign({}, fieldBase, {
                    component: Checkbox,
                    props: {
                        label: fieldBase.props.floatingLabelText,
                        sectionLabel:
                            (mapping.sectionLabel && mapping.sectionLabel) ||
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
                        isEnabled: Object.hasOwnProperty.call(
                            settingsStore.state,
                            key
                        ),
                        value:
                            fieldBase.value === 'true' ||
                            fieldBase.value === true,
                    },
                })

            case 'postButton':
                return Object.assign({}, fieldBase, {
                    component: Button,
                    props: {
                        children: fieldBase.props.floatingLabelText,
                        onClick: () => {
                            d2.Api.getApi()
                                .post(mapping.uri)
                                .then((result) => {
                                    settingsActions.load(true)
                                    settingsActions.showSnackbarMessage(
                                        result.message
                                    )
                                })
                                .catch((error) => {
                                    settingsActions.showSnackbarMessage(
                                        error.message
                                    )
                                })
                        },
                    },
                })

            case 'oauth2clients':
                return Object.assign({}, fieldBase, {
                    component: Oauth2ClientEditor,
                })

            case 'oauth2clients41':
                return Object.assign({}, fieldBase, {
                    component: Oauth2ClientEditor41,
                })

            case 'localizedAppearance':
                return Object.assign({}, fieldBase, {
                    component: LocalizedAppearance,
                })

            case 'metadataSettings':
                return {
                    ...fieldBase,
                    component: metadataSettings,
                }

            case 'periodTypes':
                return {
                    ...fieldBase,
                    component: PeriodTypes,
                }
            default:
                console.warn(
                    `Unknown control type "${mapping.type}" encountered for field "${key}"`
                )
                return null
        }
    }

    renderFields(settings) {
        const d2 = this.context.d2
        if (settings.length === 0) {
            return (
                <div style={styles.noHits}>
                    {i18n.t('No settings matched the search term')}
                </div>
            )
        }

        if (!settingsStore.state) {
            return (
                <Card className={classes.card} key={this.props.category}>
                    <CenteredContent>
                        <CircularLoader />
                    </CenteredContent>
                </Card>
            )
        }

        const fields = settings
            .map((key) => {
                const mapping = settingsKeyMapping[key]

                // Base config, common for all component types
                const validators = []
                if (mapping && mapping.validators) {
                    mapping.validators.forEach((name) => {
                        if (wordToValidatorMap.has(name)) {
                            const validator = wordToValidatorMap.get(name)
                            validators.push({
                                validator,
                                message: translateValidatorMessage(
                                    validator.message
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
                        floatingLabelText: mapping.label,
                        style: {
                            width: '100%',
                            ...addConditionallyHiddenStyles(mapping),
                        },
                        hintText: mapping.hintText,
                        type: mapping.inputType,
                        min: mapping.minValue,
                        max: mapping.maxValue,
                        helpText: mapping.helpText,
                        rowsMax: mapping.rowsMax,
                    },
                    validators,
                }

                return this.fieldForMapping({ mapping, fieldBase, key, d2, apiVersion: this.props.apiVersion })
            })
            .filter((f) => f && !!f.name)
            .map((field) => {
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
                    const component = wrapUserSettingsOverride({
                        component: field.component,
                        valueLabel: mapping.source
                            ? ((options && options[mapping.source]) || [])
                                .filter((opt) => opt.id === userSettingValue)
                                .map((opt) => opt.displayName)
                                .pop()
                            : userSettingValue,
                    })

                    return Object.assign(field, { component })
                }

                return field
            })

        return (
            <Card className={classes.card} key={this.props.category}>
                <FormBuilder
                    fields={fields}
                    onUpdateField={settingsActions.saveKey}
                />
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
    apiVersion: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
    currentSettings: PropTypes.arrayOf(PropTypes.string).isRequired,
}
SettingsFields.contextTypes = {
    d2: PropTypes.object.isRequired,
}

export default SettingsFields
