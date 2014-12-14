'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Transaction = mongoose.model('Transaction'),
    Account = mongoose.model('Account'),
	_ = require('lodash');

/**
 * Create a Transaction
 */
exports.create = function(req, res) {
	var transaction = new Transaction(req.body),
        accountId = req.body.accountId,
        account = Account.findById(accountId);

	transaction.user = req.user;


    if (transaction.reconciled === true && typeof transaction.amount !== 'undefined' && transaction.amount !== 0) {
        // In this case: update the account balance
        if (transaction.transactionType === 'DEPOSIT') {
            transaction.balanceAfter = account.balance + transaction.amount;
        } else {
            transaction.balanceAfter = account.balance - transaction.amount;
        }
        account.balance = transaction.balanceAfter;

        account.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                transaction.save(function(err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(transaction);
                    }
                });
            }
        });
    } else {
        transaction.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(transaction);
            }
        });
    }
};

/**
 * Show the current Transaction
 */
exports.read = function(req, res) {
	res.jsonp(req.transaction);
};

/**
 * Update a Transaction
 */
exports.update = function(req, res) {
	var transaction = req.transaction,
        oldAmount = Number(transaction.amount),
        wasReconciled = transaction.reconciled === true,
        wasDeposit = transaction.transactionType === 'DEPOSIT',
        account = Account.findById(transaction.accountId),
        tmpBalance = account.balance;

	transaction = _.extend(transaction, req.body);

    if (wasReconciled !== true) {
        // We only allow edits to previously unreconciled transactions
        if (transaction.reconciled === true) {
            if (transaction.transactionType ==='DEPOSIT') {
                transaction.balanceAfter = account.balance + transaction.amount;
            } else {
                transaction.balanceAfter = account.balance - transaction.amount;
            }
            account.balance = transaction.balanceAfter;
            account.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    transaction.save(function(err) {
                        if (err) {
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            res.jsonp(transaction);
                        }
                    });
                }
            });
        } else {
            transaction.save(function(err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(transaction);
                }
            });
        }
    }
};

/**
 * Delete an Transaction
 */
exports.delete = function(req, res) {
	var transaction = req.transaction;
	transaction.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(transaction);
		}
	});
};

/**
 * List of Transactions
 */
exports.list = function(req, res) { 
	Transaction.find().sort('-created').populate('user', 'displayName').exec(function(err, transactions) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(transactions);
		}
	});
};

/**
 * Transaction middleware
 */
exports.transactionByID = function(req, res, next, id) { 
	Transaction.findById(id).populate('user', 'displayName').exec(function(err, transaction) {
		if (err) return next(err);
		if (! transaction) return next(new Error('Failed to load Transaction ' + id));
		req.transaction = transaction ;
		next();
	});
};

/**
 * Transaction authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.transaction.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
