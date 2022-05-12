import { useConfig, useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    LinearLoader,
    CircularLoader,
    Modal,
    ModalTitle,
    ModalContent,
    CenteredContent,
} from '@dhis2/ui'
import { getInstance as getD2 } from 'd2'
import Checkbox from 'material-ui/Checkbox'
import PropTypes from 'prop-types'
import React from 'react'
import AppTheme from '../theme'
import styles from './FileUpload.module.css'

const Upload = ({ isEnabled, name, showDialog, onUpload, onPreview }) => {
    const dialogImgStyle = {
        maxWidth: '100%',
        maxHeight: '70vh',
        backgroundColor: 'var(--colors-grey700)',
        // Ensure image alt is visible against background if image fails to load
        color: 'white',
    }
    const { baseUrl, apiVersion } = useConfig()
    const imgUrl = `${[baseUrl, 'api', apiVersion, 'staticContent', name].join(
        '/'
    )}?at=${new Date()}`

    if (isEnabled) {
        return (
            <div>
                <Button
                    secondary
                    small
                    className={styles.replaceImageBtn}
                    onClick={onUpload}
                >
                    {i18n.t('Replace image')}
                </Button>
                <Button small onClick={onPreview}>
                    {i18n.t('Preview image')}
                </Button>
                {showDialog && (
                    <Modal onClose={onPreview}>
                        <ModalTitle>{i18n.t('Preview image')}</ModalTitle>
                        <ModalContent>
                            <CenteredContent>
                                <img
                                    style={dialogImgStyle}
                                    src={imgUrl}
                                    alt={i18n.t('Preview of image')}
                                />
                            </CenteredContent>
                        </ModalContent>
                    </Modal>
                )}
            </div>
        )
    }

    return (
        <Button primary small onClick={onUpload}>
            {i18n.t('Upload image')}
        </Button>
    )
}

Upload.propTypes = {
    isEnabled: PropTypes.bool.isRequired,
    name: PropTypes.oneOf(['logo_front', 'logo_banner']).isRequired,
    showDialog: PropTypes.bool.isRequired,
    onPreview: PropTypes.func.isRequired,
    onUpload: PropTypes.func.isRequired,
}

class FileUpload extends React.Component {
    static propTypes = {
        alert: PropTypes.object.isRequired,
        isEnabled: PropTypes.bool.isRequired,
        label: PropTypes.string.isRequired,
        name: PropTypes.oneOf(['logo_front', 'logo_banner']).isRequired,
        value: PropTypes.bool.isRequired,
        onBlur: PropTypes.func,
        onChange: PropTypes.func,
        onFocus: PropTypes.func,
    }

    state = {
        isEnabled: this.props.isEnabled,
        uploading: false,
        progress: undefined,
        showDialog: false,
    }

    onClick = (e) => {
        if (this.fileInput && !this.state.uploading) {
            this.fileInput.click(e)
        } else if (this.state.uploading) {
            this.xhr.abort()
            this.setState({ uploading: false, progress: undefined })
        }
    }

    onPreviewClick = () => {
        this.setState((state) => ({ showDialog: !state.showDialog }))
    }

    onToggle = (e) => {
        this.props.onChange({ target: { value: e.target.checked } })
    }

    onUpload = async (e) => {
        const { files } = e.target
        if (files.length === 0) {
            return
        }

        this.setState({
            uploading: true,
            progress: undefined,
        })

        const d2 = await getD2()
        const api = d2.Api.getApi()
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (progress) => {
            if (progress.lengthComputable) {
                this.setState({
                    progress: (progress.loaded / progress.total) * 100,
                })
            } else {
                this.setState({ progress: undefined })
            }
        }
        this.xhr = xhr

        const data = new FormData()
        data.append('file', files[0])

        try {
            await api.post(['staticContent', this.props.name].join('/'), data)
            this.props.onChange({ target: { value: true } })
            this.setState({
                uploading: false,
                progress: undefined,
                isEnabled: true,
            })
        } catch (error) {
            this.props.alert.show({
                message: i18n.t('Error uploading file: {{error}}', {
                    error: error.httpStatus || error.message,
                    nsSeparator: '-:-',
                }),
                critical: true,
            })
            this.props.onChange({ target: { value: false } })
            this.setState({
                uploading: false,
                progress: undefined,
            })
        }
    }

    renderUploading = () => {
        const progressStyle = {
            position: 'absolute',
            left: 0,
            right: 0,
            zIndex: 1,
        }

        return (
            <div>
                <Button onClick={this.onClick}>
                    {i18n.t('Cancel upload')}
                </Button>
                <div style={progressStyle}>
                    {this.state.progress ? (
                        <LinearLoader amount={this.state.progress} />
                    ) : (
                        <CircularLoader />
                    )}
                </div>
            </div>
        )
    }

    render() {
        const { onFocus, onBlur, onChange, ...other } = this.props // eslint-disable-line

        const containerStyle = {
            position: 'relative',
            display: 'block',
            whiteSpace: 'nowrap',
        }
        const checkStyle = {
            display: 'inline-block',
            whiteSpace: 'nowrap',
            paddingRight: 8,
            paddingTop: 8,
            paddingBottom: 8,
        }
        const btnStyle = {
            display: 'inline-block',
            position: 'absolute',
            top: 2,
        }

        const setRef = (ref) => {
            this.fileInput = ref
        }

        return (
            <div style={containerStyle}>
                <div style={checkStyle}>
                    <Checkbox
                        label={this.props.label}
                        onCheck={this.onToggle}
                        disabled={!this.state.isEnabled}
                        labelStyle={{
                            color: AppTheme.rawTheme.palette.textColor,
                        }}
                        checked={this.props.value}
                    />
                </div>
                <div style={btnStyle}>
                    {this.state.uploading ? (
                        this.renderUploading()
                    ) : (
                        <Upload
                            isEnabled={this.state.isEnabled}
                            name={this.props.name}
                            showDialog={this.state.showDialog}
                            onUpload={this.onClick}
                            onPreview={this.onPreviewClick}
                        />
                    )}
                    <input
                        type="file"
                        style={{ visibility: 'hidden', display: 'none' }}
                        ref={setRef}
                        onChange={this.onUpload}
                    />
                </div>
            </div>
        )
    }
}

const withAlerts = (Component) => {
    return function ComponentWithAlerts(props) {
        const alert = useAlert(
            ({ message }) => message,
            (options) => options
        )
        return <Component {...props} alert={alert} />
    }
}

export default withAlerts(FileUpload)
