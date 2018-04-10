var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorite = require('../models/favorites');
var Dish = require('../models/dishes');
var Verify = require('./verify');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .get(Verify.verifyOrdinaryUser,function (req, res, next) {
       console.log(req.decoded._id);
       console.log();
        Favorite.find({'postedBy': req.decoded._id})
            .populate("dishes")
            .exec(function (err, favorite) {
                if (err) next(err);
            console.log(favorite[0]);
                res.json(favorite[0]);
            });
    })

    .post(Verify.verifyOrdinaryUser,function (req, res, next) {

        Favorite.find({'postedBy': req.decoded._id})
            .exec(function (err, favorites) {
                if (err) next(err);
                req.body.postedBy = req.decoded._id;

                if (favorites.length) {
                    var favoriteAlreadyExist = false;
                    if (favorites[0].dishes.length) {
                        for (var i = (favorites[0].dishes.length - 1); i >= 0; i--) {
                            favoriteAlreadyExist = favorites[0].dishes[i] == req.body._id;
                            if (favoriteAlreadyExist) break;
                        }
                    }
                    if (!favoriteAlreadyExist) {
                        favorites[0].dishes.push(req.body._id);
                        favorites[0].save(function (err, favorite) {
                            if (err) throw err;
                            console.log('Um somethings up!');
                            res.json(favorite);
                        });
                    } else {
                        console.log('Setup!');
                        res.json(favorites);
                    }

                } else {

                    Favorite.create({postedBy: req.body.postedBy}, function (err, favorite) {
                        if (err) next(err);
                        favorite.dishes.push(req.body._id);
                        favorite.save(function (err, favorite) {
                            if (err) next(err);
                            console.log('Something is up!');
                            res.json(favorite);
                        });
                    })
                }
            });
    })

    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        Favorite.remove({'postedBy': req.decoded._id}, function (err, resp) {
            if (err) throw err;
            res.json(resp);
        })
    });

favoriteRouter.route('/:dishId')
    .delete(Verify.verifyOrdinaryUser,function (req, res, next) {

        Favorite.find({'postedBy': req.decoded._id}, function (err, favorites) {
            if (err) return err;
            var favorite = favorites ? favorites[0] : null;

            if (favorite) {
                for (var i = (favorite.dishes.length - 1); i >= 0; i--) {
                    if (favorite.dishes[i] == req.params.dishId) {
                        favorite.dishes.remove(req.params.dishId);
                    }
                }
                favorite.save(function (err, favorite) {
                    if (err) throw err;
                    console.log('Here you go!');
                    res.json(favorite);
                });
            } else {
                console.log('No favourites!');
                res.json(favorite);
            }

        });
    });

module.exports = favoriteRouter;