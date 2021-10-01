(() => {
    class State {
        openTrades = [];
        pendingTrades = [];
        closedTrades = [];
        buySellData = {};
        selectedAccount = {
            type: '',
            number: ''
        };
        tradeDetails = {};
        watchlist = [];
        currencySearchResult = [];
        pinnedCurrencies = [];
        paginationData = {
            rowsPerPage: 10,
            total: 0,
            page: 0
        }
        recentOrderDetails = {

        }
        sortData = {
            sortKey: '',
            direction: '' // asc or desc
        }
        getOpenTrades() {
            return this.openTrades;
        }
        setOpenTrades(data) {
            if (!data || !Array.isArray(data)) {
                return
            }
            this.openTrades = data;
        }

        getPendingTrades() {
            return this.pendingTrades;
        }
        setPendingTrades(data) {
            if (!data || !Array.isArray(data)) {
                return
            }
            this.pendingTrades = data;
        }

        getClosedTrades() {
            return this.closedTrades;
        }
        setClosedTrades(data) {
            if (!data || !Array.isArray(data)) {
                return
            }
            this.closedTrades = data;
        }

        getBuySellData() {
            return this.buySellData;
        }
        setBuySellData(data) {
            if (!data) {
                return;
            }
            this.buySellData = data;
        }

        getSelectedAccount() {
            return this.selectedAccount
        }
        setSelectedAccount(data) {
            if (!data || !data.type || !data.number) {
                return;
            }
            this.selectedAccount = data;
        }

        getTradeDetails() {
            return this.tradeDetails;
        }
        setTradeDetails(data) {
            if (!data) {
                return;
            }
            this.tradeDetails = data;
        }

        getWatchList() {
            return this.watchlist;
        }
        setWatchList(data) {
            if (!data || !Array.isArray(data)) {
                return
            }
            this.watchlist = data;
        }

        getCurrencySearchResult() {
            return this.currencySearchResult;
        }
        setCurrencySearchResult(data) {
            if (!data || Array.isArray(data)) {
                this.currencySearchResult = data;
            }
        }

        getPinnedCurrencies() {
            return this.pinnedCurrencies;
        }
        setPinnedCurrencies(data) {
            if (!data || !Array.isArray(data)) {
                return
            }
            this.pinnedCurrencies = data;
        }
        addPinnedCurrency(data) {
            if (!data) {
                return;
            }
            this.pinnedCurrencies.push(data);
        }

        getPaginationData() {
            return this.paginationData;
        }
        setPaginationData(data) {
            if (!data) {
                return;
            }
            this.paginationData = data;
        }

        getRecentOrderDetails() {
            return this.recentOrderDetails;
        }
        setRecentOrderDetails(data) {
            if (!data) {
                return
            }
            this.recentOrderDetails = data;
        }
        getSortData() {
            return this.sortData
        }
        setSortData(data) {
            if (!data) {
                return
            }
            this.sortData = data;
        }
    }

    // Global variables for this file
    const STATE = new State();
    const DESKTOP_MEDIA = window.matchMedia("(max-width: 992px)")
    const MOBILE_MEDIA = window.matchMedia("(max-width: 480px)")
    // document ready function 
    $(function () {
        const accountNo = localStorage.getItem('selectedAccountNo');
        const accontType = localStorage.getItem('selectedAccountType');
        STATE.setSelectedAccount({
            type: accontType,
            number: accountNo
        })
        registerGlobalEvents();
        // Global function
        fetchRecentOrderDetails();
        const activeId = getActiveTab().attr('href');
        onTabChange(activeId);
        // fetching watchlist
        fetchWatchList();
        // adding mock pinned currencies
        STATE.setPinnedCurrencies([
            {
                "id": 1,
                "from_currency": "EUR",
                "to_currency": "USD",
                "currency_rate": 1.2563,
                "currency_delta_percentage": 23.4,
                "currency_delta_amount": -0.00311
            },
            {
                "id": 2,
                "from_currency": "GBP",
                "to_currency": "USD",
                "currency_rate": 1.2563,
                "currency_delta_percentage": 23.4,
                "currency_delta_amount": -0.00311
            },
            {
                "id": 3,
                "from_currency": "AUD",
                "to_currency": "USD",
                "currency_rate": 1.2563,
                "currency_delta_percentage": 23.4,
                "currency_delta_amount": -0.00311
            }
        ])
        renderPinnedCurrencies();
    });

    function registerGlobalEvents() {
        // tabs change event listener
        $(".tabs-container .nav-tabs > li").click(event => {
            onTabChange($(event.target).attr('href'))
        })

        DESKTOP_MEDIA.addEventListener('change', function (event) {
            if (event.matches) {
                // screen width is below 992px;
                renderResponsiveTable()
            } else {
                // screen width is above 992px;
                const activeId = getActiveTab().attr('href');
                onTabChange(activeId);
            }
        })

        MOBILE_MEDIA.addEventListener('change', updateTabNames)
        updateTabNames(MOBILE_MEDIA);

        // chart filter 
        $('.chart-filter .btn').click(event => {
            const target = $(event.currentTarget);
            $('.chart-filter .btn').removeClass('active');
            target.addClass('active');
            const value = target.text();
            console.log(value);
        })
        // init select2 dropdown
        $('.select2_dropdown').select2({
            theme: 'bootstrap4',
        });

        // watchlist search 
        $('#search-currency').change(function (event) {
            console.log(event)
            const searchQuery = event.currentTarget.value;
            fetchCurrenciesSearch(searchQuery);
        })
        // clear search results
        $('.clear-search-results').click(function () {
            // clear search results and go back to watchlist screen
            $('#search-currency').val('');
            renderWatchlists();
        })

        // add new watchlist
        $('#add-new-watchList').click(addNewWatchList)
    }

    function updateTabNames(event) {
        const tabs = $('.trade-section .nav-tabs .nav-link')
        if (event.matches) {
            // screen is below 480px;
            tabs.map((i, tab) => {
                const href = $(tab).attr('href');
                switch (href) {
                    case '#open-trades': tab.text = 'Open'; break;
                    case '#pending-orders': tab.text = 'Pending'; break;
                    case '#closed-trades': tab.text = 'Closed'; break;
                }
            })
        } else {
            // screen is above 480px;
            tabs.map((i, tab) => {
                const href = $(tab).attr('href');
                switch (href) {
                    case '#open-trades': tab.text = 'Open Trades'; break;
                    case '#pending-orders': tab.text = 'Pending Orders'; break;
                    case '#closed-trades': tab.text = 'Closed Trades'; break;
                }
            })
        }
    }

    function onTabChange(tabId) {
        if (!tabId) {
            return
        }
        // reset pagination data
        resetPagination();
        resetSortData()
        switch (tabId) {
            case '#open-trades': fetchOpenTrades(); break;
            case '#pending-orders': fetchPendingTrades(); break;
            case '#closed-trades': fetchClosedTrades(); break;
        }
    }

    // Api call functions start
    function fetchOpenTrades() {
        const paginationData = STATE.getPaginationData();
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/open-trades?limit=${paginationData.rowsPerPage}?page=${paginationData.page}`,
            successCallback: (data) => {
                paginationData.total = data.total;
                STATE.setPaginationData(paginationData);
                STATE.setOpenTrades(data.data);
                if (DESKTOP_MEDIA.matches) {
                    renderResponsiveTradesHTML('open')
                } else {
                    renderOpenTrades();
                }
            },
        });
    }

    function fetchPendingTrades() {
        const paginationData = STATE.getPaginationData();
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/pending-trades?limit=${paginationData.rowsPerPage}?page=${paginationData.page}`,
            successCallback: (data) => {
                paginationData.total = data.total;
                STATE.setPaginationData(paginationData);
                STATE.setPendingTrades(data.data);
                if (DESKTOP_MEDIA.matches) {
                    renderResponsiveTradesHTML('pending')
                } else {
                    renderPendingTrades();
                }
            },
        });
    }

    function fetchClosedTrades() {
        const paginationData = STATE.getPaginationData();
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/closed-trades?limit=${paginationData.rowsPerPage}?page=${paginationData.page}`,
            successCallback: (data) => {
                paginationData.total = data.total;
                STATE.setPaginationData(paginationData);
                STATE.setClosedTrades(data.data);
                if (DESKTOP_MEDIA.matches) {
                    renderResponsiveTradesHTML('closed')
                } else {
                    renderClosedTrades();
                }
            },
        });
    }

    function fetchWatchList() {
        callAjaxMethod({
            url: "https://copypip.free.beeceptor.com/get-watchlist",
            successCallback: (data) => {
                STATE.setWatchList(data.data);
                renderWatchlists();
            },
        });
    }

    function fetchCurrenciesSearch(query) {
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/search-currency?q=${query}`,
            successCallback: (data) => {
                STATE.setCurrencySearchResult(data.data);
                renderCurrencySearchResult();
            },
        });
    }

    function fetchRecentOrderDetails() {
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/get-recent-order-details`,
            successCallback: (data) => {
                STATE.setBuySellData(data.data);
                renderBuySellData();
            },
        });
    }
    // Api call functions end
    function resetPagination() {
        // reset pagination 
        const paginationData = STATE.getPaginationData();
        paginationData.page = 0;
        paginationData.rowsPerPage = 10
        STATE.setPaginationData(paginationData);
    }

    function resetSortData() {
        STATE.setSortData({
            sortKey: '',
            direction: ''
        })
    }
    // render open trades begin
    function renderOpenTrades() {
        const openTrades = STATE.getOpenTrades();
        const container = $('.tab-content #open-trades');
        container.empty().append(getOpenTradesTableHTML(openTrades));
        registerTradeEvents();
    }

    function getOpenTradesTableHTML(data) {
        return `<table class="table mb-0">
        ${getTableHeaders()}
        ${getOpenTradesTableBody(data)}
        ${getOpenTradesTableFooter(data.length)}
        </table>`
    }

    function getTableHeaders() {
        const selectedSort = STATE.getSortData();
        const { sortKey, direction } = selectedSort;
        let arrowClass = '';
        if (direction === 'asc') {
            arrowClass = 'up-arrow-sort';
        } else if (direction === 'desc') {
            arrowClass = 'down-arrow-sort';
        }
        return `
        <thead>
            <tr>
            <th class="pl-2 align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="trade_time">
                    <p class="m-0 p-0">Symbol</p> <i class="arrow ${arrowClass} ml-1 ${sortKey !== 'trade_time' ? 'd-none' : ''}"></i>
                </div>
            </th>
            <th class="text-center align-middle">Trader</th>
            <th class="text-center align-middle">Type</th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="trade_volume">
                    <p class="m-0 p-0">Volume</p> <i class="arrow ${arrowClass} ml-1 ${sortKey !== 'trade_volume' ? 'd-none' : ''}"></i>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="open_price">
                    <p class="m-0 p-0">Open Price</p> <i class="arrow ${arrowClass} ml-1 ${sortKey !== 'open_price' ? 'd-none' : ''}"></i>
                </div>
            </th>
            <th class="text-center align-middle pr-3">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="amount">
                    <p class="m-0 p-0">Amount</p> <i class="arrow ${arrowClass} ml-1 ${sortKey !== 'amount' ? 'd-none' : ''}"></i>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="sl">
                    <p class="m-0 p-0">SL</p> <i class="arrow ${arrowClass} ml-1 ${sortKey !== 'sl' ? 'd-none' : ''}"></i>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="tp">
                    <p class="m-0 p-0">TP</p> <i class="arrow ${arrowClass} ml-1 ${sortKey !== 'tp' ? 'd-none' : ''}"></i>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="current">
                    <p class="m-0 p-0">Current</p> <i class="arrow ${arrowClass} ml-1 ${sortKey !== 'current' ? 'd-none' : ''}"></i>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="swap">
                    <p class="m-0 p-0">Swap</p> <i class="arrow ${arrowClass} ml-1 ${sortKey !== 'swap' ? 'd-none' : ''}"></i>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="profit">
                    <p class="m-0 p-0">Profit</p> <i class="arrow ${arrowClass} ml-1 ${sortKey !== 'profit' ? 'd-none' : ''}"></i>
                </div>
            </th>
            </tr>
        </thead>
        `
    }

    function getOpenTradesTableBody(data) {
        if (!data || !Array.isArray(data)) {
            return
        }
        const rowsHTML = [];
        data.forEach(trade => {
            rowsHTML.push(getOpenTradesTableRow(trade));
        })
        return `
          <tbody>
                ${rowsHTML.join('')}
          </tbody>
          `
    }

    function getOpenTradesTableRow(trade) {
        if (!trade) {
            return '';
        }
        const {
            id,
            from_currency,
            to_currency,
            trade_time,
            trader_image,
            trade_type,
            trade_volume,
            open_price,
            amount,
            sl,
            tp,
            current,
            swap,
            profit } = trade;
        return `<tr id="table-trade-${id}" class="edit-trade-cta cursor-pointer" data-id="${id}" data-toggle="modal" data-target="#edit-trade-modal">
                <td class="pl-2">
                    <p class="mb-0 font-weight-bolder">${from_currency}${to_currency}</p>
                    <p class="mb-0">${formatDate(new Date(+trade_time), "DD/MM/YYYY HH:mm")}</p>
                </td>
                <td class="text-center align-middle d-flex">
                    <img alt="image" class="rounded-circle img-fluid img-sm float-left m-auto" src="${trader_image}" />
                </td>
                <td class="text-center align-middle text-darker-gray font-weight-bolder pl-2">
                    ${trade_type}
                </td>
                <td class="text-center align-middle">
                    ${trade_volume}
                </td>
                <td class="text-center align-middle">
                    ${open_price}
                </td>
                <td class="text-center align-middle font-bold">
                    S$${formatWithCommas(amount)}
                </td>
                <td class="text-center align-middle">
                    ${sl}
                </td>
                <td class="text-center align-middle">
                    ${tp}
                </td>
                <td class="text-center align-middle">
                    <span class="highlight-amount">
                        ${current}
                    </span>
                </td>
                <td class="text-center align-middle text-dark-green">
                    S$${swap}
                </td>
                <td class="text-center align-middle font-bold pl-1 ${+profit > 0 ? 'text-dark-green' : 'text-bleed-red'}">
                    S$${profit}
                </td>
            </tr>
            `
    }

    function getOpenTradesTableFooter(dataLength) {
        const { start, end, total } = getStartEndRecordCount(dataLength, STATE.getPaginationData());
        return `<tfoot>
        <tr>
          <td colspan="11">
          <div class="d-flex justify-content-between align-items-center">
            <p class="mb-0 text-dark-gray small-font">Showing <b>${start}</b> to <b>${end}</b> of <b>${total}</b> trades</p>
            <ul class="pagination d-flex justify-content-end align-items-center m-0">
            <select class="form-control rows-per-page mr-2" name="rows-per-page" id="open-trade-rows-per-page">
                <option value="10">10 Rows per page</option>
                <option value="20">20 Rows per page</option>
                <option value="30">30 Rows per page</option>
                <option value="40">40 Rows per page</option>
            </select>
                <button class="btn btn-default border-0" type="button" id="prev-page-open-trade" disabled="true">
                    <i class="fa fa-angle-left extra-large-font font-weight-bold"></i>
                </button>
                <button class="btn btn-default border-0" type="button" id="next-page-open-trade" disabled="true">
                    <i class="fa fa-angle-right extra-large-font font-weight-bold"></i>
                </button>
                
            </ul>
            </div>
            </td>
        </tr>
      </tfoot>`
    }
    function registerOpenTradeEvents() {
        const paginationData = STATE.getPaginationData();
        // open table footer rows per page
        $('#open-trade-rows-per-page').off().on('change', function () {
            const rowsPerPage = +this.value;
            if (rowsPerPage) {
                paginationData.rowsPerPage = rowsPerPage;
                STATE.setPaginationData(paginationData)
                fetchOpenTrades();
            }
        })
        $('#open-trade-rows-per-page').val(STATE.getPaginationData().rowsPerPage)

        // fetch data with updated params on click of next pagination action
        $('#next-page-open-trade').unbind().click(function () {
            paginationData.page++;
            fetchOpenTrades();
        })
        // fetch data with updated params on click of previous pagination action
        $('#prev-page-open-trade').unbind().click(function () {
            if (paginationData.page > 0) {
                paginationData.page--;
                if (paginationData.page === 0) {
                    $(this).attr('disabled', true);
                }
                fetchOpenTrades();
            } else {
                $(this).attr('disabled', true);
            }
        })

        // disable prev if page number is 0 or less else enable
        if (paginationData.page <= 0) {
            $('#prev-page-open-trade').attr('disabled', true);
        } else {
            $('#prev-page-open-trade').removeAttr('disabled');
        }

        // enable next if page number is max it can be else disable
        const totalPossiblePages = Math.floor(paginationData.total / paginationData.rowsPerPage);
        if (paginationData.page >= totalPossiblePages) {
            $('#next-page-open-trade').attr('disabled', true);
        } else {
            $('#next-page-open-trade').removeAttr('disabled')
        }

        // open trade table sort
        tableSortEvents($('.tab-content #open-trades'), onOpenTableSort);
    }
    // callback to sort open trades
    function onOpenTableSort(key, direction) {
        const openTrades = STATE.getOpenTrades();
        if (!openTrades.length) {
            return
        }
        if (!openTrades[0].hasOwnProperty(key)) {
            return
        }
        openTrades.sort((a, b) => {
            if (direction === 'asc') {
                return a[key] - b[key]
            } else if (direction === 'desc') {
                return b[key] - a[key]
            }
        })
        const selectedSort = {
            sortKey: key,
            direction
        }
        STATE.setSortData(selectedSort);
        renderOpenTrades()
    }
    // render open trades end

    // render responsive open trades start
    function renderResponsiveTradesHTML(tradeType) {
        const openTrades = STATE.getOpenTrades();
        let container;
        let data;
        switch (tradeType) {
            case 'open':
                container = $('.tab-content #open-trades');
                data = STATE.getOpenTrades();
                break;
            case 'pending':
                container = $('.tab-content #pending-orders');
                data = STATE.getPendingTrades();
                break;
            case 'closed':
                container = $('.tab-content #closed-trades');
                data = STATE.getClosedTrades();
                break;
        }
        const rowsHTML = [];
        openTrades.forEach(trade => {
            rowsHTML.push(getResponsiveTradesRow(trade))
        })
        container.empty().append(`
        <div class="responsive-trades">
            ${rowsHTML.join('')}
            ${getResponsiveTradesFooter(data.length, tradeType)}
        </div>`)
        registerTradeEvents();
    }

    function getResponsiveTradesRow(trade) {
        if (!trade) {
            return '';
        }
        const {
            id,
            from_currency,
            to_currency,
            trade_time,
            trader_image,
            trade_type,
            trade_volume,
            open_price,
            amount,
            sl,
            tp,
            current,
            swap,
            profit } = trade;

        return `
        <div class="p-3 edit-trade-cta cursor-pointer" data-id="${id}" data-toggle="modal" data-target="#edit-trade-modal">
            <div class="d-flex justify-content-between align-items-center">
            <div>
                <p class="mb-0 font-weight-bolder">${from_currency}${to_currency} <span class="text-darker-gray">${trade_type}</span></p>
                <p class="mb-0">${formatDate(new Date(+trade_time), "DD/MM/YYYY HH:mm")}</p>
            </div>
            <div class="d-flex align-items-center">
                <p class="mb-0 font-bold mr-3">S$${formatWithCommas(amount)}</p>
                <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${trader_image}" />
            </div>
        </div>
        <div class="d-flex justify-content-between mt-2">
            <div class="mr-3 d-flex flex-column justify-content-between">
                <p class="mb-0 responsive-label">Volume</p>
                <p class="mb-0 font-bold responsive-value">${trade_volume}</p>
            </div>
            <div class="mr-3 d-flex flex-column justify-content-between">
                <p class="mb-0 responsive-label">Price</p>
                <p class="mb-0 font-bold responsive-value">${open_price}</p>
            </div>
            <div class="mr-3 d-flex flex-column justify-content-between">
                <p class="mb-0 responsive-label">Swap</p>
                <p class="mb-0 font-bold responsive-value">${swap}</p>
            </div>
            <div class="mr-3 d-flex flex-column justify-content-between current-amount">
                <p class="mb-0 responsive-label">Current</p>
                <p class="mb-0 font-bold responsive-value highlight-amount">${current}</p>
            </div>
            <div class="mr-3 d-flex flex-column justify-content-between">
                <p class="mb-0 responsive-label">Profit</p>
                <p class="mb-0 font-bold responsive-value ${+profit > 0 ? 'text-dark-green' : 'text-bleed-red'}">S$${profit}</p>
            </div>
            <div class="mr-2 d-flex flex-column justify-content-between">
                <div class="d-flex">
                    <p class="mb-0 mr-2 responsive-label">SL</p>
                    <p class="responsive-value mb-0">${sl}</p>
                </div>
                <div class="d-flex">
                    <p class="mb-0 mr-2 responsive-label">TP</p>
                    <p class="responsive-value mb-0">${tp}</p>
                </div>
            </div>
        </div>
        </div>`
    }
    function getResponsiveTradesFooter(dataLength, tradeType) {
        const { start, end, total } = getStartEndRecordCount(dataLength, STATE.getPaginationData());
        let idPrefix;
        switch (tradeType) {
            case 'open': idPrefix = 'open-trade'; break; // open trade
            case 'pending': idPrefix = 'pending-trade'; break; // pending trade
            case 'closed': idPrefix = 'closed-trade'; break; // closed trade
        }

        return `
        <div class="d-flex justify-content-between align-items-center p-2">
        <p class="mb-0 text-dark-gray small-font">Showing <b>${start}</b> to <b>${end}</b> of <b>${total}</b> trades</p>
        <ul class="pagination d-flex justify-content-end align-items-center m-0">
            <select class="form-control rows-per-page mr-2" name="rows-per-page" id="${idPrefix}-rows-per-page">
                <option value="10">10 Rows per page</option>
                <option value="20">20 Rows per page</option>
                <option value="30">30 Rows per page</option>
                <option value="40">40 Rows per page</option>
            </select>
            <button class="btn btn-default border-0" type="button" id="prev-page-${idPrefix}" disabled="true">
                <i class="fa fa-angle-left extra-large-font font-weight-bold"></i>
            </button>
            <button class="btn btn-default border-0" type="button" id="next-page-${idPrefix}" disabled="true">
                <i class="fa fa-angle-right extra-large-font font-weight-bold"></i>
            </button>
        </ul>
        </div>
        `
    }
    // render responsive open trades end

    // render pending trades begin
    function renderPendingTrades() {
        const pendingTrades = STATE.getPendingTrades();
        const container = $('.tab-content #pending-orders');
        container.empty().append(getPendingTradesTableHTML(pendingTrades));
        registerTradeEvents();
    }

    function getPendingTradesTableHTML(data) {
        return `<table class="table">
        ${getTableHeaders()}
        ${getPendingTradesTableBody(data)}
        ${getPendingTradesTableFooter(data.length)}
        </table>`
    }

    function getPendingTradesTableBody(data) {
        if (!data || !Array.isArray(data)) {
            return
        }
        const rowsHTML = [];
        data.forEach(trade => {
            rowsHTML.push(getPendingTradesTableRow(trade));
        })
        return `
          <tbody data-toggle="modal" data-target="#edit-trade-modal">
            ${rowsHTML.join('')}
          </tbody>
          `
    }

    function getPendingTradesTableRow(trade) {
        if (!trade) {
            return '';
        }
        const {
            id,
            from_currency,
            to_currency,
            trade_time,
            trader_image,
            trade_type,
            trade_volume,
            open_price,
            amount,
            sl,
            tp,
            current,
            swap,
            profit } = trade;
        return `<tr id="table-trade-${id}" class="edit-trade-cta cursor-pointer" data-id="${id}">
                <td class="w-18">
                    <p class="mb-0 font-weight-bolder">${from_currency}${to_currency}</p>
                    <p class="mb-0">${formatDate(new Date(+trade_time), "DD/MM/YYYY HH:mm")}</p>
                </td>
                <td class="text-center align-middle w-9 pl-2" align="center">
                    <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${trader_image}" />
                </td>
                <td class="text-center align-middle text-darker-gray font-weight-bolder w-9 pl-2">
                    ${trade_type}
                </td>
                <td class="text-center align-middle w-9 pl-2">
                    ${trade_volume}
                </td>
                <td class="text-center align-middle w-17 pl-2">
                    ${open_price}
                </td>
                <td class="text-center align-middle font-bold w-9 pl-3">
                    S$${formatWithCommas(amount)}
                </td>
                <td class="text-center align-middle w-9 pl-3">
                    ${sl}
                </td>
                <td class="text-center align-middle w-9">
                    ${tp}
                </td>
                <td class="text-center align-middle w-9">
                    <span class="highlight-amount">
                        ${current}
                    </span>
                </td>
                <td class="text-center align-middle text-dark-green w-9">
                    S$${swap}
                </td>
                <td class="text-center align-middle w-9 font-bold pl-1 ${+profit > 0 ? 'text-dark-green' : 'text-bleed-red'}">
                    S$${profit}
                </td>
            </tr>
            `
    }

    function getPendingTradesTableFooter(dataLength) {
        const { start, end, total } = getStartEndRecordCount(dataLength, STATE.getPaginationData());
        return `<tfoot>
        <tr>
          <td colspan="11">
          <div class="d-flex justify-content-between align-items-center">
          <p class="mb-0 text-dark-gray small-font">Showing <b>${start}</b> to <b>${end}</b> of <b>${total}</b> trades</p>
          <ul class="pagination d-flex justify-content-end align-items-center m-0">
          <select class="form-control rows-per-page mr-2" name="rows-per-page" id="pending-trade-rows-per-page">
              <option value="10">10 Rows per page</option>
              <option value="20">20 Rows per page</option>
              <option value="30">30 Rows per page</option>
              <option value="40">40 Rows per page</option>
          </select>
              <button class="btn btn-default border-0" type="button" id="prev-page-pending-trade">
                  <i class="fa fa-angle-left extra-large-font font-weight-bold"></i>
              </button>
              <button class="btn btn-default border-0" type="button" id="next-page-pending-trade">
                  <i class="fa fa-angle-right extra-large-font font-weight-bold"></i>
              </button>
              
          </ul>
          </div>
          </td>
        </tr>
      </tfoot>`
    }
    function registerPendingTradesEvents() {
        const paginationData = STATE.getPaginationData();
        // open table footer rows per page
        $('#pending-trade-rows-per-page').off().on('change', function () {
            const rowsPerPage = +this.value;
            if (rowsPerPage) {
                paginationData.rowsPerPage = rowsPerPage;
                STATE.setPaginationData(paginationData)
                fetchPendingTrades();
            }
        })
        $('#pending-trade-rows-per-page').val(STATE.getPaginationData().rowsPerPage)

        // fetch data with updated params on click of next pagination action
        $('#next-page-pending-trade').unbind().click(function () {
            paginationData.page++;
            fetchPendingTrades();
        })
        // fetch data with updated params on click of previous pagination action
        $('#prev-page-pending-trade').unbind().click(function () {
            if (paginationData.page > 0) {
                paginationData.page--;
                if (paginationData.page === 0) {
                    $(this).attr('disabled', true);
                }
                fetchPendingTrades();
            } else {
                $(this).attr('disabled', true);
            }
        })

        // disable prev if page number is 0 or less else enable
        if (paginationData.page <= 0) {
            $('#prev-page-pending-trade').attr('disabled', true);
        } else {
            $('#prev-page-pending-trade').removeAttr('disabled');
        }

        // enable next if page number is max it can be else disable
        const totalPossiblePages = Math.floor(paginationData.total / paginationData.rowsPerPage);
        if (paginationData.page >= totalPossiblePages) {
            $('#next-page-pending-trade').attr('disabled', true);
        } else {
            $('#next-page-pending-trade').removeAttr('disabled')
        }
        // pending trade table sort
        tableSortEvents($('.tab-content #pending-orders'), onPendingTableSort);
    }
    // render pending trades end
    // callback to sort pending trades
    function onPendingTableSort(key, direction) {
        const pendingTrades = STATE.getPendingTrades();
        if (!pendingTrades.length) {
            return
        }
        if (!pendingTrades[0].hasOwnProperty(key)) {
            return
        }
        pendingTrades.sort((a, b) => {
            if (direction === 'asc') {
                return a[key] - b[key]
            } else if (direction === 'desc') {
                return b[key] - a[key]
            }
        })
        const selectedSort = {
            sortKey: key,
            direction
        }
        STATE.setSortData(selectedSort);
        renderPendingTrades()
    }
    // render open trades begin
    function renderClosedTrades() {
        const closedTrades = STATE.getClosedTrades();
        const container = $('.tab-content #closed-trades');
        container.empty().append(getClosedTradesTableHTML(closedTrades));
        registerTradeEvents();
    }

    function getClosedTradesTableHTML(data) {
        return `<table class="table">
            ${getTableHeaders()}
            ${getClosedTradesTableBody(data)}
            ${getClosedTradesTableFooter(data.length)}
            </table>`
    }

    function getClosedTradesTableBody(data) {
        if (!data || !Array.isArray(data)) {
            return
        }
        const rowsHTML = [];
        data.forEach(trade => {
            rowsHTML.push(getClosedTradesTableRow(trade));
        })
        return `
              <tbody data-toggle="modal" data-target="#edit-trade-modal">
                ${rowsHTML.join('')}
              </tbody>
              `
    }

    function getClosedTradesTableRow(trade) {
        if (!trade) {
            return '';
        }
        const {
            id,
            from_currency,
            to_currency,
            trade_time,
            trader_image,
            trade_type,
            trade_volume,
            open_price,
            amount,
            sl,
            tp,
            current,
            swap,
            profit } = trade;
        return `<tr id="table-trade-${id}" class="edit-trade-cta cursor-pointer" data-id="${id}">
                <td class="w-18">
                    <p class="mb-0 font-weight-bolder">${from_currency}${to_currency}</p>
                    <p class="mb-0">${formatDate(new Date(+trade_time), "DD/MM/YYYY HH:mm")}</p>
                </td>
                <td class="text-center align-middle w-9 pl-2" align="center">
                    <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${trader_image}" />
                </td>
                <td class="text-center align-middle text-darker-gray font-weight-bolder w-9 pl-2">
                    ${trade_type}
                </td>
                <td class="text-center align-middle w-9 pl-2">
                    ${trade_volume}
                </td>
                <td class="text-center align-middle w-17 pl-2">
                    ${open_price}
                </td>
                <td class="text-center align-middle font-bold w-9 pl-3">
                    S$${formatWithCommas(amount)}
                </td>
                <td class="text-center align-middle w-9 pl-3">
                    ${sl}
                </td>
                <td class="text-center align-middle w-9">
                    ${tp}
                </td>
                <td class="text-center align-middle w-9">
                    <span class="highlight-amount">
                        ${current}
                    </span>
                </td>
                <td class="text-center align-middle text-dark-green w-9">
                    S$${swap}
                </td>
                <td class="text-center align-middle w-9 font-bold pl-1 ${+profit > 0 ? 'text-dark-green' : 'text-bleed-red'}">
                    S$${profit}
                </td>
            </tr>
            `
    }

    function getClosedTradesTableFooter(dataLength) {
        const { start, end, total } = getStartEndRecordCount(dataLength, STATE.getPaginationData());
        return `<tfoot>
            <tr>
              <td colspan="11">
              <div class="d-flex justify-content-between align-items-center">
              <p class="mb-0 text-dark-gray small-font">Showing <b>${start}</b> to <b>${end}</b> of <b>${total}</b> trades</p>
              <ul class="pagination d-flex justify-content-end align-items-center m-0">
              <select class="form-control rows-per-page mr-2" name="rows-per-page" id="closed-trade-rows-per-page">
                  <option value="10">10 Rows per page</option>
                  <option value="20">20 Rows per page</option>
                  <option value="30">30 Rows per page</option>
                  <option value="40">40 Rows per page</option>
              </select>
                  <button class="btn btn-default border-0" type="button" id="prev-page-closed-trade">
                      <i class="fa fa-angle-left extra-large-font font-weight-bold"></i>
                  </button>
                  <button class="btn btn-default border-0" type="button" id="next-page-closed-trade">
                      <i class="fa fa-angle-right extra-large-font font-weight-bold"></i>
                  </button>
                  
              </ul>
              </div>
              </td>
            </tr>
          </tfoot>`
    }

    function registerTradeEvents() {
        const activeTabId = getActiveTab().attr('href');
        switch (activeTabId) {
            case '#open-trades': registerOpenTradeEvents(); break;
            case '#pending-orders': registerPendingTradesEvents(); break;
            case '#closed-trades': registerClosedTradeEvents(); break;
        }
        // edit trade popup on click of row
        $(`${activeTabId} .edit-trade-cta`).unbind().click(function (event) {
            const tradeId = $(event.currentTarget).data('id')
            STATE.setTradeDetails({ id: tradeId })
            fetchTradeDetails(tradeId);
        })
    }



    function registerClosedTradeEvents() {
        const paginationData = STATE.getPaginationData();
        // open table footer rows per page
        $('#closed-trade-rows-per-page').off().on('change', function () {
            const rowsPerPage = +this.value;
            if (rowsPerPage) {
                paginationData.rowsPerPage = rowsPerPage;
                STATE.setPaginationData(paginationData)
                fetchClosedTrades();
            }
        })
        $('#closed-trade-rows-per-page').val(STATE.getPaginationData().rowsPerPage)

        // fetch data with updated params on click of next pagination action
        $('#next-page-closed-trade').unbind().click(function () {
            paginationData.page++;
            fetchClosedTrades();
        })
        // fetch data with updated params on click of previous pagination action
        $('#prev-page-closed-trade').unbind().click(function () {
            if (paginationData.page > 0) {
                paginationData.page--;
                if (paginationData.page === 0) {
                    $(this).attr('disabled', true);
                }
                fetchClosedTrades();
            } else {
                $(this).attr('disabled', true);
            }
        })

        // disable prev if page number is 0 or less else enable
        if (paginationData.page <= 0) {
            $('#prev-page-closed-trade').attr('disabled', true);
        } else {
            $('#prev-page-closed-trade').removeAttr('disabled');
        }

        // enable next if page number is max it can be else disable
        const totalPossiblePages = Math.floor(paginationData.total / paginationData.rowsPerPage);
        if (paginationData.page >= totalPossiblePages) {
            $('#next-page-closed-trade').attr('disabled', true);
        } else {
            $('#next-page-closed-trade').removeAttr('disabled')
        }
        // closed trade table sort
        tableSortEvents($('.tab-content #closed-trades'), onClosedTableSort);
    }
    // render closed trades end

    // callback to sort closed trades
    function onClosedTableSort(key, direction) {
        const openTrades = STATE.getClosedTrades();
        if (!openTrades.length) {
            return
        }
        if (!openTrades[0].hasOwnProperty(key)) {
            return
        }
        openTrades.sort((a, b) => {
            if (direction === 'asc') {
                return a[key] - b[key]
            } else if (direction === 'desc') {
                return b[key] - a[key]
            }
        })
        const selectedSort = {
            sortKey: key,
            direction
        }
        STATE.setSortData(selectedSort);
        renderClosedTrades()
    }
    // render buy sell section start
    function renderBuySellData() {
        const buySellData = STATE.getBuySellData();
        const container = $('.buy-sell-section');
        container.empty().append(getBuySellDataHTML(buySellData));
        buySellSectionAdjustHeight();
        registerBuySellEvents();
    }

    function getBuySellDataHTML(data) {
        if (!data) {
            return;
        }
        const {
            status,
            order_number,
            order_type,
            order_time,
            type,
            profit,
            loss } = data;

        const orderDetailsHTML = status !== 'NEW' ? `
        <div class="d-flex justify-content-between mb-3">
            <p class="mb-0 font-weight-bold text-dark-gray">${order_type} ORDER #${order_number}</p>
            <p class="mb-0">${formatDate(new Date(order_time), 'DD/MM/YYYY HH:mm')}</p>
        </div>
            ` : '';

        const typeValue = status !== 'NEW' ? type : 'Market Execution';

        const profitInputHTML = status !== 'NEW' ? `<input type="text" disabled class="form-control" id="profit-input" value="${profit}">` : `<input type="text" class="form-control" id="profit-input">`;
        const lossInputHTML = status !== 'NEW' ? `<input type="text" disabled class="form-control" id="loss-input" value="${loss}">` : `<input type="text" class="form-control" id="loss-input">`;
        return `
        <!-- order by account start -->
        <div class="d-flex justify-content-between mb-3">
          <p class="mb-0 font-bold">Order by Account</p>
          <div class="account-number p-1"><span class="mr-1 text-navy live small-font">${STATE.getSelectedAccount().type}</span><span
              class="medium-font font-bold small-font">${STATE.getSelectedAccount().number}</span>
          </div>
        </div>
        <!-- order by account end -->
        <!-- order details start -->
        ${orderDetailsHTML}
       <!-- order details end -->
        <!-- Currency exchange input start -->
        <div class="d-flex justify-content-between mb-3 align-items-center">
          <div class="line-height-md">
            <p class="mb-0 extra-large-font font-bold text-modal-black">EURUSD</p>
            <p class="mb-0 medium-font font-weight-light text-gray">Volume</p>
          </div>
          <div class="w-50 position-relative">
            <input type="text" class="form-control" placeholder="0.01 - 100" id="volume-input">
          </div>
        </div>
        <!-- Currency exchange input end -->
        <div class="divider mb-3"></div>
        <!-- Type input start -->
        <div class="d-flex justify-content-between mb-3 align-items-center">
            <p class="mb-0 font-weight-light medium-font">Type</p>
            <button id="btn-type-input" data-toggle="dropdown" class="btn dropdown-toggle btn-dropdown font-bold" aria-expanded="false">
                ${typeValue}
            </button>
            <ul id="type-input-menu" class="dropdown-menu">
                <li><a class="dropdown-item" href="#">Market Execution</a></li>
                <li><a class="dropdown-item" href="#">Pending Order</a></li>
            </ul>
        </div>
        <!-- Type input end -->
        <div class="divider mb-3"></div>
        <div class="dynamic-elements"></div>
        <!-- Profit loss display start -->
        ${getProfitLossDisplayHTML()}
        <!-- Profit loss display end -->
        <!-- Profit loss input start -->
        <div class="d-flex justify-content-between mb-2">
            <p class="mb-0 font-weight-light medium-font">Take Profit</p>
            <p class="mb-0 font-weight-light medium-font">Stop Loss</p>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="position-relative w-35">
                ${profitInputHTML}
           </div>
            <span class="font-bold medium-font text-dark-black">price</span>
            <div class="position-relative w-35">
                ${lossInputHTML}
            </div>
        </div>
        <!-- Profit loss input end -->
        <!-- Buy Sell CTA start -->
        ${getBuySellSectionCTA(status)}
        <!-- Buy Sell CTA end -->
        <!-- one Click trading start-->
        <div class="d-flex justify-content-between align-items-center">
            <p class="mb-0 text-gray font-weight-light">One click trading</p>
            <input type="checkbox" class="js-switch" checked />
        </div>
        <!-- one Click trading end-->`
    }

    function getProfitLossDisplayHTML() {
        const { status,
            from_currency_rate,
            from_currency_delta,
            to_currency_rate,
            to_currency_delta,
            from_currency,
            to_currency,
            volume,
            order_number,
            order_type } = STATE.getBuySellData();
        switch (status) {
            case 'NEW':
            case 'ORDER_PLACED':
                return `
                <div class="d-flex justify-content-between mb-3 align-items-center">
                <div>
                    <p class="mb-0 super-extra-large-font font-bold text-modal-black">${from_currency_rate}</p>
                    <p class="mb-0 small-font text-dark-green d-flex align-items-center"><span
                          class="up-arrow-green mr-1"></span>+${from_currency_delta}
                    </p>
                </div>
                <div>
                    <p class="mb-0 super-extra-large-font font-bold text-modal-black">${to_currency_rate}</p>
                    <p class="mb-0 small-font text-dark-green d-flex align-items-center"><span
                          class="up-arrow-green mr-1"></span>+${to_currency_delta}
                </div>
            </div>
                `
            case 'TRADE_INITIATED':
                return `
            <div class="mb-2 d-flex">
                <p class="mb-0">#${order_number} <p class="mb-0 text-lowercase">&nbsp;${order_type}&nbsp;</p>${volume} ${from_currency}${to_currency} at ${to_currency_rate}</p>
            </div>
            <p class="mb-3 text-light-green super-extra-large-font font-bold">Trade Initiated</p>
            `
            case 'TRADE_PROCESSING':
                return `
            <div class="mb-2 d-flex">
                <p class="mb-0">#${order_number} <p class="mb-0 text-lowercase">&nbsp;${order_type}&nbsp;</p>${volume} ${from_currency}${to_currency} at ${to_currency_rate}</p>
            </div>
            <p class="mb-3 text-extra-light-blue super-extra-large-font font-bold">Trade Processing</p>
            `
            case 'NO_CONNECTION':
                return `
            <div class="mb-2 d-flex">
                <p class="mb-0">#${order_number} <p class="mb-0 text-lowercase">&nbsp;${order_type}&nbsp;</p>${volume} ${from_currency}${to_currency} at ${to_currency_rate}</p>
            </div>
            <p class="mb-3 text-light-brown super-extra-large-font font-bold">No Connection</p>
            `
            case 'TRADE_CLOSED':
                return `
            <div class="mb-2 d-flex">
                <p class="mb-0">#${order_number} <p class="mb-0 text-lowercase">&nbsp;${order_type}&nbsp;</p>${volume} ${from_currency}${to_currency} at ${to_currency_rate}</p>
            </div>
            <p class="mb-3 super-extra-large-font font-bold">Closed ${volume} at ${to_currency_rate}</p>
            `
            case 'CANCELLED':
                return `
            <div class="mb-2 d-flex">
                <p class="mb-0">#${order_number} <p class="mb-0 text-lowercase">&nbsp;${order_type}&nbsp;</p>${volume} ${from_currency}${to_currency} at ${to_currency_rate}</p>
            </div>
            <p class="mb-3 text-blur-gray super-extra-large-font font-bold">Cancelled</p>
            `
            default: return ``;
        }
    }
    function getBuySellSectionCTA(status) {
        if (status === 'NEW') {
            return `<div class="d-flex justify-content-between mb-3">
            <button id="sell-trade" type="button" class="btn btn-w-m btn-default btn-bleed-red w-45 text-white">
            Sell
            </button>
            <button id="buy-trade" type="button" class="btn btn-w-m btn-primary w-45">
            Buy
            </button>
            </div>`
        } else if (status === "ORDER_PLACED") {
            return `
            <div class="d-flex justify-content-between mb-3">
                <button id="cancel-trade" type="button" class="btn btn-w-m btn-default w-45 text-bleed-red font-bold">
                    Cancel Order
                </button>
                <button type="button" class="btn btn-w-m btn-blue w-45 text-white font-bold">
                    Modify
                </button>
            </div>
            <button id="create_new_order" type="button" class="btn btn-w-m btn-block w-45 text-blue font-bold m-auto">Create New Order</button>
            `
        } else {
            return `
                <button id="create_new_order" type="button" class="btn btn-w-m btn-block w-45 text-blue font-bold m-auto mb-3">Create New Order</button>
            `
        }
    }

    function buySellSectionAdjustHeight() {
        const { status } = STATE.getBuySellData();
        if (status === 'ORDER_PLACED') {
            $('.buy-sell-section').css('max-height', '512px');
        } else if (status === 'NEW') {
            $('.buy-sell-section').css('max-height', '444px');
        } else {
            $('.buy-sell-section').css('max-height', '472px');
        }
    }

    function renderPendingOrderFormControls(mode) {
        let container;
        if (mode === 'edit') {
            container = $('#edit-trade-modal .dynamic-elements')
        } else {
            container = $('.buy-sell-section .dynamic-elements')
        }
        container.empty().append(getPendingOrderControls())
        registerPendingOrderEvents();
    }

    function getPendingOrderControls() {
        const buySellData = STATE.getBuySellData();
        const { gtc_expiration_date } = buySellData;
        return ` <!-- Order Type input start -->
        <div class="d-flex justify-content-between mb-3 align-items-center">
            <p class="mb-0 font-weight-light medium-font">Order Type</p>
            <button id="btn-order-type-input" data-toggle="dropdown" class="btn dropdown-toggle btn-dropdown font-bold" aria-expanded="false">
                Buy Limit
            </button>
            <ul id="order-type-input-menu" class="dropdown-menu">
                <li><a class="dropdown-item" href="#">Buy Limit</a></li>
                <li><a class="dropdown-item" href="#">Sell Limit</a></li>
                <li><a class="dropdown-item" href="#">Buy Stop</a></li>
                <li><a class="dropdown-item" href="#">Sell Stop</a></li>
            </ul>
        </div>
        <!-- Order Type input end -->
        <div class="divider mb-3"></div>
        <!-- Expiration input start -->
        <div class="d-flex justify-content-between mb-3 align-items-center">
            <p class="mb-0 font-weight-light medium-font">Expiration</p>
            <button id="btn-expiration-input" data-toggle="dropdown" class="btn dropdown-toggle btn-dropdown font-bold" aria-expanded="false">
                Day Order
            </button>
            <ul id="expiration-input-menu" class="dropdown-menu">
                <li><a class="dropdown-item" href="#">Good Till Cancelled (GTC)</a></li>
                <li><a class="dropdown-item" href="#">Day Order</a></li>
                <li><a class="dropdown-item" href="#">Specific</a></li>
            </ul>
        </div>
        <!-- Expiration input end -->
        <div class="divider mb-3"></div>
        <!-- Expiration Date input start -->
        <div class="d-flex justify-content-between mb-3 align-items-center">
            <p class="mb-0 font-weight-light medium-font">Expiration Date</p>
            <div class="date" id="expiration-date-input">
                <button id="btn-expiration-date-input" class="btn dropdown-toggle btn-dropdown font-bold" aria-expanded="false">
                ${formatDate(new Date(gtc_expiration_date))}
            </button>
            </div>
        </div>
        <!-- Expiration Date input end -->
        <div class="divider mb-3"></div>
        <!-- Price input start -->
        <div class="d-flex justify-content-between mb-3 align-items-center">
            <p class="mb-0 font-weight-light medium-font">Price</p>
            <input type="text" class="form-control w-50">
        </div>
        <!-- Price input end -->
        `
    }

    function renderMarketExecutionFormControls(mode) {
        let container;
        if (mode === 'edit') {
            container = $('#edit-trade-modal .dynamic-elements')
        } else {
            container = $('.buy-sell-section .dynamic-elements')
        }
        container.empty();
    }
    function registerPendingOrderEvents() {
        // order type dropdown menu
        $('#order-type-input-menu.dropdown-menu').click(event => {
            const selectedItem = event.target.innerText.trim();
            const selectedButton = $('#btn-order-type-input')
            selectedButton.text(selectedItem);
        })

        // expiration dropdown menu
        $('#expiration-input-menu.dropdown-menu').click(event => {
            const selectedItem = event.target.innerText.trim();
            const selectedButton = $('#btn-expiration-input')
            selectedButton.text(selectedItem);
            if (selectedItem.toUpperCase() === 'GOOD TILL CANCELLED (GTC)') {
                $('#btn-expiration-date-input').attr('disabled', 'true');
            } else if (selectedItem.toUpperCase() === 'DAY ORDER') {
                const expirationDate = STATE.getBuySellData().day_order_expiration_date;
                $('#btn-expiration-date-input').datepicker('setDate', new Date(expirationDate));
            } else {
                $('#btn-expiration-date-input').removeAttr('disabled');
            }
        })

        // expiration date picker
        $('#expiration-date-input').datepicker({
            todayBtn: "linked",
            keyboardNavigation: true,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true
        }).on('changeDate', function (e) {
            const displayDateButton = $('#btn-expiration-date-input');
            displayDateButton.text(formatDate(e.date, "DD MM YYYY HH:mm"));
        });
        const buySellData = STATE.getBuySellData();
        const expirationDate = new Date(buySellData.gtc_expiration_date);
        $('#expiration-date-input').datepicker('setDate', expirationDate);
    }
    function registerBuySellEvents() {
        // switchery radio button
        var elem = document.querySelector('.buy-sell-section .js-switch');
        new Switchery(elem, {
            color: '#E5E5E5',
            secondaryColor: '#E5E5E5',
            jackColor: '#22D091',
            jackSecondaryColor: "#FFFFFF",
        });
        // change status on click of buy CTA
        $('.buy-sell-section #buy-trade').unbind().click(function () {
            const buySellData = STATE.getBuySellData();
            buySellData.status = 'ORDER_PLACED';
            buySellData.order_number = buySellData.order_number ? +buySellData.order_number + 1 : 10796400
            buySellData.order_type = 'BUY';
            STATE.setBuySellData(buySellData);
            renderBuySellData();
        })
        // change status on click of sell CTA
        $('.buy-sell-section #sell-trade').unbind().click(function () {
            const buySellData = STATE.getBuySellData();
            buySellData.status = 'ORDER_PLACED';
            buySellData.order_number = buySellData.order_number ? +buySellData.order_number + 1 : 10796400
            buySellData.order_type = 'SELL';
            STATE.setBuySellData(buySellData);
            renderBuySellData();
        })

        $('.buy-sell-section #cancel-trade').unbind().click(function () {
            const buySellData = STATE.getBuySellData();
            buySellData.status = 'CANCELLED';
            STATE.setBuySellData(buySellData);
            renderBuySellData();
        })

        // reset to empty state on click of create new order
        $('#create_new_order').unbind().click(function () {
            const buySellData = STATE.getBuySellData();
            buySellData.status = 'NEW';
            buySellData.order_number = '';
            buySellData.order_type = '';
            STATE.setBuySellData(buySellData);
            renderBuySellData();
        })
        validateBuySellInputs();
    }

    function validateBuySellInputs() {
        // validate volume input 
        validateTextInput($('#volume-input'), function (val) {
            if (isNaN(val)) {
                return false;
            }
            if (val === '') {
                return true;
            }
            const numVal = Number(val);
            if (numVal >= 0.01 && numVal <= 100) {
                return true
            }
            return false
        })
        // validate take profit input
        validateTextInput($('#profit-input'), function (val) {
            if (isNaN(val)) {
                return false;
            }
            if (val === '') {
                return true;
            }
            const numVal = Number(val);
            if (numVal >= 0) {
                return true
            }
            return false
        }, 'Number only')

        // validate stop loss input
        validateTextInput($('#loss-input'), function (val) {
            if (isNaN(val)) {
                return false;
            }
            if (val === '') {
                return true;
            }
            const numVal = Number(val);
            if (numVal >= 0) {
                return true
            }
            return false
        }, 'Number only')

    }
    // render buy sell section end

    // render edit trade popup start
    function fetchTradeDetails(tradeId) {
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/get-trade?id=${tradeId}`,
            successCallback: (data) => {
                STATE.setTradeDetails(data.data);
                renderEditTradeModal();
                registerEditTradeModalEvents();
            },
        });
    }

    function renderEditTradeModal() {
        $('#edit-trade-modal').empty().append(getEditTradeModalHTML())
    }

    function getEditTradeModalHTML() {
        const tradeDetails = STATE.getTradeDetails();
        const { order_number,
            trade_time,
            order_type,
            trade_volume,
            order_account_number,
            order_account_type,
            from_currency_rate,
            from_currency_delta,
            to_currency_rate,
            to_currency_delta,
            tp,
            sl
        } = tradeDetails;
        return `
        <div class="modal-dialog modal-dialog-center">
            <div class="modal-content animated fadeIn">
                <!-- Modal Header start -->
                <div class="d-flex justify-content-between m-3">
                    <h4 class="modal-title">Edit Order</h4>
                    <button id="close-modal" class="btn
                        btn-default
                        btn-outline
                        btn-action
                        border-0
                    " data-dismiss="modal">
                        <img src="img/ic_cross.svg">
                    </button>
                </div>
                <!-- Modal Header end -->
                <div class="p-0 modal-body">
                    <!-- Sell order details start -->
                    <div class="d-flex justify-content-between mb-3 mx-3">
                        <div class="d-flex align-items-center">
                            <p class="mb-0 font-weight-bolder large-font mr-1 text-dark-gray">SELL ORDER</p>
                            <p class="mb-0 medium-font">#${order_number}</p>
                        </div>
                        <p class="mb-0 medium-font">${formatDate(new Date(trade_time), 'DD/MM/YYYY HH:mm')}</p>
                    </div>
                    <!-- Sell order details end -->
                    <!-- order account details start -->
                    <div class="d-flex justify-content-between mb-3 align-items-center mx-3">
                        <p class="mb-0 font-weight-bolder medium-font text-dark-gray">Order by Account</p>
                        <div class="account-number py-1 px-3"><span class="mr-1 text-navy live small-font">${order_account_type}</span><span
                            class="medium-font font-bold small-font">${order_account_number}</span>
                        </div>
                    </div>
                    <!-- order account details end -->
                    <!-- Currency exchange input start -->
                    <div class="d-flex justify-content-between mb-3 align-items-center mx-3">
                    <div class="line-height-md">
                        <p class="mb-0 extra-large-font font-bold text-modal-black">EURUSD</p>
                        <p class="mb-0 medium-font font-weight-light text-gray">Volume</p>
                    </div>
                    <input type="text" disabled class="form-control w-45" placeholder="0.01 - 100" value="${trade_volume}">
                    </div>
                    <!-- Currency exchange input end -->
                    <div class="divider mb-3 mx-3"></div>
                    <!-- Type input start -->
                    <div class="d-flex justify-content-between mb-3 align-items-center mx-3">
                        <p class="mb-0 font-weight-light medium-font">Type</p>
                        <button id="btn-type-input-edit" data-toggle="dropdown" class="btn dropdown-toggle btn-dropdown font-bold" aria-expanded="false">
                            ${order_type}
                        </button>
                        <ul id="type-input-menu-edit" class="dropdown-menu">
                            <li><a class="dropdown-item" href="#">Market Execution</a></li>
                            <li><a class="dropdown-item" href="#">Pending Order</a></li>
                        </ul>
                    </div>
                    <!-- Type input end -->
                    <div class="divider mb-3"></div>
                    <div class="dynamic-elements mx-3"></div>
                    <!-- Profit loss display start -->
                    <div class="d-flex justify-content-between mb-3 align-items-center mx-3">
                        <div>
                            <p class="mb-0 super-extra-large-font font-bold text-modal-black">${from_currency_rate}</p>
                            <p class="mb-0 small-font text-dark-green d-flex align-items-center"><span
                                class="up-arrow-green mr-1"></span>+${from_currency_delta}
                            </p>
                        </div>
                        <div>
                            <p class="mb-0 super-extra-large-font font-bold text-modal-black">${to_currency_rate}</p>
                            <p class="mb-0 small-font text-dark-green d-flex align-items-center"><span
                                class="up-arrow-green mr-1"></span>+${to_currency_delta}
                        </div>
                    </div>
                    <!-- Profit loss display end -->
                    <!-- Profit loss input start -->
                    <div class="d-flex justify-content-between mb-2 mx-3">
                        <p class="mb-0 font-weight-light medium-font">Take Profit</p>
                        <p class="mb-0 font-weight-light medium-font">Stop Loss</p>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-3 mx-3">
                        <input type="text" class="form-control w-35" id="edit-profit-input" value="${tp}">
                        <span class="font-bold medium-font text-dark-black">price</span>
                        <input type="text" class="form-control w-35" id="edit-loss-input" value="${sl}">
                    </div>
                    <!-- Profit loss input end -->
                </div>
                <!-- Modify CTA start -->
                <div class="d-flex justify-content-between mb-3 mx-3">
                    <button type="button" class="btn btn-w-m btn-default btn-text-red w-45 font-weight-bolder">
                        Cancel Order
                    </button>
                    <button type="button" class="btn btn-w-m btn-default btn-blue w-45 text-white font-weight-bolder">
                        Modify
                    </button>
                </div>
                <!-- Modify CTA end -->
            </div>
        </div>
        `
    }

    function registerEditTradeModalEvents() {
        $('#type-input-menu-edit.dropdown-menu').unbind().click(event => {
            const selectedItem = event.target.innerText.trim();
            const selectedButton = $('#btn-type-input-edit')
            selectedButton.text(selectedItem);
            if (selectedItem.toUpperCase() === 'PENDING ORDER') {
                renderPendingOrderFormControls('edit');
            } else if (selectedItem.toUpperCase() === 'MARKET EXECUTION') {
                renderMarketExecutionFormControls('edit');
            }
        })
    }
    // render edit trade popup end
    function renderResponsiveTable() {
        const activeTabId = getActiveTab().attr('href');
        switch (activeTabId) {
            case '#open-trades': renderResponsiveTradesHTML('open'); break;
            case '#pending-orders': renderResponsiveTradesHTML('pending'); break;
            case '#closed-trades': renderResponsiveTradesHTML('closed'); break;
        }
    }

    // render watchlist start
    function renderWatchlists() {
        const watchList = STATE.getWatchList();
        const container = $('.watchlist-right-sidebar .sidebar-container .sidebar-content');
        const rowsHTML = [];
        watchList.forEach(watchListRow => {
            rowsHTML.push(getWatchListHTML(watchListRow));
        })
        container.empty().append(rowsHTML.join(''))
        registerWatchListEvents();
    }

    function getWatchListHTML(watchListRow) {
        if (!watchListRow) {
            return;
        }
        const { id, title } = watchListRow;
        const currenciesRowHTML = [];
        if (watchListRow.currencies && Array.isArray(watchListRow.currencies)) {
            watchListRow.currencies.forEach(currency => {
                currenciesRowHTML.push(getWatchListCurrencyRow(currency, id));
            })
        }
        return `
            <!-- Watchlist collapsed start -->
            <div id="watchlist-${id}-row">
                <div class="d-flex justify-content-between align-items-center py-2">
                <button class="btn btn-outline font-bold text-modal-black medium-font" type="button" data-toggle="collapse"
                    data-target="#watchlist-${id}-content" aria-expanded="false" aria-controls="collapseExample">
                    <div class="d-flex align-items-center">
                    <i class="down-arrow arrow-black mr-2"></i>
                    <span>${title}</span>
                    </div>
                </button>
                <img src="img/ic_minus.svg" alt="minus icon" class="delete-watchlist cursor-pointer" data-id="${id}"/>
                </div>
                <div class="divider"></div>
                <!-- Watchlist collapsed end -->
                <div id="watchlist-${id}-content" class="collapse">
                    ${currenciesRowHTML.join('')}
                </div>
            </div>
            `
    }

    function getWatchListCurrencyRow(currency, watchListId) {
        if (!currency) {
            return
        }
        const {
            id,
            from_currency,
            to_currency,
            currency_rate,
            currency_delta_amount,
            currency_delta_percentage } = currency;
        return `
        <!-- Watchlist expand start -->
        <div class="d-flex justify-content-between align-items-center mx-2 py-2">
            <p class="mb-0 font-bold text-dark-black">${from_currency}${to_currency}</p>
            <p class="mb-0 font-bold">${currency_rate}</p>
            <div>    
                <p class="mb-0 ${currency_delta_amount > 0 ? 'text-dark-green' : 'text-negative-red'} font-bold medium-font">${currency_delta_amount}</p>
                <div class="d-flex align-items-center">
                    <i class="${currency_delta_amount > 0 ? 'up-arrow-green' : 'down-arrow arrow-red'} mr-1"></i>
                    <p class="mb-0 ${currency_delta_amount > 0 ? 'text-dark-green' : 'text-negative-red'} font-bold extra-small-font">${currency_delta_percentage}%</p>
                </div>
            </div>
            <img src="img/ic_pin_unfilled.svg" alt="pin icon" class="sidebar-pin-currency cursor-pointer" data-currency-id="${id}" data-watchlist-id="${watchListId}" />
            <img src="img/ic_pin_filled.svg" alt="pin icon" class="sidebar-unpin-currency cursor-pointer d-none" data-currency-id="${id}" data-watchlist-id="${watchListId}" />
        </div>
        <div class="divider"></div>
        <!-- Watchlist expand end -->
        `
    }

    function registerWatchListEvents() {
        // delete watchlist
        $('.delete-watchlist').unbind().click(function (event) {
            const watchListId = $(event.target).data('id')
            $(`#watchlist-${watchListId}-row`).remove();
        })
        // pin currency
        $('.sidebar-pin-currency').unbind().click(function (event) {
            const currentTarget = $(event.currentTarget);
            const currencyId = currentTarget.data('currency-id');
            const watchListId = currentTarget.data('watchlist-id');
            currentTarget.toggleClass('d-none');
            currentTarget.siblings('.sidebar-unpin-currency').toggleClass('d-none');
            // add this id in pinned currencies and re-render pinned currencies section
            // find currency object from watchlist array
            const watchListObj = STATE.getWatchList().find(obj => +obj.id === +watchListId)
            const currencyObj = watchListObj.currencies.find(currency => currency.id === currencyId);
            const pinnedCurrencies = STATE.getPinnedCurrencies();
            pinnedCurrencies.push(currencyObj);
            STATE.setPinnedCurrencies(pinnedCurrencies);
            renderPinnedCurrencies()
        })

        // unpin currency
        $('.sidebar-unpin-currency').unbind().click(function (event) {
            const currentTarget = $(event.currentTarget);
            const currencyId = currentTarget.data('currency-id');
            currentTarget.toggleClass('d-none');
            currentTarget.siblings('.sidebar-pin-currency').toggleClass('d-none');
            // remove this currency object from pinned currencies and re-render the pinned currency list
            const pinnedCurrencies = STATE.getPinnedCurrencies();
            const pinnedCurrencyObjIndex = pinnedCurrencies.findIndex(currency => currency.id === currencyId);
            if (pinnedCurrencyObjIndex !== -1) {
                pinnedCurrencies.splice(pinnedCurrencyObjIndex, 1);
                STATE.setPinnedCurrencies(pinnedCurrencies);
                renderPinnedCurrencies()
            }
        })
    }
    // render watchlist end

    // render currencies search result start
    function renderCurrencySearchResult() {
        const searchedCurrencies = STATE.getCurrencySearchResult();
        const container = $('.watchlist-right-sidebar .sidebar-container .sidebar-content');
        const rowsHTML = [];
        searchedCurrencies.forEach(searchedRow => {
            rowsHTML.push(getSearchCurrencyRowHTML(searchedRow));
        })
        container.empty().append(rowsHTML.join(''))
        registerCurrencySearchResultEvents();
    }

    function getSearchCurrencyRowHTML(searchedRow) {
        if (!searchedRow) {
            return;
        }
        const { id,
            from_currency,
            to_currency,
            currency_delta_amount,
            currency_delta_percentage,
            currency_rate
        } = searchedRow;

        return `
        <!-- Search row start -->
        <div class="d-flex justify-content-between align-items-center mx-2 py-2">
            <p class="mb-0 font-bold text-dark-black">${from_currency}${to_currency}</p>
            <p class="mb-0 font-bold">${currency_rate}</p>
            <div>    
                <p class="mb-0 ${currency_delta_amount > 0 ? 'text-dark-green' : 'text-negative-red'} font-bold medium-font">${currency_delta_amount}</p>
                <div class="d-flex align-items-center">
                    <i class="${currency_delta_amount > 0 ? 'up-arrow-green' : 'down-arrow arrow-red'} mr-1"></i>
                    <p class="mb-0 ${currency_delta_amount > 0 ? 'text-dark-green' : 'text-negative-red'} font-bold extra-small-font">${currency_delta_percentage}%</p>
                </div>
            </div>
            <button class="btn btn-default border-0" type="button" data-toggle="dropdown" aria-expanded="false">
                <img src="img/ic_plus.svg" alt="pin icon" />
            </button>
            <ul id="add-currency-menu" class="dropdown-menu">
                ${getWatchListDropdownHTML(id)}
            </ul>

        </div>
        <div class="divider"></div>
        <!-- Search row end -->

        `
    }

    function getWatchListDropdownHTML(currencyId) {
        const watchList = STATE.getWatchList();
        const listHTML = [];
        watchList.forEach(watchListObj => {
            listHTML.push(`
                <li data-currency-id="${currencyId}" data-watchlist-id="${watchListObj.id}"><a data-currency-id="${currencyId}" data-watchlist-id="${watchListObj.id}" class="dropdown-item" href="#">Add to ${watchListObj.title}</a></li>
            `)
        })
        return listHTML.join('');
    }

    function registerCurrencySearchResultEvents() {
        // add currency to watchList menu
        $('#add-currency-menu').unbind().click(event => {
            const watchListId = $(event.target).data('watchlist-id');
            const currencyId = $(event.target).data('currency-id');
            // find watchlist and add currency to it and re-render watchList
            const watchList = STATE.getWatchList();
            const selectedWatchList = watchList.find(obj => obj.id === +watchListId);
            if (selectedWatchList) {
                const currencyList = STATE.getCurrencySearchResult();
                const selectedCurrency = currencyList.find(currency => currency.id === +currencyId);
                if (selectedCurrency) {
                    selectedWatchList.currencies.push(selectedCurrency);
                    STATE.setWatchList(selectedWatchList);
                }
            }
        })
    }
    // render currencies search result end

    // Add new Watchlist 
    function addNewWatchList() {
        const watchList = STATE.getWatchList();

        const newWatchList = {
            id: watchList[watchList.length - 1].id + 1,
            title: "Watchlist " + watchList[watchList.length - 1].id + 1,
            currencies: []
        }
        STATE.watchlist.push(newWatchList);
        const container = $('.watchlist-right-sidebar .sidebar-container .sidebar-content');
        container.append(getWatchListHTML({ id: STATE.watchlist.length, title: `Watchlist ${STATE.watchlist.length}` }))
        registerWatchListEvents()
    }

    // render pinned currencies start 
    function renderPinnedCurrencies() {
        const pinnedCurrencies = STATE.getPinnedCurrencies();
        const container = $('.trade-terminal-page .pinned-currency-container');
        const currenciesHTML = [];
        pinnedCurrencies.forEach(currency => {
            currenciesHTML.push(`
                <div class="currency-chip d-flex align-items-center" data-id="${currency.id}">
                    <p class="mb-0">${currency.from_currency}${currency.to_currency} &nbsp;</p><img src="img/ic_cross.svg" class="unpin-currency"/>
                </div>
            `)
        })
        container.empty().append(currenciesHTML.join(''));
        registerPinnedCurrenciesEvent();
    }

    function registerPinnedCurrenciesEvent() {
        $('.unpin-currency').unbind().click(event => {
            const currencyChip = $(event.currentTarget).parent('.currency-chip');
            const currencyId = $(currencyChip).data('id');
            const pinnedCurrencies = STATE.getPinnedCurrencies();
            const currencyToDeleteIndex = pinnedCurrencies.findIndex(currency => currency.id === +currencyId);
            pinnedCurrencies.splice(currencyToDeleteIndex, 1);
            STATE.setPinnedCurrencies(pinnedCurrencies);
            currencyChip.remove()
        })
    }
    // render pinned currencies end

    // Helper methods
    function getActiveTab() {
        return $('.nav.nav-tabs .active')
    }

})()
