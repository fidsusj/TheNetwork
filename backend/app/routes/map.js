let express = require('express');
let router = express.Router();
let userModel = require('../models/user_model');
let XmlBuilder = require('../../classes/XmlBuilder');
let Database = require('../../classes/Database');

router.get('/getMap', (req, res) => {
    console.log('Client (token: ' + req.query.token + ') tries to fetch map xml ...');

    userModel.validateToken(req.query.token, function (result) {
        if (result.result) {
            console.log('Users token (user: ' + result.result.Name + ' ' + result.result.Surname + '; token: ' + req.query.token + ') is valid.');
            XmlBuilder.getInstance().buildMap(result.result.UserID, function (xmlResult) {
                res.send(xmlResult);
            });
        } else {
            res.send(result.message);
        }
    });
});

router.get('/getMapOfUser', (req, res) => {
    console.log('Client (token: ' + req.query.token + ') tries to fetch map xml from user-id ' + req.query.userId + ' ...');

    userModel.validateToken(req.query.token, function (tokenResult) {
        if (tokenResult.result) {
            Database.getInstance().getUserToUserConnection(tokenResult.result.UserID, req.query.userId, function (connectionResult) {
                if (connectionResult !== false && connectionResult.length > 0) {
                    XmlBuilder.getInstance().buildForeignMap(tokenResult.result.UserID, req.query.userId, function (xmlResult) {
                        res.send(xmlResult);
                    });
                } else {
                    res.send({
                        status: "error",
                        message: "User has no connection to given user, so he cannot access on his network."
                    });
                }
            });
        } else {
            res.send(tokenResult);
        }
    });
});

module.exports = router;