/**
 * @file
 * js/viewcomponents/navbar.jsx
 *
 * This is the top navigation bar of the application.
 */

import React from 'react';
import ReactDOM from 'react-dom';


class Navbar extends React.Component {

  render() {

    //
    // Show the "app is offline" message in the upper right of the app or not?
    //
    let offlineMessageCssClass = 'offline-message ' + (this.props.appIsOnline ? 'hidden' : '');

    //
    // Only if the user is logged in do we show the "Compose Email" link in the top nav.
    //
    let composeLink = this.props.userIsLoggedIn ? (
      <li className="compose-email-link"><a href="#!" onClick={this.props.onComposeEmail}>Compose Email</a></li>
    ) : null;
    let spamLink = this.props.userIsLoggedIn ? (
      <li className="show-spam-list"><a href="#!" onClick={this.props.onShowSPAM}>SPAM Addresses</a></li>
    ) : null;
    let reportLink = this.props.userIsLoggedIn ? (
      <li className="show-report-list"><a href="#!" onClick={this.props.onShowReport}>Reports</a></li>
    ) : null;
    let homeLink = this.props.userIsLoggedIn ? (
      <li className="show-email-list"><a href="#!" onClick={this.props.onHomeRefresh}>Home</a></li>
    ) : null;
    let datasetLink = this.props.userIsLoggedIn ? (
      <li className="show-email-list"><a href="#!" onClick={this.props.onShowDataset}>Dataset</a></li>
    ) : null;
    return (
      <nav className="navbar navbar-inverse navbar-fixed-top">
        <div className="container">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand" href="#!" onClick={this.props.onCompleteRefresh}>Email Intelligence</a>
          </div>
          <div id="navbar" className="collapse navbar-collapse">
            <ul className="nav navbar-nav">
              {homeLink}
              {spamLink}
              {reportLink}
              {datasetLink}
              {composeLink}
            </ul>
          </div>
        </div>
        <div className={offlineMessageCssClass}>App is Offline! <div className="red-dot"></div></div>
      </nav>
    )
  }
  componentDidMount() {
    this.interval = setInterval(this.props.onBackgroundRefresh, 10000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
}

export { Navbar }

