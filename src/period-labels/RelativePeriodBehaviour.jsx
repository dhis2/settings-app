import { SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import settingsActions from '../settingsActions.js'
import settingsKeyMapping from '../settingsKeyMapping.js'
import settingsStore from '../settingsStore.js'
import DefaultRelativePeriod from './DefaultRelativePeriod.jsx'
import styles from './PeriodLabels.module.css'

const useSettingsState = () => {
    const [state, setState] = useState(() => settingsStore.state)

    useEffect(() => {
        const subscription = settingsStore.subscribe(() =>
            setState({ ...settingsStore.state })
        )
        return () => subscription.unsubscribe()
    }, [])

    return state
}

const resolveOptions = (mapping, apiVersion) =>
    typeof mapping.options === 'function'
        ? mapping.options(apiVersion)
        : mapping.options

const StartSelect = ({ settingKey, apiVersion }) => {
    const settings = useSettingsState()
    const mapping = settingsKeyMapping[settingKey]
    const options = resolveOptions(mapping, apiVersion)
    const selected = settings?.[settingKey] || ''

    return (
        <div className={styles.periodSelect}>
            <SingleSelectField
                label={mapping.label}
                selected={selected}
                onChange={({ selected: next }) =>
                    settingsActions.saveKey(settingKey, next)
                }
            >
                {Object.entries(options).map(([value, label]) => (
                    <SingleSelectOption
                        key={value}
                        value={value}
                        label={label}
                    />
                ))}
            </SingleSelectField>
        </div>
    )
}

StartSelect.propTypes = {
    apiVersion: PropTypes.number,
    settingKey: PropTypes.string,
}

const RelativePeriodBehaviour = ({ apiVersion }) => (
    <div className={styles.sectionBody}>
        <DefaultRelativePeriod />
        <StartSelect settingKey="analyticsWeeklyStart" apiVersion={apiVersion} />
        <StartSelect
            settingKey="analyticsFinancialYearStart"
            apiVersion={apiVersion}
        />
    </div>
)

RelativePeriodBehaviour.propTypes = {
    apiVersion: PropTypes.number,
}

export default RelativePeriodBehaviour
