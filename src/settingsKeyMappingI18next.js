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
const settingsKeyMappingI18next = function (i18next) {
    return {
    /* ============================================================================================================ */
    /* Category: General                                                                                            */
    /* ============================================================================================================ */
        keyAnalyticsMaxLimit: { // Analytics
            label: i18next.t('Maximum number of analytics records'),
            type: 'dropdown',
            options: {
                50000: 50000,
                100000: 100000,
                200000: 200000,
                0: i18next.t('Unlimited'),
            },
        },
        infrastructuralIndicators: {
            label: i18next.t('Infrastructural indicators'),
            configuration: true,
            type: 'dropdown',
            source: 'indicatorGroups',
        },
        infrastructuralDataElements: {
            label: i18next.t('Infrastructural data elements'),
            configuration: true,
            type: 'dropdown',
            source: 'dataElementGroups',
        },
        infrastructuralPeriodType: {
            label: i18next.t('Infrastructural period type'),
            configuration: true,
            type: 'dropdown',
            options: {
                Daily: i18next.t('Daily'),
                Weekly: i18next.t('Weekly'),
                Monthly: i18next.t('Monthly'),
                BiMonthly: i18next.t('BiMonthly'),
                Quarterly: i18next.t('Quarterly'),
                SixMonthly: i18next.t('SixMonthly'),
                SixMonthlyApril: i18next.t('SixMonthlyApril'),
                Yearly: i18next.t('Yearly'),
                FinancialApril: i18next.t('FinancialApril'),
                FinancialJuly: i18next.t('FinancialJuly'),
                FinancialOct: i18next.t('FinancialOct'),
            },
        },
        feedbackRecipients: {
            label: i18next.t('Feedback recipients'),
            configuration: true,
            type: 'dropdown',
            source: 'userGroups',
            includeEmpty: true,
            emptyLabel: i18next.t('No message recipients'),
        },
        offlineOrganisationUnitLevel: {
            label: i18next.t('Max offline organisation unit levels'),
            description: i18next.t('relative to current user'),
            configuration: true,
            type: 'dropdown',
            source: 'organisationUnitLevels',
        },
        factorDeviation: {
            label: i18next.t('Data analysis std dev factor'),
            validators: ['positive_number'],
        },
        phoneNumberAreaCode: {
            label: i18next.t('Phone number area code'),
            validators: ['number'],
        },
        helpPageLink: {
            label: i18next.t('Help page link'),
            validators: ['relative_url'],
        },
        multiOrganisationUnitForms: {
            label: i18next.t('Enable multi-organisation unit forms'),
            type: 'checkbox',
        },
        omitIndicatorsZeroNumeratorDataMart: {
            label: i18next.t('Omit indicator values with zero numerator in data mart'),
            type: 'checkbox',
        },
        keyAnalyticsMaintenanceMode: { // Analytics
            label: i18next.t('Put analytics in maintenance mode'),
            type: 'checkbox',
        },
        keyHideUnapprovedDataInAnalytics: {
            label: i18next.t('Max number of years to hide unapproved data in analytics'),
            type: 'checkbox',
        },
        keyAcceptanceRequiredForApproval: {
            label: i18next.t('Acceptance required before approval'),
            type: 'checkbox',
        },
        /* ============================================================================================================ */
        /* Category: Analytics                                                                                          */
        /* ============================================================================================================ */
        keyAnalysisRelativePeriod: {
            label: i18next.t('Default relative period for analysis'),
            type: 'dropdown',
            options: {
                THIS_MONTH: i18next.t('This month'),
                LAST_MONTH: i18next.t('Last month'),
                THIS_BIMONTH: i18next.t('This bi-month'),
                LAST_BIMONTH: i18next.t('Last bi-month'),
                THIS_QUARTER: i18next.t('This quarter'),
                LAST_QUARTER: i18next.t('Last quarter'),
                THIS_SIX_MONTH: i18next.t('This six-month'),
                LAST_SIX_MONTH: i18next.t('Last six-month'),
                MONTHS_THIS_YEAR: i18next.t('MONTHS_THIS_YEAR'),
                QUARTERS_THIS_YEAR: i18next.t('QUARTERS_THIS_YEAR'),
                THIS_YEAR: i18next.t('THIS_YEAR'),
                MONTHS_LAST_YEAR: i18next.t('MONTHS_LAST_YEAR'),
                QUARTERS_LAST_YEAR: i18next.t('QUARTERS_LAST_YEAR'),
                LAST_YEAR: i18next.t('LAST_YEAR'),
                LAST_5_YEARS: i18next.t('Last 5 years'),
                LAST_12_MONTHS: i18next.t('LAST_12_MONTHS'),
                LAST_6_MONTHS: i18next.t('LAST_6_MONTHS'),
                LAST_3_MONTHS: i18next.t('LAST_3_MONTHS'),
                LAST_6_BIMONTHS: i18next.t('LAST_6_BIMONTHS'),
                LAST_4_QUARTERS: i18next.t('LAST_4_QUARTERS'),
                LAST_2_SIXMONTHS: i18next.t('LAST_2_SIXMONTHS'),
                THIS_FINANCIAL_YEAR: i18next.t('THIS_FINANCIAL_YEAR'),
                LAST_FINANCIAL_YEAR: i18next.t('LAST_FINANCIAL_YEAR'),
                LAST_5_FINANCIAL_YEARS: i18next.t('LAST_5_FINANCIAL_YEARS'),
                THIS_WEEK: i18next.t('This week'),
                LAST_WEEK: i18next.t('LAST_WEEK'),
                LAST_4_WEEKS: i18next.t('LAST_4_WEEKS'),
                LAST_12_WEEKS: i18next.t('LAST_12_WEEKS'),
                LAST_52_WEEKS: i18next.t('LAST_52_WEEKS'),
            },
        },
        keyCacheability: {
            label: i18next.t('Cacheability'),
            type: 'dropdown',
            options: {
                PUBLIC: i18next.t('Public'),
                PRIVATE: i18next.t('Private'),
            },
        },
        keyCacheStrategy: {
            label: i18next.t('Cache strategy'),
            type: 'dropdown',
            options: {
                NO_CACHE: i18next.t('No cache'),
                CACHE_15_MINUTES: i18next.t('Cache for 15 minutes'),
                CACHE_30_MINUTES: i18next.t('Cache for 30 minutes'),
                CACHE_1_HOUR: i18next.t('Cache for one hour'),
                CACHE_6AM_TOMORROW: i18next.t('Cache until 6 AM tomorrow'),
                CACHE_TWO_WEEKS: i18next.t('Cache for two weeks'),
            },
        },
        keyIgnoreAnalyticsApprovalYearThreshold: {
            label: i18next.t('Max number of years to hide unapproved data in analytics'),
            type: 'dropdown',
            options: {
                '-1': i18next.t('Never check approval'),
                0: i18next.t('Check approval for all data'),
                1: i18next.t('Current year only'),
                2: i18next.t('Last 2 years'),
                3: i18next.t('Last 3 years'),
                4: i18next.t('Last 4 years'),
                5: i18next.t('Last 5 years'),
                6: i18next.t('Last 6 years'),
                7: i18next.t('Last 7 years'),
                8: i18next.t('Last 8 years'),
                9: i18next.t('Last 9 years'),
                10: i18next.t('Last 10 years'),
            },
        },
        keyCacheAnalyticsDataYearThreshold: {
            label: i18next.t('threshold_for_analytics_data_caching'),
            type: 'dropdown',
            options: {
                0: i18next.t('Threshold for analytics data caching'),
                1: i18next.t('1 year'),
                2: i18next.t('2 years'),
                3: i18next.t('3 years'),
                4: i18next.t('4 years'),
                5: i18next.t('5 years'),
                6: i18next.t('6 years'),
                7: i18next.t('7 years'),
                8: i18next.t('8 years'),
                9: i18next.t('9 years'),
                10: i18next.t('10 years'),
                11: i18next.t('11 years'),
                12: i18next.t('12 years'),
                13: i18next.t('13 years'),
                14: i18next.t('14 years'),
                15: i18next.t('15 years'),
            },
        },
        keySkipDataTypeValidationInAnalyticsTableExport: {
            label: i18next.t('Skip data type validation in analytics table export'),
            type: 'checkbox',
        },
        keyRespectMetaDataStartEndDatesInAnalyticsTableExport: {
            label: i18next.t('Respect category option start and end date in analytics table export'),
            type: 'checkbox',
        },
        /* ============================================================================================================ */
        /* Category: Server                                                                                             */
        /* ============================================================================================================ */
        keyDatabaseServerCpus: {
            label: i18next.t('Number of database server CPUs'),
            type: 'dropdown',
            options: {
                0: i18next.t('Automatic (detect based on web server)'),
            1: '1', 2: '2', 3: '3', 4: '4', 5: '5',     // eslint-disable-line
            6: '6', 7: '7', 8: '8', 16: '16', 32: '32', // eslint-disable-line
            },
        },
        keySystemNotificationsEmail: {
            label: i18next.t('System notifications email address'),
            validators: ['email'],
        },
        keyInstanceBaseUrl: {
            label: i18next.t('Server base URL'),
            validators: ['url'],
        },
        googleAnalyticsUA: {
            label: i18next.t('Google Analytics (Universal Analytics) key'),
        },
        /* ============================================================================================================ */
        /* Category: Appearance                                                                                         */
        /* ============================================================================================================ */
        localizedText: {
            type: 'localizedAppearance',
            searchLabels: [
                i18next.t('Application title'),
                i18next.t('Application introduction'),
                i18next.t('Application notification'),
                i18next.t('Application left-side footer'),
                i18next.t('Application right-side footer'),
            ],
        },
        applicationTitle: {
            label: i18next.t('Application title'),
            appendLocale: true,
            multiLine: true,
        },
        keyApplicationIntro: {
            label: i18next.t('Application introduction'),
            description: 'allows_html',
            appendLocale: true,
            multiLine: true,
        },
        keyApplicationNotification: {
            label: i18next.t('Application notification'),
            description: 'allows_html',
            appendLocale: true,
            multiLine: true,
        },
        keyApplicationFooter: {
            label: i18next.t('Application left-side footer'),
            description: 'allows_html',
            appendLocale: true,
            multiLine: true,
        },
        keyApplicationRightFooter: {
            label: i18next.t('Application right-side footer'),
            description: 'allows_html',
            appendLocale: true,
            multiLine: true,
        },
        keyStyle: {
            label: i18next.t('Style'),
            type: 'dropdown',
            userSettingsOverride: true,
            searchLabels: [i18next.t('Style'), i18next.t('This setting can be overridden by user settings')],
            source: 'styles',
        },
        startModule: {
            label: i18next.t('Start page'),
            type: 'dropdown',
            source: 'startModules',
        },
        keyFlag: {
            label: i18next.t('Flag'),
            type: 'dropdown',
            source: 'flags',
        },
        keyUiLocale: {
            label: i18next.t('Interface language'),
            type: 'dropdown',
            userSettingsOverride: true,
            searchLabels: [i18next.t('Style'), i18next.t('This setting can be overridden by user settings')],
            source: 'locales',
        },
        keyDbLocale: {
            label: i18next.t('Database language'),
            type: 'dropdown',
            userSettingsOverride: true,
            searchLabels: [i18next.t('Style'), i18next.t('This setting can be overridden by user settings')],
            source: 'locales',
        },
        keyAnalysisDisplayProperty: {
            label: i18next.t('Property to display in analysis modules'),
            type: 'dropdown',
            userSettingsOverride: true,
            searchLabels: [i18next.t('style'), i18next.t('This setting can be overridden by user settings')],
            options: {
                name: 'Name',
                shortName: 'Short name',
            },
        },
        keyAnalysisDigitGroupSeparator: {
            label: i18next.t('Default digit group separator to display in analysis modules'),
            type: 'dropdown',
            options: {
                SPACE: i18next.t('Space'),
                COMMA: i18next.t('Comma'),
                NONE: i18next.t('None'),
            },
        },
        keyRequireAddToView: {
            label: i18next.t('Require authority to add to view object lists'),
            type: 'checkbox',
        },
        keyUseCustomLogoFront: {
            label: i18next.t('custom_login_page_logo'),
            type: 'staticContent',
            name: 'logo_front',
        },
        keyUseCustomLogoBanner: {
            label: i18next.t('Custom login page logo'),
            type: 'staticContent',
            name: 'logo_banner',
        },
        /* ============================================================================================================ */
        /* Category: Email                                                                                              */
        /* ============================================================================================================ */
        keyEmailHostName: { label: i18next.t('Host name') },
        keyEmailPort: {
            label: i18next.t('Port'),
            type: 'dropdown',
            options: {
                587: 587,
                465: 465,
                25: 25,
            },
        },
        keyEmailUsername: {
            label: i18next.t('Username'),
        },
        keyEmailPassword: {
            label: i18next.t('Password'),
            type: 'password',
        },
        keyEmailTls: {
            label: i18next.t('TLS'),
            type: 'checkbox',
        },
        keyEmailSender: {
            label: i18next.t('Email sender'),
            validators: ['email'],
        },
        emailTestButton: {
            label: i18next.t('Send me a test email'),
            type: 'postButton',
            uri: '/email/test',
        },
        /* ============================================================================================================ */
        /* Category: Messaging                                                                                          */
        /* ============================================================================================================ */
        keyMessageEmailNotification: {
            label: i18next.t('Enable message email notifications'),
            type: 'checkbox',
            userSettingsOverride: true,
            searchLabels: [i18next.t('Style'), i18next.t('This setting can be overridden by user settings')],
        },
        keyMessageSmsNotification: {
            label: i18next.t('Enable message SMS notifications'),
            type: 'checkbox',
            userSettingsOverride: true,
            searchLabels: [i18next.t('Style'), i18next.t('This setting can be overridden by user settings')],
        },
        /* ============================================================================================================ */
        /* Category: Access                                                                                             */
        /* ============================================================================================================ */
        selfRegistrationRole: {
            label: i18next.t('Self registration account user role'),
            configuration: true,
            type: 'dropdown',
            source: 'userRoles',
            includeEmpty: true,
            emptyLabel: i18next.t('Disable self registration'),
        },
        keySelfRegistrationNoRecaptcha: {
            label: i18next.t('Do not require recaptcha for self registration'),
            type: 'checkbox',
        },
        selfRegistrationOrgUnit: {
            label: i18next.t('Self registration account organisation unit'),
            configuration: true,
            type: 'dropdown',
            source: 'organisationUnits',
            includeEmpty: true,
            emptyLabel: i18next.t('Disable self registration'),
        },
        keyAccountRecovery: {
            label: i18next.t('Enable user account recovery'),
            type: 'checkbox',
        },
        keyLockMultipleFailedLogins: {
            label: i18next.t('Lock user account temporarily after multiple failed login attempts'),
            type: 'checkbox',
        },
        keyCanGrantOwnUserAuthorityGroups: {
            label: i18next.t('Allow users to grant own user roles'),
            type: 'checkbox',
        },
        keyAllowObjectAssignment: {
            label: i18next.t('Allow assigning object to related objects during add or update'),
            type: 'checkbox',
        },
        credentialsExpiryAlert: {
            label: i18next.t('Enable password expiry alerts'),
            type: 'checkbox',
        },
        credentialsExpires: {
            label: i18next.t('Require user account password change'),
            type: 'dropdown',
            options: {
                0: i18next.t('Never'),
                3: i18next.t('3 months'),
                6: i18next.t('6 months'),
                12: i18next.t('12months'),
            },
        },
        minPasswordLength: {
            label: i18next.t('Minimum characters in password'),
            type: 'dropdown',
            options: {
                8: 8,
                10: 10,
                12: 12,
                14: 14,
            },
        },
        keyOpenIdProvider: { label: i18next.t('OpenID provider') },
        keyOpenIdProviderLabel: { label: i18next.t('OpenID provider label') },
        corsWhitelist: {
            label: i18next.t('CORS whitelist'),
            configuration: true,
            multiLine: true,
            hintText: i18next.t('One URL per line'),
            validators: ['url_array'],
        },
        keyMapzenSearchApiKey: { label: i18next.t('Mapzen search API key') },
        keyGoogleMapsApiKey: { label: i18next.t('Google Maps API key') },
        /* ============================================================================================================ */
        /* Category: Calendar                                                                                           */
        /* ============================================================================================================ */
        keyCalendar: {
            label: i18next.t('Calendar'),
            type: 'dropdown',
            options: {
                coptic: i18next.t('coptic'),
                ethiopian: i18next.t('ethiopian'),
                gregorian: i18next.t('gregorian'),
                islamic: i18next.t('islamic'),
                iso8601: i18next.t('iso8601'),
                julian: i18next.t('julian'),
                nepali: i18next.t('nepali'),
                thai: i18next.t('thai'),
                persian: i18next.t('persian'),
            },
        },
        keyDateFormat: {
            label: i18next.t('Date format'),
            type: 'dropdown',
            options: {
                'yyyy-MM-dd': i18next.t('1981-03-31 (yyyy-MM-dd)'),
                'dd-MM-yyyy': i18next.t('03-31-1981 (dd-MM-yyyy)'),
            },
        },
        /* ============================================================================================================ */
        /* Category: Synchronization                                                                                    */
        /* ============================================================================================================ */
        keyRemoteInstanceUrl: {
            label: i18next.t('Remote server URL'),
            validators: ['url'],
        },
        keyRemoteInstanceUsername: {
            label: i18next.t('Remote server username'),
        },
        keyRemoteInstancePassword: {
            label: i18next.t('Remote server password'),
            type: 'password',
        },
        keyMetadataDataVersioning: {
            label: i18next.t('Enable Versioning for metadata sync'),
            type: 'metadataSettings',
        },
        keyVersionEnabled: {
            label: i18next.t('Enable Versioning for metadata sync'),
            type: 'checkbox',
        },
        keyStopMetadataSync: {
            label: i18next.t('Don\'t sync metadata if DHIS versions differ'),
            type: 'checkbox',
        },
        createVersionButton: {
            label: i18next.t('Create new version'),
            type: 'postButton',
            uri: '/metadata/version/create',
        },
        /* ============================================================================================================ */
        /* Category: Data Import                                                                                        */
        /* ============================================================================================================ */
        keyDataImportStrictPeriods: {
            label: i18next.t('Require periods to match period type of data set'),
            type: 'checkbox',
        },
        keyDataImportStrictCategoryOptionCombos: {
            label: i18next.t('Require category option combos to match category combo of data element'),
            type: 'checkbox',
        },
        keyDataImportStrictOrganisationUnits: {
            label: i18next.t('Require organisation units to match assignment of data set'),
            type: 'checkbox',
        },
        keyDataImportStrictAttributeOptionCombos: {
            label: i18next.t('Require attribute option combos to match category combo of data set'),
            type: 'checkbox',
        },
        keyDataImportRequireCategoryOptionCombo: {
            label: i18next.t('Require category option combo to be specified'),
            type: 'checkbox',
        },
        keyDataImportRequireAttributeOptionCombo: {
            label: i18next.t('Require attribute option combo to be specified'),
            type: 'checkbox',
        },
        /* ============================================================================================================ */
        /* Category: oAuth2 clients                                                                                     */
        /* ============================================================================================================ */
        keySystemMonitoringUrl: {
            label: i18next.t('System monitoring URL'),
            validators: ['url'],
        },
        keySystemMonitoringUsername: {
            label: i18next.t('System monitoring username'),
        },
        keySystemMonitoringPassword: {
            label: i18next.t('System monitoring password'),
            type: 'password',
        },
        /* ============================================================================================================ */
        /* Category: oAuth2 clients                                                                                     */
        /* ============================================================================================================ */
        oauth2clients: {
            type: 'oauth2clients',
            searchLabels: [
                i18next.t('OAuth2 Clients'),
                i18next.t('Password'),
                i18next.t('Refresh token'),
                i18next.t('Authorization code'),
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
};

export default settingsKeyMappingI18next;
