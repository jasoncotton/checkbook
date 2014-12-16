'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Plan Schema
 */
var PlanSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Plan name',
		trim: true
	},
    business: {
        type: String,
        default: '',
        required: 'Please enter the business',
        trim: true
    },
    amount: {
        type: Number,
        required: 'Please enter the amount'
    },
    type: {
        type: String,
        default: 'WITHDRAWAL',
        trim: true
    },
    schedule: {
        date: Date,
        recurrence: Boolean,
        recurrenceDays: Number,
        recurrenceType: String
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

mongoose.model('Plan', PlanSchema);
