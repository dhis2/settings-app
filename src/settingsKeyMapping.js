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
        // Analytics
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
        // Analytics
        label: 'put_analytics_in_maintenance_mode',
        type: 'checkbox',
    },
    keyHideUnapprovedDataInAnalytics: {
        label: 'hide_unapproved_data_in_analytics',
        type: 'checkbox',
    },
    keyAcceptanceRequiredForApproval: {
        label: 'acceptance_required_before_approval',
        type: 'checkbox',
    },
    /* ============================================================================================================ */
    /* Category: Analytics                                                                                          */
    /* ============================================================================================================ */
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
    keyCacheAnalyticsDataYearThreshold: {
        label: 'threshold_for_analytics_data_caching',
        type: 'dropdown',
        options: {
            0: 'no_caching',
            1: '1_year',
            2: '2_years',
            3: '3_years',
            4: '4_years',
            5: '5_years',
            6: '6_years',
            7: '7_years',
            8: '8_years',
            9: '9_years',
            10: '10_years',
            11: '11_years',
            12: '12_years',
            13: '13_years',
            14: '14_years',
            15: '15_years',
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
            5: '5', // eslint-disable-line
            6: '6',
            7: '7',
            8: '8',
            16: '16',
            32: '32', // eslint-disable-line
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
    localizedText: {
        type: 'localizedAppearance',
        searchLabels: [
            'application_title',
            'application_introduction',
            'application_notification',
            'application_left_footer',
            'application_right_footer',
        ],
    },
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
        userSettingsOverride: true,
        searchLabels: ['style', 'can_be_overridden_by_user_settings'],
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
    keyUiLocale: {
        label: 'ui_locale',
        type: 'dropdown',
        userSettingsOverride: true,
        searchLabels: ['style', 'can_be_overridden_by_user_settings'],
        source: 'locales',
    },
    keyDbLocale: {
        label: 'db_locale',
        type: 'dropdown',
        userSettingsOverride: true,
        searchLabels: ['style', 'can_be_overridden_by_user_settings'],
        source: 'locales',
    },
    keyAnalysisDisplayProperty: {
        label: 'analysis_display_property',
        type: 'dropdown',
        userSettingsOverride: true,
        searchLabels: ['style', 'can_be_overridden_by_user_settings'],
        options: {
            name: 'name',
            shortName: 'short_name',
        },
    },
    keyAnalysisDigitGroupSeparator: {
        label: 'analysis_digit_group_separator',
        type: 'dropdown',
        options: {
            SPACE: 'space',
            COMMA: 'comma',
            NONE: 'none',
        },
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
    /* Category: Messaging                                                                                          */
    /* ============================================================================================================ */
    keyMessageEmailNotification: {
        label: 'enable_message_email_notifications',
        type: 'checkbox',
        userSettingsOverride: true,
        searchLabels: ['style', 'can_be_overridden_by_user_settings'],
    },
    keyMessageSmsNotification: {
        label: 'enable_message_sms_notifications',
        type: 'checkbox',
        userSettingsOverride: true,
        searchLabels: ['style', 'can_be_overridden_by_user_settings'],
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
            8: 8,
            10: 10,
            12: 12,
            14: 14,
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
    keyMapzenSearchApiKey: { label: 'mapzen_search_api_key' },
    keyGoogleMapsApiKey: { label: 'google_maps_api_key' },
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
    keySystemMonitoringUrl: {
        label: 'system_monitoring_url',
        validators: ['url'],
    },
    keySystemMonitoringUsername: {
        label: 'system_monitoring_username',
    },
    keySystemMonitoringPassword: {
        label: 'system_monitoring_password',
        type: 'password',
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
