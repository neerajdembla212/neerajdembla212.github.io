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
        fetchBuySellData(function (data) {
            STATE.setBuySellData(data);
            renderBuySellData();
            registerBuySellEvents();
        });
        const activeId = getActiveTab().attr('href');
        onTabChange(activeId);
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
        switch (tabId) {
            case '#open-trades': fetchOpenTrades(); break;
            case '#pending-orders': fetchPendingTrades(); break;
            case '#closed-trades': fetchClosedTrades(); break;
        }
    }

    function fetchOpenTrades() {
        callAjaxMethod({
            url: "https://copypip.free.beeceptor.com/open-trades",
            successCallback: (data) => {
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
        callAjaxMethod({
            url: "https://copypip.free.beeceptor.com/pending-trades",
            successCallback: (data) => {
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
        callAjaxMethod({
            url: "https://copypip.free.beeceptor.com/closed-trades",
            successCallback: (data) => {
                STATE.setClosedTrades(data.data);
                if (DESKTOP_MEDIA.matches) {
                    renderResponsiveTradesHTML('closed')
                } else {
                    renderClosedTrades();
                }
            },
        });
    }

    // render open trades begin
    function renderOpenTrades() {
        const openTrades = STATE.getOpenTrades();
        const container = $('.tab-content #open-trades');
        container.empty().append(getOpenTradesTableHTML(openTrades));
        registerTradeEvents();
    }

    function getOpenTradesTableHTML(data) {
        return `<table class="table scroll">
        ${getOpenTradesTableHeaders()}
        ${getOpenTradesTableBody(data)}
        ${getOpenTradesTableFooter()}
        </table>`
    }

    function getOpenTradesTableHeaders() {
        return `
        <thead>
            <tr>
            <th class="align-middle w-18">Symbol</th>
            <th class="text-center align-middle w-9">Trader</th>
            <th class="text-center align-middle w-9">Type</th>
            <th class="text-center align-middle w-9">Volume</th>
            <th class="text-center align-middle w-17">Open Price</th>
            <th class="text-center align-middle w-9 pr-3">Amount</th>
            <th class="text-center align-middle w-9">SL</th>
            <th class="text-center align-middle w-9">TP</th>
            <th class="text-center align-middle w-9">Current</th>
            <th class="text-center align-middle w-9">Swap</th>
            <th class="text-center align-middle w-9">Profit</th>
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
          <tbody data-toggle="modal" data-target="#edit-trade-modal">
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

    function getOpenTradesTableFooter() {
        return `<tfoot>
        <tr>
          <td colspan="11">
            <ul class="pagination w-100 d-flex justify-content-end align-items-center m-0">
              <select class="form-control rows-per-page mr-2" name="rows-per-page">
                <option>10 Rows per page</option>
                <option>20 Rows per page</option>
                <option>30 Rows per page</option>
                <option>40 Rows per page</option>
              </select>
              <i class="fa fa-angle-left mx-2"></i>
              <i class="fa fa-angle-right mx-2"></i>
            </ul>
          </td>
        </tr>
      </tfoot>`
    }
    // render open trades end

    // render responsive open trades start
    function renderResponsiveTradesHTML(tradeType) {
        const openTrades = STATE.getOpenTrades();
        let container;
        switch (tradeType) {
            case 'open': container = $('.tab-content #open-trades'); break;
            case 'pending': container = $('.tab-content #pending-orders'); break;
            case 'closed': container = $('.tab-content #closed-trades'); break;
        }
        const rowsHTML = [];
        openTrades.forEach(trade => {
            rowsHTML.push(getResponsiveOpenTradesRow(trade))
        })
        container.empty().append(`<div class="responsive-trades" data-toggle="modal" data-target="#edit-trade-modal">
            ${rowsHTML.join('')}
        </div>`)
        registerTradeEvents();
    }

    function getResponsiveOpenTradesRow(trade) {
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
        <div class="p-3 edit-trade-cta cursor-pointer" data-id="${id}">
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
        ${getPendingTradesTableHeaders()}
        ${getPendingTradesTableBody(data)}
        ${getPendingTradesTableFooter()}
        </table>`
    }

    function getPendingTradesTableHeaders() {
        return `
        <thead>
            <tr>
            <th class="align-middle w-18">Symbol</th>
            <th class="text-center align-middle w-9">Trader</th>
            <th class="text-center align-middle w-9">Type</th>
            <th class="text-center align-middle w-9">Volume</th>
            <th class="text-center align-middle w-17">Open Price</th>
            <th class="text-center align-middle w-9 pr-3">Amount</th>
            <th class="text-center align-middle w-9">SL</th>
            <th class="text-center align-middle w-9">TP</th>
            <th class="text-center align-middle w-9">Current</th>
            <th class="text-center align-middle w-9">Swap</th>
            <th class="text-center align-middle w-9">Profit</th>
            </tr>
        </thead>
        `
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

    function getPendingTradesTableFooter() {
        return `<tfoot>
        <tr>
          <td colspan="11">
            <ul class="pagination w-100 d-flex justify-content-end align-items-center m-0">
              <select class="form-control rows-per-page mr-2" name="rows-per-page">
                <option>10 Rows per page</option>
                <option>20 Rows per page</option>
                <option>30 Rows per page</option>
                <option>40 Rows per page</option>
              </select>
              <i class="fa fa-angle-left mx-2"></i>
              <i class="fa fa-angle-right mx-2"></i>
            </ul>
          </td>
        </tr>
      </tfoot>`
    }

    // render pending trades end

    // render open trades begin
    function renderClosedTrades() {
        const closedTrades = STATE.getClosedTrades();
        const container = $('.tab-content #closed-trades');
        container.empty().append(getClosedTradesTableHTML(closedTrades));
        registerTradeEvents();
    }

    function getClosedTradesTableHTML(data) {
        return `<table class="table">
            ${getClosedTradesTableHeaders()}
            ${getClosedTradesTableBody(data)}
            ${getClosedTradesTableFooter()}
            </table>`
    }

    function getClosedTradesTableHeaders() {
        return `
        <thead>
            <tr>
            <th class="align-middle w-18">Symbol</th>
            <th class="text-center align-middle w-9">Trader</th>
            <th class="text-center align-middle w-9">Type</th>
            <th class="text-center align-middle w-9">Volume</th>
            <th class="text-center align-middle w-17">Open Price</th>
            <th class="text-center align-middle w-9 pr-3">Amount</th>
            <th class="text-center align-middle w-9">SL</th>
            <th class="text-center align-middle w-9">TP</th>
            <th class="text-center align-middle w-9">Current</th>
            <th class="text-center align-middle w-9">Swap</th>
            <th class="text-center align-middle w-9">Profit</th>
            </tr>
        </thead>
        `
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

    function getClosedTradesTableFooter() {
        return `<tfoot>
            <tr>
              <td colspan="11">
                <ul class="pagination w-100 d-flex justify-content-end align-items-center m-0">
                  <select class="form-control rows-per-page mr-2" name="rows-per-page">
                    <option>10 Rows per page</option>
                    <option>20 Rows per page</option>
                    <option>30 Rows per page</option>
                    <option>40 Rows per page</option>
                  </select>
                  <i class="fa fa-angle-left mx-2"></i>
                  <i class="fa fa-angle-right mx-2"></i>
                </ul>
              </td>
            </tr>
          </tfoot>`
    }

    function registerTradeEvents() {
        $('.edit-trade-cta').click(function (event) {
            const tradeId = $(event.currentTarget).data('id')
            STATE.setTradeDetails({ id: tradeId })
            fetchTradeDetails(tradeId);
        })
    }
    // render open trades end

    // render buy sell section start
    function renderBuySellData() {
        const buySellData = STATE.getBuySellData();
        const container = $('.buy-sell-section');
        container.empty().append(getBuySellDataHTML(buySellData));
    }

    function getBuySellDataHTML(data) {
        if (!data) {
            return;
        }
        const { from_currency_rate, to_currency_rate, from_currency_delta, to_currency_delta } = data;
        return `
        <!-- order by account start -->
        <div class="d-flex justify-content-between mb-3">
          <p class="mb-0 font-bold">Order by Account</p>
          <div class="account-number p-1"><span class="mr-1 text-navy live small-font">${STATE.getSelectedAccount().type}</span><span
              class="medium-font font-bold small-font">${STATE.getSelectedAccount().number}</span>
          </div>
        </div>
        <!-- order by account end -->
        <!-- Currency exchange input start -->
        <div class="d-flex justify-content-between mb-3 align-items-center">
          <div class="line-height-md">
            <p class="mb-0 extra-large-font font-bold text-modal-black">EURUSD</p>
            <p class="mb-0 medium-font font-weight-light text-gray">Volume</p>
          </div>
          <input type="text" class="form-control w-50" placeholder="0.01 - 100">
        </div>
        <!-- Currency exchange input end -->
        <div class="divider mb-3"></div>
        <!-- Type input start -->
        <div class="d-flex justify-content-between mb-3 align-items-center">
            <p class="mb-0 font-weight-light medium-font">Type</p>
            <button id="btn-type-input" data-toggle="dropdown" class="btn dropdown-toggle btn-dropdown font-bold" aria-expanded="false">
                Market Execution
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
        <!-- Profit loss display end -->
        <!-- Profit loss input start -->
        <div class="d-flex justify-content-between mb-2">
            <p class="mb-0 font-weight-light medium-font">Take Profit</p>
            <p class="mb-0 font-weight-light medium-font">Stop Loss</p>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <input type="text" class="form-control w-35" id="profit-input">
            <span class="font-bold medium-font text-dark-black">price</span>
            <input type="text" class="form-control w-35" id="loss-input">
        </div>
        <!-- Profit loss input end -->
        <!-- Buy Sell CTA start -->
        <div class="d-flex justify-content-between mb-3">
            <button type="button" class="btn btn-w-m btn-primary btn-bleed-red w-45 ">
            Sell
            </button>
            <button type="button" class="btn btn-w-m btn-primary w-45">
            Buy
            </button>
        </div>
        <!-- Buy Sell CTA end -->
        <!-- one Click trading start-->
        <div class="d-flex justify-content-between align-items-center">
            <p class="mb-0 text-gray font-weight-light">One click trading</p>
            <input type="checkbox" class="js-switch" checked />
        </div>
        <!-- one Click trading end-->`
    }

    function registerBuySellEvents() {
        var elem = document.querySelector('.js-switch');
        new Switchery(elem, {
            color: '#E5E5E5',
            secondaryColor: '#E5E5E5',
            jackColor: '#22D091',
            jackSecondaryColor: "#FFFFFF",
        });
        $('#type-input-menu.dropdown-menu').click(event => {
            const selectedItem = event.target.innerText.trim();
            const selectedButton = $('#btn-type-input')
            selectedButton.text(selectedItem);
            if (selectedItem.toUpperCase() === 'PENDING ORDER') {
                renderPendingOrderFormControls();
                $('.trade-section tbody').css('height', '530px')
            } else if (selectedItem.toUpperCase() === 'MARKET EXECUTION') {
                renderMarketExecutionFormControls();
                $('.trade-section tbody').css('height', '288px')
            }
        })
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
        $('#type-input-menu-edit.dropdown-menu').click(event => {
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
    // Helper methods
    function getActiveTab() {
        return $('.nav.nav-tabs .active')
    }

})()