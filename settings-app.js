import React from 'react';
import d2Init from 'd2';

import settingsActions from './settingsActions';
import settingsStore from './settingsStore';

const App = React.createClass({
    propTypes: {
        store: React.PropTypes.Object.isRequired,
        d2: React.PropTypes.Object.isRequired,
    },

    componentWillMount() {
        this.props.store.subscribe(settings => {
            this.setState({settings});
        });
    },

    render() {
        return (
            <div>
                <h1>Settings</h1>
                <table>
                    {this.state && Object.keys(this.state.settings).map(settingsKey => {
                        return (
                            <tr>
                                <th>{settingsKey}</th>
                                <td>{this.state.settings[settingsKey]}</td>
                            </tr>
                        );
                    })}
                </table>
            </div>
        );
    },
});

d2Init({baseUrl: 'https://apps.dhis2.org/demo/api'})
    .then(d2 => {
        settingsActions.load.subscribe(() => {
            d2.system.settings.all()
                    .then(settings => {
                        settingsStore.setState(settings);
                    });
        });

        // Fire the load action
        settingsActions.load();

        React.render(<App d2={d2} store={settingsStore} />, document.getElementById('app'));
    });
