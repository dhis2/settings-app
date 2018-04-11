/**
 * This file provides information about DHIS2 system settings and configuration options that are not otherwise
 * available through the API.
 * </p>
 * Each system settings key is mapped to an I18N label and (optional) description. In addition, certain special system
 * settings that are not actually saved as system settings but rather as system configuration options are described
 * here as well. This concerns any key that has a "configuration" property which is set to `true`.
 * </p>
 * Settings that have an `appendLocale: true` property, are localizable settings. When these settings are saved, the
 * code of the specified locale, such as "fr" or "ar_IQ" is appended to the key name.
 *
 * @type {{settingsKey: {label: string, description: string, configuration: boolean, appendLocale: boolean}}}
 */
const settingsKeyMapping = {
    /* ============================================================================================================ */
    /* Category: General                                                                                            */
    /* ============================================================================================================ */
    keyAnalyticsMaxLimit: { // Analytics
        label: 'Maximum number of analytics records',
        type: 'dropdown',
        options: {
            50000: 50000,
            100000: 100000,
            200000: 200000,
            0: 'Unlimited',
        },
    },
    infrastructuralIndicators: {
        label: 'Infrastructural indicators',
        configuration: true,
        type: 'dropdown',
        source: 'indicatorGroups',
    },
    infrastructuralDataElements: {
        label: 'Infrastructural data elements',
        configuration: true,
        type: 'dropdown',
        source: 'dataElementGroups',
    },
    infrastructuralPeriodType: {
        label: 'Infrastructural period type',
        configuration: true,
        type: 'dropdown',
        options: {
            Daily: 'Daily',
            Weekly: 'Weekly',
            Monthly: 'Monthly',
            BiMonthly: 'BiMonthly',
            Quarterly: 'Quarterly',
            SixMonthly: 'SixMonthly',
            SixMonthlyApril: 'SixMonthlyApril',
            Yearly: 'Yearly',
            FinancialApril: 'FinancialApril',
            FinancialJuly: 'FinancialJuly',
            FinancialOct: 'FinancialOct',
        },
    },
    feedbackRecipients: {
        label: 'Feedback recipients',
        configuration: true,
        type: 'dropdown',
        source: 'userGroups',
        includeEmpty: true,
        emptyLabel: 'No message recipients',
    },
    offlineOrganisationUnitLevel: {
        label: 'Max offline organisation unit levels',
        description: 'relative to current user',
        configuration: true,
        type: 'dropdown',
        source: 'organisationUnitLevels',
    },
    factorDeviation: {
        label: 'Data analysis std dev factor',
        validators: ['positive_number'],
    },
    phoneNumberAreaCode: {
        label: 'Phone number area code',
        validators: ['number'],
    },
    helpPageLink: {
        label: 'Help page link',
        validators: ['relative_url'],
    },
    multiOrganisationUnitForms: {
        label: 'Enable multi-organisation unit forms',
        type: 'checkbox',
    },
    omitIndicatorsZeroNumeratorDataMart: {
        label: 'Omit indicator values with zero numerator in data mart',
        type: 'checkbox',
    },
    keyAnalyticsMaintenanceMode: { // Analytics
        label: 'Put analytics in maintenance mode',
        type: 'checkbox',
    },
    keyHideUnapprovedDataInAnalytics: {
        label: 'Max number of years to hide unapproved data in analytics',
        type: 'checkbox',
    },
    keyAcceptanceRequiredForApproval: {
        label: 'Acceptance required before approval',
        type: 'checkbox',
    },
    recaptchaSecret: {
        label: 'recaptcha_secret_label',
    },
    recaptchaSite: {
        label: 'recaptcha_site_label',
    },
    /* ============================================================================================================ */
    /* Category: Analytics                                                                                          */
    /* ============================================================================================================ */
    keyAnalysisRelativePeriod: {
        label: 'Default relative period for analysis',
        type: 'dropdown',
        options: {
            THIS_MONTH: 'This month',
            LAST_MONTH: 'Last month',
            THIS_BIMONTH: 'This bi-month',
            LAST_BIMONTH: 'Last bi-month',
            THIS_QUARTER: 'This quarter',
            LAST_QUARTER: 'Last quarter',
            THIS_SIX_MONTH: 'This six-month',
            LAST_SIX_MONTH: 'Last six-month',
            MONTHS_THIS_YEAR: 'MONTHS_THIS_YEAR',
            QUARTERS_THIS_YEAR: 'QUARTERS_THIS_YEAR',
            THIS_YEAR: 'THIS_YEAR',
            MONTHS_LAST_YEAR: 'MONTHS_LAST_YEAR',
            QUARTERS_LAST_YEAR: 'QUARTERS_LAST_YEAR',
            LAST_YEAR: 'LAST_YEAR',
            LAST_5_YEARS: 'Last 5 years',
            LAST_12_MONTHS: 'LAST_12_MONTHS',
            LAST_6_MONTHS: 'LAST_6_MONTHS',
            LAST_3_MONTHS: 'LAST_3_MONTHS',
            LAST_6_BIMONTHS: 'LAST_6_BIMONTHS',
            LAST_4_QUARTERS: 'LAST_4_QUARTERS',
            LAST_2_SIXMONTHS: 'LAST_2_SIXMONTHS',
            THIS_FINANCIAL_YEAR: 'THIS_FINANCIAL_YEAR',
            LAST_FINANCIAL_YEAR: 'LAST_FINANCIAL_YEAR',
            LAST_5_FINANCIAL_YEARS: 'LAST_5_FINANCIAL_YEARS',
            THIS_WEEK: 'This week',
            LAST_WEEK: 'LAST_WEEK',
            LAST_4_WEEKS: 'LAST_4_WEEKS',
            LAST_12_WEEKS: 'LAST_12_WEEKS',
            LAST_52_WEEKS: 'LAST_52_WEEKS',
        },
    },
    analyticsFinancialYearStart: {
        label: 'analytics_financial_year_start',
        type: 'dropdown',
        options: {
            FINANCIAL_YEAR_APRIL: 'APRIL',
            FINANCIAL_YEAR_JULY: 'JULY',
            FINANCIAL_YEAR_OCTOBER: 'OCTOBER',
        },
    },
    keyCacheability: {
        label: 'Cacheability',
        type: 'dropdown',
        options: {
            PUBLIC: 'Public',
            PRIVATE: 'Private',
        },
    },
    keyCacheStrategy: {
        label: 'Cache strategy',
        type: 'dropdown',
        options: {
            NO_CACHE: 'No cache',
            CACHE_15_MINUTES: 'Cache for 15 minutes',
            CACHE_30_MINUTES: 'Cache for 30 minutes',
            CACHE_1_HOUR: 'Cache for one hour',
            CACHE_6AM_TOMORROW: 'Cache until 6 AM tomorrow',
            CACHE_TWO_WEEKS: 'Cache for two weeks',
        },
    },
    keyIgnoreAnalyticsApprovalYearThreshold: {
        label: 'Max number of years to hide unapproved data in analytics',
        type: 'dropdown',
        options: {
            '-1': 'Never check approval',
            0: 'Check approval for all data',
            1: 'Current year only',
            2: 'Last 2 years',
            3: 'Last 3 years',
            4: 'Last 4 years',
            5: 'Last 5 years',
            6: 'Last 6 years',
            7: 'Last 7 years',
            8: 'Last 8 years',
            9: 'Last 9 years',
            10: 'Last 10 years',
        },
    },
    keyCacheAnalyticsDataYearThreshold: {
        label: 'Threshold for analytics data caching',
        type: 'dropdown',
        options: {
            0: 'No caching',
            1: '1 year',
            2: '2 years',
            3: '3 years',
            4: '4 years',
            5: '5 years',
            6: '6 years',
            7: '7 years',
            8: '8 years',
            9: '9 years',
            10: '10 years',
            11: '11 years',
            12: '12 years',
            13: '13 years',
            14: '14 years',
            15: '15 years',
        },
    },
    keySkipDataTypeValidationInAnalyticsTableExport: {
        label: 'Skip data type validation in analytics table export',
        type: 'checkbox',
    },
    keyRespectMetaDataStartEndDatesInAnalyticsTableExport: {
        label: 'Respect category option start and end date in analytics table export',
        type: 'checkbox',
    },
    /* ============================================================================================================ */
    /* Category: Server                                                                                             */
    /* ============================================================================================================ */
    keyDatabaseServerCpus: {
        label: 'Number of database server CPUs',
        type: 'dropdown',
        options: {
            0: 'Automatic (detect based on web server)',
            1: '1', 2: '2', 3: '3', 4: '4', 5: '5',     // eslint-disable-line
            6: '6', 7: '7', 8: '8', 16: '16', 32: '32', // eslint-disable-line
        },
    },
    keySystemNotificationsEmail: {
        label: 'System notifications email address',
        validators: ['email'],
    },
    keyInstanceBaseUrl: {
        label: 'Server base URL',
        validators: ['url'],
    },
    googleAnalyticsUA: {
        label: 'Google Analytics (Universal Analytics) key',
    },
    /* ============================================================================================================ */
    /* Category: Appearance                                                                                         */
    /* ============================================================================================================ */
    localizedText: {
        type: 'localizedAppearance',
        searchLabels: [
            'Application title',
            'Application introduction',
            'Application notification',
            'Application left-side footer',
            'Application right-side footer',
        ],
    },
    applicationTitle: {
        label: 'Application title',
        appendLocale: true,
        multiLine: true,
    },
    keyApplicationIntro: {
        label: 'Application introduction',
        description: 'allows_html',
        appendLocale: true,
        multiLine: true,
    },
    keyApplicationNotification: {
        label: 'Application notification',
        description: 'allows_html',
        appendLocale: true,
        multiLine: true,
    },
    keyApplicationFooter: {
        label: 'Application left-side footer',
        description: 'allows_html',
        appendLocale: true,
        multiLine: true,
    },
    keyApplicationRightFooter: {
        label: 'Application right-side footer',
        description: 'allows_html',
        appendLocale: true,
        multiLine: true,
    },
    keyStyle: {
        label: 'Style',
        type: 'dropdown',
        includeEmpty: false,
        userSettingsOverride: true,
        searchLabels: ['Style', 'This setting can be overridden by user settings'],
        source: 'styles',
    },
    startModule: {
        label: 'Start page',
        type: 'dropdown',
        source: 'startModules',
    },
    keyFlag: {
        label: 'Flag',
        type: 'dropdown',
        source: 'flags',
    },
    keyUiLocale: {
        label: 'Interface language',
        type: 'dropdown',
        userSettingsOverride: true,
        searchLabels: ['Style', 'This setting can be overridden by user settings'],
        source: 'locales',
    },
    keyDbLocale: {
        label: 'Database language',
        type: 'dropdown',
        userSettingsOverride: true,
        searchLabels: ['Style', 'This setting can be overridden by user settings'],
        source: 'locales',
    },
    keyAnalysisDisplayProperty: {
        label: 'Property to display in analysis modules',
        type: 'dropdown',
        userSettingsOverride: true,
        searchLabels: ['Style', 'This setting can be overridden by user settings'],
        options: {
            name: 'Name',
            shortName: 'Short name',
        },
    },
    keyAnalysisDigitGroupSeparator: {
        label: 'Default digit group separator to display in analysis modules',
        type: 'dropdown',
        options: {
            SPACE: 'Space',
            COMMA: 'Comma',
            NONE: 'None',
        },
    },
    keyRequireAddToView: {
        label: 'Require authority to add to view object lists',
        type: 'checkbox',
    },
    keyUseCustomLogoFront: {
        label: 'Custom login page logo',
        type: 'staticContent',
        name: 'logo_front',
    },
    keyUseCustomLogoBanner: {
        label: 'Custom top menu logo',
        type: 'staticContent',
        name: 'logo_banner',
    },
    /* ============================================================================================================ */
    /* Category: Email                                                                                              */
    /* ============================================================================================================ */
    keyEmailHostName: { label: 'Host name' },
    keyEmailPort: {
        label: 'Port',
        type: 'dropdown',
        options: {
            587: 587,
            465: 465,
            25: 25,
        },
    },
    keyEmailUsername: {
        label: 'Username',
    },
    keyEmailPassword: {
        label: 'Password',
        type: 'password',
    },
    keyEmailTls: {
        label: 'TLS',
        type: 'checkbox',
    },
    keyEmailSender: {
        label: 'Email sender',
        validators: ['email'],
    },
    emailTestButton: {
        label: 'Send me a test email',
        type: 'postButton',
        uri: '/email/test',
    },
    /* ============================================================================================================ */
    /* Category: Messaging                                                                                          */
    /* ============================================================================================================ */
    keyMessageEmailNotification: {
        label: 'Enable message email notifications',
        type: 'checkbox',
        userSettingsOverride: true,
        searchLabels: ['Style', 'This setting can be overridden by user settings'],
    },
    keyMessageSmsNotification: {
        label: 'Enable message SMS notifications',
        type: 'checkbox',
        userSettingsOverride: true,
        searchLabels: ['Style', 'This setting can be overridden by user settings'],
    },
    /* ============================================================================================================ */
    /* Category: Access                                                                                             */
    /* ============================================================================================================ */
    selfRegistrationRole: {
        label: 'Self registration account user role',
        configuration: true,
        type: 'dropdown',
        source: 'userRoles',
        includeEmpty: true,
        emptyLabel: 'Disable self registration',
    },
    keySelfRegistrationNoRecaptcha: {
        label: 'Do not require recaptcha for self registration',
        type: 'checkbox',
    },
    selfRegistrationOrgUnit: {
        label: 'Self registration account organisation unit',
        configuration: true,
        type: 'dropdown',
        source: 'organisationUnits',
        includeEmpty: true,
        emptyLabel: 'Disable self registration',
    },
    keyAccountRecovery: {
        label: 'Enable user account recovery',
        type: 'checkbox',
    },
    keyLockMultipleFailedLogins: {
        label: 'Lock user account temporarily after multiple failed login attempts',
        type: 'checkbox',
    },
    keyCanGrantOwnUserAuthorityGroups: {
        label: 'Allow users to grant own user roles',
        type: 'checkbox',
    },
    keyAllowObjectAssignment: {
        label: 'Allow assigning object to related objects during add or update',
        type: 'checkbox',
    },
    credentialsExpiryAlert: {
        label: 'Enable password expiry alerts',
        type: 'checkbox',
    },
    credentialsExpires: {
        label: 'Require user account password change',
        type: 'dropdown',
        options: {
            0: 'Never',
            3: '3 months',
            6: '6 months',
            12: '12 months',
        },
    },
    minPasswordLength: {
        label: 'Minimum characters in password',
        type: 'dropdown',
        options: {
            8: 8,
            10: 10,
            12: 12,
            14: 14,
        },
    },
    keyOpenIdProvider: { label: 'OpenID provider' },
    keyOpenIdProviderLabel: { label: 'OpenID provider label' },
    corsWhitelist: {
        label: 'CORS whitelist',
        configuration: true,
        multiLine: true,
        hintText: 'One URL per line',
        validators: ['url_array'],
    },
    keyMapzenSearchApiKey: { label: 'Mapzen search API key' },
    keyGoogleMapsApiKey: { label: 'Google Maps API key' },
    /* ============================================================================================================ */
    /* Category: Calendar                                                                                           */
    /* ============================================================================================================ */
    keyCalendar: {
        label: 'Calendar',
        type: 'dropdown',
        options: {
            coptic: 'coptic',
            ethiopian: 'ethiopian',
            gregorian: 'gregorian',
            islamic: 'islamic',
            iso8601: 'iso8601',
            julian: 'julian',
            nepali: 'nepali',
            thai: 'thai',
            persian: 'persian',
        },
    },
    keyDateFormat: {
        label: 'Date format',
        type: 'dropdown',
        options: {
            'yyyy-MM-dd': '1981-03-31 (yyyy-MM-dd)',
            'dd-MM-yyyy': '03-31-1981 (dd-MM-yyyy)',
        },
    },
    /* ============================================================================================================ */
    /* Category: Synchronization                                                                                    */
    /* ============================================================================================================ */
    keyRemoteInstanceUrl: {
        label: 'Remote server URL',
        validators: ['url'],
    },
    keyRemoteInstanceUsername: {
        label: 'Remote server username',
    },
    keyRemoteInstancePassword: {
        label: 'Remote server password',
        type: 'password',
    },
    keyMetadataDataVersioning: {
        label: 'Enable Versioning for metadata sync',
        type: 'metadataSettings',
    },
    keyVersionEnabled: {
        label: 'Enable Versioning for metadata sync',
        type: 'checkbox',
    },
    keyStopMetadataSync: {
        label: 'Don\'t sync metadata if DHIS versions differ',
        type: 'checkbox',
    },
    createVersionButton: {
        label: 'Create new version',
        type: 'postButton',
        uri: '/metadata/version/create',
    },
    /* ============================================================================================================ */
    /* Category: Data Import                                                                                        */
    /* ============================================================================================================ */
    keyDataImportStrictPeriods: {
        label: 'Require periods to match period type of data set',
        type: 'checkbox',
    },
    keyDataImportStrictCategoryOptionCombos: {
        label: 'Require category option combos to match category combo of data element',
        type: 'checkbox',
    },
    keyDataImportStrictOrganisationUnits: {
        label: 'Require organisation units to match assignment of data set',
        type: 'checkbox',
    },
    keyDataImportStrictAttributeOptionCombos: {
        label: 'Require attribute option combos to match category combo of data set',
        type: 'checkbox',
    },
    keyDataImportRequireCategoryOptionCombo: {
        label: 'Require category option combo to be specified',
        type: 'checkbox',
    },
    keyDataImportRequireAttributeOptionCombo: {
        label: 'Require attribute option combo to be specified',
        type: 'checkbox',
    },
    /* ============================================================================================================ */
    /* Category: oAuth2 clients                                                                                     */
    /* ============================================================================================================ */
    keySystemMonitoringUrl: {
        label: 'System monitoring URL',
        validators: ['url'],
    },
    keySystemMonitoringUsername: {
        label: 'System monitoring username',
    },
    keySystemMonitoringPassword: {
        label: 'System monitoring password',
        type: 'password',
    },
    /* ============================================================================================================ */
    /* Category: oAuth2 clients                                                                                     */
    /* ============================================================================================================ */
    oauth2clients: {
        type: 'oauth2clients',
        searchLabels: [
            'OAuth2 Clients',
            'Password',
            'Refresh token',
            'Authorization code',
        ],
    },
  
    /* ============================================================================================================ */
    // The following keys are present in the demo database but are not managed by dhis-web-maintenance-settings
    //
    // 'sendMessageScheduled'
    // 'timeSendingMessage'
    // 'keyCustomCss'
    // 'aggregationStrategy'
    // 'zeroValueSaveMode'
    // 'reportFramework'
    // 'systemSettings'
    // 'keyLastSuccessfulSynch'
    // 'dataEntryFormCompleted'
    // 'keyTrackerDashboardDefaultLayout'
    // 'keyLastSuccessfulAnalyticsTablesUpdate'
    // 'SMS_CONFIG'
    // 'orgUnitGroupSetAggregationLevel'
    // 'keyScheduledPeriodTypes'
    // 'keyLastSuccessfulResourceTablesUpdate'
    // 'keySchedTasks'
    // 'applicationIntro'
    // 'systemTitle'
    // 'keyAccountInvite'
    // 'flag'
    // 'scheduleAggregateQueryBuilderTackStrategy'
    // 'appBaseUrl'
    // 'mysetting'
    // 'appFolderPath'
    // 'keySystemIdentifier'
    // 'keyScheduledTasks'
    // 'keyLastSuccessfulDataSynch'
    // 'appStoreUrl'
    // 'App_TabularData_SettingData'
    // 'keyLastMonitoringRun'
    // 'scheduleAggregateQueryBuilder'
    // 'keyDataSetCompletenessTask'
    // 'keyDataMartTask'
};

export default settingsKeyMapping;
