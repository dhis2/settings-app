import React from 'react';
import PropTypes from 'prop-types';
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';
import CircularProgress from 'material-ui/CircularProgress';
import TextField from '../form-fields/text-field';
import SelectField from '../form-fields/drop-down';
import settingsStore from '../settingsStore';
import settingsActions from '../settingsActions';
import configOptionStore from '../configOptionStore';
import settingsKeyMapping from '../settingsKeyMapping';

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
 * update a default value, we need to omit the `locale` query parameter. Effectively his means that
 * updating a default appearance setting is identical to updating a regular setting, so it can just
 * be handled by the `saveSetting` function.
 */

const styles = {
    inset: {
        padding: '0 16px 8px',
        borderRadius: 2,
        boxShadow: '0px 0px 5px rgba(0,0,0,0.15), 0px 2px 3px rgba(0,0,0,0.15)',
        margin: '8px -12px 4px',
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
    }
};

const LOCALIZED_SETTING_KEYS = [
    'applicationTitle',
    'keyApplicationIntro',
    'keyApplicationNotification',
    'keyApplicationFooter',
    'keyApplicationRightFooter',
];

class LocalizedTextEditor extends React.Component {
    static getLocaleName(code) {
        return (configOptionStore.state &&
            configOptionStore.getState().uiLocales
                .filter(locale => locale.id === code)
                .map(locale => locale.displayName)
                .pop()) || '';
    }

    constructor(props, context) {
        super(props, context);

        this.state = {
            locale: settingsStore.state.keyUiLocale,
            localeName: LocalizedTextEditor.getLocaleName(settingsStore.state.keyUiLocale),
            loading: true,
            error: false,
        };

        this.settings = null;
        this.handleChange = this.handleChange.bind(this);
        this.saveSettingsKey = this.saveSettingsKey.bind(this);
        this.getTranslation = context.d2.i18n.getTranslation.bind(context.d2.i18n);
    }

    componentDidMount() {
        this.getAppearanceSettings();
    }

    getAppearanceSettings(code) {
        const locale = code || this.state.locale
        
        this.fetchLocalizedAppearanceSettings(locale).then(values => {
            this.settings = LOCALIZED_SETTING_KEYS.reduce((acc, key, i) => {
                acc[key] = values[i];
                return acc;
            }, {});

            this.setState({ loading: false, error: false });
        }).catch(() => {
            this.setState({ error: true, loading: false });
        })
    }

    fetchLocalizedAppearanceSettings(locale) {
        const api = this.context.d2.Api.getApi();
        
        return Promise.all(LOCALIZED_SETTING_KEYS.map(key => 
            api.get(`systemSettings/${key}`, { locale }).then(json => json[key])
        ));
    }

    handleChange(e) {
        const code = e.target.value;

        this.setState({
            locale: code,
            localeName: LocalizedTextEditor.getLocaleName(code),
            loading: true,
        });

        this.getAppearanceSettings(code);
    }

    saveSettingsKey(key, value) {
        this.settings[key] = value;
        settingsActions.saveKey(key, value, this.state.locale);
    }

    renderLocalizedAppearanceFields() {
        if (this.state.loading) {
            return <div style={styles.loaderWrap}><CircularProgress /></div>;
        }

        if (this.state.error) {
            return (
                <div style={styles.error}>
                    {this.getTranslation('could_not_fetch_localized_settings')}
                </div>
            );
        }

        const fields = LOCALIZED_SETTING_KEYS.map(key => ({
            name: key,
            value: (this.settings && this.settings[key]) || '',
            component: TextField,
            props: {
                floatingLabelText: `${this.getTranslation(settingsKeyMapping[key].label)} - ${this.state.localeName}`,
                changeEvent: 'onBlur',
                style: styles.field,
                multiLine: true,
            },
        }));

        return <FormBuilder fields={fields} onUpdateField={this.saveSettingsKey} />
    }

    render() {
        const optionStoreState = configOptionStore.getState();
        const uiLocales = (optionStoreState && optionStoreState.uiLocales) || [];

        return (
            <div>
                <div style={styles.inset}>
                    <SelectField
                        menuItems={uiLocales}
                        value={this.state.locale || ''}
                        floatingLabelText={this.getTranslation('select_language')}
                        onChange={this.handleChange}
                    />
                    { this.state.locale && this.renderLocalizedAppearanceFields() }
                </div>
            </div>
        );
    }
}

LocalizedTextEditor.contextTypes = {
    d2: PropTypes.object.isRequired,
};

export default LocalizedTextEditor;
