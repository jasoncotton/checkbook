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

        function EventTracker() {
            this.events = {years: []};
            this.currentYear = null;
            this.currentMonth = null;
            this.currentDay = null;
            this.currentElement = null;
        }
        EventTracker.prototype.registerEvent = function registerEvent(year, month, day, event) {
            var compareFunction = function (a, b) {
                if (a < b) {
                    return -1;
                } else if (a > b) {
                    return 1;
                } else {
                    return 0;
                }
            };
            if (this.events[year] === undefined) {
                this.events[year] = {months: []};
                this.events.years.push(year);
                this.events.years.sort(compareFunction);
            }
            if (this.events[year][month] === undefined) {
                this.events[year][month] = {days: []};
                this.events[year].months.push(month);
                this.events[year].months.sort(compareFunction);
            }
            if (this.events[year][month][day] === undefined) {
                this.events[year][month][day] = [];
                this.events[year][month].days.push(day);
                this.events[year][month].days.sort(compareFunction);
            }
            this.events[year][month][day].push(event);
        };
        EventTracker.prototype.iterator = function () {
            var events = this.events,
                currentYear = 0,
                currentMonth = 0,
                currentDay = 0,
                currentElement = 0;
            return {
                next: function next() {
                    var year = events.years[currentYear],
                        month = events[year].months[currentMonth],
                        day = events[year][month].days[currentDay],
                        ret = events[year][month][day][currentElement++];

                    if (ret === undefined) {
                        // Finished with the last event of the day;
                        currentElement = 0;
                        day = events[year][month].days[++currentDay];
                        if (events[year][month][day] === undefined) {
                            // Finished with the last day of the month;
                            currentDay = 0;
                            month = events[year].months[++currentMonth];
                            if (events[year][month] === undefined) {
                                // Finished with the last month of the current year;
                                currentMonth = 0;
                                year = events.years[++currentYear];
                                if (events[year] === undefined) {
                                    // Finished with all of the events;
                                    return null;
                                }
                                month = events[year].months[currentMonth];
                            }
                            day = events[year][month].days[currentDay];
                        }
                        ret = events[year][month][day][currentElement++];
                    }
                    return {event: ret, year: year, month: month, day: day};
                }
            };
        };

        function drawHistogramChart(pStart, pEnd) {
            if (pStart === undefined) {
                pStart = new Date();
                pStart.setDate(1);
            }
            if (pEnd === undefined) {
                pEnd = new Date();
                pEnd.setMonth(pEnd.getMonth() + 1);
                pEnd.setDate(0);
            }


            console.log(pStart, pEnd);
            var data, options, i,
                tDate,
                plan,
                plans = $scope.plans,
                plansLength = plans.length,
                rows = [['Date', 'WITHDRAWAL', {type: 'string', role: 'tooltip'}, 'DEPOSIT', {type: 'string', role: 'tooltip'}]];

            for (i = 0; i < plansLength; i++) {
                plan = plans[i];
                console.log('plan: ', plan);
                tDate = new Date(plan.schedule.date);
                while (+tDate < +pEnd) {
                    if (+tDate > +pStart) {
                        console.log('tDate: ', tDate);
                        // Do stuff here
                        if (plan.type === 'WITHDRAWAL') {
                            rows.push([new Date(tDate.getTime()), plan.amount, plan.name + ': ' + plan.business + ' -$' + plan.amount.toFixed(2), null, null]);
                        } else {
                            rows.push([new Date(tDate.getTime()), null, null, plan.amount, plan.name + ': ' + plan.business + ' $' + plan.amount.toFixed(2)]);
                        }

                    }
                    if (plan.schedule.recurrence === true) {
                        if (plan.schedule.recurrenceType === 'MONTH') {
                            tDate.setMonth(tDate.getMonth() + 1);
                        } else if (plan.schedule.recurrenceType === 'X_DAYS') {
                            tDate.setDate(tDate.getDate() + plan.schedule.recurrenceDays);
                        }
                    }
                }
            }

            data = google.visualization.arrayToDataTable(rows);
            options = {
                title: 'Payments and dates',
                hAxis: {title: pStart.toString() + ' - ' + pEnd.toString(), minValue: pStart, maxDate: pEnd},
                vAxis: {title: 'Amount', minValue: 0},
                legend: 'none'
            };
            var chart = new google.visualization.ScatterChart(document.getElementById('chart_div'));
            chart.draw(data, options);
        }

        function drawChart() {
            // This logic must be redone, we cannot just itterate over the items like this, since it messes up the balance.  We have to generate
            // the list of events and the itterate over them a chronological order.

            var i, j, k,
                sum = 0,
                rows = [],
                daysThisMonth = 30,
                plan,
                plans = $scope.plans,
                recurrenceEndPoint,
                eventDate,
                event,
                events = {years: []},
                eventYear, eventMonth, eventDay,
                eventTracker = new EventTracker(),
                iterator;

            for (i = 0; i < plans.length; i++) {
                plan = plans[i];

                recurrenceEndPoint = new Date(plan.schedule.date);
                recurrenceEndPoint.setFullYear(recurrenceEndPoint.getFullYear() + 1);

                eventDate = new Date(plan.schedule.date);
                eventYear = eventDate.getFullYear();
                eventMonth = eventDate.getMonth();
                eventDay = eventDate.getDate();

                eventTracker.registerEvent(eventYear, eventMonth, eventDay, plan);

                if (plan.schedule.recurrence === true) {
                    while (eventDate < recurrenceEndPoint) {
                        if (plan.schedule.recurrenceType === 'MONTH') {
                            eventDate.setMonth(eventDate.getMonth() + 1);
                        } else if (plan.schedule.recurrenceType === 'X_DAYS') {
                            eventDate.setDate(eventDate.getDate() + plan.schedule.recurrenceDays);
                        } else {
                            break;
                        }

                        eventYear = eventDate.getFullYear();
                        eventMonth = eventDate.getMonth();
                        eventDay = eventDate.getDate();

                        eventTracker.registerEvent(eventYear, eventMonth, eventDay, plan);
                    }
                }
            }

            iterator = eventTracker.iterator();
            for (i = iterator.next(); i !== null; i = iterator.next()) {
                if (i.event.type === 'WITHDRAWAL') {
                    sum -= i.event.amount;
                } else {
                    sum += i.event.amount;
                }
                rows.push([new Date(i.year, i.month, i.day), sum, i.event.name, i.event.type + ' from ' + i.event.business]);
            }
            var data = new google.visualization.DataTable();
            data.addColumn('date', 'Date');
            data.addColumn('number', 'Balance');
            data.addColumn('string', 'title1');
            data.addColumn('string', 'text1');
            data.addRows(rows);

            var chart = new google.visualization.AnnotatedTimeLine(document.getElementById('chart_div'));
            chart.draw(data, {displayAnnotations: true});
        }

        $scope.deferredDrawChart = function () {
            $scope.plans.$promise.then(function () {
/*
                drawChart();
*/
                drawHistogramChart();
            });
        };
    }
]);
