/**
 * @file
 * js/views/messages_list_view.jsx
 *
 * This view shows the most recent emails from the user's GMail inbox.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

class MessagesListRow extends React.Component {

   handleClick(event) {
      this.props.onSelectedRow(this.props.message);
   }

   render() {
      let messageDate = moment(this.props.message.date).format('dddd MMM DD, YYYY h:m a')
      let labels = this.props.message.labels.join().toLowerCase()
      return (
         <tr className="message-list-row" onClick={this.handleClick.bind(this)} >
            <td >{this.props.message.from}</td>
            <td>{this.props.message.subject}</td>
            <td>{messageDate}</td>
            <td>{labels}</td>
         </tr>
      )
   }
}

class MessagesListView extends React.Component {
   constructor(props) {
      super(props)
   }
   
   handleSelectedRow(message) {
      this.props.onShowEmailDetails(message);
   }
   render() {
      var messages = this.props.messages.map((message, idx) => {
         return (
            <MessagesListRow
               key={idx}
               message={message}
               onSelectedRow={this.handleSelectedRow.bind(this)} />
         )
      })

      return (
         <table className="table table-striped">
            <thead>
               <tr>
                  <th>From</th>
                  <th>Subject</th>
                  <th>When</th>
                  <th>Label</th>
               </tr>
            </thead>
            <tbody>
               {messages}
            </tbody>
         </table>
      )
   }
   componentDidMount() {
      this.interval = setInterval(this.props.onHomeRefresh, 5000);
   }
   componentWillUnmount() {
      clearInterval(this.interval);
    }
}

export { MessagesListView };


