(() => {
    // document ready function
    $(function () {
        $('.current-time').text(formatDate(new Date(), 'HH:mm'))
    })
})();