(() => {
  class State {
    lineChartData = [];
    providerId;
    tradeHistory = [];
    providerDetails = {};
    paginationData = {
      rowsPerPage: 10,
      total: 0,
      page: 0
    }

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
    getPaginationData() {
      return this.paginationData
    }
    setPaginationData(data) {
      if (!data || Array.isArray(data)) {
        return
      }
      this.paginationData = data;
    }
  }
  const STATE = new State();
  const DESKTOP_MEDIA = window.matchMedia("(max-width: 1250px)")
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
    const paginationData = STATE.getPaginationData();
    callAjaxMethod({
      url: `https://copypip.free.beeceptor.com/strategy-provider-trade-history?limit=${paginationData.rowsPerPage}?page=${paginationData.page}`,
      successCallback: (data) => {
        paginationData.total = data.total;
        STATE.setPaginationData(paginationData);
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
        renderFollowProviderPopup(data.data);
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
    DESKTOP_MEDIA.addEventListener('change', function (event) {
      renderTradeHistorySection();
    })
  }

  // Plot Line chart start
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
  }
  // Plot Line chart end
  // Render trade history table start
  function renderTradeHistorySection() {
    const tradeHistory = STATE.getTradeHistory();
    const container = $('.trade-history-section');
    if (DESKTOP_MEDIA.matches) {
      // screen size is below 1250px
      container.empty().append(getTradeHistoryResponsiveHTML(tradeHistory));
    } else {
      // screen size is above 1250px
      container.empty().append(getTradeHistoryTableHTML(tradeHistory));
    }
    registerTradeHistoryTableEvents();
  }

  function getTradeHistoryTableHTML(data) {
    return `<table class="table">
        ${getTradeHistoryTableHeaders()}
        ${getTradeHistoryTableBody(data)}
        ${getTradeHistoryTableFooter(data.length)}
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
  function getTradeHistoryTableFooter(dataLength) {
    const { start, end, total } = getStartEndRecordCount(dataLength, STATE.getPaginationData());

    return `<tfoot>
        <tr>
          <td colspan="10" class="pb-0">
          <div class="d-flex justify-content-between align-items-center">
          <p class="mb-0 text-dark-gray small-font">Showing <b>${start}</b> to <b>${end}</b> of <b>${total}</b> trades</p>
          <ul class="pagination d-flex justify-content-end align-items-center m-0">
          <select class="form-control rows-per-page mr-2" name="rows-per-page" id="th-rows-per-page">
              <option value="10">10 Rows per page</option>
              <option value="20">20 Rows per page</option>
              <option value="30">30 Rows per page</option>
              <option value="40">40 Rows per page</option>
          </select>
              <button class="btn btn-default border-0" type="button" id="prev-page-th">
                  <i class="fa fa-angle-left extra-large-font font-weight-bold"></i>
              </button>
              <button class="btn btn-default border-0" type="button" id="next-page-th">
                  <i class="fa fa-angle-right extra-large-font font-weight-bold"></i>
              </button>
          </ul>
          </div>
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
            ${getTradeHistoryResponsiveFooter(data.length)}
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

  function getTradeHistoryResponsiveFooter(dataLength) {
    const { start, end, total } = getStartEndRecordCount(dataLength, STATE.getPaginationData());
    return `
        <div class="d-flex justify-content-between align-items-center p-2">
            <p class="mb-0 text-dark-gray small-font">Showing <b>${start}</b> to <b>${end}</b> of <b>${total}</b> providers</p>
            <ul class="pagination d-flex justify-content-end align-items-center m-0">
                <select class="form-control rows-per-page mr-2" name="rows-per-page" id="th-rows-per-page">
                    <option value="10">10 Rows per page</option>
                    <option value="20">20 Rows per page</option>
                    <option value="30">30 Rows per page</option>
                    <option value="40">40 Rows per page</option>
                </select>
                <button class="btn btn-default border-0" type="button" id="prev-page-th">
                    <i class="fa fa-angle-left extra-large-font font-weight-bold"></i>
                </button>
                <button class="btn btn-default border-0" type="button" id="next-page-th">
                    <i class="fa fa-angle-right extra-large-font font-weight-bold"></i>
                </button>
            </ul>
        </div>`
  }
  function registerTradeHistoryTableEvents() {
    const paginationData = STATE.getPaginationData();
    // trade history footer rows per page
    $('#th-rows-per-page').off().on('change', function () {
      const rowsPerPage = +this.value;
      if (rowsPerPage) {
        paginationData.rowsPerPage = rowsPerPage;
        STATE.setPaginationData(paginationData)
        fetchTradeHistory();
      }
    })
    $('#th-rows-per-page').val(STATE.getPaginationData().rowsPerPage)

    // fetch data with updated params on click of next pagination action
    $('#next-page-th').unbind().click(function () {
      paginationData.page++;
      fetchTradeHistory();
    })
    // fetch data with updated params on click of previous pagination action
    $('#prev-page-th').unbind().click(function () {
      if (paginationData.page > 0) {
        paginationData.page--;
        if (paginationData.page === 0) {
          $(this).attr('disabled', true);
        }
        fetchTradeHistory();
      } else {
        $(this).attr('disabled', true);
      }
    })

    // disable prev if page number is 0 or less else enable
    if (paginationData.page <= 0) {
      $('#prev-page-th').attr('disabled', true);
    } else {
      $('#prev-page-th').removeAttr('disabled');
    }

    // enable next if page number is max it can be else disable
    const totalPossiblePages = Math.floor(paginationData.total / paginationData.rowsPerPage);
    if (paginationData.page >= totalPossiblePages) {
      $('#next-page-th').attr('disabled', true);
    } else {
      $('#next-page-th').removeAttr('disabled')
    }
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
        <!-- Total returns start -->
        <div class="py-3 d-flex justify-content-between align-items-center">
            <div>
                <p class="mb-0 font-bold mall-font text-dark-black">Total returns </p>
                <p class="mb-0 small-font text-dark-black font-weight-light">since Inception 1
                    Jul 2021</p>
            </div>
            <p class="mb-0 super-large-font text-dark-green font-bold">${cumulative_returns}%</p>
        </div>
        <!-- Total returns end -->
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

})()
