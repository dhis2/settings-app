import i18n from '@dhis2/d2-i18n'
import {
    Button,
    Tag,
    Help,
    Input,
    Label,
    IconChevronRight24,
    IconTranslate16,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import configOptionStore from '../configOptionStore.js'
import { formatPeriodDisplayName } from '../period-types/builtInPeriodNames.js'
import settingsStore from '../settingsStore.js'
import {
    useLabelState,
    setPeriodTypeLabel,
    setRelativePeriodLabel,
} from './labelStore.js'
import styles from './PeriodLabels.module.css'
import PrototypeTranslationDialog from './PrototypeTranslationDialog.jsx'

// settingsStore and configOptionStore are plain d2-ui Stores, not React stores,
// so components that read from them subscribe explicitly to see updates.
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

const LabelField = ({ name, value, onChange }) => {
    const [translateOpen, setTranslateOpen] = useState(false)

    return (
        <div className={styles.relativeLabelField}>
            <Label>{name}</Label>
            <div className={styles.labelEditor}>
                <div className={styles.labelInput}>
                    <Input
                        dense
                        value={value}
                        onChange={({ value: next }) => onChange(next || '')}
                    />
                </div>
                <Button
                    small
                    className={styles.translateButton}
                    icon={<IconTranslate16 />}
                    title={i18n.t('Translate')}
                    onClick={() => setTranslateOpen(true)}
                />
            </div>
            {translateOpen && (
                <PrototypeTranslationDialog
                    name={value || name}
                    onClose={() => setTranslateOpen(false)}
                />
            )}
        </div>
    )
}

LabelField.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
}

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

    // Collapsed by default; opened automatically for any family that already
    // has custom labels so existing customisation is visible at a glance.
    const [open, setOpen] = useState(customCount > 0)
    useEffect(() => {
        if (customCount > 0) {
            setOpen(true)
        }
    }, [customCount])

    // Option A: for start-based families the relative labels apply to whichever
    // start variant is selected in the "Relative periods" section. We only read
    // that selection to caption it — it is changed there, not here.
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
