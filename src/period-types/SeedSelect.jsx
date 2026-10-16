import { SingleSelect, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import settingsActions from '../settingsActions.js'

// Picks which enabled variant a relative period family is based on.
const SeedSelect = ({ group, options, settings, field, label }) => {
    const Select = field ? SingleSelectField : SingleSelect
    const selected = settings?.[group.settingKey]
    return (
        <Select
            dense
            label={field ? label : undefined}
            selected={options.some((o) => o.value === selected) ? selected : ''}
            onChange={({ selected: next }) =>
                settingsActions.saveKey(group.settingKey, next)
            }
        >
            {options.map((option) => (
                <SingleSelectOption
                    key={option.value}
                    value={option.value}
                    label={option.label}
                />
            ))}
        </Select>
    )
}

SeedSelect.propTypes = {
    group: PropTypes.shape({ settingKey: PropTypes.string }).isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({ label: PropTypes.string, value: PropTypes.string })
    ).isRequired,
    field: PropTypes.bool,
    label: PropTypes.string,
    settings: PropTypes.object,
}

export default SeedSelect
