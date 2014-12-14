'use strict';

// Plans controller
angular.module('plans').controller('PlansController', ['$scope', '$stateParams', '$location', 'Authentication', 'Plans',
	function($scope, $stateParams, $location, Authentication, Plans) {
		$scope.authentication = Authentication;

		// Create new Plan
		$scope.create = function() {
			// Create new Plan object
			var plan = new Plans ({
				name: this.name,
                business: this.business,
                amount: this.amount,
                schedule: this.schedule,
                type: this.type
			});

			// Redirect after save
			plan.$save(function(response) {
				$location.path('plans/' + response._id);

				// Clear form fields
				$scope.name = '';
                $scope.business = '';
                $scope.amount = 0.00;
                $scope.schedule = {};
                $scope.type = 'WITHDRAWAL';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Plan
		$scope.remove = function(plan) {
			if ( plan ) { 
				plan.$remove();

				for (var i in $scope.plans) {
					if ($scope.plans [i] === plan) {
						$scope.plans.splice(i, 1);
					}
				}
			} else {
				$scope.plan.$remove(function() {
					$location.path('plans');
				});
			}
		};

		// Update existing Plan
		$scope.update = function() {
			var plan = $scope.plan;

			plan.$update(function() {
				$location.path('plans/' + plan._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Plans
		$scope.find = function() {
			$scope.plans = Plans.query();
		};

		// Find existing Plan
		$scope.findOne = function() {
			$scope.plan = Plans.get({ 
				planId: $stateParams.planId
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


        /* globals google */
        google.load('visualization', '1', {'packages':['annotatedtimeline']});
        function drawChart() {
            var i,
                sum = 0,
                rows = [],
                daysThisMonth = 30;

            for (i = 1; i < daysThisMonth; i++) {
                // Need to figure out how to determine if the given day alters the sum
                rows.push([new Date(2014, 11, i), sum]);
            }

            var data = new google.visualization.DataTable();
            data.addColumn('date', 'Date');
            data.addColumn('number', 'Balance');
            data.addRows(rows);

            var chart = new google.visualization.AnnotatedTimeLine(document.getElementById('chart_div'));
            chart.draw(data, {displayAnnotations: true});
        }
        drawChart();
    }
]);