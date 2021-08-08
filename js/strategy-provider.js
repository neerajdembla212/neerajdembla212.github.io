(function () {
  class State {
    risingStars = [];
    topRated = [];
    topGrowth = [];
    followers = [];

    getState() {
      return {
        risingStars: this.risingStars,
        topRated: this.topRated,
        topGrowth: this.topGrowth,
        followers: this.followers
      }
    }

    setRisingStars(data) {
      if (!data || !Array.isArray(data)) {
        return
      }
      this.risingStars = data;
    }

    setTopRated(data) {
      if (!data || !Array.isArray(data)) {
        return
      }
      this.topRated = data;
    }

    setTopGrowth(data) {
      if (!data || !Array.isArray(data)) {
        return
      }
      this.topGrowth = data;
    }

    setFollowers(data) {
      if (!data || !Array.isArray(data)) {
        return
      }
      this.followers = data;
    }
  }

  // creating state object which will contain application data fetched from api in memory for SP page only.
  // every page will have a similar structure to store data for their view. 
  // NOTE : This state structure ensures whenever data changes by any function / api they call methods of state data fist to update data and then update UI
  // however this structure doesn't support data sharing between two pages, for that we have to rely upon api or local storage
  const STATE = new State();

  $(function () {
    registerGlobalEvents();
    // fetch rising stars
    callAjaxMethod({
      url: "https://copypip.free.beeceptor.com/users/rising-stars",
      successCallback: (data) => {
        STATE.setRisingStars(data.data);
        const viewType = getCurrentViewType();
        switch (viewType) {
          case 'grid': plotGridView(); break;
          case 'list': plotListView(); break;
        }
      },
      beforeSend: plotGridLoadingState
    });
  });

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
    gradient.addColorStop(0, "#B6A3E6");
    gradient.addColorStop(0.2, "#B6A3E6");
    gradient.addColorStop(1, "#F1EBFF");

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
  // Plot single trinagle chart (risk)
  function plotTriangleChart(canvas, riskFactor) {
    if (!canvas) {
      return;
    }
    const containerTriangleSide = 25;
    canvas.height = containerTriangleSide;
    canvas.width = containerTriangleSide;
    const ctx = canvas.getContext("2d");

    // plot container triangle
    ctx.beginPath();
    ctx.moveTo(containerTriangleSide, 0);
    ctx.lineTo(containerTriangleSide, containerTriangleSide);
    ctx.lineTo(0, containerTriangleSide);
    ctx.fillStyle = "rgba(229, 229, 229, 1)";
    ctx.fill();

    // plot risk triangle
    // assuming risk factor is in percentage
    const riskTriangleSide = Math.ceil(
      (riskFactor / 100) * containerTriangleSide
    );
    ctx.beginPath();
    ctx.moveTo(0, containerTriangleSide);
    ctx.lineTo(riskTriangleSide, containerTriangleSide);
    ctx.lineTo(riskTriangleSide, containerTriangleSide - riskTriangleSide);

    ctx.fillStyle = "rgba(54, 152, 243, 1)";
    ctx.fill();
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

  // plot all triangle charts (risk charts) in grid view
  function plotGridTriangleCharts(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    data.forEach((user) => {
      const triangleCanvas = document.querySelector(
        `#contact-box-${user.id} .triangle`
      );
      plotTriangleChart(triangleCanvas, user.risk_percentage);
    });
  }

  function plotListTriangleCharts(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    data.forEach((user) => {
      const triangleCanvas = document.querySelector(
        `#table-user-${user.id} .triangle`
      );
      plotTriangleChart(triangleCanvas, user.risk_percentage);
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
        plotLineChart(canvas, user.trendline, 'list');
      }
    });
  }

  function plotRisingStarCard(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#rising-stars .panel-body");
    const containerHTML = [];
    data.forEach((user) => {
      const userCard = getUserCardHTML(user);
      containerHTML.push(userCard);
    });
    container.empty().append(containerHTML);
  }

  function plotRisingStarTable(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    const container = $("#rising-stars .panel-body");

    container.empty().append(`<div class="ibox-content table-responsive">
    ${getUserTableHTML(data)}
    </div>`)

  }

  function plotListView() {
    const activeId = getActiveTab().attr('href');
    switch (activeId) {
      case '#rising-stars':
        const risingStars = STATE.getState().risingStars;
        plotRisingStarTable(risingStars);
        plotListLineCharts(risingStars);
        plotListTriangleCharts(risingStars);
        registerListViewEvents();
        break;
    }
  }

  function plotGridView() {
    const activeId = getActiveTab().attr('href');
    switch (activeId) {
      case '#rising-stars':
        const risingStars = STATE.getState().risingStars;
        // const risingStars = {}
        plotRisingStarCard(risingStars);
        plotGridLineCharts(risingStars);
        registerGridViewEvents();
        break;
    }
  }

  function plotGridLoadingState() {
    const loadingContactBoxes = $('.grid-loading-state .contact-box');
    const container = $("#rising-stars .panel-body");
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

  function getUserCardHTML(user) {
    if (!user) {
      return "";
    }
    const {
      id,
      profile_image,
      username,
      name,
      return_percentage,
      copiers_count,
      drawPercentage,
      return_duration,
      risk_amount
    } = user;

    return `<div class="contact-box d-flex flex-column" id="contact-box-${id}">
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
    <div class="d-flex justify-content-between">
      <span class="return-percentage h4 align-self-center m-0 font-bold">${return_percentage}%</span>
      <span class="risk_amount h4 align-self-center m-0">$${risk_amount}</span>
    </div>
    <div class="d-flex justify-content-between mb-2">
      <span class="text-uppercase text-light-gray small-font">
        ${return_duration}
      </span>
      <span class="text-capitalize small-font text-blue">low risk</span>
    </div>
    <canvas class="lineChart" class="mt-2"></canvas>
    <button class="btn btn-primary btn-block">
      Copy Trader
    </button>
    <!-- area chart here-->
    <div class="d-flex mt-2 justify-content-between">
      <span class="text-light-gray"><span class="format-us">${formatWithCommas(copiers_count)}</span> Followers</span>
      <span class="font-bold">
        Drawdown <span class="${drawPercentage > 0 ? 'text-green' : 'text-danger'}">${drawPercentage}%</span>
      </span>
    </div>
  </div>`;
  }

  function getUserTableHTML(data) {
    if (!data || !Array.isArray(data)) {
      return;
    }
    return `<table class="table">
    ${getUserTableHeaders()}
    ${getUserTableBody(data)}
    </table>`
  }

  function getUserTableHeaders() {
    return `
    <thead>
      <tr>
        <th>PROVIDER</th>
        <th>RETURN</th>
        <th>RISK</th>
        <th>TRENDLINE</th>
        <th>COPIER</th>
        <th>RATING</th>
        <th>COPY</th>
        <th>WATCH</th>
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
    const { id, profile_image, name, username, country, copiers_percentage, copiers_count, return_percentage, ratings } = user;
    return ` <tr id="table-user-${id}">
      <td>
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
      <td class="return-percentage font-bold font-size-16">
        ${return_percentage}%
      </td>
      <td>
        <canvas class="triangle"></canvas>
      </td>
      <td class="canvas-max-width-trendline pr-3">
        <canvas class="line-chart" class="mt-2"></canvas>
      </td>
      <td>
        <span
          class="
            text-light-gray
            font-size-12
            mr-2
            format-us
          "
          >${formatWithCommas(copiers_count)}</span
        >
        <span class="text-dark-green">
          <i
            class="fa fa-play fa-rotate-270 font-size-12"
          ></i>
          ${copiers_percentage}%
        </span>
      </td>
      <td>
        <span class="ratings">
        ${getRatingsHTML(ratings)}
        </span>
      </td>
      <td>
        <button class="btn btn-primary font-size-12">
          Copy Trader
        </button>
      </td>
      <td>
        <button
          class="
            btn
            btn-default
            btn-square
            btn-outline
            btn-action
            mx-2
          "
        >
          <i class="fa fa-bookmark-o favourite-icon"></i>
        </button>
      </td>
    </tr>`
  }

  function getCountryFlags(country) {
    switch (country) {
      case 'us': return 'img/flags/16/United-States.png'
      default: return '';
    }
  }

  function getRatingsHTML(rating) {
    if (!rating || isNaN(rating)) {
      return '';
    }
    const maxRating = 5;
    const ratingsHTML = [];
    const ratingNum = Number(rating);
    for (let i = 0; i < maxRating; i++) {
      if (i < ratingNum) {
        ratingsHTML.push('<i class="fa fa-star active"></i>')
      } else {
        ratingsHTML.push('<i class="fa fa-star"></i>')
      }
    }
    return ratingsHTML.join('')
  }
})();
