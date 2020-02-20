export const categoryOrder = [
    'general',
    'server',
    'appearance',
    'email',
    'access',
    'calendar',
    'import',
    'sync',
    'monitoring',
    'oauth2',
];

export const categories = {
    general: {
        label: 'general',
        icon: 'settings',
        pageLabel: 'general_settings',
        settings: [
            'keyAnalyticsMaxLimit',
            'keySqlViewMaxLimit',
            'infrastructuralIndicators',
            'infrastructuralDataElements',
            'infrastructuralPeriodType',
            'keyAnalysisRelativePeriod',
            'feedbackRecipients',
            'offlineOrganisationUnitLevel',
            'factorDeviation',
            'phoneNumberAreaCode',
            'multiOrganisationUnitForms',
            'keyAcceptanceRequiredForApproval',
        ],
    },
    analytics: {
        label: 'analytics',
        icon: 'equalizer',
        pageLabel: 'analytics_settings',
        settings: [
            'keyAnalysisRelativePeriod',
            'keyHideDailyPeriods',
            'keyHideWeeklyPeriods',
            'keyHideMonthlyPeriods',
            'keyHideBiMonthlyPeriods',
            'analyticsFinancialYearStart',
            'keyCacheability',
            'keyCacheStrategy',
            'keyIgnoreAnalyticsApprovalYearThreshold',
            'keyCacheAnalyticsDataYearThreshold',
            'keyRespectMetaDataStartEndDatesInAnalyticsTableExport',
            'keyAnalyticsMaintenanceMode',
            'keySkipZeroValuesInAnalyticsTableExport',
        ],
    },
    server: {
        label: 'server',
        icon: 'business',
        pageLabel: 'server_settings',
        settings: [
            'keyDatabaseServerCpus',
            'keySystemNotificationsEmail',
            'googleAnalyticsUA',
            'keyBingMapsApiKey',
        ],
    },
    appearance: {
        label: 'appearance',
        icon: 'looks',
        pageLabel: 'appearance_settings',
        settings: [
            'localizedText',
            'keyStyle',
            'startModule',
            'helpPageLink',
            'keyFlag',
            'keyUiLocale',
            'keyDbLocale',
            'keyAnalysisDisplayProperty',
            'keyAnalysisDigitGroupSeparator',
            'keyRequireAddToView',
            'keyUseCustomLogoFront',
            'keyUseCustomLogoBanner',
        ],
    },
    email: {
        label: 'email',
        icon: 'email',
        pageLabel: 'email_settings',
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
        label: 'access',
        icon: 'lock_open',
        pageLabel: 'access_settings',
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
            'minPasswordLength',
            'keyOpenIdProvider',
            'keyOpenIdProviderLabel',
            'corsWhitelist',
            'keyGoogleMapsApiKey',
            'recaptchaSite',
            'recaptchaSecret',
        ],
    },
    calendar: {
        label: 'calendar',
        icon: 'date_range',
        pageLabel: 'calendar_settings',
        settings: [
            'keyCalendar',
            'keyDateFormat',
        ],
    },
    import: {
        label: 'import',
        icon: 'system_update_alt',
        pageLabel: 'import_settings',
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
        label: 'synchronization',
        icon: 'sync',
        pageLabel: 'synchronization_settings',
        settings: [
            'keyRemoteInstanceUrl',
            'keyRemoteInstanceUsername',
            'keyRemoteInstancePassword',
            'keyMetadataDataVersioning',
        ],
    },
    oauth2: {
        label: 'oauth2_clients',
        icon: 'vpn_lock',
        pageLabel: 'oauth2_clients',
        authority: 'F_OAUTH2_CLIENT_MANAGE',
        settings: ['oauth2clients'],
    },
};
