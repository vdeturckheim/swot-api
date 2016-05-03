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
const Service = require('../../lib/services/swot.service');

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

describe('save', () => {

    it('should create a new swot', { plan: 3 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });
        return u1.save()
            .then(() => Service.save(u1._id, { name: 's1' }))
            .then(() => SWOT.find().exec())
            .then((swotList) => {

                expect(swotList).to.be.an.array();
                expect(swotList).to.have.length(1);
                expect(swotList[0].name).to.equal('s1');
            });
    });
});

describe('List', () => {

    it('should list the swot a user can see', { plan: 8 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });
        const u2 = new User({ name: 'u2', email: 'u2', password: 'u2' });

        const swot1 = new SWOT({ name: 'swot1', owner: u1._id });
        const swot2 = new SWOT({ name: 'swot2', owner: u2._id, guests: [u1._id] });

        return Promise.all([u1.save(), u2.save()])
            .then(() => Promise.all([swot1.save(), swot2.save()]))
            .then(() => Service.list(u1._id))
            .then((swotList) => {

                expect(swotList).to.be.an.array();
                expect(swotList).to.have.length(2);
                const s1 = swotList.find((s) => s.name === 'swot1');
                const s2 = swotList.find((s) => s.name === 'swot2');

                expect(s1).to.exist();
                expect(s1.owner).to.exist();
                expect(s1.owner.password).to.not.exist();
                expect(s2).to.exist();
                expect(s2.guests).to.exist();
                expect(s2.guests[0].password).to.not.exist();
            });
    });
});

describe('Read', () => {

    it('should read a swot a user can see as owner', { plan: 3 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });

        const swot1 = new SWOT({ name: 'swot1', owner: u1._id });

        return Promise.all([u1.save()])
            .then(() => Promise.all([swot1.save()]))
            .then(() => Service.read(u1._id, swot1._id))
            .then((swot) => {

                expect(swot).to.exist();
                expect(swot.name).to.equal('swot1');
                expect(swot.owner.name).to.equal('u1');
            });
    });

    it('should not read a swot a user can\t see', { plan: 1 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });

        const swot1 = new SWOT({ name: 'swot1', owner: u1._id });

        return Promise.all([u1.save()])
            .then(() => Promise.all([swot1.save()]))
            .then(() => Service.read(u1._id, Mongoose.Types.ObjectId()))
            .catch((err) => {

                expect(err.output.statusCode).to.equal(HttpStatus.NOT_FOUND);
            });
    });


    it('should read a swot a user can see as guest', { plan: 3 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });
        const u2 = new User({ name: 'u2', email: 'u2', password: 'u2' });

        const swot2 = new SWOT({ name: 'swot2', owner: u2._id, guests: [u1._id] });

        return Promise.all([u1.save(), u2.save()])
            .then(() => Promise.all([swot2.save()]))
            .then(() => Service.read(u1._id, swot2._id))
            .then((swot) => {

                expect(swot).to.exist();
                expect(swot.name).to.equal('swot2');
                expect(swot.owner.name).to.equal('u2');
            });
    });
});

describe('Update', () => {

    it('should update a swot a user can see as owner', { plan: 3 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });
        const u2 = new User({ name: 'u2', email: 'u2', password: 'u2' });


        const swot1 = new SWOT({ name: 'swot1', owner: u1._id });

        return Promise.all([u1.save(), u2.save()])
            .then(() => Promise.all([swot1.save()]))
            .then(() => Service.update(u1._id, swot1._id, { guests: [u2._id] }))
            .then((swot) => {

                expect(swot).to.exist();
                expect(swot.name).to.equal('swot1');
                expect(swot.guests[0].name).to.equal('u2');
            });
    });

    it('should not update a swot a user can\t see', { plan: 1 }, () => {

        const u1 = new User({ name: 'u1', email: 'u1', password: 'u1' });

        const swot1 = new SWOT({ name: 'swot1', owner: u1._id });

        return Promise.all([u1.save()])
            .then(() => Promise.all([swot1.save()]))
            .then(() => Service.update(u1._id, Mongoose.Types.ObjectId(), {}))
            .catch((err) => {

                expect(err.output.statusCode).to.equal(HttpStatus.NOT_FOUND);
            });
    });
});
