import i18n from '@dhis2/d2-i18n'

export const categoryOrder = [
    'general',
    'analytics',
    'server',
    'appearance',
    'email',
    'access',
    'calendar',
    'import',
    'sync',
    'scheduledJobs',
    'notification',
    'oauth2',
    'oauth2_41',
]

export const categories = {
    general: {
        label: i18n.t('General'),
        icon: 'settings',
        pageLabel: i18n.t('General settings'),
        settings: [
            {
                setting: 'keyAnalyticsMaxLimit',
            },
            {
                setting: 'keySqlViewMaxLimit',
            },
            {
                setting: 'KeyTrackedEntityMaxLimit',
            },
            {
                setting: 'infrastructuralIndicators',
            },
            {
                setting: 'infrastructuralDataElements',
            },
            {
                setting: 'infrastructuralPeriodType',
            },
            {
                setting: 'feedbackRecipients',
            },
            {
                setting: 'systemUpdateNotificationRecipients',
            },
            {
                setting: 'offlineOrganisationUnitLevel',
            },
            {
                setting: 'factorDeviation',
            },
            {
                setting: 'phoneNumberAreaCode',
            },
            {
                setting: 'multiOrganisationUnitForms',
                maximumApiVersion: 41,
            },
            {
                setting: 'keyAcceptanceRequiredForApproval',
            },
            {
                setting: 'keyGatherAnalyticalObjectStatisticsInDashboardViews',
            },
            {
                setting: 'keyCountPassiveDashboardViewsInUsageAnalytics',
            },
        ],
    },
    analytics: {
        label: i18n.t('Analytics'),
        icon: 'equalizer',
        pageLabel: i18n.t('Analytics settings'),
        sectionLabels: {
            periods: i18n.t('Periods available for analysis'),
            periodSettings: i18n.t('Periods and labels'),
            display: i18n.t('Display & formatting'),
            calculation: i18n.t('Calculation & data output'),
            caching: i18n.t('Caching & performance'),
            dashboards: i18n.t('Dashboards'),
            maps: i18n.t('Maps'),
        },
        settings: [
            {
                setting: 'keyHideDailyPeriods',
                section: 'periods',
                maximumApiVersion: 42,
            },
            {
                setting: 'keyHideWeeklyPeriods',
                section: 'periods',
                maximumApiVersion: 42,
            },
            {
                setting: 'keyHideBiWeeklyPeriods',
                section: 'periods',
                maximumApiVersion: 42,
            },
            {
                setting: 'keyHideMonthlyPeriods',
                section: 'periods',
                maximumApiVersion: 42,
            },
            {
                setting: 'keyHideBiMonthlyPeriods',
                section: 'periods',
                maximumApiVersion: 42,
            },
            {
                setting: 'periodMatrix',
                section: 'periodSettings',
                minimumApiVersion: 43,
            },
            {
                setting: 'keyAnalysisRelativePeriod',
                section: 'periodSettings',
                minimumApiVersion: 43,
            },
            {
                setting: 'keyAnalysisDisplayProperty',
                section: 'display',
            },
            {
                setting: 'keyAnalysisDigitGroupSeparator',
                section: 'display',
            },
            {
                setting: 'keyIncludeZeroValuesInAnalytics',
                section: 'calculation',
            },
            {
                setting:
                    'keyRespectMetaDataStartEndDatesInAnalyticsTableExport',
                section: 'calculation',
            },
            {
                setting: 'keyIgnoreAnalyticsApprovalYearThreshold',
                section: 'calculation',
            },
            {
                setting: 'keyCacheStrategy',
                section: 'caching',
            },
            {
                setting: 'keyCacheability',
                section: 'caching',
            },
            {
                setting: 'keyAnalyticsCacheTtlMode',
                section: 'caching',
            },
            {
                setting: 'keyAnalyticsCacheProgressiveTtlFactor',
                section: 'caching',
            },
            {
                setting: 'keyEmbeddedDashboardsEnabled',
                section: 'dashboards',
                minimumApiVersion: 42,
            },
            {
                setting: 'keyDashboardContextMenuItemSwitchViewType',
                section: 'dashboards',
            },
            {
                setting: 'keyDashboardContextMenuItemOpenInRelevantApp',
                section: 'dashboards',
            },
            {
                setting:
                    'keyDashboardContextMenuItemShowInterpretationsAndDetails',
                section: 'dashboards',
            },
            {
                setting: 'keyDashboardContextMenuItemViewFullscreen',
                section: 'dashboards',
            },
            {
                setting: 'keyDefaultBaseMap',
                section: 'maps',
            },
            {
                setting: 'facilityOrgUnitGroupSet',
                section: 'maps',
            },
            {
                setting: 'facilityOrgUnitLevel',
                section: 'maps',
            },
            {
                setting: 'orgUnitCentroidsInEventsAnalytics',
                section: 'maps',
            },
        ],
    },
    server: {
        label: i18n.t('Server'),
        icon: 'business',
        pageLabel: i18n.t('Server settings'),
        settings: [
            {
                setting: 'keyDatabaseServerCpus',
            },
            {
                setting: 'keySystemNotificationsEmail',
            },
            {
                setting: 'googleAnalyticsUA',
            },
            {
                setting: 'keyGoogleMapsApiKey',
            },
            {
                setting: 'keyBingMapsApiKey',
            },
            {
                setting: 'keyAzureMapsApiKey',
            },
        ],
    },
    appearance: {
        label: i18n.t('Appearance'),
        icon: 'looks',
        pageLabel: i18n.t('Appearance settings'),
        settings: [
            {
                setting: 'localizedText',
            },
            {
                setting: 'keyStyle',
                maximumApiVersion: 42,
            },
            {
                setting: 'keyCustomColor',
                minimumApiVersion: 43,
            },
            {
                setting: 'startModule',
            },
            {
                setting: 'startModuleEnableLightweight',
            },
            {
                setting: 'helpPageLink',
            },
            {
                setting: 'keyFlag',
            },
            {
                setting: 'keyUiLocale',
            },
            {
                setting: 'keyDbLocale',
            },
            {
                setting: 'keyRequireAddToView',
            },
            {
                setting: 'keyUseCustomLogoFront',
            },
            {
                setting: 'keyUseCustomLogoBanner',
            },
            {
                setting: 'loginPageLayout',
            },
            {
                setting: 'loginPageTemplate',
            },
            {
                setting: 'globalShellEnabled',
                minimumApiVersion: 42,
            },
            {
                setting: 'keyCustomTranslationsEnabled',
                minimumApiVersion: 43,
            },
        ],
    },
    email: {
        label: i18n.t('Email'),
        icon: 'email',
        pageLabel: i18n.t('Email settings'),
        settings: [
            {
                setting: 'keyEmailHostName',
            },
            {
                setting: 'keyEmailPort',
            },
            {
                setting: 'keyEmailUsername',
            },
            {
                setting: 'keyEmailPassword',
            },
            {
                setting: 'keyEmailTls',
            },
            {
                setting: 'keyEmailSender',
            },
            {
                setting: 'emailTestButton',
            },
        ],
    },
    access: {
        label: i18n.t('Access'),
        icon: 'lock_open',
        pageLabel: i18n.t('Access settings'),
        settings: [
            {
                setting: 'selfRegistrationRole',
            },
            {
                setting: 'selfRegistrationOrgUnit',
            },
            {
                setting: 'keySelfRegistrationNoRecaptcha',
            },
            {
                setting: 'keyAccountRecovery',
            },
            {
                setting: 'enforceVerifiedEmail',
                minimumApiVersion: 42,
            },
            {
                setting: 'keyLockMultipleFailedLogins',
            },
            {
                setting: 'keyCanGrantOwnUserAuthorityGroups',
            },
            {
                setting: 'keyAllowObjectAssignment',
            },
            {
                setting: 'credentialsExpires',
            },
            {
                setting: 'credentialsExpiryAlert',
            },
            {
                setting: 'credentialsExpiresReminderInDays',
            },
            {
                setting: 'minPasswordLength',
            },
            {
                setting: 'corsWhitelist',
            },
            {
                setting: 'recaptchaSite',
            },
            {
                setting: 'recaptchaSecret',
            },
        ],
    },
    calendar: {
        label: i18n.t('Calendar'),
        icon: 'date_range',
        pageLabel: i18n.t('Calendar settings'),
        settings: [
            {
                setting: 'keyCalendar',
            },
            {
                setting: 'keyDateFormat',
            },
        ],
    },
    import: {
        label: i18n.t('Data Import'),
        icon: 'system_update_alt',
        pageLabel: i18n.t('Data import settings'),
        settings: [
            {
                setting: 'keyDataImportStrictPeriods',
            },
            {
                setting: 'keyDataImportStrictDataElements',
            },
            {
                setting: 'keyDataImportStrictCategoryOptionCombos',
            },
            {
                setting: 'keyDataImportStrictOrganisationUnits',
            },
            {
                setting: 'keyDataImportStrictAttributeOptionCombos',
            },
            {
                setting: 'keyDataImportRequireCategoryOptionCombo',
            },
            {
                setting: 'keyDataImportRequireAttributeOptionCombo',
            },
        ],
    },
    sync: {
        label: i18n.t('Synchronization'),
        icon: 'sync',
        pageLabel: i18n.t('Synchronization settings'),
        settings: [
            {
                setting: 'keyRemoteInstanceUrl',
            },
            {
                setting: 'keyRemoteInstanceUsername',
            },
            {
                setting: 'keyRemoteInstancePassword',
            },
            {
                setting: 'keyMetadataDataVersioning',
            },
        ],
    },
    scheduledJobs: {
        label: i18n.t('Scheduled jobs'),
        icon: 'schedule',
        pageLabel: i18n.t('Scheduled jobs'),
        settings: [
            { setting: 'jobsRescheduleAfterMinutes' },
            { setting: 'jobsCleanupAfterMinutes' },
            { setting: 'jobsMaxCronDelayHours' },
            { setting: 'jobsLogDebugBelowSeconds' },
        ],
    },

    notification: {
        label: i18n.t('Notification settings'),
        icon: 'notifications',
        pageLabel: i18n.t('Notification settings'),
        settings: [
            { setting: 'notifierLogLevel' },
            { setting: 'notifierMaxMessagesPerJob' },
            { setting: 'notifierMaxAgeDays' },
            { setting: 'notifierMaxJobsPerType' },
            { setting: 'notifierCleanAfterIdleTime' },
            { setting: 'notifierGistOverview' },
        ],
    },

    oauth2: {
        label: i18n.t('OAuth2 Clients'),
        icon: 'vpn_lock',
        pageLabel: i18n.t('OAuth2 Clients'),
        authority: 'F_OAUTH2_CLIENT_MANAGE',
        settings: [
            {
                setting: 'oauth2clients',
            },
        ],
        minimumApiVersion: 42,
    },
    oauth2_41: {
        label: i18n.t('OAuth2 Clients'),
        icon: 'vpn_lock',
        pageLabel: i18n.t('OAuth2 Clients'),
        authority: 'F_OAUTH2_CLIENT_MANAGE',
        settings: [
            {
                setting: 'oauth2clients41',
            },
        ],
        maximumApiVersion: 41,
    },
}

export const filterSettingsByApiVersion = ({ settings, apiVersion }) =>
    settings
        .filter((setting) => {
            // return true unless minimum/maximum version is specified and is out of range
            if (
                setting.minimumApiVersion &&
                apiVersion < setting.minimumApiVersion
            ) {
                return false
            }
            if (
                setting.maximumApiVersion &&
                apiVersion > setting.maximumApiVersion
            ) {
                return false
            }
            return true
        })
        .map((setting) => setting.setting)

export const filterCategoriesByApiVersion = ({ categories, apiVersion }) =>
    Object.fromEntries(
        Object.entries(categories).filter(([key]) => {
            if (
                categories[key].minimumApiVersion &&
                apiVersion < categories[key].minimumApiVersion
            ) {
                return false
            }
            if (
                categories[key].maximumApiVersion &&
                apiVersion > categories[key].maximumApiVersion
            ) {
                return false
            }
            return true
        })
    )

export const filterCategoryOrderByApiVersion = ({
    categoryOrder,
    categories,
    apiVersion,
}) =>
    categoryOrder.filter((category) => {
        if (
            categories?.[category]?.minimumApiVersion &&
            apiVersion < categories?.[category]?.minimumApiVersion
        ) {
            return false
        }
        if (
            categories?.[category]?.maximumApiVersion &&
            apiVersion > categories?.[category]?.maximumApiVersion
        ) {
            return false
        }
        return true
    })
