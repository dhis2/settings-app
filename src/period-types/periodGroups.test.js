import { buildGroups, relativeVisible, seedState } from './periodGroups.js'

const api = [
    'FinancialOct',
    'Yearly',
    'WeeklySunday',
    'Weekly',
    'Monthly',
    'TwoYearly',
    'FinancialJuly',
    'SomethingNew',
].map((name) => ({ name, displayName: name }))

describe('buildGroups', () => {
    const groups = buildGroups(api)
    const ids = groups.map((g) => g.family.id)

    it('orders families with Year before Financial year and unknowns last', () => {
        expect(ids).toEqual([
            'weekly',
            'monthly',
            'yearly',
            'financialYear',
            'SomethingNew',
        ])
    })

    it('sorts types within a family by start', () => {
        expect(groups[0].types.map((t) => t.name)).toEqual([
            'Weekly',
            'WeeklySunday',
        ])
        expect(groups[3].types.map((t) => t.name)).toEqual([
            'FinancialJuly',
            'FinancialOct',
        ])
    })

    it('hides TwoYearly and marks Yearly mandatory', () => {
        expect(groups.flatMap((g) => g.types).map((t) => t.name)).not.toContain(
            'TwoYearly'
        )
        expect(groups[2].types[0].mandatory).toBe(true)
    })
})

describe('seedState', () => {
    const weekly = buildGroups(api)[0]
    const monthly = buildGroups(api)[1]

    it('is ok when the seed type is available', () => {
        const state = seedState(weekly, new Set(['WeeklySunday']), {
            analyticsWeeklyStart: 'WEEKLY_SUNDAY',
        })
        expect(state.status).toBe('ok')
        expect(
            relativeVisible(weekly, new Set(['WeeklySunday']), {
                analyticsWeeklyStart: 'WEEKLY_SUNDAY',
            })
        ).toBe(true)
    })

    it('flags a seed pointing at an unavailable type', () => {
        const allowed = new Set(['Weekly'])
        const settings = { analyticsWeeklyStart: 'WEEKLY_SUNDAY' }
        expect(seedState(weekly, allowed, settings).status).toBe('disabled')
        expect(relativeVisible(weekly, allowed, settings)).toBe(false)
    })

    it('reports none enabled when no weekly type is on', () => {
        expect(seedState(weekly, new Set(), {}).status).toBe('noneEnabled')
    })

    it('does not apply to families without a start setting', () => {
        expect(seedState(monthly, new Set(['Monthly']), {}).status).toBe('na')
        expect(relativeVisible(monthly, new Set(['Monthly']), {})).toBe(true)
        expect(relativeVisible(monthly, new Set(), {})).toBe(false)
    })
})
