(() => {
    class State {
        openTrades = [];
        pendingTrades = [];
        closedTrades = [];
        buySellData = {};

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
    }

    const STATE = new State();
    // document ready function 
    $(function () {
        registerGlobalEvents();
        fetchBuySellData();
        const activeId = getActiveTab().attr('href');
        onTabChange(activeId);
    });

    function fetchBuySellData() {
        callAjaxMethod({
            url: "https://copypip.free.beeceptor.com/buy-sell-data",
            successCallback: (data) => {
                STATE.setBuySellData(data.data);
                renderBuySellData();
                registerBuySellEvents();
            },
        });
    }
    function registerGlobalEvents() {
        // tabs change event listener
        $(".tabs-container .nav-tabs > li").click(event => {
            onTabChange($(event.target).attr('href'))
        })
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
                renderOpenTrades();
            },
        });
    }

    function fetchPendingTrades() {
        callAjaxMethod({
            url: "https://copypip.free.beeceptor.com/pending-trades",
            successCallback: (data) => {
                STATE.setPendingTrades(data.data);
                renderPendingTrades();
            },
        });
    }

    function fetchClosedTrades() {
        callAjaxMethod({
            url: "https://copypip.free.beeceptor.com/closed-trades",
            successCallback: (data) => {
                STATE.setClosedTrades(data.data);
                renderClosedTrades();
            },
        });
    }

    // render open trades begin
    function renderOpenTrades() {
        const openTrades = STATE.getOpenTrades();
        const container = $('.tab-content #open-trades .panel-body');
        container.append(getOpenTradesTableHTML(openTrades));
    }

    function getOpenTradesTableHTML(data) {
        return `<table class="table">
        ${getOpenTradesTableHeaders()}
        ${getOpenTradesTableBody(data)}
        ${getOpenTradesTableFooter()}
        </table>`
    }

    function getOpenTradesTableHeaders() {
        return `
        <thead>
            <tr>
            <th class="align-middle">Symbol</th>
            <th class="text-center align-middle">Trader</th>
            <th class="text-center align-middle">Type</th>
            <th class="text-center align-middle">Volume</th>
            <th class="text-center align-middle">Open Price</th>
            <th class="text-center align-middle">Amount</th>
            <th class="text-center align-middle">SL</th>
            <th class="text-center align-middle">TP</th>
            <th class="text-center align-middle">Current</th>
            <th class="text-center align-middle">Swap</th>
            <th class="text-center align-middle">Profit</th>
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
        return `<tr id="table-user-${id}">
                <td>
                    <div>
                        <p class="mb-0 font-weight-bolder">${from_currency}${to_currency}</p>
                        <p class="mb-0">${formatDate(new Date(+trade_time), "DD/MM/YYYY HH:mm")}</p>
                    </div>
                </td>
                <td class="text-center align-middle" align="center">
                    <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${trader_image}" />
                </td>
                <td class="text-center align-middle text-darker-gray font-weight-bolder">
                    ${trade_type}
                </td>
                <td class="text-center align-middle">
                    ${formatWithCommas(trade_volume)}
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
                <td class="text-center align-middle font-bold ${+profit > 0 ? 'text-dark-green' : 'text-bleed-red'}">
                    S$${profit}
                </td>
            </tr>
            `
    }

    function getOpenTradesTableFooter() {
        return `<tfoot>
        <tr>
          <td colspan="11" class="pb-0">
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

    // render pending trades begin
    function renderPendingTrades() {
        const pendingTrades = STATE.getPendingTrades();
        const container = $('.tab-content #pending-orders .panel-body');
        container.append(getPendingTradesTableHTML(pendingTrades));
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
            <th class="align-middle">Symbol</th>
            <th class="text-center align-middle">Trader</th>
            <th class="text-center align-middle">Type</th>
            <th class="text-center align-middle">Volume</th>
            <th class="text-center align-middle">Open Price</th>
            <th class="text-center align-middle">Amount</th>
            <th class="text-center align-middle">SL</th>
            <th class="text-center align-middle">TP</th>
            <th class="text-center align-middle">Current</th>
            <th class="text-center align-middle">Swap</th>
            <th class="text-center align-middle">Profit</th>
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
            amount,
            sl,
            tp,
            current,
            swap,
            profit } = trade;
        return `<tr id="table-user-${id}">
                <td>
                    <div>
                        <p class="mb-0 font-weight-bolder">${from_currency}${to_currency}</p>
                        <p class="mb-0">${formatDate(new Date(+trade_time), "DD/MM/YYYY HH:mm")}</p>
                    </div>
                </td>
                <td class="text-center align-middle" align="center">
                    <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${trader_image}" />
                </td>
                <td class="text-center align-middle text-darker-gray font-weight-bolder">
                    ${trade_type}
                </td>
                <td class="text-center align-middle">
                    ${formatWithCommas(trade_volume)}
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
                <td class="text-center align-middle font-bold ${+profit > 0 ? 'text-dark-green' : 'text-bleed-red'}">
                    S$${profit}
                </td>
            </tr>
            `
    }

    function getPendingTradesTableFooter() {
        return `<tfoot>
        <tr>
          <td colspan="11" class="pb-0">
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
        const container = $('.tab-content #closed-trades .panel-body');
        container.append(getClosedTradesTableHTML(closedTrades));
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
                <th class="align-middle">Symbol</th>
                <th class="text-center align-middle">Trader</th>
                <th class="text-center align-middle">Type</th>
                <th class="text-center align-middle">Volume</th>
                <th class="text-center align-middle">Open Price</th>
                <th class="text-center align-middle">Amount</th>
                <th class="text-center align-middle">SL</th>
                <th class="text-center align-middle">TP</th>
                <th class="text-center align-middle">Current</th>
                <th class="text-center align-middle">Swap</th>
                <th class="text-center align-middle">Profit</th>
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
            amount,
            sl,
            tp,
            current,
            swap,
            profit } = trade;
        return `<tr id="table-user-${id}">
                    <td>
                        <div>
                            <p class="mb-0 font-weight-bolder">${from_currency}${to_currency}</p>
                            <p class="mb-0">${formatDate(new Date(+trade_time), "DD/MM/YYYY HH:mm")}</p>
                        </div>
                    </td>
                    <td class="text-center align-middle" align="center">
                        <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${trader_image}" />
                    </td>
                    <td class="text-center align-middle text-darker-gray font-weight-bolder">
                        ${trade_type}
                    </td>
                    <td class="text-center align-middle">
                        ${formatWithCommas(trade_volume)}
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
                    <td class="text-center align-middle font-bold ${+profit > 0 ? 'text-dark-green' : 'text-bleed-red'}">
                        S$${profit}
                    </td>
                </tr>
                `
    }

    function getClosedTradesTableFooter() {
        return `<tfoot>
            <tr>
              <td colspan="11" class="pb-0">
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
          <div class="account-number p-1"><span class="mr-1 text-navy live small-font">LIVE</span><span
              class="medium-font font-bold small-font">TA
              209761M</span>
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
            <button data-toggle="dropdown" class="btn dropdown-toggle btn-dropdown font-bold" aria-expanded="false">
                Market Execution
            </button>
            <ul class="dropdown-menu">
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
        $('.dropdown-menu').click(event => {
            const selectedItem = event.target.innerText.trim();
            const selectedButton = $('.btn.dropdown-toggle.btn-dropdown')
            selectedButton.text(selectedItem);
            if (selectedItem.toUpperCase() === 'PENDING ORDER') {
                renderPendingOrderFormControls();
            } else if (selectedItem.toUpperCase() === 'MARKET EXECUTION') {
                renderMarketExecutionFormControls();
            }
        })
    }
    function renderPendingOrderFormControls() {
        const container = $('.buy-sell-section .dynamic-elements');
        container.empty().append(getPendingOrderControls())
    }

    function getPendingOrderControls() {
        return ` <!-- Order Type input start -->
        <div class="d-flex justify-content-between mb-3 align-items-center">
            <p class="mb-0 font-weight-light medium-font">Order Type</p>
            <button data-toggle="dropdown" class="btn dropdown-toggle btn-dropdown font-bold" aria-expanded="false">
                Buy Limit
            </button>
            <ul class="dropdown-menu">
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
            <button data-toggle="dropdown" class="btn dropdown-toggle btn-dropdown font-bold" aria-expanded="false">
                Day Order
            </button>
            <ul class="dropdown-menu">
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
            <button data-toggle="dropdown" class="btn dropdown-toggle btn-dropdown font-bold" aria-expanded="false">
                08 Aug 2021 14:00
            </button>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">08 Aug 2021 14:00</a></li>
            </ul>
        </div>
        <!-- Expiration Date input end -->
        <div class="divider mb-3"></div>
        `
    }
    function renderMarketExecutionFormControls() {
        $('.buy-sell-section .dynamic-elements').empty();
    }
    // render buy sell section end
    // Helper methods
    function getActiveTab() {
        return $('.nav.nav-tabs .active')
    }

})()