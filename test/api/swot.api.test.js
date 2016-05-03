'use strict';
const HttpStatus = require('http-status-codes'); // list of HTTP status
const Mongoose = require('mongoose');
const Code = require('code'); // assertion lib
const Lab = require('lab'); // test runner
const lab = exports.lab = Lab.script();

const Glue = require('glue');
const Path = require('path');

const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;
const expect = Code.expect;

require('swot-home');
const User = Mongoose.model('User');
const SWOT = require('../../lib/models/swot.model');

Mongoose.Promise = global.Promise; // Personal choice

/**
 * Connect once for all tests
 */
before(() => Mongoose.connect(`mongodb://localhost/swot-api_test_swot_service_${Date.now()}`));

beforeEach(() => {

    return User.ensureCustomIndexes();
});

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
const servOptions = { relativeTo: Path.join(__dirname, '../../') };

const getserver = function () {

    return Glue.compose(manifest, servOptions);
};

describe('list', () => {

    it('should list the swots of a user', { plan: 3 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1', token: 't' });
        const u2 = new User({ name: 'u2', email: 'u2', password: 'u2' });

        const swot1 = new SWOT({ name: 'swot1', owner: u1._id });
        const swot2 = new SWOT({ name: 'swot2', owner: u2._id, guests: [u1._id] });

        const injection = {
            method: 'GET',
            url: '/swots',
            headers: {
                authorization: 'Bearer t'
            }
        };

        return Promise.all([u1.save(), u2.save(), swot1.save(), swot2.save()])
            .then(() => getserver())
            .then((server) => server.inject(injection))
            .then((response) => {

                expect(response.statusCode).to.equal(HttpStatus.OK);
                return JSON.parse(response.payload);
            })
            .then((payload) => {

                expect(payload).to.be.an.array();
                expect(payload).to.have.length(2);
            });
    });
});

describe('save', () => {

    it('should save a new swot', { plan: 3 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1', token: 't' });
        const u2 = new User({ name: 'u2', email: 'u2', password: 'u2' });

        const injection = {
            method: 'POST',
            url: '/swots',
            headers: {
                authorization: 'Bearer t'
            },
            payload: {
                name: 's1'
            }
        };

        return Promise.all([u1.save(), u2.save()])
            .then(() => getserver())
            .then((server) => server.inject(injection))
            .then((response) => {

                expect(response.statusCode).to.equal(HttpStatus.CREATED);
                return JSON.parse(response.payload);
            })
            .then((payload) => {

                expect(payload).to.be.an.object();
                expect(payload._id).to.exist();
            });
    });
});

describe('read', () => {

    it('should read a swot of a user', { plan: 3 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1', token: 't' });
        const u2 = new User({ name: 'u2', email: 'u2', password: 'u2' });

        const swot1 = new SWOT({ name: 'swot1', owner: u1._id });
        const swot2 = new SWOT({ name: 'swot2', owner: u2._id, guests: [u1._id] });

        const injection = {
            method: 'GET',
            url: `/swots/${swot1._id}`,
            headers: {
                authorization: 'Bearer t'
            }
        };

        return Promise.all([u1.save(), u2.save(), swot1.save(), swot2.save()])
            .then(() => getserver())
            .then((server) => server.inject(injection))
            .then((response) => {

                expect(response.statusCode).to.equal(HttpStatus.OK);
                return JSON.parse(response.payload);
            })
            .then((payload) => {

                expect(payload).to.be.an.object();
                expect(payload._id + '').to.equal(swot1._id + '');
            });
    });
});

describe('update', () => {

    it('should update a swot of a user', { plan: 5 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1', token: 't' });
        const u2 = new User({ name: 'u2', email: 'u2', password: 'u2' });

        const swot1 = new SWOT({ name: 'swot1', owner: u1._id });
        const swot2 = new SWOT({ name: 'swot2', owner: u2._id, guests: [u1._id] });

        const injection = {
            method: 'PUT',
            url: `/swots/${swot1._id}`,
            headers: {
                authorization: 'Bearer t'
            },
            payload: {
                guests: [u2._id]
            }
        };

        return Promise.all([u1.save(), u2.save(), swot1.save(), swot2.save()])
            .then(() => getserver())
            .then((server) => server.inject(injection))
            .then((response) => {

                expect(response.statusCode).to.equal(HttpStatus.OK);
                return JSON.parse(response.payload);
            })
            .then((payload) => {

                expect(payload).to.be.an.object();
                expect(payload._id + '').to.equal(swot1._id + '');
                expect(payload.guests).to.be.an.array();
                expect(payload.guests).to.have.length(1);
            });
    });
});
