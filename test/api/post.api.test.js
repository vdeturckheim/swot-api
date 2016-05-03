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
const Post = require('../../lib/models/post.model');

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

    it('should list the posts of a swot', { plan: 3 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1', token: 't' });
        const swot1 = new SWOT({ name: 'swot1', owner: u1._id });
        const post = new Post({ text: 'p1', author: u1._id, swot: swot1._id, category: 'S' });

        const injection = {
            method: 'GET',
            url: `/swots/${swot1._id}/posts`,
            headers: {
                authorization: 'Bearer t'
            }
        };

        return Promise.all([u1.save(), swot1.save(), post.save()])
            .then(() => getserver())
            .then((server) => server.inject(injection))
            .then((response) => {

                expect(response.statusCode).to.equal(HttpStatus.OK);
                return JSON.parse(response.payload);
            })
            .then((payload) => {

                expect(payload).to.be.an.array();
                expect(payload).to.have.length(1);
            });
    });
});

describe('save', () => {

    it('should create a post in a swot', { plan: 3 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1', token: 't' });
        const swot1 = new SWOT({ name: 'swot1', owner: u1._id });

        const injection = {
            method: 'POST',
            url: `/swots/${swot1._id}/posts`,
            headers: {
                authorization: 'Bearer t'
            },
            payload: {
                text: 'p1',
                category: 'S'
            }
        };

        return Promise.all([u1.save(), swot1.save()])
            .then(() => getserver())
            .then((server) => server.inject(injection))
            .then((response) => {

                expect(response.statusCode).to.equal(HttpStatus.CREATED);
            })
            .then(() => Post.find().exec())
            .then((postList) => {

                expect(postList).to.be.an.array();
                expect(postList).to.have.length(1);
            });
    });
});

describe('read', () => {

    it('should read a post in a swot', { plan: 3 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1', token: 't' });
        const swot1 = new SWOT({ name: 'swot1', owner: u1._id });
        const post = new Post({ text: 'p1', author: u1._id, swot: swot1._id, category: 'S' });


        const injection = {
            method: 'GET',
            url: `/swots/${swot1._id}/posts/${post._id}`,
            headers: {
                authorization: 'Bearer t'
            }
        };

        return Promise.all([u1.save(), swot1.save(), post.save()])
            .then(() => getserver())
            .then((server) => server.inject(injection))
            .then((response) => {

                expect(response.statusCode).to.equal(HttpStatus.OK);
                return JSON.parse(response.payload);
            })
            .then((postFound) => {

                expect(postFound).to.exist();
                expect(postFound.text).to.equal('p1');
            });
    });
});


describe('update', () => {

    it('should update a post in a swot', { plan: 3 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1', token: 't' });
        const swot1 = new SWOT({ name: 'swot1', owner: u1._id });
        const post = new Post({ text: 'p1', author: u1._id, swot: swot1._id, category: 'S' });


        const injection = {
            method: 'PUT',
            url: `/swots/${swot1._id}/posts/${post._id}`,
            headers: {
                authorization: 'Bearer t'
            },
            payload: {
                text: 'p1 updated'
            }
        };

        return Promise.all([u1.save(), swot1.save(), post.save()])
            .then(() => getserver())
            .then((server) => server.inject(injection))
            .then((response) => {

                expect(response.statusCode).to.equal(HttpStatus.OK);
            })
            .then(() => Post.findById(post._id).exec())
            .then((postFound) => {

                expect(postFound).to.exist();
                expect(postFound.text).to.equal('p1 updated');
            });
    });
});

describe('destroy', () => {

    it('should destroy a post in a swot', { plan: 3 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1', token: 't' });
        const swot1 = new SWOT({ name: 'swot1', owner: u1._id });
        const post = new Post({ text: 'p1', author: u1._id, swot: swot1._id, category: 'S' });


        const injection = {
            method: 'DELETE',
            url: `/swots/${swot1._id}/posts/${post._id}`,
            headers: {
                authorization: 'Bearer t'
            }
        };

        return Promise.all([u1.save(), swot1.save(), post.save()])
            .then(() => getserver())
            .then((server) => server.inject(injection))
            .then((response) => {

                expect(response.statusCode).to.equal(HttpStatus.OK);
            })
            .then(() => Post.find().exec())
            .then((postList) => {

                expect(postList).to.be.an.array();
                expect(postList).to.have.length(0);
            });
    });
});

