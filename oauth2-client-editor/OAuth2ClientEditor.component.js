import React from 'react';
import log from 'loglevel';

// Material UI
import FlatButton from 'material-ui/lib/flat-button';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import FontIcon from 'material-ui/lib/font-icon';
import Paper from 'material-ui/lib/paper';
import RaisedButton from 'material-ui/lib/raised-button';
import TextField from 'material-ui/lib/text-field';

// D2 UI
import DataTable from 'd2-ui/lib/data-table/DataTable.component';
import Form from 'd2-ui/lib/forms/Form.component';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';
import Translate from 'd2-ui/lib/i18n/Translate.mixin';
// TODO: This should move into D2 UI
import MultiToggle from './MultiToggle.component';

import oa2ClientStore from './oauth2Client.store';
import oa2Actions from './oauth2Client.actions';

import AppTheme from '../theme';

log.setLevel(log.levels.TRACE);

function generateUid() {
    const alphabet = '0123456789abcdef';
    let uid = '';
    for (let i = 0; i < 32; i++) {
        uid += alphabet.charAt(Math.random() * alphabet.length);
        if (i === 8 || i === 12 || i === 16 || i === 20) {
            uid += '-';
        }
    }
    return uid;
}


export default React.createClass({
    mixins: [Translate],

    getInitialState() {
        return {showForm: false};
    },

    componentWillMount() {
        this.oa2cStoreDisposable = oa2ClientStore.subscribe(() => {
            if (this.isMounted()) {
                this.setState({isEmpty: oa2ClientStore.state.length === 0});
            }
        });
        oa2Actions.load();
    },

    renderForm() {
        const formFieldStyle = AppTheme.forms;
        if (!this.clientModel) {
            this.clientModel = this.context.d2.models.oAuth2Client.create();
        }
        const clientModel = this.clientModel;
        const grantTypes = (clientModel.grantTypes || []).reduce((curr, prev) => {
            curr[prev] = true;
            return curr;
        }, {});

        const fieldConfigs = [
            {
                name: 'name',
                type: TextField,
                updateEvent: 'onBlur',
                fieldOptions: {
                    floatingLabelText: this.getTranslation('name'),
                    style: formFieldStyle,
                },
            },
            {
                name: 'cid',
                type: TextField,
                updateEvent: 'onBlur',
                fieldOptions: {
                    floatingLabelText: this.getTranslation('client_id'),
                    style: formFieldStyle,
                },
            },
            {
                name: 'secret',
                type: TextField,
                fieldOptions: {
                    floatingLabelText: this.getTranslation('client_secret'),
                    disabled: true,
                    style: formFieldStyle,
                    value: clientModel.secret || generateUid(),
                },
            },
            {
                name: 'grantTypes',
                type: MultiToggle,
                style: formFieldStyle,
                fieldOptions: {
                    label: this.getTranslation('grant_types'),
                    items: [
                        { name: 'password', text: this.getTranslation('password'), value: grantTypes.password },
                        { name: 'refresh_token', text: this.getTranslation('refresh_token'), value: grantTypes.refresh_token },
                        { name: 'authorization_code', text: this.getTranslation('authorization_code'), value: grantTypes.authorization_code },
                    ],
                },
            },
            {
                name: 'redirectUris',
                type: TextField,
                updateEvent: 'onBlur',
                fieldOptions: {
                    hintText: this.getTranslation('enter_one_uri_per_line'),
                    floatingLabelText: this.getTranslation('redirect_uris'),
                    multiLine: true,
                    style: formFieldStyle,
                    defaultValue: (clientModel.redirectUris || []).join('\n'),
                },
            },
        ];

        const formPaperStyle = {
            padding: '2rem',
            marginTop: '2rem',
            marginRight: '2rem',
            overflow: 'hidden',
        };

        return (
            <Paper style={formPaperStyle}>
                <h2>{this.clientModel.id === undefined ? this.getTranslation('create_new_oauth2_client') : this.getTranslation('edit_oauth2_client')}</h2>
                <Form source={this.clientModel} fieldConfigs={fieldConfigs} onFormFieldUpdate={this.formUpdateAction}>
                    <div style={{marginTop: '1rem'}}>
                        <RaisedButton onClick={this.saveAction} primary label={this.getTranslation('save')} />
                        {this.state.isEmpty ? undefined : <FlatButton onClick={this.cancelAction} style={{marginLeft: '1rem'}} label={this.getTranslation('cancel')} />}
                    </div>
                </Form>
            </Paper>
        );
    },

    renderList() {
        const contextMenuActions = {
            edit: this.editAction,
            delete: this.deleteAction,
        };

        const cssStyles = {
            textAlign: 'right',
            marginTop: '1rem',
            marginRight: 16,
        };

        return (
            <div style={{maxWidth: 960, marginRight: 16}}>
                <div style={cssStyles}>
                    <FloatingActionButton onClick={this.newAction}>
                        <FontIcon className="material-icons">add</FontIcon>
                    </FloatingActionButton>
                </div>
                <div style={{marginTop: -24}}>
                    <DataTable
                        rows={oa2ClientStore.state}
                        columns={['name', 'password', 'refresh_token', 'authorization_code']}
                        contextMenuActions={contextMenuActions}
                        primaryAction={contextMenuActions.edit}
                        />
                </div>
            </div>
        );
    },

    render() {
        const theme = AppTheme.rawTheme;
        return (
            <div>
                <div style={{position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: 1000, backgroundColor: 'rgba(255,255,255,0.4)', display: this.state.saving ? 'block' : 'none'}}>
                    <LoadingMask />
                </div>
                {this.state.isEmpty ? <div style={{color: theme.palette.accent1Color}}>{this.getTranslation('no_oauth2_clients_registered')}</div> : undefined}
                {this.state.showForm || this.state.isEmpty ? this.renderForm() : this.renderList()}
            </div>
        );
    },

    componentWillUnMount() {
        this.oa2cStoreDisposable && this.oa2cStoreDisposable.dispose();
    },

    cancelAction() {
        Object.assign(this.clientModel, this.clientModelBackup);
        oa2Actions.load();
        this.setState({showForm: false});
    },

    newAction() {
        this.clientModel = this.context.d2.models.oAuth2Client.create();
        this.setState({showForm: true});
    },

    editAction(model) {
        log.info('Edit OAuth2 client:', model.name);
        this.clientModelBackup = Object.assign({}, model);
        this.clientModel = model;
        this.setState({showForm: true});
    },

    deleteAction(model) {
        oa2Actions.delete(model);
    },

    saveAction() {
        this.setState({saving: true});
        this.clientModel.redirectUris = (this.clientModel.redirectUris + '')
            .split('\n')
            .filter(url => {
                return url.length > 0 && url.match(/https?:\/\/.{2,}\..{2,}/);
            });
        this.clientModel.secret = generateUid();
        this.clientModel.save()
            .then(() => {
                window.snackbar.show();
                this.setState({showForm: false, saving: false});
                oa2Actions.load();
            })
            .catch((err) => {
                this.setState({saving: false});
                log.warn('Failed to save OAuth2 client:' + err.response.validationViolations.reduce((str, msg) => {
                    return (str.length ? str + '\n' : '') + msg.property + ': ' + msg.message;
                }, ''));
            });
    },

    formUpdateAction(field, value) {
        this.clientModel[field] = value;
    },
});
