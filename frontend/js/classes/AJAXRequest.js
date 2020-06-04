
AJAXRequest.INSTANCE = null;
AJAXRequest.URL = "https://the-network.raphael-muesseler.de/server/";
// AJAXRequest.URL = "http://localhost/server/";

function AJAXRequest() {

}

AJAXRequest.getInstance = function() {
    if (this.INSTANCE === null) {
        this.INSTANCE = new AJAXRequest();
    }
    return this.INSTANCE;
};

AJAXRequest.prototype = {
    constructor: AJAXRequest,

    /**
     * Performs an AJAXRequest
     * @param action action which will be performed on server side
     * @param data parameters of action
     * @param callback callback function (result as parameter)
     */
    make: function(action, data, callback) {
        // checking if the token-Cookie is already set
        let cookie = Cookie.get('token');

        if (cookie !== null) {
            // adding token to data
            data.token = cookie.value;
        }

        $.get(AJAXRequest.URL + action + "/", data, function (result, status) {
                if (status === ("success" || 200)) {
                    callback(result);
                } else {
                    console.error('The AJAX request responded with status code ' + status + '.');
                    callback(null);
                }
            }
        );
    },
};