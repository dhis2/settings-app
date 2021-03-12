import i18n from '@dhis2/d2-i18n'
import { Card } from '@dhis2/ui'
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component'
import CircularProgress from 'material-ui/CircularProgress'
import PropTypes from 'prop-types'
import React from 'react'
import configOptionStore from '../configOptionStore'
import SelectField from '../form-fields/drop-down'
import TextField from '../form-fields/text-field'
import settingsActions from '../settingsActions'
import settingsKeyMapping from '../settingsKeyMapping'
import settingsStore from '../settingsStore'

const systemDefaultText = i18n.t('System default (fallback)')

/**
 * To understand why this component works the way it does, some background knowledge is required:
 *
 * The default values of these appearance settings cannot be fetched via `/systemSettings/<key>`
 * because this keyed endpoint applies translation. However, the default values for the appearance
 * settings can be obtained when calling `/systemSettings`, because this endpoint doesn't apply
 * translations. As such, the default values are already present in the `settingsStore`.
 *
 * When posting settings for a specific locale, we need to add a `locale` query parameter like so:
 * `/systemSettings/<key>?locale=<locale>`. To make this work a dedicated function has been created
 * in `src/settingsActions.js` called `saveLocalizedAppearanceSetting`. However, when we want to
 * update a default value, we need to omit the `locale` query parameter. Effectively this means that
 * updating a default appearance setting is identical to updating a regular setting, so it can just
 * be handled by the `saveSetting` function.
 */

const styles = {
    container: {
        padding: '0 var(--spacers-dp16) var(--spacers-dp8)',
    },
    field: {
        width: '100%',
    },
    loaderWrap: {
        textAlign: 'center',
        padding: 12,
    },
    error: {
        color: 'red',
        padding: 12,
    },
    clickableHelpText: {
        color: '#3162C5',
        textDecoration: 'underline',
        cursor: 'pointer',
    },
}
const SYSTEM_DEFAULT = '@@__SYSTEM_DEFAULT__@@'

const LOCALIZED_SETTING_KEYS = [
    'applicationTitle',
    'keyApplicationIntro',
    'keyApplicationNotification',
    'keyApplicationFooter',
    'keyApplicationRightFooter',
]

class LocalizedTextEditor extends React.Component {
    static getLocaleName(code) {
        return (
            (configOptionStore.state &&
                configOptionStore
                    .getState()
                    .uiLocales.filter(locale => locale.id === code)
                    .map(locale => locale.displayName)
                    .pop()) ||
            ''
        )
    }

    constructor(props, context) {
        super(props, context)

        this.state = {
            locale: settingsStore.state && settingsStore.state.keyUiLocale,
            localeName:
                settingsStore.state &&
                LocalizedTextEditor.getLocaleName(
                    settingsStore.state.keyUiLocale
                ),
            settings: null,
            error: false,
        }

        this.handleChange = this.handleChange.bind(this)
        this.saveSettingsKey = this.saveSettingsKey.bind(this)
    }

    componentDidMount() {
        this.getAppearanceSettings()
        this.settingsStoreSubscription = settingsStore.subscribe(() => {
            this.setState({
                locale: settingsStore.state.keyUiLocale,
                localeName: LocalizedTextEditor.getLocaleName(
                    settingsStore.state.keyUiLocale
                ),
            })
        })
    }

    componentWillUnmount() {
        if (this.settingsStoreSubscription) {
            this.settingsStoreSubscription.unsubscribe()
        }
    }

    getAppearanceSettings(code) {
        const locale = code || this.state.locale
        const promise =
            locale === SYSTEM_DEFAULT
                ? Promise.resolve(
                      LOCALIZED_SETTING_KEYS.map(
                          key => settingsStore.state[key]
                      )
                  )
                : this.fetchLocalizedAppearanceSettings(locale)

        promise
            .then(values => {
                const settings = LOCALIZED_SETTING_KEYS.reduce(
                    (acc, key, i) => {
                        acc[key] = values[i]
                        return acc
                    },
                    {}
                )

                this.setState({ settings, error: false })
            })
            .catch(() => {
                this.setState({ error: true, settings: null })
            })
    }

    fetchLocalizedAppearanceSettings(locale) {
        const api = this.context.d2.Api.getApi()

        return Promise.all(
            LOCALIZED_SETTING_KEYS.map(key =>
                api
                    .get(`systemSettings/${key}`, { locale })
                    .then(json => json[key])
            )
        )
    }

    handleChange(e) {
        const code = e.target.value

        this.setState({
            locale: code,
            localeName: LocalizedTextEditor.getLocaleName(code),
            settings: null,
        })

        this.getAppearanceSettings(code)
    }

    switchToDefaultLocale = () => {
        this.handleChange({ target: { value: SYSTEM_DEFAULT } })
    }

    saveSettingsKey(key, value) {
        this.setState({
            settings: {
                ...this.state.settings,
                [key]: value,
            },
        })
        const locale =
            this.state.locale === SYSTEM_DEFAULT ? null : this.state.locale
        settingsActions.saveKey(key, value, locale)
    }

    createFieldHelpTextProps = fieldKey => {
        const defaultValue = settingsStore.state[fieldKey]
        const { locale } = this.state

        if (locale === SYSTEM_DEFAULT) {
            return null
        }

        if (defaultValue) {
            return {
                helpText: `${systemDefaultText}: ${defaultValue}`,
            }
        }

        return {
            disabled: true,
            helpText: (
                <span
                    style={styles.clickableHelpText}
                    onClick={this.switchToDefaultLocale}
                >
                    {i18n.t(
                        'Set the main field value before adding a translation'
                    )}
                </span>
            ),
        }
    }

    renderLocalizedAppearanceFields() {
        if (!this.state.settings && !this.state.error) {
            return (
                <div style={styles.loaderWrap}>
                    <CircularProgress />
                </div>
            )
        }

        if (this.state.error) {
            return (
                <div style={styles.error}>
                    {i18n.t('Could not fetch localized settings')}
                </div>
            )
        }

        const fields = LOCALIZED_SETTING_KEYS.map(key => ({
            name: key,
            value: this.state.settings[key] || '',
            component: TextField,
            props: {
                floatingLabelText: `${settingsKeyMapping[key].label} – ${
                    this.state.localeName || systemDefaultText
                }`,
                changeEvent: 'onBlur',
                style: styles.field,
                multiLine: true,
                ...this.createFieldHelpTextProps(key),
            },
        }))

        return (
            <FormBuilder fields={fields} onUpdateField={this.saveSettingsKey} />
        )
    }

    render() {
        const systemDefaultOption = {
            id: SYSTEM_DEFAULT,
            displayName: systemDefaultText,
        }
        const optionStoreState = configOptionStore.getState()
        const uiLocales = (optionStoreState && optionStoreState.uiLocales) || []
        const options = [systemDefaultOption, ...uiLocales]

        return (
            <Card>
                <div style={styles.container}>
                    <SelectField
                        menuItems={options}
                        value={this.state.locale || ''}
                        floatingLabelText={i18n.t('Select language')}
                        onChange={this.handleChange}
                    />
                    {this.state.locale &&
                        this.renderLocalizedAppearanceFields()}
                </div>
            </Card>
        )
    }
}

LocalizedTextEditor.contextTypes = {
    d2: PropTypes.object.isRequired,
}

export default LocalizedTextEditor
