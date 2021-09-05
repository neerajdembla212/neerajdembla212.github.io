(() => {
    class State {
        openTrades = [];
        pendingTrades = [];
        closedTrades = [];

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
    }

    const STATE = new State();
    // document ready function 
    $(function () {
        registerGlobalEvents();
        const activeId = getActiveTab().attr('href');
        onTabChange(activeId);
    });

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

    // Helper methods
    function getActiveTab() {
        return $('.nav.nav-tabs .active')
    }

})()