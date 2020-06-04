let userdata;

jconfirm.defaults = {
    boxWidth: '50%',
    useBootstrap: false,
    theme: 'modern'
};

$(document).ready(function () {

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

                $('#file-select-preview').attr('src', 'https://the-network.raphael-muesseler.de/server/getProfileImage?userid=' + userdata.UserID);
                //$('#file-select-preview').attr('src', 'http://localhost/server/getProfileImage?userid=' + userdata.UserID);

                $('#name-input').val(userdata.Name);
                $('#surname-input').val(userdata.Surname);
                $('#email-input').val(userdata.Email);
                $('#department-input').val(userdata.Department);
                $('#birthday-input').val(parseDate(userdata.Birthdate));
                AJAXRequest.getInstance().make('getSkillData', {
                    token: cookie.value,
                    userID: userdata.UserID
                }, function (innerResult) {
                    if (innerResult.status !== 'error') {
                        for (let i = 0; i < innerResult.length; i++) {
                            $('#skill_table').append('<tr><td><label>' + innerResult[i].Name + '<label/><td/>' +
                                '<td><label>Level: ' + innerResult[i].Level + '</label></td>' +
                                '<td><button id="cancel_SkillID' + innerResult[i].SkillID + '" class="cancel_Skill">Delete</button> </td>' +
                                '</tr>')
                        }
                    } else {
                        $('#skills-error').html('Error while fetching skill data!');
                    }
                })
            }
            setTimeout(() => {
                self.close();
            }, 500);
        });
        AJAXRequest.getInstance().make('getAllSkills', {token: cookie.value}, function (result) {
            if (result === false) {
                window.location.replace('login/');
            } else {
                for (let i = 0; i < result.length; i++) {
                    $('#skill_option').append('<option value="' + result[i].SkillID + '">' + result[i].Name + '</option>');
                }

            }
            setTimeout(() => {
                self.close();
            }, 500);
        });
    } else {
        window.location.replace('login/');
    }

    $('#change-pw-btn').on('click', function () {
        openChangePwDialog();
    })

    $('#upload-button').on('click', function () {
        var fileSelect = document.getElementById('file-select');
        var uploadButton = document.getElementById('upload-button');
        uploadButton.innerHTML = 'Uploading...';
        // Get the selected files from the input.
        var files = fileSelect.files;
        // Create a new FormData object.
        var formData = new FormData();
        var file = files[0];
        formData.append(userdata.UserID, file, 'test.jpg');
        $.ajax({
            url: 'https://the-network.raphael-muesseler.de/server/uploadProfilePicture',
            data: formData,
            userID: userdata.UserID,
            processData: false,
            contentType: false,
            method: 'post',
            success: function (data) {
                if (data.status === 'success') {
                    uploadButton.innerHTML = 'Upload';
                    $('#error-message').html('Your picture was uploaded successfully!');
                } else {
                    uploadButton.innerHTML = 'Upload';
                    $('#error-message').html('Due to an error your picture was not uploaded!');
                }
            }
        });
    });

    /*
    $('#file-select').change(function () {
        var file = $('#file-select').prop('files')[0];
        $('#file-select-preview').attr('src', file);
    });
    */
    $('#file-select').on('change', function(event) {
        var reader = new FileReader();
        reader.onload = function() {
            $('#file-select-preview').attr('src', reader.result);
        };
        reader.readAsDataURL(event.target.files[0]);
    });

    $('#addSkill-btn').on('click', function () {
        $('#skills-error').html('');
        let skill = $('select[id=skill_option]').val();
        let level = $('select[id=skill_level_option]').val();
        let request = true;
        if (skill === 'default') {
            request = false;
            $('#skills-error').html('Please choose skill!');
        }
        if (level === 'default') {
            request = false;
            $('#skills-error').html('Please choose level!');
        }
        if (request) {
            AJAXRequest.getInstance().make('updateSkillData', {
                token: cookie.value,
                userID: userdata.UserID,
                skillID: skill,
                level: level
            }, function (result) {
                if (result.status === 'success') {
                    AJAXRequest.getInstance().make('getSkillData', {
                        token: cookie.value,
                        userID: userdata.UserID
                    }, function (innerResult) {
                        if (innerResult.status !== 'error') {
                            $('#skill_table').empty();
                            for (let i = 0; i < innerResult.length; i++) {
                                $('#skill_table').append('<tr><td><label>' + innerResult[i].Name + '<label/><td/>' +
                                    '<td><label>Level:' + innerResult[i].Level + '</label></td>' +
                                    '<td><button id="cancel_SkillID' + innerResult[i].SkillID + '" class="cancel_Skill">Delete</button> </td>' +
                                    '</tr>')
                            }
                        } else {
                            $('#skills-error').html('Error while fetching skill data!');
                        }
                    })
                } else {
                    $('#skills-error').html(result.message);
                }
            })
        }
    });

    $('#change-info-btn').on('click', function () {
        $('#name-input')[0].setCustomValidity('');
        $('#surname-input')[0].setCustomValidity('');
        $('#email-input')[0].setCustomValidity('');
        $('#department-input')[0].setCustomValidity('');
        $('#birthday-input')[0].setCustomValidity('');
        $('#error-message').html('');

        let firstname = $('#name-input').val();
        let lastname = $('#surname-input').val();
        let email = $('#email-input').val();
        let department = $('#department-input').val();
        let birthday = $('#birthday-input').val();
        let request = true;
        if (firstname === '') {
            request = false;
            $('#name-input')[0].setCustomValidity('Invalid field.');
            $('#error-message').html('Please enter your name!');
        }
        if (lastname === '') {
            $('#surname-input')[0].setCustomValidity('Invalid field.');
            if (request) $('#error-message').html('Please enter your surname!');
            request = false;
        }
        if (email === '') {
            $('#email-input')[0].setCustomValidity('Invalid field.');
            if (request) $('#error-message').html('Please enter your correct email!');
            request = false;
        }
        if (department === '') {
            $('#department-input')[0].setCustomValidity('Invalid field.');
            if (request) $('#error-message').html('Please enter your department!');
            request = false;
        }
        if (birthday === '') {
            $('#birthday-input')[0].setCustomValidity('Invalid field.');
            if (request) $('#error-message').html('Please enter your birthday!');
            request = false;
        }
        if (birthday < '1900-01-01') {
            $('#birthday-input')[0].setCustomValidity('Invalid field.');
            if (request) $('#error-message').html('Invalid birthday!');
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
        if (birthday > today) {
            $('#birthday-input')[0].setCustomValidity('Invalid field.');
            if (request) $('#error-message').html('Invalid birthday!');
            request = false;
        }
        if (request) {
            AJAXRequest.getInstance().make('changeUserData', {
                oldEmail: userdata.Email,
                name: firstname,
                surname: lastname,
                email: email,
                birthday: birthday,
                department: department
            }, function (result) {
                if (result.status === 'success') {
                    $('#error-message').html('Your data was successfully updated!');
                } else {
                    $('#error-message').html(result.message);
                }
            })
        }
    });

    /**
     * parses date string from database to string that is accepted by date input field
     * BE CAREFUL: works just for specific source string
     * @param date date string
     * @return String formatted date string
     */
    function parseDate(date) {
        let parsedDateString = date.substr(0, 10);
        let parts = parsedDateString.split("-");
        let dateMinusOne = new Date("" + parts[0] + "/" + parts[1] + "/" + parts[2]);
        let _date = new Date(dateMinusOne.getFullYear(), dateMinusOne.getMonth(), dateMinusOne.getDate() + 1);
        return "" + _date.getFullYear() + "-" + (_date.getMonth() < 9 ? ("0" + (_date.getMonth() + 1)) : (_date.getMonth() + 1)) + "-" + (_date.getDate() < 10 ? ("0" + _date.getDate()) : _date.getDate());
    };

    $('body').on('click', 'button.cancel_Skill', function () {
        let skillID;
        if (this.id.length === 15) skillID = this.id.substr(14, 1);
        else {
            skillID = this.id.substr(14, 2)
        }
        //TODO
        AJAXRequest.getInstance().make('deleteSkillData', {
            userID: userdata.UserID,
            skillID: skillID,
            token: cookie.value,
        }, function (result) {
            if (result.status === 'success') {
                AJAXRequest.getInstance().make('getSkillData', {
                    token: cookie.value,
                    userID: userdata.UserID
                }, function (innerResult) {
                    if (innerResult.status !== 'error') {
                        $('#skill_table').empty();
                        for (let i = 0; i < innerResult.length; i++) {
                            $('#skill_table').append('<tr><td><label>' + innerResult[i].Name + '<label/><td/>' +
                                '<td><label>Level:' + innerResult[i].Level + '</label></td>' +
                                '<td><button id="cancel_SkillID' + innerResult[i].SkillID + '" class="cancel_Skill">Delete</button> </td>' +
                                '</tr>')
                        }
                    } else {
                        $('#skills-error').html('Error while fetching skill data!');
                    }
                })
            } else {
                $('#skills-error').html(result.message);
            }
        })
    })
});


function openChangePwDialog() {
    $.confirm({
        title: 'Change password',
        content:
        '<p id="error-message-change-pw" style="color: var(--color-error); font-size: 18px; font-weight: 700;"></p>' +
        '<table>' +
        '   <tr>' +
        '       <td>New password</td>' +
        '       <td><input type="password" id="pw-input" placeholder="New Password"></td>' +
        '   </tr>' +
        '   <tr>' +
        '       <td>Repeat new password</td>' +
        '       <td><input type="password" id="repeat-pw-input" placeholder="Repeat new password"></td>' +
        '   </tr>' +
        '</table>',
        buttons: {
            confirm: {
                text: 'Confirm',
                btnClass: 'colored-button',
                keys: ['Enter'],
                action: function () {
                    let request = true;
                    let pw = $('#pw-input').val();
                    let repeatedPw = $('#repeat-pw-input').val();
                    $('#pw-input')[0].setCustomValidity('');
                    $('#repeat-pw-input')[0].setCustomValidity('');

                    if (pw === '') {
                        $('#pw-input')[0].setCustomValidity('invalid');
                        $('#error-message-change-pw').html('Password can not be empty!');
                        request = false;
                    }
                    if (pw.length < 8) {
                        $('#pw-input')[0].setCustomValidity('invalid');
                        $('#error-message-change-pw').html('Password is to short!');
                        request = false;
                    }
                    if (repeatedPw === '') {
                        $('#repeat-pw-input')[0].setCustomValidity('invalid');
                        if (request) $('#error-message-change-pw').html('Please repeat new Password!');
                        request = false;
                    }
                    if (pw !== repeatedPw) {
                        $('#pw-input')[0].setCustomValidity('invalid');
                        $('#repeat-pw-input')[0].setCustomValidity('invalid');
                        if (request) $('#error-message-change-pw').html('Passwords are not equal!');
                        request = false;
                    }
                    if (request) {
                        let self = this;
                        AJAXRequest.getInstance().make('changePassword', {
                            password: $('#repeat-pw-input').val(),
                            userID: userdata.UserID,
                            token: userdata.token
                        }, function (result) {
                            if (result.status === 'success') {
                                self.close();
                            } else {
                                $('#error-message-change-pw').text(result.message);
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