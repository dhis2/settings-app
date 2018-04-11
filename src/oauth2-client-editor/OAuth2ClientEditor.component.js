import React from 'react';
import i18next from 'i18next';
import log from 'loglevel';

// Material UI
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';

// D2 UI
import DataTable from 'd2-ui/lib/data-table/DataTable.component';
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';
import Translate from 'd2-ui/lib/i18n/Translate.mixin';
import { isUrlArray, isRequired } from 'd2-ui/lib/forms/Validators';

import TextField from '../form-fields/text-field';
import MultiToggle from '../form-fields/multi-toggle';
import oa2ClientStore from './oauth2Client.store';
import oa2Actions from './oauth2Client.actions';

import settingsActions from '../settingsActions';

import AppTheme from '../theme';

/* eslint-disable complexity */
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
/* eslint-enable complexity */


// TODO: Rewrite as ES6 class
/* eslint-disable react/prefer-es6-class */
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
        this.subscriptions = [];
        this.subscriptions.push(oa2ClientStore.subscribe(() => {
            this.setState({ isEmpty: oa2ClientStore.state.length === 0 });
        }));

        this.subscriptions.push(oa2Actions.delete.subscribe(() => {
            this.setState({ saving: false });
        }));

        setTimeout(() => {
            this.setState({ componentDidMount: true });
        }, 0);

        oa2Actions.load();
    },

    componentWillUnmount() {
        this.subscriptions.forEach((sub) => {
            sub.unsubscribe();
        });
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
        this.clientModel = model;
        this.setState({ showForm: true });
    },

    deleteAction(model) {
        this.setState({ showForm: false, saving: true });
        oa2Actions.delete(model.id ? model : this.clientModel);
        this.clientModel = undefined;
    },

    saveAction() {
        this.clientModel.name = this.clientModel.name || '';
        this.clientModel.cid = this.clientModel.cid || '';
        this.setState({ saving: true });
        this.clientModel.save()
            .then((importReport) => {
                if (importReport.status !== 'OK') {
                    throw new Error(importReport);
                }

                settingsActions.showSnackbarMessage(i18next.t('OAuth2 client saved'));
                oa2Actions.load();
                this.setState({ showForm: false, saving: false });
            })
            .catch((error) => {
                settingsActions.showSnackbarMessage(i18next.t('Failed to save OAuth2 client'));
                this.setState({ saving: false });

                const message = ((error.messages || error.response) && error.response.errorReports)
                    ? `\n - ${(error.messages || error.response.errorReports).map(e => e.message).join('\n - ')}`
                    : error.message || error;
                log.warn(`Error when saving OAuth2 client: ${message}`);
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

    renderForm() {
        const d2 = this.context.d2;
        const formFieldStyle = AppTheme.forms;
        formFieldStyle.width = '100%';

        const grantTypes = ((this.clientModel && this.clientModel.grantTypes) || []).reduce((curr, prev) => {
            curr[prev] = true; // eslint-disable-line no-param-reassign
            return curr;
        }, {});

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

        function validateClientID(v) {
            return new Promise((resolve, reject) => {
                d2.models.oAuth2Clients.list({ paging: false, filter: [`cid:eq:${v}`] })
                    .then((list) => {
                        if (list.size === 0) {
                            resolve();
                        } else {
                            reject(i18next.t('This client ID is already taken'));
                        }
                    });
            });
        }

        const fields = [
            {
                name: 'name',
                value: this.clientModel.name,
                component: TextField,
                props: {
                    floatingLabelText: i18next.t('Name'),
                    style: formFieldStyle,
                    changeEvent: 'onBlur',
                },
                validators: [
                    {
                        validator: isRequired,
                        message: i18next.t(isRequired.message),
                    },
                ],
            },
            {
                name: 'cid',
                value: this.clientModel.cid,
                component: TextField,
                props: {
                    floatingLabelText: i18next.t('Client ID'),
                    style: formFieldStyle,
                    changeEvent: 'onBlur',
                },
                validators: [
                    {
                        validator: isRequired,
                        message: i18next.t(isRequired.message),
                    }, {
                        validator: v => v.toString().trim().length > 0,
                        message: i18next.t(isRequired.message),
                    },
                ],
                asyncValidators: [
                    validateClientID,
                ],
            },
            {
                name: 'secret',
                value: this.clientModel && this.clientModel.secret,
                component: TextField,
                props: {
                    floatingLabelText: i18next.t('Client Secret'),
                    disabled: true,
                    style: formFieldStyle,
                },
            },
            {
                name: 'grantTypes',
                component: MultiToggle,
                style: formFieldStyle,
                props: {
                    label: i18next.t('Grant Types'),
                    items: [
                        {
                            name: 'password',
                            text: i18next.t('Password'),
                            value: grantTypes.password,
                        }, {
                            name: 'refresh_token',
                            text: i18next.t('Refresh token'),
                            value: grantTypes.refresh_token,
                        }, {
                            name: 'authorization_code',
                            text: i18next.t('Authorization code'),
                            value: grantTypes.authorization_code,
                        },
                    ],
                },
            },
            {
                name: 'redirectUris',
                value: (this.clientModel.redirectUris || []).join('\n'),
                component: TextField,
                props: {
                    hintText: i18next.t('One URL per line'),
                    floatingLabelText: i18next.t('Redirect URIs'),
                    multiLine: true,
                    style: formFieldStyle,
                    changeEvent: 'onBlur',
                },
                validators: [
                    {
                        validator: isUrlArray,
                        message: i18next.t(isUrlArray.message),
                    },
                ],
            },
        ];

        const headerText = this.clientModel.id === undefined ?
            i18next.t('Create new OAuth2 Client') :
            i18next.t('Edit OAuth2 Client');
        return (
            <Dialog open modal style={styles.dialog} contentStyle={styles.dialogContent} bodyStyle={styles.dialogBody}>
                <h2>{headerText}</h2>
                <FormBuilder fields={fields} onUpdateField={this.formUpdateAction} />
                <div style={{ marginTop: '1rem' }}>
                    <RaisedButton onClick={this.saveAction} primary label={i18next.t('Save')} />
                    {this.clientModel.id !== undefined ?
                        (<FlatButton
                            onClick={this.deleteAction}
                            primary
                            style={styles.button}
                            label={i18next.t('Delete')}
                        />) : undefined
                    }
                    <FlatButton
                        onClick={this.cancelAction}
                        style={styles.buttonRight}
                        label={i18next.t('Cancel')}
                    />
                </div>
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
                borderBottom: `1px solid ${AppTheme.rawTheme.palette.borderColor}`,
                boxShadow: '3px 3px rgba(0,0,0,0.3)',
            },
        };

        const actions = {
            edit: this.editAction,
            delete: this.deleteAction,
        };

        return (
            <DataTable
                style={styles.table}
                headerStyle={styles.tableHeader}
                rows={oa2ClientStore.state}
                columns={['name', 'password', 'refresh_token', 'authorization_code']}
                contextMenuActions={actions}
                primaryAction={this.editAction}
            />
        );
    },

    /* eslint-disable complexity */
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

        const className = `transition-mount transition-unmount
            ${this.state.componentDidMount ? '' : ' transition-mount-active'}
            ${this.props.transitionUnmount ? ' transition-unmount-active' : ''}`;

        const saving = this.state.saving ? <div style={styles.loadingMask}><LoadingMask /></div> : undefined;
        const body = this.state.isEmpty ?
            <div style={styles.empty}>{i18next.t('There are currently no OAuth2 clients registered')}</div> :
            this.renderList();
        const form = this.state.showForm ? this.renderForm() : undefined;

        return (
            <div style={styles.wrapper}>
                <div style={styles.fab} className={`fab ${className}`}>
                    <FloatingActionButton onClick={this.newAction}>
                        <FontIcon className="material-icons">add</FontIcon>
                    </FloatingActionButton>
                </div>
                {saving}{body}{form}
            </div>
        );
    },
});
