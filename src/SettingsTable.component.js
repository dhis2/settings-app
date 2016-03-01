import React from 'react';

const SettingsTable = React.createClass({
    propTypes: {
        store: React.PropTypes.object.isRequired,
    },

    componentWillMount() {
        this.props.store.subscribe(settings => {
            this.setState({ settings });
        });
    },

    render() {
        return (
            <span>
                <h2>Other system settings...</h2>
                <ul>
                    {this.state && Object.keys(this.state.settings).map(settingsKey => {
                        return (
                            <li key={settingsKey}>
                                <b>{settingsKey}</b>&nbsp; = &nbsp;
                                <span className="settings">{this.state.settings[settingsKey] instanceof Object ? JSON.stringify(this.state.settings[settingsKey]) : this.state.settings[settingsKey]}</span>
                            </li>
                        );
                    })}
                </ul>
            </span>
        );
    },
});

export default SettingsTable;
