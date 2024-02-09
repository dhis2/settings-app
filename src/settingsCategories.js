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
    'oauth2',
]

export const categories = {
    general: {
        label: i18n.t('General'),
        icon: 'settings',
        pageLabel: i18n.t('General settings'),
        settings: [
            'keyAnalyticsMaxLimit',
            'keySqlViewMaxLimit',
            'infrastructuralIndicators',
            'infrastructuralDataElements',
            'infrastructuralPeriodType',
            'feedbackRecipients',
            'systemUpdateNotificationRecipients',
            'offlineOrganisationUnitLevel',
            'factorDeviation',
            'phoneNumberAreaCode',
            'multiOrganisationUnitForms',
            'keyAcceptanceRequiredForApproval',
            'keyGatherAnalyticalObjectStatisticsInDashboardViews',
            'keyCountPassiveDashboardViewsInUsageAnalytics',
        ],
    },
    analytics: {
        label: i18n.t('Analytics'),
        icon: 'equalizer',
        pageLabel: i18n.t('Analytics settings'),
        settings: [
            'keyAnalysisRelativePeriod',
            'keyAnalysisDisplayProperty',
            'keyAnalysisDigitGroupSeparator',
            'keyHideDailyPeriods',
            'keyHideWeeklyPeriods',
            'keyHideBiWeeklyPeriods',
            'keyHideMonthlyPeriods',
            'keyHideBiMonthlyPeriods',
            'analyticsFinancialYearStart',
            'keyCacheStrategy',
            'keyCacheability',
            'keyAnalyticsCacheTtlMode',
            'keyAnalyticsCacheProgressiveTtlFactor',
            'keyIgnoreAnalyticsApprovalYearThreshold',
            'keyRespectMetaDataStartEndDatesInAnalyticsTableExport',
            'keyIncludeZeroValuesInAnalytics',
            'keyDashboardContextMenuItemSwitchViewType',
            'keyDashboardContextMenuItemOpenInRelevantApp',
            'keyDashboardContextMenuItemShowInterpretationsAndDetails',
            'keyDashboardContextMenuItemViewFullscreen',
            'facilityOrgUnitGroupSet',
            'facilityOrgUnitLevel',
            'keyDefaultBaseMap',
        ],
    },
    server: {
        label: i18n.t('Server'),
        icon: 'business',
        pageLabel: i18n.t('Server settings'),
        settings: [
            'keyDatabaseServerCpus',
            'keySystemNotificationsEmail',
            'googleAnalyticsUA',
            'keyGoogleMapsApiKey',
            'keyBingMapsApiKey',
        ],
    },
    appearance: {
        label: i18n.t('Appearance'),
        icon: 'looks',
        pageLabel: i18n.t('Appearance settings'),
        settings: [
            'localizedText',
            'keyStyle',
            'startModule',
            'startModuleEnableLightweight',
            'helpPageLink',
            'keyFlag',
            'keyUiLocale',
            'keyDbLocale',
            'keyRequireAddToView',
            'keyUseCustomLogoFront',
            'keyUseCustomLogoBanner',
        ],
    },
    email: {
        label: i18n.t('Email'),
        icon: 'email',
        pageLabel: i18n.t('Email settings'),
        settings: [
            'keyEmailHostName',
            'keyEmailPort',
            'keyEmailUsername',
            'keyEmailPassword',
            'keyEmailTls',
            'keyEmailSender',
            'emailTestButton',
        ],
    },
    access: {
        label: i18n.t('Access'),
        icon: 'lock_open',
        pageLabel: i18n.t('Access settings'),
        settings: [
            'selfRegistrationRole',
            'selfRegistrationOrgUnit',
            'keySelfRegistrationNoRecaptcha',
            'keyAccountRecovery',
            'keyLockMultipleFailedLogins',
            'keyCanGrantOwnUserAuthorityGroups',
            'keyAllowObjectAssignment',
            'credentialsExpires',
            'credentialsExpiryAlert',
            'credentialsExpiresReminderInDays',
            'minPasswordLength',
            'corsWhitelist',
            'recaptchaSite',
            'recaptchaSecret',
        ],
    },
    calendar: {
        label: i18n.t('Calendar'),
        icon: 'date_range',
        pageLabel: i18n.t('Calendar settings'),
        settings: ['keyCalendar', 'keyDateFormat'],
    },
    import: {
        label: i18n.t('Data Import'),
        icon: 'system_update_alt',
        pageLabel: i18n.t('Data import settings'),
        settings: [
            'keyDataImportStrictPeriods',
            'keyDataImportStrictDataElements',
            'keyDataImportStrictCategoryOptionCombos',
            'keyDataImportStrictOrganisationUnits',
            'keyDataImportStrictAttributeOptionCombos',
            'keyDataImportRequireCategoryOptionCombo',
            'keyDataImportRequireAttributeOptionCombo',
        ],
    },
    sync: {
        label: i18n.t('Synchronization'),
        icon: 'sync',
        pageLabel: i18n.t('Synchronization settings'),
        settings: [
            'keyRemoteInstanceUrl',
            'keyRemoteInstanceUsername',
            'keyRemoteInstancePassword',
            'keyMetadataDataVersioning',
        ],
    },
    scheduledJobs: {
        label: i18n.t('Scheduled jobs'),
        icon: 'schedule',
        pageLabel: i18n.t('Scheduled jobs'),
        settings: [
            'jobsRescheduleAfterMinutes',
            'jobsCleanupAfterMinutes',
            'jobsMaxCronDelayHours',
            'jobsLogDebugBelowSeconds',
        ],
    },
    oauth2: {
        label: i18n.t('OAuth2 Clients'),
        icon: 'vpn_lock',
        pageLabel: i18n.t('OAuth2 Clients'),
        authority: 'F_OAUTH2_CLIENT_MANAGE',
        settings: ['oauth2clients'],
    },
}
