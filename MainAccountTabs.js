'use strict';

var React = require('react-native');
var {
  StyleSheet,
  TabBarIOS,
  Text,
  View,
} = React;

var MainAccountView = require('./MainAccountView');
var MainContactsView = require('./MainContactsView');
var MainPaymentCreditView = require('./MainPaymentCreditView');
var MainPaymentDepositView = require('./MainPaymentDepositView');

let db = require('./libs/RealmDB'); 
let BankClient = require('./libs/BankClient');
let bc = new BankClient();

var MainAccountTabs = React.createClass({
    statics: {
      title: '<TabBarIOS>',
      description: 'Tab-based navigation.',
    },

    displayName: 'TabBarExample',

    getInitialState: function() {
      // Update balance
      this._updateAccount();
      return {
        selectedTab: 'account',
        notifCount: 0,
        presses: 0,
      };
    },

    _updateAccount: function() {
        console.log('updating account...');
        
        // Get user account number
        let user = db.objects('Account');
        // Check if there is a result
        if (user.length <= 0) {
            //Error 
            return;
        }
        // @TODO When user has multiple accounts, loop through
        // Get first user account
        var userAccount = user.slice(0,1);
        userAccount = userAccount[0];

        // Get latest balances
        let data = {};
        let res = bc.accountGet(data, function(res) {
            if (typeof res.error == 'undefined') {
                console.log(res.response);
                let userAccountDetails = JSON.parse(res.response);

                db.write(() => {
                    console.log('Writing');
                    console.log(userAccountDetails.AccountNumber);
                    // Update Main Account
                    let userUpdate = db.objects('Account');
                    //var userAccountUpdate = userUpdate.filter('AccountNumber = "'+userAccountDetails.AccountNumber+'"');
                    var userAccountUpdate = userUpdate.slice(0,1);
                    userAccountUpdate = userAccountUpdate[0];
                    console.log(userAccountUpdate);

                    userAccountUpdate.AccountHolderName = userAccountDetails.AccountHolderName;
                    userAccountUpdate.Overdraft = userAccountDetails.Overdraft;
                    userAccountUpdate.AvailableBalance = userAccountDetails.AvailableBalance;
                    userAccountUpdate.AccountBalance = userAccountDetails.AccountBalance;

                    console.log('After the write');
                    console.log(userAccountUpdate);
                });

                console.log('Finished writing');
            } else {
                Alert.alert('Error', 'Could not update account details');
                return;
            }
        });
    },

    render: function() {
      return (
        <TabBarIOS
          tintColor="white"
          barTintColor="darkslateblue">
          <TabBarIOS.Item
            systemIcon="favorites"
            title="Main Account"
            selected={this.state.selectedTab === 'account'}
            onPress={() => {
              this.setState({
                selectedTab: 'account',
              });
            }}>
      	<MainAccountView />
          </TabBarIOS.Item>
          <TabBarIOS.Item
            systemIcon="contacts"
            title="Contacts"
            badge={this.state.notifCount > 0 ? this.state.notifCount : undefined}
            selected={this.state.selectedTab === 'contacts'}
            onPress={() => {
              this.setState({
                selectedTab: 'contacts',
                notifCount: this.state.notifCount + 1,
              });
            }}>
      	<MainContactsView />
          </TabBarIOS.Item>
          <TabBarIOS.Item
            systemIcon="bookmarks"
            title="Credit"
            selected={this.state.selectedTab === 'paymentsCredit'}
            onPress={() => {
              this.setState({
                selectedTab: 'paymentsCredit',
                presses: this.state.presses + 1
              });
            }}>
      	<MainPaymentCreditView />
          </TabBarIOS.Item>
          <TabBarIOS.Item
            systemIcon="top-rated"
            title="Deposit"
            selected={this.state.selectedTab === 'paymentsDeposit'}
            onPress={() => {
              this.setState({
                selectedTab: 'paymentsDeposit',
                presses: this.state.presses + 1
              });
            }}>
      	<MainPaymentDepositView />
          </TabBarIOS.Item>
        </TabBarIOS>
      );
    },

});

var styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    color: 'white',
    margin: 50,
  },
});

module.exports = MainAccountTabs;