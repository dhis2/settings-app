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
import classNames from 'classnames';

class metadataSettings extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      metadataVersions: [],
      selectedTransactionType: "BEST_EFFORT",
      masterVersionName: null,
      lastFailedTime: null,
      hqInstanceUrl: null,
      isVersioningEnabled: null,
      showVersions: null,
      remoteVersionName: null,
      isLocal: null,
      isSetupAvailable: "none",
      isInitialSetup: "block",
    };
    this.d2 = context.d2;
    this.getTranslation = context.d2.i18n.getTranslation.bind(context.d2.i18n);
    this.onSelectTransaction = this.onSelectTransaction.bind(this);
    this.saveSettingsKey = 'keyVersionEnabled';
    this.createVersionKey = 'createVersionButton';

    this.getLocaleName = function(code) {
      return configOptionStore.state &&
        configOptionStore.getState().locales
          .filter(locale => locale.id === code)
          .map(locale => locale.displayName)
          .pop() || code;
    };
  }


  onSelectTransaction(event, value) {
    this.setState({selectedTransactionType : value});
  }

  componentDidMount() {
    var self = this;
    this.getVersions(self)
      .then(function() {
        self.getSettings(self)
      });
  };

  getVersions(self) {
    return this.d2.Api.getApi().get('/metadata/versions')
      .then(result=> {
        var versions = result.metadataversions.sort(function(a, b) {
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

        self.setState({
          metadataVersions: versions
        });

        if( this.state.metadataVersions != undefined && this.state.metadataVersions.length != 0 )
          self.setState({ isSetupAvailable: "block", isInitialSetup: "none" });
        else
          self.setState({ isSetupAvailable: "none", isInitialSetup: "block" });

        return Promise.resolve()
      })
      .catch(error => {
        console.log('error', error);
        self.setState({ showVersions: "none" });
        return Promise.resolve()
      });
  };

  getSettings(self) {
    this.d2.Api.getApi().get('/systemSettings')
      .then(result=> {
        self.setState({
          lastFailedTime: (result.keyMetadataLastFailedTime == undefined ? null : result.keyMetadataLastFailedTime),
          isVersioningEnabled: result.keyVersionEnabled,
          hqInstanceUrl: result.keyRemoteInstanceUrl,
          remoteVersionName: result.keyRemoteMetadataVersion,
          lastFailedVersion: (result.keyMetadataFailedVersion == undefined ? null : result.keyMetadataFailedVersion),
          isSchedulerEnabled: (result.keySchedTasks != undefined)
        });

        if( this.state.isVersioningEnabled )
          this.state.showVersions = "block";
        else
          this.state.showVersions = "none";

        if( this.state.hqInstanceUrl != undefined && this.state.hqInstanceUrl.length != 0 ) //&& this.state.metadataVersions[0].importdate!=undefined
          self.setState({
            isLocal: "inline-block",
            masterVersionName: this.state.remoteVersionName,
            isHQ: "none",
            isLastSyncValid: ( ( this.state.lastFailedTime != null && this.state.lastFailedTime != undefined && this.state.metadataVersions != undefined && this.state.metadataVersions.length != 0 && new Date(this.state.lastFailedTime) > new Date(this.state.metadataVersions[ 0 ].importdate) ) ?
              "inline-block" : "none")
          });
        else
          self.setState({
            isLocal: "none",
            masterVersionName: (this.state.metadataVersions != undefined && this.state.metadataVersions.length != 0 ? this.state.metadataVersions[ 0 ].name : null),
            isHQ: "block"
          });

        return Promise.resolve()
      })
      .catch(error => {
        console.log('error', error);
        return Promise.resolve()
      });
  };

  saveVersion(self) {
    var mapping = settingsKeyMapping[ this.createVersionKey ];
    this.d2.Api.getApi().post(mapping.uri + '?type=' + this.state.selectedTransactionType)
      .then(result => {
        settingsActions.load(true);
        settingsActions.showSnackbarMessage(this.getTranslation('version_created'));
        return Promise.resolve()
      })
      .then(function() {
        self.getVersions(self)
          .then(function() {
            self.getSettings(self)
          });
      })
      .catch(error => {
        settingsActions.showSnackbarMessage(this.getTranslation('version_not_created'));
        return Promise.resolve()
      });
  };

  render() {
    const localeAppendage = this.state.locale === 'en' ? '' : this.state.locale;
    const checkboxfields = [ {
      name: 'keyVersionEnabled',
      value: settingsStore.state && settingsStore.state[ this.saveSettingsKey + localeAppendage ] || '',
      component: Checkbox,
      props: {
        label: this.getTranslation('keyVersionEnabled'),
        checked: ((settingsStore.state && settingsStore.state[ this.saveSettingsKey ])) === 'true',
        onCheck: (e, v) => {
          settingsActions.saveKey(this.saveSettingsKey, v ? 'true' : 'false');
          if( v )
            this.state.showVersions = "block";
          else
            this.state.showVersions = "none";
        },
      },
    } ];

    const createversionfields = [ {
      component: RaisedButton,
      name: 'create_metadata_version',
      props: {
        label: this.getTranslation('create_metadata_version'),
        onClick: () => {
          this.saveVersion(this);
        },
      },
    }
    ];

    const styles = {
      isVisible: {
        "display": this.state.showVersions
      },
      isLocal: {
        "display": this.state.isLocal,
        float: "right"
      },
      isHQ: {
        "display": this.state.isHQ
      },
      isLastSyncValid: {
        "display": this.state.isLastSyncValid,
        float: "right"
      },
      isSetupAvailable: {
        "display": this.state.isSetupAvailable
      }
    };

    return (
      <div>
        <br/><br/>
        <h2>{this.getTranslation("metadata_versioning")}</h2>
        <div>
          <FormBuilder fields={checkboxfields} onUpdateField={this.saveSettingsKey}/>
        </div>
        //className={classNames({hidden: !this.state.isVisible})}
        <div style={styles.isVisible}>
          <br/><br/>
          <h3>{this.getTranslation("create_metadata_version")}</h3>
          <hr/>
          <div>
            <div style={{ "display": "inline-block" }}>
              <RadioButtonGroup name="version_types" onChange={this.onSelectTransaction} defaultSelected="BEST_EFFORT" style={{ display: 'flex' }}>
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
            <div style={{ "display": "inline-block", "float": "right" }}>
              <FormBuilder fields={createversionfields} onUpdateField={this.createVersionKey}/>
            </div>
          </div>

          <br/><br/><br/>

          <div style={styles.isSetupAvailable}>
            <div>
              <div style={{display: "inline-block",float: "left"}}>
                <label style={{"fontWeight": "bold"}}>Master Version: </label>
                <span>{this.state.masterVersionName}</span>
              </div>

              <div align="right" style={styles.isLocal}>
                <div align="right" style={styles.isLastSyncValid}>
                  <label style={{"fontStyle": "italic"}}> Last sync attempt: </label>
                  <span>{this.state.lastFailedVersion}</span>
                  <span> | <span style={{"color":"red"}}>Failed</span> | {new Date(this.state.lastFailedTime).toLocaleString()}</span>
                </div>
              </div>
            </div>


            <div style={styles.isLocal}>
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


            <div style={styles.isHQ}>
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

          <div style={{display: this.state.isInitialSetup}}>
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