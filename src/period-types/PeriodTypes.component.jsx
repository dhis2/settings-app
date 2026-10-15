import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    CenteredContent,
    Checkbox,
    CircularLoader,
    IconLock16,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Radio,
} from '@dhis2/ui'
import React, { Fragment, useState, useEffect } from 'react'
import configOptionStore from '../configOptionStore.js'
import DefaultRelativePeriod from '../period-labels/DefaultRelativePeriod.jsx'
import { PERIOD_FAMILIES } from '../period-labels/periodFamilies.js'
import PeriodNameEditor from '../period-labels/PeriodNameEditor.jsx'
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

// Period types that always seed their family's relative periods. Quarter and
// six-month have other start months, but those never seed relative periods.
const FIXED_RELATIVE_SEEDS = new Set([
    'Daily',
    'BiWeekly',
    'Monthly',
    'BiMonthly',
    'Quarterly',
    'SixMonthly',
    'Yearly',
])

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
    const settings = useStoreState(settingsStore)

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
            if (!settings || enabled.length === 0) {
                return
            }
            // Keep the seed on an enabled type: if the saved one is switched
            // off, move it to the first enabled one in table order.
            const current = settings[group.settingKey]
            const currentIsEnabled = enabled.some(
                (name) => group.periodTypeToValue[name] === current
            )
            if (!currentIsEnabled) {
                settingsActions.saveKey(
                    group.settingKey,
                    group.periodTypeToValue[enabled[0]]
                )
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
    return (
        <div className={styles.wrapper}>
            <Table className={styles.table} suppressZebraStriping>
                <TableBody>
                    {allPeriodTypes.map((periodType, index) => {
                        const isEnabled = allowedSet.has(periodType.name)
                        const isMandatory = mandatoryPeriodTypes.has(
                            periodType.name
                        )
                        const seedGroup =
                            relativeSeedByPeriodType[periodType.name]
                        const seedValue = seedGroup
                            ? seedGroup.periodTypeToValue[periodType.name]
                            : undefined
                        const isFixedSeed = FIXED_RELATIVE_SEEDS.has(
                            periodType.name
                        )
                        const builtInName = formatPeriodDisplayName(
                            periodType.displayName,
                            periodType.name
                        )
                        const prevPeriodType = allPeriodTypes[index - 1]
                        const nextPeriodType = allPeriodTypes[index + 1]
                        const sectionId = (pt) =>
                            familyByPeriodType[pt.name]?.id || getGroupKey(pt)
                        const isSectionStart =
                            !prevPeriodType ||
                            sectionId(periodType) !== sectionId(prevPeriodType)
                        const isSectionEnd =
                            nextPeriodType &&
                            sectionId(periodType) !== sectionId(nextPeriodType)
                        const rowClassName = [
                            styles.row,
                            isEnabled ? styles.enabled : '',
                            isSectionStart ? styles.sectionStart : '',
                            isSectionEnd || !nextPeriodType
                                ? styles.sectionEnd
                                : '',
                        ]
                            .filter(Boolean)
                            .join(' ')

                        return (
                            <Fragment key={periodType.name}>
                                <TableRow className={rowClassName}>
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
                                    <TableCell className={styles.nameCell}>
                                        <PeriodNameEditor
                                            periodTypeName={periodType.name}
                                            builtInName={builtInName}
                                            editable={isEnabled}
                                        />
                                    </TableCell>
                                    <TableCell className={styles.relativeCell}>
                                        {isEnabled && seedGroup && (
                                            <Radio
                                                dense
                                                name={seedGroup.settingKey}
                                                value={seedValue}
                                                label={i18n.t(
                                                    'Relative period'
                                                )}
                                                checked={
                                                    settings?.[
                                                        seedGroup.settingKey
                                                    ] === seedValue
                                                }
                                                onChange={() =>
                                                    settingsActions.saveKey(
                                                        seedGroup.settingKey,
                                                        seedValue
                                                    )
                                                }
                                            />
                                        )}
                                        {isEnabled && isFixedSeed && (
                                            <span
                                                className={styles.lockedSeed}
                                                title={i18n.t(
                                                    'Relative periods are always based on this period type'
                                                )}
                                            >
                                                <Radio
                                                    dense
                                                    checked
                                                    disabled
                                                    label={i18n.t(
                                                        'Relative period'
                                                    )}
                                                />
                                                <IconLock16 />
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                                {isSectionEnd && (
                                    <tr
                                        aria-hidden="true"
                                        className={styles.sectionGap}
                                    >
                                        <td colSpan="3" />
                                    </tr>
                                )}
                            </Fragment>
                        )
                    })}
                </TableBody>
            </Table>
            <div className={styles.defaultRelative}>
                <DefaultRelativePeriod />
            </div>
        </div>
    )
}

export default PeriodTypes
