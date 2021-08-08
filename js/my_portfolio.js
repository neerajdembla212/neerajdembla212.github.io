(() => {
    class State {
        strategyDetails = {};
        userDetails = {};

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
    }
    const STATE = new State();
    // document ready function
    $(function () {
        callAjaxMethod({
            url: 'https://copypip.free.beeceptor.com/get-strategy-details',
            successCallback: (data) => {
                STATE.setStrategyDetails(data.data);
                renderStrategyDetails();
            }
        })
        callAjaxMethod({
            url: "https://copypip.free.beeceptor.com/user-details/provider",
            successCallback: (data) => {
                STATE.setUserDetails(data.data);
                showRoleWiseElements();
            }
        });
        const linechartCanvas = document.getElementById("line-chart");

        const data = [{
            time: "9:20",
            data: 0
        }, {
            time: "9:21",
            data: -13
        },
        {
            time: "9:22",
            data: 0
        },
        {
            time: "9:22",
            data: 16
        }, {
            time: "9:22",
            data: 20
        },
        {
            time: "9:22",
            data: 18
        }, {
            time: "9:22",
            data: 30
        },
        {
            time: "9:22",
            data: 26
        },
        {
            time: "9:22",
            data: 28
        },
        {
            time: "9:22",
            data: 40
        },
        {
            time: "9:22",
            data: 32
        },
        {
            time: "9:22",
            data: 37
        },
        {
            time: "9:22",
            data: 25
        }]
        plotLineChart(linechartCanvas, data)
    })
    // function to display role chip in sub header
    function showRoleWiseElements() {
        const user = STATE.getUserDetails()
        if (user.role === 'Strategy Provider') {
            $('.role-chip-follower').addClass('d-none');
            $('.role-chip-provider').removeClass('d-none');

            $('#stop-strategy').removeClass('d-none');
            $('#strategy').removeClass('d-none');
        }
        else if (user.role === 'Strategy Follower') {
            $('.role-chip-follower').removeClass('d-none');
            $('.role-chip-provider').addClass('d-none');

            $('#stop-strategy').addClass('d-none');
            $('#strategy').addClass('d-none');
        }
    }
    // Plot Line chart 
    function plotLineChart(lineChartCanvas, lineData) {
        if (!lineData || !Array.isArray(lineData)) {
            return;
        }
        const lineDataPoints = lineData.reduce((acc, curr) => {
            acc.push(curr.data);
            return acc;
        }, []);
        const positiveLineDataPoints = lineDataPoints.filter(d => d > 0)
        lineChartCanvas.height = 300;
        const ctx = lineChartCanvas.getContext("2d");
        var positiveGradient = ctx.createLinearGradient(
            0,
            0,
            0,
            Math.max(...positiveLineDataPoints)
        );
        const borderColor = "#22D091";
        const negativeBorderColor = "#C00000"
        // positiveGradient.addColorStop(0, "rgba(34, 208, 145, 0)");
        // positiveGradient.addColorStop(0.2, "rgba(34, 208, 145, 0.5)");


        const labels = lineData.map(d => d.time);

        const datasetNeg25 = lineData.filter(d => d.data <= 0 && d.data >= -25
        )

        const negative25LinePoints = datasetNeg25.reduce((acc, curr) => {
            acc.push(curr.data);
            return acc;
        }, []);

        const data = {
            labels: labels,
            datasets: [
                {
                    label: "",
                    backgroundColor: positiveGradient,
                    borderColor: negativeBorderColor,
                    pointBackgroundColor: negativeBorderColor,
                    pointBorderColor: negativeBorderColor,
                    gradient: positiveGradient,
                    data: negative25LinePoints,
                    cubicInterpolationMode: 'monotone',
                    tension: 0.1
                },
                {
                    label: "",
                    backgroundColor: positiveGradient,
                    borderColor: borderColor,
                    pointBackgroundColor: borderColor,
                    pointBorderColor: borderColor,
                    gradient: positiveGradient,
                    data: lineDataPoints,
                    cubicInterpolationMode: 'monotone',
                    tension: 0.1
                },
            ],
        };
        const config = {
            type: "line",
            data,
            options: {
                spanGaps: true,
                responsive: true,
                scales: {
                    xAxes: [
                        {
                            gridLines: {
                                display: false,
                                tickMarkLength: 0,
                            },
                        },
                    ],
                    yAxes: [
                        {
                            gridLines: {
                                display: true,
                                tickMarkLength: 0,
                            },
                            ticks: {
                                display: true,
                                tickMarkLength: 0,
                                maxTicksLimit: 4,
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
                        bottom: 0,
                        left: 10,
                    },
                },
            },
        };
        new Chart(ctx, config);
    }

    // render strategy details from api data
    function renderStrategyDetails() {
        const strategy = STATE.getStrategyDetails();
        const container = $('.sparkline-container');
        container.empty().append(getStrategyDetailsHTML(strategy));
    }

    function getStrategyDetailsHTML(strategy) {
        const { cumulative_returns,
            strategy_age,
            deposits,
            current_balance,
            withdrawals,
            fees_earned,
            followers,
            trades,
            max_drawdown } = strategy;
        return `
        <div class="sparkline mr-0">
          <div class="key">Cumulative returns</div>
          <div class="d-flex justify-content-between">
            <div class="value green highlight">${cumulative_returns}<sup class="ml-1 font-weight-normal">%</sup></div>
            <div class="ml-3 mt-2 light-white">Strategy Age
              ${strategy_age}</div>
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
            <div class="key">Fees Earned</div>
          <div class="value white">SGD${formatWithCommas(fees_earned)}</div>
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
      </div>`
    }
})();