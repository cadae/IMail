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

class SingleAddressView extends React.Component {

   constructor(props) {
      super(props);
      this.state = {
         address: props.address ? props.address.Address : '',
         id: props.address ? props.address.Id : ''
      };
   }

   handleSave() {
      if (this.props.address.Id) {
         this.props.onSaveAddresstoIRIS(this.state);
         if (this.state.address.charAt(0) == "*") {
            this.props.address.Address = this.state.address
            this.props.address.WildCard = "1"
         }
         else {
            this.props.address.Address = this.state.address
            this.props.address.WildCard = "0"
         }
      }
      else {
         this.props.onNewAddresstoIRIS(this.state);
      }
   }

   handleDelete() {
      if (this.props.address.Id) {
         this.props.onDeleteAddressinIRIS(this.state);
      }
      else {
         this.props.onShowSPAM()
      }
   }

   handleChangeAddress(evt) {
      this.setState({
         address: evt.target.value
      });
   }

   render() {

      let deletebtn = this.props.address.Id ? (
         <button type="submit" className="btn btn-primary"
         onClick={this.handleDelete.bind(this)}>Delete</button>
      ) : null;

      return (
         <div className="single-address-view">
            <header className="title">
               <h3>Edit SPAM Address {this.state.id}</h3>
               <button className="btn btn-link" onClick={this.props.onCancelEdit}
                  dangerouslySetInnerHTML={{ __html: '&times;' }}></button>
            </header>
            <form>
               <div className="edit-address">
                  <input className="form-control" type="text" id={this.state.id} name="address"
                     defaultValue={this.state.address} onChange={this.handleChangeAddress.bind(this)}></input>
               </div>
               <footer>
                  <button type="submit" className="btn btn-primary"
                     onClick={this.handleSave.bind(this)}>Save</button>
                  {deletebtn}
               </footer>
            </form>
         </div>
      )
   }

   //
   // This is invoked every time the view shows with some new email message. It is here where we hook into the DOM and
   // place html content into the iframe (which is an HTML component that is good for displaying HTML content).
   //
   // componentDidMount() {

   // }
}


export { SingleAddressView };