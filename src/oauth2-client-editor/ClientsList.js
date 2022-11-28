import {
    CenteredContent,
    Table,
    TableBody,
    TableCell,
    TableCellHead,
    TableHead,
    TableRow,
    TableRowHead,
    Button,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import i18n from '../locales/index.js'
import styles from './ClientsList.module.css'

const ClientsList = ({ clients, onClientEdit, onClientDelete }) => {
    if (clients.length === 0) {
        return (
            <CenteredContent>
                <p>
                    {i18n.t('There are currently no OAuth2 clients registered')}
                </p>
            </CenteredContent>
        )
    }

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
                {clients.map((client) => (
                    <TableRow key={client.authorization_code}>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.password}</TableCell>
                        <TableCell>{client.refresh_token}</TableCell>
                        <TableCell>{client.authorization_code}</TableCell>
                        <TableCell>
                            <Button
                                small
                                primary
                                className={styles.editBtn}
                                onClick={() => onClientEdit(client)}
                            >
                                {i18n.t('Edit')}
                            </Button>
                            <Button
                                small
                                destructive
                                onClick={() => onClientDelete(client)}
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

ClientsList.propTypes = {
    clients: PropTypes.array.isRequired,
    onClientDelete: PropTypes.func.isRequired,
    onClientEdit: PropTypes.func.isRequired,
}

export default ClientsList
