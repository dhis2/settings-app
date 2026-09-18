import i18n from '@dhis2/d2-i18n'
import { Tag, Help, IconChevronRight24 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import configOptionStore from '../configOptionStore.js'
import { formatPeriodDisplayName } from '../period-types/builtInPeriodNames.js'
import settingsStore from '../settingsStore.js'
import LabelField from './LabelField.jsx'
import {
    useLabelState,
    setPeriodTypeLabel,
    setRelativePeriodLabel,
} from './labelStore.js'
import styles from './PeriodLabels.module.css'

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

const periodTypeNames = (list) =>
    (list || []).map((entry) =>
        typeof entry === 'string' ? entry : entry.name
    )

const PeriodLabelFamily = ({ family }) => {
    const labels = useLabelState()
    const settings = useStoreState(settingsStore)
    const config = useStoreState(configOptionStore)
    const enabledSet = new Set(periodTypeNames(config?.dataOutputPeriodTypes))

    const enabledTypeNames = family.periodTypeNames.filter((name) =>
        enabledSet.has(name)
    )

    const hasCustom = (group, id) =>
        Boolean((labels[group][id]?.default || '').trim())

    const customCount =
        enabledTypeNames.filter((name) => hasCustom('periodTypes', name))
            .length +
        family.relativePeriods.filter((period) =>
            hasCustom('relativePeriods', period.id)
        ).length

    const [open, setOpen] = useState(customCount > 0)
    useEffect(() => {
        if (customCount > 0) {
            setOpen(true)
        }
    }, [customCount])

    const isStartBased = Boolean(family.startSetting)
    const selectedTypeName = isStartBased
        ? family.startToPeriodType[settings?.[family.startSetting] || '']
        : undefined
    const startVariantName = selectedTypeName
        ? formatPeriodDisplayName(null, selectedTypeName)
        : ''

    return (
        <details
            className={styles.family}
            open={open}
            onToggle={(event) => setOpen(event.target.open)}
        >
            <summary className={styles.familySummary}>
                <IconChevronRight24 />
                <span className={styles.familyName}>{family.label}</span>
                {customCount > 0 && (
                    <Tag positive>
                        {i18n.t('{{count}} custom', { count: customCount })}
                    </Tag>
                )}
            </summary>

            <div className={styles.familyBody}>
                {enabledTypeNames.length > 0 && (
                    <>
                        <p className={styles.subhead}>{i18n.t('Period types')}</p>
                        <div className={styles.relativeLabelList}>
                            {enabledTypeNames.map((name) => (
                                <LabelField
                                    key={name}
                                    name={formatPeriodDisplayName(null, name)}
                                    value={
                                        labels.periodTypes[name]?.default || ''
                                    }
                                    onChange={(next) =>
                                        setPeriodTypeLabel(name, 'default', next)
                                    }
                                />
                            ))}
                        </div>
                    </>
                )}

                <p className={styles.subhead}>{i18n.t('Relative periods')}</p>
                {isStartBased && startVariantName && (
                    <Help>
                        {i18n.t('Based on {{label}}: {{variant}}', {
                            label: family.startCaptionLabel,
                            variant: startVariantName,
                        })}
                    </Help>
                )}
                <div className={styles.relativeLabelList}>
                    {family.relativePeriods.map((period) => (
                        <LabelField
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
                </div>
            </div>
        </details>
    )
}

PeriodLabelFamily.propTypes = {
    family: PropTypes.object.isRequired,
}

export default PeriodLabelFamily
