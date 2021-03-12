import i18n from '@dhis2/d2-i18n'
import { Button, Modal, ModalTitle, ModalContent } from '@dhis2/ui'
import { getInstance as getD2 } from 'd2'
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component'
import { isUrlArray, isRequired } from 'd2-ui/lib/forms/Validators'
import PropTypes from 'prop-types'
import React from 'react'
import MultiToggle from '../form-fields/multi-toggle'
import TextField from '../form-fields/text-field'
import AppTheme from '../theme'
import styles from './ClientForm.module.css'

const formFieldStyle = AppTheme.forms
formFieldStyle.width = '100%'

const validateClientID = async v => {
    const d2 = await getD2()
    const list = await d2.models.oAuth2Clients.list({
        paging: false,
        filter: [`cid:eq:${v}`],
    })
    if (list.size > 0) {
        throw i18n.t('This client ID is already taken')
    }
}

const ClientForm = ({ clientModel, onUpdate, onSave, onCancel }) => {
    const grantTypes = ((clientModel && clientModel.grantTypes) || []).reduce(
        (curr, prev) => {
            curr[prev] = true
            return curr
        },
        {}
    )

    const fields = [
        {
            name: 'name',
            value: clientModel.name,
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
            value: clientModel.cid,
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
            value: clientModel && clientModel.secret,
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
            value: (clientModel.redirectUris || []).join('\n'),
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
                    message: i18n.t('This field should contain a list of URLs'),
                },
            ],
        },
    ]

    const headerText =
        clientModel.id === undefined
            ? i18n.t('Create new OAuth2 Client')
            : i18n.t('Edit OAuth2 Client')
    return (
        <Modal onClose={onCancel}>
            <ModalTitle>{headerText}</ModalTitle>
            <ModalContent>
                <FormBuilder fields={fields} onUpdateField={onUpdate} />
                <div style={{ marginTop: '1rem' }}>
                    <Button primary onClick={onSave}>
                        {i18n.t('Save')}
                    </Button>
                    <Button
                        secondary
                        onClick={onCancel}
                        className={styles.cancelBtn}
                    >
                        {i18n.t('Cancel')}
                    </Button>
                </div>
            </ModalContent>
        </Modal>
    )
}

ClientForm.propTypes = {
    clientModel: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
}

export default ClientForm
