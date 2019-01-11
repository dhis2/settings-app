import React from 'react';
import PropTypes from 'prop-types';

import AppTheme from './theme';

export default {
    childContextTypes: {
        muiTheme: PropTypes.object,
    },

    getChildContext() {
        return {
            muiTheme: AppTheme,
        };
    },
};
