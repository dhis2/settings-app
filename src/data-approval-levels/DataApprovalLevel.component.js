import React from 'react';

// Material UI components
import Dialog from 'material-ui/lib/dialog';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import FlatButton from 'material-ui/lib/flat-button';
import FontIcon from 'material-ui/lib/font-icon';
import RaisedButton from 'material-ui/lib/raised-button';

// D2 UI components
import DataTable from 'd2-ui/lib/data-table/DataTable.component';
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

import { isRequired } from 'd2-ui/lib/forms/Validators';

// Local dependencies
import dataApprovalLevelActions from './dataApprovalLevel.actions';

import SelectFieldAsyncSource from './SelectFieldAsyncSource.component';

class DataApprovalLevel extends React.Component { 
	constructor(props,context) {
		super(props, context);
		this.context = context;
		this.getTranslation = context.d2.i18n.getTranslation.bind(context.d2.i18n);
		this.modelToEdit = this.context.d2.models.dataApprovalLevel.create();
		this.state = {approvalLevels: [], showForm:false, saving:false, componentDidMount: false};
		this.renderApprovalLevelList = this.renderApprovalLevelList.bind(this);
		this.renderApprovalLevelForm = this.renderApprovalLevelForm.bind(this);
		this.addClick = this.addClick.bind(this);
		this.saveAction = this.saveAction.bind(this);
		this.resetAddFormAnddisplayList = this.resetAddFormAnddisplayList.bind(this);
		this.cancelAction = this.cancelAction.bind(this);
        this.formFieldUpdate = this.formFieldUpdate.bind(this);
	}
    componentDidMount() {
        this.setState({ approvalWorkflows: this.props.approvalWorkflows, approvalLevels: this.props.approvalLevels, showForm: false, saving: false });
        setTimeout(() => {
            this.setState({ componentDidMount: true });
        }, 0);
    }

    componentWillReceiveProps(newProps) {
        this.setState({ approvalLevels: newProps.approvalLevels, showForm: false, saving: false });
        setTimeout(() => {
            this.setState({ componentDidMount: true });
        }, 0);
    }

    saveAction() {
        this.setState({ saving: true });
        dataApprovalLevelActions
            .saveDataApprovalLevel(this.modelToEdit)
            .subscribe(
                () => {
                    this.resetAddFormAnddisplayList();
                },
                () => {
                    this.setState({ saving: false });
                }
            );
    }


    addClick() {
        this.setState({
            approvalLevelToAdd: this.context.d2.models.dataApprovalLevel.create(),
            showForm: true,
            saving: false,
        });
    }

    cancelAction() {
        this.resetAddFormAnddisplayList();
    }

    formFieldUpdate(fieldName, newValue) {
        this.modelToEdit[fieldName] = newValue;
        this.forceUpdate();
    }

    resetAddFormAnddisplayList() {
        this.modelToEdit = this.context.d2.models.dataApprovalLevel.create();
        this.setState({
            showForm: false,
        });
    }

    renderApprovalLevelForm() {
        const organisationUnitLevels = this.context.d2.models.organisationUnitLevel
            .list({ fields: 'id,displayName,level' })
            .then(list => list.toArray())
            .then(list => list.sort((left, right) => left.level - right.level))
            .then(list => list.map(listItem => {
                const text = `${listItem.level}: ${listItem.displayName}`;
                return { text, payload: listItem };
            }));

        const categoryOptionGroupSets = this.context.d2.models.categoryOptionGroupSet
            .list()
            .then(list => list.toArray())
            .then(listItems => listItems.map(listItem => {
                const text = listItem.displayName;
                const payload = listItem;
                return { text, payload };
            }));

        const fieldConfigs = [
            {
                name: 'organisationUnitLevel',
                component: SelectFieldAsyncSource,
                props: {
                    floatingLabelText: this.getTranslation('organisation_unit_level'),
                    menuItemsSource: () => organisationUnitLevels,
                    value: this.modelToEdit.organisationUnitLevel,
                    style: { width: '100%' },
                },
                value: this.modelToEdit.organisationUnitLevel,
            },
            {
                name: 'categoryOptionGroupSet',
                component: SelectFieldAsyncSource,
                props: {
                    floatingLabelText: this.getTranslation('category_option_group_set'),
                    menuItemsSource: () => categoryOptionGroupSets,
                    prependItems: [{ text: this.getTranslation('none'), payload: {} }],
                    value: this.modelToEdit.categoryOptionGroupSet,
                    style: { width: '100%' },
                },
                value: this.modelToEdit.categoryOptionGroupSet,
            },
        ];

        const styles = {
            dialog: {
                paddingLeft: 128,
            },
            body: {
                overflowY: 'auto',
            },
            content: {
                maxWidth: 400,
                minWidth: 400,
            },
        };

        return (
            <Dialog open style={styles.dialog} contentStyle={styles.content} bodyStyle={styles.body}>
                <h2>{this.getTranslation('create_new_approval_level')}</h2>
                <FormBuilder
                    source={this.modelToEdit}
                    fields={fieldConfigs}
                    onUpdateField={this.formFieldUpdate}> 
                </FormBuilder>
                <div style={{ marginTop: '2rem' }}></div>
                    <RaisedButton onClick={this.saveAction} primary label={this.getTranslation('save')} />
                    <FlatButton
                        onClick={this.cancelAction}
                        style={{ marginLeft: '1rem' }}
                        label={this.getTranslation('cancel')}/>
            </Dialog>
        );
    }

    renderApprovalLevelList() {
        const contextMenuActions = {
            delete: dataApprovalLevelActions.deleteDataApprovalLevel,
        };

        const styles = {
            wrapper: {
                position: 'relative',
                marginTop: 48,
            },
            fab: {
                position: 'absolute',
                right: 0,
                top: -28,
            },
            table: {
                border: '0px solid #d0d0d0',
                borderTopWidth: 1,
                boxShadow: 'none',
                marginTop: -24,
                marginBottom: 0,
            },
        };

        const className = `transition-mount transition-unmount
            ${(!!this.state.componentDidMount ? '' : ' transition-mount-active')}`;

        return (
            <div style={styles.wrapper}>
                <div style={styles.fab} className={`fab ${className}`}>
                    <FloatingActionButton onClick={this.addClick}>
                        <FontIcon className="material-icons">add</FontIcon>
                    </FloatingActionButton>
                </div>
                <DataTable
                    style={styles.table}
                    rows={this.state.approvalLevels}
                    columns={['name', 'categoryOptionGroupSet', 'level']}
                    contextMenuActions={contextMenuActions}
                />
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.state.showForm ? this.renderApprovalLevelForm() : undefined}
                {this.renderApprovalLevelList()}
            </div>
        );
    }
}

DataApprovalLevel.contextTypes = { d2: React.PropTypes.object.isRequired };

export default DataApprovalLevel;