import i18n from '@dhis2/d2-i18n'

const canBeOverridenLabel = i18n.t(
    'This setting can be overridden by user settings'
)

const formatNumber = (value) =>
    new Intl.NumberFormat(i18n.language).format(value)

/**
 * This file provides information about DHIS2 system settings and configuration options that are not otherwise
 * available through the API.
 *
 * Each system settings key is mapped to an i18n label. In addition, certain special system
 * settings that are not actually saved as system settings but rather as system configuration options are described
 * here as well. This concerns any key that has a "configuration" property which is set to `true`.
 *
 * Settings that have an `appendLocale: true` property, are localizable settings. When these settings are saved, the
 * code of the specified locale, such as "fr" or "ar_IQ" is appended to the key name.
 */
const settingsKeyMapping = {
    /* ============================================================================================================ */
    /* Category: General                                                                                            */
    /* ============================================================================================================ */
    keyAnalyticsMaxLimit: {
        // Analytics
        label: i18n.t('Maximum number of analytics records'),
        type: 'dropdown',
        options: {
            50000: formatNumber(50000),
            100000: formatNumber(100000),
            200000: formatNumber(200000),
            500000: formatNumber(500000),
            1000000: formatNumber(1000000),
            0: i18n.t('Unlimited'),
        },
    },
    keySqlViewMaxLimit: {
        label: i18n.t('Maximum number of SQL view records'),
        type: 'dropdown',
        options: {
            '-1': i18n.t('Unlimited'),
            50000: formatNumber(50000),
            100000: formatNumber(100000),
            200000: formatNumber(200000),
            500000: formatNumber(500000),
            1000000: formatNumber(1000000),
        },
    },
    infrastructuralIndicators: {
        label: i18n.t('Infrastructural indicators'),
        configuration: true,
        type: 'dropdown',
        source: 'indicatorGroups',
    },
    infrastructuralDataElements: {
        label: i18n.t('Infrastructural data elements'),
        configuration: true,
        type: 'dropdown',
        source: 'dataElementGroups',
    },
    infrastructuralPeriodType: {
        label: i18n.t('Infrastructural period type'),
        configuration: true,
        type: 'dropdown',
        options: {
            Daily: i18n.t('Daily'),
            Weekly: i18n.t('Weekly'),
            Monthly: i18n.t('Monthly'),
            BiMonthly: i18n.t('Bi-monthly'),
            Quarterly: i18n.t('Quarterly'),
            SixMonthly: i18n.t('Six-monthly'),
            SixMonthlyApril: i18n.t('Six-monthly April'),
            Yearly: i18n.t('Yearly'),
            FinancialApril: i18n.t('Financial-April'),
            FinancialJuly: i18n.t('Financial-July'),
            FinancialOct: i18n.t('Financial-Oct'),
        },
    },
    feedbackRecipients: {
        label: i18n.t('Feedback recipients'),
        configuration: true,
        type: 'dropdown',
        source: 'userGroups',
        includeEmpty: true,
        emptyLabel: i18n.t('No message recipients'),
    },
    systemUpdateNotificationRecipients: {
        label: i18n.t('System update notification recipients'),
        configuration: true,
        type: 'dropdown',
        source: 'userGroups',
        includeEmpty: true,
        emptyLabel: i18n.t('No update notification recipients'),
    },
    offlineOrganisationUnitLevel: {
        label: i18n.t('Max offline organisation unit levels'),
        configuration: true,
        type: 'dropdown',
        source: 'organisationUnitLevels',
    },
    factorDeviation: {
        label: i18n.t('Data analysis std dev factor'),
        validators: ['positive_number'],
    },
    phoneNumberAreaCode: {
        label: i18n.t('Phone number area code'),
        validators: ['number'],
    },
    multiOrganisationUnitForms: {
        label: i18n.t('Enable multi-organisation unit forms'),
        type: 'checkbox',
    },
    keyAcceptanceRequiredForApproval: {
        label: i18n.t('Acceptance required before approval'),
        type: 'checkbox',
    },
    keyGatherAnalyticalObjectStatisticsInDashboardViews: {
        label: i18n.t('Gather analytical object statistics in dashboard views'),
        type: 'checkbox',
    },
    keyCountPassiveDashboardViewsInUsageAnalytics: {
        label: i18n.t(
            'Include passive dashboard views in usage analytics statistics'
        ),
        type: 'checkbox',
    },
    /* ============================================================================================================ */
    /* Category: Analytics                                                                                          */
    /* ============================================================================================================ */
    keyAnalysisRelativePeriod: {
        label: i18n.t('Default relative period for analysis'),
        type: 'dropdown',
        options: {
            THIS_WEEK: i18n.t('This week'),
            LAST_WEEK: i18n.t('Last week'),
            LAST_4_WEEKS: i18n.t('Last 4 weeks'),
            LAST_12_WEEKS: i18n.t('Last 12 weeks'),
            LAST_52_WEEKS: i18n.t('Last 52 weeks'),
            THIS_MONTH: i18n.t('This month'),
            LAST_MONTH: i18n.t('Last month'),
            MONTHS_THIS_YEAR: i18n.t('Months this year'),
            MONTHS_LAST_YEAR: i18n.t('Months last year'),
            LAST_3_MONTHS: i18n.t('Last 3 months'),
            LAST_6_MONTHS: i18n.t('Last 6 months'),
            LAST_12_MONTHS: i18n.t('Last 12 months'),
            THIS_BIMONTH: i18n.t('This bi-month'),
            LAST_BIMONTH: i18n.t('Last bi-month'),
            LAST_6_BIMONTHS: i18n.t('Last 6 bi-months'),
            THIS_QUARTER: i18n.t('This quarter'),
            LAST_QUARTER: i18n.t('Last quarter'),
            QUARTERS_THIS_YEAR: i18n.t('Quarters this year'),
            QUARTERS_LAST_YEAR: i18n.t('Quarters last year'),
            LAST_4_QUARTERS: i18n.t('Last 4 quarters'),
            THIS_SIX_MONTH: i18n.t('This six-month'),
            LAST_SIX_MONTH: i18n.t('Last six-month'),
            LAST_2_SIXMONTHS: i18n.t('Last 2 six-months'),
            THIS_YEAR: i18n.t('This year'),
            LAST_YEAR: i18n.t('Last year'),
            LAST_5_YEARS: i18n.t('Last 5 years'),
            LAST_10_YEARS: i18n.t('Last 10 years'),
            THIS_FINANCIAL_YEAR: i18n.t('This financial year'),
            LAST_FINANCIAL_YEAR: i18n.t('Last financial year'),
            LAST_5_FINANCIAL_YEARS: i18n.t('Last 5 financial years'),
        },
    },
    keyHideDailyPeriods: {
        label: i18n.t('Hide daily periods'),
        sectionLabel: i18n.t('Hidden period types in analytics apps'),
        type: 'checkbox',
    },
    keyHideWeeklyPeriods: {
        label: i18n.t('Hide weekly periods'),
        type: 'checkbox',
    },
    keyHideBiWeeklyPeriods: {
        label: i18n.t('Hide biweekly periods'),
        type: 'checkbox',
    },
    keyHideMonthlyPeriods: {
        label: i18n.t('Hide monthly periods'),
        type: 'checkbox',
    },
    keyHideBiMonthlyPeriods: {
        label: i18n.t('Hide bimonthly periods'),
        type: 'checkbox',
    },
    analyticsFinancialYearStart: {
        label: i18n.t('Financial year relative period start month'),
        type: 'dropdown',
        options: {
            FINANCIAL_YEAR_APRIL: i18n.t('April'),
            FINANCIAL_YEAR_JULY: i18n.t('July'),
            FINANCIAL_YEAR_OCTOBER: i18n.t('October'),
        },
    },
    keyCacheStrategy: {
        label: i18n.t('Cache strategy'),
        type: 'dropdown',
        options: {
            NO_CACHE: i18n.t('No cache'),
            CACHE_15_MINUTES: i18n.t('Cache for 15 minutes'),
            CACHE_30_MINUTES: i18n.t('Cache for 30 minutes'),
            CACHE_1_HOUR: i18n.t('Cache for one hour'),
            CACHE_6AM_TOMORROW: i18n.t('Cache until 6AM tomorrow'),
            CACHE_TWO_WEEKS: i18n.t('Cache for two weeks'),
        },
    },
    keyCacheability: {
        label: i18n.t('Cacheability'),
        type: 'dropdown',
        options: {
            PUBLIC: i18n.t('Public'),
            PRIVATE: i18n.t('Private'),
        },
    },
    keyAnalyticsCacheTtlMode: {
        label: i18n.t('Analytics cache mode'),
        type: 'dropdown',
        options: {
            PROGRESSIVE: i18n.t('Progressive'),
            FIXED: i18n.t('Fixed'),
        },
    },
    keyIgnoreAnalyticsApprovalYearThreshold: {
        label: i18n.t(
            'Max number of years to hide unapproved data in analytics'
        ),
        type: 'dropdown',
        options: {
            '-1': i18n.t('Never check approval'),
            0: i18n.t('Check approval for all data'),
            1: i18n.t('Current year only'),
            2: i18n.t('Last 2 years'),
            3: i18n.t('Last 3 years'),
            4: i18n.t('Last 4 years'),
            5: i18n.t('Last 5 years'),
            6: i18n.t('Last 6 years'),
            7: i18n.t('Last 7 years'),
            8: i18n.t('Last 8 years'),
            9: i18n.t('Last 9 years'),
            10: i18n.t('Last 10 years'),
        },
    },
    keyRespectMetaDataStartEndDatesInAnalyticsTableExport: {
        label: i18n.t(
            'Respect category option start and end date in analytics table export'
        ),
        type: 'checkbox',
    },
    keyIncludeZeroValuesInAnalytics: {
        label: i18n.t('Include zero data values in analytics tables'),
        type: 'checkbox',
    },
    keyAnalyticsCacheProgressiveTtlFactor: {
        label: i18n.t('Caching factor'),
        type: 'dropdown',
        options: {
            1: '1',
            2: '2',
            4: '4',
            8: '8',
            16: '16',
            32: '32',
            64: '64',
            128: '128',
            192: '192',
            256: '256',
            320: '320',
            512: '512',
            1024: '1024',
        },
        hideWhen: {
            settingsKey: 'keyAnalyticsCacheTtlMode',
            settingsValue: 'FIXED',
        },
    },
    facilityOrgUnitGroupSet: {
        label: i18n.t('Org unit group set in facility map layers'),
        configuration: true,
        type: 'dropdown',
        source: 'organisationUnitGroupSets',
    },
    facilityOrgUnitLevel: {
        label: i18n.t('Org unit level in facility map layers'),
        configuration: true,
        type: 'dropdown',
        source: 'organisationUnitLevels',
    },
    keyDefaultBaseMap: {
        label: i18n.t('Default basemap'),
        type: 'dropdown',
        source: 'basemaps',
        options: {
            osmLight: i18n.t('OSM Light (default)'),
            openStreetMap: i18n.t('OSM Detailed'),
            bingLight: i18n.t('Bing Road'),
            bingDark: i18n.t('Bing Dark'),
            bingAerial: i18n.t('Bing Aerial'),
            bingHybrid: i18n.t('Bing Aerial Labels'),
        },
    },
    /* ============================================================================================================ */
    /* Category: Server                                                                                             */
    /* ============================================================================================================ */
    keyDatabaseServerCpus: {
        label: i18n.t('Number of database server CPUs'),
        type: 'dropdown',
        options: {
            0: i18n.t('Automatic (detect based on web server)'),
            1: '1',
            2: '2',
            3: '3',
            4: '4',
            5: '5',
            6: '6',
            7: '7',
            8: '8',
            16: '16',
            32: '32',
        },
    },
    keySystemNotificationsEmail: {
        label: i18n.t('System notifications email address'),
        validators: ['email'],
    },
    googleAnalyticsUA: {
        label: i18n.t('Google Analytics (Universal Analytics) key'),
    },
    keyGoogleMapsApiKey: {
        label: i18n.t('Google Maps API key'),
        type: 'password',
    },
    keyBingMapsApiKey: {
        label: i18n.t('Bing Maps API key'),
        type: 'password',
    },
    /* ============================================================================================================ */
    /* Category: Appearance                                                                                         */
    /* ============================================================================================================ */
    localizedText: {
        type: 'localizedAppearance',
        searchLabels: [
            i18n.t('Application title'),
            i18n.t('Application introduction'),
            i18n.t('Application notification'),
            i18n.t('Application left-side footer'),
            i18n.t('Application right-side footer'),
        ],
    },
    applicationTitle: {
        label: i18n.t('Application title'),
        appendLocale: true,
        multiLine: true,
    },
    keyApplicationIntro: {
        label: i18n.t('Application introduction'),
        appendLocale: true,
        multiLine: true,
    },
    keyApplicationNotification: {
        label: i18n.t('Application notification'),
        appendLocale: true,
        multiLine: true,
    },
    keyApplicationFooter: {
        label: i18n.t('Application left-side footer'),
        appendLocale: true,
        multiLine: true,
    },
    keyApplicationRightFooter: {
        label: i18n.t('Application right-side footer'),
        appendLocale: true,
        multiLine: true,
    },
    keyStyle: {
        label: i18n.t('Style'),
        type: 'dropdown',
        includeEmpty: false,
        userSettingsOverride: true,
        searchLabels: [i18n.t('Style'), canBeOverridenLabel],
        source: 'styles',
    },
    startModule: {
        label: i18n.t('Start page'),
        type: 'dropdown',
        source: 'startModules',
    },
    startModuleEnableLightweight: {
        label: i18n.t('Enable light-weight start page'),
        type: 'checkbox',
    },
    helpPageLink: {
        label: i18n.t('Help page link'),
        validators: ['relative_url'],
    },
    keyFlag: {
        label: i18n.t('Flag'),
        type: 'dropdown',
        source: 'flags',
    },
    keyUiLocale: {
        label: i18n.t('Interface language'),
        type: 'dropdown',
        userSettingsOverride: true,
        searchLabels: [i18n.t('Style'), canBeOverridenLabel],
        source: 'uiLocales',
    },
    keyDbLocale: {
        label: i18n.t('Database language'),
        type: 'dropdown',
        userSettingsOverride: true,
        searchLabels: [i18n.t('Style'), canBeOverridenLabel],
        source: 'dbLocales',
    },
    keyAnalysisDisplayProperty: {
        label: i18n.t('Property to display in analysis modules'),
        type: 'dropdown',
        userSettingsOverride: true,
        searchLabels: [i18n.t('Style'), canBeOverridenLabel],
        options: {
            name: i18n.t('Name'),
            shortName: i18n.t('Short name'),
        },
    },
    keyAnalysisDigitGroupSeparator: {
        label: i18n.t(
            'Default digit group separator to display in analysis modules'
        ),
        type: 'dropdown',
        options: {
            SPACE: i18n.t('Space'),
            COMMA: i18n.t('Comma'),
            NONE: i18n.t('None'),
        },
    },
    keyRequireAddToView: {
        label: i18n.t('Require authority to add to view object lists'),
        type: 'checkbox',
    },
    loginPageLayout: {
        label: i18n.t('Login page theme'),
        type: 'dropdown',
        options: {
            DEFAULT: i18n.t('Default'),
            SIDEBAR: i18n.t('Sidebar'),
            CUSTOM: i18n.t('Custom'),
        },
    },
    loginPageTemplate: {
        label: i18n.t('Login page template'),
        multiLine: true,
        rowsMax: 10,
    },
    keyUseCustomLogoFront: {
        label: i18n.t('Custom login page logo'),
        type: 'staticContent',
        name: 'logo_front',
    },
    keyUseCustomLogoBanner: {
        label: i18n.t('Custom top menu logo'),
        type: 'staticContent',
        name: 'logo_banner',
    },
    keyDashboardContextMenuItemSwitchViewType: {
        label: i18n.t('Allow users to switch dashboard items view type'),
        type: 'checkbox',
    },
    keyDashboardContextMenuItemOpenInRelevantApp: {
        label: i18n.t('Allow users to open dashboard items in relevant app'),
        type: 'checkbox',
    },
    keyDashboardContextMenuItemShowInterpretationsAndDetails: {
        label: i18n.t(
            'Allow users to show dashboard items interpretations and details'
        ),
        type: 'checkbox',
    },
    keyDashboardContextMenuItemViewFullscreen: {
        label: i18n.t('Allow users to view dashboard items in fullscreen'),
        type: 'checkbox',
    },
    /* ============================================================================================================ */
    /* Category: Email                                                                                              */
    /* ============================================================================================================ */
    keyEmailHostName: { label: i18n.t('Host name') },
    keyEmailPort: {
        label: i18n.t('Port'),
        type: 'dropdown',
        options: {
            587: '587',
            465: '465',
            25: '25',
        },
    },
    keyEmailUsername: {
        label: i18n.t('Username'),
    },
    keyEmailPassword: {
        label: i18n.t('Password'),
        type: 'password',
    },
    keyEmailTls: {
        label: i18n.t('TLS'),
        type: 'checkbox',
    },
    keyEmailSender: {
        label: i18n.t('Email sender'),
        helpText: i18n.t('The address that outgoing messages are sent from.'),
        validators: ['email'],
    },
    emailTestButton: {
        label: i18n.t('Send me a test email'),
        type: 'postButton',
        uri: '/email/test',
    },
    /* ============================================================================================================ */
    /* Category: Access                                                                                             */
    /* ============================================================================================================ */
    selfRegistrationRole: {
        label: i18n.t('Self registration account user role'),
        configuration: true,
        type: 'dropdown',
        source: 'userRoles',
        includeEmpty: true,
        emptyLabel: i18n.t('Disable self registration'),
    },
    selfRegistrationOrgUnit: {
        label: i18n.t('Self registration account organisation unit'),
        configuration: true,
        type: 'dropdown',
        source: 'organisationUnits',
        includeEmpty: true,
        emptyLabel: i18n.t('Disable self registration'),
    },
    keySelfRegistrationNoRecaptcha: {
        label: i18n.t('Do not require recaptcha for self registration'),
        type: 'checkbox',
    },
    keyAccountRecovery: {
        label: i18n.t('Enable user account recovery'),
        type: 'checkbox',
    },
    keyLockMultipleFailedLogins: {
        label: i18n.t(
            'Lock user account temporarily after multiple failed login attempts'
        ),
        type: 'checkbox',
    },
    keyCanGrantOwnUserAuthorityGroups: {
        label: i18n.t('Allow users to grant own user roles'),
        type: 'checkbox',
    },
    keyAllowObjectAssignment: {
        label: i18n.t(
            'Allow assigning object to related objects during add or update'
        ),
        type: 'checkbox',
    },
    credentialsExpires: {
        label: i18n.t('Require user account password change'),
        type: 'dropdown',
        options: {
            0: i18n.t('Never'),
            3: i18n.t('3 months'),
            6: i18n.t('6 months'),
            12: i18n.t('12 months'),
        },
    },
    credentialsExpiryAlert: {
        label: i18n.t('Send reminders to users before their password expires'),
        type: 'checkbox',
    },
    credentialsExpiresReminderInDays: {
        label: i18n.t(
            'Number of days before password expiry to send reminder (1–28)'
        ),
        type: 'textfield',
        inputType: 'number',
        minValue: 1,
        maxValue: 28,
        hideWhen: {
            settingsKey: 'credentialsExpiryAlert',
            settingsValue: 'false',
        },
    },
    minPasswordLength: {
        label: i18n.t('Minimum characters in password'),
        type: 'dropdown',
        options: {
            8: '8',
            10: '10',
            12: '12',
            14: '14',
        },
    },
    corsWhitelist: {
        label: i18n.t('CORS allowlist'),
        configuration: true,
        multiLine: true,
        hintText: i18n.t('One URL per line'),
        validators: ['url_array'],
    },
    recaptchaSite: {
        label: i18n.t('reCAPTCHA Site Key'),
        type: 'password',
    },
    recaptchaSecret: {
        label: i18n.t('reCAPTCHA Secret Key'),
        type: 'password',
    },
    /* ============================================================================================================ */
    /* Category: Calendar                                                                                           */
    /* ============================================================================================================ */
    keyCalendar: {
        label: i18n.t('Calendar'),
        type: 'dropdown',
        options: {
            coptic: i18n.t('Coptic'),
            ethiopian: i18n.t('Ethiopian'),
            gregorian: i18n.t('Gregorian'),
            islamic: i18n.t('Islamic'),
            iso8601: i18n.t('ISO 8601'),
            julian: i18n.t('Julian'),
            nepali: i18n.t('Nepali'),
            thai: i18n.t('Thai'),
            persian: i18n.t('Persian'),
        },
        showWarning: true,
        warning: {
            title: i18n.t('Change calendar setting'),
            body: i18n.t(
                'Changing your calendar setting after you have entered data can make your system unusable. If you have entered data, it is strongly recommended that you do not change your calendar setting.'
            ),
            cancel: i18n.t('Cancel'),
            proceed: i18n.t('Yes, change calendar'),
        },
    },
    keyDateFormat: {
        label: i18n.t('Date format'),
        type: 'dropdown',
        options: {
            'yyyy-MM-dd': '1981-03-31 (yyyy-MM-dd)',
            'dd-MM-yyyy': '31-03-1981 (dd-MM-yyyy)',
        },
    },
    /* ============================================================================================================ */
    /* Category: Data Import                                                                                        */
    /* ============================================================================================================ */
    keyDataImportStrictPeriods: {
        label: i18n.t('Require periods to match period type of data set'),
        type: 'checkbox',
    },
    keyDataImportStrictDataElements: {
        label: i18n.t('Require data elements to be part of data set'),
        type: 'checkbox',
    },
    keyDataImportStrictCategoryOptionCombos: {
        label: i18n.t(
            'Require category option combos to match category combo of data element'
        ),
        type: 'checkbox',
    },
    keyDataImportStrictOrganisationUnits: {
        label: i18n.t(
            'Require organisation units to match assignment of data set'
        ),
        type: 'checkbox',
    },
    keyDataImportStrictAttributeOptionCombos: {
        label: i18n.t(
            'Require attribute option combos to match category combo of data set'
        ),
        type: 'checkbox',
    },
    keyDataImportRequireCategoryOptionCombo: {
        label: i18n.t('Require category option combo to be specified'),
        type: 'checkbox',
    },
    keyDataImportRequireAttributeOptionCombo: {
        label: i18n.t('Require attribute option combo to be specified'),
        type: 'checkbox',
    },
    /* ============================================================================================================ */
    /* Category: Synchronization                                                                                    */
    /* ============================================================================================================ */
    keyRemoteInstanceUrl: {
        label: i18n.t('Remote server URL'),
        validators: ['url'],
    },
    keyRemoteInstanceUsername: {
        label: i18n.t('Remote server username'),
    },
    keyRemoteInstancePassword: {
        label: i18n.t('Remote server password'),
        type: 'password',
    },
    keyMetadataDataVersioning: {
        label: i18n.t('Metadata Versioning'),
        type: 'metadataSettings',
    },
    /* ============================================================================================================ */
    /* Category: oAuth2 clients                                                                                     */
    /* ============================================================================================================ */
    oauth2clients: {
        type: 'oauth2clients',
        searchLabels: [
            'oauth2_clients',
            'password',
            'refresh_token',
            'authorization_code',
        ],
    },
    /* ============================================================================================================ */
    /* Category: Scheduled jobs                                                                                    */
    /* ============================================================================================================ */
    jobsRescheduleAfterMinutes: {
        label: i18n.t(
            'Number of minutes after which a stale job is reset to scheduled state (1-60)'
        ),
        type: 'textfield',
        inputType: 'number',
        minValue: 1,
        maxValue: 60,
        validators: ['positive_number'],
    },
    jobsCleanupAfterMinutes: {
        label: i18n.t(
            'Number of minutes after which a completed ad-hoc job is deleted (1+)'
        ),
        type: 'textfield',
        inputType: 'number',
        minValue: 1,
        maxValue: 2147483647,
        validators: ['positive_number'],
    },
    jobsMaxCronDelayHours: {
        label: i18n.t(
            'Maximum number of hours a job may trigger after its intended time if job has not yet run (1-24)'
        ),
        type: 'textfield',
        inputType: 'number',
        minValue: 1,
        maxValue: 24,
        validators: ['positive_number'],
    },
    jobsLogDebugBelowSeconds: {
        label: i18n.t(
            'Job execution interval (seconds) below which a job will be logged at debug (rather than info) level (20+)'
        ),
        type: 'textfield',
        inputType: 'number',
        minValue: 20,
        maxValue: 2147483647,
        validators: ['positive_number'],
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
}

export default settingsKeyMapping
