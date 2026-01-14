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
        settings: [
            {
                setting: 'keyAnalysisRelativePeriod',
            },
            {
                setting: 'keyAnalysisDisplayProperty',
            },
            {
                setting: 'keyAnalysisDigitGroupSeparator',
            },
            {
                setting: 'keyHideDailyPeriods',
                maximumApiVersion: 42,
            },
            {
                setting: 'keyHideWeeklyPeriods',
                maximumApiVersion: 42,
            },
            {
                setting: 'keyHideBiWeeklyPeriods',
                maximumApiVersion: 42,
            },
            {
                setting: 'keyHideMonthlyPeriods',
                maximumApiVersion: 42,
            },
            {
                setting: 'keyHideBiMonthlyPeriods',
                maximumApiVersion: 42,
            },
            {
                setting: 'dataOutputPeriodTypes',
                minimumApiVersion: 43,
            },
            {
                setting: 'analyticsFinancialYearStart',
            },
            {
                setting: 'keyCacheStrategy',
            },
            {
                setting: 'keyCacheability',
            },
            {
                setting: 'keyAnalyticsCacheTtlMode',
            },
            {
                setting: 'keyAnalyticsCacheProgressiveTtlFactor',
            },
            {
                setting: 'keyIgnoreAnalyticsApprovalYearThreshold',
            },
            {
                setting:
                    'keyRespectMetaDataStartEndDatesInAnalyticsTableExport',
            },
            {
                setting: 'keyIncludeZeroValuesInAnalytics',
            },
            {
                setting: 'keyEmbeddedDashboardsEnabled',
                minimumApiVersion: 42,
            },
            {
                setting: 'keyDashboardContextMenuItemSwitchViewType',
            },
            {
                setting: 'keyDashboardContextMenuItemOpenInRelevantApp',
            },
            {
                setting:
                    'keyDashboardContextMenuItemShowInterpretationsAndDetails',
            },
            {
                setting: 'keyDashboardContextMenuItemViewFullscreen',
            },
            {
                setting: 'orgUnitCentroidsInEventsAnalytics',
            },
            {
                setting: 'facilityOrgUnitGroupSet',
            },
            {
                setting: 'facilityOrgUnitLevel',
            },
            {
                setting: 'keyDefaultBaseMap',
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
