import { SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import React, { useState, useEffect } from 'react'
import settingsActions from '../settingsActions.js'
import settingsKeyMapping from '../settingsKeyMapping.js'
import settingsStore from '../settingsStore.js'
import { useLabelState } from './labelStore.js'
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

const DefaultRelativePeriod = () => {
    useLabelState()
    const settings = useSettingsState()
    const options = settingsKeyMapping.keyAnalysisRelativePeriod.options()
    const selected = settings?.keyAnalysisRelativePeriod || ''

    return (
        <div className={styles.periodSelect}>
            <SingleSelectField
                label="Default relative period for analysis"
                helpText="Used in analytics apps when no period is chosen."
                selected={selected}
                onChange={({ selected: next }) =>
                    settingsActions.saveKey('keyAnalysisRelativePeriod', next)
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

export default DefaultRelativePeriod
