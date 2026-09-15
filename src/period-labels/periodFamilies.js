import i18n from '@dhis2/d2-i18n'

// The period families, in the same order the Data Visualizer period dropdown
// shows them. Each family groups everything that shares a frequency:
//
// - periodTypeNames: the standard/fixed period type variants (used to look up
//   which are enabled and to edit their labels — labels.periodTypes).
// - relativePeriods: the relative periods a user can rename (labels.relativePeriods).
// - startSetting / startToPeriodType: only weekly and financialYear have a start
//   setting that seeds the relative periods; used to caption which variant the
//   relative labels are based on.
//
// Duplicated from settingsKeyMapping.js so the prototype stays self-contained
// and deletable.
export const PERIOD_FAMILIES = [
    {
        id: 'daily',
        label: i18n.t('Days'),
        periodTypeNames: ['Daily'],
        relativePeriods: [
            { id: 'TODAY', builtIn: i18n.t('Today') },
            { id: 'YESTERDAY', builtIn: i18n.t('Yesterday') },
            { id: 'LAST_3_DAYS', builtIn: i18n.t('Last 3 days') },
            { id: 'LAST_7_DAYS', builtIn: i18n.t('Last 7 days') },
            { id: 'LAST_14_DAYS', builtIn: i18n.t('Last 14 days') },
            { id: 'LAST_30_DAYS', builtIn: i18n.t('Last 30 days') },
            { id: 'LAST_60_DAYS', builtIn: i18n.t('Last 60 days') },
            { id: 'LAST_90_DAYS', builtIn: i18n.t('Last 90 days') },
            { id: 'LAST_180_DAYS', builtIn: i18n.t('Last 180 days') },
        ],
    },
    {
        id: 'weekly',
        label: i18n.t('Weeks'),
        startSetting: 'analyticsWeeklyStart',
        startCaptionLabel: i18n.t('Weekly start day'),
        startToPeriodType: {
            WEEKLY: 'Weekly',
            WEEKLY_WEDNESDAY: 'WeeklyWednesday',
            WEEKLY_THURSDAY: 'WeeklyThursday',
            WEEKLY_FRIDAY: 'WeeklyFriday',
            WEEKLY_SATURDAY: 'WeeklySaturday',
            WEEKLY_SUNDAY: 'WeeklySunday',
        },
        periodTypeNames: [
            'Weekly',
            'WeeklyWednesday',
            'WeeklyThursday',
            'WeeklyFriday',
            'WeeklySaturday',
            'WeeklySunday',
        ],
        relativePeriods: [
            { id: 'THIS_WEEK', builtIn: i18n.t('This week') },
            { id: 'LAST_WEEK', builtIn: i18n.t('Last week') },
            { id: 'LAST_4_WEEKS', builtIn: i18n.t('Last 4 weeks') },
            { id: 'LAST_12_WEEKS', builtIn: i18n.t('Last 12 weeks') },
            { id: 'LAST_52_WEEKS', builtIn: i18n.t('Last 52 weeks') },
        ],
    },
    {
        id: 'biWeekly',
        label: i18n.t('Bi-weeks'),
        periodTypeNames: ['BiWeekly'],
        relativePeriods: [
            { id: 'THIS_BIWEEK', builtIn: i18n.t('This bi-week') },
            { id: 'LAST_BIWEEK', builtIn: i18n.t('Last bi-week') },
            { id: 'LAST_4_BIWEEKS', builtIn: i18n.t('Last 4 bi-weeks') },
        ],
    },
    {
        id: 'monthly',
        label: i18n.t('Months'),
        periodTypeNames: ['Monthly'],
        relativePeriods: [
            { id: 'THIS_MONTH', builtIn: i18n.t('This month') },
            { id: 'LAST_MONTH', builtIn: i18n.t('Last month') },
            { id: 'MONTHS_THIS_YEAR', builtIn: i18n.t('Months this year') },
            { id: 'MONTHS_LAST_YEAR', builtIn: i18n.t('Months last year') },
            { id: 'LAST_3_MONTHS', builtIn: i18n.t('Last 3 months') },
            { id: 'LAST_6_MONTHS', builtIn: i18n.t('Last 6 months') },
            { id: 'LAST_12_MONTHS', builtIn: i18n.t('Last 12 months') },
        ],
    },
    {
        id: 'biMonthly',
        label: i18n.t('Bi-months'),
        periodTypeNames: ['BiMonthly'],
        relativePeriods: [
            { id: 'THIS_BIMONTH', builtIn: i18n.t('This bi-month') },
            { id: 'LAST_BIMONTH', builtIn: i18n.t('Last bi-month') },
            { id: 'LAST_6_BIMONTHS', builtIn: i18n.t('Last 6 bi-months') },
        ],
    },
    {
        id: 'quarterly',
        label: i18n.t('Quarters'),
        periodTypeNames: ['Quarterly', 'QuarterlyNov'],
        relativePeriods: [
            { id: 'THIS_QUARTER', builtIn: i18n.t('This quarter') },
            { id: 'LAST_QUARTER', builtIn: i18n.t('Last quarter') },
            { id: 'QUARTERS_THIS_YEAR', builtIn: i18n.t('Quarters this year') },
            { id: 'QUARTERS_LAST_YEAR', builtIn: i18n.t('Quarters last year') },
            { id: 'LAST_4_QUARTERS', builtIn: i18n.t('Last 4 quarters') },
        ],
    },
    {
        id: 'sixMonthly',
        label: i18n.t('Six-months'),
        periodTypeNames: ['SixMonthly', 'SixMonthlyApril', 'SixMonthlyNov'],
        relativePeriods: [
            { id: 'THIS_SIX_MONTH', builtIn: i18n.t('This six-month') },
            { id: 'LAST_SIX_MONTH', builtIn: i18n.t('Last six-month') },
            { id: 'LAST_2_SIXMONTHS', builtIn: i18n.t('Last 2 six-months') },
        ],
    },
    {
        id: 'financialYear',
        label: i18n.t('Financial Years'),
        startSetting: 'analyticsFinancialYearStart',
        startCaptionLabel: i18n.t('Financial year start month'),
        startToPeriodType: {
            FINANCIAL_YEAR_FEBRUARY: 'FinancialFeb',
            FINANCIAL_YEAR_APRIL: 'FinancialApril',
            FINANCIAL_YEAR_JULY: 'FinancialJuly',
            FINANCIAL_YEAR_AUGUST: 'FinancialAug',
            FINANCIAL_YEAR_SEPTEMBER: 'FinancialSep',
            FINANCIAL_YEAR_OCTOBER: 'FinancialOct',
        },
        periodTypeNames: [
            'FinancialApril',
            'FinancialJuly',
            'FinancialOct',
            'FinancialFeb',
            'FinancialAug',
            'FinancialSep',
            'FinancialNov',
        ],
        relativePeriods: [
            {
                id: 'THIS_FINANCIAL_YEAR',
                builtIn: i18n.t('This financial year'),
            },
            {
                id: 'LAST_FINANCIAL_YEAR',
                builtIn: i18n.t('Last financial year'),
            },
            {
                id: 'LAST_5_FINANCIAL_YEARS',
                builtIn: i18n.t('Last 5 financial years'),
            },
        ],
    },
    {
        id: 'yearly',
        label: i18n.t('Years'),
        periodTypeNames: ['Yearly'],
        relativePeriods: [
            { id: 'THIS_YEAR', builtIn: i18n.t('This year') },
            { id: 'LAST_YEAR', builtIn: i18n.t('Last year') },
            { id: 'LAST_5_YEARS', builtIn: i18n.t('Last 5 years') },
            { id: 'LAST_10_YEARS', builtIn: i18n.t('Last 10 years') },
        ],
    },
]

export const ALL_RELATIVE_PERIOD_IDS = PERIOD_FAMILIES.flatMap((family) =>
    family.relativePeriods.map((period) => period.id)
)
