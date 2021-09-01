(() => {
    class State {
        lineChartData = [];
        providerId = '';
        tradeHistory = [];
        getLineChartData() {
            return this.lineChartData;
        }
        setLineChartData(data) {
            if (!data || !Array.isArray(data)) {
                return
            }
            this.lineChartData = data;
        }

        getProviderId() {
            this.providerId;
        }
        setProviderId(data) {
            if (!data) {
                return
            }
            this.providerId = data;
        }
        getTradeHistory() {
            return this.tradeHistory;
        }

        setTradeHistory(data) {
            if (!data || !Array.isArray(data)) {
                return;
            }
            this.tradeHistory = data;
        }
    }
    const STATE = new State();
    // document ready function
    $(function () {
        const providerId = localStorage.getItem('selectedProviderId');
        STATE.setProviderId(providerId);
        registerEvents();
        fetchLineData();
        fetchTradeHistory();
    })

    function fetchLineData() {
        callAjaxMethod({
            url: "https://copypip.free.beeceptor.com/strategy-details-line-data",
            successCallback: (data) => {
                STATE.setLineChartData(data.data);
                plotLineChart()
            }
        });
    }

    function fetchTradeHistory() {
        callAjaxMethod({
            url: "https://copypip.free.beeceptor.com/strategy-provider-trade-history",
            successCallback: (data) => {
                STATE.setTradeHistory(data.data);
                renderTradeHistory();
            }
        })
    }

    function registerEvents() {
        $('.chart-filter .btn').click(event => {
            const target = $(event.currentTarget);
            $('.chart-filter .btn').removeClass('active');
            target.addClass('active');
            const value = target.text();
            console.log(value);
        })
    }

    // Plot Line chart 
    function plotLineChart() {
        const canvas = document.getElementById("line-chart");
        const lineData = STATE.getLineChartData();
        if (!lineData || !Array.isArray(lineData) || !canvas) {
            return;
        }
        const lineDataPoints = lineData.reduce((acc, curr) => {
            acc.push(curr.data);
            return acc;
        }, []);
        canvas.height = 330;
        const ctx = canvas.getContext("2d");
        const positiveColor = "#22D091";
        const negativColor = "#C00000"
        const labels = lineData.map(d => d.time);
        const data = {
            labels: labels,
            datasets: [{
                label: "",
                data: lineDataPoints,
                cubicInterpolationMode: 'monotone',
                tension: 0.1
            }]
        };
        const config = {
            type: "line",
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [
                        {
                            gridLines: {
                                display: false,
                                tickMarkLength: 0,
                            },
                            ticks: {
                                maxTicksLimit: 10,
                            },
                        },
                    ],
                    yAxes: [
                        {
                            gridLines: {
                                display: true,
                                tickMarkLength: 0,
                                drawBorder: false,
                            },
                            ticks: {
                                display: true,
                                tickMarkLength: 1,
                                maxTicksLimit: 5,
                                callback: function (value) {
                                    return value + '%'
                                }
                            },
                        },
                    ],
                },
                legend: {
                    display: false,
                },
                elements: {
                    point: {
                        radius: 0,
                    },
                    line: {
                        tension: 0,
                        borderWidth: 2,
                    },
                },
                layout: {
                    padding: {
                        bottom: 20,
                        left: 10,
                    },
                },
            },
            plugins: [{
                beforeRender: function (c) {
                    const dataset = c.data.datasets[0];
                    const yScale = c.scales['y-axis-0'];
                    const yPos = yScale.getPixelForValue(0);

                    const gradientFill = c.ctx.createLinearGradient(0, 0, 0, c.height);
                    gradientFill.addColorStop(0, positiveColor);
                    gradientFill.addColorStop(yPos / c.height, "#D9F7E6");
                    gradientFill.addColorStop(yPos / c.height, "#F1C7C7");
                    gradientFill.addColorStop(1, negativColor);

                    const model = c.data.datasets[0]._meta[Object.keys(dataset._meta)[0]].$filler.el._model;
                    model.backgroundColor = gradientFill;
                }
            }]
        };
        new Chart(ctx, config);
    }

    // Render trade history table start
    function renderTradeHistory() {
        const tradeHistory = STATE.getTradeHistory();
        const container = $('.trade-history-section');
        container.append(getTradeHistoryTableHTML(tradeHistory));
        container.append(getTradeHistoryResponsiveHTML(tradeHistory));
    }

    function getTradeHistoryTableHTML(data) {
        return `<table class="table">
        ${getTradeHistoryTableHeaders()}
        ${getTradeHistoryTableBody(data)}
        ${getTradeHistoryTableFooter()}
    </table>`
    }

    function getTradeHistoryTableHeaders() {
        return `
        <thead>
            <tr>
            <th class="align-middle">Symbol</th>
            <th class="text-center align-middle">Trader</th>
            <th class="text-center align-middle">Type</th>
            <th class="text-center align-middle">Volume</th>
            <th class="text-center align-middle">Price</th>
            <th class="text-center align-middle">SL</th>
            <th class="text-center align-middle">TP</th>
            <th class="text-center align-middle">Closed Price</th>
            <th class="text-center align-middle">Swap</th>
            <th class="text-center align-middle">Profit</th>
            </tr>
        </thead>
        `
    }

    function getTradeHistoryTableBody(data) {
        if (!data || !Array.isArray(data)) {
            return
        }
        const rowsHTML = [];
        data.forEach(trade => {
            rowsHTML.push(getTradeHistoryTableRow(trade));
        })
        return `
          <tbody>
            ${rowsHTML.join('')}
          </tbody>
          `
    }

    function getTradeHistoryTableRow(trade) {
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
            trade_price,
            sl,
            tp,
            closed_price,
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
                    ${trade_price}
                </td>
                <td class="text-center align-middle">
                    ${sl}
                </td>
                <td class="text-center align-middle">
                    ${tp}
                </td>
                <td class="text-center align-middle">
                    ${closed_price}
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
    function getTradeHistoryTableFooter() {
        return `<tfoot>
        <tr>
          <td colspan="9" class="pb-0">
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
    // Render trade history table end

    // render trade history responsive html start
    function getTradeHistoryResponsiveHTML(data) {
        const rowsHTML = [];
        data.forEach(trade => {
            rowsHTML.push(getTradeHistoryResponsiveRow(trade))
        })
        return `<div class="responsive-trade-history">
            ${rowsHTML.join('')}
        </div>`
    }

    function getTradeHistoryResponsiveRow(trade) {
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
            trade_price,
            sl,
            tp,
            closed_price,
            swap,
            profit } = trade;
        return `<div class="p-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <p class="mb-0 font-weight-bolder">${from_currency}${to_currency} <span class="text-darker-gray">${trade_type}</span></p>
                            <p class="mb-0">${formatDate(new Date(+trade_time), "DD/MM/YYYY HH:mm")}</p>
                        </div>
                        <div class="d-flex align-items-center">
                            <p class="mb-0 font-bold mr-3">S$${closed_price}</p>
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
                            <p class="mb-0 font-bold responsive-value">${trade_price}</p>
                        </div>
                        <div class="mr-3 d-flex flex-column justify-content-between">
                            <p class="mb-0 responsive-label">Swap</p>
                            <p class="mb-0 font-bold responsive-value">${swap}</p>
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
})()
