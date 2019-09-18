/**
 * @file
 * js/views/messages_list_view.jsx
 *
 * This view shows the most recent emails from the user's GMail inbox.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

class AddressListsRow extends React.Component {

   handleClick(event) {
      this.props.onSelectedRow(this.props.address);
   }

   render() {
      let addressDate = moment(this.props.address.AddedDate).format('dddd MMM DD, YYYY')
      return (
         <tr className="address-list-row" onClick={this.handleClick.bind(this)} >
            <td >{this.props.address.Id}</td>
            <td>{this.props.address.Address}</td>
            <td>{this.props.address.NumBlocked}</td>
            <td>{addressDate}</td>
            <td>{this.props.address.WildCard}</td>
         </tr>
      )
   }
}

class ShowSPAMView extends React.Component {

   handleSelectedRow(address) {
      this.props.onShowAddressDetails(address);
   }

   render() {
      var addresses = this.props.addresses.slice(0).reverse().map((address, idx) => {
         return (
            <AddressListsRow
               key={idx}
               address={address}
               onSelectedRow={this.handleSelectedRow.bind(this)} />
         )
      })

      return (
         <div>
            <table className="table table-striped">
               <thead>
                  <tr>
                     <th>ID</th>
                     <th>Address</th>
                     <th>Number of Blocked</th>
                     <th>Added Date</th>
                     <th>WildCard</th>
                  </tr>
               </thead>
               <tbody>
                  {addresses}
               </tbody>
            </table>
            <button type="button" className="btn btn-primary" 
            onClick={this.props.onShowAddressDetails}>New</button>
         </div>
      )
   }
}

export { ShowSPAMView };


