'use strict';
const Boom = require('boom');
const Post = require('../models/post.model');
const SWOTService = require('./swot.service');

module.exports.list = function (userId, swotId) {

    const query = {
        $and: [
            { swot: swotId },
            { $or: [{ author: userId }, { guests: userId }] }
        ]
    };

    return SWOTService.read(userId, swotId)
        .then(() => Post.find(query).populate('author', 'name').populate('guests', 'name').exec());
};

module.exports.save = function (userId, swotId, candidate) {

    candidate.author = userId;
    candidate.swot = swotId;
    const post = new Post(candidate);

    return SWOTService.read(userId, swotId)
        .then(() => post.save())
        .then(() => post);
};

module.exports.read = function (userId, swotId, postId) {

    const query = {
        $and: [
            { swot: swotId },
            { $or: [{ author: userId }, { guests:userId }] },
            { _id: postId }
        ]
    };

    return SWOTService.read(userId, swotId)
        .then(() => Post.findOne(query).populate('author', 'name').populate('guests', 'name').exec())
        .then((post) => {

            if (!post) {
                return Promise.reject(Boom.notFound('post not found or not readable by user', { postId }));
            }
            return post;
        });
};

module.exports.update = function (userId, swotId, postId, candidate) {

    delete candidate.author;
    delete candidate.swot;

    const query = {
        $and: [
            { swot: swotId },
            { author: userId },
            { _id: postId }
        ]
    };
    return SWOTService.read(userId, swotId)
        .then(() => Post.findOneAndUpdate(query, { $set: candidate }, { new: true }).populate('author', 'name').populate('guests', 'name').exec())
        .then((post) => {

            if (!post) {
                return Promise.reject(Boom.notFound('post not found or not writable by user', { postId }));
            }
            return post;
        });
};

module.exports.destroy = function (userId, swotId, postId) {

    const query = {
        $and: [
            { swot: swotId },
            { author: userId },
            { _id: postId }
        ]
    };
    return SWOTService.read(userId, swotId)
        .then(() => Post.findOneAndRemove(query).exec())
        .then((post) => {

            if (!post) {
                return Promise.reject(Boom.notFound('post not found or not writable by user', { postId }));
            }
            return {};
        });
};
