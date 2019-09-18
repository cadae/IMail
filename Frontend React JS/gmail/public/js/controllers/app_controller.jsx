/**
 * @file
 * js/controllers/app_controller.js
 *
 * This file contains the main application controller for the NimbleRX Gmail client. This is where the
 * "intelligence" can be found. The views are much less intelligent. And the model contains just the data that
 * drives the views.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

import { AppModel } from '../models/app_model.js';
import { AppView } from '../views/app_view.jsx';
import { GmailController } from './gmail_controller.js';

var privates = Symbol("privates");

//
// The application's main controller.
//
class AppController {

   constructor() {
      this.appModel = new AppModel();
      this.appModel.appOnline = navigator.onLine;
      this.gmailController = new GmailController();

      //
      // These are private methods that the outside world can't access but methods defined within
      // this class can access.
      //
      this[privates] = {
         displayMessages: (messages) => {
            this.appModel.previousState = "SHOW_MESSAGES_LIST";
            this.appModel.messages = messages;
            this.appModel.viewState = AppModel.SHOW_MESSAGES_LIST;
            this.render();
         },
         displayAddresses: (addresses) => {
            this.appModel.addresses = addresses;
            this.appModel.viewState = AppModel.SHOW_SPAM;
            this.render();
         },
         displayStatistics: (statistics) => {
            this.appModel.previousState = "SHOW_REPORT";
            this.appModel.statistics = statistics;
            this.appModel.viewState = AppModel.SHOW_REPORT;
            this.render();
         },
         displayEmailsofLabel: (emails) => {
            this.appModel.previousState = "VIEW_STAT";
            this.appModel.emaillist = emails;
            this.appModel.viewState = AppModel.VIEW_STAT;
            this.render();
         },
         displayDataset: (dataset) => {
            this.appModel.previousState = "VIEW_DATASET";
            this.appModel.dataset = dataset;
            this.appModel.viewState = AppModel.VIEW_DATASET;
            this.render();
         }
      }
   }

   //
   // This re-retrieves inbox items from GMail and then shows the inbox list.
   //
   handleGoHome() {

      //
      // Most of the time, we do the default for this method - which is to go out over the network and grab
      // the most up-to-date top 10 items in the user's GMail inbox...
      //
      if (navigator.onLine) {
         this.handleBackgroundRefresh();
         this.handleHomeRefresh();

         //
         // But! If the browser isn't online, then going out to GMail would fail. So instead, we simply return the
         // user to a view of the list of inbox messages that is in memory from the last time we successfully
         // grabbed emails from GMail.
         //
      } else {
         this.appModel.viewState = AppModel.SHOW_MESSAGES_LIST;
         this.render();
      }
   }

   //
   // This just shows the in-memory inbox list we got from GMail some time in the past. (NOTE: This doesn't go
   // out to GMail for a refreshed view of the inbox.)
   //
   handleGoHomeNoRefresh() {
      this.appModel.viewState = AppModel.SHOW_MESSAGES_LIST;
      this.render();
   }

   //
   // The user clicked the "Log In to Gmail" button. Log the user in using Google's OAuth API and the 
   // Email API.
   //
   // This function does 2 things:
   //    1. Log the user in.
   //    2. Grab the top 10 items from their GMail inbox.
   //
   handleAuthorize() {
      this.gmailController.authorizeUser().then(() => {
         return this.gmailController.doFullSync();
      }).then((messages) => {
         if (messages) {
            this.appModel.userIsLoggedIn = true;
            this.appModel.historyId = messages[0].startHistoryId;
            this[privates].displayMessages(messages);
         }
         //
         // An error indicates that the user isn't currently logged in to GMail. We'll now
         // send them to a page that will allow them to log in via a popup.
         //
      }).catch(() => {
         this.appModel.viewState = AppModel.LOG_IN;
         this.render();
      })
   }

   //
   // The user clicked the "Log In to Gmail" button. Log the user in using Google's OAuth API and the 
   // Email API.
   //
   // This function does 2 things:
   //    1. Log the user in.
   //    2. Grab the top 10 items from their GMail inbox.
   //
   handleLogIn() {
      this.gmailController.logUserIn().then(() => {
         return this.gmailController.doFullSync();
      }).then((messages) => {
         if (messages) {
            this.appModel.userIsLoggedIn = true;
            this.appModel.historyId = messages[0].startHistoryId;
            this[privates].displayMessages(messages);
         }
      })
   }

   //
   // This goes out to GMail, retrieves a fresh view of the top 10 messages in the user's inbox and then shows
   // those to the screen in a list.
   //
   handleCompleteRefresh() {
      this.gmailController.doFullSync().then((messages) => {
         if (messages) {
            this.appModel.historyId = messages[0].startHistoryId;
            this[privates].displayMessages(messages);
         }
         else {
            this[privates].displayMessages(this.appModel.messages);
         }
      })
   }

   handleBackgroundRefresh() {
      if (this.appModel.userIsLoggedIn && this.appModel.appOnline) {
         this.gmailController.getMessagesUpdate(this.appModel.historyId).then((messages) => {
            if (messages) {
               messages.forEach(message => {
                  this.appModel.messages.unshift(message)
               });
               this.appModel.historyId = messages[0].startHistoryId;
            }
         })
         console.log("background refreshed")
      }
   }

   handleHomeRefresh() {
      console.log("home refreshed")
      this[privates].displayMessages(this.appModel.messages);
   }
   //
   // The user clicked an email. Show it in detailed view.
   //
   handleShowEmailDetails(message) {
      this.appModel.selectedMessage = message;
      this.appModel.viewState = AppModel.VIEW_MESSAGE;
      this.render();
   }

   handleShowAddressDetails(address) {
      this.appModel.selectedAddress = address;
      this.appModel.viewState = AppModel.EDIT_SPAM;
      this.render();
   }

   handleShowStatisticDetails(statistic) {
      this.appModel.selectedStatistic = statistic;
      this.gmailController.getListOfEmailsWithSameLabelFromIRIS(this.appModel.startDate, this.appModel.endDate, statistic.Label).then((emails) => {
         this[privates].displayEmailsofLabel(emails);
      });
   }

   handleShowReportEmailDetails(email) {
      this.gmailController.getEmailByMessageId(email.MessageId).then((message) => {
         this.appModel.selectedMessage = message;
         this.appModel.viewState = AppModel.VIEW_MESSAGE;
         this.render();
      });
   }

   handleShowDataDetails(data) {
      this.gmailController.getEmailByMessageId(data.MessageId).then((message) => {
         this.appModel.selectedMessage = message;
         this.appModel.viewState = AppModel.VIEW_MESSAGE;
         this.render();
      });
   }
   //
   // The user clicked the "Compose Email" link along the top navigation. Show a "Compose Email" form.
   //
   handleComposeEmail() {
      this.appModel.viewState = AppModel.COMPOSE_MESSAGE;
      this.render();
   }

   handleShowSPAM() {
      this.gmailController.getListOfSPAM().then((addresses) => {
         this[privates].displayAddresses(addresses)
      });
   }

   handleShowReport() {
      this.gmailController.getStatisticsFromIRIS(this.appModel.startDate, this.appModel.endDate).then((statistics) => {
         this[privates].displayStatistics(statistics)
      });
   }

   handleShowDataset() {
      this.gmailController.getDataset().then((dataset) => {
         this[privates].displayDataset(dataset)
      })
   }
   //
   // The user was replying to an email but cancelled that activity. We want to bring the user back to the
   // original email they wanted to reply to.
   //
   handleCancelReplyMessage() {
      this.appModel.viewState = AppModel.VIEW_MESSAGE;
      this.render();
   }
   handleCancelEditAddress() {
      this.appModel.viewState = AppModel.SHOW_SPAM;
      this.render();
   }
   handleCancelReportDetails() {
      this.appModel.viewState = AppModel.SHOW_REPORT;
      this.render();
   }
   handleCancelReportEmailDetails() {
      this.appModel.viewState = AppModel.VIEW_STAT;
      this.render();
   }
   handleCancelDataDetails() {
      this.appModel.viewState = AppModel.VIEW_DATASET;
      this.render();
   }

   //
   // The user was viewing an email from their inbox and clicked the "Reply" button. We will show the user
   // a screen that allows them to reply to the email.
   //
   handleReplyToEmail() {
      this.appModel.viewState = AppModel.REPLY_TO_MESSAGE;
      this.render();
   }
   handleSetDate(startDate, endDate) {
      this.appModel.startDate = moment(startDate, "MM DD YYYY");
      this.appModel.endDate = moment(endDate, "MM DD YYYY");
   }
   handleSaveSPAMAddress(address) {
      this.gmailController.saveAddresstoIRIS(address).then(() => {
         this.appModel.viewState = AppModel.SHOW_SPAM;
         this.render();
      });
   }
   handleMarkSPAM(message) {
      console.log(message)
      this.gmailController.setLabelofEmail(message.id, message.from, "SPAM", "INBOX")
      this.gmailController.addDataset(message, true)
      if (this.appModel.previousState === "VIEW_STAT") {
         this.appModel.viewState = AppModel.VIEW_STAT;
         this.render();
      }
      else if (this.appModel.previousState === "SHOW_MESSAGES_LIST"){
         this.appModel.viewState = AppModel.SHOW_MESSAGES_LIST;
         this.render();
      }
      else if (this.appModel.previousState === "VIEW_DATASET") {
         this.appModel.viewState = AppModel.VIEW_DATASET;
         this.render();
      }
   }
   handleUnmarkSPAM(message) {
      console.log(message)
      this.gmailController.setLabelofEmail(message.id, message.from, "INBOX", "SPAM")
      this.gmailController.addDataset(message, false)
      if (this.appModel.previousState == "VIEW_STAT") {
         this.appModel.viewState = AppModel.VIEW_STAT;
         this.render();
      }
      else if (this.appModel.previousState === "SHOW_MESSAGES_LIST"){
         this.appModel.viewState = AppModel.SHOW_MESSAGES_LIST;
         this.render();
      }
      else if (this.appModel.previousState === "VIEW_DATASET") {
         this.appModel.viewState = AppModel.VIEW_DATASET;
         this.render();
      }
   }
   handleNewSPAMAddress(address) {
      this.gmailController.newAddresstoIRIS(address).then(() => {
         this.appModel.viewState = AppModel.SHOW_SPAM;
         this.render();
      });
   }
   handleDeleteSPAMAddress(address) {
      this.gmailController.deleteAddressinIRIS(address).then(() => {
         this.appModel.viewState = AppModel.SHOW_SPAM;
         this.render();
      })
   }
   handleRemoveData(message) {
      console.log(message)
      this.gmailController.removeDataset(message).then(() => {
         this.appModel.viewState = AppModel.VIEW_DATASET;
         this.render();
      })
   }
   handleIncrementalTraining() {
      this.gmailController.startIncrementalTraining().then((response) => {
         console.log(response)
      })
   }

   //
   // The user clicked the "Send" button from the Compose/Reply form. If the browser is "offline" (the network is off),
   // then the email the user is sending will be saved in a local queue (from which it will be sent once the computer's
   // network comes back online). But if the user's computer is online (network is working), then this will send the
   // email. Once the email is sent, this re-retrieves the user's inbox from GMail and shows those messages to the
   // user in a list.
   //
   handleSendEmail(email) {

      //
      // If we are online, send the email over the newwork...
      //
      if (navigator.onLine) {

         this.gmailController.sendEmail(email).then(() => {
            this.handleGoHome();
         })


         //
         // Otherwise, we'll queue it (into an outbox) and send it later.
         //
      } else {
         this.gmailController.enqueueEmailToBeSent(email);
         this.handleGoHome();
      }
   }

   //
   // Each time this is called, the application's UI is re-rendered (based on the model).
   //
   render() {
      ReactDOM.render(
         <AppView
            messages={this.appModel.messages}
            addresses={this.appModel.addresses}
            statistics={this.appModel.statistics}
            startDate={this.appModel.startDate}
            endDate={this.appModel.endDate}
            emaillist={this.appModel.emaillist}
            dataset={this.appModel.dataset}
            selectedData={this.appModel.selectedData}
            previousState={this.appModel.previousState}
            selectedMessage={this.appModel.selectedMessage}
            selectedAddress={this.appModel.selectedAddress}
            selectedStatistic={this.appModel.selectedStatistic}
            app={this.appModel.app}
            appIsOnline={this.appModel.appOnline}
            userIsLoggedIn={this.appModel.userIsLoggedIn}

            onGoHome={this.handleGoHome.bind(this)}
            onCompleteRefresh={this.handleCompleteRefresh.bind(this)}
            onGoHomeNoRefresh={this.handleGoHomeNoRefresh.bind(this)}
            onCancelReplyMessage={this.handleCancelReplyMessage.bind(this)}
            onCancelEditAddress={this.handleCancelEditAddress.bind(this)}
            onCancelReportDetails={this.handleCancelReportDetails.bind(this)}
            onCancelReportEmailDetails={this.handleCancelReportEmailDetails.bind(this)}
            onCancelDataDetails={this.handleCancelDataDetails.bind(this)}
            onHandleLogIn={this.handleLogIn.bind(this)}
            onHandleAuthorize={this.handleAuthorize.bind(this)}
            onShowEmailDetails={this.handleShowEmailDetails.bind(this)}
            onShowAddressDetails={this.handleShowAddressDetails.bind(this)}
            onNewAddresstoIRIS={this.handleNewSPAMAddress.bind(this)}
            onSaveAddresstoIRIS={this.handleSaveSPAMAddress.bind(this)}
            onDeleteAddressinIRIS={this.handleDeleteSPAMAddress.bind(this)}
            onShowStatisticDetails={this.handleShowStatisticDetails.bind(this)}
            onShowReportEmailDetails={this.handleShowReportEmailDetails.bind(this)}
            onStartIncrementalTraining={this.handleIncrementalTraining.bind(this)}
            onBackgroundRefresh={this.handleBackgroundRefresh.bind(this)}
            onHomeRefresh={this.handleHomeRefresh.bind(this)}
            onShowDataset={this.handleShowDataset.bind(this)}
            onShowDataDetails={this.handleShowDataDetails.bind(this)}
            onSetDate={this.handleSetDate.bind(this)}
            onMarkSPAM={this.handleMarkSPAM.bind(this)}
            onUnmarkSPAM={this.handleUnmarkSPAM.bind(this)}
            onRemoveData={this.handleRemoveData.bind(this)}
            onComposeEmail={this.handleComposeEmail.bind(this)}
            onShowSPAM={this.handleShowSPAM.bind(this)}
            onShowReport={this.handleShowReport.bind(this)}
            onReplyToEmail={this.handleReplyToEmail.bind(this)}
            onSend={this.handleSendEmail.bind(this)} />,
         document.getElementById('app')
      );
   }

   init() {

      ////////////////////////////////////////////
      //
      // Respond to online/offline state.
      //
      ////////////////////////////////////////////

      //
      // Once the app comes back online, remove the message at the right of top nav, send any pending outbound messages and
      // then retrieve the inbox of messages again.
      //
      var appIsOnline = () => {
         this.appModel.appOnline = true;

         //
         // Now that we're back online, flush the outbox (send emails that were composed and sent while
         // the browser was offline).
         //
         this.gmailController.sendQueuedEmails().then(() => {

            //
            // Now that all emails that had been in the outbox have been sent, lets re-retrieve the inbox.
            //
            this.handleCompleteRefresh();
         })

      }
      var appIsOffline = () => {
         this.appModel.appOnline = false;
         this.render();
      }
      window.addEventListener('online', appIsOnline);
      window.addEventListener('offline', appIsOffline);

      //
      // Show the first view.
      //
      this.render();
   }
}

export { AppController }

