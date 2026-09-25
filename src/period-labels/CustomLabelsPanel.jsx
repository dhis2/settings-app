import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { formatPeriodDisplayName } from '../period-types/builtInPeriodNames.js'
import settingsStore from '../settingsStore.js'
import { LabelEditor } from './LabelField.jsx'
import {
    setPeriodTypeLabel,
    setRelativePeriodLabel,
    useLabelState,
} from './labelStore.js'
import styles from './PeriodLabels.module.css'

const LabelRow = ({ name, label, value, onChange }) => (
    <>
        <span className={styles.panelLabelName}>{label || name}</span>
        <LabelEditor name={name} value={value} onChange={onChange} />
    </>
)

LabelRow.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    value: PropTypes.string,
}

const useStoreState = (store) => {
    const [state, setState] = useState(() => store.getState?.() ?? store.state)

    useEffect(() => {
        const subscription = store.subscribe((next) =>
            setState(next ? { ...next } : { ...store.state })
        )
        return () => subscription.unsubscribe()
    }, [store])

    return state
}

// Inline editor shown in an expanded row of the period types table. Only the
// translation dialog opens on top of it, so there is never a modal-on-modal.
const CustomLabelsPanel = ({ periodTypeName, family, onDone }) => {
    const labels = useLabelState()
    const settings = useStoreState(settingsStore)
    const displayName = formatPeriodDisplayName(null, periodTypeName)
    const selectedSeedType = family?.startSetting
        ? family.startToPeriodType[settings?.[family.startSetting] || '']
        : periodTypeName
    const showRelativeLabels =
        family?.relativePeriods?.length > 0 &&
        (!family.startSetting || selectedSeedType === periodTypeName)

    return (
        <div className={styles.panel}>
            {showRelativeLabels && (
                <span className={styles.panelSectionHead}>
                    {i18n.t('Period type')}
                </span>
            )}
            <LabelRow
                name={displayName}
                label={i18n.t('Custom label')}
                value={labels.periodTypes[periodTypeName]?.default || ''}
                onChange={(next) =>
                    setPeriodTypeLabel(periodTypeName, 'default', next)
                }
            />
            {showRelativeLabels && (
                <>
                    <span className={styles.panelSectionHead}>
                        {i18n.t('Relative periods')}
                    </span>
                    {family.relativePeriods.map((period) => (
                        <LabelRow
                            key={period.id}
                            name={period.builtIn}
                            value={
                                labels.relativePeriods[period.id]?.default || ''
                            }
                            onChange={(next) =>
                                setRelativePeriodLabel(
                                    period.id,
                                    'default',
                                    next
                                )
                            }
                        />
                    ))}
                </>
            )}
            <div className={styles.panelActions}>
                <Button small onClick={onDone}>
                    {i18n.t('Done')}
                </Button>
            </div>
        </div>
    )
}

CustomLabelsPanel.propTypes = {
    periodTypeName: PropTypes.string.isRequired,
    onDone: PropTypes.func.isRequired,
    family: PropTypes.object,
}

export default CustomLabelsPanel
