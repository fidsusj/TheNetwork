let xml2js = require('xml2js');

XmlJsonParser.INSTANCE = null;

XmlJsonParser.getInstance = function () {
    if (this.INSTANCE === null) {
        this.INSTANCE = new XmlJsonParser();
    }
    return this.INSTANCE;
};

function XmlJsonParser() {
}

XmlJsonParser.prototype = {
    constructor: XmlJsonParser,

    parseXmlToJson: function (xml, callback) {
        var parser = new xml2js.Parser({explicitArray: false, mergeAttrs: true});
        parser.parseString(xml, callback);
    },

    parseJsonToXmlWithRoot: function (json, rootName) {
        var builder = new xml2js.Builder({rootName: rootName});
        return builder.buildObject(json);
    },

    parseJsonToXmlWithoutRoot: function (json) {
        var builder = new xml2js.Builder({explicitRoot: false});
        return builder.buildObject(json);
    }
}

module.exports = XmlJsonParser;