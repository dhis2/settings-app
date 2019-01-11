import React from 'react';
import PropTypes from 'prop-types';
import AppTheme from './theme';

export default component => {
    return class extends component {
        static childContextTypes = {
            ...(component.childContextTypes || {}),
            muiTheme: PropTypes.object,
        }

        getChildContext() {
            return {
                muiTheme: AppTheme,
            };
        }
    }
}
