(() => {
  class State {
    strategyProviders = [];
    strategyDetails = {};
    lineChartData = {};
    strategyProvidersSearchResult = [];
    strategyProviderDetails = {};

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

    getStrategyProviderDetails() {
      return this.strategyProviderDetails;
    }
    setStrategyProviderDetails(data) {
      if (!data) {
        return;
      }
      this.strategyProviderDetails = data;
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
    initDatePicker();

    // chart fileter buttons 
    $('.chart-filter .btn').click(event => {
      const target = $(event.currentTarget);
      $('.chart-filter .btn').removeClass('active');
      target.addClass('active');
      const value = target.text();
      console.log(value);
    })
  }

  function initDatePicker() {
    // datepicker init
    $('.capital-date-input').datepicker({
      todayBtn: "linked",
      keyboardNavigation: true,
      forceParse: false,
      calendarWeeks: true,
      autoclose: true
    }).off('changeDate').on('changeDate', function (e) {
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
        registerSearchStrategyProviderEvents();
      }
    });
  }

  function fetchStrategyProviderDetails(providerId, isEdit = false) {
    callAjaxMethod({
      url: `https://copypip.free.beeceptor.com/strategy-provider-details?id=${providerId}`,
      successCallback: (data) => {
        STATE.setStrategyProviderDetails(data.data);
        renderStrategyProviderModal(isEdit);
      }
    });
  }
  // fetch api methods end

  // render strategy providers start
  function renderStrategyProviders() {
    const strategyProviders = STATE.getStrategyProviders();
    const container = $('.simulation-strategy-providers');
    container.append(getStrategyProvidersTableHTML(strategyProviders));
    registerStrategyProviderTableEvents();
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
        <td class="action-tools text-center align-middle action-icon provider-modal-cta" data-id=${id} data-toggle="modal" data-target="#follow-provider-modal">
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
  function registerStrategyProviderTableEvents() {
    $('.simulation-strategy-providers .action-icon').unbind().click(function (event) {
      const providerId = $(event.currentTarget).data('id')
      fetchStrategyProviderDetails(providerId, true);
    })
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
            <div class="key tooltip-demo">Total returns <i class="fa fa-question-circle cursor-pointer ml-1" data-toggle="tooltip" data-placement="right" data-html="true" title="Since Inception </br> ${strategy_age}"></i></div>
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
  // render line chart end

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
            <li class="cursor-pointer px-2 provider-modal-cta" data-id="${id}" data-toggle="modal" data-target="#follow-provider-modal">
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

  function registerSearchStrategyProviderEvents() {
    $('.provider-modal-cta').unbind().click(event => {
      const providerId = $(event.currentTarget).data('id')
      fetchStrategyProviderDetails(providerId);
    })
  }
  // render search strategy provider end

  // render strategy provider modal start
  function renderStrategyProviderModal(isEdit) {
    const strategyProviderDetails = STATE.getStrategyProviderDetails();
    const container = $('#follow-provider-modal .modal-content');
    container.empty().append(getStrategyProviderModalHTML(strategyProviderDetails, isEdit))
    // Global function 
    readMoreLessEventHandler()
    strategyProviderModalEventHandler();
  }
  function getStrategyProviderModalHTML(strategyProviderDetails, isEdit) {
    if (!strategyProviderDetails) {
      return;
    }
    const {
      profile_image,
      username,
      name,
      country,
      cumulative_returns,
      advised_min,
      avg_lot_size,
      max_drawdown,
      strategy_age,
      profit_sharing
    } = strategyProviderDetails;

    return `
        <!-- Modal header start -->
        <div class="d-flex justify-content-between p-3">
                <h4 class="modal-title">${isEdit ? 'Edit Strategy Provider' : 'Follow a Strategy Provider'}</h4>
                <button id="close-modal" class="btn
          btn-default
          btn-outline
          btn-action
          border-0
        " data-dismiss="modal">
                  <img src="img/ic_cross.svg">
                </button>
              </div>
              <!-- Modal header end -->
        <!-- Modal body start -->
        <div class="modal-body p-3 scrollable-content">
            <div class="d-flex justify-content-between">
            <div>
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
        <div>
          <p class="mb-0 text-dark-black extra-large-font">
            S$40/m
          </p>
          <p class="mb-0 text-capitalize extra-small-font text-blue text-center">Low Risk</p>
        </div>
      </div>
      <!-- Data display Row 1 start -->
      <div class="d-flex justify-content-between mb-2">
        <div class="w-50 d-flex justify-content-between mr-3 align-items-center">
          <div class="uppercase-label">TOTAL RETURNS</div>
          <div class="text-dark-green d-flex align-items-center"><span class="up-arrow-green mr-1"></span><span
              class="font-bold">${cumulative_returns}%</span></div>
        </div>
        <div class="w-50 d-flex justify-content-between align-items-center">
          <div class="uppercase-label">advised min</div>
          <div class="text-light-gray medium-font font-bold">$${advised_min}</div>
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
      <!-- tabs start-->
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
      <!-- tabs end -->
      <!-- Tab content start -->
      <div class="tab-content py-3">
        <!-- Automatic Tab content start -->
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
        <!-- Automatic Tab content end -->
        <!-- Percentage Tab content start -->
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
        <!-- Percentage Tab content end -->
        <!-- fixed Tab content start -->
        <div role="tabpanel" id="fixed" class="tab-pane read-more-less">
        <p class="font-bold medium-font text-modal-black mb-2">Fixed Lot Size Fund Allocation
        </p>
        <p class="mb-2 text-light-red">Set a specific trade size you want to follow for this Strategy
          Provider.</p>
        <div class="d-flex align-items-center mb-2">
          <label class="col-form-label mr-3 font-bold text-dark-black">Fixed Trade Size</label>
          <input type="text" class="form-control w-25 mr-3" placeholder="0.01 - 100">
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
        <!-- fixed Tab content end -->
        <!-- Proportional tab content start -->
        <div role="tabpanel" id="proportional" class="tab-pane read-more-less">
        <p class="font-bold medium-font text-modal-black mb-2">Proportional Trade Size Fund Allocation
        </p>
        <p class="mb-2 text-light-red">Set a specific trade size you want to follow for this Strategy
          Provider.</p>
        <div class="d-flex align-items-center mb-2">
          <label class="col-form-label mr-3 font-bold text-dark-black">Ratio of Trade Size</label>
          <input type="text" class="form-control w-25 mr-3" placeholder="0.01 - 100">
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
        <!-- Proportional tab content end -->
      </div>
      <!-- Tab content end -->
      <!-- Rist management section start -->
      <section class="risk-mangement py-3">
      <p class="font-bold medium-font">Risk Management </p>
      <!-- Lot size input start -->
      <div class="d-flex justify-content-between mb-3">
        <div class="w-75 mr-3">
          <p class="text-gray medium-font mb-1">Minimum Lot Size</p>
          <div class="d-flex align-items-center">
            <input type="text" class="form-control w-50 mr-3" placeholder="0.01 - 100">
            <span class="font-bold medium-font text-dark-black">LOT</span>
          </div>
        </div>
        <div>
          <p class="text-gray medium-font mb-1">Maximum Lot Size</p>
          <div class="d-flex align-items-center">
            <input type="text" class="form-control w-50 mr-3" placeholder="0.01 - 100">
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
            <input type="text" class="form-control w-50 mr-3" placeholder="100">
            <span class="font-bold medium-font text-dark-black">Pips</span>
          </div>
        </div>
        <div>
          <p class="text-gray medium-font mb-1">Fix Stop Loss</p>
          <div class="d-flex align-items-center">
            <input type="text" class="form-control w-50 mr-3" placeholder="100">
            <span class="font-bold medium-font text-dark-black">Pips</span>
          </div>
        </div>
      </div>
      <!-- Fix profit/loss input end -->
      <div class="form-check abc-checkbox form-check-inline">
        <input class="form-check-input mr-3" type="checkbox" value="option1">
        <label class="form-check-label text-gray medium-font"> Limit Quantity of Simultaneous Trades
        </label>
      </div>
    </section>
    <div class="divider"></div>
    <!-- Rist management section end -->
    <!-- Follow duration section start -->
    <section class="py-3 mb-3">
        <p class="font-bold medium-font mb-2">Follow Duration </p>
        <div class="d-flex justofy-content-between">
            <div class="w-50">
                <p class="mb-0 text-dark-gray">Start Date</p>
                <div class="date capital-date-input">
                  <button class="btn dropdown-toggle btn-dropdown font-bold pl-0" aria-expanded="false">
                    1 Jan 2021
                  </button>
                </div>
            </div>
            <div class="w-50">
                <p class="mb-0 text-dark-gray">End Date</p>
                <div class="date capital-date-input">
                  <button class="btn dropdown-toggle btn-dropdown font-bold pl-0" aria-expanded="false">
                    1 Jan 2021
                  </button>
                </div>
            </div>
        </div>
    </section>
    <!-- Follow duration section end -->
    <div class="divider"></div>
    </div>
    <!-- Modal footer start -->
        <div class="w-100 d-flex justify-content-between p-3 align-items-center">
            <p class="simulation-text p-1 mb-0 extra-small-font font-bold">SIMULATION</p>
            <button type="button" class="btn btn-primary" id="follow-provider">Follow Provider</button>
        </div>
    <!-- Modal footer end -->
        `
  }
  function strategyProviderModalEventHandler() {
    initDatePicker();
    $('')
  }
  // render strategy provider modal end

})();