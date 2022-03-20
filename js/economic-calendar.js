(() => {
    // document ready function
    $(function () {
        $('.current-time').text(formatDate(new Date(), 'HH:mm'))
        $('.timezone-offset').text(` (${getTimezoneOffset()})`)
        // global function
        initI18nPlugin();
        window.reloadElementsOnLanguageChange = function () {
            renderBuySellData(); // global function
        }
    })
})();