'use strict';
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const postSchema = new Schema({
    text: {
        type: String
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
    category: {
        type: String,
        required: true,
        index: true
    }
});

module.exports = Mongoose.model('POST', postSchema);
