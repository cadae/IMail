import moment from 'moment';

/**
 * @file
 * js/models/app_model.js
 *
 * This is the one-and-only model for the application. The views (UI) of the app are a "projection" of the state stored
 * in the model. The model keeps track of the current "state" of the app (what screens should be showing) as well as the
 * list of most recent 10 inbox items from GMail. It also keeps track of the email that the user has clicked on and is
 * currently viewing.
 */


const AUTHORIZE_WITH_GMAIL = "AUTHORIZE_WITH_GMAIL";
const LOG_IN = "LOG_IN";
const SHOW_MESSAGES_LIST = "SHOW_MESSAGES_LIST";
const VIEW_MESSAGE = "VIEW_MESSAGE";
const COMPOSE_MESSAGE = "COMPOSE_MESSAGE";
const SHOW_SPAM = "SHOW_SPAM"
const EDIT_SPAM = "EDIT_SPAM"
const REPLY_TO_MESSAGE = "REPLY_TO_MESSAGE";
const SHOW_DISCONNECTED_POPUP = "SHOW_DISCONNECTED_POPUP";
const SHOW_REPORT = "SHOW_REPORT"
const VIEW_STAT = "VIEW_STAT"
const VIEW_DATASET = "VIEW_DATASET"

class AppModel {

    constructor() {
        this.app = {
            online: true,
            userIsLoggedIn: false,
            previousState: "",
            historyId:"1",
            viewState: AUTHORIZE_WITH_GMAIL
        }
        this.email = {
            messages: []
        }
        this.spam = {
            addresses: []
        }
        this.stat = {
            statistics: [],
            emaillist: []
        }
        this.data = {
            dataset: []
        }
        this.date = {
            startDate: "01 01 1900",
            endDate: "01 01 2100"
        }
    }

    set viewState(newViewState) {
        this.app.viewState = newViewState;
    }
    get messages() {
        return this.email.messages;
    }
    set messages(messages) {
        this.email.messages = messages;
    }
    get addresses() {
        return this.spam.addresses;
    }
    set addresses(addresses) {
        this.spam.addresses = addresses;
    }
    set emaillist(emaillist) {
        this.stat.emaillist = emaillist;
    }
    get emaillist() {
        return this.stat.emaillist;
    }
    set dataset(dataset) {
        this.data.dataset = dataset;
    }
    get dataset() {
        return this.data.dataset;
    }
    get historyId() {
        return this.app.historyId;
    }
    set historyId(historyId) {
        this.app.historyId = historyId
    }
    get startDate(){
        return this.date.startDate;
    }
    get endDate(){
        return this.date.endDate;
    }
    set startDate(startDate) {
        this.date.startDate = startDate;
    }
    set endDate(endDate) {
        this.date.endDate = endDate;
    }
    get statistics() {
        return this.stat.statistics;
    }
    set statistics(statistics) {
        this.stat.statistics = statistics;
    }
    get selectedMessage() {
        return this.email.selectedMessage;
    }
    set selectedMessage(selectedMessage) {
        this.email.selectedMessage = selectedMessage;
    }
    get selectedAddress() {
        return this.spam.selectedAddress;
    }
    set selectedAddress(selectedAddress) {
        this.spam.selectedAddress = selectedAddress;
    }
    get selectedData() {
        return this.data.selectedData;
    }
    set selectedData(selectedData) {
        this.data.selectedData = selectedData;
    }
    get selectedStatistic() {
        return this.stat.selectedStatistic;
    }
    set selectedStatistic(selectedStatistic) {
        this.stat.selectedStatistic = selectedStatistic;
    }
    get appOnline() {
        return this.app.online;
    }
    set appOnline(isOnline) {
        this.app.online = isOnline;
    }
    get userIsLoggedIn() {
        return this.app.userIsLoggedIn;
    }
    set userIsLoggedIn(isLoggedIn) {
        this.app.userIsLoggedIn = isLoggedIn;
    }
    get previousState() {
        return this.app.previousState;
    }
    set previousState(previousState) {
        this.app.previousState = previousState;
    }


    static get AUTHORIZE_WITH_GMAIL() {
        return AUTHORIZE_WITH_GMAIL;
    }
    static get LOG_IN() {
        return LOG_IN;
    }
    static get SHOW_MESSAGES_LIST() {
        return SHOW_MESSAGES_LIST;
    }
    static get VIEW_MESSAGE() {
        return VIEW_MESSAGE;
    }
    static get COMPOSE_MESSAGE() {
        return COMPOSE_MESSAGE;
    }
    static get SHOW_SPAM() {
        return SHOW_SPAM;
    }
    static get EDIT_SPAM() {
        return EDIT_SPAM;
    }
    static get REPLY_TO_MESSAGE() {
        return REPLY_TO_MESSAGE;
    }
    static get SHOW_DISCONNECTED_POPUP() {
        return SHOW_DISCONNECTED_POPUP;
    }
    static get SHOW_REPORT() {
        return SHOW_REPORT;
    }
    static get VIEW_STAT() {
        return VIEW_STAT;
    }
    static get VIEW_DATASET() {
        return VIEW_DATASET;
    }
}

export { AppModel }