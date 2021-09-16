(() => {
    class State {
        lineChartData = [];
        providerId;
        tradeHistory = [];
        providerDetails = {};

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
            return this.providerId;
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
        getProviderDetails() {
            return this.providerDetails;
        }
        setProviderDetails(data) {
            if (!data) {
                return;
            }
            this.providerDetails = data;
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
        fetchProviderDetails();
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
                renderTradeHistorySection();
            }
        })
    }

    function fetchProviderDetails() {
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/strategy-provider-details?id=${STATE.getProviderId()}`,
            successCallback: (data) => {
                STATE.setProviderDetails(data.data);
                renderProviderDetailsSection();
                renderFollowersSection();
                renderFollowProviderPopup();
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
    function renderTradeHistorySection() {
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
          <td colspan="10" class="pb-0">
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
    // render trade history responsive html end

    // render provider details section html start
    function renderProviderDetailsSection() {
        const providerDetails = STATE.getProviderDetails();
        const container = $('.strategy-provider-details-section .provider-details-section');
        container.append(getProviderDetailsHTML(providerDetails));
    }
    function getProviderDetailsHTML(data) {
        if (!data) {
            return
        }
        const { profile_image,
            username,
            name,
            country,
            strategy_philosophy,
            joined_date,
            strategy_age,
            cumulative_returns,
            avg_growth_per_month,
            avg_pips,
            trade_count,
            max_drawdown
        } = data;

        return `
        <div class="mb-3">
            <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${profile_image}">
            <div class="ml-2 float-left">
                <p class="font-bold font-size-12 mb-0">
                    ${username}
                </p>
                <p class="text-light-black font-size-12 mb-0">
                    ${name}
                    <img class="ml-1" src="${getCountryFlags(country)}">
                </p>
            </div>
        </div>
        <div class="divider"></div>
        <!-- strategy philosophy start -->
        <div class="py-3">
            <p class="mb-2 small-font font-bold text-dark-black">Strategy Philosophy</p>
            <p class="mb-2 text-dark-gray">${strategy_philosophy}</p>
            <p class="mb-0 text-dark-gray small-font font-bold">Joined ${formatDate(+joined_date)}
        </div>
        <!-- strategy philosophy end -->
        <div class="divider"></div>
        <!-- strategy age start -->
        <div class="py-3 d-flex justify-content-between align-items-center">
            <p class="mb-0 font-bold small-font text-dark-black">Strategy Age</p>
            <p class="mb-0 medium-font font-bold text-dark-black">${strategy_age}</p>
        </div>
        <!-- strategy age end -->
        <div class="divider"></div>
        <!-- Cumulative returns start -->
        <div class="py-3 d-flex justify-content-between align-items-center">
            <div>
                <p class="mb-0 font-bold mall-font text-dark-black">Cumulative returns </p>
                <p class="mb-0 small-font text-dark-black font-weight-light">since Inception 1
                    Jul 2021</p>
            </div>
            <p class="mb-0 super-large-font text-dark-green font-bold">${cumulative_returns}%</p>
        </div>
        <!-- Cumulative returns end -->
        <div class="divider"></div>
        <!-- Average growth start -->
        <div class="py-3 d-flex justify-content-between align-items-center">
            <div>
                <p class="mb-0 font-bold small-font text-dark-black">Average Growth per Month
                </p>
            </div>
            <p class="mb-0 extra-large-font text-dark-green font-bold">${avg_growth_per_month}%</p>
        </div>
        <!-- Average growth end -->
        <div class="divider"></div>
        <!-- Average pips start -->
        <div class="py-3 d-flex justify-content-between align-items-center">
            <div>
                <p class="mb-0 font-bold small-font text-dark-black">Average Pips </p>
            </div>
            <p class="mb-0 extra-large-font text-dark-black font-bold">${avg_pips}</p>
        </div>
        <!-- Average pips end -->
        <div class="divider"></div>
        <!-- Trades start -->
        <div class="py-3 d-flex justify-content-between align-items-center">
            <div>
                <p class="mb-0 font-bold small-font text-dark-black">Trades </p>
            </div>
            <p class="mb-0 extra-large-font text-dark-black font-bold">${trade_count}</p>
        </div>
        <!-- Trades end -->
        <div class="divider"></div>
        <!-- Max Drawdown start -->
        <div class="pt-3 d-flex justify-content-between align-items-center">
            <div>
                <p class="mb-0 font-bold small-font text-dark-black">Max Drawdown </p>
            </div>
            <p class="mb-0 extra-large-font text-light-red font-bold">${max_drawdown}%</p>
        </div>
        <!-- Max Drawdown end -->
        `
    }
    // render provider details section html end

    // render followers section html start
    function renderFollowersSection() {
        const providerDetails = STATE.getProviderDetails();
        const container = $('.strategy-provider-details-section .followers-section');
        container.append(getFollowerDetailsHTML(providerDetails));
    }

    function getFollowerDetailsHTML(data) {
        if (!data) {
            return '';
        }

        const {
            follower_count,
            follower_funds,
            monthly_subscription_fee,
            profit_sharing
        } = data;

        return `
                <p class="mb-0 font-bold extra-large-font text-modal-black">Followers</p>
                <!--Number of followers start -->
                <div class="py-3 d-flex justify-content-between align-items-center">
                    <p class="mb-0 small-font font-bold">Number of Followers</p>
                    <p class="mb-0 large-font font-bold">${follower_count}</p>
                </div>
                <!--Number of followers end -->
                <div class="divider"></div>
                <!--follower fund start -->
                <div class="py-3 d-flex justify-content-between align-items-center">
                    <p class="mb-0 small-font font-bold">Follower Funds</p>
                    <p class="mb-0 large-font font-bold">$${formatWithCommas(follower_funds)}</p>
                </div>
                <!-- follower fund end -->
                <div class="divider"></div>

                <div class="divider"></div>
                <!-- monthly subscription start -->
                <div class="py-3 d-flex justify-content-between align-items-center">
                    <p class="mb-0 small-font font-bold">Monthly Subscription Fee</p>
                    <p class="mb-0 large-font font-bold">$${monthly_subscription_fee}</p>
                </div>
                <!-- monthly subscription end -->
                <div class="divider"></div>
                <!-- profit start -->
                <div class="py-3 d-flex justify-content-between align-items-center">
                    <p class="mb-0 small-font font-bold">Profit Sharing Percentage</p>
                    <p class="mb-0 large-font font-bold">${profit_sharing}%</p>
                </div>
                <!-- profit end -->
                <div class="divider"></div>
                <div class="d-flex justify-content-end pt-3">
                    <button type="button" class="btn btn-w-m btn-default text-navy">
                        Follow Provider
                    </button>
                </div>
        `
    }
    // render follow provider start
    function renderFollowProviderPopup() {
        const strategyProviderDetails = STATE.getProviderDetails()
        const bodyContainer = $('#follow-provider-modal .modal-body');
        bodyContainer.empty().append(getFollowProviderPopupBody(strategyProviderDetails));
        const footerContainer = $('#follow-provider-modal .modal-footer');
        footerContainer.empty().append(getFollowProviderPopupFooter())
        registerFollowProviderPopupEvents();
    }

    function getFollowProviderPopupBody(data) {
        if (!data) {
            return ''
        }
        const { username,
            name,
            profile_image,
            country,
            cumulative_returns,
            advised_min,
            avg_lot_size,
            max_drawdown,
            strategy_age,
            profit_sharing } = data;
        return `
          <!-- name, profile image details start -->
          <div class="d-flex justify-content-between">
                <div class="mb-2">
                  <img alt="image" class="rounded-circle img-fluid img-sm float-left" src=${profile_image}>
                  <div class="username-container">
                    <p class="font-bold font-size-12 mb-0">
                      ${username}
                    </p>
                    <p class="text-light-black font-size-12 mb-0">
                      ${name}
                      <img class="ml-1" src=${getCountryFlags(country)}>
                    </p>
                  </div>
                </div>
          </div>
    <!-- name, profile image details end -->
    <!-- Data display Row 1 start -->
          <div class="d-flex justify-content-between mb-2">
            <div class="w-50 d-flex justify-content-between mr-3 align-items-center">
              <div class="uppercase-label">TOTAL RETURNS</div>
              <div class="text-dark-green d-flex align-items-center"><span class="up-arrow-green mr-1"></span><span
                  class="font-bold">${cumulative_returns}%</span></div>
            </div>
            <div class="w-50 d-flex justify-content-between align-items-center">
              <div class="uppercase-label">advised min</div>
              <div class="text-light-gray medium-font font-bold">$${formatWithCommas(advised_min)}</div>
            </div>
          </div>
    <!-- Data display Row 1 end -->
    <!-- Data display Row 2 start -->
    <div class="d-flex justify-content-between mb-2">
      <div class="w-50 d-flex justify-content-between mr-3 align-items-center">
        <div class="uppercase-label">Avg Lot Size</div>
        <div class="font-bold medium-font">${avg_lot_size}</div>
      </div>
      <div class="w-50 d-flex justify-content-between align-items-center">
        <div class="uppercase-label">draw down</div>
        <div class="text-light-red medium-font">${max_drawdown}%</div>
      </div>
    </div>
    <!-- Data display Row 2 end -->
    <!-- Data display Row 3 start -->
      <div class="d-flex justify-content-between mb-2">
        <div class="w-50 d-flex justify-content-between mr-3 align-items-center">
          <div class="uppercase-label">Age</div>
          <div class="font-bold medium-font">${strategy_age}</div>
        </div>
        <div class="w-50 d-flex justify-content-between align-items-center">
          <div class="uppercase-label">P share %</div>
          <div class="medium-font">${profit_sharing}%</div>
        </div>
      </div>
      <!-- Data display Row 3 end -->
      <!-- tabs header start -->
      <div>
        <ul class="nav nav-tabs flex-nowrap py-3" role="tablist">
          <li>
            <a class="nav-link active" data-toggle="tab" href="#automatic">Automatic</a>
          </li>
          <li>
            <a class="nav-link" data-toggle="tab" href="#percentage">Percentage</a>
          </li>
          <li>
            <a class="nav-link" data-toggle="tab" href="#fixed">Fixed</a>
          </li>
          <li>
            <a class="nav-link" data-toggle="tab" href="#proportional">Proportional</a>
          </li>
        </ul>
      </div>
      <!-- tabs header end -->
      <div class="tab-content py-3">
      <!-- Automatic Tab content -->
      <!-- For Read more/less to function the parent must have "read-more-less" class -->
        <div role="tabpanel" id="automatic" class="tab-pane active read-more-less">
          <p class="font-bold medium-font text-modal-black mb-2">Automatic Settings Adjustment Fund Allocation
          </p>
          <p class="text-modal-gray extra-large-font mb-2">This process is automatic.</p>
          <p class="small-font read-less-text mb-0"><button type="button"
              class="btn btn-outline btn-link font-bold p-0 text-navy btn-read-more">Learn More</button> about
            <b>Automatic
              Setting
              Adjustments</b>
          </p>
          <div class="read-more-text d-none m-0">
            <p class="m-0">The system will choose the favourable lot size for your trading
              account
              based on your account usage and available funds. No input from you is necessary.</p>
            <p class="d-flex justify-content-end m-0">
              <button type="button"
                class="btn btn-outline btn-link font-bold p-0 float-right text-navy small-font btn-read-less">Show
                Less</button>
            </p>
          </div>
        </div>
        <!-- Percentage Tab content -->
        <div role="tabpanel" id="percentage" class="tab-pane read-more-less">
          <p class="font-bold medium-font text-modal-black mb-2">Percentage of Total Balance Fund Allocation
          </p>
          <p class="mb-2 text-light-red">Set a percentage or fixed value for this Strategy Provider.</p>
          <div class="d-flex align-items-center mb-2">
            <div class="btn-group mr-3">
              <button data-toggle="dropdown" class="btn btn-default dropdown-toggle">
                Percentage
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">Action</a></li>
                <li>
                  <a class="dropdown-item" href="#">Another action</a>
                </li>
                <li>
                  <a class="dropdown-item" href="#">Something else here</a>
                </li>
                <li class="dropdown-divider"></li>
              </ul>
            </div>
            <input type="text" class="form-control w-25 mr-3">
            <span class="font-bold medium-font text-dark-black">%</span>
          </div>
          <p class="small-font read-less-text mb-0"><button type="button"
              class="btn btn-outline btn-link font-bold p-0 text-navy btn-read-more">Learn More</button> about
            <b>Percentage of Total Balance</b>
          </p>
          <div class="read-more-text d-none m-0">
            <p class="m-0">Enter a percentage of the total balance that you want to allocate to this trading
              strategy. E.g. if you enter “10%”, this means that 1/10 of your balance will be used to trade
              according to this strategy. You may also set the value higher than 100% depending on your risk
              tolerance.

              You can also set absolute values in which case the system will calculate the percentage
              depending
              on your balance. E.g. if you enter “USD 1000” with a balance of “USD 3000”, our trading server
              will execute a trade size 3 times smaller.

              The trade size (no. of lots) will be calculated automatically. Please note that this allocation
              does not limit your losses to the percentage of your account chosen. This only affects the size
              that is opened.</p>
            <p class="d-flex justify-content-end m-0">
              <button type="button"
                class="btn btn-outline btn-link font-bold p-0 float-right text-navy small-font btn-read-less">Show
                Less</button>
            </p>
          </div>
        </div>

        <!-- fixed Tab content -->
        <div role="tabpanel" id="fixed" class="tab-pane read-more-less">
          <p class="font-bold medium-font text-modal-black mb-2">Fixed Lot Size Fund Allocation
          </p>
          <p class="mb-2 text-light-red">Set a specific trade size you want to follow for this Strategy
            Provider.</p>
          <div class="d-flex align-items-center mb-2">
            <label class="col-form-label mr-3 font-bold text-dark-black">Fixed Trade Size</label>
            <input type="text" class="form-control w-25 mr-3" >
            <span class="font-bold medium-font text-dark-black">LOT</span>
          </div>
          <p class="small-font read-less-text mb-0"><button type="button"
              class="btn btn-outline btn-link font-bold p-0 text-navy btn-read-more">Learn More</button> about
            <b>Fixed Lot Size</b>
          </p>
          <div class="read-more-text d-none m-0">
            <p class="m-0">Enter the fixed trade size that you want to execute in your brokerage account.
              Please
              note that if a strategy provider works with a dynamic/floating trade size, your trading results
              may differ.

              It is recommended to use this option only if you can see two increasing parallel lines on the
              chart “Percentage vs Pips” of the trading strategy statistics page. In other words, this option
              can be effectively used if a trading strategy generates profits in Pips. E.g. “0.10” means that
              our trading server will always execute trades of a fixed size of 0.1 lot (10 000 units of the
              base
              currency) in your account.</p>
            <p class="d-flex justify-content-end m-0">
              <button type="button"
                class="btn btn-outline btn-link font-bold p-0 float-right text-navy small-font btn-read-less">Show
                Less</button>
            </p>
          </div>
        </div>

        <!-- Proportional tab content -->
        <div role="tabpanel" id="proportional" class="tab-pane read-more-less">
          <p class="font-bold medium-font text-modal-black mb-2">Proportional Trade Size Fund Allocation
          </p>
          <p class="mb-2 text-light-red">Set a specific trade size you want to follow for this Strategy
            Provider.</p>
          <div class="d-flex align-items-center mb-2">
            <label class="col-form-label mr-3 font-bold text-dark-black">Ratio of Trade Size</label>
            <input type="text" class="form-control w-25 mr-3" >
            <span class="font-bold medium-font text-dark-black">Ratio</span>
          </div>
          <p class="small-font read-less-text mb-0"><button type="button"
              class="btn btn-outline btn-link font-bold p-0 text-navy btn-read-more">Learn More</button> about
            <b>Proportional Trade Size</b>
          </p>
          <div class="read-more-text d-none m-0">
            <p class="m-0">This feature allows setting up dynamic, proportional trade size coefficient in
              percentage relation.

              If you want to open positions 5 times smaller than the strategy provider, you need to input
              “0.20”.

              If you want to open positions 5 times bigger than the strategy provider, input “5.00”.

              To meet the lot quantity values of the strategy provider input “1.00”.</p>
            <p class="d-flex justify-content-end m-0">
              <button type="button"
                class="btn btn-outline btn-link font-bold p-0 float-right text-navy small-font btn-read-less">Show
                Less</button>
            </p>
          </div>
        </div>

    </div>
    <section class="risk-mangement py-3">
    <p class="font-bold medium-font">Risk Management </p>
    <!-- Lot size input start -->
    <div class="d-flex justify-content-between mb-3">
      <div class="w-75 mr-3">
        <p class="text-gray medium-font mb-1">Minimum Lot Size</p>
        <div class="d-flex align-items-center">
          <input type="text" class="form-control w-50 mr-3">
          <span class="font-bold medium-font text-dark-black">LOT</span>
        </div>
      </div>
      <div>
        <p class="text-gray medium-font mb-1">Maximum Lot Size</p>
        <div class="d-flex align-items-center">
          <input type="text" class="form-control w-50 mr-3">
          <span class="font-bold medium-font text-dark-black">LOT</span>
        </div>
      </div>
    </div>
    <!-- Lot size input end -->
    <!-- Fix profit/loss input start -->
    <div class="d-flex justify-content-between mb-3">
      <div class="w-75 mr-3">
        <p class="text-gray medium-font mb-1">Fix Take Profit</p>
        <div class="d-flex align-items-center">
          <input type="text" class="form-control w-50 mr-3">
          <span class="font-bold medium-font text-dark-black">Pips</span>
        </div>
      </div>
      <div>
        <p class="text-gray medium-font mb-1">Fix Stop Loss</p>
        <div class="d-flex align-items-center">
          <input type="text" class="form-control w-50 mr-3">
          <span class="font-bold medium-font text-dark-black">Pips</span>
        </div>
      </div>
    </div>
    <!-- Fix profit/loss input end -->
    <div class="form-check abc-checkbox form-check-inline mb-2">
      <input class="form-check-input mr-3" type="checkbox" value="option1">
      <label class="form-check-label text-gray medium-font"> Copy Open Trades & Pending Orders </label>
    </div>
    <div class="form-check abc-checkbox form-check-inline">
      <input class="form-check-input mr-3" type="checkbox" value="option1">
      <label class="form-check-label text-gray medium-font"> Limit Quantity of Simultaneous Trades
      </label>
    </div>
  </section>
    `
    }
    function getFollowProviderPopupFooter() {
        const accountNo = localStorage.getItem('selectedAccountNo');
        return `
    <div class="account-number p-1"><span class="mr-1 text-navy live">LIVE</span><span class="medium-font font-bold">${accountNo}</span></div>
    <button type="button" class="btn btn-primary" id="follow-provider">Follow Provider</button>
    `
    }

    function registerFollowProviderPopupEvents() {
        readMoreLessEventHandler();
    }

    function readMoreLessEventHandler() {
        // read more less event handlers
        $(".read-more-less .btn-read-more").unbind().click(function () {
            $('.read-more-less .read-less-text').toggleClass('d-none');
            $('.read-more-less .read-more-text').toggleClass('d-none');
        })
        $('.read-more-less .btn-read-less').unbind().click(function () {
            $('.read-more-less .read-more-text').toggleClass('d-none');
            $('.read-more-less .read-less-text').toggleClass('d-none');
        })
    }
    // render follow provider end
    // render follow provider popup end
})()
