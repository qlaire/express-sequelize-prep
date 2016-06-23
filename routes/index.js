let router = require('express').Router();
let models = require('../models/');
let Tweet = models.Tweet;

module.exports = router;

router.get('/tweets', function (req, res, next) {
  if (req.query.hashtag) {
    Tweet.findByHashtag(req.query.hashtag)
    .then(function (tweets) {
      res.json(tweets);
    })
    .catch(next);
  } else {
    Tweet.findAll({})
    .then(function (tweets) {
      res.json(tweets);
    })
    .catch(next);
  }
});

/*
The following two middleware accomplish the same goal as the single middleware above, taking advantage of `next`.
When a request without a query enters the first middleware, it will enter the if block and hit the next call.
This triggers it to find the next `get` middleware to that route, in this case the one that just grabs all tweets.

  /tweets?hashtag=getSwoll&hello=world ====> req.query = {hashtag: 'getSwoll', hello: 'world'}
  router.get('/tweets', function (req,res,next) {
    if (!req.query.hashtag) {
      return next();
    }
    Tweet.findByHashtag(req.query.hashtag)
    .then(function (tweets) {
      res.json(tweets);
    })
    .catch(next);
  })

  router.get('/tweets', function (req,res,next) {
    Tweet.findAll({})
      .then(function (tweets) {
        res.json(tweets);
      })
      .catch(next);
  })

*/

router.get('/tweets/:id', function (req, res, next) {
  // Tweet.findOne({ where: { id: req.params.id } }) // Searches for a single instance which matches the query
  Tweet.findById(req.params.id) // Searches for a single instance by its primary key
  .then(function (tweet) {
    res.json(tweet);
  })
  .catch(next);
});

/*

  var preSaveInstance = Model.build({ *attributes* }); ==> Does not go through any validation or hooks, but getters and setters are available.
  preSaveInstance.save() ==> Instance goes through validation and hooks and is saved to the database, returns a promise

  Model.create({ *attributes* }) ==> Does it all in one fell swoop, returns a promise

*/

router.post('/tweets', function (req, res, next) {
  // var tweet = Tweet.build(req.body);
  // tweet.save()
  Tweet.create(req.body)
  .then(function (tweet) {
    res.status(201).json(tweet);
  })
  .catch(next);
});

router.put('/tweets/:id', function (req, res, next) {
  Tweet.findById(req.params.id)
  .then(function (tweet) {
    return tweet.timeWarp();
  })
  .then(function (updatedTweet) {
    res.json(updatedTweet);
  })
  .catch(next);
});
