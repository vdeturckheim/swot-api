'use strict';
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const postSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    guests: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    swot: {
        type: Schema.Types.ObjectId,
        ref: 'SWOT',
        required: true,
        index: true
    },
    category: {
        type: String,
        required: true,
        index: true
    }
});

module.exports = Mongoose.model('POST', postSchema);
