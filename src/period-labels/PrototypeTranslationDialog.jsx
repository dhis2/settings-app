import { TranslationDialog } from '@dhis2/analytics'
import { CustomDataProvider, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import configOptionStore from '../configOptionStore.js'

// PROTOTYPE: this is the real @dhis2/analytics TranslationDialog — the same
// component we intend to ship — but period labels have no backing API object,
// and the dialog would otherwise PUT to `{object}/translations` on save.
//
// So we render it inside a CustomDataProvider scoped to this subtree only. That
// swaps the data engine for the dialog (nothing else in the app is affected)
// and lets us stub every request it makes:
//   - load existing translations  -> empty
//   - load locales                -> the instance's UI locales
//   - fetch field labels (i18n)   -> a static label
//   - SAVE translations           -> resolved as a no-op, writing nothing
// The dialog looks and behaves exactly as it will in production; only the
// persistence is neutered.

// A well-formed but fictitious resource so the dialog's href parsing succeeds
// without pointing at any real object.
const FAKE_RESOURCE = 'prototypePeriodLabel/PROTO'
const TRANSLATIONS_RESOURCE = `${FAKE_RESOURCE}/translations`

// The dialog restores its last-used locale from sessionStorage (a key shared
// with the real dialog), then feeds it to a SingleSelect that throws if no
// option matches. So the mocked locale list must always contain that stored
// value, even when it isn't among the instance's UI locales.
const SELECTED_LOCALE_KEY = 'translation-dialog-selected-locale'

const localeOptions = () => {
    const options = (configOptionStore.getState()?.uiLocales || []).map(
        (locale) => ({
            locale: locale.id,
            name: locale.displayName,
        })
    )

    let stored
    try {
        stored = window.sessionStorage.getItem(SELECTED_LOCALE_KEY)
    } catch (error) {
        stored = null
    }
    if (stored && !options.some((option) => option.locale === stored)) {
        options.unshift({ locale: stored, name: stored })
    }

    return options
}

const PrototypeTranslationDialog = ({ name, onClose }) => {
    const { baseUrl, apiVersion } = useConfig()

    const mockData = {
        // Same resource for the load (query) and the save (mutation); branch on
        // type so the save resolves to a no-op instead of hitting the server.
        [TRANSLATIONS_RESOURCE]: (type) =>
            type === 'update' ? {} : { translations: [] },
        'locales/db': localeOptions(),
        i18n: { name: i18n.t('Name') },
    }

    return (
        <CustomDataProvider data={mockData} options={{ failOnMiss: false }}>
            <TranslationDialog
                objectToTranslate={{
                    name,
                    href: `${baseUrl}/api/${apiVersion}/${FAKE_RESOURCE}`,
                }}
                fieldsToTranslate={['name']}
                onClose={onClose}
                onTranslationSaved={onClose}
            />
        </CustomDataProvider>
    )
}

PrototypeTranslationDialog.propTypes = {
    name: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default PrototypeTranslationDialog
