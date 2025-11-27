import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CenteredContent, CircularLoader } from '@dhis2/ui'
import CheckboxMaterial from 'material-ui/Checkbox'
import React from 'react'
import styles from './PeriodTypes.module.css'

const query = {
    periodTypes: {
        resource: 'periodTypes',
    },
    dataOutputPeriodTypes: {
        resource: 'configuration/dataOutputPeriodTypes',
    },
}

// Format period type names for display
const formatPeriodTypeName = (name) => {
    // Handle Weekly variants
    if (name === 'Weekly') {
        return i18n.t('Weekly')
    }
    if (name.startsWith('Weekly')) {
        const day = name.replace('Weekly', '')
        return i18n.t('Weekly (start {{day}})', { day })
    }

    // Handle Financial year variants
    if (name.startsWith('Financial')) {
        const monthAbbrev = name.replace('Financial', '')
        const monthMap = {
            April: 'April',
            July: 'July',
            Oct: 'October',
            Nov: 'November',
        }
        const month = monthMap[monthAbbrev] || monthAbbrev
        return i18n.t('Financial year (start {{month}})', { month })
    }

    // Handle Six-monthly variants
    if (name === 'SixMonthly') {
        return i18n.t('Six-monthly')
    }
    if (name.startsWith('SixMonthly')) {
        const monthAbbrev = name.replace('SixMonthly', '')
        const monthMap = {
            April: 'April',
            Nov: 'November',
        }
        const month = monthMap[monthAbbrev] || monthAbbrev
        return i18n.t('Six-monthly (start {{month}})', { month })
    }

    // Handle Quarterly variants
    if (name === 'Quarterly') {
        return i18n.t('Quarterly')
    }
    if (name.startsWith('Quarterly')) {
        const monthAbbrev = name.replace('Quarterly', '')
        const monthMap = {
            Nov: 'November',
        }
        const month = monthMap[monthAbbrev] || monthAbbrev
        return i18n.t('Quarterly (start {{month}})', { month })
    }

    // Handle other common types
    const simpleLabels = {
        Daily: i18n.t('Daily'),
        Monthly: i18n.t('Monthly'),
        BiMonthly: i18n.t('Bi-monthly'),
        Yearly: i18n.t('Yearly'),
        BiWeekly: i18n.t('Bi-weekly'),
    }

    if (simpleLabels[name]) {
        return simpleLabels[name]
    }

    // Fallback: add spaces before capital letters
    return name.replace(/([A-Z])/g, ' $1').trim()
}

// Map frequencyOrder to group labels
const getGroupLabel = (frequencyOrder) => {
    if (frequencyOrder === 1) {
        return i18n.t('Days')
    }
    if (frequencyOrder === 7) {
        return i18n.t('Weeks')
    }
    if (frequencyOrder === 14) {
        return i18n.t('Bi-weeks')
    }
    if (frequencyOrder === 30) {
        return i18n.t('Months')
    }
    if (frequencyOrder === 60) {
        return i18n.t('Bi-months')
    }
    if (frequencyOrder === 91) {
        return i18n.t('Quarters')
    }
    if (frequencyOrder === 182) {
        return i18n.t('Six months')
    }
    if (frequencyOrder === 365) {
        return i18n.t('Years')
    }
    return i18n.t('Other')
}

// Group period types by frequencyOrder
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
    // Sort groups by frequencyOrder and return as array
    return Object.values(groups).sort(
        (a, b) => a.frequencyOrder - b.frequencyOrder
    )
}

const PeriodTypes = () => {
    const { loading, error, data } = useDataQuery(query)

    if (loading) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    if (error) {
        return (
            <div className={styles.error}>
                {i18n.t('Failed to load period types: {{error}}', {
                    error: error.message,
                    nsSeparator: '-:-',
                })}
            </div>
        )
    }

    const allPeriodTypes = data?.periodTypes?.periodTypes || []
    const allowedPeriodTypes = data?.dataOutputPeriodTypes || []

    // Create a Set of allowed period type names for quick lookup
    const allowedSet = new Set(allowedPeriodTypes.map((pt) => pt.name))

    // Group period types by frequency
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
                            {group.periodTypes.map((periodType) => (
                                <div
                                    key={periodType.name}
                                    className={styles.checkboxItem}
                                >
                                    <CheckboxMaterial
                                        checked={allowedSet.has(
                                            periodType.name
                                        )}
                                        label={formatPeriodTypeName(
                                            periodType.name
                                        )}
                                        onCheck={() => {}}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PeriodTypes
