'use strict';
const Mongoose = require('mongoose');
const Code = require('code'); // assertion lib
const Lab = require('lab'); // test runner
const lab = exports.lab = Lab.script();

const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

const before = lab.before;
const after = lab.after;
// const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;

const Glue = require('glue');
const Path = require('path');

Mongoose.Promise = global.Promise; // Personal choice

/**
 * Connect once for all tests
 */
before(() => Mongoose.connect(`mongodb://localhost/swot-home_test_auth_service_${Date.now()}`));

/**
 * Disconnect after all tests
 */
after(() => Mongoose.disconnect());

/**
 * Get a clean db for each test
 */
afterEach((done) => {

    Mongoose.connection.db.dropDatabase();
    done();
});

describe('Plugin', () => {

    it('should register to a server', { plan: 1 }, () => {

        const manifest = {
            server: {},
            connections: [{ port: 3000 }],
            registrations: [
                {
                    plugin: {
                        register: 'swot-home'
                    }
                },
                {
                    plugin: {
                        register: './'
                    }
                }
            ]
        };
        const servOptions = { relativeTo: Path.join(__dirname, '../') };

        return Glue.compose(manifest, servOptions)
            .then((server) => {

                expect(server).to.exist();
            });
    });
});
