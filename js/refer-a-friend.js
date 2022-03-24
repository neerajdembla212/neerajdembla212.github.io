(function () {
    // document ready function
    $(function () {
        const accountType = localStorage.getItem('selectedAccountType');
        const container = $('.refer-a-friend')
        if (accountType === 'DEMO') {
            container.removeClass('live-content').addClass('demo-content');
        } else if (accountType === 'LIVE') {
            container.removeClass('demo-content').addClass('live-content');
        }

        // copy referal link to clipboard
        $('#copy-link').unbind().click(function () {
            const copyText = document.getElementById("referal-link-input");
            copyText.select();
            copyText.setSelectionRange(0, 99999); /* For mobile devices */
            /* Copy the text inside the text field */
            navigator.clipboard.writeText(copyText.value);
            renderSuccessToast(i18n.t('body.common.referralLinkCopied'))
        })
        // global function
        initI18nPlugin();
        window.reloadElementsOnLanguageChange = function () {
            renderBuySellData(); // global function
        }
    })
})();