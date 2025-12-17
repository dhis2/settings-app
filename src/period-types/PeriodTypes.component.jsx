import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CenteredContent, CircularLoader } from '@dhis2/ui'
import { getInstance as getD2 } from 'd2'
import CheckboxMaterial from 'material-ui/Checkbox'
import React, { useState, useCallback } from 'react'
import settingsActions from '../settingsActions.js'
import styles from './PeriodTypes.module.css'

const query = {
    periodTypes: {
        resource: 'periodTypes',
    },
    dataOutputPeriodTypes: {
        resource: 'configuration/dataOutputPeriodTypes',
    },
}

const formatPeriodTypeName = (name) => {
    const simpleLabels = {
        Daily: i18n.t('Daily'),
        Weekly: i18n.t('Weekly'),
        Monthly: i18n.t('Monthly'),
        BiMonthly: i18n.t('Bi-monthly'),
        Yearly: i18n.t('Yearly'),
        BiWeekly: i18n.t('Bi-weekly'),
        Quarterly: i18n.t('Quarterly'),
        SixMonthly: i18n.t('Six-monthly'),
    }

    if (simpleLabels[name]) {
        return simpleLabels[name]
    }

    const monthMap = {
        April: 'April',
        July: 'July',
        Oct: 'October',
        Nov: 'November',
    }

    if (name.startsWith('Weekly')) {
        const day = name.replace('Weekly', '')
        return day
            ? i18n.t('Weekly (start {{day}})', { day })
            : simpleLabels.Weekly
    }

    if (name.startsWith('Financial')) {
        const monthAbbrev = name.replace('Financial', '')
        const month = monthMap[monthAbbrev] || monthAbbrev
        return i18n.t('Financial year (start {{month}})', { month })
    }

    if (name.startsWith('SixMonthly')) {
        const monthAbbrev = name.replace('SixMonthly', '')
        const month = monthMap[monthAbbrev] || monthAbbrev
        return monthAbbrev
            ? i18n.t('Six-monthly (start {{month}})', { month })
            : simpleLabels.SixMonthly
    }

    if (name.startsWith('Quarterly')) {
        const monthAbbrev = name.replace('Quarterly', '')
        const month = monthMap[monthAbbrev] || monthAbbrev
        return monthAbbrev
            ? i18n.t('Quarterly (start {{month}})', { month })
            : simpleLabels.Quarterly
    }

    return name
        .split(/(?=[A-Z])/)
        .join(' ')
        .trim()
}

const getGroupLabel = (frequencyOrder) => {
    const labels = {
        1: i18n.t('Days'),
        7: i18n.t('Weeks'),
        14: i18n.t('Bi-weeks'),
        30: i18n.t('Months'),
        60: i18n.t('Bi-months'),
        91: i18n.t('Quarters'),
        182: i18n.t('Six months'),
        365: i18n.t('Years'),
    }
    return labels[frequencyOrder] || i18n.t('Other')
}

const groupByFrequency = (periodTypes) => {
    const groups = {}
    periodTypes.forEach((pt) => {
        const freq = pt.frequencyOrder
        if (!groups[freq]) {
            groups[freq] = {
                label: getGroupLabel(freq),
                frequencyOrder: freq,
                periodTypes: [],
            }
        }
        groups[freq].periodTypes.push(pt)
    })
    return Object.values(groups).sort(
        (a, b) => a.frequencyOrder - b.frequencyOrder
    )
}

const PeriodTypes = () => {
    const { loading, data, refetch } = useDataQuery(query)
    const [updating, setUpdating] = useState(false)

    const handlePeriodTypeToggle = useCallback(
        async (periodTypeName, isCurrentlyEnabled) => {
            setUpdating(true)
            try {
                const d2 = await getD2()
                const api = d2.Api.getApi()
                const allowedPeriodTypes = data?.dataOutputPeriodTypes || []
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
                    (name) => ({ name })
                )

                await api.post(
                    'configuration/dataOutputPeriodTypes',
                    updatedPeriodTypes
                )

                await refetch()
                settingsActions.showSnackbarMessage(i18n.t('Settings updated'))
            } catch (err) {
                console.error('Failed to update period types:', err)
                settingsActions.showSnackbarMessage(
                    i18n.t(
                        'There was a problem updating settings. Changes have not been saved.'
                    )
                )
            } finally {
                setUpdating(false)
            }
        },
        [data, refetch]
    )

    if (loading) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    const allPeriodTypes = data?.periodTypes?.periodTypes || []
    const allowedPeriodTypes = data?.dataOutputPeriodTypes || []
    const allowedSet = new Set(
        allowedPeriodTypes.map((pt) => (typeof pt === 'string' ? pt : pt.name))
    )
    const groupedPeriodTypes = groupByFrequency(allPeriodTypes)

    return (
        <div className={styles.wrapper}>
            <p className={styles.sectionLabel}>
                {i18n.t('Period types available in analytics apps')}
            </p>
            <div className={styles.groupsWrapper}>
                {groupedPeriodTypes.map((group) => (
                    <div key={group.frequencyOrder} className={styles.group}>
                        <p className={styles.groupLabel}>{group.label}</p>
                        <div className={styles.checkboxList}>
                            {group.periodTypes.map((periodType) => {
                                const isEnabled = allowedSet.has(
                                    periodType.name
                                )
                                return (
                                    <div
                                        key={periodType.name}
                                        className={styles.checkboxItem}
                                    >
                                        <CheckboxMaterial
                                            checked={isEnabled}
                                            disabled={updating}
                                            label={formatPeriodTypeName(
                                                periodType.name
                                            )}
                                            onCheck={() =>
                                                handlePeriodTypeToggle(
                                                    periodType.name,
                                                    isEnabled
                                                )
                                            }
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PeriodTypes
