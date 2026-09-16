import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    CenteredContent,
    CircularLoader,
    Checkbox,
    Input,
    Button,
    SingleSelect,
    SingleSelectOption,
    IconChevronRight24,
    IconTranslate16,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import configOptionStore from '../configOptionStore.js'
import {
    useLabelState,
    setPeriodTypeLabel,
    setRelativePeriodLabel,
} from '../period-labels/labelStore.js'
import {
    PERIOD_FAMILIES,
    PERIOD_TYPE_LABELS,
} from '../period-labels/periodFamilies.js'
import PrototypeTranslationDialog from '../period-labels/PrototypeTranslationDialog.jsx'
import { formatPeriodDisplayName } from '../period-types/builtInPeriodNames.js'
import settingsActions from '../settingsActions.js'
import settingsKeyMapping from '../settingsKeyMapping.js'
import settingsStore from '../settingsStore.js'
import styles from './PeriodMatrix.module.css'

const query = {
    periodTypes: {
        resource: 'periodTypes',
        params: { fields: 'name,displayName,frequencyOrder' },
    },
    dataOutputPeriodTypes: {
        resource: 'configuration/dataOutputPeriodTypes',
    },
}

// Yearly must always stay enabled — mirrors the rule in the old period-type grid.
const MANDATORY = new Set(['Yearly'])

const asNames = (list) =>
    (list || []).map((entry) => (typeof entry === 'string' ? entry : entry.name))

const useSettingsState = () => {
    const [state, setState] = useState(() => settingsStore.state)
    useEffect(() => {
        const sub = settingsStore.subscribe(() =>
            setState({ ...settingsStore.state })
        )
        return () => sub.unsubscribe()
    }, [])
    return state
}

const typeLabel = (name) =>
    PERIOD_TYPE_LABELS[name] || formatPeriodDisplayName(null, name)

const LabelRow = ({ name, value, onChange }) => {
    const [translateOpen, setTranslateOpen] = useState(false)

    return (
        <div className={styles.labelRow}>
            <span className={styles.labelName}>{name}</span>
            <div className={styles.labelEditor}>
                <div className={styles.labelInput}>
                    <Input
                        dense
                        value={value}
                        placeholder={name}
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

LabelRow.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
}

const StartSelect = ({
    settingKey,
    value,
    apiVersion,
    enabledTypes,
    startToPeriodType,
}) => {
    const mapping = settingsKeyMapping[settingKey]
    const options =
        typeof mapping.options === 'function'
            ? mapping.options(apiVersion)
            : mapping.options
    const enabled = new Set(enabledTypes)
    const filtered = Object.entries(options).filter(([val]) =>
        enabled.has(startToPeriodType[val])
    )
    if (filtered.length <= 1) {
        return null
    }
    const selected = filtered.some(([val]) => val === value)
        ? value
        : filtered[0]?.[0] || ''
    return (
        <div className={styles.startSelect}>
            <SingleSelect
                dense
                prefix={i18n.t('Relative period start day')}
                selected={selected}
                onChange={({ selected: next }) =>
                    settingsActions.saveKey(settingKey, next)
                }
            >
                {filtered.map(([val, label]) => (
                    <SingleSelectOption key={val} value={val} label={label} />
                ))}
            </SingleSelect>
        </div>
    )
}

StartSelect.propTypes = {
    settingKey: PropTypes.string.isRequired,
    startToPeriodType: PropTypes.object.isRequired,
    apiVersion: PropTypes.number,
    enabledTypes: PropTypes.arrayOf(PropTypes.string),
    value: PropTypes.string,
}

const PeriodMatrix = () => {
    const { loading, data } = useDataQuery(query)
    const { baseUrl, apiVersion } = useConfig()
    const labels = useLabelState()
    const settings = useSettingsState()

    const [allowed, setAllowed] = useState([])
    const [updating, setUpdating] = useState(false)
    const [openLabels, setOpenLabels] = useState(() => new Set())

    useEffect(() => {
        if (data?.dataOutputPeriodTypes) {
            setAllowed(data.dataOutputPeriodTypes)
            configOptionStore.setState({
                ...configOptionStore.state,
                dataOutputPeriodTypes: data.dataOutputPeriodTypes,
            })
        }
    }, [data?.dataOutputPeriodTypes])

    const saveEnabled = async (nextSet) => {
        const list = Array.from(nextSet).map((name) => ({ name }))
        setUpdating(true)
        try {
            const response = await fetch(
                `${baseUrl}/api/${apiVersion}/configuration/dataOutputPeriodTypes`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(list),
                }
            )
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }
            setAllowed(list)
            configOptionStore.setState({
                ...configOptionStore.state,
                dataOutputPeriodTypes: list,
            })
            settingsActions.showSnackbarMessage(i18n.t('Settings updated'))
        } catch (error) {
            console.error('Failed to update period types:', error)
            settingsActions.showSnackbarMessage(
                i18n.t(
                    'There was a problem updating settings. Changes have not been saved.'
                )
            )
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    const hiddenTypes = new Set(['TwoYearly'])
    const existingNames = new Set(
        (data?.periodTypes?.periodTypes || [])
            .filter((pt) => !hiddenTypes.has(pt.name))
            .map((pt) => pt.name)
    )
    const enabledSet = new Set(asNames(allowed))

    const toggleNames = (names, enable) => {
        const next = new Set(enabledSet)
        names.forEach((name) => {
            if (enable) {
                next.add(name)
            } else if (!MANDATORY.has(name)) {
                next.delete(name)
            }
        })
        saveEnabled(next)
    }

    const setLabelsOpen = (id, isOpen) => {
        setOpenLabels((prev) => {
            const next = new Set(prev)
            if (isOpen) {
                next.add(id)
            } else {
                next.delete(id)
            }
            return next
        })
    }

    return (
        <div className={styles.wrapper}>
            {PERIOD_FAMILIES.map((family) => {
                const existingTypes = family.periodTypeNames.filter((name) =>
                    existingNames.has(name)
                )
                if (existingTypes.length === 0) {
                    return null
                }
                const enabledTypes = existingTypes.filter((name) =>
                    enabledSet.has(name)
                )

                return (
                    <div
                        key={family.id}
                        className={`${styles.family} ${
                            enabledTypes.length > 0 ? styles.familyActive : ''
                        }`}
                    >
                        <h3 className={styles.famName}>{family.label}</h3>

                        <div className={styles.typeList}>
                            {existingTypes.map((name) => (
                                <Checkbox
                                    key={name}
                                    dense
                                    label={typeLabel(name)}
                                    checked={enabledSet.has(name)}
                                    disabled={updating || MANDATORY.has(name)}
                                    onChange={() =>
                                        toggleNames(
                                            [name],
                                            !enabledSet.has(name)
                                        )
                                    }
                                />
                            ))}
                        </div>

                        {enabledTypes.length > 0 && family.startSetting && (
                            <StartSelect
                                settingKey={family.startSetting}
                                apiVersion={apiVersion}
                                value={settings?.[family.startSetting]}
                                enabledTypes={enabledTypes}
                                startToPeriodType={family.startToPeriodType}
                            />
                        )}

                        {enabledTypes.length > 0 && (
                        <details
                            className={styles.labelsAcc}
                            open={openLabels.has(family.id)}
                            onToggle={(event) =>
                                setLabelsOpen(family.id, event.target.open)
                            }
                        >
                            <summary className={styles.labelsSummary}>
                                <span className={styles.chev}>
                                    <IconChevronRight24 />
                                </span>
                                {i18n.t('Custom labels')}
                            </summary>

                            <div className={styles.labelsBody}>
                                <p className={styles.labelsSubhead}>
                                    {i18n.t('Period types')}
                                </p>
                                {enabledTypes.map((name) => (
                                    <LabelRow
                                        key={name}
                                        name={typeLabel(name)}
                                        value={
                                            labels.periodTypes[name]?.default ||
                                            ''
                                        }
                                        onChange={(next) =>
                                            setPeriodTypeLabel(
                                                name,
                                                'default',
                                                next
                                            )
                                        }
                                    />
                                ))}

                                <p className={styles.labelsSubhead}>
                                    {i18n.t('Relative periods')}
                                </p>
                                {family.relativePeriods.map((period) => (
                                    <LabelRow
                                        key={period.id}
                                        name={period.builtIn}
                                        value={
                                            labels.relativePeriods[period.id]
                                                ?.default || ''
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
                        </details>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default PeriodMatrix
