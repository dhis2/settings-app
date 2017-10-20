import React from 'react';
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';
import RaisedButton from 'material-ui/RaisedButton';
import { RadioButtonGroup, RadioButton } from 'material-ui/RadioButton';
import CircularProgress from 'material-ui/CircularProgress';
import { Table, Column, Cell } from 'fixed-data-table';
import log from 'loglevel';

import Checkbox from '../form-fields/check-box';
import settingsActions from '../settingsActions';
import settingsStore from '../settingsStore';
import settingsKeyMapping from '../settingsKeyMapping';

require('fixed-data-table/dist/fixed-data-table.css');

class metadataSettings extends React.Component {
    constructor(props, context) {
        super(props, context);

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
        };
        this.d2 = context.d2;
        this.getTranslation = context.d2.i18n.getTranslation.bind(context.d2.i18n);
        this.onSelectTransactionType = this.onSelectTransactionType.bind(this);
        this.syncVersions = this.syncVersions.bind(this);
        this.syncSettings = this.syncSettings.bind(this);
        this.createVersion = this.createVersion.bind(this);
        this.onToggleVersioning = this.onToggleVersioning.bind(this);
        this.onToggleStopSync = this.onToggleStopSync.bind(this);
        this.saveSettingsKey = 'keyVersionEnabled';
        this.stopMetadataSyncKey = 'keyStopMetadataSync';
        this.createVersionKey = 'createVersionButton';
    }

    componentDidMount() {
        this.subscriptions = [];
        this.subscriptions.push(settingsStore.subscribe((settings) => {
            this.setState({ isVersioningEnabled: settings[this.saveSettingsKey] === 'true' }, () => {
                this.syncVersions();
                this.syncVersions()
                    .then(this.syncSettings);
            });
        }));
    }

    componentWillUnmount() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    onSelectTransactionType(event, value) {
        this.setState({ selectedTransactionType: value });
    }

    onToggleVersioning(e, v) {
        settingsActions.saveKey(this.saveSettingsKey, v ? 'true' : 'false');
    }

    onToggleStopSync(e, v) {
        settingsActions.saveKey(this.stopMetadataSyncKey, v ? 'true' : 'false');
    }

    createVersion() {
        const mapping = settingsKeyMapping[this.createVersionKey];
        this.setState({ isTaskRunning: true });
        this.d2.Api.getApi().post(`${mapping.uri}?type=${this.state.selectedTransactionType}`)
            .then(() => {
                this.setState({ isTaskRunning: false });
                settingsActions.load(true);
                settingsActions.showSnackbarMessage(this.getTranslation('version_created'));
                return Promise.resolve();
            })
            .then(this.sync)
            .catch((error) => {
                this.setState({ isTaskRunning: false });
                log.warn('Error creating version:', error);
                settingsActions.showSnackbarMessage(this.getTranslation('version_not_created'));
                return Promise.resolve();
            });
    }

    syncSettings() {
        this.d2.Api.getApi().get('/systemSettings')
            .then((result) => {
                this.setState({
                    lastFailedTime: (result.keyMetadataLastFailedTime ? result.keyMetadataLastFailedTime : null),
                    isVersioningEnabled: result.keyVersionEnabled,
                    hqInstanceUrl: result.keyRemoteInstanceUrl,
                    remoteVersionName: result.keyRemoteMetadataVersion,
                    lastFailedVersion: (result.keyMetadataFailedVersion ? result.keyMetadataFailedVersion : null),
                    isSchedulerEnabled: (result.keySchedTasks !== undefined),
                });

                if (this.state.hqInstanceUrl !== undefined && this.state.hqInstanceUrl.length !== 0) {
                    this.setState({
                        isLocalInstance: true,
                        masterVersionName: this.state.remoteVersionName,
                        isLastSyncValid: this.state.lastFailedTime != null,
                    });
                } else {
                    this.setState({
                        isLocalInstance: false,
                        masterVersionName: (
                            this.state.metadataVersions !== undefined && this.state.metadataVersions.length !== 0
                                ? this.state.metadataVersions[0].name
                                : null
                        ),
                    });
                }
                return Promise.resolve();
            })
            .catch((error) => {
                log.warn('Error:', error);
                settingsActions.showSnackbarMessage(this.getTranslation('error_fetching_settings'));
                return Promise.resolve();
            });
    }

    syncVersions() {
        if (this.state.isVersioningEnabled === true) {
            return this.d2.Api.getApi().get('/metadata/versions')
                .then((result) => {
                    const versions = result.metadataversions.sort((a, b) => {
                        if (a.created < b.created) {
                            return 1;
                        } else if (a.created > b.created) {
                            return -1;
                        }

                        return 0;
                    });
                    versions.forEach((version) => {
                        version.importdate = version.importdate ? new Date(version.importdate).toLocaleString() : 'NA'; // eslint-disable-line
                    });
                    this.setState({
                        metadataVersions: versions,
                        hasVersions: (versions !== undefined && versions.length !== 0),
                    });
                    return Promise.resolve();
                })
                .catch((error) => {
                    log.error('Error:', error);
                    this.setState({ hasVersions: false });
                    return Promise.resolve();
                });
        }

        return Promise.resolve();
    }

    /* eslint-disable complexity */
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
        };

        const fieldGetter = (field, filter = x => x) => ({ rowIndex, ...props }) => (
            <Cell {...props}>{filter(this.state.metadataVersions[rowIndex][field])}</Cell>
        );

        const dateFmt = str => new Date(str).toLocaleString();

        return (
            <div>
                <h3>{this.getTranslation('create_metadata_version')}</h3>
                <div>
                    <div style={{ display: 'inline-block' }}>
                        <RadioButtonGroup
                            name="version_types"
                            onChange={this.onSelectTransactionType}
                            defaultSelected="BEST_EFFORT"
                            style={{ display: 'flex' }}
                        >
                            <RadioButton
                                value="BEST_EFFORT"
                                label={this.getTranslation('version_type_best_effort')}
                                disabled={this.state.isTaskRunning}
                            />
                            <RadioButton
                                value="ATOMIC"
                                label={this.getTranslation('version_type_atomic')}
                                disabled={this.state.isTaskRunning}
                            />
                        </RadioButtonGroup>
                    </div>

                    <div style={styles.inlineRight}>
                        {this.state.isTaskRunning &&
                        <CircularProgress style={styles.inlineProgressIcon} size={0.5} />}
                        <RaisedButton
                            label={this.getTranslation('create_metadata_version')}
                            onClick={this.createVersion}
                            disabled={this.state.isTaskRunning}
                        />
                    </div>
                </div>

                <div style={this.state.hasVersions ? styles.visible : styles.hidden}>
                    <div style={{ display: 'inline-block', float: 'left' }}>
                        <span style={{ fontSize: '1.17em', fontWeight: 'bold', marginRight: 8 }}>
                            {this.getTranslation('master_version')}:
                        </span>
                        {this.state.masterVersionName || this.getTranslation('none')}
                    </div>

                    <div style={this.state.isLocalInstance ? styles.inlineRight : styles.hidden}>
                        <div style={this.state.isLastSyncValid ? styles.inlineRight : styles.hidden}>
                            <span style={{ fontStyle: 'italic' }}>
                                {this.getTranslation('last_sync_attempt')}:
                            </span>
                            <span>{this.state.lastFailedVersion}</span>
                            <span> | <span style={{ color: 'red' }}>{this.getTranslation('failed')}</span>
                                | {new Date(this.state.lastFailedTime).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div style={this.state.isLocalInstance ? styles.visible : styles.hidden}>
                    <Table
                        rowHeight={50}
                        rowsCount={this.state.metadataVersions.length}
                        width={670}
                        maxHeight={(50 * 6)}
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

                <div style={this.state.isLocalInstance ? styles.hidden : styles.visible}>
                    <Table
                        rowHeight={50}
                        rowsCount={this.state.metadataVersions.length}
                        width={670}
                        maxHeight={(50 * 6)}
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

                <div style={this.state.hasVersions ? styles.hidden : styles.visible}>
                    <h4>{this.getTranslation('no_versions_exist')}</h4>
                </div>

            </div>
        );
    }
    /* eslint-enable complexity */

    render() {
        const localeAppendage = this.state.locale === 'en' ? '' : this.state.locale;
        const checkboxFields = [
            {
                name: 'keyVersionEnabled',
                value: (settingsStore.state && settingsStore.state[this.saveSettingsKey + localeAppendage]) || '',
                component: Checkbox,
                props: {
                    label: this.getTranslation('keyVersionEnabled'),
                    checked: ((settingsStore.state && settingsStore.state[this.saveSettingsKey])) === 'true',
                    onCheck: this.onToggleVersioning,
                    disabled: this.state.isTaskRunning,
                },
            },
            {
                name: 'keyStopMetadataSync',
                value: (settingsStore.state && settingsStore.state[this.stopMetadataSyncKey + localeAppendage]) || '',
                component: Checkbox,
                props: {
                    label: this.getTranslation('keyStopMetadataSync'),
                    checked: ((settingsStore.state && settingsStore.state[this.stopMetadataSyncKey])) === 'true',
                    onCheck: this.onToggleStopSync,
                },
            },
        ];

        return (
            <div style={{ paddingTop: '2rem' }}>
                <h2>{this.getTranslation('metadata_versioning')}</h2>
                <FormBuilder fields={checkboxFields} onUpdateField={settingsActions.saveKey} />

                {this.state.isVersioningEnabled === true ? this.renderVersionList() : null}
            </div>
        );
    }
}
metadataSettings.contextTypes = {
    d2: React.PropTypes.object.isRequired,
};

export default metadataSettings;
