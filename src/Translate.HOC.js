import React from 'react';
import PropTypes from 'prop-types';

export default component => {
    return class extends component {
        static contextTypes = {
            ...(component.contextTypes || {}),
            d2: PropTypes.object.isRequired
        }

        getTranslation(key) {
            return this.context.d2.i18n.getTranslation(key);
        }
    }
};
