
export const categoryOrder = [
    'general',
    'server',
    'appearance',
    'email',
    'access',
    'approval',
    'calendar',
    'import',
    'sync',
    'oauth2',
];

export const categories = {
    general: {
        label: 'general_settings',
        settings: [
            'keyAnalyticsMaxLimit',
            'infrastructuralIndicators',
            'infrastructuralDataElements',
            'infrastructuralPeriodType',
            'keyAnalysisRelativePeriod',
            'feedbackRecipients',
            'offlineOrganisationUnitLevel',
            'factorDeviation',
            'phoneNumberAreaCode',
            'multiOrganisationUnitForms',
            'keyAnalyticsMaintenanceMode',
        ],
    },
    server: {
        label: 'server_settings',
        settings: [
            'keyCacheStrategy',
            'keyDatabaseServerCpus',
            'keySystemNotificationsEmail',
            'keyInstanceBaseUrl',
            'googleAnalyticsUA',
        ],
    },
    appearance: {
        label: 'appearance_settings',
        settings: [
            'applicationTitle',
            'keyApplicationIntro',
            'keyApplicationNotification',
            'keyApplicationFooter',
            'keyApplicationRightFooter',
            'currentStyle',
            'startModule',
            'helpPageLink',
            'keyFlag',
            'keyRequireAddToView',
            'keyCustomLoginPageLogo',
            'keyCustomTopMenuLogo',
        ],
    },
    email: {
        label: 'email_settings',
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
        label: 'access_settings',
        settings: [
            'selfRegistrationRole',
            'keySelfRegistrationNoRecaptcha',
            'selfRegistrationOrgUnit',
            'keyAccountRecovery',
            'keyCanGrantOwnUserAuthorityGroups',
            'keyAllowObjectAssignment',
            'credentialsExpires',
            'keyOpenIdProvider',
            'keyOpenIdProviderLabel',
            'corsWhitelist',
        ],
    },
    approval: {
        label: 'approval_settings',
        settings: [
            'keyHideUnapprovedDataInAnalytics',
            'keyAcceptanceRequiredForApproval',
            'dataApprovalLevels',
        ],
    },
    calendar: {
        label: 'calendar_settings',
        settings: [
            'keyCalendar',
            'keyDateFormat',
        ],
    },
    'import': {
        label: 'import_settings',
        settings: [
            'keyDataImportStrictPeriods',
            'keyDataImportStrictCategoryOptionCombos',
            'keyDataImportStrictOrganisationUnits',
            'keyDataImportStrictAttributeOptionCombos',
            'keyDataImportRequireCategoryOptionCombo',
            'keyDataImportRequireAttributeOptionCombo',
        ],
    },
    sync: {
        label: 'synchronization_settings',
        settings: [
            'remoteServerUrl',
            'remoteServerUsername',
            'remoteServerPassword',
        ],
    },
    oauth2: {
        label: 'oauth2_clients',
        authority: 'F_OAUTH2_CLIENT_MANAGE',
        settings: ['oauth2clients'],
    },
};
