'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Account Schema
 */
var AccountSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Account name',
		trim: true
	},
    bank: {
        type: String,
        default: '',
        required: 'Please provide the Bank name',
        trim: true
    },
    number: {
        type: String,
        default: '',
        required: 'Please provide the account number',
        trim: true
    },
    routingNumber: {
        type: String,
        default: '',
        required: 'Please provide the routing number',
        trim: true
    },
    balance: {
        type: Number,
        default: 0.00
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

mongoose.model('Account', AccountSchema);