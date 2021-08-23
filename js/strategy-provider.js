(function () {
  class State {
    topGrowth = [];
    featuredProviders = [];
    getState() {
      return {
        topGrowth: this.topGrowth,
        featuredProviders: this.featuredProviders
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

  function fetchTopGrowthProviders() {
    callAjaxMethod({
      url: "https://copypip.free.beeceptor.com/users/rising-stars",
      successCallback: (data) => {
        STATE.setTopGrowth(data.data);
        const viewType = getCurrentViewType();
        switch (viewType) {
          case 'grid': plotGridView(); break;
          case 'list': plotListView(); break;
        }
      },
      beforeSend: plotGridLoadingState
    });
  }

  function fetchFeaturedProviders() {
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
      // beforeSend: plotGridLoadingState
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
  }

  function plotTopGrowthTable(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#top-growth .panel-body");

    container.empty().append(`<div class="ibox-content table-responsive p-0">
    ${getUserTableHTML(data)}
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
    }
  }

  function plotGridLoadingState() {
    const loadingContactBoxes = $('.grid-loading-state .contact-box');
    const container = $("#top-growth .panel-body");
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
      console.log('clicked')
      $('#follow-provider-modal #close-modal').click();
    })
  }

  function onTabChange(tabId) {
    if (!tabId) {
      return
    }
    switch (tabId) {
      case '#top-growth': fetchTopGrowthProviders(); break;
      case '#featured': fetchFeaturedProviders(); break;

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

    return `<div class="contact-box d-flex flex-column col" id="contact-box-${id}">
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
      <span class="fa favourite-icon ${favourite === 'true' ? 'fa-bookmark active' : 'fa-bookmark-o'}"></span>
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
    <canvas class="lineChart" class="mt-2"></canvas>
    <button class="btn btn-primary btn-block" data-toggle="modal" data-target="#follow-provider-modal">
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

  function getUserTableHTML(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    return `<table class="table mb-0">
    ${getUserTableHeaders()}
    ${getUserTableBody(data)}
    </table>`
  }

  function getUserTableHeaders() {
    return `
    <thead>
      <tr>
        <th class="pl-3">PROVIDER</th>
        <th>AGE</th>
        <th>Total Returns / equity growth</th>
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
    return ` <tr id="table-user-${id}">
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
        <span class="mr-3 return-percentage font-bold font-size-16 pt-1">${return_percentage}%</span>
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
      <td>
        <button class="btn btn-primary font-size-12" data-toggle="modal" data-target="#follow-provider-modal"">
          Follow Provider
        </button>
      </td>
      <td class="pr-3">
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
        >
          <i class="fa favourite-icon extra-large-font border-0 ${favourite === 'true' ? 'fa-bookmark active' : 'fa-bookmark-o'}"></i>
        </button>
      </td>
    </tr>`
  }

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

    return `<div class="contact-box d-flex flex-column col" id="contact-box-${id}">
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
      <span class="fa fa-bookmark-o favourite-icon"></span>
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
    <canvas class="lineChart" class="mt-2"></canvas>
    <p class="font-bold mb-2">Strategy Philosophy</p>
    <p class="philosophy-text mb-2">${strategy_philosophy}</p>
    <p class="joined-date mb-3">Joined ${formatDate(new Date(joining_date))}</p>
    <div class="d-flex justify-content-between">
      <div class="d-flex flex-column">
        <p class="text-gray small-font">AGE</p>
        <p class="font-bold">${age}</p>
      </div>
      <div class="d-flex flex-column">
        <p class="text-gray small-font">MAX DD</p>
        <p class="text-light-red font-bold text-center">${drawPercentage}</p>
      </div>
      <div class="d-flex flex-column">
        <p class="text-gray small-font">AVG / MTH</p>
        <p class="text-green font-bold text-center">${avg_per_month}</p>
      </div>
      <div class="d-flex flex-column">
        <p class="text-gray small-font">AVG PIPS</p>
        <p class="font-bold text-center">${avg_pips}</p>
      </div>
      <div class="d-flex flex-column">
        <p class="text-gray small-font">TRADES</p>
        <p class="font-bold text-center">${trades}</p>
      </div>
    </div>
    <button class="btn btn-primary btn-block follow-provider" data-toggle="modal" data-target="#follow-provider-modal">
      Follow Provider
    </button>
  </div>`;
  }

})();

