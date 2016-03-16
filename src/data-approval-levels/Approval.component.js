import React from 'react';

// Material UI components
import FlatButton from 'material-ui/lib/flat-button';

// D2 UI components
import Translate from 'd2-ui/lib/i18n/Translate.mixin';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

import DataApprovalWorkflow from './DataApprovalWorkflow.component';
import DataApprovalLevel from './DataApprovalLevel.component';

// TODO: Rewrite as ES6 class
/* eslint-disable react/prefer-es6-class */
export default React.createClass({
    mixins: [Translate],

    getInitialState() {
        return {
            showWorkflows: false,
            saving: false,
            componentDidMount: false,
        };
    },

    tabClick() {
        this.setState({ componentDidMount: false }, () => {
            setTimeout(() => {
                this.setState({ componentDidMount: true });
            }, 75);
        });
    },

    levelTabClick() {
        this.setState({ componentDidMount: false }, () => {
            setTimeout(() => {
                this.setState({ showWorkflows: false, componentDidMount: true });
            }, 75);
        });
    },

    workflowTabClick() {
        this.setState({ componentDidMount: false }, () => {
            setTimeout(() => {
                this.setState({ showWorkflows: true, componentDidMount: true });
            }, 75);
        });
    },

    formFieldUpdate(fieldName, newValue) {
        this.modelToEdit[fieldName] = newValue;
        this.forceUpdate();
    },

    render() {
        const styles = {
            loadingMask: {
                position: 'fixed',
                left: 256,
                top: '3rem',
                right: 0,
                bottom: 0,
                zIndex: 1000,
                backgroundColor: 'rgba(243,243,243,0.5)',
            },
            tabs: {
                marginTop: 32,
                marginBottom: -49,
            },
            tabButtonContainer: {
                display: 'inline-block',
                marginRight: 16,
            },
            tabButtonInactive: {
                border: '1px solid #F0F0F0',
                borderBottomColor: '#D0D0D0',
                color: '#A0A0A0',
            },
            tabButtonActive: {
                border: '1px solid #D0D0D0',
                borderBottomColor: 'white',
            },
            tabBody: {},
        };

        return (
            <div>
                {this.state.saving ? (
                    <div style={styles.loadingMask}><LoadingMask /></div>
                ) : undefined}
                <div style={styles.tabs}>
                    <div style={styles.tabButtonContainer}>
                        <FlatButton
                            secondary={!this.state.showWorkflows}
                            onClick={this.levelTabClick}
                            label={this.getTranslation('approval_levels')}
                            style={this.state.showWorkflows ? styles.tabButtonInactive : styles.tabButtonActive}
                        />
                    </div>
                    <div style={styles.tabButtonContainer}>
                        <FlatButton
                            secondary={!!this.state.showWorkflows}
                            onClick={this.workflowTabClick}
                            label={this.getTranslation('approval_workflows')}
                            style={this.state.showWorkflows ? styles.tabButtonActive : styles.tabButtonInactive}
                        />
                    </div>
                </div>
                <div style={styles.tabBody}>
                    {this.state.showWorkflows ? <DataApprovalWorkflow /> : <DataApprovalLevel />}
                </div>
            </div>
        );
    },
});
