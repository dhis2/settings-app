import React from 'react/addons';

import AppTheme from './theme';

export default {
    childContextTypes: {
        muiTheme: React.PropTypes.object,
    },

    getChildContext() {
        return {
            muiTheme: AppTheme,
        };
    },
};
