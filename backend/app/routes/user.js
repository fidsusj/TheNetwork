let express = require('express');
let router = express.Router();
let formidable = require('formidable');
let path = require('path');
let fs = require('fs');
let readChunk = require('read-chunk');
let fileType = require('file-type');

let Database = require('../../classes/Database');
let Hash = require('../../classes/Hash');
let userModel = require('../models/user_model');

router.get('/login', (req, res) => {
    console.log('Client tries to log in ...');

    let token = Hash.generateRandomString(23);
    Database.getInstance().checkCredentials(req.query.email, req.query.password || "", token, function (result) {
        if (result !== false) {
            console.log(result.Name + ' ' + result.Surname + ' has successfully logged in.');
            delete result.Password;
        } else {
            console.log('Login attempt failed.');
        }
        res.send(result);
    });
});

router.get('/createUser', (req, res) => {
    console.log('User will be created ...');

    let token = Hash.generateRandomString(32);

    Database.getInstance().checkEmail(req.query.email, function (result) {
        if (result !== false) {
            res.send({status: 'error', message: 'Email already exists.'});
            console.log('Attempt to register failed: Email already exists.');
        } else {
            Database.getInstance().createUser(req.query.name, req.query.surname, req.query.email, req.query.password,
                req.query.birthday, req.query.department, token, function (result) {
                    if (result) {
                        console.log('User ' + req.query.name + ' ' + req.query.surname + ' was successfully created.');
                        res.send({
                            status: 'success',
                            message: 'User was successfully created!',
                            token: token
                        });
                    } else {
                        res.send({status: 'error', message: 'An internal server error occurred.'});
                    }
                });
        }
    })


});

router.get('/createExternalUser', (req, res) => {
    console.log('External user will be created ...');

    userModel.validateToken(req.query.token, function (tokenResult) {
        if (tokenResult.status === 'error') {
            res.send(tokenResult);
        } else {
            Database.getInstance().checkEmail(req.query.email, function (emailResult) {
                if (emailResult !== false) {
                    res.send({status: 'error', message: 'Email already exists.'});
                    console.log('Attempt to register failed: Email already exists.');
                } else {
                    Database.getInstance().createExternalUser(req.query.name, req.query.surname, req.query.email, function (result) {
                        if (result) {
                            console.log('External user ' + req.query.name + ' ' + req.query.surname + ' was successfully created.');
                            res.send({status: 'success', message: 'User was successfully created!'});
                        } else {
                            res.send({status: 'error', message: 'An internal server error occurred.'});
                        }
                    });
                }
            });
        }
    });
});

router.get('/changeUserData', (req, res) => {
    console.log('Client tries to change user data...');

    userModel.validateToken(req.query.token, function (tokenResult) {
        if (tokenResult !== false) {
            Database.getInstance().changeUserData(req.query.oldEmail, req.query.name, req.query.surname, req.query.email, req.query.birthday,
                req.query.department, function (result) {
                    if (result) {
                        if (result !== 'Email already exists!') res.send({
                            status: 'success',
                            message: 'User data was changed!'
                        });
                        else (res.send({status: 'error', message: 'Email already exists!'}))
                    } else {
                        res.send({status: 'error', message: 'An internal server error occurred.'});
                    }
                });
        } else {
            console.log('Login attempt via token failed.');
            res.send(tokenResult);
        }
    });
});

router.get('/changePassword', (req, res) => {
    console.log('Client tries to change its password...');
    userModel.validateToken(req.query.token, function (tokenResult) {
        if (tokenResult !== false) {
            Database.getInstance().changePassword(req.query.userID, req.query.password, function (result) {
                if (result) {
                    res.send({status: 'success', message: 'Password was updated!'})
                } else {
                    res.send({status: 'error', message: 'An internal server error occurred!'})
                }
            })
        } else {
            console.log('Login attempt via token failed.');
            res.send(tokenResult);
        }
    });

});

router.post('/uploadProfilePicture', (req, res) => {
    console.log(req.header.Cookie);
    var result,
        form = new formidable.IncomingForm();

    // Tells formidable that there will be multiple files sent.
    form.multiples = false;
    // Upload directory for the images
    let dir = path.join(__dirname, '/../../profilePictures');
    form.uploadDir = dir;

    // Invoked when a file has finished uploading.
    form.on('file', function (name, file) {
        var buffer = null,
            type = null,
            filename = '';

        // Read a chunk of the file.
        buffer = readChunk.sync(file.path, 0, 262);
        // Get the file type using the buffer read using read-chunk
        type = fileType(buffer);

        // Check the file type, must be either png,jpg or jpeg
        if (type !== null && (type.ext === 'png' || type.ext === 'jpg' || type.ext === 'jpeg')) {
            // Assign new file name
            filename = name + '.jpeg';

            // Move the file with the new file name
            fs.renameSync(file.path, path.join(__dirname, '/../../profilePictures/' + filename));

            result = {
                status: 'success',
                filename: filename,
                type: type.ext,
            };
        } else {
            result = {
                status: 'error',
                filename: file.name,
                message: 'Invalid file type'
            };
            fs.unlink(file.path);
        }
    });

    form.on('error', function (err) {
        console.log('Error occurred during processing - ' + err);
    });

    // Invoked when all the fields have been processed.
    form.on('end', function () {
        console.log('All the request fields have been processed.');
    });

    // Parse the incoming form fields.
    form.parse(req, function (err, fields, files) {
        res.status(200).json(result);
    });
});

router.get('/updateSkillData', (req, res) => {
    console.log('Client tries to change skill data...');
    userModel.validateToken(req.query.token, function (tokenResult) {
        if (tokenResult !== false) {
            Database.getInstance().changeSkillData(req.query.userID, req.query.skillID, req.query.level, function (result) {
                if (result === true) {
                    res.send({status: 'success', message: 'Skill connection was updated!'});
                } else {
                    if (result === false) {
                        console.log('Error while executing MYSQL-Command while change of skill connection!');
                        res.send({status: 'error', message: 'An internal server error occurred!'});
                    } else {
                        res.send({status: 'error', message: 'Skill is already connected to this user!'});
                    }
                }
            })
        } else {
            console.log('Login attempt via token failed.');
            res.send(tokenResult);
        }
    });
});

router.get('/getSkillData', (req, res) => {
    console.log('Client tries to fetch his skill data from server...');
    userModel.validateToken(req.query.token, function (tokenResult) {
        if (tokenResult !== false) {
            Database.getInstance().getSkillData(req.query.userID, function (result) {
                if (result !== false) {
                    res.send(result);
                } else {
                    res.send({status: "error", message: "An internal server error occurred!"})
                }
            })
        } else {
            console.log('Login attempt via token failed.');
            res.send(tokenResult);
        }
    });
});
router.get('/deleteSkillData', (req, res) => {
    console.log('Client tries to delete skill data...');
    userModel.validateToken(req.query.token, function (tokenResult) {
        if (tokenResult !== false) {
            Database.getInstance().deleteSkillData(req.query.userID, req.query.skillID, function (result) {
                if (result) {
                    res.send({status: "success", message: "Skill data was deleted!"})
                } else {
                    res.send({status: "error", message: "An internal server error occurred!"})
                }
            })
        } else {
            console.log('Login attempt via token failed.');
            res.send(tokenResult);
        }
    })
});

router.get('/validateToken', (req, res) => {
    console.log('Validating token ...');

    let token = Hash.generateRandomString(32);

    Database.getInstance().validateToken(req.query.token, (result) => {
        if (result !== false) {
            Database.getInstance().updateToken(result.UserID, token, function (updateResult) {
                console.log(result.Name + ' ' + result.Surname + ' has successfully logged in via token.');
                console.log('Updating users token ...');
                if (updateResult) {
                    result.Token = token;
                    delete result.Password;
                    console.log('Successfully updated token.');
                    res.send(result);
                } else {
                    console.log('Updating new token failed.');
                    res.send(false);
                }
            });
        } else {
            console.log('Login attempt via token failed.');
            res.send(result);
        }
    })
});

router.get('/searchNewContacts', (req, res) => {
    userModel.validateToken(req.query.token, function (tokenResult) {
        if (tokenResult.status === 'error') {
            res.send(tokenResult);
        } else {
            Database.getInstance().searchNewContacts(req.query.query, req.query.userId, function (result) {
                res.send(result);
            });
        }
    }, false);
});

router.get('/searchNameInContacts', (req, res) => {
    userModel.validateToken(req.query.token, function (tokenResult) {
        if (tokenResult.status === 'error') {
            res.send(tokenResult);
        } else {
            Database.getInstance().searchNameInContacts(req.query.query, req.query.userId, function (result) {
                res.send(result);
            });
        }
    }, false);
});

router.get('/searchDepartmentInContacts', (req, res) => {
    userModel.validateToken(req.query.token, function (tokenResult) {
        if (tokenResult.status === 'error') {
            res.send(tokenResult);
        } else {
            Database.getInstance().searchDepartmentInContacts(req.query.query, req.query.userId, function (result) {
                res.send(result);
            });
        }
    }, false);
});

router.get('/searchSkillInContacts', (req, res) => {
    userModel.validateToken(req.query.token, function (tokenResult) {
        if (tokenResult.status === 'error') {
            res.send(tokenResult);
        } else {
            Database.getInstance().searchSkillsInContacts(req.query.query, req.query.userId, function (result) {
                res.send(result);
            });
        }
    }, false);
});

router.get('/addUserConnection', (req, res) => {
    console.log('Adding user connection ...');

    userModel.validateToken(req.query.token, function (tokenResult) {
        if (tokenResult.status === 'error') {
            res.send(tokenResult);
        } else {
            Database.getInstance().addUserConnection(req.query.userFromId, req.query.userToId, req.query.category, req.query.acquaintance,
                req.query.acquaintanceDate, function (result) {
                    if (result) {
                        res.send(result);
                    } else {
                        res.send({status: 'error', message: 'An internal server error occurred.'});
                    }
                });
        }
    });
});

router.get('/getUserData', (req, res) => {
    console.log('Client tries to fetch user data from server...');
    userModel.validateToken(req.query.token, function (tokenResult) {
        if (tokenResult !== false) {
            Database.getInstance().getUserData(req.query.userID, function (result) {
                if (result.length > 0) {
                    Database.getInstance().getSkillData(req.query.userID, function (skill_result) {
                        if (skill_result) {
                            result[0].skills = skill_result;
                        }
                        res.send(result);
                    });
                } else {
                    res.send(false);
                }
            });
        } else {
            console.log('Login attempt via token failed.');
            res.send(tokenResult);
        }
    });
});
router.get('/getUserConnection', (req, res) => {
    console.log('Client tries to fetch connection data from server...');
    userModel.validateToken(req.query.token, function (tokenResult) {
        if (tokenResult !== false) {
            Database.getInstance().getUserToUserConnection(req.query.userID, req.query.userToID, function (result) {
                if (result !== false) {
                    res.send(result);
                } else {
                    res.send({status: "error", message: "An internal server error occurred!"});
                }
            })
        } else {
            console.log('Login attempt via token failed.');
            res.send(tokenResult);
        }
    });
});

router.get('/updateConnectionData', (req, res) => {
    console.log('Client tries to change connection data...');
    userModel.validateToken(req.query.token, function (tokenResult) {
        if (tokenResult !== false) {
            Database.getInstance().updateConnection(req.query.userID, req.query.userToID, req.query.con_date, req.query.con_acquaintance, req.query.con_cat, function (result) {
                if (result !== false) {
                    res.send(result);
                } else {
                    res.send({status: "error", message: "An internal server error occurred!"});
                }
            })
        } else {
            console.log('Login attempt via token failed.');
            res.send(tokenResult);
        }
    });
});

router.get('/deleteConnection',(req,res)=>{
    console.log('Client tries to delete a connection...');
    userModel.validateToken(req.query.token,function (tokenResult) {
        if(tokenResult!== false){
            Database.getInstance().deleteConnection(req.query.userID,req.query.userToID,function (result) {
                if (result !== false) {
                    res.send({status:"success",result:result});
                } else {
                    res.send({status: "error", message: "An internal server error occurred!"});
                }
            })
        }else{
            console.log('Login attempt via token failed.');
            res.send(tokenResult);
        }
    })
});

router.get('/proofConnection',(req,res)=>{
   console.log('Client tries to proof a connection...');
    userModel.validateToken(req.query.token,function (tokenResult) {
        if(tokenResult!== false){
            Database.getInstance().proofConnection(req.query.userID,req.query.userToID,function (result) {
                if (result !== false) {
                    if(result.length<1){
                        res.send({status: "success",message: "no connection"});
                    }else{
                        res.send({status: "success", message: "connection found"});
                    }
                } else {
                    res.send({status: "error", message: "An internal server error occurred!"});
                }
            })
        }else{
            console.log('Login attempt via token failed.');
            res.send(tokenResult);
        }
    })
});

module.exports = router;

