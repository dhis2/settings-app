import { useDataQuery } from '@dhis2/app-runtime'
import { useD2 } from '@dhis2/app-runtime-adapter-d2'
import { CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react'
import App from './app.component'
import 'material-design-icons-iconfont'
import configOptionStore from './configOptionStore'
import i18n from './locales'

const query = {
    indicatorGroups: {
        resource: 'indicatorGroups',
        params: {
            paging: false,
            fields: 'id,displayName',
            order: 'displayName:asc',
        },
    },
    dataElementGroups: {
        resource: 'dataElementGroups',
        params: {
            paging: false,
            fields: 'id,displayName',
            order: 'displayName:asc',
        },
    },
    userGroups: {
        resource: 'userGroups',
        params: {
            paging: false,
            fields: 'id,displayName',
            order: 'displayName:asc',
        },
    },
    organisationUnitLevels: {
        resource: 'organisationUnitLevels',
        params: {
            paging: false,
            fields: 'id,level,displayName',
            order: 'level:asc',
        },
    },
    userRoles: {
        resource: 'userRoles',
        params: {
            paging: false,
            fields: 'id,displayName',
            order: 'displayName:asc',
        },
    },
    organisationUnits: {
        resource: 'organisationUnits',
        params: {
            paging: false,
            fields: 'id,displayName',
            filter: ['level:in:[1,2]'],
        },
    },
    apps: {
        resource: 'action::menu/getModules',
    },
    flags: {
        resource: 'system/flags',
    },
    styles: {
        resource: 'system/styles',
    },
    uiLocales: {
        resource: 'locales/ui',
    },
    dbLocales: {
        resource: 'locales/db',
    },
    userSettings: {
        resource: 'userSettings',
    },
}

const AppWrapper = () => {
    const { d2 } = useD2()
    const { loading, error, data } = useDataQuery(query)

    if (error) {
        return (
            <CenteredContent>
                <p>
                    {i18n.t('Failed to load: {{error}}', {
                        error: error.message,
                        nsSeparator: null,
                    })}
                </p>
            </CenteredContent>
        )
    }

    if (!d2 || loading) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    const {
        indicatorGroups,
        dataElementGroups,
        userGroups,
        organisationUnitLevels,
        userRoles,
        organisationUnits,
        userSettings,
    } = data

    const startModules = (data.apps.modules || []).map(module => ({
        id:
            module.defaultAction.substr(0, 3) === '../'
                ? module.name
                : `app:${module.name}`,
        displayName: module.displayName || module.name,
    }))

    const flags = (data.flags || []).map(flag => ({
        id: flag.key,
        displayName: flag.name,
    }))
    flags.unshift({
        id: 'dhis2',
        displayName: d2.i18n.getTranslation('no_flag'),
    })

    const styles = (data.styles || []).map(style => ({
        id: style.path,
        displayName: style.name,
    }))

    const uiLocales = (data.uiLocales || []).map(locale => ({
        id: locale.locale,
        displayName: locale.name,
    }))
    const dbLocales = (data.dbLocales || []).map(locale => ({
        id: locale.locale,
        displayName: locale.name,
    }))

    configOptionStore.setState({
        indicatorGroups: indicatorGroups.indicatorGroups,
        dataElementGroups: dataElementGroups.dataElementGroups,
        userGroups: userGroups.userGroups,
        organisationUnitLevels: organisationUnitLevels.organisationUnitLevels,
        userRoles: userRoles.userRoles,
        organisationUnits: organisationUnits.organisationUnits,
        startModules,
        flags,
        styles,
        uiLocales,
        dbLocales,
        userSettingsNoFallback: userSettings,
    })

    return <App d2={d2} />
}

export default AppWrapper
