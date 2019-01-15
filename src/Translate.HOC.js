import PropTypes from 'prop-types';
import getDisplayName from './lib/react/getDisplayName';

export default (component) => {
    const WrappedComponent = class extends component {
        static contextTypes = {
            ...(component.contextTypes || {}),
            d2: PropTypes.object.isRequired,
        };

        getTranslation(key) {
            return this.context.d2.i18n.getTranslation(key);
        }
    };
    WrappedComponent.displayName = `WithTranslation(${getDisplayName(component)})`;

    return WrappedComponent;
};
