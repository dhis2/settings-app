import i18n from '@dhis2/d2-i18n'

// The two relative period families that have a start setting seeding them.
// startToPeriodType mirrors the maps in settingsKeyMapping.js; duplicated here
// so the prototype stays self-contained and deletable.
export const RELATIVE_PERIOD_SETS = [
    {
        id: 'weekly',
        label: i18n.t('Weekly'),
        startSetting: 'analyticsWeeklyStart',
        periodSelectLabel: 'Period to use for relative weeks',
        startToPeriodType: {
            WEEKLY: 'Weekly',
            WEEKLY_WEDNESDAY: 'WeeklyWednesday',
            WEEKLY_THURSDAY: 'WeeklyThursday',
            WEEKLY_FRIDAY: 'WeeklyFriday',
            WEEKLY_SATURDAY: 'WeeklySaturday',
            WEEKLY_SUNDAY: 'WeeklySunday',
        },
        relativePeriods: [
            { id: 'THIS_WEEK', builtIn: i18n.t('This week') },
            { id: 'LAST_WEEK', builtIn: i18n.t('Last week') },
            { id: 'LAST_4_WEEKS', builtIn: i18n.t('Last 4 weeks') },
            { id: 'LAST_12_WEEKS', builtIn: i18n.t('Last 12 weeks') },
            { id: 'LAST_52_WEEKS', builtIn: i18n.t('Last 52 weeks') },
        ],
    },
    {
        id: 'financialYear',
        label: i18n.t('Financial year'),
        startSetting: 'analyticsFinancialYearStart',
        periodSelectLabel: 'Period to use for relative financial years',
        startToPeriodType: {
            FINANCIAL_YEAR_FEBRUARY: 'FinancialFeb',
            FINANCIAL_YEAR_APRIL: 'FinancialApril',
            FINANCIAL_YEAR_JULY: 'FinancialJuly',
            FINANCIAL_YEAR_AUGUST: 'FinancialAug',
            FINANCIAL_YEAR_SEPTEMBER: 'FinancialSep',
            FINANCIAL_YEAR_OCTOBER: 'FinancialOct',
        },
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
]

export const ALL_RELATIVE_PERIOD_IDS = RELATIVE_PERIOD_SETS.flatMap((set) =>
    set.relativePeriods.map((period) => period.id)
)
