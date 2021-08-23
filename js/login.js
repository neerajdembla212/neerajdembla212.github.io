(() => {
    // Document ready
    $(function () {
        $('#btn-login').click(() => {
            document.cookie = "accessToken=12345678"
            window.location.href = window.location.origin + "/my-portfolio.html";
        })
    })
})();