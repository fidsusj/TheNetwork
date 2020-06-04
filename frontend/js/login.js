let cookie = Cookie.get('token');
if (cookie !== null) {
    AJAXRequest.getInstance().make('validateToken', {token: cookie.value}, function (result) {
        if (result) {
            console.log(result.Token);
            let cookie = new Cookie('token', result.Token, 7);
            cookie.set();
            window.location.replace('./');
        }
    });
}

$( document ).ready(function () {

    $('#login-btn').on('click', function () {
        AJAXRequest.getInstance().make('login', {
            email: $('#login-email').val(),
            password: $('#login-password').val()
        }, (result) => {
            if (result === false) {
                $('#error-message').html('Wrong credentials!');
            } else {
                console.log(result.Token);
                let cookie = new Cookie('token', result.Token, 7);
                cookie.set();
                window.location.replace('./');
            }
        });
    });

    $('#login-email').on('click',function () {
        $('#error-message').html('');
    })

    $('#login-password').on('click',function () {
        $('#error-message').html('');
    })
});