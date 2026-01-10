import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CenteredContent, CircularLoader } from '@dhis2/ui'
import CheckboxMaterial from 'material-ui/Checkbox'
import React, { useState, useEffect } from 'react'
import settingsActions from '../settingsActions.js'
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

const monthMap = {
    Jan: i18n.t('January'),
    Feb: i18n.t('February'),
    Mar: i18n.t('March'),
    Apr: i18n.t('April'),
    May: i18n.t('May'),
    Jun: i18n.t('June'),
    Jul: i18n.t('July'),
    Aug: i18n.t('August'),
    Sep: i18n.t('September'),
    Oct: i18n.t('October'),
    Nov: i18n.t('November'),
    Dec: i18n.t('December'),
    April: i18n.t('April'),
    July: i18n.t('July'),
    October: i18n.t('October'),
    November: i18n.t('November'),
    September: i18n.t('September'),
}

const dayMap = {
    Monday: i18n.t('Monday'),
    Tuesday: i18n.t('Tuesday'),
    Wednesday: i18n.t('Wednesday'),
    Thursday: i18n.t('Thursday'),
    Friday: i18n.t('Friday'),
    Saturday: i18n.t('Saturday'),
    Sunday: i18n.t('Sunday'),
}

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

const formatWeeklyPeriod = (name) => {
    const day = name.replace('Weekly', '')
    if (!day) {
        return simpleLabels.Weekly || i18n.t('Weekly')
    }
    const translatedDay = dayMap[day] || i18n.t(day)
    return i18n.t('Weekly (start {{day}})', { day: translatedDay })
}

const formatPeriodWithMonth = (name, options) => {
    const { prefix, template, defaultLabel } = options
    const monthAbbrev = name.replace(prefix, '')
    if (!monthAbbrev) {
        return defaultLabel
            ? simpleLabels[defaultLabel] || i18n.t(defaultLabel)
            : null
    }
    const month = monthMap[monthAbbrev] || monthAbbrev
    return i18n.t(template, { month })
}

const formatFinancialPeriod = (name) => {
    return formatPeriodWithMonth(name, {
        prefix: 'Financial',
        template: 'Financial year (start {{month}})',
        defaultLabel: null,
    })
}

const formatSixMonthlyPeriod = (name) => {
    return formatPeriodWithMonth(name, {
        prefix: 'SixMonthly',
        template: 'Six-monthly (start {{month}})',
        defaultLabel: 'SixMonthly',
    })
}

const formatQuarterlyPeriod = (name) => {
    return formatPeriodWithMonth(name, {
        prefix: 'Quarterly',
        template: 'Quarterly (start {{month}})',
        defaultLabel: 'Quarterly',
    })
}

const formatNameBasedPeriod = (name, displayName) => {
    if (name.startsWith('Weekly')) {
        return formatWeeklyPeriod(name)
    }
    if (name.startsWith('Financial')) {
        return formatFinancialPeriod(name) || displayName || ''
    }
    if (name.startsWith('SixMonthly')) {
        return formatSixMonthlyPeriod(name)
    }
    if (name.startsWith('Quarterly')) {
        return formatQuarterlyPeriod(name)
    }
    if (simpleLabels[name]) {
        return simpleLabels[name]
    }
    return name
        .split(/(?=[A-Z])/)
        .join(' ')
        .trim()
}

const formatDisplayNameFallback = (displayName) => {
    if (displayName === 'FinancialSep') {
        return i18n.t('Financial year (start {{month}})', {
            month: monthMap.Sep,
        })
    }
    return displayName
}

const formatPeriodDisplayName = (displayName, name) => {
    if (!name && !displayName) {
        return ''
    }

    if (name) {
        const formatted = formatNameBasedPeriod(name, displayName)
        if (formatted) {
            return formatted
        }
    }

    if (displayName) {
        return formatDisplayNameFallback(displayName)
    }

    return ''
}

const getGroupLabel = (frequencyOrder) => {
    const labels = {
        1: i18n.t('Days'),
        7: i18n.t('Weeks'),
        14: i18n.t('Bi-weeks'),
        30: i18n.t('Months'),
        60: i18n.t('Bi-months'),
        61: i18n.t('Bi-months'),
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
    const { loading, data } = useDataQuery(query)
    const [allowedPeriodTypes, setAllowedPeriodTypes] = useState([])
    const { baseUrl, apiVersion } = useConfig()
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        if (data?.dataOutputPeriodTypes) {
            setAllowedPeriodTypes(data.dataOutputPeriodTypes)
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

    const allPeriodTypes = data?.periodTypes?.periodTypes || []
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
                                            label={formatPeriodDisplayName(
                                                periodType.displayName,
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
