import React from 'react';

// Material UI components
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import FlatButton from 'material-ui/lib/flat-button';
import FontIcon from 'material-ui/lib/font-icon';
import Paper from 'material-ui/lib/paper';
import RaisedButton from 'material-ui/lib/raised-button';

// D2 UI components
import DataTable from 'd2-ui/lib/data-table/DataTable.component';
import Form from 'd2-ui/lib/forms/Form.component';
import Translate from 'd2-ui/lib/i18n/Translate.mixin';

// Local dependencies
import dataApprovalLevelStore from './dataApprovalLevel.store';
import dataApprovalLevelActions from './dataApprovalLevel.actions';
import SelectFieldAsyncSource from './SelectFieldAsyncSource.component';
import log from 'loglevel';


export default React.createClass({
    propTypes: {
        columns: React.PropTypes.array.isRequired,
    },

    mixins: [Translate],

    componentWillMount() {
        dataApprovalLevelActions.loadDataApprovalLevels();
    },

    componentDidMount() {
        dataApprovalLevelStore
            .subscribe(approvalLevels => {
                this.setState({approvalLevels, showAddForm: false});
            });
    },

    getInitialState() {
        this.modelToEdit = this.context.d2.models.dataApprovalLevel.create();
        return {
            approvalLevels: [],
            showAddForm: false,
        };
    },

    renderForm() {
        const d2 = this.context.d2;
        const organisationUnitLevels = d2.models.organisationUnitLevel
            .list()
            .then(list => list.toArray())
            .then(list => list.sort((left, right) => left.level - right.level))
            .then(list => list.map(listItem => {
                return {
                    text: `${listItem.level}: ${listItem.displayName}`,
                    payload: listItem,
                };
            }));

        const categoryOptionGroupSets = d2.models.categoryOptionGroupSet
            .list()
            .then(list => list.toArray())
            .then(listItems => {
                return listItems
                    .map(listItem => {
                        return {
                            text: listItem.displayName,
                            payload: listItem,
                        };
                    });
            });

        const fieldConfigs = [
            {
                name: 'organisationUnitLevel',
                type: SelectFieldAsyncSource,
                fieldOptions: {
                    floatingLabelText: this.getTranslation('organisation_unit_level'),
                    menuItemsSource: () => organisationUnitLevels,
                    value: this.modelToEdit.organisationUnitLevel,
                },
            },
            {
                name: 'categoryOptionGroupSet',
                type: SelectFieldAsyncSource,
                fieldOptions: {
                    floatingLabelText: this.getTranslation('category_option_group_set'),
                    menuItemsSource: () => categoryOptionGroupSets,
                    value: this.modelToEdit.categoryOptionGroupSet,
                },
            },
        ];

        const formPaperStyle = {
            padding: '2rem',
            marginTop: '2rem',
            marginRight: '2rem',
        };

        return (
            <Paper style={formPaperStyle}>
                <h2 style={{margin: 0}}>{this.getTranslation('create_new_approval_level')}</h2>
                <div style={{marginTop: '1rem'}}>
                    <Form source={this.modelToEdit} fieldConfigs={fieldConfigs} onFormFieldUpdate={this.formFieldUpdate}>
                        <RaisedButton onClick={this.saveAction} primary label={this.getTranslation('save')} />
                        <FlatButton onClick={this.cancelAction} style={{marginLeft: '1rem'}} label={this.getTranslation('cancel')} />
                    </Form>
                </div>
            </Paper>
        );
    },

    renderList() {
        const contextMenuActions = {
            delete: dataApprovalLevelActions.deleteDataApprovalLevel,
        };

        const cssStyles = {
            textAlign: 'right',
            marginTop: '1rem',
            marginRight: 16,
        };

        return (
            <div style={{maxWidth: 960, marginRight: 16}}>
                <div style={cssStyles}>
                    <FloatingActionButton onClick={this.addClick}>
                        <FontIcon className="material-icons">add</FontIcon>
                    </FloatingActionButton>
                </div>
                <div style={{marginTop: -24}}>
                    <DataTable
                        rows={this.state.approvalLevels}
                        columns={this.props.columns}
                        contextMenuActions={contextMenuActions}
                        />
                </div>
            </div>
        );
    },

    render() {
        return (
            <div>
                {this.state.showAddForm ? this.renderForm() : this.renderList()}
            </div>
        );
    },

    saveAction() {
        dataApprovalLevelActions
            .saveDataApprovalLevel(this.modelToEdit)
            .subscribe(
                () => {
                    window.snackbar.show();
                    this.resetAddFormAnddisplayList();
                },
                error => log.error('Error', error)
            );
    },

    cancelAction() {
        this.resetAddFormAnddisplayList();
    },

    resetAddFormAnddisplayList() {
        this.modelToEdit = this.context.d2.models.dataApprovalLevel.create();
        this.setState({
            showAddForm: false,
        });
    },

    formFieldUpdate(fieldName, newValue) {
        this.modelToEdit[fieldName] = newValue;
        this.forceUpdate();
    },

    addClick() {
        this.setState({
            approvalLevelToAdd: this.context.d2.models.dataApprovalLevel.create(),
            showAddForm: true,
        });
    },
});
