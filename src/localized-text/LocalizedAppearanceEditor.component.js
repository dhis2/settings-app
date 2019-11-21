import React from 'react';
import PropTypes from 'prop-types';
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';
import TextField from '../form-fields/text-field';
import SelectField from '../form-fields/drop-down';
import settingsActions from '../settingsActions';
import settingsStore from '../settingsStore';
import configOptionStore from '../configOptionStore';
import settingsKeyMapping from '../settingsKeyMapping';

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
};

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
        };

        this.handleChange = this.handleChange.bind(this);
        this.saveSettingsKey = this.saveSettingsKey.bind(this);
        this.getTranslation = context.d2.i18n.getTranslation.bind(context.d2.i18n);
    }

    handleChange(e) {
        this.setState({
            locale: e.target.value,
            localeName: LocalizedTextEditor.getLocaleName(e.target.value),
        });
    }

    saveSettingsKey(key, value) {
        if (this.state.locale === 'en') {
            settingsActions.saveKey(key, value);
        } else {
            settingsActions.saveKey([key, this.state.locale], value);
        }
    }

    /* eslint-disable complexity */
    render() {
        const keys = [
            'applicationTitle',
            'keyApplicationIntro',
            'keyApplicationNotification',
            'keyApplicationFooter',
            'keyApplicationRightFooter',
        ];
        const localeAppendage = this.state.locale === 'en' ? '' : this.state.locale;

        const fields = keys.map(key => ({
            name: key,
            value: (settingsStore.state && settingsStore.state[key + localeAppendage]) || '',
            component: TextField,
            props: {
                floatingLabelText: `${this.getTranslation(settingsKeyMapping[key].label)} - ${this.state.localeName}`,
                changeEvent: 'onBlur',
                style: styles.field,
                multiLine: true,
            },
        }));

        const options = configOptionStore.getState();
        return (
            <div>
                <div style={styles.inset}>
                    <SelectField
                        menuItems={(options && options.uiLocales) || []}
                        value={this.state.locale || ''}
                        floatingLabelText={this.getTranslation('select_language')}
                        onChange={this.handleChange}
                    />
                    { this.state.locale && <FormBuilder fields={fields} onUpdateField={this.saveSettingsKey} /> }
                </div>
            </div>
        );
    }
    /* eslint-enable */
}
LocalizedTextEditor.contextTypes = {
    d2: PropTypes.object.isRequired,
};

export default LocalizedTextEditor;
