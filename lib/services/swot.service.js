'use strict';
const Boom = require('boom');
const SWOT = require('../models/swot.model');

module.exports.save = function (ownerId, candidate) {

    candidate.owner = ownerId;
    const swot = new SWOT(candidate);
    return swot.save()
        .then(() => swot);
};

module.exports.list = function (userId) {

    return SWOT.find({ $or: [{ owner: userId }, { guests: userId }] })
        .populate('owner', 'name')
        .populate('guests', 'name')
        .exec();
};

module.exports.read = function (userId, swotId) {

    return SWOT.findOne({ $and: [{ $or: [{ owner: userId }, { guests: userId }] }, { _id: swotId }] })
        .populate('owner', 'name').populate('guests', 'name').exec()
        .then((swot) => {

            if (!swot) {
                return Promise.reject(Boom.notFound('swot not found or not shared with you'));
            }
            return swot;
        });
};

module.exports.update = function (userId, swotId, candidate) {

    delete candidate.owner;

    return SWOT.findOneAndUpdate({ $and: [{ owner: userId }, { _id: swotId }] }, { $set: candidate }, { new: true })
        .populate('owner', 'name').populate('guests', 'name').exec()
        .then((swot) => {

            if (!swot) {
                return Promise.reject(Boom.notFound('swot not found or not shared with you'));
            }
            return swot;
        });
};

