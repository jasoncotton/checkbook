'use strict';

//Setting up route
angular.module('accounts').config(['$stateProvider',
	function($stateProvider) {
		// Accounts state routing
		$stateProvider.
		state('listAccounts', {
			url: '/accounts',
			templateUrl: 'modules/accounts/views/list-accounts.client.view.html'
		}).
		state('createAccount', {
			url: '/accounts/create',
			templateUrl: 'modules/accounts/views/create-account.client.view.html'
		}).
		state('viewAccount', {
			url: '/accounts/:accountId',
			templateUrl: 'modules/accounts/views/view-account.client.view.html'
		}).
        state('editAccount', {
            url: '/accounts/:accountId/edit',
            templateUrl: 'modules/accounts/views/edit-account.client.view.html'
        }).
        state('listTransactions', {
            url: '/accounts/:accountId/transactions',
            templateUrl: 'modules/transactions/views/list-transactions.client.view.html'
        }).
        state('createTransaction', {
            url: '/accounts/:accountId/transactions/create',
            templateUrl: 'modules/transactions/views/create-transaction.client.view.html'
        }).
        state('viewTransaction', {
            url: '/accounts/:accountId/transactions/:transactionId',
            templateUrl: 'modules/transactions/views/view-transaction.client.view.html'
        }).
        state('editTransaction', {
            url: '/accounts/:accountId/transactions/:transactionId/edit',
            templateUrl: 'modules/transactions/views/edit-transaction.client.view.html'
        });
	}
]);