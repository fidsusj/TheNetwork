let mysql = require('mysql');
let Hash = require('./Hash');

Database.INSTANCE = null;
Database.INFO = {
    host: "robinkuck.de",
    user: "thenetwork_admin",
    password: "EROLY1leN0ts0ROk",
    database: "thenetwork_dev"
    /* for production system
    database:   "thenetwork_prod" */
};

Database.getInstance = function () {
    if (this.INSTANCE === null) {
        this.INSTANCE = new Database();
    }
    return this.INSTANCE;
};

function Database() {
    this.createConnection();
}

Database.prototype = {
    constructor: Database,

    createConnection: function (options) {
        this.mySQLConnection = mysql.createConnection(options || Database.INFO);
    },

    establishConnection: function (callback) {
        this.mySQLConnection.connect(function (err) {
            if (err) {
                console.log("An error occurred while connecting to database: " + err.stack);
                return;
            }

            console.log("Successfully connected to database '" + Database.INFO.database + "'.");

            callback();
        })
    },

    checkEmail: function (email, callback) {
        this.mySQLConnection.query(
            'SELECT * FROM User WHERE Email = ?', [email],
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    if (result.length === 0) {
                        callback(false);
                    } else {
                        callback(result[0]);
                    }
                }
            }
        )
    },

    createUser: function (name, surname, email, password, birthday, department, token, callback) {
        this.mySQLConnection.query(
            'INSERT INTO User (Name, Surname, Email, Password, Birthdate, Department, Token) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, surname, email, Hash.createHash(password), birthday, department, token],
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    callback(true);
                }
            }
        );
    },

    createExternalUser: function (name, surname, email, callback) {
        this.mySQLConnection.query(
            'INSERT INTO User (Name, Surname, Email, Password, Birthdate, Department, Registered, Token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, surname, email, '', '', '', 0, ''],
            function (error) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    callback(true);
                }
            }
        )
    },

    checkCredentials: function (email, password, newToken, callback) {
        let self = this;
        this.mySQLConnection.query(
            'SELECT * FROM User WHERE Email = ? AND Password = ?', [email, Hash.createHash(password)],
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    if (result.length > 0) {
                        self.updateToken(result[0].UserID, newToken, (updateResult) => {
                            if (updateResult) {
                                result[0].Token = newToken;
                                callback(result[0]);
                            } else {
                                callback(false);
                            }
                        });
                    } else {
                        callback(false);
                    }
                }
            }
        )
    },

    changeUserData: function (oldEmail, name, surname, email, birthday, department, callback) {
        let self = this;
        this.mySQLConnection.query(
            'Select * FROM User WHERE Email = ?', [oldEmail],
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    self.checkEmail(email, function (emailResult) {
                        if (emailResult.UserID === result[0].UserID) {
                            self.mySQLConnection.query(
                                'UPDATE User SET Name = ? , Surname = ? , Email = ? , Birthdate = ? , Department = ? WHERE UserID = ?', [name, surname, email, birthday, department, result[0].UserID],
                                function (innerError, innerResult) {
                                    if (innerError) {
                                        console.error('An error occurred while executing an mySQL command: ' + innerError.stack);
                                        callback(false);
                                    } else {
                                        callback(innerResult);
                                    }
                                }
                            )
                        }
                        else {
                            console.log('Update of User data failed, due to already existing email!')
                            callback('Email already exists!');
                        }
                    })
                }
            }
        )
    },

    changePassword: function (userID, password, callback) {
        this.mySQLConnection.query(
            'UPDATE User SET Password = ? WHERE UserID = ?', [Hash.createHash(password), userID],
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    callback(true);
                }
            }
        )
    },

    changeSkillData: function (userID, skillID, level, callback) {
        let self = this;
        this.mySQLConnection.query(
            'SELECT * FROM Skill_Connection WHERE UserID = ? AND SkillID = ?', [userID, skillID],
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    if (result.length > 0) {
                        if (result[0].Level === level) {
                            callback(result[0]);
                        } else {
                            self.mySQLConnection.query(
                                'UPDATE Skill_Connection SET Level = ? WHERE UserID = ? AND SkillID = ?', [level, userID, skillID],
                                function (middelError, middelResult) {
                                    if (middelError) {
                                        console.error('An error occurred while executing an mySQL command: ' + error.stack);
                                        callback(false);
                                    } else {
                                        callback(true);
                                    }
                                }
                            )
                        }
                    } else {
                        self.mySQLConnection.query(
                            'INSERT INTO Skill_Connection (UserID, SkillID, Level) VALUES (?, ?, ?)', [userID, skillID, level],
                            function (innerError, innerResult) {
                                if (innerError) {
                                    console.error('An error occurred while executing an mySQL command: ' + innerError.stack);
                                    callback(false);
                                } else {
                                    callback(true);
                                }
                            }
                        )
                    }
                }
            }
        )
    },

    getSkillData: function (userID, callback) {
        this.mySQLConnection.query(
            'SELECT * FROM Skill_Connection sc INNER JOIN Skill s ON (sc.SkillID = s.SkillID) WHERE userID = ?', [userID],
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    callback(result);
                }
            }
        )
    },

    deleteSkillData: function (userID, skillID, callback) {
        this.mySQLConnection.query(
            'DELETE FROM Skill_Connection WHERE UserID = ? AND SkillID =?', [userID, skillID],
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    callback(true);
                }
            }
        )
    },

    validateToken: function (token, callback) {
        this.mySQLConnection.query(
            'SELECT * FROM User WHERE Token = ?', [token],
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    if (result.length > 0) {
                        callback(result[0]);
                    } else {
                        callback(false);
                    }
                }
            }
        )
    },

    updateToken: function (userID, newToken, callback) {
        this.mySQLConnection.query(
            'UPDATE User SET Token = ? WHERE UserID = ?;', [newToken, userID],
            function (error) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    callback(true);
                }
            }
        );
    },

    getSignedInUserData: function (userid, callback) {
        this.mySQLConnection.query(
            'SELECT UserID, Registered, Email, Name, Surname, Birthdate, Department FROM User WHERE UserID = ?', [userid],
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    if (result.length > 0) {
                        callback(result);
                    } else {
                        callback(false);
                    }
                }
            }
        )
    },
    getAllSkills: function (callback) {
        this.mySQLConnection.query(
            'SELECT * FROM Skill ORDER BY Name;',
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    if (result.length > 0) {
                        callback(result);
                    } else {
                        callback(false);
                    }
                }
            }
        )
    },

    getContactsDataAndSignedInUserData: function (userid, callback) {
        let self = this;
        this.getSignedInUserData(userid, function (resultUser) {
            if (resultUser) {
                self.mySQLConnection.query('SELECT u.UserID, u.Registered, u.Email, u.Name, u.Surname, u.Birthdate, u.Department from User AS u, ' +
                    'User_Connection AS uc WHERE ? = uc.UserFromID AND u.UserID = uc.UserToID', [userid],
                    function (error, resultContacts) {
                        if (error) {
                            console.error('An error occurred while executing an mySQL command: ' + error.stack);
                        } else {
                            if (resultContacts) {
                                //concat resultUser and resultContacts
                                resultContacts.forEach(function (element) {
                                    resultUser.push(element);
                                });
                                callback(resultUser);
                                return;
                            }
                        }
                        callback(false);
                    });
            }
        });
    },

    getSkillConnections: function (callback) {
        this.mySQLConnection.query(
            'SELECT * from Skill_Connection', function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                } else {
                    if (result) {
                        callback(result);
                    }
                }
                callback(false);
            }
        )
    },

    getUserConnections: function (userid, callback) {
        this.mySQLConnection.query(
            'SELECT * from User_Connection WHERE UserFromID = ?', [userid], function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                } else {
                    if (result) {
                        callback(result);
                    }
                }
                callback(false);
            }
        )
    },

    getUserToUserConnection: function (userid, toid, callback) {
        this.mySQLConnection.query(
            'SELECT * from User_Connection WHERE UserFromID = ? AND UserToID = ?', [userid, toid], function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                } else {
                    if (result) {
                        callback(result);
                        return;
                    }
                }
            }
        )
    },

    getSkills: function (callback) {
        this.mySQLConnection.query(
            'SELECT * from Skill', function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                } else {
                    if (result) {
                        callback(result);
                    }
                }
                callback(false);
            }
        );
    },

    searchNewContacts: function (query, userId, callback) {
        query = '%' + query + '%';
        this.mySQLConnection.query(
            'SELECT * FROM User WHERE ((CONCAT(Name, Surname) LIKE ? OR Email LIKE ?) AND UserID <> ? AND ' +
            'UserID NOT IN (SELECT UserToID FROM User_Connection WHERE UserFromID = ?)) LIMIT 5',
            [query, query, userId, userId],
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    callback(result);
                }
            }
        );
    },

    searchAllUsers: function (query, userId, callback) {
        query = '%' + query + '%';
        this.mySQLConnection.query(
            'SELECT u.Name, u.Surname, u.Department FROM User u LEFT JOIN Skill_Connection sc ON sc.UserID = u.UserID ' +
            'LEFT JOIN Skill s ON s.SkillID = sc.SkillID WHERE ((CONCAT(u.Name, u.Surname, ",",  u.Department) LIKE ? ' +
            'OR s.Name LIKE ?) AND u.UserID <> ?) LIMIT 7',
            [query, query, userId],
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    callback(result);
                }
            }
        );
    },

    searchNameInContacts: function (query, userid, callback) {
        query = '%' + query + '%';
        this.mySQLConnection.query(
            'SELECT DISTINCT u.UserID, u.Name, u.Surname, u.Department FROM User u LEFT JOIN User_Connection uc1 ON uc1.UserFromID = ? ' +
            'LEFT JOIN User_Connection uc2 ON uc2.UserFromID = uc1.UserToID WHERE CONCAT(u.Name, u.Surname) LIKE ? AND u.UserID <> ? AND (u.UserID = uc1.UserToID ' +
            'OR u.UserID = uc2.UserToID) LIMIT 7',
            [userid, query, userid],
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    callback(result);
                }
            }
        )
    },

    searchDepartmentInContacts: function (query, userid, callback) {
        query = '%' + query + '%';
        this.mySQLConnection.query(
            'SELECT DISTINCT u.UserID, u.Name, u.Surname, u.Department FROM User u LEFT JOIN User_Connection uc1 ON uc1.UserFromID = ? ' +
            'LEFT JOIN User_Connection uc2 ON uc2.UserFromID = uc1.UserToID WHERE u.Department LIKE ? AND u.UserID <> ? AND (u.UserID = uc1.UserToID OR u.UserID = uc2.UserToID) ' +
            'LIMIT 7',
            [userid, query, userid],
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    callback(result);
                }
            }
        )
    },

    searchSkillsInContacts: function (query, userid, callback) {
        query = '%' + query + '%';
        this.mySQLConnection.query(
            'SELECT DISTINCT u.UserID, u.Name, u.Surname, u.Department FROM User u LEFT JOIN User_Connection uc1 ON uc1.UserFromID = ? ' +
            'LEFT JOIN User_Connection uc2 ON uc2.UserFromID = uc1.UserToID LEFT JOIN Skill_Connection sc ON sc.UserID = u.UserID ' +
            'LEFT JOIN Skill s ON s.SkillID = sc.SkillID WHERE ((u.UserID = uc1.UserToID OR u.UserID = uc2.UserToID) AND s.Name LIKE ? AND u.UserID <> ?) ' +
            'LIMIT 7',
            [userid, query, userid],
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    callback(result);
                }
            }
        )
    },

    getUserData: function (userId, callback) {
        console.log(userId);
        this.mySQLConnection.query(
            'SELECT u.UserID, u.Name, u.Surname, u.Department, u.Email, u.Birthdate FROM User u WHERE u.UserID = ?',
            [userId],
            function (error, result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    callback(result);
                }
            }
        );
    },

    addUserConnection: function (userFromId, userToId, category, acquaintance, acquaintanceDate, callback) {
        this.mySQLConnection.query(
            'INSERT INTO User_Connection (UserFromID, UserToID, Category, Acquaintance, AcquaintanceAt) VALUES (?, ?, ?, ?, ?)',
            [userFromId, userToId, category, acquaintance, acquaintanceDate],
            function (error) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    callback(true);
                }
            }
        )
    },
    updateConnection: function (userid, usertoid, date, acquaintance, cat, callback) {
        this.mySQLConnection.query(
            'UPDATE User_Connection SET Category = ?, Acquaintance = ?, AcquaintanceAt= ? WHERE UserFromID = ? AND UserToID = ?',
            [cat,acquaintance,date,userid,usertoid],
            function (error,result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    callback(result);
                }
            }
        )
    },
    deleteConnection: function (userid, usertoid,callback) {
        this.mySQLConnection.query(
            'DELETE FROM User_Connection WHERE UserFromID = ? AND UserToID = ?',[userid,usertoid],
            function (error,result) {
                if (error) {
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                } else {
                    callback(result);
                }
            }
        )
    },
    proofConnection: function (userid, usertoid,callback) {
        this.mySQLConnection.query(
            'SELECT * FROM User_Connection WHERE UserFromID = ? AND UserToID = ?', [userid,usertoid],
            function (error,result) {
                if(error){
                    console.error('An error occurred while executing an mySQL command: ' + error.stack);
                    callback(false);
                }else {
                    callback(result);
                }
            }
        )
    }
};

module.exports = Database;