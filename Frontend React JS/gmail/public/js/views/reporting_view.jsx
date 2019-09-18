import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import DatePicker from "react-datepicker";

class ReportListView extends React.Component {

    handleClick(event) {
        this.props.onSelectedRow(this.props.statistic);
    }

    render() {
        let label
        if (this.props.statistic.Label === "1") {
            label = "Inbox (Passed both the spam addresses and AI detection)"
        }
        else if (this.props.statistic.Label === "2") {
            label = "Spam (Filtered by SPAM addresses list defined by user)"
        }
        else if (this.props.statistic.Label === "3") {
            label = "Flagged (Filtered by the AI automatically. Unread Only)"
        }
        else if (this.props.statistic.Label === "4") {
            label = "Sent"
        }
        return (
            <tr className="address-list-row" onClick={this.handleClick.bind(this)} >
                <td >{label}</td>
                <td>{this.props.statistic.Count}</td>
            </tr>
        )
    }
}

class ShowReportView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: new Date(),
            endDate: new Date()
        };
    }
    handleStartDateChange(date) {
        this.setState({
            startDate: date
        });
    }
    handleEndDateChange(date) {
        this.setState({
            endDate: date
        });
    }
    handleQuery() {
        this.props.onSetDate(this.state.startDate, this.state.endDate)
        this.props.onShowReport();
    }
    handleSelectedRow(statistic) {
        this.props.onShowStatisticDetails(statistic);
    }
    render() {
        var statistics = this.props.statistics.map((statistic, idx) => {
            return (
                <ReportListView
                    key={idx}
                    statistic={statistic}
                    onSelectedRow={this.handleSelectedRow.bind(this)} />
            )
        })
        return (
            <div>
                    <DatePicker selected={moment(this.state.startDate)} onChange={this.handleStartDateChange.bind(this)} />
                    <DatePicker selected={moment(this.state.endDate)} onChange={this.handleEndDateChange.bind(this)} />
                    <button type="button" className="btn btn-primary"
                        onClick={this.handleQuery.bind(this)}>Query</button>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Email Label</th>
                            <th>Number of Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {statistics}
                    </tbody>
                </table>
            </div>
        )
    }
}

export { ShowReportView };