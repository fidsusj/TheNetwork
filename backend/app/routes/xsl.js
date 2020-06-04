let express = require('express');
let fs = require('fs');
let router = express.Router();

router.get('/getProfileImage', (req, res) => {
    var imgPath = '/var/www/html/the-network.raphael-muesseler.de/backend/profilePictures/' + req.query.userid + '.jpeg';
    var img;
    if (fs.existsSync(imgPath)) {
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        img = fs.readFileSync(imgPath);
    } else {
        res.writeHead(200, {'Content-Type': 'image/png'});
        img = fs.readFileSync('/var/www/html/the-network.raphael-muesseler.de/backend/profilePictures/unknown.png');
    }
    res.end(img);
});

module.exports = router;