/**
 * @file
 * js/controllers/gmail_controller.js
 *
 * This is the component with all of the logic required to log into Google (via OAuth) and access the logged in user's
 * GMail inbox. NOTE: There is an "outbox" that is used as an offline cache for those times when a user sends emails
 * but their network is offline.
 */

// Imports the Google Cloud client library
// const {PubSub} = require('@google-cloud/pubsub');
const clientId = '32438553337-io9l8sfe0rhlmnta9soufhp14dugd6d1.apps.googleusercontent.com'
const apiKey = 'AIzaSyDo1L5jdj5twMrIWdiBpUROWEKfcQaEn1U'
const emailNumber = 50
const scopes = 'https://www.googleapis.com/auth/gmail.readonly ' + 'https://www.googleapis.com/auth/gmail.send ' + 'https://www.googleapis.com/auth/gmail.modify';
let accessToken = ""

function getMessageHeader(messageHeaders, key) {
   let headerValue = null;

   messageHeaders.forEach((header) => {
      if (header.name === key) {
         headerValue = header.value;
      }
   });

   return headerValue;
}

function getMessageBody(message) {
   let encodedBody = '';

   function getHTMLPart(arr) {

      for (let x = 0; x <= arr.length; x++) {
         if (typeof arr[x].parts === 'undefined') {
            if (arr[x].mimeType === 'text/html') {
               return arr[x].body.data;
            }
         } else {
            return getHTMLPart(arr[x].parts);
         }
      }
      return '';
   }

   if (typeof message.parts === 'undefined') {
      encodedBody = message.body.data;
   } else {
      encodedBody = getHTMLPart(message.parts);
   }
   encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
   return decodeURIComponent(escape(window.atob(encodedBody)));


   if (typeof message.parts === 'undefined') {
      encodedBody = message.body && message.body.data; //'none' //message.body.data;
      encodedBody = encodedBody || 'missing';
   } else {
      encodedBody = getHTMLPart(message.parts);
   }
   encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');

   return encodedBody;
}

function getTextOnly(message) {
   let encodedBody = '';

   function getTextPart(arr) {

      for (let x = 0; x <= arr.length; x++) {
         if (typeof arr[x].parts === 'undefined') {
            if (arr[x].mimeType === 'text/plain') {
               return arr[x].body.data;
            }
         } else {
            return getTextPart(arr[x].parts);
         }
      }
      return '';
   }

   if (typeof message.parts === 'undefined') {
      encodedBody = message.body.data;
   } else {
      encodedBody = getTextPart(message.parts);
   }
   encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
   encodedBody = decodeURIComponent(escape(window.atob(encodedBody)));
   encodedBody = encodedBody.replace(/ *\<[^>]*\> */g, "");
   encodedBody = encodedBody.replace(/ *\([^)]*\) */g, "");
   encodedBody = encodedBody.replace(/ *\[[^]]*\) */g, "");
   encodedBody = encodedBody.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
   encodedBody = encodedBody.replace(/ *\[[^]]*\) */g, "");
   return encodedBody;
}

function parseMessageDetails(message, startHistoryId) {
   let parsedMessage = {
      from: getMessageHeader(message.payload.headers, 'From'),
      id: message.id,
      subject: getMessageHeader(message.payload.headers, 'Subject'),
      date: getMessageHeader(message.payload.headers, 'Date'),
      labels: message.labelIds,
      body: getMessageBody(message.payload),
      snippet: message.snippet,
      text: getTextOnly(message.payload),
      startHistoryId: startHistoryId
   }
   // console.log(parsedMessage.text)
   let irisObject = {
      Address: extractEmailAddress(parsedMessage.from),
      MessageId: parsedMessage.id,
      Label: "",
      Subject: parsedMessage.subject,
      Content: parsedMessage.body,
      ReceiveDate: parsedMessage.date
   }

   var isRead = true;

   message.labelIds.forEach(element => {
      if (element == "INBOX") {
         irisObject.Label = "1"
      }
      if (element == "SPAM") {
         irisObject.Label = "2"
      }
      if (element == "UNREAD") {
         isRead = false
      }
      if (element == "SENT") {
         irisObject.Label = "4"
      }
   });
   // store all the email in IRIS regardless of the labels
   fetch("http://localhost:52774/api/email/emaillist",
      {
         method: "POST",
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(irisObject)
      }).then(response => {
         //check the unread email is spam or not
         if (isRead == false) {
            checkSPAM(irisObject.Address, irisObject.MessageId, parsedMessage.snippet.split('|')[0])
         }
      })
   return parsedMessage;
}

function extractEmailAddress(header) {
   return header.match(/[^@<\s]+@[^@\s>]+/)[0];
}

function checkEmailwithTensorFlow(content, messageId) {
   content = content.replace("&#39;","'")
   let contentObject = {
      raw: content
   }
   fetch("http://localhost:5000/predict",
      {
         method: "POST",
         mode: 'cors',
         header: {
            "Content-Type": "application/json"
         },
         body: JSON.stringify(contentObject)
      }).then(response => {
         return response.json()
      }).then((data) => {
         let result = data.result
         let probability = data.probability
         if (result == "Positive") {
            console.log("SPAM Detected by AI")
            let irisObject = {
               MessageId: messageId,
               Probability: probability
            }
            fetch("http://localhost:52774/api/email/emaillist/nlpflagged",
               {
                  method: "POST",
                  headers: {
                     'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(irisObject)
               }).then((response) => {
                  console.log(response)
               })
            let setLabelsRequest = gapi.client.gmail.users.messages.modify({
               'userId': 'me',
               'id': messageId,
               'addLabelIds': ["SPAM"],
               'removeLabelIds': ["UNREAD","INBOX"]
            });
            setLabelsRequest.execute();
         }
         if (result == "Negative") {
            let irisObject = {
               MessageId: messageId,
               Probability: probability
            }
            fetch("http://localhost:52774/api/email/emaillist/nlppassed",
            {
               method: "POST",
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify(irisObject)
            }).then((response) => {
               console.log(response)
            })
            let setLabelsRequest = gapi.client.gmail.users.messages.modify({
               'userId': 'me',
               'id': messageId,
               'removeLabelIds': ["UNREAD"]
            });
            setLabelsRequest.execute();
         }
      })
}

function checkSPAM(address, MessageId, content) {
   let irisObject = {
      Address: address,
      MessageId: MessageId,
      Content: content
   }
   //check spam based on spam list (label in IRIS will change accordingly if spam)
   fetch("http://localhost:52774/api/email/spamlist/check",
      {
         method: "POST",
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(irisObject)
      })
      .then((response) => {
         return response.json()
      })
      .then((data) => {
         let SPAMID = data.result
         if (SPAMID !== 0) {
            console.log(address)
            // change the label in Gmail as well
            let setLabelsRequest = gapi.client.gmail.users.messages.modify({
               'userId': 'me',
               'id': MessageId,
               'addLabelIds': ["SPAM"],
               'removeLabelIds': ["UNREAD","INBOX"]
            });
            setLabelsRequest.execute();
         }
         if (SPAMID == 0) {
            // if email is not in spam list check with Machine Learning
            checkEmailwithTensorFlow(content, MessageId)
         }
      })
      .catch(() => console.error('failed!'))
}

class GmailController {

   constructor() {
      this.outbox = [];
   }

   //
   // This function authorizes the user with Google as long as they are currently logged in to GMail. But if the
   // user isn't logged in to GMail, this will fail and the user will need to click a "Log In" button in order
   // to log in using a popup dialog.
   //
   authorizeUser() {

      return new Promise(function (resolve, reject) {

         //
         // First, set the api key. Wait for it to stick.
         //
         gapi.client.setApiKey(apiKey);
         window.setTimeout(_ => {
            authorizeUser();
         }, 1);

         //
         // Then, authorize the user (OAuth login, get the user to accept, etc.)
         //
         var authorizeUser = () => {
            gapi.auth.authorize({
               client_id: clientId,
               scope: scopes,
               immediate: true
            }, handleAuthResult);
         }

         //
         // Now, Google has authenticated the user or not. If there was an error, the user must log in
         // via a popup hosted by Google..
         //
         var handleAuthResult = (authResult) => {
            if (authResult && !authResult.error) {
               console.log('you are authorized');
               accessToken = authResult.access_token;
               loadGmailApi();
            } else {
               //
               // We have a problem! The user will need to log in using the GMail popup dialog.
               //
               reject();
            }
         }

         var loadGmailApi = () => {
            gapi.client.load('gmail', 'v1', _ => {
               resolve(true);
            });
         }
      });
   }

   //
   // This is only called after the application has attempted to automatically authenticate the user with Google/GMail.
   // The only time this method is called is when the user tries to "Authorize with Google" but that fails because
   // the user isn't logged in to GMail. If that failure occurs, the user is taken to a new screen with a
   // "Log In" button. The user can click that button in order to see GMail's log in pop up.
   //
   logUserIn() {
      return new Promise(function (resolve, reject) {

         //
         // First, set the api key. Wait for it to stick.
         //
         gapi.client.setApiKey(apiKey);
         window.setTimeout(_ => {
            authorizeUserShowUserLoginForm();
         }, 1);

         //
         // This version is necessary for when the user isn't logged in. It causes the log in popup to show.
         //
         var authorizeUserShowUserLoginForm = () => {
            gapi.auth.authorize({
               client_id: clientId,
               scope: scopes,
               immediate: false
            }, handleAuthResult);
            return false;
         }

         //
         // Now, Google has authenticated the user.
         //
         var handleAuthResult = (authResult) => {
            if (authResult && !authResult.error) {
               console.log('you are authorized');
               accessToken = authResult.access_token
               loadGmailApi();
            } else {
               alert('Unexpected Error! - ' + authResult.error);
            }
         }

         var loadGmailApi = () => {
            gapi.client.load('gmail', 'v1', _ => {
               resolve(true);
            });
         }
      });
   }

   validateToken() {
      return new Promise(function (resolve, reject) {
         var url = new URL('https://www.googleapis.com/oauth2/v1/tokeninfo')
         var params = { 'access_token': accessToken }
         var headers = {
            'Accept': "*/*",
            'Cache-Control': "no-cache",
            'Host': "www.googleapis.com",
            'Accept-Encoding': "gzip, deflate",
            'Connection': "keep-alive",
            'cache-control': "no-cache",
            'Content-Type': 'application/json'
         }
         url.search = new URLSearchParams(params)
         fetch(url, {
            method: "GET",
            headers
         }).then(response => {
            return response.json();
         }).then(data => {
            resolve(data)
         })
      });
   }

   // setPushNotification(){
   //    const pubsub = new PubSub();
   //    const subscriptionName = 'mysub';
   //    const timeout = 10;
   //    // References an existing subscription
   //    const subscription = pubsub.subscription(subscriptionName);
   //    // Create an event handler to handle messages
   //    let messageCount = 0;
   //    const messageHandler = message => {
   //    console.log(`Received message ${message.id}:`);
   //    console.log(`\tData: ${message.data}`);
   //    console.log(`\tAttributes: ${message.attributes}`);
   //    messageCount += 1;

   //    // "Ack" (acknowledge receipt of) the message
   //    message.ack();
   //    };

   //    // Listen for new messages until timeout is hit
   //    subscription.on(`message`, messageHandler);

   //    setTimeout(() => {
   //    subscription.removeListener('message', messageHandler);
   //    console.log(`${messageCount} message(s) received.`);
   //    }, timeout * 1000);
   // }

   doFullSync(limit = emailNumber) {
      return new Promise(function (resolve, reject) {
         let messages = [];
         let startHistoryId = 0;
         let getHistoryId = gapi.client.gmail.users.getProfile({
            'userId':'me'
         });
         getHistoryId.execute(resopnse => {
            startHistoryId = resopnse.historyId;
         });
         let getMessagesRequest = gapi.client.gmail.users.messages.list({
            'userId': 'me',
            'includeSpamTrash': true,
            'maxResults': limit
         });
         getMessagesRequest.execute((response) => {
            let numberOfMessageDetailsToFetch = response.messages.length;
            response.messages.forEach((message, messageIndex) => {

               //
               // We put each message "stub" here. This means that "messages" will contain newest to oldest messages
               // in the same order as you'd see them at gmail.com. Later, we'll retrieve the details for each message.
               // When we do that, those details need to be put into the correct position/slot in "messages."
               //
               messages.push(message);

               let messageDetailsRequest = gapi.client.gmail.users.messages.get({
                  'userId': 'me',
                  'id': message.id
               });

               messageDetailsRequest.execute((messageDetails) => {
                  //
                  // Replace the stub with the retrieved message. This allows us to get message details at different times
                  // (some take longer than others), but the message-with-details are in the same order as the original
                  // list we retrieved.
                  //
                  messages[messageIndex] = parseMessageDetails(messageDetails, startHistoryId)
                  numberOfMessageDetailsToFetch -= 1;
                  if (numberOfMessageDetailsToFetch === 0) {
                     console.log(messages)
                     resolve(messages);
                  }
               })
            });
         });
      });
   }

   getMessagesUpdate(historyId, limit = emailNumber) {
      return new Promise(function (resolve, reject) {
         let messages = [];
         let startHistoryId = 0;
         let getMessagesRequest = gapi.client.gmail.users.history.list({
            'userId': 'me',
            'historyTypes': ['messageAdded'],
            'startHistoryId': historyId,
            // 'labelId': ['INBOX', 'SPAM'],
            'maxResults': limit
         });

         getMessagesRequest.execute((response) => {
            if (response.historyId <= historyId || Object.keys(response).length <= 2) {
               resolve();
            }
            else {
               let numberOfMessageDetailsToFetch = response.history.length;
               startHistoryId = response.historyId
               console.log(response.historyId)
               response.history.forEach((message, messageIndex) => {

                  //
                  // We put each message "stub" here. This means that "messages" will contain newest to oldest messages
                  // in the same order as you'd see them at gmail.com. Later, we'll retrieve the details for each message.
                  // When we do that, those details need to be put into the correct position/slot in "messages."
                  //
                  messages.push(message);

                  let messageDetailsRequest = gapi.client.gmail.users.messages.get({
                     'userId': 'me',
                     'id': message.messages[0].id
                  });

                  messageDetailsRequest.execute((messageDetails) => {
                     //
                     // Replace the stub with the retrieved message. This allows us to get message details at different times
                     // (some take longer than others), but the message-with-details are in the same order as the original
                     // list we retrieved.
                     //
                     messages[messageIndex] = parseMessageDetails(messageDetails, startHistoryId)
                     numberOfMessageDetailsToFetch -= 1;
                     if (numberOfMessageDetailsToFetch === 0) {
                        console.log(messages)
                        resolve(messages);
                     }
                  })
               });
            }
         });
      });
   }



   getEmailByMessageId(MessageId) {
      return new Promise(function (resolve, reject) {
         let messageDetailsRequest = gapi.client.gmail.users.messages.get({
            'userId': 'me',
            'id': MessageId
         });
         messageDetailsRequest.execute((message) => {
            let parsedMessage = {
               from: getMessageHeader(message.payload.headers, 'From'),
               id: message.id,
               subject: getMessageHeader(message.payload.headers, 'Subject'),
               date: getMessageHeader(message.payload.headers, 'Date'),
               labels: message.labelIds,
               body: getMessageBody(message.payload),
               snippet: message.snippet
            }
            resolve(parsedMessage);
         });
      });
   }

   getPageOfSPAMMessages(start, limit = emailNumber) {
      return new Promise(function (resolve, reject) {
         let messages = [];
         let getSPAMMessagesRequest = gapi.client.gmail.users.messages.list({
            'userId': 'me',
            'labelIds': 'SPAM',
            'maxResults': limit
         });
         getSPAMMessagesRequest.execute((SPAMresponse) => {
            let numberOfSPAMMessageDetailsToFetch = SPAMresponse.messages.length;
            SPAMresponse.messages.forEach((message, messageIndex) => {
               messages.push(message);
               let SPAMmessageDetailsRequest = gapi.client.gmail.users.messages.get({
                  'userId': 'me',
                  'id': message.id
               });
               SPAMmessageDetailsRequest.execute((SPAMMessageDetails) => {
                  messages[messageIndex] = parseMessageDetails(SPAMMessageDetails)
                  numberOfSPAMMessageDetailsToFetch -= 1;
                  if (numberOfSPAMMessageDetailsToFetch === 0) {
                     resolve(messages);
                  }
               })
            })
         })
      });
   }

   getListOfSPAM(start) {
      return new Promise(function (resolve, reject) {
         let addresses = [];
         fetch("http://localhost:52774/api/email/spamlist", {
            method: "GET",
            headers: {
               'Content-Type': 'application/json'
            },
         }).then(response => {
            return response.json()
         }).then(data => {
            addresses = data.SPAM
            resolve(addresses)
         })
      });
   }

   getDataset(start) {
      return new Promise(function (resolve, reject) {
         let dataset = [];
         fetch("http://localhost:52774/api/email/dataset", {
            method: "GET",
            headers: {
               'Content-Type': 'application/json'
            },
         }).then(response => {
            return response.json()
         }).then(data => {
            dataset = data.Dataset
            resolve(dataset)
         })
      });
   }

   addDataset(message, isSpam) {
      return new Promise(function (resolve, reject) {
         let dataset = {
            MessageId: message.id,
            Text: message.snippet,
            Spam: isSpam
         };
         fetch("http://localhost:52774/api/email/dataset/newentry", {
            method: "POST",
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataset)
         }).then(response => {
            console.log(response)
            resolve(response)
         })
      });
   }
   removeDataset(message) {
      return new Promise(function (resolve, reject) {
         fetch("http://localhost:52774/api/email/dataset/"+message.id, 
         {
            method: "DELETE"
         }).then(response => {
            console.log(response)
            resolve(response)
         })
      });
   }

   startIncrementalTraining() {
      return new Promise(function (resolve, reject) {
         let dataset = {
            text: [],
            spam: []
         };
         fetch("http://localhost:52774/api/email/dataset", {
            method: "GET",
            headers: {
               'Content-Type': 'application/json'
            },
         }).then(response => {
            return response.json()
         }).then(data => {
            data.Dataset.forEach(function (data) {
               dataset.text.push(data.Text);
               dataset.spam.push(data.Spam);
            })
            console.log(dataset)
            if (dataset.spam.length > 32) {
               fetch("http://localhost:5000/train", {
                  method: "POST",
                  headers: {
                     'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(dataset)
               }).then(response => {
                  console.log(response.json())
                  resolve(response)
               })
            }
            else alert("Size of Dataset must be larger than 32 in order to continue training.")
         })
      });
   }

   getStatisticsFromIRIS(startDateValue, endDateValue) {
      return new Promise(function (resolve, reject) {
         let emails = [];
         let messageBody = {
            startDate: startDateValue,
            endDate: endDateValue
         }
         fetch("http://localhost:52774/api/email/emaillist/statistics", {
            method: "POST",
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageBody)
         }).then(response => {
            return response.json()
         })
            .then(data => {
               emails = data.Emails
               resolve(emails)
            })
      });
   }

   getListOfEmailsWithSameLabelFromIRIS(startDateValue, endDateValue, label) {
      return new Promise(function (resolve, reject) {
         let statistics = [];
         let messageBody = {
            startDate: startDateValue,
            endDate: endDateValue,
            Label: label
         }
         fetch("http://localhost:52774/api/email/emaillist/label", {
            method: "POST",
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageBody)
         }).then(response => {
            return response.json()
         })
            .then(data => {
               statistics = data.Emails
               resolve(statistics)
            })
      });
   }

   enqueueEmailToBeSent(email) {
      this.outbox.push(email);
   }

   sendQueuedEmails() {

      //
      // Bind the promise function to "this"
      //
      return new Promise((resolve, reject) => {

         if (this.outbox.length === 0) {
            setTimeout(_ => resolve(), 0);
         } else {
            let promises = [];

            //
            // Clone the outbox.
            //
            let outbox = this.outbox.slice();
            this.outbox.length = 0;

            //
            // Work from the clone. Create promises for each email that needs to be sent. These promises will
            // send the emails. 
            //
            outbox.forEach((email) => {
               promises.push(this.sendEmail(email));
            });

            //
            // Now, once all the emails have been sent, call the "resolve" function - so the client controller
            // knows the send is done.
            //
            Promise.all(promises).then(function (values) {
               resolve();
            });
         }
      });
   }

   setLabelofEmail(emailId, address, labelsToAdd, labelsToRemove) {
      return new Promise(function (resolve, reject) {
         let irisObject = {
            MessageId: emailId,
            Address: extractEmailAddress(address)
         }
         let setLabelsRequest = gapi.client.gmail.users.messages.modify({
            'userId': 'me',
            'id': emailId,
            'addLabelIds': [labelsToAdd],
            'removeLabelIds': [labelsToRemove]
         });
         setLabelsRequest.execute();
         if (labelsToAdd == "INBOX") {
            fetch("http://localhost:52774/api/email/emaillist/unmarkspam",
               {
                  method: "POST",
                  headers: {
                     'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(irisObject)
               }).then((response) => {
                  console.log(response.json())
               })
         }
         else {
            fetch("http://localhost:52774/api/email/emaillist/markspam",
               {
                  method: "POST",
                  headers: {
                     'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(irisObject)
               }).then((response) => {
                  console.log(response.json())
               })
         }
         resolve();
      });
   }

   saveAddresstoIRIS(address) {
      return new Promise(function (resolve, reject) {
         let irisObject = {
            Address: address.address,
         }
         fetch("http://localhost:52774/api/email/spamlist/" + address.id,
            {
               method: "PUT",
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify(irisObject)
            })
            .then((response) => {
               console.log(response.json())
            })
         resolve();
      });
   }

   newAddresstoIRIS(address) {
      return new Promise(function (resolve, reject) {
         let irisObject = {
            Address: address.address,
         }
         fetch("http://localhost:52774/api/email/spamlist",
            {
               method: "POST",
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify(irisObject)
            })
            .then((response) => {
               console.log(response.json())
            })
         resolve();
      });
   }

   deleteAddressinIRIS(address) {
      return new Promise(function (resolve, reject) {
         fetch("http://localhost:52774/api/email/spamlist/" + address.id,
            {
               method: "DELETE",
            })
         resolve();
      });
   }

   sendEmail(email) {
      return new Promise(function (resolve, reject) {
         //
         // Create the email.
         //
         let emailContent = 'To: ' + email.to + '\r\n' + 'Subject: ' + email.subject + '\r\n';
         emailContent += '\r\n' + email.body;

         var sendRequest = gapi.client.gmail.users.messages.send({
            'userId': 'me',
            'resource': {
               'raw': window.btoa(emailContent).replace(/\+/g, '-').replace(/\//g, '_')
            }
         });

         //
         // Send the email.
         //
         sendRequest.execute(_ => {
            resolve();
         });
      });
   }

}

export { GmailController }

