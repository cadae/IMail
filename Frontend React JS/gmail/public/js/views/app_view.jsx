/**
 * @file
 * js/views/app_view.jsx
 *
 * This is the main view of the entire application. It generates the appropriate page views based on the current
 * state of the application.
 */

import React from 'react';
import ReactDOM from 'react-dom';

import { Navbar } from '../viewcomponents/navbar.jsx';
import { AuthorizeView } from './authorize_view.jsx';
import { LoginView } from './login_view.jsx';
import { SingleMessageView } from './single_message_view.jsx';
import { ComposeMessageView } from './compose_message_view.jsx';
import { SingleAddressView } from './single_address_view.jsx'
import { ShowSPAMView } from './spam_address_view.jsx'
import { MessagesListView } from './messages_list_view.jsx';
import { AppModel } from '../models/app_model.js';
import { ShowReportView } from './reporting_view.jsx';
import { SingleReportView } from './single_report_view.jsx';
import { ShowDatasetView } from './dataset_view.jsx';


class AppView extends React.Component {

   render() {

      //
      // Create the mage page view that sits below the top nav. This view is different based on what state the
      // applicaion is in (such as: showing the inbox list, composing a new email, viewing an email, etc.)
      //
      let mainContent = (() => {
         switch (this.props.app.viewState) {

            case AppModel.AUTHORIZE_WITH_GMAIL:
               return (
                  <AuthorizeView onHandleLogIn={this.props.onHandleAuthorize} />
               )
            case AppModel.LOG_IN:
               return (
                  <LoginView onHandleLogIn={this.props.onHandleLogIn} />
               )
            case AppModel.SHOW_MESSAGES_LIST:
               return (
                  <MessagesListView messages={this.props.messages}
                     previousState={this.props.previousState}
                     onHomeRefresh={this.props.onHomeRefresh}
                     historyId={this.props.historyId}
                     onShowEmailDetails={this.props.onShowEmailDetails} />
               )
            case AppModel.VIEW_MESSAGE:
               return (
                  <SingleMessageView message={this.props.selectedMessage}
                     previousState={this.props.previousState}
                     onReplyToEmail={this.props.onReplyToEmail}
                     onCancelReportEmailDetails={this.props.onCancelReportEmailDetails}
                     onCancelDataDetails={this.props.onCancelDataDetails}
                     onMarkSPAM={this.props.onMarkSPAM}
                     onUnmarkSPAM={this.props.onUnmarkSPAM}
                     onRemoveData={this.props.onRemoveData}
                     onCancelReply={this.props.onGoHomeNoRefresh} />
               )
            case AppModel.COMPOSE_MESSAGE:
               return (
                  <ComposeMessageView onSend={this.props.onSend}
                     onCancelReply={this.props.onGoHomeNoRefresh} />
               )
            case AppModel.SHOW_SPAM:
               return (
                  <ShowSPAMView addresses={this.props.addresses}
                     onShowSPAM={this.props.onShowSPAM}
                     onShowAddressDetails={this.props.onShowAddressDetails} />
               )
            case AppModel.EDIT_SPAM:
               return (
                  <SingleAddressView address={this.props.selectedAddress}
                     onCancelEdit={this.props.onCancelEditAddress}
                     onShowSPAM={this.props.onShowSPAM}
                     onNewAddresstoIRIS={this.props.onNewAddresstoIRIS}
                     onDeleteAddressinIRIS={this.props.onDeleteAddressinIRIS}
                     onSaveAddresstoIRIS={this.props.onSaveAddresstoIRIS} />
               )
            case AppModel.SHOW_REPORT:
               return (
                  <ShowReportView statistics={this.props.statistics}
                     previousState={this.props.previousState}
                     onShowReport={this.props.onShowReport}
                     onSetDate={this.props.onSetDate}
                     startDate={this.props.startDate}
                     endDate={this.props.endDate}
                     onShowStatisticDetails={this.props.onShowStatisticDetails} />
               )
            case AppModel.VIEW_STAT:
               return (
                  <SingleReportView statistic={this.props.selectedStatistic}
                     emaillist={this.props.emaillist}
                     onShowReportEmailDetails={this.props.onShowReportEmailDetails}
                     startDate={this.props.startDate}
                     endDate={this.props.endDate}
                     onCancelReportDetails={this.props.onCancelReportDetails} />
               )
            case AppModel.REPLY_TO_MESSAGE:
               return (
                  <ComposeMessageView message={this.props.selectedMessage}
                     onSend={this.props.onSend}
                     onCancelReply={this.props.onCancelReplyMessage} />
               )
            case AppModel.VIEW_DATASET:
               return (
                  <ShowDatasetView dataset = {this.props.dataset}
                     data={this.props.selectedData}
                     previousState={this.props.previousState}
                     onStartIncrementalTraining={this.props.onStartIncrementalTraining}
                     onShowDataDetails={this.props.onShowDataDetails} />
               )

            default:
               alert('none created this.props.viewState: ' + this.props.viewState);
               break;
         }
      })()

      return (
         <div>
            <Navbar appIsOnline={this.props.appIsOnline}
               userIsLoggedIn={this.props.userIsLoggedIn}
               onBackgroundRefresh={this.props.onBackgroundRefresh}
               onCompleteRefresh={this.props.onCompleteRefresh}
               onGoHome={this.props.onGoHome}
               onShowDataset={this.props.onShowDataset}
               onHomeRefresh={this.props.onHomeRefresh}
               onShowSPAM={this.props.onShowSPAM}
               onShowReport={this.props.onShowReport}
               onComposeEmail={this.props.onComposeEmail} />
            {mainContent}
         </div>
      )
   }
}

export { AppView }
