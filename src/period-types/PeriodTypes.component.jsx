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
import { DialRoot, useDialKit } from 'dialkit'
import 'dialkit/styles.css' // eslint-disable-line import/no-unresolved
import React, { Fragment, useState, useEffect } from 'react'
import configOptionStore from '../configOptionStore.js'
import DefaultRelativePeriod from '../period-labels/DefaultRelativePeriod.jsx'
import { useLabelState } from '../period-labels/labelStore.js'
import { PERIOD_FAMILIES } from '../period-labels/periodFamilies.js'
import PeriodNameEditor from '../period-labels/PeriodNameEditor.jsx'
import settingsActions from '../settingsActions.js'
import settingsStore from '../settingsStore.js'
import { formatPeriodDisplayName } from './builtInPeriodNames.js'
import PeriodFamilies from './PeriodFamilies.jsx'
import styles from './PeriodTypes.module.css'
import SeedSelect from './SeedSelect.jsx'

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
        title: i18n.t('Weeks'),
        tagLabel: i18n.t('Relative weeks'),
        useLabel: i18n.t('Use for relative weeks'),
        selectLabel: i18n.t('Relative weeks based on'),
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
        title: i18n.t('Financial years'),
        tagLabel: i18n.t('Relative financial years'),
        useLabel: i18n.t('Use for relative financial years'),
        selectLabel: i18n.t('Relative financial years based on'),
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

// Prototype: the ways to choose which week and financial year types relative
// periods are based on, switched from the DialKit panel.
const VARIANTS = {
    radios: 'radios',
    groupHeader: 'groupHeader',
    rowBadge: 'rowBadge',
    section: 'section',
    column: 'column',
    families: 'families',
}

const PeriodTypes = () => {
    const { variant, singleVariantRows } = useDialKit(
        'Relative periods',
        {
            variant: {
                type: 'select',
                options: [
                    { value: VARIANTS.radios, label: 'Current: radios' },
                    { value: VARIANTS.groupHeader, label: 'A: group header' },
                    { value: VARIANTS.rowBadge, label: 'B: row badge' },
                    { value: VARIANTS.section, label: 'C: own section' },
                    { value: VARIANTS.column, label: 'D: column' },
                    { value: VARIANTS.families, label: 'E: family switches' },
                ],
                default: VARIANTS.groupHeader,
            },
            // D only: what single-variant rows show in the column.
            singleVariantRows: {
                type: 'select',
                options: ['Included', 'Blank'],
                default: 'Included',
            },
        },
        { persist: true }
    )
    const labels = useLabelState()
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

    const handlePeriodTypeToggle = (periodTypeName, isCurrentlyEnabled) => {
        const currentAllowedSet = new Set(namesFromList(allowedPeriodTypes))

        if (isCurrentlyEnabled) {
            currentAllowedSet.delete(periodTypeName)
        } else {
            currentAllowedSet.add(periodTypeName)
        }

        return savePeriodTypes(currentAllowedSet)
    }

    const savePeriodTypes = async (nextAllowedSet) => {
        const updatedPeriodTypes = Array.from(nextAllowedSet).map((name) => ({
            name,
        }))

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
    const builtInNameOf = (periodType) =>
        formatPeriodDisplayName(periodType.displayName, periodType.name)
    // Enabled types each seed group can be based on, in table order.
    const seedOptionsByGroup = RELATIVE_SEED_GROUPS.reduce((acc, group) => {
        acc[group.id] = allPeriodTypes
            .filter(
                (pt) =>
                    group.periodTypeToValue[pt.name] && allowedSet.has(pt.name)
            )
            .map((pt) => ({
                value: group.periodTypeToValue[pt.name],
                // Show a renamed type by its new name.
                label:
                    labels.periodTypes[pt.name]?.default?.trim() ||
                    builtInNameOf(pt),
            }))
        return acc
    }, {})
    const showRelativeColumn =
        variant === VARIANTS.radios ||
        variant === VARIANTS.rowBadge ||
        variant === VARIANTS.column
    const tableClassName = [
        styles.table,
        showRelativeColumn ? '' : styles.noRelativeColumn,
    ]
        .filter(Boolean)
        .join(' ')

    // The period type relative periods are based on gets them in its rename
    // modal.
    const relativePeriodsFor = (name) => {
        const seedGroup = relativeSeedByPeriodType[name]
        const isSeed =
            FIXED_RELATIVE_SEEDS.has(name) ||
            (Boolean(seedGroup) &&
                settings?.[seedGroup.settingKey] ===
                    seedGroup.periodTypeToValue[name])
        return allowedSet.has(name) && isSeed
            ? familyByPeriodType[name]?.relativePeriods
            : undefined
    }

    if (variant === VARIANTS.families) {
        return (
            <div className={styles.wrapper}>
                <PeriodFamilies
                    periodTypes={allPeriodTypes.map((pt) => ({
                        ...pt,
                        builtInName: builtInNameOf(pt),
                    }))}
                    allowedSet={allowedSet}
                    mandatoryPeriodTypes={mandatoryPeriodTypes}
                    seedGroups={RELATIVE_SEED_GROUPS}
                    settings={settings}
                    labels={labels}
                    updating={updating}
                    relativePeriodsFor={relativePeriodsFor}
                    onSave={savePeriodTypes}
                />
                <div className={styles.defaultRelative}>
                    <DefaultRelativePeriod />
                </div>
                {/* Prototype: shown in built previews so others can switch variants. */}
                <DialRoot position="bottom-right" productionEnabled />
            </div>
        )
    }

    return (
        <div className={styles.wrapper}>
            <Table className={tableClassName} suppressZebraStriping>
                {variant === VARIANTS.column && (
                    <thead>
                        <tr className={styles.columnHeader}>
                            <th className={styles.enabledCell} />
                            <th>{i18n.t('Period type')}</th>
                            <th className={styles.relativeCell}>
                                {i18n.t('Relative periods')}
                            </th>
                        </tr>
                    </thead>
                )}
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
                        const isChosenSeed =
                            Boolean(seedGroup) &&
                            settings?.[seedGroup.settingKey] === seedValue
                        // The period type relative periods are based on gets
                        // them in its rename modal.
                        const isRelativeSeed =
                            isEnabled && (isFixedSeed || isChosenSeed)
                        const builtInName = builtInNameOf(periodType)
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
                        const showGroupHeader =
                            variant === VARIANTS.groupHeader &&
                            isSectionStart &&
                            Boolean(seedGroup)
                        const rowClassName = [
                            styles.row,
                            isEnabled ? styles.enabled : '',
                            isSectionStart && !showGroupHeader
                                ? styles.sectionStart
                                : '',
                            isSectionEnd || !nextPeriodType
                                ? styles.sectionEnd
                                : '',
                        ]
                            .filter(Boolean)
                            .join(' ')

                        return (
                            <Fragment key={periodType.name}>
                                {showGroupHeader && (
                                    <TableRow
                                        className={[
                                            styles.row,
                                            styles.sectionStart,
                                            styles.groupHeader,
                                        ].join(' ')}
                                    >
                                        <TableCell colSpan="3">
                                            <div
                                                className={
                                                    styles.groupHeaderContent
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.groupHeaderTitle
                                                    }
                                                >
                                                    {seedGroup.title}
                                                </span>
                                                {seedOptionsByGroup[
                                                    seedGroup.id
                                                ].length > 0 && (
                                                    <span
                                                        className={
                                                            styles.groupHeaderSelect
                                                        }
                                                    >
                                                        {seedGroup.selectLabel}
                                                        <SeedSelect
                                                            group={seedGroup}
                                                            options={
                                                                seedOptionsByGroup[
                                                                    seedGroup.id
                                                                ]
                                                            }
                                                            settings={settings}
                                                        />
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
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
                                    <TableCell
                                        className={styles.nameCell}
                                        colSpan={
                                            showRelativeColumn ? undefined : '2'
                                        }
                                    >
                                        <PeriodNameEditor
                                            periodTypeName={periodType.name}
                                            builtInName={builtInName}
                                            editable={isEnabled}
                                            relativePeriods={
                                                isRelativeSeed
                                                    ? familyByPeriodType[
                                                          periodType.name
                                                      ]?.relativePeriods
                                                    : undefined
                                            }
                                        />
                                    </TableCell>
                                    {variant === VARIANTS.radios && (
                                        <TableCell
                                            className={styles.relativeCell}
                                        >
                                            {isEnabled && seedGroup && (
                                                <Radio
                                                    dense
                                                    name={seedGroup.settingKey}
                                                    value={seedValue}
                                                    label={i18n.t(
                                                        'Relative period'
                                                    )}
                                                    checked={isChosenSeed}
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
                                                    className={
                                                        styles.lockedSeed
                                                    }
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
                                    )}
                                    {variant === VARIANTS.rowBadge && (
                                        <TableCell
                                            className={`${styles.relativeCell} ${styles.badgeCell}`}
                                        >
                                            {isEnabled &&
                                                seedGroup &&
                                                (isChosenSeed ? (
                                                    <span
                                                        className={
                                                            styles.seedTag
                                                        }
                                                    >
                                                        {seedGroup.tagLabel}
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.useAction
                                                        }
                                                        onClick={() =>
                                                            settingsActions.saveKey(
                                                                seedGroup.settingKey,
                                                                seedValue
                                                            )
                                                        }
                                                    >
                                                        {seedGroup.useLabel}
                                                    </button>
                                                ))}
                                        </TableCell>
                                    )}
                                    {variant === VARIANTS.column && (
                                        <TableCell
                                            className={styles.relativeCell}
                                        >
                                            {isEnabled &&
                                                isFixedSeed &&
                                                singleVariantRows ===
                                                    'Included' && (
                                                    <span
                                                        className={
                                                            styles.includedText
                                                        }
                                                    >
                                                        {i18n.t('Included')}
                                                    </span>
                                                )}
                                            {isEnabled &&
                                                seedGroup &&
                                                (isChosenSeed ? (
                                                    <span
                                                        className={
                                                            styles.seedTag
                                                        }
                                                    >
                                                        {i18n.t('In use')}
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.useAction
                                                        }
                                                        onClick={() =>
                                                            settingsActions.saveKey(
                                                                seedGroup.settingKey,
                                                                seedValue
                                                            )
                                                        }
                                                    >
                                                        {i18n.t('Use instead')}
                                                    </button>
                                                ))}
                                        </TableCell>
                                    )}
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
            {variant === VARIANTS.section && (
                <div className={styles.relativeSection}>
                    <h3 className={styles.relativeSectionTitle}>
                        {i18n.t('Relative periods')}
                    </h3>
                    {RELATIVE_SEED_GROUPS.filter(
                        (group) => seedOptionsByGroup[group.id].length > 0
                    ).map((group) => (
                        <div
                            key={group.id}
                            className={styles.relativeSectionField}
                        >
                            <SeedSelect
                                field
                                group={group}
                                label={group.selectLabel}
                                options={seedOptionsByGroup[group.id]}
                                settings={settings}
                            />
                        </div>
                    ))}
                    <p className={styles.relativeSectionHelp}>
                        {i18n.t(
                            'Only enabled period types are listed. Other period types have a single variant, so their relative periods always follow it.'
                        )}
                    </p>
                </div>
            )}
            <div className={styles.defaultRelative}>
                <DefaultRelativePeriod />
            </div>
            {/* Prototype: shown in built previews so others can switch variants. */}
            <DialRoot position="bottom-right" productionEnabled />
        </div>
    )
}

export default PeriodTypes
