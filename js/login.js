(() => {
    // Document ready
    $(function () {
        $('#btn-login').click(() => {
            document.cookie = "accessToken=12345678"
            window.location.href = window.location.origin + "/my-portfolio.html";
        })
        $('#btn-signup').click(() => {
            document.cookie = "accessToken=12345678"
            localStorage.setItem('showTour', 'true');
            window.location.href = window.location.origin + "/my-portfolio.html";
        })

        $('.select2_dropdown').select2({
            theme: 'bootstrap4',
        });
        const activeId = getActiveTab().attr('href');
        $(".login-container .nav-tabs > li").click(event => {
            onTabChange($(event.target).attr('href'))
        })
        // init i18n plugin
        initI18nPlugin();
    })

    function initI18nPlugin() {
        $.i18n.init({
            resGetPath: 'locales/__lng__.json',
            load: 'unspecific',
            fallbackLng: false,
            lng: 'en'
        }, function (t) {
            $('#wrapper').i18n();
        });

        $('.language-switcher li').unbind().click(function () {
            const language = $(this).data('value');
            localStorage.setItem('selectedLanguage', language);
            i18n.setLng(language, function () {
                $('#wrapper').i18n();
            })
        })
    }

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