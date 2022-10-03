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

export function createIntegerRangeValidator(min, max) {
    function integerRangeValidator(value) {
        if (!isInteger(value)) {
            return false
        }

        const valueAsInt = parseInt(value)

        return valueAsInt >= min && valueAsInt <= max
    }
    integerRangeValidator.message = i18n.t(
        'This field should contain a round number between {{min}} and {{max}}',
        { min, max }
    )
    return integerRangeValidator
}
