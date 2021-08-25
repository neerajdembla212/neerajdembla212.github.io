(() => {
    class State {
        strategyDetails = {};
        userDetails = {};
        lineChartData = {};
        userList = {}; // this will store followers or providers depending on user's role
        role = ''; // provider or follower
        getStrategyDetails() {
            return this.strategyDetails;
        }

        setStrategyDetails(data) {
            this.strategyDetails = data;
        }

        getUserDetails() {
            return this.userDetails;
        }

        setUserDetails(data) {
            this.userDetails = data;
        }

        getLineChartData() {
            return this.lineChartData;
        }

        setLineChartData(data) {
            this.lineChartData = data;
        }

        getUserList() {
            return this.userList;
        }

        setUserList(data) {
            if (!data || !Array.isArray(data)) {
                return
            }
            this.userList = data;
        }

        getRole() {
            return this.role;
        }
        setRole(role) {
            this.role = role;
        }
    }
    const STATE = new State();
    // document ready function
    $(function () {
        registerEvents();
        STATE.setRole(localStorage.getItem('currentRole')); // provider or follower
        fetchStrategyDetails();
        fetchUserDetails(fetchListOfUsers);
        fetchLineData();
    })

    // This function fetch strategy details and render sparkline
    function fetchStrategyDetails() {
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/get-strategy-details/${STATE.getRole()}`,
            successCallback: (data) => {
                STATE.setStrategyDetails(data.data);
                renderStrategyDetails(STATE.getRole());
            }
        })
    }

    // This function will fetch user details and show role specific elements
    function fetchUserDetails(cb) {
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/user-details/${STATE.getRole()}`,
            successCallback: (data) => {
                STATE.setUserDetails(data.data);
                showRoleWiseElements();
                if (cb && typeof cb === 'function') {
                    cb();
                }
            }
        });
    }

    // This function will fetch line data and plot line chart
    function fetchLineData() {
        callAjaxMethod({
            url: "https://copypip.free.beeceptor.com/portfolio-line-data",
            successCallback: (data) => {
                STATE.setLineChartData(data.data);
                plotLineChart()
            }
        });
    }

    // this function will fetch strategy providers or followers based on user's role and render the table accordingly
    function fetchListOfUsers() {
        const userRole = STATE.getUserDetails().role;
        if (userRole === 'Strategy Provider') {
            // fetch followers and render followers table
            fetchStrategyFollowers();
        } else if (userRole === 'Strategy Follower') {
            // fetch providers and render providers table
            fetchStrategyProviders();
        }
    }

    function fetchStrategyProviders() {
        callAjaxMethod({
            url: 'https://copypip.free.beeceptor.com/get-portfolio-users/providers',
            successCallback: (data) => {
                STATE.setUserList(data.data);
                renderStrategyProviders();
            }
        })
    }

    function renderStrategyProviders() {
        const users = STATE.getUserList();
        const container = $('.portfolio-users-table');
        container.append(getStrategyProvidersTableHTML(users));
    }

    function fetchStrategyFollowers() {
        callAjaxMethod({
            url: 'https://copypip.free.beeceptor.com/get-portfolio-users/followers',
            successCallback: (data) => {
                STATE.setUserList(data.data);
                renderStrategyFollowers();
            }
        })
    }

    function renderStrategyFollowers() {
        const users = STATE.getUserList();
        const container = $('.portfolio-users-table');
        container.append(getStrategyFollowersTableHTML(users));
    }

    function getStrategyProvidersTableHTML(data) {
        return `<table class="table">
            ${getStrategyProvidersTableHeaders()}
            ${getStrategyProvidersTableBody(data)}
            ${getStrategyProvidersTableFooter()}
        </table>`
    }

    function getStrategyProvidersTableHeaders() {
        return `
        <thead>
            <tr>
            <th>Provider</th>
            <th class="text-center">NET P/L</th>
            <th class="text-center">Total Returns</th>
            <th class="text-center">Max DD</th>
            <th class="text-center">Trades</th>
            <th class="text-center">Subscription FEEs</th>
            <th class="text-center">P share %</th>
            <th class="text-center">TOTAL FEEs</th>
            <th>Actions</th>
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
            total_returns,
            max_drawdown,
            trades,
            subscription_fee,
            profit_share,
            total_fee } = user;
        return `<tr id="table-user-${id}">
        <td>
          <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${profile_image}" />
          <div class="ml-2 float-left">
            <p class="font-bold font-size-12 mb-0">
              ${username}
            </p>
            <p class="text-light-black font-size-12 mb-0">
              ${name}
              <img class="ml-1" src="${getCountryFlags(country)}" />
            </p>
          </div>
        </td>
        <td class="font-bold font-size-16 text-center align-middle">
          $${formatWithCommas(total_profit_loss)}
        </td>
        <td class="text-center align-middle">
          <span class="text-dark-green font-weight-bold">
            <i class="fa fa-play fa-rotate-270 font-size-12"></i>
            ${total_returns}
          </span>
        </td>
        <td class="text-center">
          ${max_drawdown}
        </td>
        <td class="text-center">
          ${formatWithCommas(trades)}
        </td>
        <td class="text-center font-weight-bold">
          S$${formatWithCommas(subscription_fee)}
        </td>
        <td class="text-center">
          ${profit_share}
        </td>
        <td class="text-center font-weight-bold">
          S$${formatWithCommas(total_fee)}
        </td>
        <td class="action-tools text-center">
          <i class="fa fa-pause mr-1"></i>
          <i class="fa fa-stop mr-1"></i>
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

    function getStrategyFollowersTableHTML(data) {
        return `<table class="table">
            ${getStrategyFollowersTableHeaders()}
            ${getStrategyFollowersTableBody(data)}
            ${getStrategyFollowersTableFooter()}
        </table>`
    }

    function getStrategyFollowersTableHeaders() {
        return `
        <thead>
            <tr>
            <th>Provider</th>
            <th class="text-center">joined</th>
            <th class="text-center">Period</th>
            <th class="text-center">P/L</th>
            <th class="text-center">HWM Difference</th>
            <th class="text-center">BALANCE</th>
            <th class="text-center">FEE earned</th>
            <th class="text-center">com earned</th>
            <th>Actions</th>
            </tr>
        </thead>
        `
    }

    function getStrategyFollowersTableBody(data) {
        if (!data || !Array.isArray(data)) {
            return
        }
        const rowsHTML = [];
        data.forEach(user => {
            rowsHTML.push(getStrategyFollowersTableRow(user));
        })
        return `
          <tbody>
            ${rowsHTML.join('')}
          </tbody>
          `
    }

    function getStrategyFollowersTableRow(user) {
        if (!user) {
            return '';
        }
        const { id,
            profile_image,
            name,
            username,
            country,
            joined_on,
            hwm_diff,
            profit_or_loss,
            balance,
            com_earned,
            fee_earned,
            is_new
        } = user;
        const newUSerChip = is_new === "true" ? `<span class="new-chip px-1 ml-2">New</span>` : '';

        return `<tr id="table-user-${id}">
        <td>
          <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${profile_image}" />
          <div class="ml-2 float-left">
            <p class="font-bold font-size-12 mb-0">
              ${username}
              ${newUSerChip}
            </p>
            <p class="text-light-black font-size-12 mb-0">
              ${name}
              <img class="ml-1" src="${getCountryFlags(country)}" />
            </p>
          </div>
        </td>
        <td class="font-bold text-center align-middle">
          ${formatDate(new Date(+joined_on))}
        </td>
        <td class="text-center align-middle">
          ${calculateDateDiff(new Date(+joined_on), new Date())}
        </td>
        <td class="text-center font-bold text-dark-green align-middle">
        S$${formatWithCommas(profit_or_loss)}
        </td>
        <td class="text-center align-middle">
        S$${formatWithCommas(hwm_diff)}
        </td>
        <td class="font-bold text-center align-middle">
        S$${formatWithCommas(balance)}
        </td>
        <td class="text-center align-middle">
        S$${fee_earned}
        </td>
        <td class="font-bold text-center align-middle">
        S$${formatWithCommas(com_earned)}
        </td>
      
        <td class="action-tools ">
         ${getStrategyFollowersActionColumn(id, is_new)}
        </td>
      </tr>`
    }

    function getStrategyFollowersActionColumn(id, isNew) {
        if (isNew === "true") {
            return `<button class="btn btn-white text-dark-green font-bold px-1" type="button" data-id="${id}">Accept</button> 
            <button class="btn btn-default text-bleed-red font-bold px-1" type="button" data-id="${id}">Reject</button>`
        } else if (isNew === "false") {
            return ` <i class="fa fa-pause mr-1" data-id="${id}"></i>
            <i class="fa fa-stop mr-1" data-id="${id}"></i>
            <i class="fa fa-gear mr-1" data-id="${id}"></i>`
        }
    }

    function getStrategyFollowersTableFooter() {
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


    // function to display role chip in sub header
    function showRoleWiseElements() {
        const user = STATE.getUserDetails()
        if (user.role === 'Strategy Provider') {
            $('.role-chip-follower').addClass('d-none');
            $('.role-chip-provider').removeClass('d-none');

            $('#stop-strategy').removeClass('d-none');
            $('#strategy').removeClass('d-none');
            $('.portfolio-users-table .table-title').text('Followers')
        }
        else if (user.role === 'Strategy Follower') {
            $('.role-chip-follower').removeClass('d-none');
            $('.role-chip-provider').addClass('d-none');

            $('#stop-strategy').addClass('d-none');
            $('#strategy').addClass('d-none');
            $('.portfolio-users-table .table-title').text('Following')
        }
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

    // render strategy details from api data
    function renderStrategyDetails(role) {
        const strategy = STATE.getStrategyDetails();
        const container = $('.sparkline-container');
        container.empty().append(getStrategyDetailsHTML(strategy, role));
    }

    function getStrategyDetailsHTML(strategy, role) {
        const { cumulative_returns,
            strategy_age,
            deposits,
            current_balance,
            withdrawals,
            fees_earned,
            followers,
            trades,
            max_drawdown,
            amount_paid } = strategy;

        let roleSpecificData;
        if (role === 'provider') {
            roleSpecificData = ` <div class="sparkline">
                <div class="key">Fees Earned</div>
                <div class="value white">SGD${formatWithCommas(fees_earned)}</div>
            </div>`
        } else if (role === 'follower') {
            roleSpecificData = `<div class="sparkline">
            <div class="key">
            <div>
                <p class="mb-0">Total Paid</p>
                <p class="mb-0 small-font">Fees + Profit Shared</p>
                </div>
                <div class="value white">SGD${formatWithCommas(amount_paid)}</div>
            </div>
        </div>`
        }
        return `
        <div class="sparkline mr-0">
          <div class="key">Cumulative returns</div>
          <div class="d-flex justify-content-between">
            <div class="value green highlight">${cumulative_returns}<sup class="ml-1 font-weight-normal">%</sup></div>
            <div class="ml-3 mt-2 light-white">
                <p class="mb-0 font-weight-light">${role === 'follower' ? 'Strategy Age' : 'Since Inception'}</p>
                <p class="mb-0 font-weight-light">${strategy_age}</p>
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
       ${roleSpecificData}
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
      </div>`
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
})();