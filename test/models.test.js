let chai = require('chai');
let expect = chai.expect;
let models = require('../models');
let User = models.User;
let Tweet = models.Tweet;
let db = require('../models/database');
let Promise = require('bluebird');
chai.use(require('chai-things'));

before(function () {
    return db.sync({force: true});
});
let json;
before(function () {
    return User.create({
        name: 'Json Unger'
    })
    .then(function (j) {
        json = j;
    })
});
let noPats;
before(function () {
    return Promise.all([
        Tweet.create({
            text: 'Let\'s go Patriots! #nfl #football'
        }),
        Tweet.create({
            text: 'Patriots suck #nfl #nyc'
        })
    ])
    .spread(function (p, np) {
        noPats = np;
    });
});

let mainTweetText = 'Hello world! This is my first tweet and I am pumped! #awesome #stellar #omg';

describe('Tweet Model', function () {

    describe('Attributes', function () {
        it('has a text field of type String', function () {
            return Tweet.create({
                text: mainTweetText
            })
            .then(function (savedTweet) {
                expect(savedTweet.text).to.equal(mainTweetText);
            })
        });

        it('requires text', function () {
            let tweet = Tweet.build({});
            return tweet.validate()
            .then(function (result) {
                expect(result).to.be.an('object');
                expect(result.message).to.contain('text cannot be null');
            })
        });

        it('ensures tweets are no longer than 140 characters', function () {
            let longText = 'This is a really long tweet to showcase that tweets should not be more than 140 characters long. I\'ve run out of things to say so goodbye now!';
            let longTweet = Tweet.build({
                text: longText
            });
            let normalTweet = Tweet.build({
                text: 'This is a short tweet'
            })
            return Promise.all([longTweet.validate(), normalTweet.validate()])
            .spread(function (longErr, normalErr) {
                expect(longErr).to.be.an('object');
                expect(longErr.errors).to.include.a.thing.with.property('message','Validation len failed');
                expect(normalErr).to.be.null;
            })
        });
    });
    
    xdescribe('Additional Model Properties', function () {
        it('has a virtual array of hashtags included in the tweet', function () {
            return Tweet.findOne({ where: { text: mainTweetText } })
            .then(function (tweet) {
                expect(tweet.text).to.equal(mainTweetText);
                expect(tweet.hashtags).to.have.lengthOf(3);
                expect(tweet.hashtags).to.include('#awesome');
            })
        });

        it('has an instance method to make tweets seem created long ago', function () {
            return Tweet.findOne({ where: { text: 'Let\'s go Patriots! #nfl #football' } })
            .then(function (pats) {
                expect(pats.dateCreated.getFullYear()).to.equal(2016);
                return pats.timeWarp();
            })
            .then(function (newPats) {
                expect(newPats.dateCreated.getFullYear()).to.equal(1975);
            });
        });

        it('has a class method which searches by hashtag', function () {
            return Tweet.findByHashtag('#nfl')
            .then(function (tweets) {
                expect(tweets).to.have.lengthOf(2);
                expect(tweets).to.include.a.thing.with.property('text','Patriots suck #nfl #nyc');
            })
        });
    });

    xdescribe('Relations/Associations', function () {
        it('belongs to a user', function () {
            return noPats.setUser(json)
            .then(function () {
                return Tweet.findOne({ where: { text: noPats.text }, include: { model: User } });
            })
            .then(function (tweet) {
                expect(tweet.User).to.exist;
                expect(tweet.User.name).to.equal('Json Unger');
            });
        });
    });
});
