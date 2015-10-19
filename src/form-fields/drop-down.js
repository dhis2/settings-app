import React from 'react/addons';
import SelectField from 'material-ui/lib/select-field';

import MuiThemeMixin from '../mui-theme.mixin';

export default React.createClass({
    propTypes: {
        defaultValue: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number,
            React.PropTypes.bool,
        ]),
    },

    mixins: [MuiThemeMixin],

    getInitialState() {
        return {value: this.props.defaultValue ? this.props.defaultValue : 'null'};
    },

    render() {
        return (
            <SelectField
                value={this.state.value.toString()}
                {...this.props}/>
        );
    },
});
