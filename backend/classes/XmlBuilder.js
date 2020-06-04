let Database = require('./Database');
let Builder = require('xmlbuilder');

XmlBuilder.INSTANCE = null;

XmlBuilder.getInstance = function () {
    if (this.INSTANCE === null) {
        this.INSTANCE = new XmlBuilder();
    }
    return this.INSTANCE;
};

function XmlBuilder() {
}

XmlBuilder.prototype = {
    constructor: XmlBuilder,

    buildMap: function (userId, callback) {
        var root = Builder.create('network').dec('1.0', 'UTF-8');
        root.dtd('https://the-network.raphael-muesseler.de/Network.dtd');
        root.instructionBefore('xml-stylesheet', 'type="text/xsl", href="https://the-network.raphael-muesseler.de/network/generateNetwork.xsl"');
        var users = root.ele('users');
        var connections = root.ele('connections');
        var skills = root.ele('skills');
        Database.getInstance().getContactsDataAndSignedInUserData(userId, function (usersResult) {
            if (usersResult) {
                Database.getInstance().getUserConnections(userId, function (userConnectionsResult) {
                    if (userConnectionsResult) {
                        Database.getInstance().getSkills(function (skillsResult) {
                            if (skillsResult) {
                                Database.getInstance().getSkillConnections(function (skillsConnectionResult) {
                                    if (skillsConnectionResult) {
                                        usersResult.forEach(function (user) {
                                            var item = users.ele('user');
                                            item.ele('userid', user.UserID);
                                            item.ele('registered', user.Registered);
                                            item.ele('signedin', (userId == user.UserID) ? 1 : 0);
                                            item.ele('email', user.Email);
                                            item.ele('name', user.Name);
                                            item.ele('surname', user.Surname);
                                            item.ele('birthdate', user.Birthdate);
                                            item.ele('department', user.Department);
                                            var skillsconnections = item.ele('skillassignments');
                                            skillsConnectionResult.forEach(function (skillsConnection) {
                                                if (user.UserID === skillsConnection.UserID) {
                                                    skillsConnectionResult.splice(skillsConnectionResult.indexOf(skillsConnection), 1);
                                                    skillsconnections.ele('skillassignment').att('id', skillsConnection.SkillID).att('level', skillsConnection.Level)
                                                }
                                            });
                                        });
                                        userConnectionsResult.forEach(function (element) {
                                            var item = connections.ele('connection');
                                            item.ele('connectionid', element.UserConnectionID);
                                            item.ele('fromid', element.UserFromID);
                                            item.ele('toid', element.UserToID);
                                            item.ele('category', element.Category);
                                            item.ele('acquaintance', element.Acquaintance);
                                            item.ele('acquaintanceat', element.AcquaintanceAt);
                                        });
                                        skillsResult.forEach(function (element) {
                                            var item = skills.ele('skill');
                                            item.ele('skillid', element.SkillID);
                                            item.ele('name', element.Name);
                                        })
                                        callback({status: 'success', result: root.end({pretty: true})});
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                callback({status: 'error', message: 'This user has no connections.'});
            }
        });
    },

    buildForeignMap: function (userId, foreignUserId, callback) {
        var root = Builder.create('network').dec('1.0', 'UTF-8');
        root.dtd('https://the-network.raphael-muesseler.de/Network.dtd');
        root.instructionBefore('xml-stylesheet', 'type="text/xsl", href="https://the-network.raphael-muesseler.de/network/generateNetwork.xsl"');
        var users = root.ele('users');
        var connections = root.ele('connections');
        var skills = root.ele('skills');
        Database.getInstance().getContactsDataAndSignedInUserData(foreignUserId, function (usersResult) {
            if (usersResult) {
                Database.getInstance().getUserConnections(foreignUserId, function (userConnectionsResult) {
                    if (userConnectionsResult) {
                        Database.getInstance().getSkills(function (skillsResult) {
                            if (skillsResult) {
                                Database.getInstance().getSkillConnections(function (skillsConnectionResult) {
                                    if (skillsConnectionResult) {
                                        usersResult.forEach(function (user) {
                                            var item = users.ele('user');
                                            item.ele('userid', user.UserID);
                                            item.ele('registered', user.Registered);
                                            item.ele('signedin', (userId == user.UserID) ? 1 : 0);
                                            item.ele('email', user.Email);
                                            item.ele('name', user.Name);
                                            item.ele('surname', user.Surname);
                                            item.ele('birthdate', user.Birthdate);
                                            item.ele('department', user.Department);
                                            var skillsconnections = item.ele('skillassignments');
                                            skillsConnectionResult.forEach(function (skillsConnection) {
                                                if (user.UserID === skillsConnection.UserID) {
                                                    skillsConnectionResult.splice(skillsConnectionResult.indexOf(skillsConnection), 1);
                                                    skillsconnections.ele('skillassignment').att('id', skillsConnection.SkillID).att('level', skillsConnection.Level)
                                                }
                                            });
                                        });
                                        userConnectionsResult.forEach(function (element) {
                                            var item = connections.ele('connection');
                                            item.ele('connectionid', element.UserConnectionID);
                                            item.ele('fromid', element.UserFromID);
                                            item.ele('toid', element.UserToID);
                                            item.ele('category', element.Category);
                                            item.ele('acquaintance', element.Acquaintance);
                                            item.ele('acquaintanceat', element.AcquaintanceAt);
                                        });
                                        skillsResult.forEach(function (element) {
                                            var item = skills.ele('skill');
                                            item.ele('skillid', element.SkillID);
                                            item.ele('name', element.Name);
                                        })
                                        callback({status: 'success', result: root.end({pretty: true})});
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                callback({status: 'error', message: 'This user has no connections.'});
            }
        });
    }

}

module.exports = XmlBuilder;