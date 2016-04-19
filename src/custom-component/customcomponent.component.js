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
import { getInstance as getD2 } from 'd2/lib/d2';
import {Table, Column, Cell} from 'fixed-data-table';

class customComponent extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            metadataVersions:[],
            selectedTransactionType: null
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
    var self = this;
    const qry=getD2().then(d2 => {
        return d2.Api.getApi().get('/metadata/versions');
      })
      .then(result=>{
        self.setState({
          metadataVersions: result.metadataversions.reverse()
        });
      })
      .catch(error => {
        console.log('error', error.message);
      });
  };


    render(){
        const localeAppendage = this.state.locale === 'en' ? '' : this.state.locale;
        const checkboxfields = [{
                name: 'keyVersionEnabled',
                value: settingsStore.state && settingsStore.state[this.saveSettingsKey + localeAppendage] || '',
                component: Checkbox,
                props: {
                    label: 'keyVersionEnabled',
                    checked: (settingsStore.state && settingsStore.state[this.saveSettingsKey]) === 'true',
                    onCheck: (e, v) => {
                        settingsActions.saveKey(this.saveSettingsKey, v ? 'true' : 'false');
                    },
                },
        }];

        const mapping = settingsKeyMapping[this.createVersionKey];
        const createversionfields = [
            {
                component: RaisedButton,
                props: {
                    label: 'create_metadata_version',
                    onClick: () => {
                        const qry = getD2().then(d2 => {
                                d2.Api.getApi().post(mapping.uri+'?type='+this.state.selectedTransactionType)});
                                //d2.Api.getApi().post(mapping.uri+'?type=BEST_EFFORT')})    ;
                        qry.then(result => {
                            //log.info(result && result.message || 'Ok');
                            settingsActions.load(true);
                            settingsActions.showSnackbarMessage('Version updated in system.');
                        }).catch(error => {
                            //log.error(error.message);
                            settingsActions.showSnackbarMessage('Version not updated in system. Contact your system administrator.');
                        });
                    },
                    style: { minWidth: 'initial', maxWidth: 'initial', marginTop: '1em' },
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

        return (
            <div>
                    <br/><br/>
                    <h3>{this.getLocaleName("metadata_versioning")}</h3>
                    <div>
                        <FormBuilder fields={checkboxfields} onUpdateField={this.saveSettingsKey}/>
                    </div>

                    <br/><br/>
                    <h4>{this.getLocaleName("create_new_version_label")}</h4><hr/>
                    <div>
                        <RadioButtonGroup ref="version_types" name="version_types" value={this.state.version_types} onChange={this.onSelectTransaction} defaultSelected="BEST_EFFORT">
                            <RadioButton
                              value="BEST_EFFORT"
                              label="BEST EFFORT"
                            />
                            <RadioButton
                              value="ATOMIC"
                              label="ATOMIC"
                            />
                        </RadioButtonGroup>
                    </div>
                    <div>
                        <FormBuilder fields={createversionfields} onUpdateField={this.createVersionKey}/>
                    </div><br/><br/>
              <div>
                <Table
                  rowHeight={50}
                  rowsCount={this.state.metadataVersions.length}
                  width={600}
                  maxHeight={(this.state.metadataVersions.length + 1) * 50}
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
            )}                          width={300}
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
        );
    }
}

export default customComponent;