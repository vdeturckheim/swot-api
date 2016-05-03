'use strict';
const Joi = require('joi');
const Service = require('../services/post.service');
const HttpStatus = require('http-status-codes');

// { method: 'GET', path: '/swots/{swotId}/posts', config: PostController.list },
module.exports.list = {
    description: 'list posts of a swot',
    tags: ['swot', 'post'],
    validate: {
        params: {
            swotId: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        }
    },
    handler: function (request, reply) {

        const user = request.auth.credentials;
        request.log(['swot', 'post', 'list'], `list posts of swot ${request.params.swotId} as ${user._id}`);
        return reply(Service.list(user._id, request.params.swotId));
    }
};

// { method: 'POST', path: '/swots/{swotId}/posts', config: PostController.save },
module.exports.save = {
    description: 'create a post in a swot',
    tags: ['swot', 'post'],
    validate: {
        params: {
            swotId: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        },
        payload: {
            text: Joi.string().min(2).required(),
            author: Joi.any().forbidden(),
            guests: Joi.array().items(Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)).default([]),
            swot: Joi.any().forbidden(),
            category: Joi.string().valid(['S', 'W', 'O', 'T']).required()
        }
    },
    handler: function (request, reply) {

        const user = request.auth.credentials;
        request.log(['swot', 'post', 'create'], `create post of swot ${request.params.swotId} as ${user._id}`);
        return Service.save(user._id, request.params.swotId, request.payload)
            .then((res) => reply(res).code(HttpStatus.CREATED))
            .catch(reply);

    }
};

// { method: 'GET', path: '/swots/{swotId}/posts/{postId}', config: PostController.read },
module.exports.read = {
    description: 'read a post of a swot',
    tags: ['swot', 'post'],
    validate: {
        params: {
            swotId: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i),
            postId: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        }
    },
    handler: function (request, reply) {

        const user = request.auth.credentials;
        request.log(['swot', 'post', 'read'], `read post ${request.params.postId} of swot ${request.params.swotId} as ${user._id}`);
        return reply(Service.read(user._id, request.params.swotId, request.params.postId));
    }
};

// { method: 'PUT', path: '/swots/{swotId}/posts/{postId}', config: PostController.update },
module.exports.update = {
    description: 'update a post in a swot',
    tags: ['swot', 'post'],
    validate: {
        params: {
            swotId: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i),
            postId: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        },
        payload: {
            text: Joi.string().min(2).optional(),
            author: Joi.any().forbidden(),
            guests: Joi.array().items(Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)).optional(),
            swot: Joi.any().forbidden(),
            category: Joi.string().valid(['S', 'W', 'O', 'T']).optional()
        }
    },
    handler: function (request, reply) {

        const user = request.auth.credentials;
        request.log(['swot', 'post', 'update'], `update post ${request.params.postId} of swot ${request.params.swotId} as ${user._id}`);
        return reply(Service.update(user._id, request.params.swotId, request.params.postId, request.payload));
    }
};

// { method: 'DELETE', path: '/swots/{swotId}/posts/{postId}', config: PostController.destroy }
module.exports.destroy = {
    description: 'remove post from a swot',
    tags: ['swot', 'post'],
    validate: {
        params: {
            swotId: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i),
            postId: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)
        }
    },
    handler: function (request, reply) {

        const user = request.auth.credentials;
        request.log(['swot', 'post', 'destroy'], `destroy post ${request.params.postId} of swot ${request.params.swotId} as ${user._id}`);
        return reply(Service.destroy(user._id, request.params.swotId, request.params.postId));
    }
};
