import i18n from '@dhis2/d2-i18n'
import { Button, Modal, ModalTitle, ModalContent } from '@dhis2/ui'
import { getInstance as getD2 } from 'd2'
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component.js'
import { isUrlArray, isRequired } from 'd2-ui/lib/forms/Validators.js'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import MultiToggle from '../form-fields/multi-toggle.js'
import TextField from '../form-fields/text-field.js'
import styles from './ClientForm.module.css'

const formFieldStyle = {
    width: '100%',
}

const validateClientID = async (v) => {
    const d2 = await getD2()
    const list = await d2.models.oAuth2Clients.list({
        paging: false,
        filter: [`clientId:eq:${v}`],
    })
    if (list.size > 0) {
        throw i18n.t('This client ID is already taken')
    }
}

const ClientForm = ({ clientModel, onUpdate, onSave, onCancel }) => {
    const [formErrors, setFormErrors] = useState({
        clientId: false,
        redirectUris: false
    });
    
    // Handle both string and array types for authorizationGrantTypes
    let authGrantTypesArray = [];
    
    if (clientModel && clientModel.authorizationGrantTypes) {
        // If it's a string (from backend), split it
        if (typeof clientModel.authorizationGrantTypes === 'string') {
            authGrantTypesArray = clientModel.authorizationGrantTypes
                .split(',')
                .map(type => type.trim())
                .filter(Boolean);
        } 
        // If it's already an array (from form update)
        else if (Array.isArray(clientModel.authorizationGrantTypes)) {
            authGrantTypesArray = clientModel.authorizationGrantTypes;
        }
    }
    
    const grantTypes = authGrantTypesArray.reduce(
        (curr, prev) => {
            curr[prev] = true
            return curr
        },
        {}
    )

    // Format redirectUris for display in the form
    let formattedRedirectUris = '';
    if (clientModel && clientModel.redirectUris) {
        if (Array.isArray(clientModel.redirectUris)) {
            // If it's an array, join with newlines for display
            formattedRedirectUris = clientModel.redirectUris.join('\n');
        } else if (typeof clientModel.redirectUris === 'string') {
            // If it's a comma-separated string, replace commas with newlines for display
            formattedRedirectUris = clientModel.redirectUris.split(',')
                .map(uri => uri.trim())
                .filter(Boolean)
                .join('\n');
        }
    }

    const handleSave = () => {
        // Check fields and show errors if needed
        const clientIdEmpty = !clientModel.clientId || clientModel.clientId.trim() === '';
        const redirectUrisEmpty = !formattedRedirectUris || formattedRedirectUris.trim() === '';
        
        setFormErrors({
            clientId: clientIdEmpty,
            redirectUris: redirectUrisEmpty
        });
        
        // Only save if both fields are valid
        if (!clientIdEmpty && !redirectUrisEmpty) {
            onSave();
        }
    };
    
    // Handle field updates and clear errors
    const handleFieldUpdate = (fieldName, value) => {
        // Clear the error for this field if it has a value
        if (value) {
            // Check if value is a string before using trim()
            const isValid = typeof value === 'string' 
                ? value.trim().length > 0 
                : Boolean(value);
                
            if (isValid) {
                setFormErrors(prev => ({
                    ...prev,
                    [fieldName]: false
                }));
            }
        }
        
        // Call the original onUpdate function
        onUpdate(fieldName, value);
    };

    const fields = [
        {
            name: 'clientId',
            value: clientModel.clientId,
            component: TextField,
            props: {
                floatingLabelText: i18n.t('Client ID'),
                style: formFieldStyle,
                changeEvent: 'onBlur',
                errorText: formErrors.clientId ? i18n.t('Required') : null,
            },
            validators: [
                {
                    validator: isRequired,
                    message: i18n.t('Required'),
                },
                {
                    validator: (v) => v.toString().trim().length > 0,
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
            name: 'authorizationGrantTypes',
            component: MultiToggle,
            style: formFieldStyle,
            props: {
                label: i18n.t('Grant Types'),
                items: [
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
            value: formattedRedirectUris,
            component: TextField,
            props: {
                hintText: i18n.t('One URL per line'),
                floatingLabelText: i18n.t('Redirect URIs'),
                multiLine: true,
                style: formFieldStyle,
                changeEvent: 'onBlur',
                errorText: formErrors.redirectUris ? i18n.t('This field should contain a list of URLs') : null,
            },
            validators: [
                {
                    validator: isRequired,
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
                <FormBuilder 
                    fields={fields} 
                    onUpdateField={handleFieldUpdate} 
                />
                <div style={{ marginTop: '1rem' }}>
                    <Button primary onClick={handleSave}>
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
