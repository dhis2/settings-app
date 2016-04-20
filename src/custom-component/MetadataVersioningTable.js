require('fixed-data-table/dist/fixed-data-table.css');

var React = require('react');
import { getInstance as getD2, config, init as dhis2 } from 'd2/lib/d2';
import {Table, Column, Cell} from 'fixed-data-table';
import metadataSettings from './metadataSettings.component';

class metadataVersioningTable extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      metadataVersions:[],
      masterVersionName: null,
      lastFailedTime: null,
      hqInstanceUrl: null,
      isVersioningEnabled: null,
      remoteVersionName: null
    };
  };

  getRemoteMasterVersion(self){
    dhis2({baseUrl: this.state.hqInstanceUrl+'/api'})
      .then(d2=>{
        return d2.Api.getApi().get('/metadata/version');
      })
      .then(result=>{
        var remoteVersion = result;
        self.setState({
          remoteVersionName: remoteVersion.name
        });

        //To identify if it is hq or local
        if(this.state.hqInstanceUrl.length!=0)
          this.state.masterVersionName=this.state.remoteVersionName;

      })
      .catch(error => {
        console.log('error', error);
      });
  };

  render() {
    return (
      <metadataSettings>
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
        </metadataSettings>
    );
  }
}

module.exports = metadataVersioningTable;