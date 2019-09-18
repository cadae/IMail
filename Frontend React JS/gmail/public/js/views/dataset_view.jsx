/**
 * @file
 * js/views/messages_list_view.jsx
 *
 * This view shows the most recent emails from the user's GMail inbox.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

class DataListsRow extends React.Component {

    handleClick(event) {
        this.props.onSelectedRow(this.props.data);
    }

    render() {
        return (
            <tr className="address-list-row" onClick={this.handleClick.bind(this)} >
                <td >{this.props.data.MessageId}</td>
                <td>{this.props.data.Text}</td>
                <td>{this.props.data.Spam}</td>
                <td>{this.props.data.IsTrained}</td>
            </tr>
        )
    }
}

class ShowDatasetView extends React.Component {

    handleSelectedRow(data) {
        this.props.onShowDataDetails(data);
    }

    render() {
        var dataset = this.props.dataset.slice(0).reverse().map((data, idx) => {
            return (
                <DataListsRow
                    key={idx}
                    data={data}
                    onSelectedRow={this.handleSelectedRow.bind(this)} />
            )
        })

        return (
            <div>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Message ID</th>
                            <th>Text</th>
                            <th>Spam</th>
                            <th>IsTrained</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataset}
                    </tbody>
                </table>
                <button type="button" className="btn btn-primary"
                    onClick={this.props.onStartIncrementalTraining}>Train</button>
            </div>
        )
    }
}

export { ShowDatasetView };


