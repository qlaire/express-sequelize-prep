let request = require('supertest');
let app = require('../app');
let Tweet = require('../models/tweet');
let agent = request.agent(app);
let db = require('../models/database');
let chai = require('chai');
let expect = chai.expect;
let Promise = require('bluebird');
chai.use(require('chai-things'));

xdescribe('Tweet Routes', function () {
    before(function () {
        return db.sync({force: true});
    });

    describe('GET /tweets', function () {
        it('responds with an array of all tweets', function () {
            return agent.get('/tweets')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(function (res) {
                expect(res.body).to.be.an.instanceOf(Array);
                expect(res.body).to.have.lengthOf(0);
            })
        });

        it('returns tweets if there are any in the database', function () {
            return Tweet.create({
                text: 'Testing 1, 2, 3'
            })
            .then(function (tweet) {
                return agent
                .get('/tweets')
                .expect(200)
                .expect(function (res) {
                    expect(res.body).to.be.an.instanceOf(Array);
                    expect(res.body).to.include.a.thing.with.property('text', tweet.text);
                });
            });
        });

        it('returns the proper hashtagged tweets if a query is included', function () {
            return Promise.all([
                Tweet.create({
                    text: 'Tweet 1 #awesome #getSwoll'
                }),
                Tweet.create({
                    text: 'Tweet 2 #getSwoll #getLimber'
                }),
                Tweet.create({
                    text: 'Tweet 3 #awesome #getLimber'
                })
            ])
            .then(function () {
                return agent
                .get('/tweets?hashtag=getSwoll')
                .expect(200)
                .expect(function (res) {
                    expect(res.body).to.have.lengthOf(2);
                    expect(res.body).to.not.include.a.thing.with.property('text', 'Tweet 3 #awesome #getLimber');
                });
            });
        });
    });

    describe('GET /tweets/:id', function () {
        let tweet;
        before(function () {
            tweet = Tweet.build({
                text: 'This is a test #prep #express #sequelize'
            });
            return tweet.save();
        });

        it('returns the JSON of the article based on the id', function () {
            return agent
            .get('/tweets/'+tweet.id)
            .expect(200)
            .expect(function (res) {
                expect(res.body.text).to.equal(tweet.text);
            });
        });
    });

    describe('POST /tweets', function () {
        it('creates a new tweet', function () {
            return agent
            .post('/tweets')
            .send({text: 'Awesome new tweet'})
            .expect(201)
            .expect(function (res) {
            expect(res.body.id).to.not.be.an('undefined');
            expect(res.body.text).to.equal('Awesome new tweet');
            });
        });

        it('saves the article to the DB', function () {
            return Tweet.findOne({ where: { text: 'Awesome new tweet' } })
            .then(function (article) {
                expect(article).to.exist;
            });
        });
    });

    describe('PUT /tweets/:id', function () {
        let tweet;
        before(function () {
            return Tweet.findOne({ where: { text: 'Awesome new tweet' } })
            .then(function (_tweet) {
                tweet = _tweet;
            });
        });

        it('updates a tweet by running timeWarp', function () {
            return agent
            .put('/tweets/'+tweet.id)
            .expect(200)
            .expect(function (res) {
                let date = new Date(res.body.dateCreated);
                expect(date).to.not.equal(tweet.dateCreated);
                expect(date.getFullYear()).to.equal(1975);
            })
        });

        it('saves the update', function () {
            return Tweet.findById(tweet.id)
            .then(function (tweet) {
                expect(tweet).to.exist;
                expect(tweet.dateCreated.getFullYear()).to.equal(1975);
            })
        })
    })
});