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
        isBuySellFormValid = {
            volume: false,
            profit: false,
            loss: false
        }
        isBuySellModalFormValid = false;
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

        setIsBuySellFormValid(control, data) {
            if (typeof data !== 'boolean') {
                return
            }
            if (control !== '*' && !this.isBuySellFormValid.hasOwnProperty(control)) {
                return;
            }
            if (control === '*') {
                this.isBuySellFormValid.volume = data;
                this.isBuySellFormValid.profit = data;
                this.isBuySellFormValid.loss = data;
            } else {
                this.isBuySellFormValid[control] = data;
            }
        }

        getIsBuySellFormValid() {
            return this.isBuySellFormValid.volume && this.isBuySellFormValid.profit && this.isBuySellFormValid.loss;
        }

        getIsBuySellModalFormValid() {
            return this.isBuySellModalFormValid;
        }

        setIsBuySellModalFormValid(data) {
            if (typeof data !== 'boolean') {
                return
            }
            this.isBuySellModalFormValid = data;
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
        resetBuySellData();
        renderBuySellData();
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
            const activeId = getActiveTab().attr('href');
            if (event.matches) {
                // screen width is below 992px;
                console.log('active Id ', activeId);
                switch (activeId) {
                    case '#open-trades': renderResponsiveTradesHTML('open'); break;
                    case '#pending-trades': renderResponsiveTradesHTML('pending'); break;
                    case '#closed-trades': renderResponsiveTradesHTML('closed'); break;
                }
            } else {
                // screen width is above 992px;
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

        // init toast notification
        $('.toast').toast({
            delay: 2000,
            animation: true
        })

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
                    case '#closed-trades': tab.text = 'Trade History'; break;
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
        const activeTabId = getActiveTab().attr('href');
        let actionHeader = ''
        switch (activeTabId) {
            case '#open-trades':
                actionHeader = '<th class="text-center align-middle">Close</th>'; break;
            case '#pending-orders':
                actionHeader = '<th class="text-center align-middle">Cancel</th>'; break;
            case '#closed-trades':
                actionHeader = '<th class="text-center align-middle">Status</th>'; break;
        }
        return `
        <thead>
            <tr>
            <th class="pl-2 align-middle">Symbol</th>
            <th class="text-center align-middle">Trader</th>
            <th class="text-center align-middle">Type</th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="trade_time">
                    <p class="m-0 p-0 header-text">Time Stamp<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'trade_time' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="trade_volume">
                    <p class="m-0 p-0 header-text">Vol. <i class="arrow ${arrowClass} ml-1 ${sortKey !== 'trade_volume' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="open_price">
                    <p class="m-0 p-0 header-text">Open Price <i class="arrow ${arrowClass} ml-1 ${sortKey !== 'open_price' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="sl">
                    <p class="m-0 p-0 header-text">SL <i class="arrow ${arrowClass} ml-1 ${sortKey !== 'sl' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="tp">
                    <p class="m-0 p-0 header-text">TP <i class="arrow ${arrowClass} ml-1 ${sortKey !== 'tp' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="current">
                    <p class="m-0 p-0 header-text">Current <i class="arrow ${arrowClass} ml-1 ${sortKey !== 'current' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="swap">
                    <p class="m-0 p-0 header-text">Swap <i class="arrow ${arrowClass} ml-1 ${sortKey !== 'swap' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="profit">
                    <p class="m-0 p-0 header-text">Profit <i class="arrow ${arrowClass} ml-1 ${sortKey !== 'profit' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            ${actionHeader}
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
            sl,
            tp,
            current,
            swap,
            profit } = trade;
        return `<tr id="table-trade-${id}" class="edit-trade-cta cursor-pointer" data-id="${id}">
                <td class="pl-2 align-middle">
                    <p class="mb-0 font-weight-bolder">${from_currency}${to_currency}</p>
                </td>
                <td class="text-center align-middle d-flex">
                    <img alt="image" class="rounded-circle img-fluid img-sm float-left m-auto" src="${trader_image}" />
                </td>
                <td class="text-center align-middle text-blue font-weight-bolder pl-2">
                    ${trade_type}
                </td>
                <td class="text-center align-middle pl-2">
                    <p class="mb-0 small-font">${formatDate(new Date(+trade_time), "DD/MM/YYYY HH:mm")}</p>
                </td>
                <td class="text-center align-middle">
                    ${trade_volume}
                </td>
                <td class="text-center align-middle">
                    ${open_price}
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
                <td class="text-center align-middle">
                    <button id="close-open-trade" class="btn btn-default d-flex align-items-center px-2 btn-gray" type="button" name="close-trade-cta"><img name="close-trade-cta" src="img/ic_cross_red.svg" class="mr-1" />Close</button>
                </td>
            </tr>
            `
    }

    function getOpenTradesTableFooter(dataLength) {
        const { start, end, total } = getStartEndRecordCount(dataLength, STATE.getPaginationData());
        return `<tfoot>
        <tr>
          <td colspan="12">
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
        data.forEach(trade => {
            rowsHTML.push(getResponsiveTradesRow(trade, tradeType))
        })
        container.empty().append(`
        <div class="responsive-trades">
            ${rowsHTML.join('')}
            ${getResponsiveTradesFooter(data.length, tradeType)}
        </div>`)
        registerTradeEvents();
    }

    function getResponsiveTradesRow(trade, tradeType) {
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
            sl,
            tp,
            swap,
            profit,
            order_number,
            status,
            terminate_time } = trade;

        let actionCTA = '';
        switch (tradeType) {
            case 'open': actionCTA = `<button id="close-open-trade" class="btn btn-default d-flex align-items-center px-2 btn-gray" type="button" name="close-trade-cta"><img name="close-trade-cta" src="img/ic_cross_red.svg" class="mr-1">Close</button>`; break;
            case 'pending': actionCTA = `<button id="cancel-pending-trade" class="btn btn-default d-flex align-items-center px-2 btn-gray" type="button" name="cancel-trade-cta"><img name="cancel-trade-cta" src="img/ic_cross_red.svg" class="mr-1" />Cancel</button>`; break;
            case 'closed': 
                actionCTA = `
                <div>
                    <p class="m-0 font-weight-bold ${status === 'CLOSED' ? 'text-extra-light-blue' : 'text-pink'}">${status}</p>
                    <p class="m-0">${formatDate(new Date(terminate_time), 'DD/MM/YYYY HH:mm')}</p>
                </div>
                `
            break;
        }
        return `
        <div class="p-3 edit-trade-cta cursor-pointer" data-id="${id}">
            <div class="d-flex justify-content-between align-items-center">
                <div class="w-30 d-flex align-items-center">
                    <img alt="image" class="rounded-circle img-fluid img-sm float-left mr-3" src="${trader_image}" />
                    <div>
                        <p class="mb-0 font-bold large-font">#${order_number}</p>
                        <p class="mb-0 small-font">${formatDate(new Date(+trade_time), "DD/MM/YYYY HH:mm")}</p>
                    </div>
                </div>
                <div>
                    <p class="mb-0 font-weight-bolder">${from_currency}${to_currency}</p>
                    <p class="mb-0 text-blue">${trade_type}</p>
                </div>
                <p class="mb-0 font-bold responsive-value highlight-amount">${open_price}</p>
                ${actionCTA}
            </div>
        <div class="d-flex justify-content-between mt-2">
            <div class="mr-3 d-flex flex-column justify-content-between">
                <p class="mb-0 responsive-label text-center">Open Price</p>
                <p class="mb-0 font-bold responsive-value">${open_price}</p>
            </div>
            
            <div class="mr-3 d-flex flex-column justify-content-between">
                <p class="mb-0 responsive-label text-center">Volume</p>
                <p class="mb-0 font-bold responsive-value">${trade_volume}</p>
            </div>
            
            <div class="mr-3 d-flex flex-column justify-content-between">
                <p class="mb-0 responsive-label text-center">SL</p>
                <p class="mb-0 font-bold responsive-value">${sl}</p>
            </div>
            
            <div class="mr-3 d-flex flex-column justify-content-between">
                <p class="mb-0 responsive-label text-center">TP</p>
                <p class="mb-0 font-bold responsive-value">${tp}</p>
            </div>
            <div class="mr-3 d-flex flex-column justify-content-between">
                <p class="mb-0 responsive-label text-center">Swap</p>
                <p class="mb-0 font-bold responsive-value">${swap}</p>
            </div>
            <div class="mr-3 d-flex flex-column justify-content-between">
                <p class="mb-0 responsive-label text-center">Profit</p>
                <p class="mb-0 font-bold responsive-value ${+profit > 0 ? 'text-dark-green' : 'text-bleed-red'}">S$${profit}</p>
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
        return `<table class="table mb-0">
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
          <tbody>
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
            sl,
            tp,
            current
        } = trade;
        return `<tr id="table-trade-${id}" class="edit-trade-cta cursor-pointer" data-id="${id}">
                <td class="pl-2 align-middle">
                    <p class="mb-0 font-weight-bolder">${from_currency}${to_currency}</p>
                </td>
                <td class="text-center align-middle d-flex">
                    <img alt="image" class="rounded-circle img-fluid img-sm float-left m-auto" src="${trader_image}" />
                </td>
                <td class="text-center align-middle text-blue font-weight-bolder pl-2">
                    ${trade_type}
                </td>
                <td class="text-center align-middle pl-2">
                    <p class="mb-0 small-font">${formatDate(new Date(+trade_time), "DD/MM/YYYY HH:mm")}</p>
                </td>
                <td class="text-center align-middle">
                    ${trade_volume}
                </td>
                <td class="text-center align-middle">
                    ${open_price}
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
                <td class="text-center align-middle text-blur-gray">
                    NA
                </td>
                <td class="text-center align-middle font-bold pl-1 text-blur-gray">
                    NA
                </td>
                <td class="text-center align-middle">
                    <button id="cancel-pending-trade" class="btn btn-default d-flex align-items-center px-2 btn-gray" type="button" name="cancel-trade-cta"><img name="cancel-trade-cta" src="img/ic_cross_red.svg" class="mr-1" />Cancel</button>
                </td>
            </tr>
            `
    }

    function getPendingTradesTableFooter(dataLength) {
        const { start, end, total } = getStartEndRecordCount(dataLength, STATE.getPaginationData());
        return `<tfoot>
        <tr>
          <td colspan="12">
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
              <tbody>
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
            sl,
            tp,
            current,
            swap,
            profit,
            terminate_time, // this value is only available for closed trades, it gives time stamp of when was the trade closed or cancelled
            status // this will have value either CLOSED or CANCELLED
        } = trade;

        let slColumn = `<td class="text-center align-middle">${sl}</td>`;
        let tpColumn = `<td class="text-center align-middle">${tp}</td>`;
        let currentColumn = `
                <td class="text-center align-middle">
                    <span class="highlight-amount">
                        ${current}
                    </span>
                </td>`;
        let swapColumn = `
            <td class="text-center align-middle text-dark-green">
                ${`S$${swap}`}
            </td>
        `;
        let profitColumn = `
            <td class="text-center align-middle font-bold pl-1 ${+profit > 0 ? 'text-dark-green' : 'text-bleed-red'}">
                ${`S$${profit}`}
            </td>
        `;
        if (status === 'CANCELLED') {
            slColumn = `<td class="text-center align-middle text-darker-gray">NA</td>`;
            tpColumn = `<td class="text-center align-middle text-darker-gray">NA</td>`
            currentColumn = `<td class="text-center align-middle text-darker-gray">NA</td>`
            swapColumn = `<td class="text-center align-middle text-darker-gray">NA</td>`
            profitColumn = `<td class="text-center align-middle text-darker-gray">NA</td>`
        }
        return `<tr id="table-trade-${id}" class="edit-trade-cta cursor-pointer" data-id="${id}">
                <td class="pl-2 align-middle">
                    <p class="mb-0 font-weight-bolder">${from_currency}${to_currency}</p>
                </td>
                <td class="text-center align-middle d-flex">
                    <img alt="image" class="rounded-circle img-fluid img-sm float-left m-auto" src="${trader_image}" />
                </td>
                <td class="text-center align-middle text-blue font-weight-bolder pl-2">
                    ${trade_type}
                </td>
                <td class="text-center align-middle pl-2">
                    <p class="mb-0 small-font">${formatDate(new Date(+trade_time), "DD/MM/YYYY HH:mm")}</p>
                </td>
                <td class="text-center align-middle">
                    ${trade_volume}
                </td>
                <td class="text-center align-middle">
                    ${open_price}
                </td>
                ${slColumn}
                ${tpColumn}
                ${currentColumn}
                ${swapColumn}
                ${profitColumn}
                <td class="align-middle pl-2">
                    <div>
                        <p class="m-0 font-weight-bold text-center ${status === 'CLOSED' ? 'text-extra-light-blue' : 'text-pink'}">${status}</p>
                        <p class="m-0">${formatDate(new Date(terminate_time), 'DD/MM/YYYY HH:mm')}</p>
                    </div>
                </td>
            </tr>
            `
    }

    function getClosedTradesTableFooter(dataLength) {
        const { start, end, total } = getStartEndRecordCount(dataLength, STATE.getPaginationData());
        return `<tfoot>
            <tr>
              <td colspan="12">
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
            const name = $(event.target).attr('name');
            if (name !== 'close-trade-cta' && name !== 'cancel-trade-cta') {
                // show modal
                $('#edit-trade-modal').modal();
            }
            STATE.setTradeDetails({ id: tradeId })
            // fetch trade detail and render content accordingly
            switch (activeTabId) {
                case '#open-trades': fetchOpenTradeDetails(tradeId, name); break;
                case '#pending-orders': fetchPendingTradeDetails(tradeId, name); break;
                case '#closed-trades': fetchClosedTradeDetails(tradeId); break;
            }
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
        let {
            status,
            order_number,
            order_type,
            order_time,
            type,
            profit,
            loss,
            volume,
            one_click_trading } = data;

        const selelctedAccount = STATE.getSelectedAccount();
        const typeValue = type === 'pending_order' ? 'Pending Order' : 'Market Execution';
        const orderDetailsHTML = status !== 'NEW' ? `
        <div class="d-flex justify-content-between mb-3">
            <p class="mb-0 font-weight-bold text-dark-gray">${order_type} ORDER #${order_number}</p>
            <p class="mb-0">${formatDate(new Date(order_time), 'DD/MM/YYYY HH:mm')}</p>
        </div>
            ` : '';

        const profitInputHTML = status !== 'NEW' ? `<input type="text" disabled class="form-control" id="profit-input" value=${profit}>` : `<input type="text" class="form-control" id="profit-input" value="0">`;
        const lossInputHTML = status !== 'NEW' ? `<input type="text" disabled class="form-control" id="loss-input" value="${loss}">` : `<input type="text" class="form-control" id="loss-input" value="0">`;
        const volumeInputHTML = status !== 'NEW' ? `<input type="text" disabled class="form-control" id="volume-input" value="${volume}">` : `<input type="text" class="form-control" id="volume-input">`;
        return `
        <!-- order by account start -->
        <div class="d-flex justify-content-between mb-3">
          <p class="mb-0 font-bold">Order by Account</p>
          <div class="account-number p-1 ${selelctedAccount.type === 'DEMO' ? 'demo-account' : ''}"><span class="mr-1 text-navy live small-font ${selelctedAccount.type === 'DEMO' ? 'demo' : ''}">${selelctedAccount.type}</span><span
              class="medium-font font-bold small-font">${selelctedAccount.number}</span>
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
            ${volumeInputHTML}
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
            <ul id="type-input-menu" class="dropdown-menu" data-value="${type}">
                <li data-value="market_execution"><a class="dropdown-item" href="#">Market Execution</a></li>
                <li data-value="pending_order"><a class="dropdown-item" href="#">Pending Order</a></li>
            </ul>
        </div>
        <!-- Type input end -->
        <div class="divider mb-3"></div>
        <div class="dynamic-elements">
        ${type === 'pending_order' ? getPendingOrderControls() : ''}
        </div>
        <!-- Profit loss display start -->
        ${getProfitLossDisplayHTML()}
        <!-- Profit loss display end -->
        <!-- Profit loss input start -->
        <div class="d-flex justify-content-between mb-2">
            <p class="mb-0 font-weight-light medium-font">Take Profit</p>
            <p class="mb-0 font-weight-light medium-font">Stop Loss</p>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="position-relative w-40">
                ${profitInputHTML}
           </div>
            <span class="font-bold medium-font text-dark-black">Price</span>
            <div class="position-relative w-40">
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
            <input id="one-click-trading-input" type="checkbox" class="js-switch" ${one_click_trading ? 'checked' : ''} />
        </div>
        <!-- one Click trading end-->`
    }

    function getProfitLossDisplayHTML() {
        let { status,
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
            case 'TRADE_OPEN_SUCCESS':
                return `
            <div class="mb-2 d-flex">
                <p class="mb-0 font-bold extra-large-font">#${order_number}</p>
            </div>
            <p class="mb-3 text-light-green super-extra-large-font font-bold">Trade Open Success</p>
            `;
            case 'TRADE_ORDER_PLACED':
                return `
                <div class="mb-2 d-flex">
                    <p class="mb-0">#${order_number} <p class="mb-0 text-lowercase">&nbsp;${order_type}&nbsp;</p>${volume} ${from_currency}${to_currency} at ${to_currency_rate}</p>
                </div>
                <p class="mb-3 super-extra-large-font font-bold text-light-green">Order Placed</p>
                `;
            case 'NO_CONNECTION':
                return `
            <div class="mb-2 d-flex">
                <p class="mb-0 font-bold extra-large-font">#${order_number}</p>
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
            return `<div class="d-flex justify-content-between mb-3 buy-sell-footer">
            <button id="sell-trade" type="button" class="btn btn-w-m btn-default btn-bleed-red w-45 text-white">
            Sell
            </button>
            <button id="buy-trade" type="button" class="btn btn-w-m btn-primary w-45">
            Buy
            </button>
            <button id="place-order" type="button" class="btn btn-w-m btn-default btn-medium-blue btn-block text-white d-none">
            Place Order
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
            return '';
        }
    }

    function buySellSectionAdjustHeight() {
        const typeValue = $('.buy-sell-section #type-input-menu.dropdown-menu').data('value')
        if (typeValue === 'pending_order') {
            $('.buy-sell-section').css('max-height', '700px');
        } else if (typeValue === 'market_execution') {
            $('.buy-sell-section').css('max-height', '444px');
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
        registerPendingOrderEvents(container);
    }

    function getPendingOrderControls(mode, status) {
        const buySellData = STATE.getBuySellData();
        const { gtc_expiration_date } = buySellData;
        let priceInput = `
         <!-- Price input start -->
        <div class="d-flex justify-content-between mb-3 align-items-center">
            <p class="mb-0 font-weight-light medium-font">Price</p>
            <div class="position-relative w-40">
                <input type="text" class="form-control" id="price-input">
            </div>
        </div>
        <!-- Price input end -->
        `
        if (status === 'CLOSED' || status === 'CANCELLED') {
            const tradeDetails = STATE.getTradeDetails();
            const { type, expiration, gtc_expiration_date } = tradeDetails;
            return `
            <!-- Order Type input start -->
            <div class="d-flex justify-content-between mb-3 align-items-center">
                <p class="mb-0 font-weight-light medium-font">Order Type</p>
                <button data-toggle="dropdown" class="btn font-bold">${type}</button>
            </div>
            <!-- Order Type input end -->
            <div class="divider mb-3"></div>
            <!-- Expiration input start -->
            <div class="d-flex justify-content-between mb-3 align-items-center">
                <p class="mb-0 font-weight-light medium-font">Expiration</p>
                <button class="btn font-bold">${expiration}</button>
            </div>
            <!-- Expiration input end -->
            <div class="divider mb-3"></div>
            <!-- Expiration Date input start -->
            <div class="d-flex justify-content-between mb-3 align-items-center">
                <p class="mb-0 font-weight-light medium-font">Expiration Date</p>
                <button class="btn font-bold">${formatDate(new Date(gtc_expiration_date), 'DD MMM YYYY HH:mm')}</button>
            </div>
            <!-- Expiration Date input end -->
            <div class="divider mb-3"></div>
            `
        }

        if (mode === 'edit') {
            const tradeDetails = STATE.getTradeDetails();
            const { order_price } = tradeDetails;
            priceInput = `
            <!-- Price input start -->
            <div class="d-flex justify-content-between mb-3 align-items-center">
                <p class="mb-0 font-weight-light medium-font">Price</p>
                <div class="position-relative w-40">
                    <input type="text" class="form-control" id="price-input" value="${order_price}">
                </div>
            </div>
            <!-- Price input end -->`
        }
        return ` <!-- Order Type input start -->
        <div class="d-flex justify-content-between mb-3 align-items-center">
            <p class="mb-0 font-weight-light medium-font">Order Type</p>
            <button id="btn-order-type-input" data-toggle="dropdown" class="btn dropdown-toggle btn-dropdown font-bold" aria-expanded="false" data-value="buy_limit">
                Buy Limit
            </button>
            <ul id="order-type-input-menu" class="dropdown-menu">
                <li data-value="buy_limit"><a class="dropdown-item" href="#">Buy Limit</a></li>
                <li data-value="sell_limit"><a class="dropdown-item" href="#">Sell Limit</a></li>
                <li data-value="buy_stop"><a class="dropdown-item" href="#">Buy Stop</a></li>
                <li data-value="sell_stop"><a class="dropdown-item" href="#">Sell Stop</a></li>
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
                ${formatDate(new Date(gtc_expiration_date), 'DD MMM YYYY HH:mm')}
            </button>
            </div>
        </div>
        <!-- Expiration Date input end -->
        <div class="divider mb-3"></div>
        ${priceInput}
        `
    }

    function registerPendingOrderEvents(container) {
        // order type dropdown menu
        container.find('#order-type-input-menu.dropdown-menu li').click(event => {
            const selectedItem = $(event.currentTarget);
            const selectedValue = selectedItem.data('value');
            const selectedItemText = event.currentTarget.innerText.trim();
            const selectedButton = container.find('#btn-order-type-input');
            selectedButton.text(selectedItemText);
            selectedButton.attr('data-value', selectedValue);
        })

        // expiration dropdown menu
        container.find('#expiration-input-menu.dropdown-menu').click(event => {
            const selectedItem = event.target.innerText.trim();
            const selectedButton = container.find('#btn-expiration-input');
            selectedButton.text(selectedItem);
            const expirationDateButton = container.find('#btn-expiration-date-input');
            if (selectedItem.toUpperCase() === 'GOOD TILL CANCELLED (GTC)') {
                expirationDateButton.attr('disabled', 'true');
            } else if (selectedItem.toUpperCase() === 'DAY ORDER') {
                const expirationDate = STATE.getBuySellData().day_order_expiration_date;
                expirationDateButton.datepicker('setDate', new Date(expirationDate));
            } else {
                expirationDateButton.removeAttr('disabled');
            }
        })

        // expiration date picker
        container.find('#expiration-date-input').datepicker({
            todayBtn: "linked",
            keyboardNavigation: true,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true
        }).on('changeDate', function (e) {
            const displayDateButton = container.find('#btn-expiration-date-input');
            displayDateButton.text(formatDate(e.date, "DD MM YYYY HH:mm"));
        });
        const buySellData = STATE.getBuySellData();
        const expirationDate = new Date(buySellData.gtc_expiration_date);
        container.find('#expiration-date-input').datepicker('setDate', expirationDate);
    }
    function registerBuySellEvents() {
        const container = $('.buy-sell-section');
        // switchery radio button
        var elem = document.querySelector('.buy-sell-section .js-switch');
        new Switchery(elem, {
            color: '#E5E5E5',
            secondaryColor: '#E5E5E5',
            jackColor: '#22D091',
            jackSecondaryColor: "#FFFFFF",
        });

        // change status on click of buy CTA
        container.find('#buy-trade').unbind().click(() => handleClickBuySellTrade('BUY'));

        // change status on click of sell CTA
        container.find('#sell-trade').unbind().click(() => handleClickBuySellTrade('SELL'));

        container.find('#place-order').unbind().click(() => {
            const orderType = container.find('#btn-order-type-input').data('value');
            if (orderType === 'buy_limit' || orderType === 'buy_stop') {
                handleClickBuySellTrade('BUY');
            } else if (orderType === 'sell_limit' || orderType === 'sell_stop') {
                handleClickBuySellTrade('SELL');
            }
        });

        // This CTA will only be available while editing pending orders
        container.find('#cancel-trade').unbind().click(function () {
            const buySellData = STATE.getBuySellData();
            buySellData.status = 'CANCELLED';
            STATE.setBuySellData(buySellData);
            renderBuySellData();
        })
        // type input dropdown
        container.find('#type-input-menu.dropdown-menu li').click(event => {
            const selectedValue = $(event.currentTarget).data('value');
            const selectedButton = container.find('#btn-type-input');
            const dropdownMenu = container.find('#type-input-menu.dropdown-menu');
            if (selectedValue === 'market_execution') {
                selectedButton.text('Market Execution');
                container.find('.dynamic-elements').addClass('d-none');
                // update footer cta section to sell and buy
                container.find('.buy-sell-footer #sell-trade').removeClass('d-none');
                container.find('.buy-sell-footer #buy-trade').removeClass('d-none');
                container.find('.buy-sell-footer #place-order').addClass('d-none');
            } else if (selectedValue === 'pending_order') {
                selectedButton.text('Pending Order');
                container.find('.dynamic-elements').removeClass('d-none');
                renderPendingOrderFormControls();
                // update footer cta section to place order
                container.find('.buy-sell-footer #sell-trade').addClass('d-none');
                container.find('.buy-sell-footer #buy-trade').addClass('d-none');
                container.find('.buy-sell-footer #place-order').removeClass('d-none');
            }
            dropdownMenu.data('value', selectedValue)
            validateBuySellInputs($('.buy-sell-section'));
            buySellSectionAdjustHeight();
        })

        container.find('#one-click-trading-input').off().on('change', function (event) {
            const buySellData = STATE.getBuySellData();
            STATE.setBuySellData({
                ...buySellData,
                one_click_trading: event.currentTarget.checked
            })
        })
        validateBuySellInputs($('.buy-sell-section'));
    }

    function handleClickBuySellTrade(status) {
        const container = $('.buy-sell-section');
        container.find('#volume-input').blur();
        container.find('#profit-input').blur();
        container.find('#loss-input').blur();
        validateProfitLossInputs(status);
        if (!STATE.getIsBuySellFormValid()) {
            // play bad sound and return
            var audioElement = document.querySelector('#error-sound');
            audioElement.play();
            return;
        }
        const buySellData = STATE.getBuySellData();
        buySellData.order_number = buySellData.order_number ? +buySellData.order_number + 1 : 10796400
        buySellData.order_type = status;
        buySellData.type = $('.buy-sell-section #type-input-menu.dropdown-menu').data('value');
        buySellData.profit = $('#profit-input').val();
        buySellData.loss = $('#loss-input').val();
        buySellData.volume = $('#volume-input').val();
        // check internet connection
        if (!navigator.onLine) {
            handleBuySellTradeError(buySellData)
            return;
        }
        if (buySellData.type === 'market_execution') {
            // call an api here and on success render buy sell data
            callAjaxMethod({
                url: 'https://copypip.free.beeceptor.com/initiate-trade',
                method: 'POST',
                successCallback: () => {
                    handleBuySellTradeSuccess(buySellData);
                },
                errorCallback: () => {
                    handleBuySellTradeError(buySellData)
                }
            })
        } else if (buySellData.type === 'pending_order') {
            callAjaxMethod({
                url: 'https://copypip.free.beeceptor.com/place-order',
                method: 'POST',
                successCallback: () => {
                    handleBuySellTradeSuccess(buySellData);
                },
                errorCallback: () => {
                    handleBuySellTradeError(buySellData)
                }
            })
        }
    }

    function validateProfitLossInputs(action) {
        const { from_currency_rate, to_currency_rate } = STATE.getBuySellData();
        let profitTargetValue = '';
        let lossTargetValue = '';
        const container = $('.buy-sell-section');
        const profitInput = container.find('#profit-input');
        const lossInput = container.find('#loss-input');
        const profitVal = Number(profitInput.val());
        const lossVal = Number(lossInput.val());

        function addError(element, errorMessage) {
            element.addClass('error');
            $(`<p class="mb-0 position-absolute error-message text-error-red d-flex"><img src="img/ic_error.svg" class="mr-2"/>${errorMessage}</p>`).insertAfter(element);
        }

        function removeError(element) {
            element.removeClass('error');
            element.siblings('.error-message').remove();
        }

        if (action === 'BUY') {
            profitTargetValue = Math.max(from_currency_rate, to_currency_rate);
            lossTargetValue = Math.min(from_currency_rate, to_currency_rate);
            // checking profit value
            if (profitVal > profitTargetValue) {
                removeError(profitInput);
                STATE.setIsBuySellFormValid('profit', true);
            } else {
                const errorMessage = `Profit < ${profitTargetValue}`;
                addError(profitInput, errorMessage);
                STATE.setIsBuySellFormValid('profit', false);
            }
            // checking loss value
            if (lossVal < lossTargetValue) {
                removeError(lossInput);
                STATE.setIsBuySellFormValid('loss', true);
            } else {
                const errorMessage = `Loss > ${lossTargetValue}`;
                addError(lossInput, errorMessage);
                STATE.setIsBuySellFormValid('loss', false);
            }
        } else if (action === 'SELL') {
            profitTargetValue = Math.min(from_currency_rate, to_currency_rate);
            lossTargetValue = Math.max(from_currency_rate, to_currency_rate);
            // checking profit value
            if (profitVal < profitTargetValue) {
                removeError(profitInput);
                STATE.setIsBuySellFormValid('profit', true);
            } else {
                const errorMessage = `Profit > ${profitTargetValue}`;
                addError(profitInput, errorMessage);
                STATE.setIsBuySellFormValid('profit', false);
            }
            // checking loss value
            if (lossVal > lossTargetValue) {
                removeError(lossInput);
                STATE.setIsBuySellFormValid('loss', true);
            } else {
                const errorMessage = `Loss > ${lossTargetValue}`;
                addError(lossInput, errorMessage);
                STATE.setIsBuySellFormValid('loss', false);
            }
        }
    }

    function handleBuySellTradeSuccess(buySellData) {
        let toastMessage = '';
        if (buySellData.type === 'market_execution') {
            buySellData.status = 'TRADE_OPEN_SUCCESS';
            toastMessage = 'Trade open success';
        } else if (buySellData.type === 'pending_order') {
            buySellData.status = 'TRADE_ORDER_PLACED';
            toastMessage = 'Trade order placed';
        }
        STATE.setBuySellData(buySellData);
        renderBuySellData();
        // play success sound
        var audioElement = document.querySelector('#success-sound');
        audioElement.play();
        // show toast message
        renderSuccessToast(toastMessage);
        // render buy sell data to new state after 0.5 seconds
        setTimeout(() => {
            resetBuySellData();
            renderBuySellData()
        }, 500)
        // refetch open or pending trades from table based on type selected (Market execution or Pending orders)
        if (buySellData.type === 'market_execution') {
            onTabChange('#open-trades');
        } else if (buySellData.type === 'pending_orders') {
            onTabChange('#pending-orders');
        }

    }
    function handleBuySellTradeError(buySellData) {
        buySellData.status = 'NO_CONNECTION';
        STATE.setBuySellData(buySellData);
        renderBuySellData();
        // play error sound
        var audioElement = document.querySelector('#error-sound');
        audioElement.play();
        // render buy sell data to new state after 2 seconds
        setTimeout(() => {
            resetBuySellData();
            renderBuySellData();
        }, 2000)
    }

    function resetBuySellData() {
        STATE.setBuySellData({})
        STATE.setIsBuySellFormValid('*', false);
        const tradeData = localStorage.getItem('tradeData');
        STATE.setBuySellData({
            ...JSON.parse(tradeData),
            status: 'NEW'
        })
    }
    function validateBuySellInputs(container) {
        // validate volume input 
        validateTextInput(container.find('#volume-input'), function (val) {
            let isValid = false;
            if (isNaN(val)) {
                isValid = false;
            } else if (val === '') {
                isValid = false;
            } else {
                const numVal = Number(val);
                if (numVal >= 0.01 && numVal <= 100) {
                    isValid = true;
                }
            }
            STATE.setIsBuySellFormValid('volume', isValid);
            return isValid;
        })
        // validate take profit input
        validateTextInput(container.find('#profit-input'), function (val) {
            let isValid = false;
            if (isNaN(val)) {
                isValid = false;
            } else if (val === '') {
                isValid = false;
            } else {
                const numVal = Number(val);
                if (numVal >= 0) {
                    isValid = true;
                    const allowedDecimalCount = STATE.getBuySellData().decimalCount;
                    fixDecimals(container.find('#profit-input'), numVal, allowedDecimalCount);
                }
            }
            STATE.setIsBuySellFormValid('profit', isValid);
            return isValid;
        }, 'Number only')

        // validate stop loss input
        validateTextInput(container.find('#loss-input'), function (val) {
            let isValid = false;
            if (isNaN(val)) {
                isValid = false;
            } else if (val === '') {
                isValid = false;
            } else {
                const numVal = Number(val);
                if (numVal >= 0) {
                    isValid = true;
                    const allowedDecimalCount = STATE.getBuySellData().decimalCount;
                    fixDecimals(container.find('#loss-input'), numVal, allowedDecimalCount);
                }
            }
            STATE.setIsBuySellFormValid('loss', isValid);
            return isValid;
        }, 'Number only')

        // validate price input
        validateTextInput(container.find('#price-input'), function (val) {
            let isValid = false;
            if (isNaN(val)) {
                isValid = false;
            }
            if (val === '') {
                isValid = false;
            } else {
                const numVal = Number(val);
                if (numVal >= 0) {
                    isValid = true;
                }
            }
            return isValid;
        }, 'Number only')
    }
    // render buy sell section end

    // render edit trade popup start
    function fetchOpenTradeDetails(tradeId, name) {
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/get-open-trade?id=${tradeId}`,
            successCallback: (data) => {
                STATE.setTradeDetails(data.data);
                renderEditTradeModal();
                registerEditTradeModalEvents();
                validateEditTradeModalInputs()
                if (name === 'close-trade-cta') {
                    const buySellData = STATE.getBuySellData();
                    if (buySellData.one_click_trading === false) {
                        $('#edit-trade-modal').modal();
                    } else if (buySellData.one_click_trading === true) {
                        // close the order via api and refresh the open order section
                        // TODO : toast message for closed order success
                        // play success sound
                        var audioElement = document.querySelector('#success-sound');
                        audioElement.play();
                        // show success toast
                        renderSuccessToast('Trade closed');
                        onTabChange('#open-trades');
                    }
                }
            },
        });
    }

    function fetchPendingTradeDetails(tradeId, name) {
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/get-pending-trade?id=${tradeId}`,
            successCallback: (data) => {
                if (name === 'cancel-trade-cta') {
                    const buySellData = STATE.getBuySellData();
                    if (buySellData.one_click_trading === false) {
                        $('#edit-trade-modal').modal();
                    } else if (buySellData.one_click_trading === true) {
                        // cancel the order via api and refresh the pending order section
                        // TODO : toast message for closed order success
                        // play success sound
                        var audioElement = document.querySelector('#success-sound');
                        audioElement.play();
                        // show toast success
                        renderSuccessToast('Trade cancelled');
                        onTabChange('#pending-trades');
                    }
                }
                STATE.setTradeDetails(data.data);
                renderEditTradeModal();
                registerEditTradeModalEvents();
                if (data.data.order_type === 'pending_order') {
                    registerPendingOrderEvents($('#edit-trade-modal'));
                }
                validateEditTradeModalInputs()
            },
        });
    }

    function fetchClosedTradeDetails(tradeId) {
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/get-closed-trade?id=${tradeId}`,
            successCallback: (data) => {
                STATE.setTradeDetails(data.data);
                renderEditTradeModal();
                registerEditTradeModalEvents();
                validateEditTradeModalInputs();
            },
        });
    }

    function renderEditTradeModal() {
        $('#edit-trade-modal .modal-body').empty().append(getEditTradeModalHTML())
        $('#edit-trade-modal .modal-footer-container').empty().append(getEditTradeModalFooter())
    }

    function getEditTradeModalHTML() {
        const tradeDetails = STATE.getTradeDetails();
        const {
            order_number,
            trade_time,
            order_type,
            trade_volume,
            order_account_number,
            order_account_type,
            tp,
            sl,
            order_price, // order price represents the price at which trade was initiated. in case of pending order this can be empty,
            status
        } = tradeDetails;

        let tradeVolumeInput = '';
        let takeProfitInput = '';
        let stoplLossInput = '';
        let priceInput = '';
        const isDisabled = status === 'CLOSED' || status === 'CANCELLED' ? true : false;
        if (order_type === 'market_execution') {
            tradeVolumeInput = `<input type="text" class="form-control w-100" id="volume-input" value="${trade_volume}">`;
            takeProfitInput = `<input type="text" class="form-control" id="profit-input" value="${tp}">`;
            stoplLossInput = `<input type="text" class="form-control" id="loss-input" value="${sl}">`;
            priceInput = `
            <!-- Price input start -->
            <div class="d-flex justify-content-between mx-3 mb-3 align-items-center">
                <p class="mb-0 font-weight-light medium-font">Price</p>
                <input type="text" class="form-control w-40" id="price-input" disabled value="${order_price}">
            </div>
            <!-- Price input end -->
            `

        } else if (order_type === 'pending_order') {
            tradeVolumeInput = `<input type="text" class="form-control w-100" id="volume-input" value="${trade_volume}"} ${isDisabled ? 'disabled' : ''}>`
            takeProfitInput = `<input type="text" class="form-control" id="profit-input" value="${tp}" ${isDisabled ? 'disabled' : ''}>`;
            stoplLossInput = `<input type="text" class="form-control" id="loss-input" value="${sl}" ${isDisabled ? 'disabled' : ''}>`;
            priceInput = ``;
        }

        return `
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
                <div class="position-relative w-40">
                    ${tradeVolumeInput}
                </div>
            </div>
            <!-- Currency exchange input end -->
            <div class="divider mb-3 mx-3"></div>
            <!-- Type input start -->
            <div class="d-flex justify-content-between mb-3 align-items-center mx-3">
                <p class="mb-0 font-weight-light medium-font">Type</p>
                <button id="btn-type-input-edit" class="btn btn-dropdown font-bold">
                    ${order_type === 'market_execution' ? 'Market Execution' : 'Pending Order'}
                </button>
            </div>
            <!-- Type input end -->
            <div class="divider mb-3"></div>
            <div class="dynamic-elements mx-3">
                ${order_type === 'pending_order' ? getPendingOrderControls('edit', status) : ''}
            </div>
            <!-- Price input start -->
            ${priceInput}
            <!-- Price input end -->
            ${getEditTradeModalStatusHTML()}
            <!-- Profit loss input start -->
            <div class="d-flex justify-content-between mb-2 mx-3">
                <p class="mb-0 font-weight-light medium-font">Take Profit</p>
                <p class="mb-0 font-weight-light medium-font">Stop Loss</p>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-3 mx-3">
                <div class="position-relative w-40">
                    ${takeProfitInput}
                </div>
                <span class="font-bold medium-font text-dark-black">Price</span>
                <div class="position-relative w-40">
                    ${stoplLossInput}
                </div>
            </div>
            <!-- Profit loss input end -->
        `
    }

    function getEditTradeModalStatusHTML() {
        const tradeDetails = STATE.getTradeDetails();
        const { status,
            order_number,
            trade_type,
            trade_volume,
            from_currency,
            to_currency,
            to_currency_rate,
            from_currency_rate,
            from_currency_delta,
            to_currency_delta } = tradeDetails;

        switch (status) {
            case 'MODIFY_SUCCESS':
                return `
                <div class="mb-2 d-flex mx-3">
                    <p class="mb-0 font-bold extra-large-font">#${order_number}</p>
                </div>
                <p class="mb-3 mx-3 text-extra-light-blue super-extra-large-font font-bold">Modify Success</p>
                `;
            case 'CLOSED':
                return `
                <div class="mb-2 d-flex mx-3">
                    <p class="mb-0">#${order_number} <p class="mb-0 text-lowercase">&nbsp;${trade_type}&nbsp;</p>${trade_volume} ${from_currency}${to_currency} at ${to_currency_rate}</p>
                </div>
                <p class="mb-3 mx-3 super-extra-large-font font-bold">Closed ${trade_volume} at ${to_currency_rate}</p>
                `;
            case 'PARTIAL_CLOSED':
                return `
                <div class="mb-2 d-flex mx-3">
                    <p class="mb-0">#${order_number} <p class="mb-0 text-lowercase">&nbsp;${trade_type}&nbsp;</p>${trade_volume} ${from_currency}${to_currency} at ${to_currency_rate}</p>
                </div>
                <p class="mb-3 mx-3 super-extra-large-font font-bold">Partial Closed ${trade_volume} at ${to_currency_rate}</p>
                `;
            case 'CANCELLED':
                return `
            <div class="mb-2 d-flex mx-3">
                <p class="mb-0">#${order_number}</p>
            </div>
            <p class="mb-3 mx-3 super-extra-large-font font-bold text-blur-gray">Cancelled</p>
            `
            default:
                return `
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
                `
        }
    }

    function getEditTradeModalFooter() {
        const tradeDetails = STATE.getTradeDetails();
        const {
            status,
            order_type
        } = tradeDetails;

        if (status === 'PARTIAL_CLOSED' || status === 'CLOSED') {
            return `
            <div class="px-3 mb-3">
                <button type="button" id="close-window" class="close-window-cta btn btn-w-m btn-default btn-block btn-text-medium-blue font-weight-bolder">
                    Close Window
                </button>
            </div>
            `;
        }

        if (order_type === 'pending_order') {
            return `
            <!-- Modify CTA start -->
            <div class="d-flex justify-content-between mb-3 mx-3">
            <button type="button" id="cancel-order" class="btn btn-w-m btn-default btn-text-red w-45 font-weight-bolder">
                Cancel Order
            </button>
            <button type="button" id="modify-trade" disabled class="btn btn-w-m btn-default btn-blue w-45 text-white font-weight-bolder">
                Modify
            </button>
            </div>
            <!-- Modify CTA end -->
            `
        }

        return `
        <!-- Modify CTA start -->
        <div class="d-flex justify-content-between mb-3 mx-3">
            <button type="button" id="partial-close-order" class="btn btn-w-m btn-default btn-text-red w-45 font-weight-bolder d-none">
                Partial Close Order
            </button>
            <button type="button" id="close-order" class="btn btn-w-m btn-default btn-text-red w-45 font-weight-bolder">
                Close Order
            </button>
            <button type="button" id="modify-trade" disabled class="btn btn-w-m btn-default btn-blue w-45 text-white font-weight-bolder">
                Modify
            </button>
        </div>
        <!-- Modify CTA end -->
        `
    }

    function registerEditTradeModalEvents() {
        const container = $('#edit-trade-modal');
        const tradeDetails = STATE.getTradeDetails();
        const { trade_volume, order_type } = tradeDetails;
        // partial close functionlaity is only for market execution i.e open orders
        if (order_type === 'market_execution') {
            container.find('#volume-input').off().on('blur', function (event) {
                const value = +event.target.value;
                if (value < trade_volume) {
                    container.find('.modal-footer-container #close-order').addClass('d-none');
                    container.find('.modal-footer-container #partial-close-order').removeClass('d-none');
                } else {
                    container.find('.modal-footer-container #partial-close-order').addClass('d-none');
                    container.find('.modal-footer-container #close-order').removeClass('d-none');
                }
                // if volume is changed profit and loss input will be disabled
                container.find('#profit-input').attr('disabled', true);
                container.find('#loss-input').attr('disabled', true);
            })
            // on profit or loss change disable volume input
            container.find('#profit-input').off().on('change', function () {
                container.find('#volume-input').attr('disabled', true);
            })
            container.find('#loss-input').off().on('change', function () {
                container.find('#volume-input').attr('disabled', true);
            })
        }
        // on click of modify trade
        container.find('#modify-trade').unbind().click(handleClickModifyTrade);
        // on click close order
        container.find('#close-order').unbind().click(handleClickCloseOrder);
        // on click partial close order
        container.find('#partial-close-order').unbind().click(handleClickPartialCloseOrder);
        // on click cancel order
        container.find('#cancel-order').unbind().click(handleClickCancelOrder);
        // on click close window
        container.find('#close-window').unbind().click(function () {
            container.modal('hide');
        })
    }

    function handleClickModifyTrade() {
        const container = $('#edit-trade-modal');
        container.find('#volume-input').blur();
        container.find('#profit-input').blur();
        container.find('#loss-input').blur();
        if (!STATE.getIsBuySellModalFormValid()) {
            return;
        }
        const tradeDetails = STATE.getTradeDetails();
        const volume = container.find('#volume-input').val();
        const profit = container.find('#profit-input').val();
        const loss = container.find('#loss-input').val();
        // TODO : call api to update trade
        tradeDetails.trade_volume = volume;
        if (tradeDetails.order_type === 'pending_orders') { // in case of pending order only user can change tp and sl hence capturing values only in that case
            tradeDetails.tp = profit;
            tradeDetails.sl = loss;
        }
        tradeDetails.status = 'MODIFY_SUCCESS';
        renderEditTradeModal();
        // play success sound
        var audioElement = document.querySelector('#success-sound');
        audioElement.play();
        // show success toast
        renderSuccessToast('Trade modified');
        // render buy sell data to new state after 0.5 seconds
        setTimeout(() => {
            STATE.setTradeDetails({});
            STATE.setIsBuySellFormValid('*', false);
            $('#edit-trade-modal').modal('hide');
        }, 500)
        // refetch open or pending trades from table based on type selected (Market execution or Pending orders)
        if (tradeDetails.order_type === 'market_execution') {
            onTabChange('#open-trades');
        } else if (tradeDetails.order_type === 'pending_orders') {
            onTabChange('#pending-orders');
        }
    }

    function handleClickCloseOrder() {
        const container = $('#edit-trade-modal');
        container.find('#volume-input').blur();
        container.find('#profit-input').blur();
        container.find('#loss-input').blur();
        if (!STATE.getIsBuySellModalFormValid()) {
            return;
        }
        const tradeDetails = STATE.getTradeDetails();
        const volume = container.find('#volume-input').val();
        const profit = container.find('#profit-input').val();
        const loss = container.find('#loss-input').val();
        // TODO : call api to update trade
        tradeDetails.trade_volume = volume;
        tradeDetails.tp = profit;
        tradeDetails.sl = loss;
        tradeDetails.status = 'CLOSED';
        renderEditTradeModal();
        // play success sound
        var audioElement = document.querySelector('#success-sound');
        audioElement.play();
        // render buy sell data to new state after 0.5 seconds
        setTimeout(() => {
            STATE.setTradeDetails({});
            STATE.setIsBuySellFormValid('*', false);
            $('#edit-trade-modal').modal('hide');
            // render toast success
            renderSuccessToast('Trade closed');
        }, 500)
        // refetch open or pending trades from table based on type selected (Market execution or Pending orders)
        if (tradeDetails.order_type === 'market_execution') {
            onTabChange('#open-trades');
        } else if (tradeDetails.order_type === 'pending_orders') {
            onTabChange('#pending-orders');
        }
    }

    function handleClickPartialCloseOrder() {
        const container = $('#edit-trade-modal');
        container.find('#volume-input').blur();
        container.find('#profit-input').blur();
        container.find('#loss-input').blur();
        if (!STATE.getIsBuySellModalFormValid()) {
            return;
        }
        const tradeDetails = STATE.getTradeDetails();
        const volume = container.find('#volume-input').val();
        const profit = container.find('#profit-input').val();
        const loss = container.find('#loss-input').val();
        // TODO : call api to update trade
        tradeDetails.trade_volume = volume;
        tradeDetails.tp = profit;
        tradeDetails.sl = loss;
        tradeDetails.status = 'PARTIAL_CLOSED';
        renderEditTradeModal();
        // play success sound
        var audioElement = document.querySelector('#success-sound');
        audioElement.play();
        // render buy sell data to new state after 0.5 seconds
        setTimeout(() => {
            STATE.setTradeDetails({});
            STATE.setIsBuySellFormValid('*', false);
            $('#edit-trade-modal').modal('hide');
        }, 500)
        // refetch open or pending trades from table based on type selected (Market execution or Pending orders)
        if (tradeDetails.order_type === 'market_execution') {
            onTabChange('#open-trades');
        } else if (tradeDetails.order_type === 'pending_orders') {
            onTabChange('#pending-orders');
        }
    }

    function handleClickCancelOrder() {
        const container = $('#edit-trade-modal');
        container.find('#volume-input').blur();
        container.find('#profit-input').blur();
        container.find('#loss-input').blur();
        if (!STATE.getIsBuySellModalFormValid()) {
            return;
        }
        const tradeDetails = STATE.getTradeDetails();
        const volume = container.find('#volume-input').val();
        const profit = container.find('#profit-input').val();
        const loss = container.find('#loss-input').val();
        // TODO : call api to update trade
        tradeDetails.trade_volume = volume;
        tradeDetails.tp = profit;
        tradeDetails.sl = loss;
        tradeDetails.status = 'CANCELLED';
        renderEditTradeModal();
        // play success sound
        var audioElement = document.querySelector('#success-sound');
        audioElement.play();

        // render buy sell data to new state after 0.5 seconds
        setTimeout(() => {
            STATE.setIsBuySellFormValid('*', false);
            $('#edit-trade-modal').modal('hide');
            // show success toast
            renderSuccessToast('Trade cancelled');
        }, 500)
        // refetch open or pending trades from table based on type selected (Market execution or Pending orders)
        if (tradeDetails.order_type === 'market_execution') {
            onTabChange('#open-trades');
        } else if (tradeDetails.order_type === 'pending_orders') {
            onTabChange('#pending-orders');
        }
    }

    function validateEditTradeModalInputs() {
        const container = $('#edit-trade-modal');
        const tradeDetails = STATE.getTradeDetails();
        const { order_type, trade_type, from_currency_rate } = tradeDetails;
        const modifyTradeCTA = container.find('#modify-trade');

        // not adding off() here for market execution because we are adding a change listerner in registerEditTradeModalEvents so adding off() here will remove that function.
        if (order_type === 'pending_order') {
            container.find('#volume-input').off();
            container.find('#profit-input').off();
            container.find('#loss-input').off();
        }
        container.find('#volume-input').on('blur', function (event) {
            const value = Number(event.target.value);
            if (event.target.value === '') {
                addError.call(this, 'Empty not allowed');
                STATE.setIsBuySellModalFormValid(false);
            } else if (value >= 0.01 && value <= 100) {
                removeError.call(this);
                STATE.setIsBuySellModalFormValid(true);
            } else {
                addError.call(this, 'Volume between 0 and 100');
                STATE.setIsBuySellModalFormValid(false);
            }
        })

        // Profit input validation
        container.find('#profit-input').on('blur', function (event) {
            const value = +event.target.value;
            if (event.target.value === '') {
                modifyTradeCTA.prop('disabled', true);
                addError.call(this, `Empty not allowed`);
                STATE.setIsBuySellModalFormValid(false);
            } else if (trade_type === 'BUY') { // for BUY profit amount should be greater than buy price
                if (value >= 0 && value > from_currency_rate) {
                    modifyTradeCTA.prop('disabled', false);
                    removeError.call(this);
                    STATE.setIsBuySellModalFormValid(true);
                    const allowedDecimalCount = STATE.getBuySellData().decimalCount;
                    fixDecimals(container.find('#profit-input'), value, allowedDecimalCount);
                } else {
                    modifyTradeCTA.prop('disabled', true);
                    addError.call(this, `Profit less than ${from_currency_rate}`);
                    STATE.setIsBuySellModalFormValid(false);
                }
            } else if (trade_type === 'SELL') { // for SELL profit amount should be less than sell price
                if (value >= 0 && value < from_currency_rate) {
                    modifyTradeCTA.prop('disabled', false);
                    removeError.call(this);
                    STATE.setIsBuySellModalFormValid(true);
                    const allowedDecimalCount = STATE.getBuySellData().decimalCount;
                    fixDecimals(container.find('#profit-input'), value, allowedDecimalCount);
                } else {
                    modifyTradeCTA.prop('disabled', true);
                    addError.call(this, `Profit more than ${from_currency_rate}`);
                    STATE.setIsBuySellModalFormValid(false);
                }
            }
        })
        // Loss input validation
        container.find('#loss-input').on('blur', function (event) {
            const value = +event.target.value;
            if (event.target.value === '') {
                modifyTradeCTA.prop('disabled', true);
                addError.call(this, `Empty not allowed`);
                STATE.setIsBuySellModalFormValid(false);
            } else if (trade_type === 'BUY') { // for BUY loss amount should me less than buy price
                if (value > 0 && value < from_currency_rate) {
                    modifyTradeCTA.prop('disabled', false);
                    removeError.call(this);
                    STATE.setIsBuySellModalFormValid(true);
                    const allowedDecimalCount = STATE.getBuySellData().decimalCount;
                    fixDecimals(container.find('#loss-input'), value, allowedDecimalCount);
                } else {
                    modifyTradeCTA.prop('disabled', true);
                    addError.call(this, `loss less than ${from_currency_rate}`);
                    STATE.setIsBuySellModalFormValid(false);
                }
            } else if (trade_type === 'SELL') { // for SELL loss amount should be greater than sell price
                if (value >= 0 && value > from_currency_rate) {
                    modifyTradeCTA.prop('disabled', false);
                    removeError.call(this);
                    STATE.setIsBuySellModalFormValid(true);
                    const allowedDecimalCount = STATE.getBuySellData().decimalCount;
                    fixDecimals(container.find('#loss-input'), value, allowedDecimalCount);
                } else {
                    modifyTradeCTA.prop('disabled', true);
                    addError.call(this, `Loss less than ${from_currency_rate}`);
                    STATE.setIsBuySellModalFormValid(false);
                }
            }
        })
        // Price input validation
        container.find('#price-input').off().on('blur', function (event) {
            const value = +event.target.value;
            if (!isNaN(value) && value > 0) {
                modifyTradeCTA.prop('disabled', false);
                removeError.call(this);
                STATE.setIsBuySellModalFormValid(true);
                const allowedDecimalCount = STATE.getBuySellData().decimalCount;
                fixDecimals(container.find('#price-input'), value, allowedDecimalCount);
            } else {
                modifyTradeCTA.prop('disabled', true);
                addError.call(this, 'Invalid price');
                STATE.setIsBuySellModalFormValid(false);
            }
        })
    }
    function addError(errorMessage) {
        $(this).addClass('error');
        $(`<p class="mb-0 position-absolute error-message text-error-red d-flex"><img src="img/ic_error.svg" class="mr-2"/>${errorMessage}</p>`).insertAfter($(this));
    }
    function removeError() {
        $(this).removeClass('error');
        $(this).siblings('.error-message').remove();
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
    // render trade start
    function renderSuccessToast(message) {
        const toastBox = $('.toast');
        toastBox.addClass('success').find('.toast-body').text(message);
        toastBox.toast('show');
    }
    // render trade end
})()
