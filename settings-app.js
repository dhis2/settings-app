import React from 'react';
import d2Init from 'd2';

var App = React.createClass({
    componentWillMount() {
        this.props.d2.system.settings.all()
            .then(settings => {
                this.setState({settings})
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
        )
    }
});

d2Init({baseUrl: 'https://apps.dhis2.org/demo/api'})
    .then(function (d2) {
        React.render(<App d2={d2} />, document.getElementById('app'));
    });