import i18n from '@dhis2/d2-i18n'

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
    Daily: 'Days',
    Weekly: 'Weeks',
    Monthly: 'Months',
    BiMonthly: 'Bi-months',
    Yearly: 'Years',
    BiWeekly: 'Bi-weeks',
    Quarterly: 'Quarters',
    SixMonthly: 'Six months',
}

const formatWeeklyPeriod = (name) => {
    const day = name.replace('Weekly', '')
    if (!day) {
        return simpleLabels.Weekly
    }
    const translatedDay = dayMap[day] || day
    return `Weeks (start ${translatedDay})`
}

const formatPeriodWithMonth = (name, options) => {
    const { prefix, format, defaultLabel } = options
    const monthAbbrev = name.replace(prefix, '')
    if (!monthAbbrev) {
        return defaultLabel
            ? simpleLabels[defaultLabel] || i18n.t(defaultLabel)
            : null
    }
    const month = monthMap[monthAbbrev] || monthAbbrev
    return format(month)
}

const formatFinancialPeriod = (name) => {
    return formatPeriodWithMonth(name, {
        prefix: 'Financial',
        format: (month) => `Financial years (start ${month})`,
        defaultLabel: null,
    })
}

const formatSixMonthlyPeriod = (name) => {
    return formatPeriodWithMonth(name, {
        prefix: 'SixMonthly',
        format: (month) => `Six months (start ${month})`,
        defaultLabel: 'SixMonthly',
    })
}

const formatQuarterlyPeriod = (name) => {
    return formatPeriodWithMonth(name, {
        prefix: 'Quarterly',
        format: (month) => `Quarters (start ${month})`,
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
        return `Financial years (start ${monthMap.Sep})`
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

export { formatPeriodDisplayName }
