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
    })
})();