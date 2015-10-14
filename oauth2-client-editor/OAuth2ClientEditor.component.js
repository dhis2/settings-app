import React from 'react';

// Material UI
// import TextField from 'material-ui/lib/text-field';

// D2 UI
import Translate from 'd2-ui/lib/i18n/Translate.mixin';
import DataTable from 'd2-ui/lib/data-table/DataTable.component';

import oa2ClientStore from './oauth2Client.store';
import oa2Actions from './oauth2Client.actions';


export default React.createClass({
    mixins: [Translate],

    getInitialState() {
        return {
            showForm: false,
        };
    },

    componentWillMount() {
        oa2ClientStore.subscribe(() => {
            if (this.isMounted()) {
                this.setState({isEmpty: oa2ClientStore.state.length === 0});
                this.forceUpdate();
            }
        });
        oa2Actions.load();
    },

    renderForm() {
        return (
            <div>
                <h3>{this.getTranslation('create_new_oauth2_client')}</h3>
                <div>Form!</div>
            </div>
        );
    },

    renderList() {
        const contextMenuActions = {
            delete: oa2Actions.delete,
            edit: oa2Actions.delete,
        };

        return (
            <DataTable
                rows={oa2ClientStore.state}
                columns={['name', 'password', 'refresh_token', 'authorization_code']}
                contextMenuActions={contextMenuActions} />
        );
    },

    render() {
        return (
            <div>
                {this.state.isEmpty ? <div><br/>No OAuth2 clients registered<br/><br/></div> : undefined}
                {this.state.showForm || this.state.isEmpty ? this.renderForm() : this.renderList()}
            </div>
        );
    },

    swap() {
        this.setState((pState) => {
            return {
                showForm: !pState.showForm,
            };
        });
    },
});
