import i18n from '@dhis2/d2-i18n'
import {
    Button,
    NoticeBox,
    SingleSelectField,
    SingleSelectOption,
    Input,
    Label,
    IconTranslate16,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import configOptionStore from '../configOptionStore.js'
import { formatPeriodDisplayName } from '../period-types/builtInPeriodNames.js'
import settingsActions from '../settingsActions.js'
import settingsStore from '../settingsStore.js'
import { useLabelState, setRelativePeriodLabel } from './labelStore.js'
import PrototypeTranslationDialog from './PrototypeTranslationDialog.jsx'
import styles from './PeriodLabels.module.css'

// settingsStore is a plain d2-ui Store, not a React store — components that
// read from it need to subscribe explicitly to see updates (see
// LocalizedTextEditor.component.jsx for the class-component precedent). This
// mirrors labelStore.js's useLabelState hook for the same reason: without it,
// the selected period type would only reflect a saved start value after a reload.
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

const periodTypeNames = (list) =>
    (list || []).map((entry) =>
        typeof entry === 'string' ? entry : entry.name
    )

const useEnabledPeriodTypes = () => {
    const [enabled, setEnabled] = useState(() =>
        periodTypeNames(configOptionStore.getState()?.dataOutputPeriodTypes)
    )

    useEffect(() => {
        const subscription = configOptionStore.subscribe((state) =>
            setEnabled(periodTypeNames(state?.dataOutputPeriodTypes))
        )
        return () => subscription.unsubscribe()
    }, [])

    return enabled
}

const RelativeLabelField = ({ period, value, onChange }) => {
    const [translateOpen, setTranslateOpen] = useState(false)

    return (
        <div className={styles.relativeLabelField}>
            <Label>{period.builtIn}</Label>
            <div className={styles.labelEditor}>
                <div className={styles.labelInput}>
                    <Input
                        dense
                        value={value}
                        onChange={({ value: next }) =>
                            onChange('default', next || '')
                        }
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
                    name={value || period.builtIn}
                    onClose={() => setTranslateOpen(false)}
                />
            )}
        </div>
    )
}

RelativeLabelField.propTypes = {
    period: PropTypes.shape({
        builtIn: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
    }).isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
}

const RelativePeriodSet = ({ set }) => {
    const labels = useLabelState()
    const settings = useSettingsState()
    const enabledTypes = new Set(useEnabledPeriodTypes())

    const options = Object.entries(set.startToPeriodType).filter(
        ([, typeName]) => enabledTypes.has(typeName)
    )
    const noneEnabled = options.length === 0

    const startValue = settings?.[set.startSetting] || ''
    const selected = options.some(([value]) => value === startValue)
        ? startValue
        : ''
    const selectedTypeName = set.startToPeriodType[selected]
    const selectionHasCustomLabel = Boolean(
        (labels.periodTypes[selectedTypeName]?.default || '').trim()
    )

    const [labelsOpen, setLabelsOpen] = useState(selectionHasCustomLabel)

    useEffect(() => {
        setLabelsOpen(selectionHasCustomLabel)
    }, [selectedTypeName, selectionHasCustomLabel])

    const hasCustomRelativeLabels = set.relativePeriods.some((period) =>
        Boolean((labels.relativePeriods[period.id]?.default || '').trim())
    )
    const hasEmptyRelativeLabels = set.relativePeriods.some(
        (period) => !(labels.relativePeriods[period.id]?.default || '').trim()
    )
    const seedName = formatPeriodDisplayName(null, selectedTypeName)
    const seedCustom = (
        labels.periodTypes[selectedTypeName]?.default || ''
    ).trim()
    const warnMissingSeedLabel =
        hasCustomRelativeLabels && !selectionHasCustomLabel
    const warnEmptyRelativeLabels =
        selectionHasCustomLabel && hasEmptyRelativeLabels

    const handleStartChange = ({ selected }) => {
        settingsActions.saveKey(set.startSetting, selected)
    }

    return (
        <div className={styles.block}>
            <div className={styles.periodSelect}>
                <SingleSelectField
                    disabled={noneEnabled}
                    label={set.periodSelectLabel}
                    selected={selected}
                    onChange={handleStartChange}
                >
                    {options.map(([value, typeName]) => {
                        const builtIn = formatPeriodDisplayName(null, typeName)
                        const custom = (
                            labels.periodTypes[typeName]?.default || ''
                        ).trim()
                        return (
                            <SingleSelectOption
                                key={value}
                                value={value}
                                label={
                                    custom ? `${builtIn} – ${custom}` : builtIn
                                }
                            />
                        )
                    })}
                </SingleSelectField>
            </div>

            {warnMissingSeedLabel && (
                <NoticeBox
                    dense
                    warning
                    className={styles.seedWarning}
                    title="No custom label on the period these are based on"
                >
                    {seedName
                        ? `${seedName} still uses its default label. Add a custom label for it above, or these relative labels may look inconsistent.`
                        : 'No period is selected to base these relative labels on.'}
                </NoticeBox>
            )}

            {warnEmptyRelativeLabels && (
                <NoticeBox
                    dense
                    warning
                    className={styles.seedWarning}
                    title={`This period uses a custom label (${seedCustom}), but some relative custom labels are empty.`}
                />
            )}

            <details
                className={styles.labelsDetails}
                open={labelsOpen}
                onToggle={(event) => setLabelsOpen(event.target.open)}
            >
                <summary className={styles.labelsSummary}>
                    Custom labels
                </summary>
                <div className={styles.relativeLabelList}>
                    {set.relativePeriods.map((period) => (
                        <RelativeLabelField
                            key={period.id}
                            period={period}
                            value={
                                labels.relativePeriods[period.id]?.default || ''
                            }
                            onChange={(languageKey, next) =>
                                setRelativePeriodLabel(
                                    period.id,
                                    languageKey,
                                    next
                                )
                            }
                        />
                    ))}
                </div>
            </details>
        </div>
    )
}

RelativePeriodSet.propTypes = {
    set: PropTypes.object.isRequired,
}

export default RelativePeriodSet
