import i18n from '@dhis2/d2-i18n'

const canBeOverridenLabel = i18n.t(
    'This setting can be overridden by user settings'
)

const formatNumber = value => new Intl.NumberFormat(i18n.language).format(value)

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
            THIS_MONTH: i18n.t('This month'),
            LAST_MONTH: i18n.t('Last month'),
            THIS_BIMONTH: i18n.t('This bi-month'),
            LAST_BIMONTH: i18n.t('Last bi-month'),
            THIS_QUARTER: i18n.t('This quarter'),
            LAST_QUARTER: i18n.t('Last quarter'),
            THIS_SIX_MONTH: i18n.t('This six-month'),
            LAST_SIX_MONTH: i18n.t('Last six-month'),
            MONTHS_THIS_YEAR: i18n.t('Months this year'),
            QUARTERS_THIS_YEAR: i18n.t('Quarters this year'),
            THIS_YEAR: i18n.t('This year'),
            MONTHS_LAST_YEAR: i18n.t('Months last year'),
            QUARTERS_LAST_YEAR: i18n.t('Quarters last year'),
            LAST_YEAR: i18n.t('Last year'),
            LAST_5_YEARS: i18n.t('Last 5 years'),
            LAST_12_MONTHS: i18n.t('Last 12 months'),
            LAST_6_MONTHS: i18n.t('Last 6 months'),
            LAST_3_MONTHS: i18n.t('Last 3 months'),
            LAST_6_BIMONTHS: i18n.t('Last 6 bi-months'),
            LAST_4_QUARTERS: i18n.t('Last 4 quarters'),
            LAST_2_SIXMONTHS: i18n.t('Last 2 six-months'),
            THIS_FINANCIAL_YEAR: i18n.t('This financial year'),
            LAST_FINANCIAL_YEAR: i18n.t('Last financial year'),
            LAST_5_FINANCIAL_YEARS: i18n.t('Last 5 financial years'),
            THIS_WEEK: i18n.t('This week'),
            LAST_WEEK: i18n.t('Last week'),
            LAST_4_WEEKS: i18n.t('Last 4 weeks'),
            LAST_12_WEEKS: i18n.t('Last 12 weeks'),
            LAST_52_WEEKS: i18n.t('Last 52 weeks'),
        },
    },
    keyHideDailyPeriods: {
        label: 'key_hide_daily_periods',
        sectionLabel: 'hidden_period_types_in_analytics_apps',
        type: 'checkbox',
    },
    keyHideWeeklyPeriods: {
        label: 'key_hide_weekly_periods',
        type: 'checkbox',
    },
    keyHideMonthlyPeriods: {
        label: 'key_hide_monthly_periods',
        type: 'checkbox',
    },
    keyHideBiMonthlyPeriods: {
        label: 'key_hide_bi_monthly_periods',
        type: 'checkbox',
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
        label: 'cacheability',
        type: 'dropdown',
        options: {
            PUBLIC: 'public',
            PRIVATE: 'private',
        },
    },
    keyAnalyticsCacheTtlMode: {
        label: 'key_analytics_cache_ttl_mode',
        type: 'dropdown',
        options: {
            PROGRESSIVE: 'progressive',
            FIXED: 'fixed',
        },
    },
    keyAnalyticsCacheProgressiveTtlFactor: {
        label: 'key_analytics_cache_progressive_ttl_factor',
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
    keyCacheStrategy: {
        label: 'cache_strategy',
        type: 'dropdown',
        options: {
            NO_CACHE: 'no_cache',
            CACHE_15_MINUTES: 'cache_for_15_minutes',
            CACHE_30_MINUTES: 'cache_for_30_minutes',
            CACHE_1_HOUR: 'cache_for_one_hour',
            CACHE_6AM_TOMORROW: 'cache_until_6am_tomorrow',
            CACHE_TWO_WEEKS: 'cache_for_two_weeks',
        },
    },
    keyIgnoreAnalyticsApprovalYearThreshold: {
        label: 'max_number_of_years_to_hide_unapproved_data_in_analytics',
        type: 'dropdown',
        options: {
            '-1': 'never_check_approval',
            0: 'check_approval_for_all_data',
            1: 'current_year_only',
            2: 'last_2_years',
            3: 'last_3_years',
            4: 'last_4_years',
            5: 'last_5_years',
            6: 'last_6_years',
            7: 'last_7_years',
            8: 'last_8_years',
            9: 'last_9_years',
            10: 'last_10_years',
        },
    },
    keySkipDataTypeValidationInAnalyticsTableExport: {
        label: 'skip_data_type_validation_in_analytics_table_export',
        type: 'checkbox',
    },
    keyRespectMetaDataStartEndDatesInAnalyticsTableExport: {
        label:
            'respect_category_option_start_and_end_date_in_analytics_table_export',
        type: 'checkbox',
    },
    keyAnalyticsMaintenanceMode: {
        // Analytics
        label: 'put_analytics_in_maintenance_mode',
        type: 'checkbox',
    },
    /* ============================================================================================================ */
    /* Category: Server                                                                                             */
    /* ============================================================================================================ */
    keyDatabaseServerCpus: {
        label: 'no_of_database_server_cpus',
        type: 'dropdown',
        options: {
            0: 'detect_based_on_web_server',
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
        label: 'system_notifications_email_address',
        validators: ['email'],
    },
    googleAnalyticsUA: {
        label: 'google_analytics_ua_key',
    },
    keyBingMapsApiKey: {
        label: 'key_bing_maps_api_key',
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
        label: i18n.t('Allow users to switch dashboard favorite view type'),
        type: 'checkbox',
    },
    keyDashboardContextMenuItemOpenInRelevantApp: {
        label: i18n.t('Allow users to open dashboard favorite in relevant app'),
        type: 'checkbox',
    },
    keyDashboardContextMenuItemShowInterpretationsAndDetails: {
        label: i18n.t(
            'Allow users to show dashboard favorite interpretations and details'
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
    keyEmailHostName: { label: 'host_name' },
    keyEmailPort: {
        label: 'port',
        type: 'dropdown',
        options: {
            587: '587',
            465: '465',
            25: '25',
        },
    },
    keyEmailUsername: {
        label: 'username',
    },
    keyEmailPassword: {
        label: 'password',
        type: 'password',
    },
    keyEmailTls: {
        label: 'tls',
        type: 'checkbox',
    },
    keyEmailSender: {
        label: 'email_sender',
        validators: ['email'],
    },
    emailTestButton: {
        label: 'send_test_email',
        type: 'postButton',
        uri: '/email/test',
    },
    /* ============================================================================================================ */
    /* Category: Access                                                                                             */
    /* ============================================================================================================ */
    selfRegistrationRole: {
        label: 'self_registration_account_user_role',
        configuration: true,
        type: 'dropdown',
        source: 'userRoles',
        includeEmpty: true,
        emptyLabel: 'disable_self_registration',
    },
    keySelfRegistrationNoRecaptcha: {
        label: 'do_not_require_recaptcha_for_self_registration',
        type: 'checkbox',
    },
    selfRegistrationOrgUnit: {
        label: 'self_registration_account_organisation_unit',
        configuration: true,
        type: 'dropdown',
        source: 'organisationUnits',
        includeEmpty: true,
        emptyLabel: 'disable_self_registration',
    },
    keyAccountRecovery: {
        label: 'enable_user_account_recovery',
        type: 'checkbox',
    },
    keyLockMultipleFailedLogins: {
        label:
            'lock_user_account_temporarily_after_multiple_failed_login_attempts',
        type: 'checkbox',
    },
    keyCanGrantOwnUserAuthorityGroups: {
        label: 'allow_users_to_grant_own_user_roles',
        type: 'checkbox',
    },
    keyAllowObjectAssignment: {
        label: 'allow_assigning_object_to_related_objects_during_add_or_update',
        type: 'checkbox',
    },
    credentialsExpiryAlert: {
        label: 'enable_password_expiry_alerts',
        type: 'checkbox',
    },
    credentialsExpires: {
        label: 'user_credentials_expires',
        type: 'dropdown',
        options: {
            0: 'never',
            3: '3_months',
            6: '6_months',
            12: '12_months',
        },
    },
    minPasswordLength: {
        label: 'min_chars_in_password',
        type: 'dropdown',
        options: {
            8: '8',
            10: '10',
            12: '12',
            14: '14',
        },
    },
    corsWhitelist: {
        label: 'cors_whitelist',
        configuration: true,
        multiLine: true,
        hintText: 'one_url_per_line',
        validators: ['url_array'],
    },
    keyGoogleMapsApiKey: {
        label: 'google_maps_api_key',
        type: 'password',
    },
    recaptchaSecret: {
        label: 'recaptcha_secret_label',
        type: 'password',
    },
    recaptchaSite: {
        type: 'password',
        label: 'recaptcha_site_label',
    },
    /* ============================================================================================================ */
    /* Category: Calendar                                                                                           */
    /* ============================================================================================================ */
    keyCalendar: {
        label: 'calendar',
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
        label: 'date_format',
        type: 'dropdown',
        options: {
            'yyyy-MM-dd': 'yyyy-MM-dd',
            'dd-MM-yyyy': 'dd-MM-yyyy',
        },
    },
    /* ============================================================================================================ */
    /* Category: Synchronization                                                                                    */
    /* ============================================================================================================ */
    keyRemoteInstanceUrl: {
        label: 'remote_server_url',
        validators: ['url'],
    },
    keyRemoteInstanceUsername: {
        label: 'remote_server_username',
    },
    keyRemoteInstancePassword: {
        label: 'remote_server_password',
        type: 'password',
    },
    keyMetadataDataVersioning: {
        label: 'keyVersionEnabled',
        type: 'metadataSettings',
    },
    keyVersionEnabled: {
        label: 'keyVersionEnabled',
        type: 'checkbox',
    },
    keyStopMetadataSync: {
        label: 'keyStopMetadataSync',
        type: 'checkbox',
    },
    createVersionButton: {
        label: 'create_metadata_version',
        type: 'postButton',
        uri: '/metadata/version/create',
    },
    /* ============================================================================================================ */
    /* Category: Data Import                                                                                        */
    /* ============================================================================================================ */
    keyDataImportStrictPeriods: {
        label: 'require_periods_to_match_period_type',
        type: 'checkbox',
    },
    keyDataImportStrictDataElements: {
        label: 'require_data_elements_to_be_part_of_data_set',
        type: 'checkbox',
    },
    keyDataImportStrictCategoryOptionCombos: {
        label: 'require_category_option_combos_to_match',
        type: 'checkbox',
    },
    keyDataImportStrictOrganisationUnits: {
        label: 'require_organisation_units_to_match_assignment',
        type: 'checkbox',
    },
    keyDataImportStrictAttributeOptionCombos: {
        label: 'require_attribute_option_combos_to_match',
        type: 'checkbox',
    },
    keyDataImportRequireCategoryOptionCombo: {
        label: 'require_category_option_combo_to_be_specified',
        type: 'checkbox',
    },
    keyDataImportRequireAttributeOptionCombo: {
        label: 'require_attribute_option_combo_to_be_specified',
        type: 'checkbox',
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
