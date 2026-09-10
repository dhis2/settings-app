export const groupSettingsBySection = ({
    category,
    settingKeys,
    categories,
}) => {
    const categoryDef = categories[category]
    if (!categoryDef?.sectionLabels) {
        return [{ id: 'all', label: null, settings: settingKeys }]
    }

    const { sectionLabels, settings: settingDefs } = categoryDef
    const sectionByKey = Object.fromEntries(
        settingDefs.map((setting) => [setting.setting, setting.section || null])
    )

    return settingKeys.reduce((groups, key) => {
        const sectionId = sectionByKey[key] || null
        const last = groups[groups.length - 1]
        if (last && last.id === sectionId) {
            last.settings.push(key)
            return groups
        }

        groups.push({
            id: sectionId,
            label: sectionId ? sectionLabels[sectionId] : null,
            settings: [key],
        })
        return groups
    }, [])
}

export const getSectionLabelForSetting = ({ settingKey, categories }) => {
    for (const categoryDef of Object.values(categories)) {
        const match = categoryDef.settings?.find(
            (setting) => setting.setting === settingKey && setting.section
        )
        if (match) {
            return categoryDef.sectionLabels?.[match.section] || null
        }
    }
    return null
}
