import React from 'react';
import SelectField from 'material-ui/lib/select-field';

export default React.createClass({
    propTypes: {
        menuItemsSource: React.PropTypes.func,
        prependItems: React.PropTypes.array,
        appendItems: React.PropTypes.array,
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
        return (<SelectField {...this.props} menuItems={this.state.menuItems} />);
    },
});
