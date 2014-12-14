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
    description: {
        type: String,
        default: '',
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
    transactionType: {
        type: String,
        default: 'WITHDRAWAL',
        required: 'Please select a transaction type',
        trim: true

    },
    reconciled: Boolean,
    void: {
        type: Schema.ObjectId,
        ref: 'Transaction'
    },
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