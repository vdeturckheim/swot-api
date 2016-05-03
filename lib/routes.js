'use strict';
const SWOTController = require('./api/swot.api');
const PostController = require('./api/post.api');

module.exports = [
    // SWOT
    { method: 'GET', path: '/swots', config: SWOTController.list },
    { method: 'POST', path: '/swots', config: SWOTController.save },
    { method: 'GET', path: '/swots/{swotId}', config: SWOTController.read },
    { method: 'PUT', path: '/swots/{swotId}', config: SWOTController.update },

    // POST
    { method: 'GET', path: '/swots/{swotId}/posts', config: PostController.list },
    { method: 'POST', path: '/swots/{swotId}/posts', config: PostController.save },
    { method: 'GET', path: '/swots/{swotId}/posts/{postId}', config: PostController.read },
    { method: 'PUT', path: '/swots/{swotId}/posts/{postId}', config: PostController.update },
    { method: 'DELETE', path: '/swots/{swotId}/posts/{postId}', config: PostController.destroy }
];
