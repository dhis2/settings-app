import { Button } from '@dhis2/ui'
import { getInstance as getD2 } from 'd2'
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component.js'
import { Table, Column, Cell } from 'fixed-data-table'
import CircularProgress from 'material-ui/CircularProgress'
import { RadioButtonGroup, RadioButton } from 'material-ui/RadioButton'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Checkbox from '../form-fields/check-box.js'
import i18n from '../locales/index.js'
import settingsActions from '../settingsActions.js'
import settingsStore from '../settingsStore.js'
import 'fixed-data-table/dist/fixed-data-table.css'

class MetadataSettings extends Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            metadataVersions: [],
            selectedTransactionType: 'BEST_EFFORT',
            masterVersionName: null,
            lastFailedTime: null,
            hqInstanceUrl: null,
            isVersioningEnabled: false,
            remoteVersionName: null,
            isLocalInstance: false,
            hasVersions: false,
            isTaskRunning: false,
        }
        this.saveSettingsKey = 'keyVersionEnabled'
        this.stopMetadataSyncKey = 'keyStopMetadataSync'
        this.createVersionKey = 'createVersionButton'

        this.onSelectTransactionType = this.onSelectTransactionType.bind(this)
        this.onToggleVersioning = this.onToggleVersioning.bind(this)
        this.onToggleStopSync = this.onToggleStopSync.bind(this)
    }

    componentDidMount() {
        this.subscriptions = []
        this.subscriptions.push(
            settingsStore.subscribe((settings) => {
                this.setState(
                    {
                        isVersioningEnabled:
                            settings[this.saveSettingsKey] === 'true',
                    },
                    () => {
                        this.syncVersions().then(this.syncSettings)
                    }
                )
            })
        )
    }

    componentWillUnmount() {
        this.subscriptions.forEach((sub) => sub.unsubscribe())
    }

    onSelectTransactionType(event, value) {
        this.setState({ selectedTransactionType: value })
    }

    onToggleVersioning(e, v) {
        settingsActions.saveKey(this.saveSettingsKey, v ? 'true' : 'false')
    }

    onToggleStopSync(e, v) {
        settingsActions.saveKey(this.stopMetadataSyncKey, v ? 'true' : 'false')
    }

    createVersion = async () => {
        this.setState({ isTaskRunning: true })
        const d2 = await getD2()
        d2.Api.getApi()
            .post(
                `/metadata/version/create?type=${this.state.selectedTransactionType}`
            )
            .then(() => {
                this.setState({ isTaskRunning: false })
                settingsActions.load(true)
                settingsActions.showSnackbarMessage(i18n.t('Version created'))
                return Promise.resolve()
            })
            .then(this.sync)
            .catch(() => {
                this.setState({ isTaskRunning: false })
                settingsActions.showSnackbarMessage(
                    i18n.t('Failed to create version')
                )
                return Promise.resolve()
            })
    }

    syncSettings = async () => {
        const d2 = await getD2()
        try {
            const result = await d2.Api.getApi().get('/systemSettings')
            this.setState({
                lastFailedTime: result.keyMetadataLastFailedTime
                    ? result.keyMetadataLastFailedTime
                    : null,
                isVersioningEnabled: result.keyVersionEnabled,
                hqInstanceUrl: result.keyRemoteInstanceUrl,
                remoteVersionName: result.keyRemoteMetadataVersion,
                lastFailedVersion: result.keyMetadataFailedVersion
                    ? result.keyMetadataFailedVersion
                    : null,
                isSchedulerEnabled: result.keySchedTasks !== undefined,
            })

            if (
                this.state.hqInstanceUrl !== undefined &&
                this.state.hqInstanceUrl.length !== 0
            ) {
                this.setState({
                    isLocalInstance: true,
                    masterVersionName: this.state.remoteVersionName,
                    isLastSyncValid: this.state.lastFailedTime != null,
                })
            } else {
                this.setState({
                    isLocalInstance: false,
                    masterVersionName:
                        this.state.metadataVersions !== undefined &&
                        this.state.metadataVersions.length !== 0
                            ? this.state.metadataVersions[0].name
                            : null,
                })
            }
        } catch {
            settingsActions.showSnackbarMessage(
                i18n.t('Error fetching settings')
            )
        }
    }

    syncVersions = async () => {
        if (!this.state.isVersioningEnabled) {
            return
        }

        const d2 = await getD2()
        try {
            const result = await d2.Api.getApi().get('/metadata/versions')
            const versions = result.metadataversions.sort((a, b) => {
                if (a.created < b.created) {
                    return 1
                } else if (a.created > b.created) {
                    return -1
                }

                return 0
            })
            versions.forEach((version) => {
                version.importdate = version.importdate
                    ? new Date(version.importdate).toLocaleString()
                    : 'NA'
            })
            this.setState({
                metadataVersions: versions,
                hasVersions: versions !== undefined && versions.length !== 0,
            })
        } catch {
            this.setState({ hasVersions: false })
        }
    }

    renderVersionList() {
        const styles = {
            inlineRight: {
                display: 'inline-block',
                float: 'right',
            },
            visible: {
                display: 'block',
                paddingTop: '2rem',
            },
            hidden: {
                display: 'none',
            },
            inlineProgressIcon: {
                display: 'inline-block',
                top: '-7px',
                float: 'left',
            },
        }

        const fieldGetter =
            (field, filter = (x) => x) =>
            ({ rowIndex, ...props }) =>
                (
                    <Cell {...props}>
                        {filter(this.state.metadataVersions[rowIndex][field])}
                    </Cell>
                )

        const dateFmt = (str) => new Date(str).toLocaleString()

        return (
            <div>
                <h3
                    style={{
                        fontSize: '16px',
                        marginTop: '16px',
                        marginBottom: '8px',
                    }}
                >
                    {i18n.t('Create new version')}
                </h3>
                <div style={{ maxWidth: '600px' }}>
                    <div style={{ display: 'inline-block' }}>
                        <RadioButtonGroup
                            name="version_types"
                            onChange={this.onSelectTransactionType}
                            defaultSelected="BEST_EFFORT"
                            style={{ display: 'flex' }}
                        >
                            <RadioButton
                                value="BEST_EFFORT"
                                label={i18n.t('Best effort')}
                                disabled={this.state.isTaskRunning}
                            />
                            <RadioButton
                                value="ATOMIC"
                                label={i18n.t('Atomic')}
                                disabled={this.state.isTaskRunning}
                            />
                        </RadioButtonGroup>
                    </div>

                    <div style={styles.inlineRight}>
                        {this.state.isTaskRunning && (
                            <CircularProgress
                                style={styles.inlineProgressIcon}
                                size={0.5}
                            />
                        )}
                        <Button
                            onClick={this.createVersion}
                            disabled={this.state.isTaskRunning}
                        >
                            {i18n.t('Create new version')}
                        </Button>
                    </div>
                </div>

                <div
                    style={
                        this.state.hasVersions ? styles.visible : styles.hidden
                    }
                >
                    <dl style={{ display: 'inline-block', margin: 0 }}>
                        <dt
                            style={{
                                display: 'inline-block',
                                fontSize: '16px',
                                fontWeight: 'bold',
                            }}
                        >
                            {i18n.t('Master version:', { nsSeparator: '-:-' })}
                        </dt>
                        <dd style={{ display: 'inline-block' }}>
                            {this.state.masterVersionName || i18n.t('None')}
                        </dd>
                    </dl>
                    <div
                        style={
                            this.state.isLocalInstance &&
                            this.state.isLastSyncValid
                                ? styles.inlineRight
                                : styles.hidden
                        }
                    >
                        <span style={{ fontStyle: 'italic' }}>
                            {i18n.t('Last sync attempt')}
                        </span>
                        <span>{this.state.lastFailedVersion}</span>
                        <span>
                            {' | '}
                            <span style={{ color: 'var(--colors-red500)' }}>
                                {i18n.t('Failed')}
                            </span>
                            {' | '}
                            {new Date(
                                this.state.lastFailedTime
                            ).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div
                    style={
                        this.state.isLocalInstance
                            ? styles.visible
                            : styles.hidden
                    }
                >
                    <Table
                        rowHeight={50}
                        rowsCount={this.state.metadataVersions.length}
                        width={670}
                        maxHeight={50 * 6}
                        headerHeight={50}
                    >
                        <Column
                            header={<Cell>Version</Cell>}
                            cell={fieldGetter('name')}
                            width={135}
                        />
                        <Column
                            header={<Cell>When</Cell>}
                            cell={fieldGetter('created', dateFmt)}
                            width={205}
                        />
                        <Column
                            header={<Cell>Type</Cell>}
                            cell={fieldGetter('type')}
                            width={145}
                        />
                        <Column
                            header={<Cell>Last Sync</Cell>}
                            cell={fieldGetter('importdate')}
                            width={185}
                        />
                    </Table>
                </div>

                <div
                    style={
                        this.state.isLocalInstance
                            ? styles.hidden
                            : styles.visible
                    }
                >
                    <Table
                        rowHeight={50}
                        rowsCount={this.state.metadataVersions.length}
                        width={670}
                        maxHeight={50 * 6}
                        headerHeight={50}
                    >
                        <Column
                            header={<Cell>Version</Cell>}
                            cell={fieldGetter('name')}
                            width={190}
                        />
                        <Column
                            header={<Cell>When</Cell>}
                            cell={fieldGetter('created')}
                            width={280}
                        />
                        <Column
                            header={<Cell>Type</Cell>}
                            cell={fieldGetter('type')}
                            width={200}
                        />
                    </Table>
                </div>

                <div
                    style={
                        this.state.hasVersions ? styles.hidden : styles.visible
                    }
                >
                    <h4>{i18n.t('No versions exist')}</h4>
                </div>
            </div>
        )
    }

    render() {
        const localeAppendage =
            this.state.locale === 'en' ? '' : this.state.locale
        const checkboxFields = [
            {
                name: 'keyVersionEnabled',
                value:
                    (settingsStore.state &&
                        settingsStore.state[
                            this.saveSettingsKey + localeAppendage
                        ]) ||
                    '',
                component: Checkbox,
                props: {
                    label: i18n.t('Enable Versioning for metadata sync'),
                    checked:
                        (settingsStore.state &&
                            settingsStore.state[this.saveSettingsKey]) ===
                        'true',
                    onCheck: this.onToggleVersioning,
                    disabled: this.state.isTaskRunning,
                },
            },
            {
                name: 'keyStopMetadataSync',
                value:
                    (settingsStore.state &&
                        settingsStore.state[
                            this.stopMetadataSyncKey + localeAppendage
                        ]) ||
                    '',
                component: Checkbox,
                props: {
                    label: i18n.t(
                        `Don't sync metadata if DHIS versions differ`
                    ),
                    checked:
                        (settingsStore.state &&
                            settingsStore.state[this.stopMetadataSyncKey]) ===
                        'true',
                    onCheck: this.onToggleStopSync,
                },
            },
        ]

        return (
            <div style={{ paddingTop: '2rem' }}>
                <h2 style={{ fontSize: '22px' }}>
                    {i18n.t('Metadata Versioning')}
                </h2>
                <FormBuilder
                    fields={checkboxFields}
                    onUpdateField={settingsActions.saveKey}
                />
                {this.state.isVersioningEnabled && this.renderVersionList()}
            </div>
        )
    }
}

MetadataSettings.contextTypes = {
    d2: PropTypes.object.isRequired,
}

export default MetadataSettings
