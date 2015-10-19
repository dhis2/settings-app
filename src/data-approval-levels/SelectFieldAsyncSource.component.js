import React from 'react';
import SelectField from 'material-ui/lib/select-field';

export default React.createClass({
    propTypes: {
        menuItemsSource: React.PropTypes.func,
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
                    menuItems: items,
                });
            });
    },

    render() {
        return (<SelectField {...this.props} menuItems={this.state.menuItems} />);
    },
});
