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
        <div className={styles.card}>
            <h3 className={styles.cardHeading}>Default relative period</h3>
            <div className={styles.cardBody}>
                <div className={styles.periodSelect}>
                    <SingleSelectField
                        dense
                        label="Default relative period for analysis"
                        helpText="Will be used for analytics apps when no other period is selected."
                        selected={selected}
                        onChange={({ selected: next }) =>
                            settingsActions.saveKey(
                                'keyAnalysisRelativePeriod',
                                next
                            )
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
            </div>
        </div>
    )
}

export default DefaultRelativePeriod
