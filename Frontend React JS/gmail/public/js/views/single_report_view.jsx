import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

class ReportListView extends React.Component {

    handleClick(event) {
        this.props.onSelectedRow(this.props.email);
    }

    render() {
        let emailDate = moment(this.props.email.ReceiveDate).format('dddd MMM DD, YYYY')
        let probability = (this.props.email.Probability != undefined) ? <td>{this.props.email.Probability}</td> : null;
        return (
            <tr className="address-list-row" onClick={this.handleClick.bind(this)} >
                <td >{this.props.email.MessageId}</td>
                <td>{emailDate}</td>
                <td>{this.props.email.Address}</td>
                {probability}
            </tr>
        )
    }
}

class SingleReportView extends React.Component {
    constructor(props) {
        super(props);
    }
    handleSelectedRow(email) {
        this.props.onShowReportEmailDetails(email);
    }
    render() {
        let probability = (this.props.emaillist[0].Probability != undefined) ? <th>Probability</th> : null;
        var emaillist = this.props.emaillist.slice(0).reverse().map((email, idx) => {
            return (
                <ReportListView
                    key={idx}
                    email={email}
                    onSelectedRow={this.handleSelectedRow.bind(this)} />
            )
        })
        return (
            <div className="single-message-view">
                <header className="title">
                    <h3>Email List</h3>
                    <button className="btn btn-link" onClick={this.props.onCancelReportDetails}
                        dangerouslySetInnerHTML={{ __html: '&times;' }}></button>
                </header>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Email ID</th>
                            <th>Date</th>
                            <th>Address</th>
                            {probability}
                        </tr>
                    </thead>
                    <tbody>
                        {emaillist}
                    </tbody>
                </table>
            </div>
        )
    }
}

export { SingleReportView };