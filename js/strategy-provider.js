(function () {
  const defaultFilterItems = [
    {
      id: 1,
      displayName: 'body.mp.equityGrowth',
      filterParam: 'equity_growth',
      filterOperation: "&gt;",
      filterPercentage: true,
      filterValue: 10
    },
    {
      id: 2,
      displayName: 'body.mp.totalReturns',
      filterParam: 'total_returns',
      filterOperation: "&gt;",
      filterPercentage: true,
      filterValue: 5
    },
    {
      id: 3,
      displayName: 'body.mp.maxDrawdown',
      filterParam: 'max_drawdown',
      filterOperation: "&lt;",
      filterPercentage: true,
      filterValue: 15
    },
    {
      id: 4,
      displayName: 'body.sp.avg/Mth',
      filterParam: 'avg_per_month',
      filterOperation: "&lt;",
      filterPercentage: true,
      filterValue: 15
    },
    {
      id: 5,
      displayName: 'body.sp.avgPips',
      filterParam: 'avg_pips',
      filterOperation: "&lt;",
      filterPercentage: false,
      filterValue: 15
    },
    {
      id: 6,
      displayName: 'body.sp.managedFunds',
      filterParam: 'managed_funds',
      filterOperation: "&lt;",
      filterPercentage: false,
      filterValue: 100
    },
    {
      id: 7,
      displayName: 'body.mp.followers',
      filterParam: 'followers',
      filterOperation: "&lt;",
      filterPercentage: false,
      filterValue: 198
    },
  ]
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
    selectedTableFilters = []
    dropdownFilterItems = defaultFilterItems.map((f) => ({ ...f }));
    sortData = {
      sortKey: '',
      direction: '' // asc or desc
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
        highGrowthUsers: this.highGrowthUsers,
        selectedTableFilters: this.selectedTableFilters,
        dropdownFilterItems: this.dropdownFilterItems,
        sortData: this.sortData
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

    setSelectedTableFilters(data) {
      if (!data || !Array.isArray(data)) {
        return
      }
      this.selectedTableFilters = data;
    }

    addSelectedFilter(data) {
      if (!data) {
        return
      }
      const existingFilterIndex = this.selectedTableFilters.findIndex(filter => filter.id === data.id);
      if (existingFilterIndex > -1) {
        this.selectedTableFilters[existingFilterIndex].filterValue = data.filterValue;
        this.selectedTableFilters[existingFilterIndex].filterOperation = data.filterOperation;
      } else {
        this.selectedTableFilters.push(data);
      }
    }
    removeSelectedFilter(id) {
      if (!id) {
        return;
      }
      const filterIndexToRemove = this.selectedTableFilters.findIndex(f => f.id === id);
      if (filterIndexToRemove > -1) {
        this.selectedTableFilters.splice(filterIndexToRemove, 1)
      }
    }

    setDropdownFilterItems(data) {
      if (!data || !Array.isArray(data)) {
        return
      }
      this.dropdownFilterItems = data;
    }
    getDropdownFilterItems() {
      return this.dropdownFilterItems;
    }

    setSortData(data) {
      if (!data) {
        return
      }
      this.sortData = data;
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
    const viewType = getCurrentViewType();
    $(`.subheader .btn-group button[data-view-type=${viewType}]`).click();
    const activeId = getActiveTab().attr('href');
    onTabChange(activeId, false);
  });

  // fetch apis start
  function fetchTopGrowthProviders(activeTabId, noLoadingState = false) {
    renderSeletedFilters();
    const filterQueryParams = getSelectedFiltersQueryParams(STATE.getState().selectedTableFilters);
    callAjaxMethod({
      url: `https://copypip.free.beeceptor.com/users/top-growth${filterQueryParams}`,
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
    renderSeletedFilters();
    const filterQueryParams = getSelectedFiltersQueryParams(STATE.getState().selectedTableFilters);
    callAjaxMethod({
      url: `https://copypip.free.beeceptor.com/users/following${filterQueryParams}`,
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
    renderSeletedFilters();
    const filterQueryParams = getSelectedFiltersQueryParams(STATE.getState().selectedTableFilters);
    callAjaxMethod({
      url: `https://copypip.free.beeceptor.com/users/favourites${filterQueryParams}`,
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
        // global function (insipnia_custom.js)
        renderFollowProviderPopup(data.data);
      }
    });
  }

  function fetchLowGrowthUsers(activeTabId) {
    renderSeletedFilters();
    const filterQueryParams = getSelectedFiltersQueryParams(STATE.getState().selectedTableFilters);
    callAjaxMethod({
      url: `https://copypip.free.beeceptor.com/users/low-growth${filterQueryParams}`,
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
    renderSeletedFilters();
    const filterQueryParams = getSelectedFiltersQueryParams(STATE.getState().selectedTableFilters);
    callAjaxMethod({
      url: `https://copypip.free.beeceptor.com/users/mid-growth${filterQueryParams}`,
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
    renderSeletedFilters();
    const filterQueryParams = getSelectedFiltersQueryParams(STATE.getState().selectedTableFilters);
    callAjaxMethod({
      url: `https://copypip.free.beeceptor.com/users/high-growth${filterQueryParams}`,
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
      favourite,
      followed
    } = provider;

    const followProviderCTA = followed === 'true' ? `<button type="button" class="btn btn-outline btn-primary btn-block2 unfollow-provider-cta" name="unfollow-provider-cta" data-toggle="modal"
    data-target="#unfollow-provider-modal" data-name="${name}">
    ${i18n.t('body.sp.unfollowProvider')}
  </button>` : `<button class="btn btn-primary btn-block2" data-toggle="modal" data-target="#follow-provider-modal" name="follow-provider-cta" data-id="${id}">
  ${i18n.t('body.sp.followProvider')}
  </button>`;

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
        <p class="text-uppercase text-light-gray small-font">${calculateDateDiff(new Date(return_duration), new Date(), true)}</p>
      </div>
      <div class=" align-self-center m-0 d-flex flex-column">
        <p class="risk_amount h4 align-self-center text-light-gray m-0">$${risk_amount}</p>
        <p class="text-capitalize small-font text-blue text-center">${i18n.t('body.sp.advisedMin')}</p>
      </div>
    </div>
    <div class="line-chart-container">
      <canvas class="lineChart" class="mt-2"></canvas>
    </div>
    ${followProviderCTA}
    <!-- area chart here-->
    <div class="d-flex mt-2 justify-content-between">
      <span class="text-light-gray"><span class="format-us">${formatWithCommas(follower_count)}</span> ${i18n.t('body.mp.followers')}</span>
      <span class="font-bold">
        ${i18n.t('body.sp.drawdown')} <span class="${drawDown > 0 ? 'text-green' : 'text-danger'}">${drawDown}%</span>
      </span>
    </div>
  </div>`;
  }

  function renderUnfollowProviderPopup(name) {
    const container = $('#unfollow-provider-modal .modal-body');
    container.empty().append(`
        <p class="mb-3">${i18n.t('body.mp.stopFollowingMessage')} <b>${name}</b> ?</p>
        <div class="w-100 d-flex justify-content-end">
            <button type="button" class="btn btn-outline btn-link text-navy font-weight-bold" data-dismiss="modal">${i18n.t('body.tt.cancel')}</button>
            <button type="button" class="btn btn-primary" data-dismiss="modal">${i18n.t('body.common.confirm')}</button>
        </div>
    `)
  }
  // render top growth card end

  // render top growth table start
  function plotTopGrowthTable(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#top-growth .panel-body");

    if (DESKTOP_MEDIA.matches) {
      container.empty().append(`<div class="ibox-content table-responsive p-0 mb-2">
      ${getUserTableResponsiveHTML(data)}
      </div>`)
    } else {
      container.empty().append(`<div class="ibox-content table-responsive p-0 mb-2">
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
        renderTableFilters();
        break;

      case '#following':
        const followingUsers = STATE.getState().followingUsers;
        plotFollowingUsersTable(followingUsers);
        plotListLineCharts(followingUsers);
        registerListViewEvents();
        renderTableFilters();
        break;

      case '#favourites':
        const favouriteUsers = STATE.getState().favouriteUsers;
        plotFavouriteUsersTable(favouriteUsers);
        plotListLineCharts(favouriteUsers);
        registerListViewEvents();
        renderTableFilters();
        break;

      case '#low-growth':
        const lowGrowthUsers = STATE.getState().lowGrowthUsers;
        plotLowGrowthUsersTable(lowGrowthUsers);
        plotListLineCharts(lowGrowthUsers);
        registerListViewEvents();
        renderTableFilters();
        break;

      case '#mid-growth':
        const midGrowthUsers = STATE.getState().midGrowthUsers;
        plotMidGrowthUsersTable(midGrowthUsers);
        plotListLineCharts(midGrowthUsers);
        registerListViewEvents();
        renderTableFilters();
        break;

      case '#high-growth':
        const highGrowthUsers = STATE.getState().highGrowthUsers;
        plotHighGrowthUsersTable(highGrowthUsers);
        plotListLineCharts(highGrowthUsers);
        registerListViewEvents();
        renderTableFilters();
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
        renderTableFilters();
        break;

      case "#featured":
        const featuredProviders = STATE.getState().featuredProviders;
        plotFeaturedProviersCard(featuredProviders);
        plotGridLineCharts(featuredProviders);
        registerGridViewEvents();
        renderTableFilters();
        break;

      case '#following':
        const followingUsers = STATE.getState().followingUsers;
        plotFollowingUsersCard(followingUsers);
        plotGridLineCharts(followingUsers);
        registerGridViewEvents();
        renderTableFilters();
        break;

      case '#favourites':
        const favouriteUsers = STATE.getState().favouriteUsers;
        plotFavouriteUsersCard(favouriteUsers);
        plotGridLineCharts(favouriteUsers);
        registerGridViewEvents();
        renderTableFilters();
        break;

      case '#low-growth':
        const lowGrowthUsers = STATE.getState().lowGrowthUsers;
        plotLowGrowthUsersCard(lowGrowthUsers);
        plotGridLineCharts(lowGrowthUsers);
        registerGridViewEvents();
        renderTableFilters();
        break;

      case '#mid-growth':
        const midGrowthUsers = STATE.getState().midGrowthUsers;
        plotMidGrowthUsersCard(midGrowthUsers);
        plotGridLineCharts(midGrowthUsers);
        registerGridViewEvents();
        renderTableFilters();
        break;

      case '#high-growth':
        const highGrowthUsers = STATE.getState().highGrowthUsers;
        plotHighGrowthUsersCard(highGrowthUsers);
        plotGridLineCharts(highGrowthUsers);
        registerGridViewEvents();
        renderTableFilters();
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
        localStorage.setItem('viewType', 'list');
        // plot list view for current active tab content
        plotListView();

      } else if (viewType === "grid") {
        localStorage.setItem('viewType', 'grid');
        // plot grid view for current active tab content
        plotGridView();
      }
    });

    // tabs change event listener
    $(".tabs-container .nav-tabs > li").click(event => {
      onTabChange($(event.currentTarget).find('a').attr('href'))
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
    // select tab based on query params
    const selectedTabId = window.location.hash;
    $(`.nav.nav-tabs [href="${selectedTabId}"]`).click();

    // global function
    initI18nPlugin();
    // this function will be called by language switcher event from insipnia_custom.js file when language has been set successfully
    // each page has to add respective function on window to reload the translations on their page
    window.reloadElementsOnLanguageChange = function () {
      renderBuySellData(); // global function
      const viewType = getCurrentViewType();
      if (viewType === 'list') {
        plotListView();
      } else {
        plotGridView()
      }
    }
  }

  function onTabChange(tabId, isManual = true) {
    if (!tabId) {
      return
    }
    // reset pagination data
    STATE.setPaginationData({
      rowsPerPage: 10,
      total: 0,
      page: 0
    })
    resetSortData();
    if (isManual) {
      clearFilters();
    }
    if (tabId === "#featured") {
      $('#list-view-cta').hide();
      if (getCurrentViewType() === 'list') {
        $('#grid-view-cta').click();
      }
    } else {
      $('#list-view-cta').show();
    }
    localStorage.setItem('SP_active_tab_id', tabId);
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

  function resetSortData() {
    STATE.setSortData({
      sortKey: '',
      direction: ''
    })
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

    // unfollow provider CTA
    $('.unfollow-provider-cta').unbind().click(event => {
      const providerName = $(event.currentTarget).data('name');
      renderUnfollowProviderPopup(providerName);
    })
  }

  function registerListViewEvents() {
    // List view - Toggle follow button
    const listFavIcon = $("table td > .btn.btn-action");
    listFavIcon.unbind().click((ele) => {
      const icon = $(ele.currentTarget).find(".favourite-icon");
      icon.toggleClass("active");
      if (icon.hasClass("active")) {
        icon.removeClass("fa-bookmark-o").addClass("fa-bookmark");
      } else {
        icon.removeClass("fa-bookmark").addClass("fa-bookmark-o");
      }
    });
    // redirect on click of contact row
    $('.strategy-provider-section .contact-row').unbind().click(showStrategyProviderDetailsPage)

    // unfollow provider CTA
    $('.unfollow-provider-cta').unbind().click(event => {
      const providerName = $(event.currentTarget).data('name');
      renderUnfollowProviderPopup(providerName);
    })

    // follow provider CTA
    $('.follow-provider-cta').unbind().click(event => {
      const id = $(event.currentTarget).data('id')
      fetchStrategyProviderDetails(id);
    })
    registerTablePaginationEvents();
    registerTableSortEvents();
  }
  function registerTablePaginationEvents() {
    let fetchDataFunction = () => { };
    const activeId = getActiveTab().attr('href');
    switch (activeId) {
      case '#top-growth': fetchDataFunction = fetchTopGrowthProviders; break;
      case '#following': fetchDataFunction = fetchFollowingUsers; break;
      case '#favourites': fetchDataFunction = fetchFavouriteUsers; break;
      case '#low-growth': fetchDataFunction = fetchLowGrowthUsers; break;
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

  // Table sort events start
  function registerTableSortEvents() {
    const activeId = getActiveTab().attr('href');
    switch (activeId) {
      case '#top-growth': tableSortEvents($(`.tab-content ${activeId}`), onTopGrowthSort); break;
      case '#following': tableSortEvents($(`.tab-content ${activeId}`), onFollowingSort); break;
      case '#favourites': tableSortEvents($(`.tab-content ${activeId}`), onFavouritesSort); break;
      case '#low-growth': tableSortEvents($(`.tab-content ${activeId}`), onLowGrowthSort); break;
      case '#mid-growth': tableSortEvents($(`.tab-content ${activeId}`), onMidGrowthSort); break;
      case '#high-growth': tableSortEvents($(`.tab-content ${activeId}`), onHighGrowthSort); break;
    }

  }

  function onTopGrowthSort(key, direction) {
    const topGrowthUsers = STATE.getState().topGrowth
    if (!topGrowthUsers.length) {
      return
    }
    if (!topGrowthUsers[0].hasOwnProperty(key)) {
      return
    }
    tableSort(topGrowthUsers, key, direction);
    plotTopGrowthTable(topGrowthUsers);
    plotListLineCharts(topGrowthUsers);
    registerListViewEvents();
    renderTableFilters();
  }

  function onFollowingSort(key, direction) {
    const followingUsers = STATE.getState().followingUsers;
    if (!followingUsers.length) {
      return
    }

    if (!followingUsers[0].hasOwnProperty(key)) {
      return
    }
    tableSort(followingUsers, key, direction);
    plotFollowingUsersTable(followingUsers);
    plotListLineCharts(followingUsers);
    registerListViewEvents();
    renderTableFilters();
  }

  function onFavouritesSort(key, direction) {
    const favouriteUsers = STATE.getState().favouriteUsers;
    if (!favouriteUsers.length) {
      return
    }
    if (!favouriteUsers[0].hasOwnProperty(key)) {
      return
    }
    tableSort(favouriteUsers, key, direction);
    plotFavouriteUsersTable(favouriteUsers);
    plotListLineCharts(favouriteUsers);
    registerListViewEvents();
    renderTableFilters();
  }

  function onLowGrowthSort(key, direction) {
    const lowGrowthUsers = STATE.getState().lowGrowthUsers;
    if (!lowGrowthUsers.length) {
      return
    }
    if (!lowGrowthUsers[0].hasOwnProperty(key)) {
      return
    }
    tableSort(lowGrowthUsers, key, direction);
    plotLowGrowthUsersTable(lowGrowthUsers);
    plotListLineCharts(lowGrowthUsers);
    registerListViewEvents();
    renderTableFilters();
  }

  function onMidGrowthSort(key, direction) {
    const midGrowthUsers = STATE.getState().midGrowthUsers;
    if (!midGrowthUsers.length) {
      return
    }
    if (!midGrowthUsers[0].hasOwnProperty(key)) {
      return
    }
    tableSort(midGrowthUsers, key, direction);
    plotMidGrowthUsersTable(midGrowthUsers);
    plotListLineCharts(midGrowthUsers);
    registerListViewEvents();
    renderTableFilters();
  }

  function onHighGrowthSort(key, direction) {
    const highGrowthUsers = STATE.getState().highGrowthUsers;
    if (!highGrowthUsers.length) {
      return
    }
    if (!highGrowthUsers[0].hasOwnProperty(key)) {
      return
    }
    tableSort(highGrowthUsers, key, direction);
    plotHighGrowthUsersTable(highGrowthUsers)
    plotListLineCharts(highGrowthUsers);
    registerListViewEvents();
    renderTableFilters();
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


  // Table sort events end

  function showStrategyProviderDetailsPage(event) {
    const targetName = $(event.target).attr('name');
    if (targetName === "follow-provider-cta" || targetName === "favourites-cta" || targetName === "unfollow-provider-cta") {
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
    return localStorage.getItem('viewType')
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
    const selectedSort = STATE.getState().sortData
    const { sortKey, direction } = selectedSort;
    let arrowClass = '';
    if (direction === 'asc') {
      arrowClass = 'up-arrow-sort';
    } else if (direction === 'desc') {
      arrowClass = 'down-arrow-sort';
    }
    return `
    <thead class="border-top-none">
      <tr>
        <th class="pl-3 align-middle">${i18n.t('body.mp.provider')}</th>
        <th class="align-middle text-center">
          <div class="sort-header d-flex align-items-center cursor-pointer w-50 m-auto" data-sort-key="return_duration">
            <p class="m-0 p-0 header-text">${i18n.t('body.sp.age')}<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'return_duration' ? 'd-none' : ''}"></i></p>
          </div>
        </th>
        <th style="height:32px" class="align-middle text-center" data-sort-key="return_percentage">
          <div class="sort-header d-flex align-items-center cursor-pointer w-50 m-auto" data-sort-key="return_percentage">
            <p class="m-0 p-0 header-text">${i18n.t('body.sp.totalReturns/equityGrowth')}<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'return_percentage' ? 'd-none' : ''}"></i></p>
          </div>
        </th>
        <th class="align-middle text-center" data-sort-key="drawDown">
          <div class="sort-header d-flex align-items-center cursor-pointer w-50 m-auto" data-sort-key="drawDown">
            <p class="m-0 p-0 header-text">${i18n.t('body.sp.dd')}<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'drawDown' ? 'd-none' : ''}"></i></p>
          </div>
        </th>
        <th class="align-middle text-center">
          <div class="sort-header d-flex align-items-center cursor-pointer w-100 m-auto" data-sort-key="average_per_month">
            <p class="m-0 p-0 header-text">${i18n.t('body.sp.avg/Mth')}<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'average_per_month' ? 'd-none' : ''}"></i></p>
          </div>
        </th>
        <th class="align-middle text-center">
          <div class="sort-header d-flex align-items-center cursor-pointer w-100 m-auto" data-sort-key="average_pips">
            <p class="m-0 p-0 header-text">${i18n.t('body.sp.avgPips')}<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'average_pips' ? 'd-none' : ''}"></i></p>
          </div>
        </th>
        <th class="align-middle text-center">
          <div class="sort-header d-flex align-items-center cursor-pointer w-100 m-auto" data-sort-key="risk_amount">
            <p class="m-0 p-0 header-text">${i18n.t('body.sp.advisedMin')}<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'risk_amount' ? 'd-none' : ''}"></i></p>
          </div>
        </th>
        <th class="align-middle text-center">
          <div class="sort-header d-flex align-items-center cursor-pointer w-100 m-auto" data-sort-key="follower_funds">
            <p class="m-0 p-0 header-text">${i18n.t('body.sp.managedFunds')}<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'follower_funds' ? 'd-none' : ''}"></i></p>
          </div>
        </th>
        <th class="align-middle text-center">
          <div class="sort-header d-flex align-items-center cursor-pointer w-100 m-auto" data-sort-key="follower_count">
            <p class="m-0 p-0 header-text">${i18n.t('body.mp.followers')}<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'follower_count' ? 'd-none' : ''}"></i></p>
          </div>
        </th>
        <th class="align-middle text-center">${i18n.t('body.sp.follow')}</th>
        <th class="pr-3 align-middle"><p class="m-0 text-center">${i18n.t('body.sp.watch')}</p></th>
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
      favourite,
      followed,
      risk_amount
    } = user;

    const followProviderCTA = followed === 'true' ? `<button type="button" class="btn btn-outline btn-primary btn-block unfollow-provider-cta" name="unfollow-provider-cta" data-toggle="modal"
    data-target="#unfollow-provider-modal" data-name="${name}">
    ${i18n.t('body.sp.unfollowProvider')}
  </button>` : `<button id="follow-provider-cta" class="btn btn-primary font-size-12 btn-block follow-provider-cta" data-toggle="modal" data-target="#follow-provider-modal" name="follow-provider-cta" data-id="${id}">
  ${i18n.t('body.sp.followProvider')}
</button>`;

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
        ${calculateDateDiff(new Date(return_duration), new Date(), true)}
      </td>
      <td class="px-3 d-flex">
        <span class="mr-3 return-percentage font-bold font-size-16 pt-1 align-self-center" style="height:30px">${return_percentage}%</span>
        <div class="canvas-max-width-trendline-table pt-2">
          <canvas class="line-chart" class="mt-2" width="178" height="32"></canvas>
        </div>
      </td>
      <td class="text-light-red text-center align-middle">
      ${drawDown}
      </td>
      <td class="font-bold text-green text-center align-middle">${average_per_month}%</td>
      <td class="font-bold text-center align-middle">${average_pips}</td>
      <td class="font-bold text-center align-middle">${risk_amount}</td>
      <td class="font-bold text-center align-middle">${formatWithCommas(follower_funds)}</td>
      <td class="font-bold text-center align-middle">${formatWithCommas(follower_count)}</td>
      <td class="align-middle">
        ${followProviderCTA}
      </td>
      <td class="pr-3 align-middle">
        <button
          class="
            btn
            btn-default
            btn-square
            btn-outline
            btn-action
            border-0
            float-right
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
      <td colspan="11">
      <div class="d-flex justify-content-between align-items-center">
      <p class="mb-0 text-dark-gray small-font">${i18n.t('body.common.showing')} <b>${start}</b> ${i18n.t('body.common.to')} <b>${end}</b> ${i18n.t('body.common.of')} <b>${total}</b> ${i18n.t('nav.strategyProviders')}</p>
      <ul class="pagination d-flex justify-content-end align-items-center m-0">
          <select class="form-control rows-per-page mr-2" name="rows-per-page" id="sp-rows-per-page">
              <option value="10">${i18n.t('body.mp.10RowsPerPage')}</option>
              <option value="20">${i18n.t('body.mp.20RowsPerPage')}</option>
              <option value="30">${i18n.t('body.mp.30RowsPerPage')}</option>
              <option value="40">${i18n.t('body.mp.40RowsPerPage')}</option>
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
      favourite,
      followed,
      risk_amount
    } = user;

    const followProviderCTA = followed === 'true' ? `<button class="btn btn-primary btn-outline btn-small font-size-12 mr-3" data-toggle="modal" data-target="#unfollow-provider-modal" name="unfollow-provider-cta" data-name="${name}">
    Unfollow
  </button>` : `<button class="btn btn-primary font-size-12 mr-3 btn-small" data-toggle="modal" data-target="#follow-provider-modal" name="follow-provider-cta">
    &nbsp;Follow&nbsp;
  </button>`

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
            ${followProviderCTA}
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
            <p class="mb-0 responsive-label">${i18n.t('body.sp.age')}</p>
            <p class="mb-0 font-bold responsive-value">${calculateDateDiff(new Date(+return_duration), new Date(), true)}</p>
          </div>
          <div class="mr-3">
            <p class="mb-0 responsive-label">${i18n.t('body.sp.dd')}</p>
            <p class="mb-0 font-bold responsive-value text-light-red">${drawDown}</p>
          </div>
          <div class="mr-3">
            <p class="mb-0 responsive-label">${i18n.t('body.sp.avg/Mth')}</p>
            <p class="mb-0 font-bold responsive-value text-dark-green">${average_per_month}</p>
          </div>
          <div class="mr-3 hide-m">
            <p class="mb-0 responsive-label">${i18n.t('body.sp.avgPips')}</p>
            <p class="mb-0 font-bold responsive-value text-dark-green">${average_pips}</p>
          </div>
          <div class="mr-3 hide-m">
            <p class="mb-0 responsive-label">${i18n.t('body.sp.advisedMin')}</p>
            <p class="mb-0 font-bold responsive-value text-dark-green">${risk_amount}</p>
          </div>
          <div class="mr-3 hide-m">
            <p class="mb-0 responsive-label">${i18n.t('body.sp.managedFunds')}</p>
            <p class="mb-0 font-bold responsive-value text-dark-green">${follower_funds}</p>
          </div>
          <div class="mr-3">
            <p class="mb-0 responsive-label">${i18n.t('body.mp.followers')}</p>
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
        <option value="10">${i18n.t('body.mp.10RowsPerPage')}</option>
        <option value="20">${i18n.t('body.mp.20RowsPerPage')}</option>
        <option value="30">${i18n.t('body.mp.30RowsPerPage')}</option>
        <option value="40">${i18n.t('body.mp.40RowsPerPage')}</option>
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
          <span class="font-bold">${username} <span class="ml-2 featured-chip px-1 text-white extra-small-font">${i18n.t('body.sp.featured')}</span></span>
          <span class="text-light-black">${name}</span>
        </div>
      </div>
      <span class="fa fa-bookmark-o favourite-icon" name="favourites-cta"></span>
    </div>
    <div class="d-flex justify-content-between mt-2">
      <div class="d-flex flex-column">
        <p class="return-percentage h4 align-self-center m-0 font-bold">${return_percentage}%</p>
        <p class="text-uppercase text-light-gray small-font">${translateYearMonths(return_duration)}</p>
      </div>
      <div class="d-flex flex-column">
        <p class="risk_amount h4 align-self-center m-0">$${followers_count}</p>
        <p class="text-capitalize small-font text-light-gray text-center">${i18n.t('body.mp.followers')}</p>
      </div>
      <div class="d-flex flex-column">
        <p class="risk_amount h4 align-self-center m-0">$${risk_amount}</p>
        <p class="small-font text-blue text-center">${i18n.t('body.mp.lowRisk')}</p>
      </div>
    </div>
    <div class="line-chart-container">
      <canvas class="lineChart" class="mt-2"></canvas>
    </div>
    <p class="font-bold mb-2">${i18n.t('body.settings.strategyPhilosophy')}</p>
    <p class="philosophy-text mb-2">${i18n.t(strategy_philosophy)}</p>
    <p class="joined-date mb-3">${i18n.t('body.mp.joined')} ${formatDate(new Date(joining_date))}</p>
    <div class="d-flex justify-content-between">
      <div class="d-flex flex-column">
        <p class="text-gray small-font mb-1">${i18n.t('body.sp.age')}</p>
        <p class="font-bold mb-1">${age}</p>
      </div>
      <div class="d-flex flex-column">
        <p class="text-gray small-font mb-1">${i18n.t('body.mp.maxDD')}</p>
        <p class="text-light-red font-bold text-center mb-1">${drawPercentage}</p>
      </div>
      <div class="d-flex flex-column">
        <p class="text-gray small-font mb-1">${i18n.t('body.sp.avg/Mth')}</p>
        <p class="text-green font-bold text-center mb-1">${avg_per_month}</p>
      </div>
      <div class="d-flex flex-column">
        <p class="text-gray small-font mb-1">${i18n.t('body.sp.avgPips')}</p>
        <p class="font-bold text-center mb-1">${avg_pips}</p>
      </div>
      <div class="d-flex flex-column">
        <p class="text-gray small-font mb-1">${i18n.t('body.mp.trades')}</p>
        <p class="font-bold text-center mb-1">${trades}</p>
      </div>
    </div>
    <button class="btn btn-primary btn-block follow-provider" data-toggle="modal" data-target="#follow-provider-modal" name="follow-provider-cta">
      ${i18n.t('body.sp.followProvider')}
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
      container.empty().append(`<div class="ibox-content table-responsive p-0 mb-2">
      ${getUserTableResponsiveHTML(data)}
      </div>`)
    } else {
      container.empty().append(`<div class="ibox-content table-responsive p-0 mb-2">
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
      container.empty().append(`<div class="ibox-content table-responsive p-0 mb-2">
      ${getUserTableResponsiveHTML(data)}
      </div>`)
    } else {
      container.empty().append(`<div class="ibox-content table-responsive p-0 mb-2">
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
      container.empty().append(`<div class="ibox-content table-responsive p-0 mb-2">
      ${getUserTableResponsiveHTML(data)}
      </div>`)
    } else {
      container.empty().append(`<div class="ibox-content table-responsive p-0 mb-2">
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
      container.empty().append(`<div class="ibox-content table-responsive p-0 mb-2">
      ${getUserTableResponsiveHTML(data)}
      </div>`)
    } else {
      container.empty().append(`<div class="ibox-content table-responsive p-0 mb-2">
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
      container.empty().append(`<div class="ibox-content table-responsive p-0 mb-2">
      ${getUserTableResponsiveHTML(data)}
      </div>`)
    } else {
      container.empty().append(`<div class="ibox-content table-responsive p-0 mb-2">
      ${getUserTableHTML(data)}
      </div>`)
    }
  }
  // render high growth users end

  // table filters start
  function renderSeletedFilters() {
    const selectedFilters = STATE.getState().selectedTableFilters;
    const container = $('.selected-filters-container');
    filterChipsHTML = [];
    selectedFilters.forEach(filter => {
      const { id,
        filterName,
        filterOperation,
        filterValue,
        filterPercentage
      } = filter;
      filterChipsHTML.push(`
            <div class="currency-chip d-flex align-items-center cursor-pointer" data-id="${id}">
                <p class="mb-0 mr-2">${filterName} &nbsp;(${filterOperation}${filterValue}${filterPercentage ? '%' : ''})</p><img src="img/ic_cross.svg" class="remove-filter"/>
            </div>
        `)
    })
    container.empty().append(filterChipsHTML.join(''))
    registerSelectedFilterEvents()
  }

  function renderTableFilters() {
    const container = $('.dropdown-menu.dropdown-menu-list');
    const filterItemHTML = [];
    const filterItems = STATE.getState().dropdownFilterItems;

    filterItems.forEach(filter => {
      filterItemHTML.push(getFilterItemHTML(filter))
    })
    container.empty().append(filterItemHTML.join(''))
    registerTableFilterEvents(onApplyFilter);

    $('.remove-filter').unbind().click(removeAppliedFilter);
  }

  function removeAppliedFilter() {
    const filterId = $(this).parent('.currency-chip').data('id');
    // remove selected filter from state 
    STATE.removeSelectedFilter(filterId);
    // update dropdowm filter list items 
    const defaultFilter = defaultFilterItems.find(f => f.id === filterId);
    const dropdownFilterItems = STATE.getState().dropdownFilterItems;
    const dropdownFilterItemIndex = dropdownFilterItems.findIndex(f => f.id === filterId);
    if (dropdownFilterItemIndex > -1 && defaultFilter) {
      dropdownFilterItems[dropdownFilterItemIndex].filterOperation = defaultFilter.filterOperation;
      dropdownFilterItems[dropdownFilterItemIndex].filterValue = defaultFilter.filterValue;
    }
    // fetch and render table based on active tab
    const activeId = getActiveTab().attr('href');
    onTabChange(activeId, false);
  }

  function getFilterItemHTML(filter) {
    if (!filter) {
      return
    }
    const { id, displayName, filterOperation, filterValue, filterPercentage, filterParam } = filter;
    return `
    <li class="dropdown-item d-flex justify-content-between p-3 cursor-pointer" 
    data-id="${id}"
    data-filter-name="${displayName}"
    data-filter-operation="${filterOperation}"
    data-filter-value="${filterValue}"
    data-filter-percentage=${filterPercentage}
    data-filter-param="${filterParam}">
    <p class="mb-0 medium-font mr-3">${i18n.t(displayName)}</p>
    <p class="mb-0 medium-font text-dark-blue font-weight-bold">${filterOperation}${filterValue}${filterPercentage ? '%' : ''}</p>
  </li>
    `
  }

  function onApplyFilter(selectedFilter) {
    console.log('filter applied ', selectedFilter);
    STATE.addSelectedFilter(selectedFilter); // update filter chips
    // update filter items list 
    const filterItems = STATE.getState().dropdownFilterItems;
    const filterItemIndex = filterItems.findIndex(f => f.id === selectedFilter.id)
    if (filterItemIndex > -1) {
      filterItems[filterItemIndex].filterOperation = selectedFilter.filterOperation;
      filterItems[filterItemIndex].filterValue = selectedFilter.filterValue;
    }
    // fetch and render table based on active tab
    const activeId = getActiveTab().attr('href');
    onTabChange(activeId, false);
  }


  function clearFilters() {
    STATE.setDropdownFilterItems(defaultFilterItems);
    STATE.setSelectedTableFilters([]);
    renderTableFilters();
    renderSeletedFilters();
  }
  // table filters end

})();

