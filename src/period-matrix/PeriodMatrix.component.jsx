import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    CenteredContent,
    CircularLoader,
    Checkbox,
    Input,
    SingleSelectField,
    SingleSelectOption,
    Tag,
    IconChevronRight24,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import configOptionStore from '../configOptionStore.js'
import {
    useLabelState,
    setPeriodTypeLabel,
    setRelativePeriodLabel,
} from '../period-labels/labelStore.js'
import { PERIOD_FAMILIES } from '../period-labels/periodFamilies.js'
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

const hasLabel = (entry) => Boolean((entry?.default || '').trim())

const LabelInput = ({ value, placeholder, disabled, onChange }) => (
    <div className={styles.labelInput}>
        <Input
            dense
            disabled={disabled}
            value={value}
            placeholder={placeholder}
            onChange={({ value: next }) => onChange(next || '')}
        />
    </div>
)

LabelInput.propTypes = {
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    value: PropTypes.string,
}

const StartSelect = ({ settingKey, value, apiVersion }) => {
    const mapping = settingsKeyMapping[settingKey]
    const options =
        typeof mapping.options === 'function'
            ? mapping.options(apiVersion)
            : mapping.options
    return (
        <div className={styles.startSelect}>
            <SingleSelectField
                dense
                label={mapping.label}
                selected={value || ''}
                onChange={({ selected }) =>
                    settingsActions.saveKey(settingKey, selected)
                }
            >
                {Object.entries(options).map(([val, label]) => (
                    <SingleSelectOption key={val} value={val} label={label} />
                ))}
            </SingleSelectField>
        </div>
    )
}

StartSelect.propTypes = {
    settingKey: PropTypes.string.isRequired,
    apiVersion: PropTypes.number,
    value: PropTypes.string,
}

const PeriodMatrix = () => {
    const { loading, data } = useDataQuery(query)
    const { baseUrl, apiVersion } = useConfig()
    const labels = useLabelState()
    const settings = useSettingsState()

    const [allowed, setAllowed] = useState([])
    const [updating, setUpdating] = useState(false)
    const [openFamilies, setOpenFamilies] = useState(() => new Set())

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

    const toggleFamily = (id) => {
        setOpenFamilies((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.toolbar}>
                <SingleSelectField
                    dense
                    className={styles.defaultSelect}
                    label={i18n.t('Default relative period for analysis')}
                    helpText={i18n.t(
                        'Used in analytics apps when no period is chosen.'
                    )}
                    selected={settings?.keyAnalysisRelativePeriod || ''}
                    onChange={({ selected }) =>
                        settingsActions.saveKey(
                            'keyAnalysisRelativePeriod',
                            selected
                        )
                    }
                >
                    {Object.entries(
                        settingsKeyMapping.keyAnalysisRelativePeriod.options()
                    ).map(([val, label]) => (
                        <SingleSelectOption
                            key={val}
                            value={val}
                            label={label}
                        />
                    ))}
                </SingleSelectField>
            </div>

            <div className={styles.colhead}>
                <span>{i18n.t('Period')}</span>
                <span className={styles.center}>{i18n.t('Enabled')}</span>
                <span>{i18n.t('Custom label')}</span>
            </div>

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
                const allOn = enabledTypes.length === existingTypes.length
                const someOn =
                    enabledTypes.length > 0 &&
                    enabledTypes.length < existingTypes.length

                const customCount =
                    enabledTypes.filter((name) =>
                        hasLabel(labels.periodTypes[name])
                    ).length +
                    family.relativePeriods.filter((period) =>
                        hasLabel(labels.relativePeriods[period.id])
                    ).length

                const isOpen = openFamilies.has(family.id)

                return (
                    <div
                        key={family.id}
                        className={`${styles.family} ${
                            isOpen ? styles.open : ''
                        }`}
                    >
                        <div className={styles.famRow}>
                            <button
                                type="button"
                                className={styles.famToggle}
                                aria-expanded={isOpen}
                                onClick={() => toggleFamily(family.id)}
                            >
                                <span className={styles.chev}>
                                    <IconChevronRight24 />
                                </span>
                                <span className={styles.famName}>
                                    {family.label}
                                </span>
                                {customCount > 0 && (
                                    <Tag positive>
                                        {i18n.t('{{count}} custom', {
                                            count: customCount,
                                        })}
                                    </Tag>
                                )}
                            </button>
                            <div className={styles.center}>
                                <Checkbox
                                    dense
                                    checked={allOn}
                                    indeterminate={someOn}
                                    disabled={updating}
                                    onChange={() => toggleNames(
                                        existingTypes,
                                        !allOn
                                    )}
                                />
                            </div>
                            <div className={styles.famMeta}>
                                {enabledTypes.length > 0
                                    ? i18n.t(
                                          '{{enabled}} enabled · {{relative}} relative',
                                          {
                                              enabled: enabledTypes.length,
                                              relative:
                                                  family.relativePeriods.length,
                                          }
                                      )
                                    : i18n.t('disabled')}
                            </div>
                        </div>

                        {isOpen && (
                            <div className={styles.kids}>
                                <p className={styles.subhead}>
                                    {i18n.t('Period types')}
                                </p>
                                {existingTypes.map((name) => {
                                    const on = enabledSet.has(name)
                                    return (
                                        <div
                                            key={name}
                                            className={`${styles.kid} ${
                                                on ? '' : styles.kidDisabled
                                            }`}
                                        >
                                            <div className={styles.kidName}>
                                                {formatPeriodDisplayName(
                                                    null,
                                                    name
                                                )}
                                                <span className={styles.pid}>
                                                    {name}
                                                </span>
                                            </div>
                                            <div className={styles.center}>
                                                <Checkbox
                                                    dense
                                                    checked={on}
                                                    disabled={
                                                        updating ||
                                                        MANDATORY.has(name)
                                                    }
                                                    onChange={() =>
                                                        toggleNames([name], !on)
                                                    }
                                                />
                                            </div>
                                            <LabelInput
                                                disabled={!on}
                                                value={
                                                    labels.periodTypes[name]
                                                        ?.default || ''
                                                }
                                                placeholder={formatPeriodDisplayName(
                                                    null,
                                                    name
                                                )}
                                                onChange={(next) =>
                                                    setPeriodTypeLabel(
                                                        name,
                                                        'default',
                                                        next
                                                    )
                                                }
                                            />
                                        </div>
                                    )
                                })}

                                <p className={styles.subhead}>
                                    {i18n.t('Relative periods')}
                                </p>
                                {family.startSetting && (
                                    <StartSelect
                                        settingKey={family.startSetting}
                                        apiVersion={apiVersion}
                                        value={settings?.[family.startSetting]}
                                    />
                                )}
                                {family.relativePeriods.map((period) => (
                                    <div key={period.id} className={styles.kid}>
                                        <div className={styles.kidName}>
                                            {period.builtIn}
                                            <span className={styles.pid}>
                                                {period.id}
                                            </span>
                                        </div>
                                        <div className={styles.center}>
                                            <span className={styles.dash}>
                                                —
                                            </span>
                                        </div>
                                        <LabelInput
                                            value={
                                                labels.relativePeriods[
                                                    period.id
                                                ]?.default || ''
                                            }
                                            placeholder={period.builtIn}
                                            onChange={(next) =>
                                                setRelativePeriodLabel(
                                                    period.id,
                                                    'default',
                                                    next
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default PeriodMatrix
