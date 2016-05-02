'use strict';
const Routes = require('./lib/routes');

exports.register = function (server, options, next) {

    server.route(Routes);
    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
