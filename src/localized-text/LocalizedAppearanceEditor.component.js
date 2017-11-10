import React from 'react';

import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';

import TextField from '../form-fields/text-field';
import SelectField from '../form-fields/drop-down';

import settingsActions from '../settingsActions';
import settingsStore from '../settingsStore';
import configOptionStore from '../configOptionStore';
import settingsKeyMappingI18next from '../settingsKeyMappingI18next';

import i18next from 'i18next';

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
            configOptionStore.getState().locales
                .filter(locale => locale.id === code)
                .map(locale => locale.displayName)
                .pop()) || '';
    }

    constructor(props, context) {
        super(props, context);

        this.state = {
            locale: context.d2.currentUser.uiLocale,
            localeName: LocalizedTextEditor.getLocaleName(context.d2.currentUser.uiLocale),
        };

        this.handleChange = this.handleChange.bind(this);
        this.saveSettingsKey = this.saveSettingsKey.bind(this);
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

    render() {
        const keys = [
            'applicationTitle',
            'keyApplicationIntro',
            'keyApplicationNotification',
            'keyApplicationFooter',
            'keyApplicationRightFooter',
        ];

        const settingsKeyMapping = settingsKeyMappingI18next(i18next);
        const localeAppendage = this.state.locale === 'en' ? '' : this.state.locale;

        const fields = keys.map(key => ({
            name: key,
            value: (settingsStore.state && settingsStore.state[key + localeAppendage]) || '',
            component: TextField,
            props: {
                floatingLabelText: `${settingsKeyMapping[key].label} - ${this.state.localeName}`,
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
                        menuItems={(options && options.locales) || []}
                        value={this.state.locale || ''}
                        floatingLabelText={i18next.t('Select language')}
                        onChange={this.handleChange}
                    />
                    <FormBuilder fields={fields} onUpdateField={this.saveSettingsKey} />
                </div>
            </div>
        );
    }
}
LocalizedTextEditor.contextTypes = {
    d2: React.PropTypes.object.isRequired,
};

export default LocalizedTextEditor;
