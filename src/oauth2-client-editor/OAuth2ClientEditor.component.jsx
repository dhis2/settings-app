import i18n from '@dhis2/d2-i18n'
import { CircularLoader, CenteredContent, Button } from '@dhis2/ui'
import { getInstance as getD2 } from 'd2'
import React, { Component } from 'react'
import settingsActions from '../settingsActions.js'
import ClientForm from './ClientForm.jsx'
import ClientsList from './ClientsList.jsx'
import oa2Actions from './oauth2Client.actions.js'
import oa2ClientStore from './oauth2Client.store.js'
import styles from './OAuth2ClientEditor.module.css'

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

class OAuth2ClientEditor extends Component {
    state = {
        showForm: false,
        saving: false,
    }

    componentDidMount() {
        this.subscriptions = []
        this.subscriptions.push(
            oa2ClientStore.subscribe(() => {
                this.forceUpdate()
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
        this.subscriptions.forEach((sub) => {
            sub.unsubscribe()
        })
    }

    cancelAction = () => {
        this.clientModel = undefined
        oa2Actions.load()
        this.setState({ showForm: false })
    }

    newAction = () => {
        getD2().then((d2) => {
            this.clientModel = d2.models.oAuth2Client.create()
            this.clientModel.secret = generateSecret()
            this.setState({ showForm: true })
        })
    }

    editAction = (model) => {
        this.clientModel = model
        this.setState({ showForm: true })
    }

    deleteAction = (model) => {
        this.setState({ showForm: false, saving: true })
        oa2Actions.delete(model.id ? model : this.clientModel)
        this.clientModel = undefined
    }

    saveAction = () => {
        // Validation is now handled in the ClientForm component

        this.clientModel.name = this.clientModel.name || ''
        this.clientModel.cid = this.clientModel.cid || ''

        // Ensure authorizationGrantTypes is a comma-separated string
        if (
            this.clientModel.authorizationGrantTypes &&
            Array.isArray(this.clientModel.authorizationGrantTypes)
        ) {
            this.clientModel.authorizationGrantTypes =
                this.clientModel.authorizationGrantTypes.join(',')
        }

        // First ensure redirectUris is an array
        if (
            this.clientModel.redirectUris &&
            typeof this.clientModel.redirectUris === 'string'
        ) {
            this.clientModel.redirectUris = this.clientModel.redirectUris
                .split('\n')
                .map((uri) => uri.trim())
                .filter(Boolean)
        } else if (!this.clientModel.redirectUris) {
            this.clientModel.redirectUris = []
        }

        // Then convert the array to a comma-separated string
        if (Array.isArray(this.clientModel.redirectUris)) {
            this.clientModel.redirectUris =
                this.clientModel.redirectUris.join(',')
        }

        this.setState({ saving: true })
        this.clientModel
            .save()
            .then((importReport) => {
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

    formUpdateAction = (field, v) => {
        let value = v
        if (field === 'redirectUris') {
            if (typeof v === 'string') {
                // Convert newline-separated string to array, then to comma-separated string
                const uriArray = v
                    .split('\n')
                    .map((uri) => uri.trim())
                    .filter(Boolean)
                value = uriArray.join(',')
            } else if (Array.isArray(v)) {
                // If it's already an array, convert to comma-separated string
                value = v.join(',')
            } else {
                // Default to empty string
                value = ''
            }
        }
        if (field === 'authorizationGrantTypes' && Array.isArray(v)) {
            value = v.join(',')
        }
        this.clientModel[field] = value
        this.forceUpdate()
    }

    render() {
        const clients = oa2ClientStore.state
        if (!clients || this.state.saving) {
            return (
                <CenteredContent>
                    <CircularLoader />
                </CenteredContent>
            )
        }

        return (
            <div className={styles.wrapper}>
                <ClientsList
                    clients={clients}
                    onClientEdit={this.editAction}
                    onClientDelete={this.deleteAction}
                />
                <Button
                    primary
                    className={styles.addClientBtn}
                    onClick={this.newAction}
                >
                    {i18n.t('Add OAuth2 client')}
                </Button>
                {this.state.showForm && (
                    <ClientForm
                        clientModel={this.clientModel}
                        onUpdate={this.formUpdateAction}
                        onSave={this.saveAction}
                        onCancel={this.cancelAction}
                    />
                )}
            </div>
        )
    }
}

export default OAuth2ClientEditor
