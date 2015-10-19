import React from 'react/addons';
import TextField from 'material-ui/lib/text-field';

import MuiThemeMixin from '../mui-theme.mixin';

export default React.createClass({
    mixins: [MuiThemeMixin],

    render() {
        return (
            <TextField {...this.props}/>
        );
    },
});
