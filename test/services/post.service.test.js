'use strict';
const HttpStatus = require('http-status-codes'); // list of HTTP status
const Mongoose = require('mongoose');
const Code = require('code'); // assertion lib
const Lab = require('lab'); // test runner
const lab = exports.lab = Lab.script();

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
const Service = require('../../lib/services/post.service');

Mongoose.Promise = global.Promise; // Personal choice

/**
 * Connect once for all tests
 */
before(() => Mongoose.connect(`mongodb://localhost/swot-api_test_post_service_${Date.now()}`));

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

describe('save', () => {

    it('should save a new post in existing swot', { plan: 3 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });
        const swot1 = new SWOT({ name: 'swot1', owner: u1._id });

        const candidate = { text: 'p1', category: 'S' };

        return Promise.all([u1.save(), swot1.save()])
            .then(() => Service.save(u1._id, swot1._id, candidate))
            .then(() => Post.find().exec())
            .then((postList) => {

                expect(postList).to.be.an.array();
                expect(postList).to.have.length(1);

                return postList[0];
            })
            .then((post) => {

                expect(post.author + '').to.equal(u1._id + '');
            });
    });
});

describe('list', () => {

    it('should list the posts created by the user in existing swot', { plan: 7 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });
        const swot1 = new SWOT({ name: 'swot1', owner: u1._id });
        const post1 = new Post({ text: 'p1', author: u1._id, swot: swot1._id, category: 'S' });

        return Promise.all([u1.save(), swot1.save(), post1.save()])
            .then(() => Service.list(u1._id, swot1._id))
            .then((postList) => {

                expect(postList).to.be.an.array();
                expect(postList).to.have.length(1);
                expect(postList[0].author).to.exist();
                return postList[0].author;
            })
            .then((author) => {

                expect(author._id).to.exist();
                expect(author.name).to.exist();
                expect(author.password).to.not.exist();
                expect(author.email).to.not.exist();
            });
    });

    it('should list the posts in existing swot as guest', { plan: 7 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });
        const u2 = new User({ name: 'u2', email: 'u2', password: 'u2' });
        const swot1 = new SWOT({ name: 'swot1', owner: u1._id, guests: [u2._id] });
        const post1 = new Post({ text: 'p1', author: u1._id, swot: swot1._id, category: 'S', guests: [u2._id] });

        return Promise.all([u1.save(), swot1.save(), post1.save()])
            .then(() => Service.list(u2._id, swot1._id))
            .then((postList) => {

                expect(postList).to.be.an.array();
                expect(postList).to.have.length(1);
                expect(postList[0].author).to.exist();
                return postList[0].author;
            })
            .then((author) => {

                expect(author._id).to.exist();
                expect(author.name).to.exist();
                expect(author.password).to.not.exist();
                expect(author.email).to.not.exist();
            });
    });
});

describe('read', () => {

    it('should read a post created by the user in existing swot', { plan: 6 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });
        const swot1 = new SWOT({ name: 'swot1', owner: u1._id });
        const post1 = new Post({ text: 'p1', author: u1._id, swot: swot1._id, category: 'S' });

        return Promise.all([u1.save(), swot1.save(), post1.save()])
            .then(() => Service.read(u1._id, swot1._id, post1._id))
            .then((post) => {

                expect(post).to.be.an.object();
                expect(post.author).to.exist();
                return post.author;
            })
            .then((author) => {

                expect(author._id).to.exist();
                expect(author.name).to.exist();
                expect(author.password).to.not.exist();
                expect(author.email).to.not.exist();
            });
    });

    it('should not read a post created by the user in existing swot but not shared', { plan: 2 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });
        const u2 = new User({ name: 'u2', email: 'u2', password: 'u2' });
        const swot1 = new SWOT({ name: 'swot1', owner: u1._id, guests: [u2._id] });
        const post1 = new Post({ text: 'p1', author: u1._id, swot: swot1._id, category: 'S' });

        return Promise.all([u1.save(), swot1.save(), post1.save()])
            .then(() => Service.read(u2._id, swot1._id, post1._id))
            .catch((err) => {

                expect(err).to.exist();
                expect(err.output.statusCode).to.equal(HttpStatus.NOT_FOUND);
            });
    });

    it('should read a post created by another user in existing swot', { plan: 8 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });
        const u2 = new User({ name: 'u2', email: 'u2', password: 'u2' });
        const swot1 = new SWOT({ name: 'swot1', owner: u1._id, guests: [u2._id] });
        const post1 = new Post({ text: 'p1', author: u1._id, swot: swot1._id, category: 'S', guests: [u2._id] });

        return Promise.all([u1.save(), u2.save(), swot1.save(), post1.save()])
            .then(() => Service.read(u2._id, swot1._id, post1._id))
            .then((post) => {

                expect(post).to.be.an.object();
                expect(post.author).to.exist();
                expect(post.guests[0].name).to.equal('u2');
                expect(post.guests[0].password).to.not.exist();
                return post.author;
            })
            .then((author) => {

                expect(author._id).to.exist();
                expect(author.name).to.exist();
                expect(author.password).to.not.exist();
                expect(author.email).to.not.exist();
            });
    });

    it('should not read a post that does not exist in existing swot', { plan: 2 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });
        const u2 = new User({ name: 'u2', email: 'u2', password: 'u2' });
        const swot1 = new SWOT({ name: 'swot1', owner: u1._id, guests: [u2._id] });
        const post1 = new Post({ text: 'p1', author: u1._id, swot: swot1._id, category: 'S', guests: [u2._id] });

        return Promise.all([u1.save(), u2.save(), post1.save()])
            .then(() => Service.read(u2._id, swot1._id, post1._id))
            .catch((err) => {

                expect(err).to.exist();
                expect(err.output.statusCode).to.equal(HttpStatus.NOT_FOUND);
            });
    });
});

describe('update', () => {

    it('should update a post', { plan: 2 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });
        const u2 = new User({ name: 'u2', email: 'u2', password: 'u2' });
        const swot1 = new SWOT({ name: 'swot1', owner: u1._id, guests: [u2._id] });
        const post1 = new Post({ text: 'p1', author: u1._id, swot: swot1._id, category: 'S', guests: [u2._id] });

        return Promise.all([u1.save(), u2.save(), swot1.save(), post1.save()])
            .then(() => Service.update(u1._id, swot1._id, post1._id, { text: 'p1 updated' }))
            .then(() => Post.findById(post1._id).exec())
            .then((post) => {

                expect(post).to.exist();
                expect(post.text).to.equal('p1 updated');
            });
    });

    it('should not update a post', { plan: 4 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });
        const u2 = new User({ name: 'u2', email: 'u2', password: 'u2' });
        const swot1 = new SWOT({ name: 'swot1', owner: u1._id, guests: [u2._id] });
        const post1 = new Post({ text: 'p1', author: u1._id, swot: swot1._id, category: 'S', guests: [u2._id] });

        return Promise.all([u1.save(), u2.save(), swot1.save(), post1.save()])
            .then(() => Service.update(u2._id, swot1._id, post1._id, { text: 'p1 updated' }))
            .catch((err) => {

                expect(err).to.exist();
                expect(err.output.statusCode).to.equal(HttpStatus.NOT_FOUND);
            })
            .then(() => Post.findById(post1._id).exec())
            .then((post) => {

                expect(post).to.exist();
                expect(post.text).to.equal('p1');
            });
    });
});

describe('delete', () => {

    it('should delete a post', { plan: 1 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });
        const u2 = new User({ name: 'u2', email: 'u2', password: 'u2' });
        const swot1 = new SWOT({ name: 'swot1', owner: u1._id, guests: [u2._id] });
        const post1 = new Post({ text: 'p1', author: u1._id, swot: swot1._id, category: 'S', guests: [u2._id] });

        return Promise.all([u1.save(), u2.save(), swot1.save(), post1.save()])
            .then(() => Service.destroy(u1._id, swot1._id, post1._id))
            .then(() => Post.findById(post1._id).exec())
            .then((post) => {

                expect(post).to.not.exist();
            });
    });

    it('should not delete a post', { plan: 4 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });
        const u2 = new User({ name: 'u2', email: 'u2', password: 'u2' });
        const swot1 = new SWOT({ name: 'swot1', owner: u1._id, guests: [u2._id] });
        const post1 = new Post({ text: 'p1', author: u1._id, swot: swot1._id, category: 'S', guests: [u2._id] });

        return Promise.all([u1.save(), u2.save(), swot1.save(), post1.save()])
            .then(() => Service.destroy(u2._id, swot1._id, post1._id))
            .catch((err) => {

                expect(err).to.exist();
                expect(err.output.statusCode).to.equal(HttpStatus.NOT_FOUND);
            })
            .then(() => Post.findById(post1._id).exec())
            .then((post) => {

                expect(post).to.exist();
                expect(post.text).to.equal('p1');
            });
    });
});

