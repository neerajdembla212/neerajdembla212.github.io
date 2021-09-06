(function () {
  class State {
    topGrowth = [];
    featuredProviders = [];
    followingUsers = [];
    favouriteUsers = [];

    getState() {
      return {
        topGrowth: this.topGrowth,
        featuredProviders: this.featuredProviders,
        followingUsers: this.followingUsers,
        favouriteUsers: this.favouriteUsers
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
    if (data.length % 2 !== 0) {
      containerHTML.push(getProxyCardHTML())
    }
    container.empty().append(containerHTML);
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
    const boxCount = activeTabId === '#featured' ? 6 : 8;
    const loadingContactBoxes = getLoadingContactBoxes(activeTabId, boxCount);
    const container = $(`${activeTabId} .panel-body`);
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
    $(".contact-box .favourite-icon").click((ele) => {
      const currentTarget = $(ele.currentTarget);
      currentTarget.toggleClass("active");
      if (currentTarget.hasClass("active")) {
        currentTarget.removeClass("fa-bookmark-o").addClass("fa-bookmark");
      } else {
        currentTarget.removeClass("fa-bookmark").addClass("fa-bookmark-o");
      }
    });

    // redirect on click of contact box
    $('.strategy-provider-section .contact-box').click(showStrategyProviderDetailsPage)
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
    <button class="btn btn-primary btn-block2" data-toggle="modal" data-target="#follow-provider-modal" name="follow-provider-cta">
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
        <th class="pl-3">PROVIDER</th>
        <th>AGE</th>
        <th style="height:32px" class="border-bottom-transparent">Total Returns / equity growth</th>
        <th>DD</th>
        <th>avg / mth</th>
        <th>Avg Pips</th>
        <th>follower funds</th>
        <th>followers</th>
        <th>advised min</th>
        <th>Follow</th>
        <th class="pr-3">WATCH</th>
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
    if (data.length % 2 !== 0) {
      containerHTML.push(getProxyCardHTML())
    }
    container.empty().append(containerHTML);
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

  function getLoadingContactBoxes(activeTabId, numberOfBoxes = 8) {
    const boxesHTML = [];
    for (let i = 0; i < numberOfBoxes; i++) {
      boxesHTML.push(`<div class="contact-box loading col ${activeTabId === "#featured" ? 'featured' : ''}">
          <span class="fa fa-bookmark-o favourite-icon float-right"></span>
          <button class="btn btn-primary btn-block">
            Follow Provider
          </button>
        </div>`);
    }
    return boxesHTML.join('')
  }
})();

