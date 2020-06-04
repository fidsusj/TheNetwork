/**
 * Create an instance of Cookie
 * @param name name or key of the Cookie
 * @param value value of the Cookie
 * @param expires number of days after which the Cookie expires
 * @constructor
 */
function Cookie(name, value, expires) {
    this.name = name;
    this.value = value;
    this.expires = expires;
}

/**
 * Returns the Cookie if exists.
 * @param name name of the Cookie
 * @returns {*} Cookie object or null, if Cookie does not exists
 */
Cookie.get = function (name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
            return new Cookie(name, c.substring(nameEQ.length, c.length));
        }
    }
    return null;
};

Cookie.prototype = {
    constructor: Cookie,

    /**
     * Sets the Cookie with current name, value and expire date
     */
    set: function () {
        let expires = "";
        if (this.expires) {
            let date = new Date();
            date.setTime(date.getTime() + (this.expires * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = this.name + "=" + (this.value || "") + expires + "; path=/";
    },

    /**
     * Removes the Cookie
     */
    remove: function() {
        document.cookie = this.name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
};



