import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    CenteredContent,
    Checkbox,
    CircularLoader,
    Table,
    TableBody,
    TableCell,
    TableCellHead,
    TableHead,
    TableRow,
    TableRowHead,
    Tag,
} from '@dhis2/ui'
import React, { useState, useEffect } from 'react'
import configOptionStore from '../configOptionStore.js'
import CustomLabelsModal from '../period-labels/CustomLabelsModal.jsx'
import DefaultRelativePeriod from '../period-labels/DefaultRelativePeriod.jsx'
import { useLabelState } from '../period-labels/labelStore.js'
import { PERIOD_FAMILIES } from '../period-labels/periodFamilies.js'
import settingsActions from '../settingsActions.js'
import settingsStore from '../settingsStore.js'
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
    return periodType.name === 'Yearly' ? 'yearly' : 'financialYear'
}

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

const sortPeriodTypes = (periodTypes) =>
    [...periodTypes].sort((a, b) => {
        const aKey = getGroupKey(a)
        const bKey = getGroupKey(b)
        const aOrder = groupSortOrder[aKey] ?? a.frequencyOrder
        const bOrder = groupSortOrder[bKey] ?? b.frequencyOrder
        if (aOrder !== bOrder) {
            return aOrder - bOrder
        }
        return (periodTypeOrder[a.name] || 0) - (periodTypeOrder[b.name] || 0)
    })

const RELATIVE_SEED_GROUPS = [
    {
        id: 'weekly',
        settingKey: 'analyticsWeeklyStart',
        periodTypeToValue: {
            Weekly: 'WEEKLY',
            WeeklyWednesday: 'WEEKLY_WEDNESDAY',
            WeeklyThursday: 'WEEKLY_THURSDAY',
            WeeklyFriday: 'WEEKLY_FRIDAY',
            WeeklySaturday: 'WEEKLY_SATURDAY',
            WeeklySunday: 'WEEKLY_SUNDAY',
        },
    },
    {
        id: 'financialYear',
        settingKey: 'analyticsFinancialYearStart',
        periodTypeToValue: {
            FinancialFeb: 'FINANCIAL_YEAR_FEBRUARY',
            FinancialApril: 'FINANCIAL_YEAR_APRIL',
            FinancialJuly: 'FINANCIAL_YEAR_JULY',
            FinancialAug: 'FINANCIAL_YEAR_AUGUST',
            FinancialSep: 'FINANCIAL_YEAR_SEPTEMBER',
            FinancialOct: 'FINANCIAL_YEAR_OCTOBER',
        },
    },
]

const relativeSeedByPeriodType = RELATIVE_SEED_GROUPS.reduce((acc, group) => {
    Object.keys(group.periodTypeToValue).forEach((name) => {
        acc[name] = group
    })
    return acc
}, {})

const familyByPeriodType = PERIOD_FAMILIES.reduce((acc, family) => {
    family.periodTypeNames.forEach((name) => {
        acc[name] = family
    })
    return acc
}, {})

const namesFromList = (list) =>
    (list || []).map((entry) =>
        typeof entry === 'string' ? entry : entry.name
    )

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

const PeriodTypes = () => {
    const { loading, data } = useDataQuery(query)
    const [allowedPeriodTypes, setAllowedPeriodTypes] = useState([])
    const { baseUrl, apiVersion } = useConfig()
    const [updating, setUpdating] = useState(false)
    const [labelModalType, setLabelModalType] = useState(null)
    const settings = useStoreState(settingsStore)
    const labels = useLabelState()

    useEffect(() => {
        if (data?.dataOutputPeriodTypes) {
            setAllowedPeriodTypes(data.dataOutputPeriodTypes)
            configOptionStore.setState({
                ...configOptionStore.state,
                dataOutputPeriodTypes: data.dataOutputPeriodTypes,
            })
        }
    }, [data?.dataOutputPeriodTypes])

    useEffect(() => {
        const allowed = new Set(namesFromList(allowedPeriodTypes))
        RELATIVE_SEED_GROUPS.forEach((group) => {
            const enabled = Object.keys(group.periodTypeToValue).filter(
                (name) => allowed.has(name)
            )
            if (enabled.length !== 1) {
                return
            }
            const onlyValue = group.periodTypeToValue[enabled[0]]
            if (settings?.[group.settingKey] !== onlyValue) {
                settingsActions.saveKey(group.settingKey, onlyValue)
            }
        })
    }, [allowedPeriodTypes, settings])

    const handlePeriodTypeToggle = async (
        periodTypeName,
        isCurrentlyEnabled
    ) => {
        const currentAllowedSet = new Set(namesFromList(allowedPeriodTypes))

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

    const hiddenPeriodTypes = new Set(['TwoYearly'])
    const allPeriodTypes = sortPeriodTypes(
        (data?.periodTypes?.periodTypes || []).filter(
            (pt) => !hiddenPeriodTypes.has(pt.name)
        )
    )
    const allowedSet = new Set(namesFromList(allowedPeriodTypes))

    const enabledInSeedGroup = (group) =>
        Object.keys(group.periodTypeToValue).filter((name) =>
            allowedSet.has(name)
        )

    const seedGroupNeedsChoice = Object.fromEntries(
        RELATIVE_SEED_GROUPS.map((group) => [
            group.id,
            enabledInSeedGroup(group).length > 1,
        ])
    )
    return (
        <div className={styles.wrapper}>
            <Table className={styles.table} suppressZebraStriping>
                <TableHead>
                    <TableRowHead>
                        <TableCellHead className={styles.enabledHead}>
                            {i18n.t('Enabled?')}
                        </TableCellHead>
                        <TableCellHead>{i18n.t('Period')}</TableCellHead>
                        <TableCellHead className={styles.relativeHead} />
                        <TableCellHead>
                            {i18n.t('Custom labels')}
                        </TableCellHead>
                    </TableRowHead>
                </TableHead>
                <TableBody>
                    {allPeriodTypes.map((periodType) => {
                        const isEnabled = allowedSet.has(periodType.name)
                        const isMandatory = mandatoryPeriodTypes.has(
                            periodType.name
                        )
                        const seedGroup =
                            relativeSeedByPeriodType[periodType.name]
                        const selectedSeed =
                            seedGroup && settings?.[seedGroup.settingKey]
                        const seedValue = seedGroup
                            ? seedGroup.periodTypeToValue[periodType.name]
                            : undefined
                        const showRelativeChoice =
                            Boolean(seedGroup) &&
                            isEnabled &&
                            seedGroupNeedsChoice[seedGroup.id]
                        const isRelativeSeed =
                            showRelativeChoice && selectedSeed === seedValue
                        const customLabel = (
                            labels.periodTypes[periodType.name]?.default || ''
                        ).trim()

                        return (
                            <TableRow
                                key={periodType.name}
                                className={
                                    isEnabled
                                        ? `${styles.row} ${styles.enabled}`
                                        : styles.row
                                }
                            >
                                <TableCell className={styles.enabledCell}>
                                    <Checkbox
                                        dense
                                        checked={isEnabled}
                                        disabled={updating || isMandatory}
                                        onChange={() =>
                                            handlePeriodTypeToggle(
                                                periodType.name,
                                                isEnabled
                                            )
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    {formatPeriodDisplayName(
                                        periodType.displayName,
                                        periodType.name
                                    )}
                                </TableCell>
                                <TableCell className={styles.relativeCell}>
                                    {isRelativeSeed && (
                                        <Tag className={styles.relativeTag}>
                                            {i18n.t('Used for relative period')}
                                        </Tag>
                                    )}
                                    {showRelativeChoice && !isRelativeSeed && (
                                        <button
                                            type="button"
                                            className={`${styles.customLabelsLink} ${styles.useRelativeLink}`}
                                            onClick={() =>
                                                settingsActions.saveKey(
                                                    seedGroup.settingKey,
                                                    seedValue
                                                )
                                            }
                                        >
                                            {i18n.t('Use for relative period')}
                                        </button>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className={styles.labelsCell}>
                                        <button
                                            type="button"
                                            className={
                                                customLabel
                                                    ? styles.customLabelsLink
                                                    : `${styles.customLabelsLink} ${styles.setCustomLabels}`
                                            }
                                            onClick={() =>
                                                setLabelModalType(
                                                    periodType.name
                                                )
                                            }
                                        >
                                            {customLabel
                                                ? i18n.t(
                                                      'Label: {{label}} · Edit',
                                                      { label: customLabel }
                                                  )
                                                : i18n.t('Set custom label')}
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            <div className={styles.defaultRelative}>
                <DefaultRelativePeriod />
            </div>
            {labelModalType && (
                <CustomLabelsModal
                    periodTypeName={labelModalType}
                    family={familyByPeriodType[labelModalType]}
                    onClose={() => setLabelModalType(null)}
                />
            )}
        </div>
    )
}

export default PeriodTypes
