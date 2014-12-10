'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Transaction Schema
 */
var TransactionSchema = new Schema({
    accountId: {
        type: Schema.ObjectId,
        ref: 'Account',
        index: true
    },
	businessName: {
		type: String,
		default: '',
		required: 'Please fill business name',
		trim: true
	},
    amount: {
        type: Number,
        required: 'Please fill in the amount'
    },
    balanceAfter: {
        type: Number
    },
    category: [String],
    deposit: Boolean,
    reconciled: Boolean,
    void: Boolean,
    transactionDate: {
        type: Date,
        default: Date.now
    },
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Transaction', TransactionSchema);