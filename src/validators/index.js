import i18n from '@dhis2/d2-i18n'

const isInteger = (value) => {
    if (typeof value !== 'string') {
        return false
    }

    return (
        !isNaN(value) &&
        parseInt(Number(value)) === Number(value) &&
        !isNaN(parseInt(value, 10))
    )
}

export function credentialsExpiresReminderInDaysValidator(value) {
    if (!isInteger(value)) {
        return false
    }

    const valueAsInt = parseInt(value)

    return valueAsInt >= 1 && valueAsInt <= 28
}

credentialsExpiresReminderInDaysValidator.message = i18n.t(
    'This field should contain a round number between 1 and 28'
)
