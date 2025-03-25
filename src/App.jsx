import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import { useD2 } from '@dhis2/app-runtime-adapter-d2'
import { CssVariables, CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react'
// to ensure that i18n is first imported from locales/index, i18n is imported before App
// eslint-disable-next-line import/order
import i18n from './locales/index.js'
import App from './app.component.jsx'
import 'material-design-icons-iconfont'
import configOptionStore from './configOptionStore.js'

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
    organisationUnitGroupSets: {
        resource: 'organisationUnitGroupSets',
        params: {
            paging: false,
            fields: 'id,displayName',
        },
    },
    basemaps: {
        resource: 'externalMapLayers',
        params: {
            paging: false,
            fields: 'id,displayName',
            filter: ['mapLayerPosition:eq:BASEMAP'],
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
    userSettingsNoFallback: {
        resource: 'userSettings',
        params: {
            useFallback: false,
        },
    },
}

const AppWrapper = () => {
    const { d2 } = useD2()
    const { apiVersion } = useConfig()
    const { loading, error, data } = useDataQuery(query)

    if (error) {
        return (
            <CenteredContent>
                <p>
                    {i18n.t('Failed to load: {{error}}', {
                        error: error.message,
                        nsSeparator: '-:-',
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
        basemaps,
        indicatorGroups,
        dataElementGroups,
        userGroups,
        organisationUnitLevels,
        organisationUnitGroupSets,
        userRoles,
        organisationUnits,
        userSettingsNoFallback,
    } = data

    const startModules = (data.apps.modules || []).map((module) => ({
        id:
            module.defaultAction.substr(0, 3) === '../'
                ? module.name
                : `apps/${module.name}`,
        displayName: module.displayName || module.name,
    }))

    const flags = (data.flags || []).map((flag) => ({
        id: flag.key,
        displayName: flag.name,
    }))
    flags.unshift({
        id: 'dhis2',
        displayName: i18n.t('No flag'),
    })

    const styles = (data.styles || []).map((style) => ({
        id: style.path,
        displayName: style.name,
    }))

    const uiLocales = (data.uiLocales || []).map((locale) => ({
        id: locale.locale,
        displayName:
            locale.name === locale.displayName
                ? locale.name
                : `${locale.name} — ${locale.displayName}`,
    }))
    const dbLocales = (data.dbLocales || []).map((locale) => ({
        id: locale.locale,
        displayName:
            locale.name === locale.displayName
                ? locale.name
                : `${locale.name} — ${locale.displayName}`,
    }))

    configOptionStore.setState({
        indicatorGroups: indicatorGroups.indicatorGroups,
        dataElementGroups: dataElementGroups.dataElementGroups,
        userGroups: userGroups.userGroups,
        organisationUnitLevels: organisationUnitLevels.organisationUnitLevels,
        organisationUnitGroupSets:
            organisationUnitGroupSets.organisationUnitGroupSets,
        basemaps: basemaps.externalMapLayers,
        userRoles: userRoles.userRoles,
        organisationUnits: organisationUnits.organisationUnits,
        startModules,
        flags,
        styles,
        uiLocales,
        dbLocales,
        userSettingsNoFallback,
    })

    return (
        <>
            <CssVariables spacers colors />
            <App d2={d2} apiVersion={apiVersion} />
        </>
    )
}

export default AppWrapper
