import React from 'react';
import HeaderBar from 'd2-ui/lib/header-bar/HeaderBar.component';

export default React.createClass({
    childContextTypes: {
        d2: React.PropTypes.object,
    },

    getChildContext() {
        return {
            d2: this.props.d2,
        };
    },

    render() {
        return (<HeaderBar />);
    }
});
