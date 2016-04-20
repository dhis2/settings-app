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
import { getInstance as getD2, config } from 'd2/lib/d2';
import {Table, Column, Cell} from 'fixed-data-table';

class customComponent extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            metadataVersions:[],
            selectedTransactionType: "BEST_EFFORT",
            masterVersionName: null,
            lastFailedTime: null,
            hqInstanceUrl: null,
            isVersioningEnabled: null,
            showVersions: null,
            remoteVersionName: null
            //locale: context.d2.currentUser.uiLocale,
            //localeName: LocalizedTextEditor.getLocaleName(context.d2.currentUser.uiLocale),
        };

        this.handleChange = this.handleChange.bind(this);
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
        //this.getTranslation = context.d2.i18n.getTranslation.bind(context.d2.i18n);
    }

    handleChange(e) {
        this.setState({
            locale: e.target.value,
            localeName: this.getLocaleName(e.target.value),
        }, () => {
            // Have to force update because.
            this.forceUpdate();
        });
    };

    onSelectTransaction(event, value) {
        this.state.selectedTransactionType = value;
    }

    componentDidMount(){
      console.log(config.baseUrl);
      var self = this;
      this.getVersions(self);
      this.getSettings(self);
      //this.getRemoteMasterVersion(self);
    };

    getVersions(self){
      getD2().then(d2 => {
          return d2.Api.getApi().get('/metadata/versions');
        })
        .then(result=>{
          var versions = result.metadataversions.reverse();
          self.setState({
            metadataVersions: versions,
            masterVersionName: versions[0].name
          });
        })
        .catch(error => {
          console.log('error', error);
        });
    };

    getSettings(self){
      getD2().then(d2 => {
          return d2.Api.getApi().get('/systemSettings');
        })
        .then(result=>{
          self.setState({
            lastFailedTime: result.keyMetadataLastFailedTime,
            isVersioningEnabled: result.keyVersionEnabled,
            hqInstanceUrl: result.keyRemoteInstanceUrl
          });
          if(this.state.isVersioningEnabled)
            this.state.showVersions = "block";
          else
            this.state.showVersions= "none";

          console.log(this.state.hqInstanceUrl)
        })
        .catch(error => {
          console.log('error', error);
        });
    };

    saveVersion(){
      var mapping = settingsKeyMapping[this.createVersionKey];
      getD2().then(d2 => {
        return d2.Api.getApi().post(mapping.uri+'?type='+this.state.selectedTransactionType)
        //d2.Api.getApi().post(mapping.uri+'?type=BEST_EFFORT')
      })
      .then(result => {
        settingsActions.load(true);
        settingsActions.showSnackbarMessage('Version updated in system.');
      }).catch(error => {
        //log.error(error);
        settingsActions.showSnackbarMessage('Version not updated in system. Contact your system administrator.');
      });
    };

    //getRemoteMasterVersion(self){
    //  dhis2({baseUrl: this.state.hqInstanceUrl+'/api'})
    //  .then(d2=>{
    //    return d2.Api.getApi().get('/metadata/version');
    //  })
    //    .then(result=>{
    //      var remoteVersion = result;
    //      self.setState({
    //        remoteVersionName: remoteVersion.name
    //      });
    //
    //      //To identify if it is hq or local
    //      if(this.state.hqInstanceUrl.length!=0)
    //        this.state.masterVersionName=this.state.remoteVersionName;
    //
    //    })
    //    .catch(error => {
    //      console.log('error', error);
    //    });
    //};

    render(){
        const localeAppendage = this.state.locale === 'en' ? '' : this.state.locale;
        const checkboxfields = [{
                name: 'keyVersionEnabled',
                value: settingsStore.state && settingsStore.state[this.saveSettingsKey + localeAppendage] || '',
                component: Checkbox,
                props: {
                    label: 'Enable versioning for metadata sync',
                    checked: (settingsStore.state && settingsStore.state[this.saveSettingsKey]) === 'true',
                    onCheck: (e, v) => {
                        settingsActions.saveKey(this.saveSettingsKey, v ? 'true' : 'false');
                        if(v)
                          this.state.showVersions = "block";
                        else
                          this.state.showVersions = "none";
                    },
                },
        }];

        const createversionfields = [{
                component: RaisedButton,
                props: {
                    label: 'Create new version',
                    onClick: () => {
                            this.saveVersion().then(this.getVersions);
                    },
                },
            }
            //,{
            //    name: '',
            //    component: RadioButtonGroup,
            //    props: {
            //
            //    }
            //}
        ];

        const styles = {
          bold: {
            "font-weight": "bold"
          },
          isVisible: {
            "display": this.state.showVersions
          },
          singleLine: {
            "display": "inline-block"
          }
        };

        return (
            <div>
                    <br/><br/>
                    <h2>{this.getLocaleName("Metadata Versioning")}</h2>
                    <div>
                        <FormBuilder fields={checkboxfields} onUpdateField={this.saveSettingsKey}/>
                    </div>

              <div style={styles.isVisible}>
                    <br/><br/>
                    <h3>{this.getLocaleName("Create a new version")}</h3><hr/>
                    <div style={styles.singleLine}>
                        <RadioButtonGroup name="version_types" onChange={this.onSelectTransaction} defaultSelected="BEST_EFFORT">
                            <RadioButton
                              value="BEST_EFFORT"
                              label="Best Effort"
                            />
                            <RadioButton
                              value="ATOMIC"
                              label="Atomic"
                            />
                        </RadioButtonGroup><br/>
                      <FormBuilder fields={createversionfields} onUpdateField={this.createVersionKey}/>
                    </div>

              <br/><br/><br/>

              <div>
                <label for="master-version" style={styles.bold}>Master Version: </label>
                <span id="master-version">{this.state.masterVersionName}</span>
              </div>

              <div align="right">
                <label style={styles.bold}> Last sync attempt: </label>
                <span>{this.state.lastFailedTime}</span>
              </div>

              <div>
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
                {this.state.metadataVersions[rowIndex].created}
              </Cell>
            )}                          width={400}
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
                </Table>
              </div>

         </div>
            </div>
        );
    }
}

export default customComponent;