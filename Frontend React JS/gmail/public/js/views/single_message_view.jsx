/**
 * @file
 * js/views/single_message_view.jsx
 *
 * This is a read-only view of an email item that the user has clicked on. This view supports displaying both plain text
 * and html emails.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

class SingleMessageView extends React.Component {  

   handleMarkSPAM() {
      this.props.onMarkSPAM(this.props.message)
   }
   handleUnmarkSPAM() {
      this.props.onUnmarkSPAM(this.props.message)
   }
   handleRemoveData() {
      this.props.onRemoveData(this.props.message)
   }
   render() {
      let cancelButton = null;
      let SPAMButton = null;
      let NOTSPAMButton = null;
      let removeButton = null;
      let replyButton = null;
      if (this.props.previousState === "SHOW_MESSAGES_LIST") {
         cancelButton = <button className="btn btn-link" onClick={this.props.onCancelReply} 
         dangerouslySetInnerHTML={{__html: '&times;'}}></button>
         replyButton = <button type="button" className="btn btn-primary" onClick={this.props.onReplyToEmail}>Reply</button>
         var isSPAM = false;
         this.props.message.labels.forEach(element => {
            if (element == "SPAM") {
               isSPAM = true
            }
         })
         if (isSPAM) {
            NOTSPAMButton = <button type="button" className="btn btn-primary" onClick={this.handleUnmarkSPAM.bind(this)}>Not SPAM</button>
         }
         else {
            SPAMButton = <button type="button" className="btn btn-primary" onClick={this.handleMarkSPAM.bind(this)}>Mark SPAM</button>
         }
      }
      else if (this.props.previousState === "VIEW_STAT") {
         cancelButton = <button className="btn btn-link" onClick={this.props.onCancelReportEmailDetails} 
         dangerouslySetInnerHTML={{__html: '&times;'}}></button>
         replyButton = <button type="button" className="btn btn-primary" onClick={this.props.onReplyToEmail}>Reply</button>
         var isSPAM = false;
         this.props.message.labels.forEach(element => {
            if (element == "SPAM") {
               isSPAM = true
            }
         })
         if (isSPAM) {
            NOTSPAMButton = <button type="button" className="btn btn-primary" onClick={this.handleUnmarkSPAM.bind(this)}>Not SPAM</button>
         }
         else {
            SPAMButton = <button type="button" className="btn btn-primary" onClick={this.handleMarkSPAM.bind(this)}>Mark SPAM</button>
         }
      }
      else if (this.props.previousState === "VIEW_DATASET") {
         cancelButton = <button className="btn btn-link" onClick={this.props.onCancelDataDetails} 
         dangerouslySetInnerHTML={{__html: '&times;'}}></button>
         removeButton = <button type="button" className="btn btn-primary" onClick={this.handleRemoveData.bind(this)}>Remove</button>
      }
      let messageDate = moment(this.props.message.date).format('dddd MMM DD, YYYY h:m a');
      return ( 
        <div className="single-message-view">
         <header className="title">
            <h3>{this.props.message.subject}</h3>
            {cancelButton}
         </header>
         <header className="from-and-date">
            <span className="from">From: {this.props.message.from}</span>
            <span className="date">{messageDate}</span>
         </header>
         <section>
            <iframe ref="iframe" frameBorder="0" ></iframe>
         </section>
         <footer>
            {NOTSPAMButton}
            {SPAMButton}
            {removeButton}
            {replyButton}
         </footer>
       </div>
      )
   }

   //
   // This is invoked every time the view shows with some new email message. It is here where we hook into the DOM and
   // place html content into the iframe (which is an HTML component that is good for displaying HTML content).
   //
   componentDidMount() {
     
      let messageBody = this.props.message.body;
      let iframe = this.refs.iframe;
      let frameDoc = iframe.contentWindow.document;
      //
      // Place the email message's html (or plain text) body into the iframe.
      //
      frameDoc.write(messageBody);

      //
      // Give the content a while to settle. We want to resize the iframe so that it is tall enough to display all of the 
      // content without the need for a scroll bar.
      //
      setTimeout( _ => {
         let contentHeight = frameDoc.body.scrollHeight;
         iframe.height = (contentHeight + 30) + 'px';
      },100);
   }
}


export {SingleMessageView};