import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

export default React.createClass({
    propTypes: {
        menuItemsSource: React.PropTypes.func,
        prependItems: React.PropTypes.array,
        appendItems: React.PropTypes.array,
        value: React.PropTypes.any,
        onChange: React.PropTypes.func.isRequired,
    },

    getInitialState() {
        return {
            menuItems: [],
        };
    },

    componentWillMount() {
        this.props.menuItemsSource()
            .then(items => {
                this.setState({
                    menuItems: (this.props.prependItems || []).concat(items).concat(this.props.appendItems || []),
                });
            });
    },

    render() {
        const {onChange, isRequired, menuItemsSource, prependItems, ...other} = this.props;
        return (
            <SelectField
                value={this.props.value}
                onChange={this.handleChange}
                {...other}>
                {this.state.menuItems.map((item, i) => {
                    return <MenuItem key={i} value={item.payload} primaryText={item.text} />;
                })}
            </SelectField>
        );
    },

    handleChange(event, index, value) {
        this.props.onChange({target: {value: value}});
    },
});
