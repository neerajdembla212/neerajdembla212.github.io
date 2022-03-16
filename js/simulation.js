(() => {
  class State {
    strategyProviders = [];
    strategyDetails = {};
    lineChartData = {};
    strategyProvidersSearchResult = [];
    strategyProviderDetails = {};
    sortData = {
      sortKey: '',
      direction: '' // asc or desc
    }
    isCalculateFormValid = {
      amount: false
    }
    paginationData = {
      rowsPerPage: 10,
      total: 0,
      page: 0
    }
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
    getSortData() {
      return this.sortData
    }
    setSortData(data) {
      if (!data) {
        return
      }
      this.sortData = data;
    }

    setIsCalculateFormValid(control, data) {
      if (typeof data !== 'boolean') {
        return
      }
      this.isCalculateFormValid[control] = data;
    }
    getIsCalculateFormValid() {
      return this.isCalculateFormValid.amount
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
  }
  const STATE = new State();
  const MOBILE_MEDIA = window.matchMedia("(max-width: 480px)")
  const TABLET_MEDIA = window.matchMedia("(max-width: 768px)")
  // Document ready
  $(function () {
    registerGlobalEvents();
    // fetch and render add strategy provider dropdown 
    fetchStrategyProvidersSearch();
    plotEmptyLineChart();
    // global function
    initI18nPlugin();
    i18n.setLng(localStorage.getItem('selectedLanguage'), function () {
      $('#wrapper').i18n();
      window.reloadElementsOnLanguageChange();
    })
    // // render empty state sparkline
    // renderSparkline();
  });

  function plotEmptyLineChart() {
    STATE.setLineChartData([{
      "time": "9:20",
      "data": 0
    }, {
      "time": "9:21",
      "data": 0
    },
    {
      "time": "9:22",
      "data": 0
    },
    {
      "time": "9:23",
      "data": 0
    }, {
      "time": "9:24",
      "data": 0
    },
    {
      "time": "9:25",
      "data": 0
    }, {
      "time": "9:26",
      "data": 0
    },
    {
      "time": "9:27",
      "data": 0
    },
    {
      "time": "9:28",
      "data": 0
    },
    {
      "time": "9:29",
      "data": 0
    },
    {
      "time": "9:30",
      "data": 0
    },
    {
      "time": "9:31",
      "data": 0
    },
    {
      "time": "9:32",
      "data": 0
    },
    {
      "time": "9:33",
      "data": 0
    },
    {
      "time": "9:34",
      "data": 0
    },
    {
      "time": "9:35",
      "data": 0
    },
    {
      "time": "9:36",
      "data": 0
    },
    {
      "time": "9:37",
      "data": 0
    },
    {
      "time": "9:38",
      "data": 0
    },
    {
      "time": "9:39",
      "data": 0
    },
    {
      "time": "9:40",
      "data": 0
    },
    {
      "time": "9:41",
      "data": 0
    },
    {
      "time": "9:42",
      "data": 0
    },
    {
      "time": "9:43",
      "data": 0
    },
    {
      "time": "9:44",
      "data": 0
    },
    {
      "time": "9:45",
      "data": 0
    },
    {
      "time": "9:46",
      "data": 0
    },
    {
      "time": "9:47",
      "data": 0
    },
    {
      "time": "9:47",
      "data": 0
    },
    {
      "time": "9:48",
      "data": 0
    },
    {
      "time": "9:49",
      "data": 0
    },
    {
      "time": "9:50",
      "data": 0
    },
    {
      "time": "9:51",
      "data": 0
    },
    {
      "time": "9:52",
      "data": 0
    },
    {
      "time": "9:53",
      "data": 0
    },
    {
      "time": "9:54",
      "data": 0
    },
    {
      "time": "9:55",
      "data": 0
    },
    {
      "time": "9:56",
      "data": 0
    },
    {
      "time": "9:57",
      "data": 0
    },
    {
      "time": "9:58",
      "data": 0
    },
    {
      "time": "9:59",
      "data": 0
    },
    {
      "time": "10:00",
      "data": 0
    }]);
    plotLineChart();
  }

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

    // validate input
    validateTextInput($('.calculate-card .input-amount'), function (val) {
      let isValid = false;
      if (isNaN(val)) {
        isValid = false;
      } else if (val === '') {
        isValid = false;
      } else {
        const numVal = Number(val);
        if (numVal > 0) {
          isValid = true;
        }
      }
      STATE.setIsCalculateFormValid('amount', isValid);
      return isValid;
    })
    const calculateCard = $('.calculate-card');
    calculateCard.find('.input-amount').on('blur', function () {
      if (STATE.getIsCalculateFormValid()) {
        calculateCard.find('#calculate-cta').attr('disabled', false);
      } else {
        calculateCard.find('#calculate-cta').attr('disabled', true);
      }
    })

    calculateCard.find('#calculate-cta').off().on('click', function () {
      calculateCard.find('.input-amount').blur();
      if (!STATE.getIsCalculateFormValid()) {
        return
      }
      // fetch and render strategy details
      fetchStrategyDetails();
      // fetch and plot trendline chart
      fetchLineData();
    })

    MOBILE_MEDIA.addEventListener('change', function () {
      renderSparkline();
    })

    TABLET_MEDIA.addEventListener('change', function () {
      renderStrategyProviders();
    })

    // this function will be called by language switcher event from insipnia_custom.js file when language has been set successfully
    // each page has to add respective function on window to reload the translations on their page
    window.reloadElementsOnLanguageChange = function () {
      renderSparkline();
      $('.calculate-card .input-amount').attr("placeholder", i18n.t('body.simulation.inputAmount'));
      $('#providers-search').attr("placeholder", i18n.t('body.simulation.searchProviders'));
      // activate dynamic Tooltips 
      activateTooltips();
    }
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

  function fetchStrategyProviderDetails(providerId) {
    callAjaxMethod({
      url: `https://copypip.free.beeceptor.com/strategy-provider-details?id=${providerId}`,
      successCallback: (data) => {
        STATE.setStrategyProviderDetails(data.data);
        renderStrategyProviderModal();
      }
    });
  }
  // fetch api methods end

  // render strategy providers start
  function renderStrategyProviders() {
    const strategyProviders = STATE.getStrategyProviders();
    const container = $('.strategy-providers-table-content');
    if (TABLET_MEDIA.matches) {
      // screen size less than 768px
      container.empty().append(getStrategyProvidersResponsiveHTML(strategyProviders))
    } else {
      // screen size greater than 768px
      container.empty().append(getStrategyProvidersTableHTML(strategyProviders));
    }
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

    const selectedSort = STATE.getSortData()
    const { sortKey, direction } = selectedSort;
    let arrowClass = '';
    if (direction === 'asc') {
      arrowClass = 'up-arrow-sort';
    } else if (direction === 'desc') {
      arrowClass = 'down-arrow-sort mt-1';
    }
    console.log(sortKey !== 'total_profit_loss');
    return `
        <thead>
            <tr>
            <th class="align-middle extra-small-font pr-0">${i18n.t('body.mp.provider')}</th>
            <th class="text-center align-middle extra-small-font pr-0">${i18n.t('body.simulation.joinedDuration')}</th>
            <th class="text-center align-middle extra-small-font pr-0">
              <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="total_profit_loss">
                <p class="m-0 p-0">${i18n.t('body.mp.equityGrowth')}<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'total_profit_loss' ? 'd-none' : ''}"></i></p>
              </div>
            </th>
            <th class="text-center align-middle extra-small-font pr-0">
              <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="trades">
                <p class="m-0 p-0">${i18n.t('body.mp.trades')}<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'trades' ? 'd-none' : ''}"></i></p>
              </div>
            </th>
            <th class="text-center align-middle extra-small-font pr-0">
              <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="subscription_fee">
                <p class="m-0 p-0">${i18n.t('body.mp.managementFees')}<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'subscription_fee' ? 'd-none' : ''}"></i></p>
              </div>
            </th>
            <th class="text-center align-middle extra-small-font pr-0">
              <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="profit_share">
                <p class="m-0 p-0">${i18n.t('body.mp.pShare%')}<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'profit_share' ? 'd-none' : ''}"></i></p>
              </div>
            </th>
            <th class="text-center align-middle extra-small-font pr-0">
              <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="total_fee">
                <p class="m-0 p-0">${i18n.t('body.mp.totalFees')}<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'total_fee' ? 'd-none' : ''}"></i></p>
              </div>
            </th>
            <th class="text-center align-middle extra-small-font">${i18n.t('body.mp.actions')}</th>
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
        <td>
            <div class="d-flex">
            <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${profile_image}" />
            <div class="ml-2 float-left">
                <p class="font-bold font-size-12 mb-0">
                ${username}
                </p>
                <div class="d-flex">
                    <p class="text-light-black font-size-12 mb-0">
                        ${name}
                        <img class="ml-1" src="${getCountryFlags(country)}" />
                    </p>
                </div>
            </div>
          </div>
        </td>
        <td class="small-font">
            ${formatDate(new Date(joined_start_date))} - ${formatDate(new Date(joined_end_date))}
        </td>
        <td class="font-bold font-size-16 text-center align-middle">
            $${formatWithCommas(total_profit_loss)}
        </td>
        <td class="text-center align-middle">
            ${formatWithCommas(trades)}
        </td>
        <td class="text-center font-bold align-middle">
            S$${formatWithCommas(subscription_fee)}
        </td>
        <td class="text-center align-middle">
            ${profit_share}
        </td>
        <td class="text-center font-bold align-middle">
            S$${formatWithCommas(total_fee)}
        </td>
        <td class="action-tools text-center align-middle action-icon provider-modal-cta" data-id=${id} data-toggle="modal" data-target="#add-provider-modal">
            <i class="fa fa-gear mr-1"></i>
        </td>
      </tr>`
  }

  function getStrategyProvidersTableFooter() {
    return `<tfoot>
        <tr>
          <td colspan="9">
            <ul class="pagination w-100 d-flex justify-content-end align-items-center m-0">
              <select class="form-control rows-per-page mr-2" name="rows-per-page">
                <option>${i18n.t('body.mp.10RowsPerPage')}</option>
                <option>${i18n.t('body.mp.20RowsPerPage')}</option>
                <option>${i18n.t('body.mp.30RowsPerPage')}</option>
                <option>${i18n.t('body.mp.40RowsPerPage')}</option>
              </select>
              <i class="fa fa-angle-left mx-2"></i>
              <i class="fa fa-angle-right mx-2"></i>
            </ul>
          </td>
        </tr>
      </tfoot>`
  }

  function getStrategyProvidersResponsiveHTML(strategyProviders) {
    const rowsHTML = [];
    strategyProviders.forEach(user => {
      rowsHTML.push(getStrategyProviderResponsiveRow(user))
    })
    return `<div class="responsive-providers">
        ${rowsHTML.join('')}
        ${getStrategyProviderResponsiveFooter(strategyProviders.length)}
    </div>`
  }

  function getStrategyProviderResponsiveRow(user) {
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

    return `<div class="p-3 sp-details-cta cursor-pointer" data-id="${id}">
    <div class="d-flex justify-content-between align-items-center">
        <div>
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
        </div>
        <div class="d-flex align-items-center">
            <div name="actions">
                <i class="fa fa-gear mr-2 action-tools large-font cursor-pointer extra-large-font provider-modal-cta" name="actions" data-id=${id} data-toggle="modal" data-target="#add-provider-modal"></i>
            </div>
        </div>
    </div>
    <div class="d-flex justify-content-between mt-2">
        <div class="mr-3">
            <p class="mb-0 responsive-label">EQ growth</p>
            <p class="mb-0 font-bold responsive-value">$${formatWithCommas(total_profit_loss)}</p>
        </div>
        <div class="mr-3">
            <p class="mb-0 responsive-label">${i18n.t('body.simulation.joinedDuration')}</p>
            <p class="mb-0 font-bold responsive-value">${formatDate(new Date(joined_start_date))} - ${formatDate(new Date(joined_end_date))}</p>
        </div>
        <div class="mr-3">
            <p class="mb-0 responsive-label">${i18n.t('body.mp.trades')}</p>
            <p class="mb-0 font-bold responsive-value">${formatWithCommas(trades)}</p>
        </div>
        <div class="mr-3">
            <p class="mb-0 responsive-label">M Fees</p>
            <p class="mb-0 font-bold responsive-value">S$${formatWithCommas(subscription_fee)}</p>
        </div>
        <div class="mr-3">
            <p class="mb-0 responsive-label">${i18n.t('body.mp.pShare%')}</p>
            <p class="mb-0 font-bold responsive-value">${profit_share}</p>
        </div>
        <div class="mr-3">
            <p class="mb-0 responsive-label">${i18n.t('body.mp.totalFees')}</p>
            <p class="mb-0 font-bold responsive-value">S$${formatWithCommas(total_fee)}</p>
        </div>
    </div>
</div>`
  }

  function getStrategyProviderResponsiveFooter(dataLength) {
    const { start, end, total } = getStartEndRecordCount(dataLength, STATE.getPaginationData());
    return `
    <div class="d-flex justify-content-between align-items-center p-2">
            <p class="mb-0 text-dark-gray small-font">Showing <b>${start}</b> to <b>${end}</b> of <b>${total}</b> providers</p>
            <ul class="pagination d-flex justify-content-end align-items-center m-0">
                <select class="form-control rows-per-page mr-2" name="rows-per-page">
                    <option value="10">10 Rows per page</option>
                    <option value="20">20 Rows per page</option>
                    <option value="30">30 Rows per page</option>
                    <option value="40">40 Rows per page</option>
                </select>
                <button class="btn btn-default border-0" type="button">
                    <i class="fa fa-angle-left extra-large-font font-weight-bold"></i>
                </button>
                <button class="btn btn-default border-0" type="button">
                    <i class="fa fa-angle-right extra-large-font font-weight-bold"></i>
                </button>
            </ul>
        </div>
    `
  }

  function registerStrategyProviderTableEvents() {
    $('.strategy-providers-table-content .action-icon').unbind().click(function (event) {
      const providerId = $(event.currentTarget).data('id')
      fetchStrategyProviderDetails(providerId);
    })
    // table sort events
    tableSortEvents($('.strategy-providers-table-content'), onProvidersTableSort);
  }
  function onProvidersTableSort(key, direction) {
    const strategyProviders = STATE.getStrategyProviders();
    if (!strategyProviders.length) {
      return
    }
    if (!strategyProviders[0].hasOwnProperty(key)) {
      return
    }
    tableSort(strategyProviders, key, direction);
    renderStrategyProviders();
  }

  function tableSort(data, key, direction) {
    data.sort((a, b) => {
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
  }
  // render strategy providers end

  // render sparkline start
  function renderSparkline() {
    const strategy = STATE.getStrategyDetails();
    const container = $('.sparkline-container');
    if (MOBILE_MEDIA.matches) {
      // screen size below 480px
      container.empty().append(getSparklineResponsiveHTML(strategy));
    } else {
      // screen size is above 480px
      container.empty().append(getSparklineHTML(strategy));
    }
  }

  function getSparklineHTML(strategy) {
    const { cumulative_returns = 0,
      strategy_age,
      deposits = 0,
      current_balance = 0,
      withdrawals = 0,
      followers = 0,
      trades = 0,
      max_drawdown = 0,
      amount_paid = 0 } = strategy;

    const isEmpty = Object.keys(strategy).length > 0 ? false : true;

    return `
        <div class="d-flex flex-wrap justify-content-between desktop-content">
            <div class="sparkline mr-0">
              <div class="key tooltip-demo">${i18n.t('body.simulation.cumulativeReturns')} <i class="fa fa-question-circle cursor-pointer ml-1" data-toggle="tooltip" data-placement="right" data-html="true" title="${i18n.t('body.mp.sinceInception')} </br> ${strategy_age}"></i></div>
                <div class="d-flex justify-content-between">
                <div class="value ${isEmpty ? 'text-light-gray' : 'green'} highlight">${cumulative_returns}<sup class="ml-1 font-weight-normal">%</sup></div>
                <div class="ml-3 mt-2 light-white">
                    <p class="mb-0 font-weight-light"></p>
                </div>
              </div>
            </div>
            <div class="divider mx-2"></div>
            <div class="sparkline">
              <div class="key">${i18n.t('body.mp.currentBalance')}</div>
              <div class="value ${isEmpty ? 'text-light-gray' : 'white'}">SGD ${formatWithCommas(current_balance)}</div>
            </div>
            <div class="sparkline">
              <div class="key">${i18n.t('body.simulation.return/Mth')}</div>
              <div class="value ${isEmpty ? 'text-light-gray' : 'white'}">SGD ${formatWithCommas(deposits)}</div>
            </div>
            <div class="sparkline">
              <div class="key">${i18n.t('body.simulation.averagePips')}</div>
              <div class="value ${isEmpty ? 'text-light-gray' : 'white'}">SGD ${formatWithCommas(withdrawals)}</div>
            </div>
            <div class="sparkline">
            <div class="key">
                <p class="mb-0">${i18n.t('body.simulation.totalPaid')} <i class="fa fa-question-circle cursor-pointer ml-1" data-toggle="tooltip" data-placement="right" data-html="true" title="${i18n.t('body.mp.feesProfitShared')}"></i></p>
            </div>
            <div class="value ${isEmpty ? 'text-light-gray' : 'white'}">SGD ${formatWithCommas(amount_paid)}</div>
            </div>
            <div class="sparkline">
              <div class="key">${i18n.t('body.mp.trades')}</div>
              <div class="value ${isEmpty ? 'text-light-gray' : 'green'}">${formatWithCommas(trades)}</div>
            </div>
            <div class="sparkline">
              <div class="key">${i18n.t('body.mp.maxDrawdown')}</div>
              <div class="value ${isEmpty ? 'text-light-gray' : 'dark-red'}">${max_drawdown}</div>
          </div>
      </div>`
  }

  function getSparklineResponsiveHTML(strategy) {
    console.log('strategy ', strategy)
    const { cumulative_returns = 0,
      strategy_age = 0,
      deposits = 0,
      current_balance = 0,
      withdrawals = 0,
      followers = 0,
      trades = 0,
      max_drawdown = 0,
      amount_paid = 0 } = strategy;

    const isEmpty = Object.keys(strategy).length > 0 ? false : true;

    return `
      <div class="responsive-content">
        <div class="d-flex justify-content-between align-items-center p-3">
          <div class="key">
            <p class="mb-0">${i18n.t('body.simulation.cumulativeReturns')} <i class="fa fa-question-circle cursor-pointer ml-1" data-toggle="tooltip" data-placement="right" data-html="true" title="${i18n.t('body.mp.strategyAge')} </br> ${strategy_age}"></i></p>
          </div>
          <div class="value ${isEmpty ? 'text-light-gray' : 'green'} highlight">${cumulative_returns}<sup class="ml-1 font-weight-normal">%</sup></div>
        </div>
        <div class="horizontal-divider mx-2"></div>
        <div class="d-flex justify-content-between align-items-center p-3">
            <div class="key">${i18n.t('body.mp.balance')}</div>
            <div class="value ${isEmpty ? 'text-light-gray' : 'white'}">SGD${formatWithCommas(current_balance)}</div>
        </div>
        <div class="horizontal-divider mx-2"></div>
        <div class="d-flex justify-content-between align-items-center p-3">
            <div class="key">${i18n.t('body.simulation.return/Mth')}</div>
            <div class="value ${isEmpty ? 'text-light-gray' : 'white'}">SGD${formatWithCommas(deposits)}</div>
        </div>
        <div class="horizontal-divider mx-2"></div>
        <div class="d-flex justify-content-between align-items-center p-3">
            <div class="key">${i18n.t('body.simulation.averagePips')}</div>
            <div class="value ${isEmpty ? 'text-light-gray' : 'white'}">SGD${formatWithCommas(withdrawals)}</div>
        </div>
        <div class="horizontal-divider mx-2"></div>
        <div class="d-flex justify-content-between align-items-center p-3">
            <div class="key">
                <p class="mb-0">${i18n.t('body.simulation.totalPaid')}</p>
                <p class="mb-0 small-font font-weight-light">${i18n.t('body.mp.feesProfitShared')}</p>
            </div>
            <div class="value ${isEmpty ? 'text-light-gray' : 'white'}">SGD${formatWithCommas(amount_paid)}</div>
        </div>
        <div class="horizontal-divider mx-2"></div>
        <div class="row px-3">
            <div class="p-3 col d-flex justify-content-between border-right">
                <div class="key">${i18n.t('body.mp.trades')}</div>
                <div class="value ${isEmpty ? 'text-light-gray' : 'green'}">${formatWithCommas(trades)}</div>
            </div>
            <div class="p-3 col d-flex justify-content-between">
                <div class="key">${i18n.t('body.mp.maxDrawdown')}</div>
                <div class="value ${isEmpty ? 'text-light-gray' : 'dark-red'}">${max_drawdown}</div>
            </div>
        </div>
      </div>
      `
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
            <li class="cursor-pointer px-2 provider-modal-cta" data-id="${id}" data-toggle="modal" data-target="#add-provider-modal">
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
  function renderStrategyProviderModal() {
    const strategyProviderDetails = STATE.getStrategyProviderDetails();
    const bodyContainer = $('#add-provider-modal .modal-content .modal-body');
    // global function to get follow provider modal body
    bodyContainer.empty().append(getFollowProviderPopupBody(strategyProviderDetails))
    // adding simulation specific content to modal body
    bodyContainer.append(getStrategyProviderSimulationModalHTML())

    strategyProviderModalEventHandler();
  }
  function getStrategyProviderSimulationModalHTML() {
    return `
    <!-- Follow duration section start -->
    <div class="divider"></div>
    <section class="py-3">
        <p class="font-bold medium-font mb-2">Follow Duration </p>
        <div class="d-flex justify-content-between">
            <div class="w-50">
                <p class="mb-0 text-dark-gray">${i18n.t('body.simulation.startDate')}</p>
                <div class="date capital-date-input">
                  <button class="btn dropdown-toggle btn-dropdown font-bold pl-0" aria-expanded="false">
                    1 Jan 2021
                  </button>
                </div>
            </div>
            <div class="w-50">
                <p class="mb-0 text-dark-gray">${i18n.t('body.simulation.endDate')}</p>
                <div class="date capital-date-input">
                  <button class="btn dropdown-toggle btn-dropdown font-bold pl-0" aria-expanded="false">
                    1 Jan 2021
                  </button>
                </div>
            </div>
        </div>
    </section>
    <!-- Follow duration section end -->`
  }

  function strategyProviderModalEventHandler() {
    initDatePicker();
    // add provider CTA in footer
    $('#add-provider-modal #add-provider').unbind().click(function () {
      // fetch and render provider table content
      fetchStrategyProviders();
      $('#add-provider-modal').modal('hide');
    })
    // Global function 
    readMoreLessEventHandler()
    // show hide fields based on limit quantity checkbox
    $('#limit-quantity-checkbox').unbind().click(function () {
      const quantityInput = $('#limit-quantity-input');
      if ($(this).is(':checked')) {
        // show limit quantity input section
        quantityInput.removeClass('d-none');
      } else {
        // hide limit quantity input section
        quantityInput.addClass('d-none');
      }
    })

    // activate tooltips
    activateTooltips();
    validateFollowProviderPopupInputs($('#add-provider-modal')); // global function 
  }
  // render strategy provider modal end

})();