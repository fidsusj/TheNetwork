/*logic for registration form*/
$( document ).ready(function () {
    $('#register-btn').on('click', function () {
        $('#register-fist-name')[0].setCustomValidity('');
        $('#register-last-name')[0].setCustomValidity('');
        $('#register-email')[0].setCustomValidity('');
        $('#register-department')[0].setCustomValidity('');
        $('#register-birthday')[0].setCustomValidity('');
        $('#register-password')[0].setCustomValidity('');
        $('#register-repeat-password')[0].setCustomValidity('');
        $('#error-message').html('');

        let firstname = $('#register-fist-name').val();
        let lastname = $('#register-last-name').val();
        let email = $('#register-email').val();
        let department = $('#register-department').val();
        let birthday = $('#register-birthday').val();
        let psw = $('#register-password').val();
        let request=true;
        if (firstname === ''){
            request=false;
            $('#register-fist-name')[0].setCustomValidity('Invalid field.');
            $('#error-message').html('Please enter your name!');
        }

        if (lastname === '') {
            $('#register-last-name')[0].setCustomValidity('Invalid field.');
            if(request)$('#error-message').html('Please enter your surname!');
            request =false;
        }

        if (email === ''){
            $('#register-email')[0].setCustomValidity('Invalid field.');
            if(request)$('#error-message').html('Please enter your correct email!');
            request=false;
        }
        if (department === '') {
            $('#register-department')[0].setCustomValidity('Invalid field.');
            if(request)$('#error-message').html('Please enter your department!');
            request=false;
        }
        if (birthday === '') {
            $('#register-birthday')[0].setCustomValidity('Invalid field.');
            if(request)$('#error-message').html('Please enter your birthday!');
            request=false;
        }
        if (birthday <'1900-01-01') {
            $('#register-birthday')[0].setCustomValidity('Invalid field.');
            if(request)$('#error-message').html('Invalid birthday!');
            request=false;
        }
        let today=new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();

        if(dd<10) {
            dd = '0'+dd
        }

        if(mm<10) {
            mm = '0'+mm
        }

        today = yyyy + '-' + mm + '-' + dd;
        if (birthday > today ){
            $('#register-birthday')[0].setCustomValidity('Invalid field.');
            if (request) $('#error-message').html('Invalid birthday!');
            request = false;
        }
        if (psw === ''||psw.length<8) {
            $('#register-password')[0].setCustomValidity('Invalid field.');
            if(request)$('#error-message').html('Password is to short!');
            request=false;
        }
        if (psw === $('#register-repeat-password').val()&&request) {
            AJAXRequest.getInstance().make('createUser', {
                name: firstname,
                surname: lastname,
                email: email,
                password: psw,
                birthday: birthday,
                department: department
            }, function (result) {
                if(result.status ==='success') {
                    let cookie = new Cookie('token', result.token, 7);
                    cookie.set();
                    window.location.replace('./');
                } else {
                    $('#error-message').html(result.message);
                }
            })
        } else {
            $('#register-password')[0].setCustomValidity('Invalid field.');
            $('#register-repeat-password')[0].setCustomValidity('Invalid field.');
            if(request)$('#error-message').html('Passwords are not equal!');
        }


    });
    $(document).keypress(function (e) {
        if(e.which==13){
            $('#register-btn').click();
        }
    })
});