import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    CenteredContent,
    CircularLoader,
    Checkbox,
    Input,
    Button,
    IconTranslate16,
} from '@dhis2/ui'
import React, { useState, useEffect } from 'react'
import configOptionStore from '../configOptionStore.js'
import PrototypeTranslationDialog from '../period-labels/PrototypeTranslationDialog.jsx'
import { getCustomLabel } from '../period-labels/resolveLabel.js'
import settingsActions from '../settingsActions.js'
import { formatPeriodDisplayName } from './builtInPeriodNames.js'
import styles from './PeriodTypes.module.css'

const query = {
    periodTypes: {
        resource: 'periodTypes',
        params: {
            fields: 'name,displayName,frequencyOrder',
        },
    },
    dataOutputPeriodTypes: {
        resource: 'configuration/dataOutputPeriodTypes',
    },
}

const mandatoryPeriodTypes = new Set(['Yearly'])

const getGroupKey = (periodType) => {
    if (periodType.frequencyOrder !== 365) {
        return String(periodType.frequencyOrder)
    }
    // frequencyOrder 365 is currently only Yearly and the 7 Financial* variants
    return periodType.name === 'Yearly' ? 'yearly' : 'financialYear'
}

const getGroupLabel = (groupKey, frequencyOrder) => {
    if (groupKey === 'yearly') {
        return 'Yearly'
    }
    if (groupKey === 'financialYear') {
        return 'Financial yearly'
    }
    const labels = {
        1: 'Daily',
        7: 'Weekly',
        14: 'Bi-weekly',
        30: 'Monthly',
        60: 'Bi-monthly',
        61: 'Bi-monthly',
        91: 'Quarterly',
        182: 'Six-monthly',
    }
    return labels[frequencyOrder] || 'Other'
}

// Yearly and Financial year both carry frequencyOrder 365; this keeps
// Yearly sorted directly before Financial year, where "Years" used to sit.
const groupSortOrder = {
    yearly: 365,
    financialYear: 365.5,
}

const periodTypeOrder = {
    Daily: 1,
    Weekly: 1,
    WeeklyWednesday: 2,
    WeeklyThursday: 3,
    WeeklyFriday: 4,
    WeeklySaturday: 5,
    WeeklySunday: 6,
    BiWeekly: 1,
    Monthly: 1,
    BiMonthly: 1,
    Quarterly: 1,
    QuarterlyNov: 2,
    SixMonthly: 1,
    SixMonthlyApril: 2,
    SixMonthlyNov: 3,
    Yearly: 1,
    FinancialFeb: 2,
    FinancialApril: 3,
    FinancialJuly: 4,
    FinancialAug: 5,
    FinancialSep: 6,
    FinancialOct: 7,
    FinancialNov: 8,
}

const groupByFrequency = (periodTypes) => {
    const groups = {}
    periodTypes.forEach((pt) => {
        const groupKey = getGroupKey(pt)
        if (!groups[groupKey]) {
            groups[groupKey] = {
                groupKey,
                label: getGroupLabel(groupKey, pt.frequencyOrder),
                sortOrder: groupSortOrder[groupKey] ?? pt.frequencyOrder,
                periodTypes: [],
            }
        }
        groups[groupKey].periodTypes.push(pt)
    })
    const sorted = Object.values(groups).sort(
        (a, b) => a.sortOrder - b.sortOrder
    )
    sorted.forEach((group) => {
        group.periodTypes.sort(
            (a, b) =>
                (periodTypeOrder[a.name] || 0) - (periodTypeOrder[b.name] || 0)
        )
    })
    return sorted
}

const PeriodTypeItem = ({
    periodType,
    isEnabled,
    isMandatory,
    updating,
    onToggle,
}) => {
    const existingLabel = getCustomLabel('periodTypes', periodType.name)
    const [showLabelInput, setShowLabelInput] = useState(Boolean(existingLabel))
    const [customLabel, setCustomLabel] = useState(existingLabel || '')
    const [translateOpen, setTranslateOpen] = useState(false)
    const displayName = formatPeriodDisplayName(
        periodType.displayName,
        periodType.name
    )

    return (
        <div
            className={styles.checkboxItem}
            title={
                isMandatory
                    ? i18n.t(
                          'This period type is always enabled and cannot be disabled'
                      )
                    : undefined
            }
        >
            <div className={styles.checkboxRow}>
                <Checkbox
                    dense
                    checked={isEnabled}
                    disabled={updating || isMandatory}
                    label={displayName}
                    onChange={() => onToggle(periodType.name, isEnabled)}
                />
            </div>
            {isEnabled &&
                (showLabelInput ? (
                    <div className={styles.labelEditor}>
                        <div className={styles.labelInput}>
                            <Input
                                dense
                                value={customLabel}
                                placeholder={i18n.t('Custom label')}
                                onChange={({ value }) =>
                                    setCustomLabel(value || '')
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
                ) : (
                    <button
                        type="button"
                        className={styles.addLabelAction}
                        onClick={() => setShowLabelInput(true)}
                    >
                        {i18n.t('+ Custom label')}
                    </button>
                ))}
            {translateOpen && (
                <PrototypeTranslationDialog
                    name={customLabel || displayName}
                    onClose={() => setTranslateOpen(false)}
                />
            )}
        </div>
    )
}

const PeriodTypes = () => {
    const { loading, data } = useDataQuery(query)
    const [allowedPeriodTypes, setAllowedPeriodTypes] = useState([])
    const { baseUrl, apiVersion } = useConfig()
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        if (data?.dataOutputPeriodTypes) {
            setAllowedPeriodTypes(data.dataOutputPeriodTypes)
            configOptionStore.setState({
                ...configOptionStore.state,
                dataOutputPeriodTypes: data.dataOutputPeriodTypes,
            })
        }
    }, [data?.dataOutputPeriodTypes])

    const handlePeriodTypeToggle = async (
        periodTypeName,
        isCurrentlyEnabled
    ) => {
        const currentAllowedSet = new Set(
            allowedPeriodTypes.map((pt) =>
                typeof pt === 'string' ? pt : pt.name
            )
        )

        if (isCurrentlyEnabled) {
            currentAllowedSet.delete(periodTypeName)
        } else {
            currentAllowedSet.add(periodTypeName)
        }

        const updatedPeriodTypes = Array.from(currentAllowedSet).map(
            (name) => ({
                name,
            })
        )

        setUpdating(true)
        try {
            const response = await fetch(
                `${baseUrl}/api/${apiVersion}/configuration/dataOutputPeriodTypes`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(updatedPeriodTypes),
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            setAllowedPeriodTypes(updatedPeriodTypes)
            configOptionStore.setState({
                ...configOptionStore.state,
                dataOutputPeriodTypes: updatedPeriodTypes,
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

    // Remove on v43-end-of-life
    const hiddenPeriodTypes = new Set(['TwoYearly'])
    const allPeriodTypes = (data?.periodTypes?.periodTypes || []).filter(
        (pt) => !hiddenPeriodTypes.has(pt.name)
    )
    const allowedSet = new Set(
        allowedPeriodTypes.map((pt) => (typeof pt === 'string' ? pt : pt.name))
    )
    const groupedPeriodTypes = groupByFrequency(allPeriodTypes)

    return (
        <div className={styles.wrapper}>
            <div className={styles.box}>
                <h3 className={styles.sectionHeader}>
                    {i18n.t('Analysis periods')}
                </h3>
                <div className={styles.groupsWrapper}>
                    {groupedPeriodTypes.map((group) => (
                        <div key={group.groupKey} className={styles.group}>
                            <p className={styles.groupLabel}>{group.label}</p>
                            <div className={styles.checkboxList}>
                                {group.periodTypes.map((periodType) => (
                                    <PeriodTypeItem
                                        key={periodType.name}
                                        periodType={periodType}
                                        isEnabled={allowedSet.has(
                                            periodType.name
                                        )}
                                        isMandatory={mandatoryPeriodTypes.has(
                                            periodType.name
                                        )}
                                        updating={updating}
                                        onToggle={handlePeriodTypeToggle}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PeriodTypes
