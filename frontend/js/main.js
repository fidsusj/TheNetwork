/* main logic */

var userdata;
var xml;
var cookie = Cookie.get('token');
var currentUserToID = 0;

let PROFILE_IMAGE_PATH = 'https://the-network.raphael-muesseler.de/server/getProfileImage?userid=';

jconfirm.defaults = {
    boxWidth: '50%',
    useBootstrap: false,
    theme: 'modern'
};

function loadXMLDoc(filename) {
    if (window.ActiveXObject) {
        xhttp = new ActiveXObject("Msxml2.XMLHTTP");
    }
    else {
        xhttp = new XMLHttpRequest();
    }
    xhttp.open("GET", filename, false);
    try {
        xhttp.responseType = "msxml-document"
    } catch (err) {
    } // Helping IE11
    xhttp.send("");
    return xhttp.responseXML;
}

function downloadXmlFile() {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:application/xml;charset=utf-8,' + encodeURIComponent(xml));
    element.setAttribute('download', 'map.xml');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function isNode(o) {
    return (
        typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
    );
}

function generateSvgMap(xml, callback) {
    this.xml = xml;
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(xml, 'text/xml');
    $.get('../network/generateNetwork.xsl', function (xslDoc) {
        //for local testing
        //$.get('../frontend/network/generateNetwork.xsl', function (xslDoc) {
        if (!isNode(xslDoc)) {
            xslDoc = parser.parseFromString(xslDoc, 'text/xml');
        }
        /**
         * An XSLTProcessor applies an XSLT stylesheet transformation to an
         * XML document to produce a new XML document as output.
         * For more information see https://developer.mozilla.org/en-US/docs/Web/API/XSLTProcessor
         */
        xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xslDoc);
        resultDoc = xsltProcessor.transformToFragment(xmlDoc, document);
        $('#content').html(resultDoc);
        /**
         * svgPanZoom: Simple pan/zoom solution for SVGs in HTML.
         * It adds event listeners for mouse scroll, double-click and pan.
         * For more information see https://github.com/ariutta/svg-pan-zoom
         */
        svgPanZoom(document.getElementById('svg'), {
            zoomEnabled: true,
            controlIconsEnabled: true,
            displayFullScreenControl: true,
            center: true,
            zoomScaleSensitivity: 0.4
        });
        callback();
    });
}

function updateMap(token) {
    AJAXRequest.getInstance().make('getMap', {token: token}, function (result) {
        if (result) {
            generateSvgMap(result.result, function () {
            });
        }
    });
}


function getMapOfUser(token, userId) {
    AJAXRequest.getInstance().make('getMapOfUser', {token: token, userId: userId}, function (result) {
        console.log(result);
        if (result && (result.hasOwnProperty('status') && result.status === 'success')) {
            generateSvgMap(result.result, function () {
                $('#back-btn').css('display', 'block').animate({opacity: 1}, 300, 'easeOutCirc');
                self.close();
            });
        } else {
            if (result.message === 'This user has no connections.') {
                $.alert({
                    title: 'Warning',
                    content: result.message,
                    type: 'orange'
                });
                self.close();
            } else {
                onExpandAccountBox(userId);
            }
        }
    });
}

function onExpandAccountBox(userId) {
    /*
    Opens account overview when user clicks on a account block on the map.
    Loads contact data by AJAX with the userID.
     */
    currentUserToID = userId;
    if (userId !== userdata.UserID) {
        AJAXRequest.getInstance().make('proofConnection', {
            token: cookie.value, userID: userdata.UserID, userToID: currentUserToID
        }, (result) => {
            if (result.status === 'error') {

            } else if (result.message === 'connection found') {
                AJAXRequest.getInstance().make('getUserData', {
                    token: cookie.value, userID: userId
                }, (innerResult) => {
                    if (innerResult === false) {
                        $('#person-data-error').html('Error while fetching data!');
                    } else {
                        $('#connection_div').empty();
                        var deleteAndSaveConDiv = '<h3 style=\"text-align: center\">Connection</h3>\n' +
                            '                      <p id=\"user-sidebar-edit-error\" style=\"text-align: center; color: var(--color-error)\"></p>' +
                            '                <table>\n' +
                            '                    <tr>\n' +
                            '                        <td><label>Category:</label></td>\n' +
                            '                        <td>\n' +
                            '                            <select class=\"sidebar-input\" id=\"con-cat\" >\n' +
                            '                                <option value=\"business\">Business</option>\n' +
                            '                                <option value=\"private\">Private</option>\n' +
                            '                                <option value=\"both\">Both</option>\n' +
                            '                            </select>\n' +
                            '                        </td>\n' +
                            '                    </tr>\n' +
                            '                    <tr>\n' +
                            '                        <td><label>Acquaintance:</label></td>\n' +
                            '                        <td><input class=\"sidebar-input\"  id=\"con-acquaintance\"/></td>\n' +
                            '                    </tr>\n' +
                            '                    <tr>\n' +
                            '                        <td><label>Date:</label></td>\n' +
                            '                        <td><input type=\"date\"  class=\"sidebar-input\"  id=\"con-date\"/></td>\n' +
                            '                    </tr>\n' +
                            '                    <tr>\n' +
                            '                        <td>\n' +
                            '                            <button class=\"colored-button\"  id=\"delete-connection-button\">Delete connection</button>\n' +
                            '                        </td>\n' +
                            '                        <td>\n' +
                            '                            <button class=\"colored-button\"  id=\"user-sidebar-edit-btn\">Save changes</button>\n' +
                            '                        </td>\n' +
                            '                    </tr>\n' +
                            '                </table>';
                        $('#connection_div').html(deleteAndSaveConDiv);
                        $('#user-sidebar-name').html(innerResult[0].Name + " " + innerResult[0].Surname);
                        $('#user-sidebar-email').html(innerResult[0].Email);
                        $('#user-sidebar-birthdate').html(parseDate(innerResult[0].Birthdate));
                        $('#user-sidebar-department').html(innerResult[0].Department);
                        $('#user-sidebar-img').attr('src', PROFILE_IMAGE_PATH + userId);
                        $('#user-sidebar-edit-error').html('');
                        $('#skill_table').empty();
                        var skillTable = "";
                        innerResult[0].skills.forEach(function (i) {
                            skillTable += '<tr><td>' + i.Name + '</td> <td>Level: ' + i.Level + '</td> </tr>';
                        });
                        $('#user-sidebar-skill-table').html(skillTable);
                        AJAXRequest.getInstance().make('getUserConnection', {
                            token: cookie.value, userID: userdata.UserID, userToID: userId
                        }, (innerResult) => {
                            if (innerResult === false) {
                                $('#error-message').html('Error while fetching data!');
                            } else {
                                $('#con-cat').val(innerResult[0].Category);
                                $('#con-acquaintance').val(innerResult[0].Acquaintance);
                                $('#con-date').val(parseDateForInput(innerResult[0].AcquaintanceAt));
                                $('#user-sidebar').animate({right: 20}, 1300, 'easeOutElastic');
                            }
                        });
                    }
                });
            } else {
                AJAXRequest.getInstance().make('getUserData', {
                    token: cookie.value, userID: userId
                }, (innerResult) => {
                    if (innerResult === false) {
                        $('#person-data-error').html('Error while fetching data!');
                    } else {
                        $('#user-sidebar-name').html(innerResult[0].Name + " " + innerResult[0].Surname);
                        $('#user-sidebar-email').html(innerResult[0].Email);
                        $('#user-sidebar-birthdate').html(parseDate(innerResult[0].Birthdate));
                        $('#user-sidebar-department').html(innerResult[0].Department);
                        $('#user-sidebar-img').attr('src', PROFILE_IMAGE_PATH + userId);
                        $('#user-sidebar-edit-error').html('');
                        $('#skill_table').empty();
                        var skillTable = "";
                        innerResult[0].skills.forEach(function (i) {
                            skillTable += '<tr><td>' + i.Name + '</td> <td>Level: ' + i.Level + '</td> </tr>';
                        });
                        $('#user-sidebar-skill-table').html(skillTable);
                        $('#connection_div').empty();
                        $('#connection_div').css("text-align", "center");
                        var addConDiv = " <h3 style=\"text-align: center\">Connection</h3>" +
                            "<button id=\"addConnectionInSidebar\" class='colored-button'>Add Connection</button>";
                        $('#connection_div').html(addConDiv);
                        $('#user-sidebar').animate({right: 20}, 1300, 'easeOutElastic');
                    }
                });
            }
        })

    }

}

function onExpandMap(userId) {
    if (userId !== userdata.UserID) {
        getMapOfUser(cookie.value, userId);
    }
}

$.alert({
    onOpenBefore: function () {
        this.showLoading();
        let cookie = Cookie.get('token');
        let self = this;
        if (cookie !== null) {
            AJAXRequest.getInstance().make('validateToken', {token: cookie.value}, function (result) {
                if (result === false) {
                    window.location.replace('login/');
                } else {
                    let cookie = new Cookie('token', result.Token, 7);
                    cookie.set();
                    userdata = result;
                    updateMap(cookie.value);
                }
                setTimeout(() => {
                    self.close();
                }, 500);
            });
        } else {
            window.location.replace('login/');
        }
    }
});


$(document).ready(function () {
    $('#download-btn').on('click', function () {
        downloadXmlFile();
    });

    $('#user-sidebar-close-btn').on('click', function () {
        $('#user-sidebar-edit-error').html('');
        $('#user-sidebar').animate({right: -495}, 1300, 'easeOutQuint');
    });

    $('body').on('click', '#user-sidebar-edit-btn', function () {
        let acquaintance = document.getElementById("con-acquaintance").value;
        let date = document.getElementById("con-date").value;
        let request = true;
        let edit_error_label = $('#user-sidebar-edit-error');
        if (acquaintance === '') {
            edit_error_label.css("color", "var(--color-error");
            if (request) edit_error_label.html('Acquaintance can not be empty!');
            request = false;
        }
        if (date < parseDateForInput(userdata.Birthdate)) {
            edit_error_label.css("color", "var(--color-error");
            if (request) edit_error_label.html('Date can not be before your Birthday!');
            request = false;
        }
        let today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd
        }

        if (mm < 10) {
            mm = '0' + mm
        }

        today = yyyy + '-' + mm + '-' + dd;
        if (date > today) {
            edit_error_label.css("color", "var(--color-error");
            if (request) edit_error_label.html('Date can not be in the future!');
            request = false;
        }
        if (request) {
            AJAXRequest.getInstance().make('updateConnectionData', {
                token: cookie.value,
                userToID: currentUserToID,
                userID: userdata.UserID,
                con_cat: document.getElementById("con-cat").value,
                con_acquaintance: acquaintance,
                con_date: date
            }, function (result) {

                if (result !== false) {
                    edit_error_label.css("color", "var(--color-success");
                    edit_error_label.html('Your connection was changed!');
                    updateMap(cookie.value);
                } else {
                    edit_error_label.css("color", "var(--color-error");
                    edit_error_label.html('Error while changing connection!');
                }
            })
        }
    });

    $('body').on('click', '#delete-connection-button', function () {
        AJAXRequest.getInstance().make('deleteConnection', {
            token: cookie.value,
            userToID: currentUserToID,
            userID: userdata.UserID
        }, function (result) {
            if (result !== false) {
                if (result.status === 'success') {
                    updateMap(cookie.value);
                    $('#user-sidebar').animate({right: -495}, 1300, 'easeOutQuint');
                }
                else {
                    $('#person-connection-error').css("color", "var(--color-error");
                    $('#person-connection-error').html('Can not delete connection due to server error!');
                }
            } else {
                $('#person-connection-error').css("color", "var(--color-error");
                $('#person-connection-error').html('Can not delete connection due to server error!');
            }
        })
    })

    $('#con-cat').on('click', function () {
        $('#person-connection-error').html('');
    })

    $('#con-acquaintance').on('click', function () {
        $('#person-connection-error').html('');
    })

    $('#con-date').on('click', function () {
        $('#person-connection-error').html('');
    })

    $('body').on('click', '#addConnectionInSidebar', function () {
        let userId = currentUserToID;
        $('#user-sidebar').animate({right: -495}, 1300, 'easeOutQuint');
        $.confirm({
            title: 'Add Connection',
            content:
            '<p id="error-message" style="color: var(--color-error); font-size: 18px; font-weight: 700;"></p>' +
            '</table>' +
            '<table style="font-size: 20px; text-align: left; margin-top: 15px">' +
            '   <tr>' +
            '       <td>Relationship category</td>' +
            '       <td>' +
            '           <select id="category">' +
            '               <option value="business">Business</option>' +
            '               <option value="private">Private</option>' +
            '               <option value="both">Both</option>' +
            '           </select>' +
            '       </td>' +
            '   </tr>' +
            '   <tr>' +
            '       <td>Why did you meet?</td>' +
            '       <td><input type="text" placeholder="Acquaintance reason" id="acquaintance" /></td>' +
            '   </tr>' +
            '   <tr>' +
            '       <td>When did you first meet?</td>' +
            '       <td><input type="date" id="acquaintance-date" /></td>' +
            '   </tr>' +
            '</table>',
            icon: 'fa fa-users',
            type: 'dark',
            buttons: {
                create: {
                    text: 'Create Connection',
                    btnClass: 'colored-button',
                    keys: ['Enter'],
                    action: function () {
                        let self = this;
                        let request = true;

                        if (userId < 0) {
                            if (request) $('#error-message').text('Please select a user!');
                            request = false;
                        }
                        if ($('#acquaintance').val() === "") {
                            if (request) $('#error-message').html('Please enter an acquaintance reason!');
                            $('#acquaintance')[0].setCustomValidity('Invalid field.');
                            request = false;
                        }
                        if ($('#acquaintance-date').val() === "") {
                            $('#acquaintance-date')[0].setCustomValidity('Invalid field.');
                            if (request) $('#error-message').html('Please enter an acquaintance date!');
                            request = false;
                        }

                        let today = new Date();
                        var dd = today.getDate();
                        var mm = today.getMonth() + 1; //January is 0!
                        var yyyy = today.getFullYear();

                        if (dd < 10) {
                            dd = '0' + dd
                        }

                        if (mm < 10) {
                            mm = '0' + mm
                        }

                        today = yyyy + '-' + mm + '-' + dd;
                        if ($('#acquaintance-date').val() > today || $('#acquaintance-date').val() < userdata.Birthdate) {
                            $('#acquaintance-date')[0].setCustomValidity('Invalid field.');
                            if (request) $('#error-message').html('Invalid birthday!');
                            request = false;
                        }

                        if (request) {
                            AJAXRequest.getInstance().make('addUserConnection', {
                                userFromId: userdata.UserID,
                                userToId: userId,
                                category: $('#category').val(),
                                acquaintance: $('#acquaintance').val(),
                                acquaintanceDate: $('#acquaintance-date').val()
                            }, function (result) {
                                if (result === true) {
                                    updateMap(cookie.value);
                                    $('#back-btn').css('display', 'none');
                                    $('#connection_div').empty();
                                    $('#connection_div').html('<h3 style="text-align: center">Connection</h3>' +
                                        '<p id="user-sidebar-edit-error" style="text-align: center; color: var(--color-error)"></p>' +
                                        '<table>' +
                                        '<tr>' +
                                        '<td><label>Category:</label></td>' +
                                        '<td>' +
                                        '<select class="sidebar-input" id="con-cat">' +
                                        '<option value="business">Business</option>' +
                                        '<option value="private">Private</option>' +
                                        '<option value="both">Both</option>' +
                                        '</select>' +
                                        '</td>' +
                                        '</tr>' +
                                        '<tr>' +
                                        '<td><label>Acquaintance:</label></td>' +
                                        '<td><input class="sidebar-input" id="con-acquaintance"/></td>' +
                                        ' </tr> <tr>' +
                                        '<td><label>Date:</label></td>' +
                                        '<td><input type="date" class="sidebar-input" id="con-date"/></td>' +
                                        '</tr>' +
                                        '<tr>' +
                                        '<td><button class="colored-button" id="delete-connection-button">Delete connection</button></td>' +
                                        '<td>' +
                                        '<button class="colored-button" id="user-sidebar-edit-btn">Save changes</button>' +
                                        '</td>' +
                                        '</tr>' +
                                        '</table>');
                                    AJAXRequest.getInstance().make('getUserConnection', {
                                        token: cookie.value, userID: userdata.UserID, userToID: userId
                                    }, (innerResult) => {
                                        if (innerResult === false) {
                                            $('#error-message').html('Error while fetching data!');
                                        } else {
                                            $('#con-cat').val(innerResult[0].Category);
                                            $('#con-acquaintance').val(innerResult[0].Acquaintance);
                                            $('#con-date').val(parseDateForInput(innerResult[0].AcquaintanceAt));
                                        }
                                    });
                                    self.close();
                                } else {
                                    $('#error-message').html('Please enter an acquaintance date!');
                                }
                            });
                        }
                        return false;
                    }
                },
                nah: {
                    text: 'Cancel',
                    btnClass: ' ',
                    keys: ['Escape']
                }
            }
        })
    });

    $('#logout-btn').on('click', function () {
        $.confirm({
            title: 'Logout',
            content: 'Are you sure, you want to log out?',
            icon: 'fa fa-sign-out-alt',
            type: 'dark',
            buttons: {
                yes: {
                    text: 'Yes',
                    btnClass: 'colored-button',
                    keys: ['Enter'],
                    action: function () {
                        let cookie = Cookie.get('token');
                        cookie.remove();
                        window.location.replace('login/');
                    }
                },
                nah: {
                    text: 'Not yet',
                    btnClass: ' ',
                    keys: ['Escape']
                }
            }
        });
    });

    $('#account-btn').on('click', function () {
        window.location.replace('./accountManagement/');
    });

    $('#add-connection-btn').on('click', function () {
        openConnectionDialog();
    });

    $('#searchbar-select-btn').on('click', function () {
        $('#searchbar-select-table').toggle();
    });

    $('#searchbar-input').keyup(function (key) {
        if (key.keyCode === 27) {
            $('#searchbar-select-table').hide();
            $(this).blur();
            $(this).val('');
            $('#searchbar-results').html('');
        } else {
            let self = this;
            let input = $(self).val();
            input = input.replace(' ', '');
            var query = $('input.searchbar-select:checked').val();
            if (input !== '') {
                AJAXRequest.getInstance().make(query, {
                    query: input, userId: userdata.UserID
                }, function (result) {
                    let rows = '';
                    for (let i = 0; i < result.length; i++) {
                        rows +=
                            '<tr id="result-' + result[i].UserID + '" style="cursor: pointer">' +
                            '   <td><p style="padding: 0 10px; font-weight: 500">' + result[i].Name + ' ' +
                            result[i].Surname + ', ' + result[i].Department + '</p></td>' +
                            //'   <td><p style="padding: 0 10px; font-weight: 500">' + result[i].Department + '</p></td>' +
                            '</tr>';
                    }
                    $('#searchbar-results').html(rows);
                });
            } else {
                $('#searchbar-results').html('');
            }
        }
    });

    $('#searchbar-results').on('click', 'tr', function () {
        $('#searchbar-select-table').hide();
        $('#searchbar-results').html('');
        $('#searchbar-results').val('');
        $('#searchbar-input').val(($(this).children().eq(0).text() + " " + $(this).children().eq(1).text()));
        userId = $(this).attr('id').substr(7);
        getMapOfUser(cookie.value, userId);
    });

    $('#searchbar-input').blur(function () {
        $('#searchbar-select-table').hide();
    });

    $('#searchbar-input').focus(function () {
        $('#searchbar-select-table').hide();
    });

    $('#back-btn').on('click', function () {
        if ($(this).css('display') === 'block') {
            $('#searchbar-input').val('');
            updateMap(Cookie.get('token').value);
            $(this).animate({opacity: 0}, 300, 'easeInCirc', function () {
                $(this).css('display', 'none');
            });
            $('#user-sidebar').animate({right: -495}, 1300, 'easeOutQuint');
        }
    });
});

/**
 * parses date string from database to string that is used to display on a label
 * BE CAREFUL: works just for specific source string
 * @param date date string
 * @return String formatted date string
 */
function parseDate(date) {
    let parsedDateString = date.substr(0, 10);
    let parts = parsedDateString.split("-");
    let dateMinusOne = new Date("" + parts[0] + "/" + parts[1] + "/" + parts[2]);
    let _date = new Date(dateMinusOne.getFullYear(), dateMinusOne.getMonth(), dateMinusOne.getDate() + 1);
    return "" + (_date.getMonth() < 9 ? ("0" + (_date.getMonth() + 1)) : (_date.getMonth() + 1)) + "-" + (_date.getDate() < 10 ? ("0" + _date.getDate()) : _date.getDate()) + "-" + _date.getFullYear();
};

/**
 * parses date string from database to string that is accepted by date input field
 * BE CAREFUL: works just for specific source string
 * @param date date string
 * @return String formatted date string
 */
function parseDateForInput(date) {
    let parsedDateString = date.substr(0, 10);
    let parts = parsedDateString.split("-");
    let dateMinusOne = new Date("" + parts[0] + "/" + parts[1] + "/" + parts[2]);
    let _date = new Date(dateMinusOne.getFullYear(), dateMinusOne.getMonth(), dateMinusOne.getDate() + 1);
    return "" + _date.getFullYear() + "-" + (_date.getMonth() < 9 ? ("0" + (_date.getMonth() + 1)) : (_date.getMonth() + 1)) + "-" + (_date.getDate() < 10 ? ("0" + _date.getDate()) : _date.getDate());
};

function openConnectionDialog() {
    let userId = -1;
    $.confirm({
        title: 'Add Connection',
        content:
        '<p id="error-message" style="color: var(--color-error); font-size: 18px; font-weight: 700;"></p>' +
        '<input type="text" id="search-user-input" placeholder="Search User ..."/>' +
        '<table id="search-user-results" style="max-height: 100px;overflow: auto;text-align: left; ">' +
        '</table>' +
        '<button onclick="openCreateExternalUserDialog();">Create External User</button>' +
        '<table style="font-size: 20px; text-align: left; margin-top: 15px">' +
        '   <tr>' +
        '       <td>Selected user: </p>' +
        '       <td><p id="user" style="font-weight: 700;"></p></td>' +
        '   </tr>' +
        '   <tr>' +
        '       <td>Relationship category</td>' +
        '       <td>' +
        '           <select id="category">' +
        '               <option value="business">Business</option>' +
        '               <option value="private">Private</option>' +
        '               <option value="both">Both</option>' +
        '           </select>' +
        '       </td>' +
        '   </tr>' +
        '   <tr>' +
        '       <td>Why did you meet?</td>' +
        '       <td><input type="text" placeholder="Acquaintance reason" id="acquaintance" /></td>' +
        '   </tr>' +
        '   <tr>' +
        '       <td>When did you first meet?</td>' +
        '       <td><input type="date" id="acquaintance-date" /></td>' +
        '   </tr>' +
        '</table>',
        icon: 'fa fa-users',
        type: 'dark',
        buttons: {
            create: {
                text: 'Create Connection',
                btnClass: 'colored-button',
                keys: ['Enter'],
                action: function () {
                    let self = this;
                    let request = true;

                    if (userId < 0) {
                        if (request) $('#error-message').text('Please select a user!');
                        request = false;
                    }
                    if ($('#acquaintance').val() === "") {
                        if (request) $('#error-message').html('Please enter an acquaintance reason!');
                        $('#acquaintance')[0].setCustomValidity('Invalid field.');
                        request = false;
                    }
                    if ($('#acquaintance-date').val() === "") {
                        $('#acquaintance-date')[0].setCustomValidity('Invalid field.');
                        if (request) $('#error-message').html('Please enter an acquaintance date!');
                        request = false;
                    }

                    let today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth() + 1; //January is 0!
                    var yyyy = today.getFullYear();

                    if (dd < 10) {
                        dd = '0' + dd
                    }

                    if (mm < 10) {
                        mm = '0' + mm
                    }

                    today = yyyy + '-' + mm + '-' + dd;
                    if ($('#acquaintance-date').val() > today || $('#acquaintance-date').val() < userdata.Birthdate) {
                        $('#acquaintance-date')[0].setCustomValidity('Invalid field.');
                        if (request) $('#error-message').html('Invalid birthday!');
                        request = false;
                    }

                    if (request) {
                        AJAXRequest.getInstance().make('addUserConnection', {
                            userFromId: userdata.UserID,
                            userToId: userId,
                            category: $('#category').val(),
                            acquaintance: $('#acquaintance').val(),
                            acquaintanceDate: $('#acquaintance-date').val()
                        }, function (result) {
                            if (result === true) {
                                self.close();
                                updateMap(cookie.value);
                                $('#searchbar-input').val('');
                                $('#back-btn').css('display', 'none');
                                $('#user-sidebar').animate({right: -495}, 1300, 'easeOutQuint');
                            } else {
                                $('#error-message').html('Please enter an acquaintance date!');
                            }
                        });
                    }
                    return false;
                }
            },
            nah: {
                text: 'Cancel',
                btnClass: ' ',
                keys: ['Escape']
            }
        },
        onContentReady: function () {
            $('#search-user-input').keyup(function () {
                let value = $(this).val();
                value = value.replace(' ', '');
                if (value !== '') {
                    AJAXRequest.getInstance().make('searchNewContacts', {
                        query: value, userId: userdata.UserID
                    }, function (result) {
                        let rows = '';
                        for (let i = 0; i < result.length; i++) {
                            rows +=
                                '<tr id="result-' + result[i].UserID + '" style="cursor: pointer">' +
                                '   <td><p style="padding: 0 10px; font-weight: 700">' + result[i].Name + '</p></td>' +
                                '   <td><p style="padding: 0 10px; font-weight: 700">' + result[i].Surname + '</p></td>' +
                                '   <td><p style="padding: 0 10px;">' + result[i].Email + '</p></td>' +
                                '   <td><p style="padding: 0 10px;">' + result[i].Department + '</p></td>' +
                                '</tr>';
                        }
                        $('#search-user-results').html(rows);

                        $('#search-user-results tr').hover(function () {
                            $(this).css('background', 'var(--color-gray-light');
                        }, function () {
                            $(this).css('background', 'none');
                        });
                    });
                } else {
                    $('#search-user-results').html('');
                }

                $('#search-user-results').on('click', 'tr', function () {
                    $('#search-user-results').html('');
                    $('#search-user-input').val('');
                    $('#user').html($(this).children().eq(0).text() + " " + $(this).children().eq(1).text());
                    userId = $(this).attr('id').substr(7);
                });
            });
        }
    });
}

function openCreateExternalUserDialog() {
    $.confirm({
        title: 'Create external user',
        content:
        '<p id="error-message-add-user" style="color: var(--color-error); font-size: 18px; font-weight: 700;"></p>' +
        '<table>' +
        '   <tr>' +
        '       <td>Name</td>' +
        '       <td><input type="text" id="name-input" placeholder="Name"></td>' +
        '   </tr>' +
        '   <tr>' +
        '       <td>Surname</td>' +
        '       <td><input type="text" id="surname-input" placeholder="Surname"></td>' +
        '   </tr>' +
        '   <tr>' +
        '       <td>E-Mail</td>' +
        '       <td><input type="text" id="email-input" placeholder="E-Mail"></td>' +
        '   </tr>' +
        '</table>',
        buttons: {
            createUser: {
                text: 'Create User',
                btnClass: 'colored-button',
                keys: ['Enter'],
                action: function () {
                    let request = true;

                    $('#name-input')[0].setCustomValidity('');
                    $('#surname-input')[0].setCustomValidity('');
                    $('#email-input')[0].setCustomValidity('');

                    if ($('#name-input').val() === '') {
                        $('#name-input')[0].setCustomValidity('invalid');
                        request = false;
                    }
                    if ($('#surname-input').val() === '') {
                        $('#surname-input')[0].setCustomValidity('invalid');
                        request = false;
                    }
                    if ($('#email-input').val() === '') {
                        $('#email-input')[0].setCustomValidity('invalid');
                        request = false;
                    }

                    if (request) {
                        let self = this;
                        AJAXRequest.getInstance().make('createExternalUser', {
                            name: $('#name-input').val(),
                            surname: $('#surname-input').val(),
                            email: $('#email-input').val()
                        }, function (result) {
                            if (result.status === 'success') {
                                self.close();
                            } else {
                                $('#error-message-add-user').text(result.message);
                            }
                        });
                    }
                    return false;
                }
            },
            cancel: {
                text: 'Cancel',
                btnClass: ' ',
                keys: ['Escape']
            }
        }
    });
}