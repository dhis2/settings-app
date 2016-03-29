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
    keyAnalyticsMaxLimit: {
        label: 'analytics_max_limit',
        type: 'dropdown',
        options: {
            50000: 50000,
            100000: 100000,
            200000: 200000,
            0: 'unlimited',
        },
    },
    infrastructuralIndicators: {
        label: 'infrastructural_indicators',
        configuration: true,
        type: 'dropdown',
        source: 'indicatorGroups',
    },
    infrastructuralDataElements: {
        label: 'infrastructural_data_elements',
        configuration: true,
        type: 'dropdown',
        source: 'dataElementGroups',
    },
    infrastructuralPeriodType: {
        label: 'infrastructural_period_type',
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
            Yearly: 'yearly',
            FinancialApril: 'FinancialApril',
            FinancialJuly: 'FinancialJuly',
            FinancialOct: 'FinancialOct',
        },
    },
    keyAnalysisRelativePeriod: {
        label: 'default_analysis_relative_period',
        type: 'dropdown',
        options: {
            THIS_MONTH: 'THIS_MONTH',
            LAST_MONTH: 'LAST_MONTH',
            THIS_BIMONTH: 'THIS_BIMONTH',
            LAST_BIMONTH: 'LAST_BIMONTH',
            THIS_QUARTER: 'THIS_QUARTER',
            LAST_QUARTER: 'LAST_QUARTER',
            THIS_SIX_MONTH: 'THIS_SIX_MONTH',
            LAST_SIX_MONTH: 'LAST_SIX_MONTH',
            MONTHS_THIS_YEAR: 'MONTHS_THIS_YEAR',
            QUARTERS_THIS_YEAR: 'QUARTERS_THIS_YEAR',
            THIS_YEAR: 'THIS_YEAR',
            MONTHS_LAST_YEAR: 'MONTHS_LAST_YEAR',
            QUARTERS_LAST_YEAR: 'QUARTERS_LAST_YEAR',
            LAST_YEAR: 'LAST_YEAR',
            LAST_5_YEARS: 'LAST_5_YEARS',
            LAST_12_MONTHS: 'LAST_12_MONTHS',
            LAST_6_MONTHS: 'LAST_6_MONTHS',
            LAST_3_MONTHS: 'LAST_3_MONTHS',
            LAST_6_BIMONTHS: 'LAST_6_BIMONTHS',
            LAST_4_QUARTERS: 'LAST_4_QUARTERS',
            LAST_2_SIXMONTHS: 'LAST_2_SIXMONTHS',
            THIS_FINANCIAL_YEAR: 'THIS_FINANCIAL_YEAR',
            LAST_FINANCIAL_YEAR: 'LAST_FINANCIAL_YEAR',
            LAST_5_FINANCIAL_YEARS: 'LAST_5_FINANCIAL_YEARS',
            THIS_WEEK: 'THIS_WEEK',
            LAST_WEEK: 'LAST_WEEK',
            LAST_4_WEEKS: 'LAST_4_WEEKS',
            LAST_12_WEEKS: 'LAST_12_WEEKS',
            LAST_52_WEEKS: 'LAST_52_WEEKS',
        },
    },
    feedbackRecipients: {
        label: 'feedback_recipients',
        configuration: true,
        type: 'dropdown',
        source: 'userGroups',
        includeEmpty: true,
        emptyLabel: 'no_feedback_recipients',
    },
    offlineOrganisationUnitLevel: {
        label: 'max_levels_to_offline',
        description: 'relative_to_current_user',
        configuration: true,
        type: 'dropdown',
        source: 'organisationUnitLevels',
    },
    factorDeviation: {
        label: 'data_analysis_factor',
        validators: ['positive_number'],
    },
    phoneNumberAreaCode: {
        label: 'phone_number_area_code',
        validators: ['number'],
    },
    helpPageLink: {
        label: 'help_page_link',
        validators: ['relative_url'],
    },
    multiOrganisationUnitForms: {
        label: 'multi_organisation_unit_forms',
        type: 'checkbox',
    },
    omitIndicatorsZeroNumeratorDataMart: {
        label: 'omit_indicators_zero_numerator_data_mart',
        type: 'checkbox',
    },
    keyAnalyticsMaintenanceMode: {
        label: 'put_analytics_in_maintenance_mode',
        type: 'checkbox',
    },
    /* ============================================================================================================ */
    /* Category: Server                                                                                             */
    /* ============================================================================================================ */
    keyCacheStrategy: {
        label: 'cache_strategy',
        type: 'dropdown',
        options: {
            NO_CACHE: 'no_cache',
            CACHE_1_HOUR: 'cache_for_one_hour',
            CACHE_6AM_TOMORROW: 'cache_until_6am_tomorrow',
            CACHE_TWO_WEEKS: 'cache_for_two_weeks',
        },
    },
    keyDatabaseServerCpus: {
        label: 'no_of_database_server_cpus',
        type: 'dropdown',
        options: {
            0: 'detect_based_on_web_server',
            1: '1', 2: '2', 3: '3', 4: '4', 5: '5',
            6: '6', 7: '7', 8: '8', 16: '16', 32: '32',
        },
    },
    keySystemNotificationsEmail: {
        label: 'system_notifications_email_address',
        validators: ['email'],
    },
    keyInstanceBaseUrl: {
        label: 'server_base_url',
        validators: ['url'],
    },
    googleAnalyticsUA: {
        label: 'google_analytics_ua_key',
    },
    /* ============================================================================================================ */
    /* Category: Appearance                                                                                         */
    /* ============================================================================================================ */
    applicationTitle: {
        label: 'application_title',
        appendLocale: true,
        multiLine: true,
    },
    keyApplicationIntro: {
        label: 'application_introduction',
        description: 'allows_html',
        appendLocale: true,
        multiLine: true,
    },
    keyApplicationNotification: {
        label: 'application_notification',
        description: 'allows_html',
        appendLocale: true,
        multiLine: true,
    },
    keyApplicationFooter: {
        label: 'application_left_footer',
        description: 'allows_html',
        appendLocale: true,
        multiLine: true,
    },
    keyApplicationRightFooter: {
        label: 'application_right_footer',
        description: 'allows_html',
        appendLocale: true,
        multiLine: true,
    },
    keyStyle: {
        label: 'style',
        type: 'dropdown',
        source: 'styles',
    },
    startModule: {
        label: 'start_page',
        type: 'dropdown',
        source: 'startModules',
    },
    keyFlag: {
        label: 'flag',
        type: 'dropdown',
        source: 'flags',
    },
    keyRequireAddToView: {
        label: 'require_authority_to_add_to_view_object_lists',
        type: 'checkbox',
    },
    keyUseCustomLogoFront: {
        label: 'custom_login_page_logo',
        type: 'staticContent',
        name: 'logo_front',
    },
    keyUseCustomLogoBanner: {
        label: 'custom_top_menu_logo',
        type: 'staticContent',
        name: 'logo_banner',
    },
    /* ============================================================================================================ */
    /* Category: Email                                                                                              */
    /* ============================================================================================================ */
    keyEmailHostName: { label: 'host_name' },
    keyEmailPort: {
        label: 'port',
        type: 'dropdown',
        options: {
            587: 587,
            465: 465,
            25: 25,
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
    },
    keyAccountRecovery: {
        label: 'enable_user_account_recovery',
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
    keyOpenIdProvider: { label: 'openid_provider' },
    keyOpenIdProviderLabel: { label: 'openid_provider_label' },
    corsWhitelist: {
        label: 'cors_whitelist',
        configuration: true,
        multiLine: true,
        hintText: 'one_url_per_line',
        validators: ['url_array'],
    },
    /* ============================================================================================================ */
    /* Category: Approval                                                                                           */
    /* ============================================================================================================ */
    keyHideUnapprovedDataInAnalytics: {
        label: 'hide_unapproved_data_in_analytics',
        type: 'checkbox',
    },
    keyAcceptanceRequiredForApproval: {
        label: 'acceptance_required_before_approval',
        type: 'checkbox',
    },
    dataApprovalLevels: {
        label: 'data_approval_levels',
        type: 'approval',
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
    /* Category: Calendar                                                                                           */
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
    /* ============================================================================================================ */
    /* Category: Data Import                                                                                        */
    /* ============================================================================================================ */
    keyDataImportStrictPeriods: {
        label: 'require_periods_to_match_period_type',
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
        label: 'oauth2clients',
        type: 'oauth2clients',
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
