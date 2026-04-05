import i18n from '@dhis2/d2-i18n'
import { wordToValidatorMap } from 'd2-ui/lib/forms/Validators.js'

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
        default:
            return validatorMessage
    }
}

/**
 * Validators for FormBuilder and for save-time checks. Keeps UI validation and persisted values aligned.
 */
export function buildValidatorsForMapping(mapping) {
    if (!mapping) {
        return []
    }

    const validators = []

    if (mapping.validators) {
        mapping.validators.forEach((name) => {
            if (wordToValidatorMap.has(name)) {
                const validator = wordToValidatorMap.get(name)
                console.log('validator', validator.message, mapping)
                validators.push({
                    validator,
                    message: translateValidatorMessage(validator.message),
                })
            }
        })
    }

    if (mapping.minValue !== undefined || mapping.maxValue !== undefined) {
        const min = mapping.minValue
        const max = mapping.maxValue
        validators.push({
            validator: (value) => {
                if (value === '' || value === null || value === undefined) {
                    return true
                }
                const n = Number(value)
                if (Number.isNaN(n)) {
                    return false
                }
                if (min !== undefined && n < min) {
                    return false
                }
                if (max !== undefined && n > max) {
                    return false
                }
                return true
            },
            message: i18n.t('Please enter a number from {{min}} to {{max}}', {
                min: min ?? '',
                max: max ?? '',
            }),
        })
    }

    return validators
}

export function validateMappingValue(mapping, value) {
    const validators = buildValidatorsForMapping(mapping)
    for (const { validator, message } of validators) {
        if (validator(value) !== true) {
            return { valid: false, message }
        }
    }
    return { valid: true }
}
