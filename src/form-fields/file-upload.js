import i18n from '@dhis2/d2-i18n'
import Checkbox from 'material-ui/Checkbox'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import LinearProgress from 'material-ui/LinearProgress'
import PropTypes from 'prop-types'
import React from 'react'
import AppTheme from '../theme'

class FileUpload extends React.Component {
    static propTypes = {
        isEnabled: PropTypes.bool.isRequired,
        label: PropTypes.string.isRequired,
        name: PropTypes.oneOf(['logo_front', 'logo_banner']).isRequired,
        value: PropTypes.bool.isRequired,

        onBlur: PropTypes.func,
        onChange: PropTypes.func,
        onFocus: PropTypes.func,
    }

    static defaultProps = {
        onFocus: undefined,
        onBlur: undefined,
        onChange: undefined,
    }

    constructor(props) {
        super(props)

        this.onClick = this.onClick.bind(this)
        this.onPreviewClick = this.onPreviewClick.bind(this)
        this.onToggle = this.onToggle.bind(this)
        this.onUpload = this.onUpload.bind(this)
    }

    state = {
        isEnabled: this.props.isEnabled,
        uploading: false,
        progress: undefined,
        showDialog: false,
    }

    onClick(e) {
        if (this.fileInput && !this.state.uploading) {
            this.fileInput.click(e)
        } else if (this.state.uploading) {
            this.xhr.abort()
            this.setState({ uploading: false, progress: undefined })
        }
    }

    onPreviewClick() {
        this.setState(state => ({ showDialog: !state.showDialog }))
    }

    onToggle(e) {
        this.props.onChange({ target: { value: e.target.checked } })
    }

    onUpload(e) {
        if (e.target.files.length === 0) {
            return
        }

        this.setState({
            uploading: true,
            progress: undefined,
        })

        const api = this.context.d2.Api.getApi()
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = progress => {
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
        data.append('file', e.target.files[0])

        api.post(['staticContent', this.props.name].join('/'), data)
            .then(() => {
                this.props.onChange({ target: { value: true } })
                this.setState({
                    uploading: false,
                    progress: undefined,
                    isEnabled: true,
                })
            })
            .catch(() => {
                this.props.onChange({ target: { value: false } })
                this.setState({
                    uploading: false,
                    progress: undefined,
                    isEnabled: false,
                })
            })
    }

    renderUploading() {
        const progressStyle = {
            position: 'absolute',
            left: 0,
            right: 0,
            zIndex: 1,
        }

        return (
            <div>
                <FlatButton
                    label={i18n.t('Cancel upload')}
                    onClick={this.onClick}
                />
                <div style={progressStyle}>
                    <LinearProgress
                        mode={
                            this.state.progress
                                ? 'determinate'
                                : 'indeterminate'
                        }
                        value={this.state.progress}
                    />
                </div>
            </div>
        )
    }

    renderUpload() {
        const bodyStyle = {
            backgroundColor: AppTheme.rawTheme.palette.primary1Color,
            textAlign: 'center',
            overflow: 'auto',
            padding: 48,
        }
        const dialogImgStyle = {
            maxWidth: '100%',
            maxHeight: '70vh',
        }

        const apiBase = this.context.d2.Api.getApi().baseUrl
        const imgUrl = `${[apiBase, 'staticContent', this.props.name].join(
            '/'
        )}?at=${new Date()}`

        if (this.state.isEnabled) {
            return (
                <div>
                    <FlatButton
                        label={i18n.t('Replace image')}
                        secondary
                        onClick={this.onClick}
                    />
                    <FlatButton
                        label={i18n.t('Preview image')}
                        onClick={this.onPreviewClick}
                    />
                    <Dialog
                        open={this.state.showDialog}
                        onRequestClose={this.onPreviewClick}
                        autoDetectWindowHeight
                        autoScrollBodyContent
                        bodyStyle={bodyStyle}
                    >
                        <img
                            style={dialogImgStyle}
                            src={imgUrl}
                            alt="preview"
                        />
                    </Dialog>
                </div>
            )
        }

        return (
            <FlatButton
                label={i18n.t('Upload image')}
                primary
                onClick={this.onClick}
            />
        )
    }

    render() {
        const { onFocus, onBlur, onChange, ...other } = this.props; // eslint-disable-line

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

        const setRef = ref => {
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
                    {this.state.uploading
                        ? this.renderUploading()
                        : this.renderUpload()}
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

export default FileUpload
