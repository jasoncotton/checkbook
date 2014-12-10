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
        accountId = req.body.accountId;

    console.log(accountId);

	transaction.user = req.user;

    if (typeof transaction.amount !== 'undefined' && transaction.amount !== 0) {
        console.log('amounts were different');
    }

	transaction.save(function(err) {
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
        oldDeposit = transaction.deposit === true;

	transaction = _.extend(transaction, req.body);

    if (oldAmount !== transaction.amount) {
        // Have to update the balance on the account.
        Account.findById(req.body.accountId).populate('user', 'displayName').exec(function(err, account) {
            account.balance += (oldDeposit === true ? -1 : 1) * oldAmount;
            account.balance -= (transaction.deposit === true ? -1 : 1) * transaction.amount;
            console.log('about to save the account after changing balance...');
            account.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                transaction.save(function(err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(transaction);
                    }
                });
            });
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
