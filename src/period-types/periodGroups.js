import { PERIOD_FAMILIES } from '../period-labels/periodFamilies.js'
import { formatPeriodDisplayName } from './builtInPeriodNames.js'

export const HIDDEN_PERIOD_TYPES = new Set(['TwoYearly'])
export const MANDATORY_PERIOD_TYPES = new Set(['Yearly'])

// Order within a family: calendar-start first, then by start day/month.
const periodTypeOrder = {
    Weekly: 1,
    WeeklyWednesday: 2,
    WeeklyThursday: 3,
    WeeklyFriday: 4,
    WeeklySaturday: 5,
    WeeklySunday: 6,
    Quarterly: 1,
    QuarterlyNov: 2,
    SixMonthly: 1,
    SixMonthlyApril: 2,
    SixMonthlyNov: 3,
    FinancialFeb: 1,
    FinancialApril: 2,
    FinancialJuly: 3,
    FinancialAug: 4,
    FinancialSep: 5,
    FinancialOct: 6,
    FinancialNov: 7,
}

// Year reads before Financial year in the availability table.
const FAMILY_ORDER = [
    ...PERIOD_FAMILIES.filter((family) => family.id !== 'financialYear'),
    PERIOD_FAMILIES.find((family) => family.id === 'financialYear'),
]

const toType = (periodType) => ({
    name: periodType.name,
    builtIn: formatPeriodDisplayName(periodType.displayName, periodType.name),
    mandatory: MANDATORY_PERIOD_TYPES.has(periodType.name),
})

// Groups the server's period types by family. Types the app doesn't know
// about still show, each as its own group, so nothing silently disappears.
export const buildGroups = (apiPeriodTypes = []) => {
    const visible = apiPeriodTypes.filter(
        (pt) => !HIDDEN_PERIOD_TYPES.has(pt.name)
    )
    const byName = new Map(visible.map((pt) => [pt.name, pt]))
    const known = new Set()

    const groups = FAMILY_ORDER.map((family) => {
        const types = family.periodTypeNames
            .filter((name) => byName.has(name))
            .sort(
                (a, b) => (periodTypeOrder[a] || 0) - (periodTypeOrder[b] || 0)
            )
            .map((name) => {
                known.add(name)
                return toType(byName.get(name))
            })
        return { family, types }
    }).filter((group) => group.types.length > 0)

    const unknown = visible
        .filter((pt) => !known.has(pt.name))
        .map((pt) => {
            const type = toType(pt)
            return {
                family: {
                    id: pt.name,
                    label: type.builtIn,
                    relativePeriods: [],
                },
                types: [type],
            }
        })

    return [...groups, ...unknown]
}

// Which period type seeds this family's relative periods, and whether
// analytics apps can use it. Only weekly and financial year have a seed.
export const seedState = (group, allowedSet, settings = {}) => {
    const { startSetting, startToPeriodType } = group.family
    if (!startSetting) {
        return { status: 'na', seedType: null, enabledSeedable: [] }
    }
    const seedable = new Set(Object.values(startToPeriodType))
    const enabledSeedable = group.types.filter(
        (type) => seedable.has(type.name) && allowedSet.has(type.name)
    )
    const seedType = startToPeriodType[settings[startSetting]] || null
    let status = 'noneEnabled'
    if (seedType && allowedSet.has(seedType)) {
        status = 'ok'
    } else if (enabledSeedable.length > 0) {
        status = 'disabled'
    }
    return { status, seedType, enabledSeedable }
}

export const seedValueFor = (family, periodTypeName) =>
    Object.keys(family.startToPeriodType || {}).find(
        (value) => family.startToPeriodType[value] === periodTypeName
    )

// Relative periods appear in analytics apps when the seed is available
// (weekly, financial year) or, for other families, when any type is on.
export const relativeVisible = (group, allowedSet, settings) =>
    group.family.startSetting
        ? seedState(group, allowedSet, settings).status === 'ok'
        : group.types.some((type) => allowedSet.has(type.name))
