require('fixed-data-table/dist/fixed-data-table.css');

var React = require('react');
var PropTypes = React.PropTypes;
var FixedDataTable = require('fixed-data-table');
var Table = FixedDataTable.Table;
var Column = FixedDataTable.Column;

// Material-UI
let MenuItem = require('material-ui/lib/menus/menu-item');
let IconMenu = require('material-ui/lib/menus/icon-menu');
let IconButton = require('material-ui/lib/icon-button');
let Colors = require('material-ui/lib/styles/colors');
let MoreVertIcon = require('material-ui/lib/svg-icons/navigation/more-vert');

function cellMenuRenderer(cellData, key, rowData, rowIndex, columnData, width) {
  let button = (
    <IconButton
      touch={true}
      tooltip='Click to see menu.'
      tooltipPosition='bottom-left'>
      <MoreVertIcon color={Colors.grey400} />
    </IconButton>
  );
  return (
    <IconMenu iconButtonElement={button}>
      <MenuItem primaryText="Edit" />
      <MenuItem primaryText="New Test" />
      <MenuItem primaryText="Review" />
    </IconMenu>
  );
}

var metadataVersions = React.createClass({
  propTypes: {
    onContentDimensionsChange: PropTypes.func,
    left: PropTypes.number,
    top: PropTypes.number
  },

  getInitialState() {
    var jsonText = '[{"First":"Joe","Last":"Smith","Company":"Joe\'s Garage","Email":"joe@smith.com"},{"First":"Jill","Last":"Smithers","Company":"Jill\'l Rehab Center","Email":"jill@smithers.com"},{"First":"Brenda","Last":"Jones","Company":"Foodmart","Email":"brenda@jones.com"}]';
    let data = JSON.parse(jsonText);
    console.log(data);
    return {
      rows: data
    };
  },

  rowGetter(index) {
    return this.state.rows[index];
  },

  render() {
    return (
      <Table
        headerHeight={40}
        rowHeight={30}
        rowsCount={this.state.rows.length}
        rowGetter={this.rowGetter}
        width={800}
        height={500}>
        <Column
          width={100}
          cellRenderer={cellMenuRenderer}
          align='center'
          dataKey='Menu'
          label='Menu'/>
        <Column
          width={150}
          dataKey='First'
          label='First'/>
        <Column
          width={150}
          dataKey='Last'
          label='Last'/>
        <Column
          width={150}
          dataKey='Company'
          label='Company'/>
        <Column
          width={150}
          dataKey='Email'
          label='Email'/>
      </Table>
    );
  }
});

module.exports = metadataVersions;