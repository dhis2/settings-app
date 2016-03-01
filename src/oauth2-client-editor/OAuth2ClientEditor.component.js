import React from 'react';
import log from 'loglevel';

// Material UI
import FlatButton from 'material-ui/lib/flat-button';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import FontIcon from 'material-ui/lib/font-icon';
import RaisedButton from 'material-ui/lib/raised-button';
import TextField from '../form-fields/text-field';
import Dialog from 'material-ui/lib/dialog';

// D2 UI
import DataTable from 'd2-ui/lib/data-table/DataTable.component';
import Form from 'd2-ui/lib/forms/Form.component';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';
import Translate from 'd2-ui/lib/i18n/Translate.mixin';
import { isRequired, isUrlArray } from 'd2-ui/lib/forms/Validators';

import MultiToggle from '../form-fields/multi-toggle';
import oa2ClientStore from './oauth2Client.store';
import oa2Actions from './oauth2Client.actions';

import settingsActions from '../settingsActions';

import AppTheme from '../theme';

function generateSecret() {
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

function urlArrayValidator(v) {
    return v === undefined || isUrlArray(Array.isArray(v) ? v.join('\n') : v);
}
urlArrayValidator.message = isUrlArray.message;

function isUndefinedOrRequired(v) {
    return v === undefined || isRequired(v.trim());
}

export default React.createClass({
    propTypes: {
        transitionUnmount: React.PropTypes.bool,
    },

    mixins: [Translate],

    getInitialState() {
        return {
            componentDidMount: false,
            showForm: false,
        };
    },

    componentDidMount() {
        this.disposables = [];
        this.disposables.push(oa2ClientStore.subscribe(() => {
            this.setState({ isEmpty: oa2ClientStore.state.length === 0 });
        }));

        this.disposables.push(oa2Actions.delete.subscribe(() => {
            this.setState({ saving: false });
        }));

        setTimeout(() => {
            this.setState({ componentDidMount: true });
        }, 0);

        oa2Actions.load();
    },

    componentWillUnmount() {
        this.disposables.forEach(d => {
            d.dispose();
        });
    },

    renderForm() {
        const formFieldStyle = AppTheme.forms;
        formFieldStyle.width = '100%';

        const grantTypes = (this.clientModel && this.clientModel.grantTypes || []).reduce((curr, prev) => {
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
                    value: this.clientModel.name,
                },
                validators: [isUndefinedOrRequired],
            },
            {
                name: 'cid',
                type: TextField,
                updateEvent: 'onBlur',
                fieldOptions: {
                    floatingLabelText: this.getTranslation('client_id'),
                    style: formFieldStyle,
                    value: this.clientModel.cid,
                },
                validators: [isUndefinedOrRequired],
            },
            {
                name: 'secret',
                type: TextField,
                fieldOptions: {
                    floatingLabelText: this.getTranslation('client_secret'),
                    disabled: true,
                    style: formFieldStyle,
                    value: this.clientModel && this.clientModel.secret,
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
                    helpText: this.getTranslation('one_url_per_line'),
                    dynamicHelpText: true,
                    floatingLabelText: this.getTranslation('redirect_uris'),
                    multiLine: true,
                    style: formFieldStyle,
                    value: (this.clientModel.redirectUris || []).join('\n'),
                },
                validators: [urlArrayValidator],
            },
        ];

        const styles = {
            dialog: {
                paddingLeft: 128,
            },
            dialogContent: {
                maxWidth: 400,
                minWidth: 400,
            },
            dialogBody: {
                overflowY: 'auto',
            },
            button: {
                marginLeft: 16,
            },
            buttonRight: {
                float: 'right',
            },
        };

        return (
            <Dialog open style={styles.dialog} contentStyle={styles.dialogContent} bodyStyle={styles.dialogBody}>
                <h2>{this.clientModel.id === undefined ? this.getTranslation('create_new_oauth2_client') : this.getTranslation('edit_oauth2_client')}</h2>
                <Form source={this.clientModel} fieldConfigs={fieldConfigs} onFormFieldUpdate={this.formUpdateAction}>
                    <div style={{ marginTop: '1rem' }}></div>
                    <RaisedButton onClick={this.saveAction} primary label={this.getTranslation('save')} />
                    {this.clientModel.id !== undefined ?
                        (<FlatButton onClick={this.deleteAction} primary style={styles.button} label={this.getTranslation('delete')} />) :
                        undefined
                    }
                    <FlatButton onClick={this.cancelAction} style={styles.buttonRight} label={this.getTranslation('cancel')} />
                </Form>
            </Dialog>
        );
    },

    renderList() {
        const styles = {
            table: {
                border: 'none',
                boxShadow: 'none',
                margin: 0,
            },
            tableHeader: {
                borderBottom: '1px solid ' + AppTheme.rawTheme.palette.borderColor,
                boxShadow: '3px 3px rgba(0,0,0,0.3)',
            },
        };

        return (
                <DataTable
                    style={styles.table}
                    headerStyle={styles.tableHeader}
                    rows={oa2ClientStore.state}
                    columns={['name', 'password', 'refresh_token', 'authorization_code']}
                    primaryAction={this.editAction} />
        );
    },

    render() {
        const styles = {
            wrapper: {
                position: 'relative',
                marginTop: 24,
            },
            fab: {
                position: 'absolute',
                top: -28,
                right: 0,
            },
            loadingMask: {
                position: 'fixed',
                left: 256,
                top: '3rem',
                right: 0,
                bottom: 0,
                zIndex: 1000,
                backgroundColor: 'rgba(243,243,243,0.4)',
            },
            empty: {
                padding: '24px 0',
            },
        };

        const className = 'transition-mount transition-unmount' +
            (!!this.state.componentDidMount ? '' : ' transition-mount-active') +
            (!!this.props.transitionUnmount ? ' transition-unmount-active' : '');

        return (
            <div style={styles.wrapper}>
                <div style={styles.fab} className={'fab ' + className}>
                    <FloatingActionButton onClick={this.newAction}>
                        <FontIcon className="material-icons">add</FontIcon>
                    </FloatingActionButton>
                </div>
                {this.state.saving ? <div style={styles.loadingMask}><LoadingMask /></div> : undefined}
                {this.state.isEmpty ? <div style={styles.empty}>{this.getTranslation('no_oauth2_clients_registered')}</div> : this.renderList()}
                {this.state.showForm ? this.renderForm() : undefined}
            </div>
        );
    },

    componentWillUnMount() {
        this.oa2cStoreDisposable && this.oa2cStoreDisposable.dispose();
    },

    cancelAction() {
        this.clientModel = undefined;
        oa2Actions.load();
        this.setState({ showForm: false });
    },

    newAction() {
        this.clientModel = this.context.d2.models.oAuth2Client.create();
        this.clientModel.secret = generateSecret();
        this.setState({ showForm: true });
    },

    editAction(model) {
        log.info('Edit OAuth2 client:', model.name);
        this.clientModel = Object.assign(this.context.d2.models.oAuth2Client.create(), model);
        this.setState({ showForm: true });
    },

    deleteAction(model) {
        this.setState({ showForm: false, saving: true });
        oa2Actions.delete(!!model.id ? model : this.clientModel);
        this.clientModel = undefined;
    },

    saveAction() {
        this.clientModel.name = this.clientModel.name || '';
        this.clientModel.cid = this.clientModel.cid || '';
        this.setState({ saving: true });
        this.clientModel.save()
            .then(importReport => {
                if (!importReport.response || !importReport.response.importCount.imported === 1 && !importReport.response.importCount.updated === 1) {
                    const messages = importReport.response.importConflicts.map(conflict => conflict.value).join('\n');
                    throw new Error(messages);
                }

                settingsActions.showSnackbarMessage(this.getTranslation('oauth2_client_saved'));
                oa2Actions.load();
                this.setState({ showForm: false, saving: false });
            })
            .catch((err) => {
                settingsActions.showSnackbarMessage(this.getTranslation('failed_to_save_oauth2_client'));
                this.setState({ saving: false });
                log.warn('Failed to save OAuth2 client:', err.message ? err.message : err);
            });
    },

    formUpdateAction(field, v) {
        let value = v;
        if (field === 'redirectUris') {
            value = v.split('\n').filter(a => a.trim().length > 0);
        }
        this.clientModel[field] = value;
        this.forceUpdate();
    },
});
