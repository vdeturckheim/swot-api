'use strict';
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const swotSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    guests: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = Mongoose.model('SWOT', swotSchema);
