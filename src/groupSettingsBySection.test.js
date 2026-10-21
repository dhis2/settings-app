import {
    getSectionLabelForSetting,
    groupSettingsBySection,
} from './groupSettingsBySection.js'

const categories = {
    analytics: {
        sectionLabels: {
            periods: 'Periods',
            maps: 'Maps',
        },
        settings: [
            { setting: 'hideDaily', section: 'periods' },
            { setting: 'relativePeriod', section: 'periods' },
            { setting: 'basemap', section: 'maps' },
            { setting: 'centroids', section: 'maps' },
        ],
    },
    general: {
        settings: [{ setting: 'maxLimit' }],
    },
}

describe('groupSettingsBySection', () => {
    it('returns a single unlabeled group when the category has no sections', () => {
        expect(
            groupSettingsBySection({
                category: 'general',
                settingKeys: ['maxLimit'],
                categories,
            })
        ).toEqual([{ id: 'all', label: null, settings: ['maxLimit'] }])
    })

    it('groups consecutive settings that share a section', () => {
        expect(
            groupSettingsBySection({
                category: 'analytics',
                settingKeys: [
                    'hideDaily',
                    'relativePeriod',
                    'basemap',
                    'centroids',
                ],
                categories,
            })
        ).toEqual([
            {
                id: 'periods',
                label: 'Periods',
                settings: ['hideDaily', 'relativePeriod'],
            },
            {
                id: 'maps',
                label: 'Maps',
                settings: ['basemap', 'centroids'],
            },
        ])
    })

    it('keeps search results in a single unlabeled group', () => {
        expect(
            groupSettingsBySection({
                category: 'search',
                settingKeys: ['hideDaily', 'basemap'],
                categories,
            })
        ).toEqual([
            {
                id: 'all',
                label: null,
                settings: ['hideDaily', 'basemap'],
            },
        ])
    })
})

describe('getSectionLabelForSetting', () => {
    it('returns the section label for a setting that belongs to a section', () => {
        expect(
            getSectionLabelForSetting({
                settingKey: 'basemap',
                categories,
            })
        ).toBe('Maps')
    })

    it('returns null when the setting has no section', () => {
        expect(
            getSectionLabelForSetting({
                settingKey: 'maxLimit',
                categories,
            })
        ).toBe(null)
    })
})
