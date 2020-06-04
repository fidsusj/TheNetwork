
let express = require('express');
let router = express.Router();
let Database = require('../../classes/Database');

router.get('/', (req, res) => {
    res.send('Hello World!');
});

router.get('/getAllSkills', (req, res) => {
    console.log('Client (token: ' + req.query.token + ') tries to fetch all skills ...');

    Database.getInstance().getAllSkills(function (result) {
        res.send(result);
    })


});

module.exports = router;

