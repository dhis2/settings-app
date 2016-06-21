require('fixed-data-table/dist/fixed-data-table.css');

import React from 'react';
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';
import Checkbox from '../form-fields/check-box';
import RaisedButton from 'material-ui/lib/raised-button';
import RadioButtonGroup from 'material-ui/lib/radio-button-group';
import RadioButton from 'material-ui/lib/radio-button';
import settingsActions from '../settingsActions';
import settingsStore from '../settingsStore';
import configOptionStore from '../configOptionStore';
import settingsKeyMapping from '../settingsKeyMapping';
import {Table, Column, Cell} from 'fixed-data-table';

class metadataSettings extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      metadataVersions: [],
      selectedTransactionType: "BEST_EFFORT",
      masterVersionName: null,
      lastFailedTime: null,
      hqInstanceUrl: null,
      isVersioningEnabled: false,
      remoteVersionName: null,
      isLocalInstance: false,
      hasVersions: false
    };
    this.d2 = context.d2;
    this.getTranslation = context.d2.i18n.getTranslation.bind(context.d2.i18n);
    this.onSelectTransactionType = this.onSelectTransactionType.bind(this);
    this.syncVersions = this.syncVersions.bind(this);
    this.syncSettings = this.syncSettings.bind(this);
    this.createVersion = this.createVersion.bind(this);
    this.sync = this.sync.bind(this);
    this.onToggleVersioning = this.onToggleVersioning.bind(this);
    this.saveSettingsKey = 'keyVersionEnabled';
    this.createVersionKey = 'createVersionButton';
  }

  sync(){
    return this.syncVersions()
      .then(this.syncSettings)
  }
  onSelectTransactionType(event, value) {
    this.setState({selectedTransactionType : value});
  }

  componentDidMount() {
    this.sync()
  };

  syncVersions() {
    return this.d2.Api.getApi().get('/metadata/versions')
      .then(result=> {
        const versions = result.metadataversions.sort(function(a, b) {
          if( a.created < b.created )
            return 1;
          else if( a.created > b.created )
            return -1;
          else
            return 0;
        });
        versions.forEach(version =>{
          version.importdate = version.importdate ? new Date(version.importdate).toLocaleString() : "NA";
        });
        this.setState({
          metadataVersions: versions,
          hasVersions: ( versions != undefined && versions.length != 0 )
        });
        return Promise.resolve()
      })
      .catch(error => {
        console.log('error', error);
        this.setState({ hasVersions: false });
        return Promise.resolve()
      });
  };

  syncSettings() {
    this.d2.Api.getApi().get('/systemSettings')
      .then(result=> {
        this.setState({
          lastFailedTime: (result.keyMetadataLastFailedTime ? null : result.keyMetadataLastFailedTime),
          isVersioningEnabled: result.keyVersionEnabled,
          hqInstanceUrl: result.keyRemoteInstanceUrl,
          remoteVersionName: result.keyRemoteMetadataVersion,
          lastFailedVersion: (result.keyMetadataFailedVersion ? null : result.keyMetadataFailedVersion),
          isSchedulerEnabled: (result.keySchedTasks != undefined)
        });

        if( this.state.hqInstanceUrl != undefined && this.state.hqInstanceUrl.length != 0 )
          this.setState({
            isLocalInstance: true,
            masterVersionName: this.state.remoteVersionName,
            isLastSyncValid:  this.state.lastFailedTime != null
          });
        else
          this.setState({
            isLocalInstance: false,
            masterVersionName: (this.state.metadataVersions != undefined && this.state.metadataVersions.length != 0 ? this.state.metadataVersions[ 0 ].name : null),
          });
        return Promise.resolve()
      })
      .catch(error => {
        console.log('error', error);
        settingsActions.showSnackbarMessage(this.getTranslation('error_fetching_settings'));
        return Promise.resolve()
      });
  };

  createVersion() {
    const mapping = settingsKeyMapping[ this.createVersionKey ];
    this.d2.Api.getApi().post(mapping.uri + '?type=' + this.state.selectedTransactionType)
      .then(result => {
        settingsActions.load(true);
        settingsActions.showSnackbarMessage(this.getTranslation('version_created'));
        return Promise.resolve()
      })
      .then(this.sync)
      .catch(error => {
        console.log('error', error)
        settingsActions.showSnackbarMessage(this.getTranslation('version_not_created'));
        return Promise.resolve()
      });
  };

  onToggleVersioning(e, v){
    this.setState({isVersioningEnabled: v})
    settingsActions.saveKey(this.saveSettingsKey, v ? 'true' : 'false')
    setTimeout(this.sync, 100);
  }

  render() {
    const localeAppendage = this.state.locale === 'en' ? '' : this.state.locale;
    const checkboxFields = [ {
      name: 'keyVersionEnabled',
      value: settingsStore.state && settingsStore.state[ this.saveSettingsKey + localeAppendage ] || '',
      component: Checkbox,
      props: {
        label: this.getTranslation('keyVersionEnabled'),
        checked: ((settingsStore.state && settingsStore.state[ this.saveSettingsKey ])) === 'true',
        onCheck: this.onToggleVersioning
      },
    } ];

    const createVersionFields = [ {
      component: RaisedButton,
      name: 'create_metadata_version',
      props: {
        label: this.getTranslation('create_metadata_version'),
        onClick: this.createVersion

      },
    }
    ];

    const styles = {

      inlineRight: {
        "display": "inline-block",
        float: "right"
      },

      visible: {
        "display": "block"
      },

      hidden: {
        "display": "none"
      }

    };

    return (


      <div>

        <br/><br/>
        <h2>{this.getTranslation("metadata_versioning")}</h2>
        <div>
          <FormBuilder fields={checkboxFields} onUpdateField={this.saveSettingsKey}/>
        </div>
        <div style={this.state.isVersioningEnabled ? styles.visible : styles.hidden}>
          <br/><br/>
          <h3>{this.getTranslation("create_metadata_version")}</h3>
          <hr/>
          <div>
            <div style={{ "display": "inline-block" }}>
              <RadioButtonGroup name="version_types" onChange={this.onSelectTransactionType} defaultSelected="BEST_EFFORT" style={{ display: 'flex' }}>
                <RadioButton
                  value="BEST_EFFORT"
                  label={this.getTranslation('version_type_best_effort')}
                />
                <RadioButton
                  value="ATOMIC"
                  label={this.getTranslation('version_type_atomic')}
                />
              </RadioButtonGroup>
            </div>
            <div style={styles.inlineRight}>
              <FormBuilder fields={createVersionFields} onUpdateField={this.createVersionKey}/>
            </div>
          </div>

          <br/><br/><br/>

          <div style={this.state.hasVersions ? styles.visible : styles.hidden}>
            <div>
              <div style={{display: "inline-block",float: "left"}}>
                <label style={{"fontWeight": "bold"}}>Master Version: </label>
                <span>{this.state.masterVersionName}</span>
              </div>

              <div align="right" style={this.state.isLocalInstance ? styles.inlineRight : styles.hidden}>
                <div align="right" style={this.state.isLastSyncValid ? styles.inlineRight : styles.hidden}>
                  <label style={{"fontStyle": "italic"}}> Last sync attempt: </label>
                  <span>{this.state.lastFailedVersion}</span>
                  <span> | <span style={{"color":"red"}}>Failed</span> | {new Date(this.state.lastFailedTime).toLocaleString()}</span>
                </div>
              </div>
            </div>


            <div style={this.state.isLocalInstance ? styles.inlineRight : styles.hidden}>
              <Table
                rowHeight={50}
                rowsCount={this.state.metadataVersions.length}
                width={700}
                maxHeight={(50 * 6)}
                headerHeight={50}>
                <Column
                  header={<Cell>Version</Cell>}
                  cell={({rowIndex, ...props}) => (
              <Cell {...props}>
                {this.state.metadataVersions[rowIndex].name}
              </Cell>
            )}
                  width={150}
                />
                <Column
                  header={<Cell>When</Cell>}
                  cell={({rowIndex, ...props}) => (
              <Cell {...props}>
                {new Date(this.state.metadataVersions[rowIndex].created).toLocaleString()}
              </Cell>
            )} width={200}
                />
                <Column
                  header={<Cell>Type</Cell>}
                  cell={({rowIndex, ...props}) => (
              <Cell {...props}>
                {this.state.metadataVersions[rowIndex].type}
              </Cell>
            )}
                  width={150}
                />

                <Column
                  header={<Cell>Last Sync</Cell>}
                  cell={({rowIndex, ...props}) => (
              <Cell {...props}>
                {this.state.metadataVersions[rowIndex].importdate}
              </Cell>
            )}
                  width={200}
                />

              </Table>
            </div>


            <div style={this.state.isLocalInstance ? styles.hidden : styles.visible}>
              <Table
                rowHeight={50}
                rowsCount={this.state.metadataVersions.length}
                width={700}
                maxHeight={(50 * 6)}
                headerHeight={50}>
                <Column
                  header={<Cell>Version</Cell>}
                  cell={({rowIndex, ...props}) => (
              <Cell {...props}>
                {this.state.metadataVersions[rowIndex].name}
              </Cell>
            )}
                  width={200}
                />
                <Column
                  header={<Cell>When</Cell>}
                  cell={({rowIndex, ...props}) => (
              <Cell {...props}>
                {new Date(this.state.metadataVersions[rowIndex].created).toLocaleString()}
              </Cell>
            )} width={300}
                />
                <Column
                  header={<Cell>Type</Cell>}
                  cell={({rowIndex, ...props}) => (
              <Cell {...props}>
                {this.state.metadataVersions[rowIndex].type}
              </Cell>
            )}
                  width={200}
                />

              </Table>
            </div>

          </div>

          <div style={this.state.hasVersions ? styles.hidden : styles.visible}>
            <h4>{this.getTranslation('no_versions_exist')}</h4>
          </div>

        </div>
      </div>
    );
  }
}
metadataSettings.contextTypes = {
  d2: React.PropTypes.object.isRequired
};

export default metadataSettings;