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
        const activeId = getActiveTab().attr('href');
        $(".login-container .nav-tabs > li").click(event => {
            onTabChange($(event.target).attr('href'))
        })
    })

    function onTabChange(tabId) {
        if (!tabId) {
            return
        }
        if (tabId === '#sign-in') {
            $('.notice-content').addClass('d-none');
        } else if (tabId === '#register') {
            $('.notice-content').removeClass('d-none');
        }
    }

    function getActiveTab() {
        return $('.nav.nav-tabs .active')
    }
})();