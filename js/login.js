(() => {
    // Document ready
    $(function () {
        $('#btn-login').click(() => {
            document.cookie = "accessToken=12345678"
            window.location.href = window.location.origin + "/my-portfolio.html";
        })
        $('.select2_dropdown').select2({
            theme: 'bootstrap4',
        });
    })
})();