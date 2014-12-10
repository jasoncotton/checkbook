'use strict';

// Transactions controller
angular.module('transactions').controller('TransactionsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Transactions', 'Accounts',
	function($scope, $stateParams, $location, Authentication, Transactions, Accounts) {
		$scope.authentication = Authentication;
        $scope.account = $scope.account || Accounts.get({accountId: $stateParams.accountId});

        /* initial values for creating new forms... ? */
        $scope.transactionDate = new Date();

		// Create new Transaction
		$scope.create = function() {
			// Create new Transaction object
			var transaction = new Transactions ({
                accountId: $scope.account._id,
                businessName: this.businessName,
                amount: Number(this.amount),
                deposit: this.deposit,
                balanceAfter: Number($scope.account.balance) + (this.deposit ? Number(this.amount) : -Number(this.amount)),
                transactionDate: this.transactionDate
			});

			// Redirect after save
            transaction.$save(function(response) {
                $location.path('accounts/' + $scope.account._id);

                // Clear form fields
                $scope.businessName = '';
                $scope.deposit = false;
                $scope.reconciled = false;
                $scope.void = false;
                $scope.amount = 0.00;
                $scope.balance = 0.00;
                $scope.transactionDate = new Date();
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

		// Remove existing Transaction
		$scope.remove = function(transaction) {
			if ( transaction ) { 
				transaction.$remove();
				for (var i in $scope.transactions) {
					if ($scope.transactions [i] === transaction) {
						$scope.transactions.splice(i, 1);
					}
				}
			} else {
                transaction = $scope.transaction;
                if (transaction.deposit) {
                    $scope.account.balance -= transaction.amount;
                } else {
                    $scope.account.balance += transaction.amount;
                }
                $scope.account.$update(function (response) {
                    $scope.transaction.$remove(function() {
                        $location.path('accounts/' + $scope.account._id);
                    });
                });
			}
		};

		// Update existing Transaction
		$scope.update = function() {
            $scope.transaction.$update(function() {
				$location.path('accounts/' + $scope.account._id + '/transactions/' + $scope.transaction._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Transactions
		$scope.find = function() {
			$scope.transactions = Transactions.query();
		};

		// Find existing Transaction
		$scope.findOne = function() {
			$scope.transaction = Transactions.get({ 
				transactionId: $stateParams.transactionId
			});
		};

        /* Controls for the date picker: */
        $scope.today = function() {
            $scope.dt = new Date();
        };
        $scope.today();

        $scope.clear = function () {
            $scope.dt = null;
        };

        // Disable weekend selection
        $scope.disabled = function(date, mode) {
            return false;
        };

        $scope.toggleMin = function() {
            $scope.minDate = $scope.minDate ? null : new Date();
        };
        $scope.toggleMin();

        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        $scope.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 0
        };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];

	}
]);