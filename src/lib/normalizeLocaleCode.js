/**
 * Normalizes locale codes from API/database format to i18n format.
 * Converts uz-UZ-x-lvariant-Cyrl → uz_UZ_Cyrl and uz-UZ-x-lvariant-Latn → uz_UZ_Latn
 *
 * @param {string} localeCode - The locale code to normalize
 * @returns {string} The normalized locale code, or the original if no normalization is needed
 */
const normalizeLocaleCode = (localeCode) => {
    if (!localeCode) {
        return localeCode
    }

    if (localeCode.includes('-') && localeCode.includes('x-lvariant')) {
        const parts = localeCode.split('-')
        if (parts[0] === 'uz') {
            const scriptIndex = parts.findIndex(
                (part) => part === 'Cyrl' || part === 'Latn'
            )
            if (scriptIndex !== -1) {
                const script = parts[scriptIndex]
                return script === 'Cyrl' ? 'uz_UZ_Cyrl' : 'uz_UZ_Latn'
            }
        }
    }

    return localeCode
}

export default normalizeLocaleCode
