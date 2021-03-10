import i18n from '@dhis2/d2-i18n'
import {
    Table,
    TableBody,
    TableCell,
    TableCellHead,
    TableHead,
    TableRow,
    TableRowHead,
    Button,
} from '@dhis2/ui'
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component'
import { isUrlArray, isRequired } from 'd2-ui/lib/forms/Validators'
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import FontIcon from 'material-ui/FontIcon'
import RaisedButton from 'material-ui/RaisedButton'
import React from 'react'
import MultiToggle from '../form-fields/multi-toggle'
import TextField from '../form-fields/text-field'
import settingsActions from '../settingsActions'
import AppTheme from '../theme'
import oa2Actions from './oauth2Client.actions'
import oa2ClientStore from './oauth2Client.store'

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
}

function generateSecret() {
    const alphabet = '0123456789abcdef'
    let uid = ''
    for (let i = 0; i < 32; i++) {
        uid += alphabet.charAt(Math.random() * alphabet.length)
        if (i === 8 || i === 12 || i === 16 || i === 20) {
            uid += '-'
        }
    }
    return uid
}

class OAuth2ClientEditor extends React.Component {
    constructor(props) {
        super(props)

        this.formUpdateAction = this.formUpdateAction.bind(this)
        this.editAction = this.editAction.bind(this)
        this.saveAction = this.saveAction.bind(this)
        this.deleteAction = this.deleteAction.bind(this)
        this.cancelAction = this.cancelAction.bind(this)
        this.newAction = this.newAction.bind(this)
    }

    state = {
        showForm: false,
        isEmpty: true,
        saving: false,
    }

    componentDidMount() {
        this.subscriptions = []
        this.subscriptions.push(
            oa2ClientStore.subscribe(() => {
                this.setState({ isEmpty: oa2ClientStore.state.length === 0 })
            })
        )

        this.subscriptions.push(
            oa2Actions.delete.subscribe(() => {
                this.setState({ saving: false })
            })
        )

        oa2Actions.load()
    }

    componentWillUnmount() {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe()
        })
    }

    cancelAction() {
        this.clientModel = undefined
        oa2Actions.load()
        this.setState({ showForm: false })
    }

    newAction() {
        this.clientModel = this.context.d2.models.oAuth2Client.create()
        this.clientModel.secret = generateSecret()
        this.setState({ showForm: true })
    }

    editAction(model) {
        this.clientModel = model
        this.setState({ showForm: true })
    }

    deleteAction(model) {
        this.setState({ showForm: false, saving: true })
        oa2Actions.delete(model.id ? model : this.clientModel)
        this.clientModel = undefined
    }

    saveAction() {
        this.clientModel.name = this.clientModel.name || ''
        this.clientModel.cid = this.clientModel.cid || ''
        this.setState({ saving: true })
        this.clientModel
            .save()
            .then(importReport => {
                if (importReport.status !== 'OK') {
                    throw new Error(importReport)
                }

                settingsActions.showSnackbarMessage(
                    i18n.t('OAuth2 client saved')
                )
                oa2Actions.load()
                this.setState({ showForm: false, saving: false })
            })
            .catch(() => {
                settingsActions.showSnackbarMessage(
                    i18n.t('Failed to save OAuth2 client')
                )
                this.setState({ saving: false })
            })
    }

    formUpdateAction(field, v) {
        let value = v
        if (field === 'redirectUris') {
            value = v.split('\n').filter(a => a.trim().length > 0)
        }
        this.clientModel[field] = value
        this.forceUpdate()
    }

    renderForm() {
        const d2 = this.context.d2
        const formFieldStyle = AppTheme.forms
        formFieldStyle.width = '100%'

        const grantTypes = (
            (this.clientModel && this.clientModel.grantTypes) ||
            []
        ).reduce((curr, prev) => {
            curr[prev] = true
            return curr
        }, {})

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
        }

        function validateClientID(v) {
            return new Promise((resolve, reject) => {
                d2.models.oAuth2Clients
                    .list({ paging: false, filter: [`cid:eq:${v}`] })
                    .then(list => {
                        if (list.size === 0) {
                            resolve()
                        } else {
                            reject(i18n.t('This client ID is already taken'))
                        }
                    })
            })
        }

        const fields = [
            {
                name: 'name',
                value: this.clientModel.name,
                component: TextField,
                props: {
                    floatingLabelText: i18n.t('Name'),
                    style: formFieldStyle,
                    changeEvent: 'onBlur',
                },
                validators: [
                    {
                        validator: isRequired,
                        message: i18n.t('Required'),
                    },
                ],
            },
            {
                name: 'cid',
                value: this.clientModel.cid,
                component: TextField,
                props: {
                    floatingLabelText: i18n.t('Client ID'),
                    style: formFieldStyle,
                    changeEvent: 'onBlur',
                },
                validators: [
                    {
                        validator: isRequired,
                        message: i18n.t('Required'),
                    },
                    {
                        validator: v => v.toString().trim().length > 0,
                        message: i18n.t('Required'),
                    },
                ],
                asyncValidators: [validateClientID],
            },
            {
                name: 'secret',
                value: this.clientModel && this.clientModel.secret,
                component: TextField,
                props: {
                    floatingLabelText: i18n.t('Client Secret'),
                    disabled: true,
                    style: formFieldStyle,
                },
            },
            {
                name: 'grantTypes',
                component: MultiToggle,
                style: formFieldStyle,
                props: {
                    label: i18n.t('Grant Types'),
                    items: [
                        {
                            name: 'password',
                            text: i18n.t('Password'),
                            value: grantTypes.password,
                        },
                        {
                            name: 'refresh_token',
                            text: i18n.t('Refresh token'),
                            value: grantTypes.refresh_token,
                        },
                        {
                            name: 'authorization_code',
                            text: i18n.t('Authorization code'),
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
                    hintText: i18n.t('One URL per line'),
                    floatingLabelText: i18n.t('Redirect URIs'),
                    multiLine: true,
                    style: formFieldStyle,
                    changeEvent: 'onBlur',
                },
                validators: [
                    {
                        validator: isUrlArray,
                        message: i18n.t(
                            'This field should contain a list of URLs'
                        ),
                    },
                ],
            },
        ]

        const headerText =
            this.clientModel.id === undefined
                ? i18n.t('Create new OAuth2 Client')
                : i18n.t('Edit OAuth2 Client')
        return (
            <Dialog
                open
                modal
                style={styles.dialog}
                contentStyle={styles.dialogContent}
                bodyStyle={styles.dialogBody}
            >
                <h2>{headerText}</h2>
                <FormBuilder
                    fields={fields}
                    onUpdateField={this.formUpdateAction}
                />
                <div style={{ marginTop: '1rem' }}>
                    <RaisedButton
                        onClick={this.saveAction}
                        primary
                        label={i18n.t('Save')}
                    />
                    {this.clientModel.id !== undefined ? (
                        <FlatButton
                            onClick={this.deleteAction}
                            primary
                            style={styles.button}
                            label={i18n.t('Delete')}
                        />
                    ) : undefined}
                    <FlatButton
                        onClick={this.cancelAction}
                        style={styles.buttonRight}
                        label={i18n.t('Cancel')}
                    />
                </div>
            </Dialog>
        )
    }

    renderList() {
        return (
            <Table>
                <TableHead>
                    <TableRowHead>
                        <TableCellHead>{i18n.t('Name')}</TableCellHead>
                        <TableCellHead>{i18n.t('Password')}</TableCellHead>
                        <TableCellHead>{i18n.t('Refresh token')}</TableCellHead>
                        <TableCellHead>
                            {i18n.t('Authorization code')}
                        </TableCellHead>
                        <TableCellHead>{/* Buttons column */}</TableCellHead>
                    </TableRowHead>
                </TableHead>
                <TableBody>
                    {oa2ClientStore.state.map(row => (
                        <TableRow key={row.authorization_code}>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.password}</TableCell>
                            <TableCell>{row.refresh_token}</TableCell>
                            <TableCell>{row.authorization_code}</TableCell>
                            <TableCell>
                                <Button small primary onClick={this.editAction}>
                                    {i18n.t('Edit')}
                                </Button>
                                <Button
                                    small
                                    destructive
                                    onClick={this.deleteAction}
                                >
                                    {i18n.t('Delete')}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )
    }

    render() {
        return (
            <div style={styles.wrapper}>
                <div style={styles.fab}>
                    <FloatingActionButton onClick={this.newAction}>
                        <FontIcon className="material-icons">add</FontIcon>
                    </FloatingActionButton>
                </div>
                {this.state.saving && (
                    <div style={styles.loadingMask}>
                        <LoadingMask />
                    </div>
                )}
                {this.state.isEmpty ? (
                    <div style={styles.empty}>
                        {i18n.t(
                            'There are currently no OAuth2 clients registered'
                        )}
                    </div>
                ) : (
                    this.renderList()
                )}
                {this.state.showForm && this.renderForm()}
            </div>
        )
    }
}

export default OAuth2ClientEditor
