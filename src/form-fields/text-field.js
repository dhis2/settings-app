import React from 'react';
import TextField from 'material-ui/lib/text-field';

import MuiThemeMixin from '../mui-theme.mixin';

export default React.createClass({
    propTypes: {
        value: React.PropTypes.string,
        multiLine: React.PropTypes.bool,
    },

    mixins: [MuiThemeMixin],

    getInitialState() {
        return {
            value: this.props.value,
        };
    },

    componentWillReceiveProps(props) {
        this.setState({ value: props.value });
    },

    render() {
        const errorStyle = {
            lineHeight: this.props.multiLine ? '48px' : '12px',
            marginTop: this.props.multiLine ? -16 : 0,
        };

        return (
            <TextField errorStyle={errorStyle} {...this.props} value={this.state.value} onChange={this._change} />
        );
    },

    _change(e) {
        this.setState({ value: e.target.value });
    },
});
