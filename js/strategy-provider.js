(function () {
  class State {
    topGrowth = [];
    featuredProviders = [];
    followingUsers = [];
    favouriteUsers = [];
    strategyProviderDetails = {};
    lowGrowthUsers = [];
    midGrowthUsers = [];
    highGrowthUsers = [];
    paginationData = {
      rowsPerPage: 10,
      total: 0,
      page: 0
    }

    getState() {
      return {
        topGrowth: this.topGrowth,
        featuredProviders: this.featuredProviders,
        followingUsers: this.followingUsers,
        favouriteUsers: this.favouriteUsers,
        strategyProviderDetails: this.strategyProviderDetails,
        paginationData: this.paginationData,
        lowGrowthUsers: this.lowGrowthUsers,
        midGrowthUsers: this.midGrowthUsers,
        highGrowthUsers: this.highGrowthUsers
      }
    }

    setTopGrowth(data) {
      if (!data || !Array.isArray(data)) {
        return
      }
      this.topGrowth = data;
    }

    setFeaturedProviders(data) {
      if (!data || !Array.isArray(data)) {
        return
      }
      this.featuredProviders = data;
    }

    setFollowingUsers(data) {
      if (!data || !Array.isArray(data)) {
        return
      }
      this.followingUsers = data;
    }

    setFavouriteUsers(data) {
      if (!data || !Array.isArray(data)) {
        return
      }
      this.favouriteUsers = data;
    }

    setStrategyProviderDetails(data) {
      if (!data) {
        return
      }
      this.strategyProviderDetails = data;
    }

    setPaginationData(data) {
      if (!data) {
        return
      }
      this.paginationData = data;
    }

    setLowGrowthUsers(data) {
      if (!data || !Array.isArray(data)) {
        return
      }
      this.lowGrowthUsers = data;
    }

    setMidGrowthUsers(data) {
      if (!data || !Array.isArray(data)) {
        return
      }
      this.midGrowthUsers = data;
    }

    setHighGrowthUsers(data) {
      if (!data || !Array.isArray(data)) {
        return
      }
      this.highGrowthUsers = data;
    }
  }

  // creating state object which will contain application data fetched from api in memory for SP page only.
  // every page will have a similar structure to store data for their view. 
  // NOTE : This state structure ensures whenever data changes by any function / api they call methods of state data fist to update data and then update UI
  // however this structure doesn't support data sharing between two pages, for that we have to rely upon api or local storage
  const STATE = new State();
  // Global variables for this file
  const DESKTOP_MEDIA = window.matchMedia("(max-width: 1024px)")

  $(function () {
    registerGlobalEvents();
    const activeId = getActiveTab().attr('href');
    onTabChange(activeId);
  });

  // fetch apis start
  function fetchTopGrowthProviders(activeTabId, noLoadingState = false) {
    callAjaxMethod({
      url: "https://copypip.free.beeceptor.com/users/top-growth",
      successCallback: (data) => {
        const paginationData = STATE.getState().paginationData;
        paginationData.total = data.total;
        STATE.setPaginationData(paginationData);

        STATE.setTopGrowth(data.data);
        const viewType = getCurrentViewType();
        switch (viewType) {
          case 'grid': plotGridView(); break;
          case 'list': plotListView(); break;
        }
      },
      beforeSend: noLoadingState ? null : plotGridLoadingState.bind(null, activeTabId)
    });
  }

  function fetchFeaturedProviders(activeTabId) {
    callAjaxMethod({
      url: "https://copypip.free.beeceptor.com/users/featured-providers",
      successCallback: (data) => {
        STATE.setFeaturedProviders(data.data);
        const viewType = getCurrentViewType();
        switch (viewType) {
          case 'grid': plotGridView(); break;
          case 'list': plotListView(); break;
        }
      },
      beforeSend: plotGridLoadingState.bind(null, activeTabId)
    });
  }

  function fetchFollowingUsers(activeTabId) {
    callAjaxMethod({
      url: "https://copypip.free.beeceptor.com/users/following",
      successCallback: (data) => {
        const paginationData = STATE.getState().paginationData;
        paginationData.total = data.total;
        STATE.setPaginationData(paginationData);

        STATE.setFollowingUsers(data.data);
        const viewType = getCurrentViewType();
        switch (viewType) {
          case 'grid': plotGridView(); break;
          case 'list': plotListView(); break;
        }
      },
      beforeSend: plotGridLoadingState.bind(null, activeTabId)
    });
  }

  function fetchFavouriteUsers(activeTabId) {
    callAjaxMethod({
      url: "https://copypip.free.beeceptor.com/users/favourites",
      successCallback: (data) => {
        const paginationData = STATE.getState().paginationData;
        paginationData.total = data.total;
        STATE.setPaginationData(paginationData);
        STATE.setFavouriteUsers(data.data);
        const viewType = getCurrentViewType();
        switch (viewType) {
          case 'grid': plotGridView(); break;
          case 'list': plotListView(); break;
        }
      },
      beforeSend: plotGridLoadingState.bind(null, activeTabId)
    });
  }

  function fetchStrategyProviderDetails(id) {
    callAjaxMethod({
      url: `https://copypip.free.beeceptor.com/strategy-provider-details?id=${id}`,
      successCallback: (data) => {
        STATE.setStrategyProviderDetails(data.data);
        renderFollowProviderPopup(data.data);
      }
    });
  }

  function fetchLowGrowthUsers(activeTabId) {
    callAjaxMethod({
      url: `https://copypip.free.beeceptor.com/users/low-growth`,
      successCallback: (data) => {
        const paginationData = STATE.getState().paginationData;
        paginationData.total = data.total;
        STATE.setPaginationData(paginationData);
        STATE.setLowGrowthUsers(data.data);
        const viewType = getCurrentViewType();
        switch (viewType) {
          case 'grid': plotGridView(); break;
          case 'list': plotListView(); break;
        }
      },
      beforeSend: plotGridLoadingState.bind(null, activeTabId)
    });
  }

  function fetchMidGrowthUsers(activeTabId) {
    callAjaxMethod({
      url: `https://copypip.free.beeceptor.com/users/mid-growth`,
      successCallback: (data) => {
        const paginationData = STATE.getState().paginationData;
        paginationData.total = data.total;
        STATE.setPaginationData(paginationData);
        STATE.setMidGrowthUsers(data.data);
        const viewType = getCurrentViewType();
        switch (viewType) {
          case 'grid': plotGridView(); break;
          case 'list': plotListView(); break;
        }
      },
      beforeSend: plotGridLoadingState.bind(null, activeTabId)
    });
  }

  function fetchHighGrowthUsers(activeTabId) {
    callAjaxMethod({
      url: `https://copypip.free.beeceptor.com/users/high-growth`,
      successCallback: (data) => {
        const paginationData = STATE.getState().paginationData;
        paginationData.total = data.total;
        STATE.setPaginationData(paginationData);
        STATE.setHighGrowthUsers(data.data);
        const viewType = getCurrentViewType();
        switch (viewType) {
          case 'grid': plotGridView(); break;
          case 'list': plotListView(); break;
        }
      },
      beforeSend: plotGridLoadingState.bind(null, activeTabId)
    });
  }
  // fetch apis end

  // Plot single Line chart (trendline) start
  function plotLineChart(lineChartCanvas, lineData, viewType) {
    if (!lineData || !Array.isArray(lineData)) {
      return;
    }
    const lineDataPoints = lineData.reduce((acc, curr) => {
      acc.push(curr.data);
      return acc;
    }, []);

    lineChartCanvas.height = 40;
    const ctx = lineChartCanvas.getContext("2d");
    var gradient = ctx.createLinearGradient(
      0,
      0,
      0,
      Math.max(...lineDataPoints)
    );
    const borderColor = "#501EC6";
    gradient.addColorStop(0, "#AABCE9");
    gradient.addColorStop(0.5, "#C8D4F4");
    gradient.addColorStop(1, "#E3EAFC");

    const labels = ["", "", "", "", "", "", "", "", ""];
    const data = {
      labels: labels,
      datasets: [
        {
          label: "",
          backgroundColor: gradient,
          borderColor: borderColor,
          pointBackgroundColor: gradient,
          pointBorderColor: gradient,
          gradient: gradient,
          data: lineDataPoints,
        },
      ],
    };
    const config = {
      type: "line",
      data,
      options: {
        spanGaps: true,
        responsive: true,
        maintainAspectRatio: false,
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
                display: false,
              },
              ticks: {
                display: false,
                tickMarkLength: 0,
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
            borderWidth: 1,
          },
        },
        layout: {
          padding: {
            bottom: -10,
            left: -10,
          },
        },
      },
    };

    new Chart(ctx, config);
  }
  // Plot single Line chart (trendline) end

  // plot all line charts in grid view start
  function plotGridLineCharts(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    data.forEach((user) => {
      const canvas = document.querySelector(
        `#contact-box-${user.id} .lineChart`
      );
      if (canvas) {
        plotLineChart(canvas, user.trendline);
      }
    });
  }
  // plot all line charts in grid view end

  function plotListLineCharts(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }

    data.forEach((user) => {
      const canvas = document.querySelector(
        `#table-user-${user.id} .line-chart`
      );

      if (canvas) {
        plotLineChart(canvas, user.trendline, 'line');
      }
    });
  }

  // render top growth card start
  function plotTopGrowthCard(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#top-growth .panel-body");
    const containerHTML = [];
    data.forEach((provider) => {
      const providerCard = getUserCardHTML(provider);
      containerHTML.push(providerCard);
    });
    container.empty().append(containerHTML);
    addProxyCard(container, data.length);
  }

  function getUserCardHTML(provider) {
    if (!provider) {
      return "";
    }
    const {
      id,
      profile_image,
      username,
      name,
      return_percentage,
      follower_count,
      drawDown,
      return_duration,
      risk_amount,
      favourite
    } = provider;

    return `<div class="contact-box d-flex flex-column col" id="contact-box-${id}" data-id="${id}">
    <div class="d-flex justify-content-between">
      <div class="d-flex">
        <img
          alt="image"
          class="rounded-circle img-fluid img-sm"
          src="${profile_image}"
        />
        <div class="d-flex flex-column ml-3">
          <span class="font-bold">${username}</span>
          <span class="text-light-black">${name}</span>
        </div>
      </div>
      <span class="fa favourite-icon cursor-pointer ${favourite === 'true' ? 'fa-bookmark active' : 'fa-bookmark-o'}" name="favourites-cta"></span>
    </div>
    <div class="d-flex justify-content-between">
      <div class=" align-self-center m-0 font-bold d-flex flex-column">
        <p class="return-percentage h4 align-self-center m-0 font-bold">${return_percentage}%</p>
        <p class="text-uppercase text-light-gray small-font">${return_duration}</p>
      </div>
      <div class=" align-self-center m-0 d-flex flex-column">
        <p class="risk_amount h4 align-self-center text-light-gray m-0">$${risk_amount}</p>
        <p class="text-capitalize small-font text-blue text-center">low risk</p>
      </div>
    </div>
    <div class="line-chart-container">
      <canvas class="lineChart" class="mt-2"></canvas>
    </div>
    <button class="btn btn-primary btn-block2" data-toggle="modal" data-target="#follow-provider-modal" name="follow-provider-cta" data-id="${id}">
      Follow Provider
    </button>
    <!-- area chart here-->
    <div class="d-flex mt-2 justify-content-between">
      <span class="text-light-gray"><span class="format-us">${formatWithCommas(follower_count)}</span> Followers</span>
      <span class="font-bold">
        Drawdown <span class="${drawDown > 0 ? 'text-green' : 'text-danger'}">${drawDown}%</span>
      </span>
    </div>
  </div>`;
  }
  // render top growth card end

  // render top growth table start
  function plotTopGrowthTable(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#top-growth .panel-body");

    if (DESKTOP_MEDIA.matches) {
      container.empty().append(`<div class="ibox-content table-responsive p-0">
      ${getUserTableResponsiveHTML(data)}
      </div>`)
    } else {
      container.empty().append(`<div class="ibox-content table-responsive p-0">
      ${getUserTableHTML(data)}
      </div>`)
    }


  }
  // render top growth table end

  function plotListView() {
    const activeId = getActiveTab().attr('href');
    $('.strategy-provider-section .tabs-header').css({
      borderRadius: '6px 6px 0 0'
    });

    switch (activeId) {
      case '#top-growth':
        const topGrowth = STATE.getState().topGrowth;
        plotTopGrowthTable(topGrowth);
        plotListLineCharts(topGrowth);
        registerListViewEvents();
        break;

      case '#following':
        const followingUsers = STATE.getState().followingUsers;
        plotFollowingUsersTable(followingUsers);
        plotListLineCharts(followingUsers);
        registerListViewEvents();
        break;

      case '#favourites':
        const favouriteUsers = STATE.getState().favouriteUsers;
        plotFavouriteUsersTable(favouriteUsers);
        plotListLineCharts(favouriteUsers);
        registerListViewEvents();
        break;

      case '#low-growth':
        const lowGrowthUsers = STATE.getState().lowGrowthUsers;
        plotLowGrowthUsersTable(lowGrowthUsers);
        plotListLineCharts(lowGrowthUsers);
        registerListViewEvents();
        break;

      case '#mid-growth':
        const midGrowthUsers = STATE.getState().midGrowthUsers;
        plotMidGrowthUsersTable(midGrowthUsers);
        plotListLineCharts(midGrowthUsers);
        registerListViewEvents();
        break;

      case '#high-growth':
        const highGrowthUsers = STATE.getState().highGrowthUsers;
        plotHighGrowthUsersTable(highGrowthUsers);
        plotListLineCharts(highGrowthUsers);
        registerListViewEvents();
        break;
    }
  }

  function plotGridView() {
    const activeId = getActiveTab().attr('href');
    switch (activeId) {
      case '#top-growth':
        const topGrowth = STATE.getState().topGrowth;
        plotTopGrowthCard(topGrowth);
        plotGridLineCharts(topGrowth);
        registerGridViewEvents();
        break;

      case "#featured":
        const featuredProviders = STATE.getState().featuredProviders;
        plotFeaturedProviersCard(featuredProviders);
        plotGridLineCharts(featuredProviders);
        registerGridViewEvents();
        break;

      case '#following':
        const followingUsers = STATE.getState().followingUsers;
        plotFollowingUsersCard(followingUsers);
        plotGridLineCharts(followingUsers);
        registerGridViewEvents();
        break;

      case '#favourites':
        const favouriteUsers = STATE.getState().favouriteUsers;
        plotFavouriteUsersCard(favouriteUsers);
        plotGridLineCharts(favouriteUsers);
        registerGridViewEvents();
        break;

      case '#low-growth':
        const lowGrowthUsers = STATE.getState().lowGrowthUsers;
        plotLowGrowthUsersCard(lowGrowthUsers);
        plotGridLineCharts(lowGrowthUsers);
        registerGridViewEvents();
        break;

      case '#mid-growth':
        const midGrowthUsers = STATE.getState().midGrowthUsers;
        plotMidGrowthUsersCard(midGrowthUsers);
        plotGridLineCharts(midGrowthUsers);
        registerGridViewEvents();
        break;

      case '#high-growth':
        const highGrowthUsers = STATE.getState().highGrowthUsers;
        plotHighGrowthUsersCard(highGrowthUsers);
        plotGridLineCharts(highGrowthUsers);
        registerGridViewEvents();
        break;
    }
  }

  function plotGridLoadingState(activeTabId) {
    const container = $(`${activeTabId} .panel-body`);
    const loadingContactBoxes = getLoadingContactBoxes(activeTabId);
    container.empty().append(loadingContactBoxes);
  }

  // register events on static content i.e content which is not changing dynamically. such events are global for this page
  function registerGlobalEvents() {
    // subheader - toggling active class on grid and list icons
    $(".subheader .btn-group button").click((event) => {
      const viewType = $(event.currentTarget).data("viewType");
      $(".subheader .btn-group button").removeClass("active");
      $(event.currentTarget).addClass("active");
      if (viewType === "list") {
        // plot list view for current active tab content
        plotListView();

      } else if (viewType === "grid") {
        // plot grid view for current active tab content
        plotGridView();
      }
    });

    // tabs change event listener
    $(".tabs-container .nav-tabs > li").click(event => {
      onTabChange($(event.target).attr('href'))
    })

    DESKTOP_MEDIA.addEventListener('change', function (event) {
      const viewType = getCurrentViewType();
      if (viewType === 'list') {
        plotListView();
      }
    })

    // Follow provider api call on click of CTA from modal
    $('#follow-provider-modal #follow-provider').click(() => {
      $('#follow-provider-modal #close-modal').click();
    })
  }

  function onTabChange(tabId) {
    if (!tabId) {
      return
    }
    STATE.setPaginationData({
      rowsPerPage: 10,
      total: 0,
      page: 0
    })
    switch (tabId) {
      case '#top-growth': fetchTopGrowthProviders(tabId); break;
      case '#featured': fetchFeaturedProviders(tabId); break;
      case '#following': fetchFollowingUsers(tabId); break;
      case '#favourites': fetchFavouriteUsers(tabId); break;
      case '#low-growth': fetchLowGrowthUsers(tabId); break;
      case '#mid-growth': fetchMidGrowthUsers(tabId); break;
      case '#high-growth': fetchHighGrowthUsers(tabId); break;
    }
  }

  function registerGridViewEvents() {
    // Grid View - toggling active class on follow icon in grid and list view
    $(".contact-box .favourite-icon").unbind().click((ele) => {
      const currentTarget = $(ele.currentTarget);
      currentTarget.toggleClass("active");
      if (currentTarget.hasClass("active")) {
        currentTarget.removeClass("fa-bookmark-o").addClass("fa-bookmark");
      } else {
        currentTarget.removeClass("fa-bookmark").addClass("fa-bookmark-o");
      }
    });

    // redirect on click of contact box
    $('.strategy-provider-section .contact-box').unbind().click(showStrategyProviderDetailsPage)

    // follow provider popup 
    const activeTabId = getActiveTab().attr('href');
    $(`${activeTabId} .panel-body .contact-box`).click(event => {
      const id = $(event.currentTarget).data('id')
      fetchStrategyProviderDetails(id);
    })
  }

  function registerListViewEvents() {
    // List view - Toggle follow button
    const listFavIcon = $("table td > .btn.btn-action");
    listFavIcon.click((ele) => {
      const icon = $(ele.currentTarget).find(".favourite-icon");
      icon.toggleClass("active");
      if (icon.hasClass("active")) {
        icon.removeClass("fa-bookmark-o").addClass("fa-bookmark");
      } else {
        icon.removeClass("fa-bookmark").addClass("fa-bookmark-o");
      }
    });
    // redirect on click of contact row
    $('.strategy-provider-section .contact-row').click(showStrategyProviderDetailsPage)
    registerTablePaginationEvents();
  }
  function registerTablePaginationEvents() {
    let fetchDataFunction = () => { };
    const activeId = getActiveTab().attr('href');
    switch (activeId) {
      case '#top-growth': fetchDataFunction = fetchTopGrowthProviders; break;
      case '#following': fetchDataFunction = fetchFollowingUsers; break;
      case '#favourites': fetchDataFunction = fetchFavouriteUsers; break;
    }
    const paginationData = STATE.getState().paginationData;
    // strategy provider footer rows per page
    $('#sp-rows-per-page').off().on('change', function () {
      const rowsPerPage = +this.value;
      if (rowsPerPage) {
        paginationData.rowsPerPage = rowsPerPage;
        STATE.setPaginationData(paginationData)
        fetchDataFunction(activeId, true);
      }
    })
    $('#sp-rows-per-page').val(paginationData.rowsPerPage)

    // fetch data with updated params on click of next pagination action
    $('#next-page-sp').unbind().click(function () {
      paginationData.page++;
      fetchDataFunction(activeId, true);
    })
    // fetch data with updated params on click of previous pagination action
    $('#prev-page-sp').unbind().click(function () {
      if (paginationData.page > 0) {
        paginationData.page--;
        if (paginationData.page === 0) {
          $(this).attr('disabled', true);
        }
        fetchDataFunction(activeId, true);
      } else {
        $(this).attr('disabled', true);
      }
    })

    // disable prev if page number is 0 or less else enable
    if (paginationData.page <= 0) {
      $('#prev-page-sp').attr('disabled', true);
    } else {
      $('#prev-page-sp').removeAttr('disabled');
    }

    // enable next if page number is max it can be else disable
    const totalPossiblePages = Math.floor(paginationData.total / paginationData.rowsPerPage);
    if (paginationData.page >= totalPossiblePages) {
      $('#next-page-sp').attr('disabled', true);
    } else {
      $('#next-page-sp').removeAttr('disabled')
    }
  }

  function showStrategyProviderDetailsPage(event) {
    const targetName = $(event.target).attr('name');
    if (targetName === "follow-provider-cta" || targetName === "favourites-cta") {
      return;
    }
    localStorage.setItem('selectedProviderId', $(event.currentTarget).data('id'))
    window.location.href = window.location.origin + '/strategy-provider-details.html';
  }

  // Helper methods : in below section we will place all the helper functions used on dom ready

  function getActiveTab() {
    return $('.nav.nav-tabs .active')
  }

  // return view type as "grid" or "list"
  function getCurrentViewType() {
    return $(".subheader .btn-group button.active").data("viewType")
  }

  // render user table start
  function getUserTableHTML(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    return `<table class="table mb-0">
    ${getUserTableHeaders()}
    ${getUserTableBody(data)}
    ${getUserTableFooter(data.length)}
    </table>`
  }

  function getUserTableHeaders() {
    return `
    <thead class="border-top-none">
      <tr>
        <th class="pl-3 align-middle">PROVIDER</th>
        <th class="align-middle text-center">AGE</th>
        <th style="height:32px" class="align-middle text-center">Total Returns / equity growth</th>
        <th class="align-middle text-center">DD</th>
        <th class="align-middle text-center">avg / mth</th>
        <th class="align-middle text-center">Avg Pips</th>
        <th class="align-middle text-center">managed funds</th>
        <th class="align-middle text-center">followers</th>
        <th class="align-middle text-center">Follow</th>
        <th class="pr-3 align-middle text-center">WATCH</th>
      </tr>
    </thead>`
  }

  function getUserTableBody(data) {
    if (!data || !Array.isArray(data)) {
      return
    }
    const rowsHTML = [];
    data.forEach(user => {
      rowsHTML.push(getTableRow(user));
    })
    return `
    <tbody>
      ${rowsHTML.join('')}
    </tbody>
    `
  }

  function getTableRow(user) {
    if (!user) {
      return '';
    }
    const { id,
      profile_image,
      name,
      username,
      country,
      return_percentage,
      return_duration,
      drawDown,
      follower_count,
      average_per_month,
      follower_funds,
      average_pips,
      favourite
    } = user;
    return ` <tr id="table-user-${id}" class="contact-row cursor-pointer" data-id="${id}">
      <td class="mr-2 pl-3">
        <img
          alt="image"
          class="rounded-circle img-fluid img-sm float-left"
          src="${profile_image}"
        />
        <div class="ml-2 float-left">
          <p class="font-bold font-size-12 mb-0">
            ${username}
          </p>
          <p class="text-light-black font-size-12 mb-0">
            ${name}
            <img
              class="ml-1"
              src="${getCountryFlags(country)}"
            />
          </p>
        </div>
      </td>
      <td class="text-center align-middle">
      ${return_duration}
      </td>
      <td class="px-3 d-flex">
        <span class="mr-3 return-percentage font-bold font-size-16 pt-1 align-self-center" style="height:30px">${return_percentage}%</span>
        <div class="canvas-max-width-trendline-table pt-2">
          <canvas class="line-chart" class="mt-2"></canvas>
        </div>
      </td>
      <td class="text-light-red text-center align-middle">
      ${drawDown}
      </td>
      <td class="font-bold text-green text-center align-middle">${average_per_month}%</td>
      <td class="font-bold text-center align-middle">${average_pips}</td>
      <td class="font-bold text-center align-middle">${follower_funds}</td>
      <td class="font-bold text-center align-middle">${formatWithCommas(follower_count)}</td>
      <td class="align-middle">
        <button id="follow-provider-cta" class="btn btn-primary font-size-12" data-toggle="modal" data-target="#follow-provider-modal" name="follow-provider-cta">
          Follow Provider
        </button>
      </td>
      <td class="pr-3 align-middle">
        <button
          class="
            btn
            btn-default
            btn-square
            btn-outline
            btn-action
            mx-2
            border-0
          "
          name="favourites-cta"
        >
          <i class="fa favourite-icon extra-large-font border-0 ${favourite === 'true' ? 'fa-bookmark active' : 'fa-bookmark-o'}" name="favourites-cta"></i>
        </button>
      </td>
    </tr>`
  }


  function getUserTableFooter(dataLength) {
    const { start, end, total } = getStartEndRecordCount(dataLength, STATE.getState().paginationData);
    return `<tfoot>
    <tr>
      <td colspan="11" class="pb-0">
      <div class="d-flex justify-content-between align-items-center">
      <p class="mb-0 text-dark-gray small-font">Showing <b>${start}</b> to <b>${end}</b> of <b>${total}</b> providers</p>
      <ul class="pagination d-flex justify-content-end align-items-center m-0">
          <select class="form-control rows-per-page mr-2" name="rows-per-page" id="sp-rows-per-page">
              <option value="10">10 Rows per page</option>
              <option value="20">20 Rows per page</option>
              <option value="30">30 Rows per page</option>
              <option value="40">40 Rows per page</option>
          </select>
          <button class="btn btn-default border-0" type="button" id="prev-page-sp">
              <i class="fa fa-angle-left extra-large-font font-weight-bold"></i>
          </button>
          <button class="btn btn-default border-0" type="button" id="next-page-sp">
              <i class="fa fa-angle-right extra-large-font font-weight-bold"></i>
          </button>
      </ul>
      </div>
      </td>
    </tr>
  </tfoot>`
  }
  // render user table end

  // render user table responsive HTML start
  function getUserTableResponsiveHTML(data) {
    const rowsHTML = [];
    data.forEach(user => {
      rowsHTML.push(getUserTableResponsiveRow(user))
    })
    return `<div class="responsive-users">
        ${rowsHTML.join('')}
        ${getUserTableResponsiveFooter(data.length)}
    </div>`
  }

  function getUserTableResponsiveRow(user) {
    if (!user) {
      return '';
    }
    const { id,
      profile_image,
      name,
      username,
      country,
      return_percentage,
      return_duration,
      drawDown,
      follower_count,
      average_per_month,
      follower_funds,
      average_pips,
      favourite
    } = user;

    return `<div class="p-3 contact-row">
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
            <p class="mb-0 text-dark-green font-bold large-font mr-3">${return_percentage}%</p>
            <button class="btn btn-primary font-size-12 mr-3" data-toggle="modal" data-target="#follow-provider-modal" name="follow-provider-cta">
              Follow
            </button>
            <button
              class="
                btn
                btn-default
                btn-square
                btn-outline
                btn-action
                mx-2
                border-0
              "
              name="favourites-cta"
            >
              <i class="fa favourite-icon extra-large-font border-0 ${favourite === 'true' ? 'fa-bookmark active' : 'fa-bookmark-o'}" name="favourites-cta"></i>
            </button>
        </div>
      </div>
      <div class="d-flex justify-content-between mt-2">
          <div class="mr-3">
            <p class="mb-0 responsive-label">Age</p>
            <p class="mb-0 font-bold responsive-value">${return_duration}</p>
          </div>
          <div class="mr-3">
            <p class="mb-0 responsive-label">DD</p>
            <p class="mb-0 font-bold responsive-value text-light-red">${drawDown}</p>
          </div>
          <div class="mr-3">
            <p class="mb-0 responsive-label">AVG/MTH</p>
            <p class="mb-0 font-bold responsive-value text-dark-green">${average_per_month}</p>
          </div>
          <div class="mr-3 hide-m">
            <p class="mb-0 responsive-label">Avg Pips</p>
            <p class="mb-0 font-bold responsive-value text-dark-green">${average_pips}</p>
          </div>
          <div class="mr-3 hide-m">
            <p class="mb-0 responsive-label">Managed Funds</p>
            <p class="mb-0 font-bold responsive-value text-dark-green">${follower_funds}</p>
          </div>
          <div class="mr-3">
            <p class="mb-0 responsive-label">Followers</p>
            <p class="mb-0 font-bold responsive-value text-dark-green">${follower_count}</p>
          </div>
      </div>
    </div>
    `
  }

  function getUserTableResponsiveFooter(dataLength) {
    const { start, end, total } = getStartEndRecordCount(dataLength, STATE.getState().paginationData);

    return `
    <div class="d-flex justify-content-between align-items-center p-2">
    <p class="mb-0 text-dark-gray small-font">Showing <b>${start}</b> to <b>${end}</b> of <b>${total}</b> trades</p>
    <ul class="pagination d-flex justify-content-end align-items-center m-0">
    <select class="form-control rows-per-page mr-2" name="rows-per-page" id="sp-rows-per-page">
        <option value="10">10 Rows per page</option>
        <option value="20">20 Rows per page</option>
        <option value="30">30 Rows per page</option>
        <option value="40">40 Rows per page</option>
    </select>
        <button class="btn btn-default border-0" type="button" id="prev-page-sp" disabled="true">
            <i class="fa fa-angle-left extra-large-font font-weight-bold"></i>
        </button>
        <button class="btn btn-default border-0" type="button" id="next-page-sp" disabled="true">
            <i class="fa fa-angle-right extra-large-font font-weight-bold"></i>
        </button>
        
    </ul>
    </div>
    `
  }
  // render user table responsive HTML end 

  // render featured providers card HTML start
  function plotFeaturedProviersCard(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#featured .panel-body");
    const containerHTML = [];
    data.forEach((provider) => {
      const providerCard = getFeaturedProviderCardHTML(provider);
      containerHTML.push(providerCard);
    });
    // since in case of featured we have 3 column grid hence we need to add proxy element on even number of elements
    if (data.length % 3 !== 0) {
      const numberOfProxyCards = data.length % 3;
      for (let i = 0; i < 3 - numberOfProxyCards; i++) {
        containerHTML.push(getProxyCardHTML())
      }
    }
    container.empty().append(containerHTML);
  }

  function getFeaturedProviderCardHTML(provider) {
    if (!provider) {
      return "";
    }
    const {
      id,
      profile_image,
      username,
      name,
      return_percentage,
      followers_count,
      drawPercentage,
      return_duration,
      risk_amount,
      age,
      avg_per_month,
      avg_pips,
      trades,
      strategy_philosophy,
      joining_date
    } = provider;

    return `<div class="contact-box d-flex flex-column col" id="contact-box-${id}" data-id="${id}">
    <div class="d-flex justify-content-between">
      <div class="d-flex">
        <img
          alt="image"
          class="rounded-circle img-fluid img-sm"
          src="${profile_image}"
        />
        <div class="d-flex flex-column ml-3">
          <span class="font-bold">${username} <span class="ml-2 featured-chip px-1 text-white extra-small-font">Featured</span></span>
          <span class="text-light-black">${name}</span>
        </div>
      </div>
      <span class="fa fa-bookmark-o favourite-icon" name="favourites-cta"></span>
    </div>
    <div class="d-flex justify-content-between mt-2">
      <div class="d-flex flex-column">
        <p class="return-percentage h4 align-self-center m-0 font-bold">${return_percentage}%</p>
        <p class="text-uppercase text-light-gray small-font">${return_duration}</p>
      </div>
      <div class="d-flex flex-column">
        <p class="risk_amount h4 align-self-center m-0">$${followers_count}</p>
        <p class="text-capitalize small-font text-light-gray text-center">Followers</p>
      </div>
      <div class="d-flex flex-column">
        <p class="risk_amount h4 align-self-center m-0">$${risk_amount}</p>
        <p class="text-capitalize small-font text-blue text-center">low risk</p>
      </div>
    </div>
    <div class="line-chart-container">
      <canvas class="lineChart" class="mt-2"></canvas>
    </div>
    <p class="font-bold mb-2">Strategy Philosophy</p>
    <p class="philosophy-text mb-2">${strategy_philosophy}</p>
    <p class="joined-date mb-3">Joined ${formatDate(new Date(joining_date))}</p>
    <div class="d-flex justify-content-between">
      <div class="d-flex flex-column">
        <p class="text-gray small-font mb-1">AGE</p>
        <p class="font-bold mb-1">${age}</p>
      </div>
      <div class="d-flex flex-column">
        <p class="text-gray small-font mb-1">MAX DD</p>
        <p class="text-light-red font-bold text-center mb-1">${drawPercentage}</p>
      </div>
      <div class="d-flex flex-column">
        <p class="text-gray small-font mb-1">AVG / MTH</p>
        <p class="text-green font-bold text-center mb-1">${avg_per_month}</p>
      </div>
      <div class="d-flex flex-column">
        <p class="text-gray small-font mb-1">AVG PIPS</p>
        <p class="font-bold text-center mb-1">${avg_pips}</p>
      </div>
      <div class="d-flex flex-column">
        <p class="text-gray small-font mb-1">TRADES</p>
        <p class="font-bold text-center mb-1">${trades}</p>
      </div>
    </div>
    <button class="btn btn-primary btn-block follow-provider" data-toggle="modal" data-target="#follow-provider-modal" name="follow-provider-cta">
      Follow Provider
    </button>
  </div>`;
  }
  // render featured providers card HTML end

  // render following users card HTML start
  function plotFollowingUsersCard(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#following .panel-body");
    const containerHTML = [];
    data.forEach((provider) => {
      const providerCard = getUserCardHTML(provider);
      containerHTML.push(providerCard);
    });
    container.empty().append(containerHTML);
    // adding proxy card if needed
    addProxyCard(container, data.length);
  }

  function addProxyCard(container, dataLength) {
    const containerWidth = container.innerWidth();
    const card = container.find('.contact-box')[0];
    const cardsInRow = Math.round(containerWidth / $(card).innerWidth());
    const proxyCardHTML = [];
    if (dataLength % cardsInRow !== 0) {
      const numberOfProxyCards = cardsInRow - (dataLength % cardsInRow);
      for (let i = 0; i < numberOfProxyCards; i++) {
        proxyCardHTML.push(getProxyCardHTML());
      }
      container.append(proxyCardHTML.join(''));
    }
  }

  function plotFollowingUsersTable(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#following .panel-body");

    if (DESKTOP_MEDIA.matches) {
      container.empty().append(`<div class="ibox-content table-responsive p-0">
      ${getUserTableResponsiveHTML(data)}
      </div>`)
    } else {
      container.empty().append(`<div class="ibox-content table-responsive p-0">
      ${getUserTableHTML(data)}
      </div>`)
    }

  }
  // render following users card HTML start

  // render favourite users card HTML start
  function plotFavouriteUsersCard(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#favourites .panel-body");
    const containerHTML = [];
    data.forEach((provider) => {
      const providerCard = getUserCardHTML(provider);
      containerHTML.push(providerCard);
    });
    container.empty().append(containerHTML);
    addProxyCard(container, data.length);
  }
  // render favourite users card HTML start

  function plotFavouriteUsersTable(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#favourites .panel-body");

    if (DESKTOP_MEDIA.matches) {
      container.empty().append(`<div class="ibox-content table-responsive p-0">
      ${getUserTableResponsiveHTML(data)}
      </div>`)
    } else {
      container.empty().append(`<div class="ibox-content table-responsive p-0">
      ${getUserTableHTML(data)}
      </div>`)
    }
  }
  function getProxyCardHTML() {
    return `<div class="contact-box proxy d-flex flex-column col" id="contact-box-proxy"></div>`
  }

  function getLoadingContactBoxes(activeTabId) {
    const boxesHTML = [];
    const containerWidth = getLoadingContainerWidth()
    const cardWidth = activeTabId === '#featured' ? 360 : 270;
    const cardsInRow = Math.floor(containerWidth / cardWidth);

    for (let i = 0; i < cardsInRow - 1; i++) {
      boxesHTML.push(`<div class="contact-box col loading ${activeTabId === "#featured" ? 'featured' : ''}">
          <span class="fa fa-bookmark-o favourite-icon float-right"></span>
          <button class="btn btn-primary btn-block" disabled>
            Follow Provider
          </button>
        </div>`);
    }
    return boxesHTML.join('')
  }

  function getLoadingContainerWidth() {
    const tabs = $('.strategy-provider-section .tab-content').children('[role="tabpanel"]');
    let maxWidth = 0;
    tabs.each((i, tab) => {
      const tabWidth = $(tab).innerWidth();
      if (tabWidth > maxWidth) {
        maxWidth = tabWidth;
      }
    })
    return maxWidth;
  }

  // render low growth users start
  function plotLowGrowthUsersCard(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#low-growth .panel-body");
    const containerHTML = [];
    data.forEach((provider) => {
      const providerCard = getUserCardHTML(provider);
      containerHTML.push(providerCard);
    });
    container.empty().append(containerHTML);
    addProxyCard(container, data.length);
  }

  function plotLowGrowthUsersTable(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#low-growth .panel-body");

    if (DESKTOP_MEDIA.matches) {
      container.empty().append(`<div class="ibox-content table-responsive p-0">
      ${getUserTableResponsiveHTML(data)}
      </div>`)
    } else {
      container.empty().append(`<div class="ibox-content table-responsive p-0">
      ${getUserTableHTML(data)}
      </div>`)
    }
  }

  // render low growth users end

  // render mid growth users start
  function plotMidGrowthUsersCard(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#mid-growth .panel-body");
    const containerHTML = [];
    data.forEach((provider) => {
      const providerCard = getUserCardHTML(provider);
      containerHTML.push(providerCard);
    });
    container.empty().append(containerHTML);
    addProxyCard(container, data.length);
  }
  function plotMidGrowthUsersTable(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#mid-growth .panel-body");

    if (DESKTOP_MEDIA.matches) {
      container.empty().append(`<div class="ibox-content table-responsive p-0">
      ${getUserTableResponsiveHTML(data)}
      </div>`)
    } else {
      container.empty().append(`<div class="ibox-content table-responsive p-0">
      ${getUserTableHTML(data)}
      </div>`)
    }
  }
  // render mid growth users end

  // render high growth users start
  function plotHighGrowthUsersCard(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#high-growth .panel-body");
    const containerHTML = [];
    data.forEach((provider) => {
      const providerCard = getUserCardHTML(provider);
      containerHTML.push(providerCard);
    });
    container.empty().append(containerHTML);
    addProxyCard(container, data.length);
  }

  function plotHighGrowthUsersTable(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#high-growth .panel-body");
    if (DESKTOP_MEDIA.matches) {
      container.empty().append(`<div class="ibox-content table-responsive p-0">
      ${getUserTableResponsiveHTML(data)}
      </div>`)
    } else {
      container.empty().append(`<div class="ibox-content table-responsive p-0">
      ${getUserTableHTML(data)}
      </div>`)
    }
  }
  // render high growth users end


})();

