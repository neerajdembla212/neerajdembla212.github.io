(function () {
  class State {
    topGrowth = [];
    featuredProviders = [];
    followingUsers = [];
    favouriteUsers = [];
    strategyProviderDetails = {};

    getState() {
      return {
        topGrowth: this.topGrowth,
        featuredProviders: this.featuredProviders,
        followingUsers: this.followingUsers,
        favouriteUsers: this.favouriteUsers,
        strategyProviderDetails: this.strategyProviderDetails
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
  }

  // creating state object which will contain application data fetched from api in memory for SP page only.
  // every page will have a similar structure to store data for their view. 
  // NOTE : This state structure ensures whenever data changes by any function / api they call methods of state data fist to update data and then update UI
  // however this structure doesn't support data sharing between two pages, for that we have to rely upon api or local storage
  const STATE = new State();

  $(function () {
    registerGlobalEvents();
    const activeId = getActiveTab().attr('href');
    onTabChange(activeId);
  });

  // fetch apis start
  function fetchTopGrowthProviders(activeTabId) {
    callAjaxMethod({
      url: "https://copypip.free.beeceptor.com/users/top-growth",
      successCallback: (data) => {
        STATE.setTopGrowth(data.data);
        const viewType = getCurrentViewType();
        switch (viewType) {
          case 'grid': plotGridView(); break;
          case 'list': plotListView(); break;
        }
      },
      beforeSend: plotGridLoadingState.bind(null, activeTabId)
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
        renderFollowProviderPopup();
      }
    });
  }
  // fetch apis end
  // Plot single Line chart (trendline) 
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

  // plot all line charts in grid view
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

  function plotTopGrowthCard(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#top-growth .panel-body");
    const containerHTML = [];
    data.forEach((provider) => {
      const providerCard = getTopGrowthCardHTML(provider);
      containerHTML.push(providerCard);
    });
    container.empty().append(containerHTML);
    addProxyCard(container, data.length);
  }

  function plotTopGrowthTable(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#top-growth .panel-body");

    container.empty().append(`<div class="ibox-content table-responsive p-0">
    ${getUserTableHTML(data)}
    ${getUserTableResponsiveHTML(data)}
    </div>`)

  }

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
    // Follow provider api call on click of CTA from modal
    $('#follow-provider-modal #follow-provider').click(() => {
      $('#follow-provider-modal #close-modal').click();
    })
  }

  function onTabChange(tabId) {
    if (!tabId) {
      return
    }
    switch (tabId) {
      case '#top-growth': fetchTopGrowthProviders(tabId); break;
      case '#featured': fetchFeaturedProviders(tabId); break;
      case '#following': fetchFollowingUsers(tabId); break;
      case '#favourites': fetchFavouriteUsers(tabId); break;


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
      debugger
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

  function getTopGrowthCardHTML(provider) {
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

  // render user table start
  function getUserTableHTML(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    return `<table class="table mb-0">
    ${getUserTableHeaders()}
    ${getUserTableBody(data)}
    ${getStrategyProvidersTableFooter()}
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
        <th class="align-middle text-center">follower funds</th>
        <th class="align-middle text-center">followers</th>
        <th class="align-middle text-center">advised min</th>
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
      advised_min,
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
      <td class="font-bold text-center align-middle">
      <div>
        <p class="m-0">$${formatWithCommas(advised_min)}</p>
        <p class="small-font text-capitalize text-blue m-0 font-weight-normal">Low Risk</p>
      </div>
      </td>
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


  function getStrategyProvidersTableFooter() {
    return `<tfoot>
    <tr>
      <td colspan="11" class="pb-0">
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
  // render user table end

  // render user table responsive HTML start
  function getUserTableResponsiveHTML(data) {
    const rowsHTML = [];
    data.forEach(user => {
      rowsHTML.push(getUserTableResponsiveRow(user))
    })
    return `<div class="responsive-users">
        ${rowsHTML.join('')}
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
      advised_min,
      favourite
    } = user;

    return `<div class="p-3">
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
          <div class="mr-3">
            <p class="mb-0 responsive-label">Advised Min</p>
            <p class="mb-0 font-bold responsive-value text-dark-green">${advised_min}</p>
          </div>
          <div class="mr-3 hide-m">
            <p class="mb-0 responsive-label">Avg Pips</p>
            <p class="mb-0 font-bold responsive-value text-dark-green">${average_pips}</p>
          </div>
          <div class="mr-3 hide-m">
            <p class="mb-0 responsive-label">Follower Funds</p>
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
          <span class="font-bold">${username}</span>
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
      const providerCard = getTopGrowthCardHTML(provider);
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

    container.empty().append(`<div class="ibox-content table-responsive p-0">
    ${getUserTableHTML(data)}
    ${getUserTableResponsiveHTML(data)}
    </div>`)

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
      const providerCard = getTopGrowthCardHTML(provider);
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

    container.empty().append(`<div class="ibox-content table-responsive p-0">
    ${getUserTableHTML(data)}
    ${getUserTableResponsiveHTML(data)}
    </div>`)
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

  // render follow provider start
  function renderFollowProviderPopup() {
    const strategyProviderDetails = STATE.getState().strategyProviderDetails;
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
})();

