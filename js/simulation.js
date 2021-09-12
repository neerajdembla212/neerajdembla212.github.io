(() => {
    class State {
        strategyProviders = [];
        strategyDetails = {};
        lineChartData = {};
        strategyProvidersSearchResult = [];

        getStrategyProviders() {
            return this.strategyProviders;
        }
        setStrategyProviders(data) {
            if (!data || !Array.isArray(data)) {
                return;
            }
            this.strategyProviders = data;
        }

        getStrategyDetails() {
            return this.strategyDetails;
        }
        setStrategyDetails(data) {
            if (!data) {
                return;
            }
            this.strategyDetails = data;
        }

        getLineChartData() {
            return this.lineChartData
        }
        setLineChartData(data) {
            if (!data) {
                return
            }
            this.lineChartData = data;
        }

        getStrategyProvidersSearchResult() {
            return this.strategyProvidersSearchResult
        }
        setStrategyProvidersSearchResult(data) {
            if (!data || !Array.isArray(data)) {
                return
            }
            this.strategyProvidersSearchResult = data;
        }
    }
    const STATE = new State();

    // Document ready
    $(function () {
        registerGlobalEvents();
        fetchStrategyProviders();
        fetchStrategyDetails();
        fetchLineData();
        fetchStrategyProvidersSearch();
    });

    function registerGlobalEvents() {
        // add country flag on input
        $('#country-flag-input').attr('src', getCountryFlags('us'));

        // datepicker init
        // expiration date picker
        $('.capital-date-input').datepicker({
            todayBtn: "linked",
            keyboardNavigation: true,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true
        }).on('changeDate', function (e) {
            const displayDateButton = $(e.target).find('button');
            displayDateButton.text(formatDate(e.date, "DD MMM YYYY"));
        });
    }
    // fetch api methods start
    function fetchStrategyProviders() {
        callAjaxMethod({
            url: 'https://copypip.free.beeceptor.com/get-portfolio-users/providers',
            successCallback: (data) => {
                STATE.setStrategyProviders(data.data);
                renderStrategyProviders();
            }
        })
    }

    function fetchStrategyDetails() {
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/get-strategy-details`,
            successCallback: (data) => {
                STATE.setStrategyDetails(data.data);
                renderSparkline();
                // activate dynamic Tooltips 
                activateTooltips();
            }
        })
    }

    function fetchLineData() {
        callAjaxMethod({
            url: "https://copypip.free.beeceptor.com/portfolio-line-data",
            successCallback: (data) => {
                STATE.setLineChartData(data.data);
                plotLineChart()
            }
        });
    }

    function fetchStrategyProvidersSearch() {
        callAjaxMethod({
            url: "https://copypip.free.beeceptor.com/strategy-providers",
            successCallback: (data) => {
                STATE.setStrategyProvidersSearchResult(data.data);
                renderSearchStrategyProvider();
            }
        });

    }
    // fetch api methods end

    // render strategy providers start
    function renderStrategyProviders() {
        const strategyProviders = STATE.getStrategyProviders();
        const container = $('.simulation-strategy-providers');
        container.append(getStrategyProvidersTableHTML(strategyProviders));
    }

    function getStrategyProvidersTableHTML(strategyProviders) {
        return `<table class="table">
            ${getStrategyProvidersTableHeaders()}
            ${getStrategyProvidersTableBody(strategyProviders)}
            ${getStrategyProvidersTableFooter()}
        </table>`
    }

    function getStrategyProvidersTableHeaders() {
        return `
        <thead>
            <tr>
            <th class="align-middle w-22 extra-small-font pr-0">Provider</th>
            <th class="text-right align-middle w-16 extra-small-font pr-0">joined duration</th>
            <th class="text-right align-middle w-15 extra-small-font pr-0">equity growth</th>
            <th class="text-right align-middle w-9 extra-small-font pr-0">Trades</th>
            <th class="text-right align-middle w-17 extra-small-font pr-0">Subscription FEEs</th>
            <th class="text-center align-middle w-9 extra-small-font pr-0">P share %</th>
            <th class="text-right align-middle w-8 extra-small-font pr-0">TOTAL FEEs</th>
            <th class="text-right align-middle extra-small-font">Actions</th>
            </tr>
        </thead>
        `
    }

    function getStrategyProvidersTableBody(data) {
        if (!data || !Array.isArray(data)) {
            return
        }
        const rowsHTML = [];
        data.forEach(user => {
            rowsHTML.push(getStrategyProvidersTableRow(user));
        })
        return `
          <tbody>
            ${rowsHTML.join('')}
          </tbody>
          `
    }

    function getStrategyProvidersTableRow(user) {
        if (!user) {
            return '';
        }
        const { id,
            profile_image,
            name,
            username,
            country,
            total_profit_loss,
            trades,
            subscription_fee,
            profit_share,
            total_fee,
            joined_start_date,
            joined_end_date
        } = user;
        return `<tr id="table-user-${id}">
        <td class="w-22">
            <div class="d-flex">
            <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${profile_image}" />
            <div class="ml-2 float-left">
                <p class="font-bold font-size-12 mb-0">
                ${username}
                </p>
                <div class="d-flex">
                    <p class="text-light-black font-size-12 mb-0">
                        ${name}
                    </p>
                    <img class="ml-1" src="${getCountryFlags(country)}" />
                </div>
            </div>
          </div>
        </td>
        <td class="w-16 small-font">
            ${formatDate(new Date(joined_start_date))} - ${formatDate(new Date(joined_end_date))}
        </td>
        <td class="font-bold font-size-16 text-center align-middle w-15">
            $${formatWithCommas(total_profit_loss)}
        </td>
        <td class="text-center align-middle w-9">
            ${formatWithCommas(trades)}
        </td>
        <td class="text-center font-bold align-middle w-17">
            S$${formatWithCommas(subscription_fee)}
        </td>
        <td class="text-center align-middle w-5">
            ${profit_share}
        </td>
        <td class="text-center font-bold align-middle w-11">
            S$${formatWithCommas(total_fee)}
        </td>
        <td class="action-tools text-center align-middle action-icon">
            <i class="fa fa-gear mr-1"></i>
        </td>
      </tr>`
    }

    function getStrategyProvidersTableFooter() {
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

    // render strategy providers end

    // render sparkline start
    function renderSparkline() {
        const strategy = STATE.getStrategyDetails();
        const container = $('.sparkline-container');
        container.empty().append(getSparklineHTML(strategy));
        // container.append(getSparklineResponsiveHTML(strategy, role));
    }

    function getSparklineHTML(strategy) {
        const { cumulative_returns,
            strategy_age,
            deposits,
            current_balance,
            withdrawals,
            followers,
            trades,
            max_drawdown,
            amount_paid } = strategy;

        return `
        <div class="d-flex flex-wrap justify-content-between desktop-content">
            <div class="sparkline mr-0">
            <div class="key tooltip-demo">Cumulative returns <i class="fa fa-question-circle cursor-pointer ml-1" data-toggle="tooltip" data-placement="right" data-html="true" title="Since Inception </br> ${strategy_age}"></i></div>
            <div class="d-flex justify-content-between">
                <div class="value green highlight">${cumulative_returns}<sup class="ml-1 font-weight-normal">%</sup></div>
                <div class="ml-3 mt-2 light-white">
                    <p class="mb-0 font-weight-light"></p>
                </div>
            </div>
            </div>
            <div class="divider mx-2"></div>
            <div class="sparkline">
            <div class="key">Current Balance</div>
            <div class="value white">SGD${formatWithCommas(current_balance)}</div>
            </div>
            <div class="sparkline">
            <div class="key">Deposits</div>
            <div class="value white">SGD${formatWithCommas(deposits)}</div>
            </div>
            <div class="sparkline">
            <div class="key">Withdrawals</div>
            <div class="value white">SGD${formatWithCommas(withdrawals)}</div>
            </div>
            <div class="sparkline">
            <div class="key">
                <p class="mb-0">Total Paid <i class="fa fa-question-circle cursor-pointer ml-1" data-toggle="tooltip" data-placement="right" data-html="true" title="Fees + Profit Shared"></i></p>
            </div>
            <div class="value white">SGD${formatWithCommas(amount_paid)}</div>
            </div>
            <div class="sparkline">
                <div class="key">Followers</div>
            <div class="value white">SGD${formatWithCommas(followers)}</div>
            </div>
            <div class="sparkline">
            <div class="key">Trades</div>
            <div class="value green">${formatWithCommas(trades)}</div>
            </div>
            <div class="sparkline">
            <div class="key">Max Drawdown</div>
            <div class="value dark-red">${max_drawdown}</div>
        </div>
      </div>`
    }
    // render sparkline end

    // render line chart start
    // Plot Line chart 
    function plotLineChart() {
        const canvas = document.querySelector(".simulation-line-chart #line-chart");
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
                                padding: 10
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
        ctx.globalCompositeOperation = 'destination-over';
    }

    // render search strategy provider start
    function renderSearchStrategyProvider() {
        const strategyProviders = STATE.getStrategyProvidersSearchResult();
        const container = $('#add-provider-menu');
        const rowsHTML = [];
        strategyProviders.forEach(provider => {
            rowsHTML.push(getStrategyProviderSearchRow(provider))
        })
        container.append(rowsHTML.join(''))
    }
    function getStrategyProviderSearchRow(provider) {
        if (!provider) {
            return
        }
        const { id,
            profile_image,
            username,
            name,
            country,
            return_duration,
            return_percentage } = provider;
        return `
            <li class="cursor-pointer px-2" data-id="provider-${id}">
                <div class="d-flex justify-content-between py-2">
                    <div class="d-flex">
                        <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${profile_image}">
                        <div class="ml-2 float-left">
                            <p class="font-bold font-size-12 mb-0">${username}</p>
                            <div class="d-flex">
                                <p class="text-light-black font-size-12 mb-0">${name}</p>
                                <img class="ml-1" src="${getCountryFlags(country)}">
                            </div>
                        </div>
                    </div>
                    <p class="mb-0 medium-font text-light-gray font-bold">${return_duration}</p>
                    <p class="mb-0 medium-font text-dark-green font-bold">${return_percentage}%</p>
                </div>
            </li>
        `
    }
    // render search strategy provider end
    // render line chart end

})();