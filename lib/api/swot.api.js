'use strict';
const Joi = require('joi');
const Service = require('../services/swot.service');
const HttpStatus = require('http-status-codes');

// { method: 'GET', path: '/swots', config: SWOTController.list },
module.exports.list = {
    description: 'list swots readable by a user',
    tags: ['swot'],
    handler: function (request, reply) {

        const user = request.auth.credentials;
        request.log(['swot', 'list'], `List swot as ${user._id}`);
        return reply(Service.list(user._id));
    }
};

// { method: 'POST', path: '/swots', config: SWOTController.save },
module.exports.save = {
    description: 'create a new swot',
    tags: ['swot'],
    validate: {
        payload: {
            name: Joi.string().min(2).required(),
            guests: Joi.array().items(Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)).default([]),
            owner: Joi.any().forbidden(),
            _id: Joi.any().forbidden()
        }
    },
    handler: function (request, reply) {

        const user = request.auth.credentials;
        request.log(['swot', 'create'], `create swot as ${user._id}`);
        return Service.save(user._id, request.payload)
            .then((res) => reply(res).code(HttpStatus.CREATED))
            .catch(reply);
    }
};


// { method: 'GET', path: '/swots/{swotId}', config: SWOTController.read },
module.exports.read = {
    description: 'read a swot readable by a user',
    tags: ['swot'],
    validate: {
        params: {
            swotId: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        }
    },
    handler: function (request, reply) {

        const user = request.auth.credentials;
        request.log(['swot', 'read'], `read swot ${request.params.swotId} as ${user._id}`);
        return reply(Service.read(user._id, request.params.swotId));
    }
};

// { method: 'PUT', path: '/swots/{swotId}', config: SWOTController.update },
module.exports.update = {
    description: 'update a swot',
    tags: ['swot'],
    validate: {
        params: {
            swotId: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        },
        payload: {
            name: Joi.string().min(2).optional(),
            guests: Joi.array().items(Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)).optional(),
            owner: Joi.any().forbidden(),
            _id: Joi.any().forbidden()
        }
    },
    handler: function (request, reply) {

        const user = request.auth.credentials;
        request.log(['swot', 'create'], `updates swot ${request.params.swotId} as ${user._id}`);
        return reply(Service.update(user._id, request.params.swotId, request.payload));
    }
};

