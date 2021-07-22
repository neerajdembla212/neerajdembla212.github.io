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
      if(!data || !Array.isArray(data)) {
        return
      }
      this.risingStars = data;
    }
    
    setTopRated(data) {
      if(!data || !Array.isArray(data)) {
        return
      }
      this.topRated = data;
    }
    
    setTopGrowth(data) {
      if(!data || !Array.isArray(data)) {
        return
      }
      this.topGrowth = data;
    }

    setFollowers(data) {
      if(!data || !Array.isArray(data)) {
        return
      }
      this.followers = data;
    }
  }

  const STATE = new State();

  $(function () {

    const lineChartBorderColor = "#501EC6";
    // Plot single Line chart (trendline)
    function plotLineChart(lineChartCanvas, lineData) {
      if (!lineData || !Array.isArray(lineData)) {
        return;
      }
      const lineDataPoints = lineData.reduce((acc, curr) => {
        acc.push(curr.data);
        return acc;
      }, []);
      if ($(lineChartCanvas).hasClass("sm")) {
        lineChartCanvas.height = 30;
      } else {
        lineChartCanvas.height = 40;
      }
      const ctx = lineChartCanvas.getContext("2d");
      var gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        Math.max(...lineDataPoints)
      );
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
            borderColor: lineChartBorderColor,
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

    // function plotAllTableLineCharts() {
    //   const lineChartHolders = document.querySelectorAll(
    //     "table td .line-chart"
    //   );
    //   const data = [0, 13, 12, 20, 19, 17, 15, 11, 18];
    //   lineChartHolders.forEach((lineChart) => {
    //     plotTableLineChart(lineChart, data);
    //   });
    // }

    // function plotTableLineChart(lineChartHolder, data) {
    //   $(lineChartHolder).text(data.join(",")).peity("line", {
    //     fill: "#B6A3E6",
    //     stroke: lineChartBorderColor,
    //     width: "100%",
    //     height: 25,
    //   });
    // }

    function plotRisingStarCard(data) {
      if (!data || !Array.isArray(data)) {
        return;
      }
      const container = $("#rising-stars-grid .panel-body");
      const containerHTML = [];
      data.forEach((user) => {
        const userCard = getUserCardHTML(user);
        containerHTML.push(userCard);
      });
      container.append(containerHTML);
    }
    
    function plotListView() {
      const activeId = getActiveTab().attr('href');
      switch(activeId) {
        case '#rising-stars-grid' : 
        const risingStars = STATE.getState().risingStars;
      }
    }

    function plotGridView() {
      const activeId = getActiveTab().attr('href');
      switch(activeId) {
        case '#rising-stars-grid' : 
        const risingStars = STATE.getState().risingStars;
        plotRisingStarCard(risingStars);
        plotGridLineCharts(risingStars);
        plotGridTriangleCharts(risingStars); 
        registerGridViewEvents();
        break;
      }
    }
    registerGlobalEvents();
    // fetch rising stars
    callAjaxMethod({
      url: "http://demo6418683.mockable.io/users/rising-stars",
      successCallback: (data) => {
        STATE.setRisingStars(data.data);
        const risingStars = STATE.getState().risingStars;
        const viewType = getCurrentViewType();
        switch(viewType) {
          case 'grid': plotGridView(); break;
          case 'list': plotListView(); break;
        }
      },
    });
  });

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

    // List View - format numbers using comma
    $(".format-us").each((i, ele) => {
      const number = ele.textContent;
      if (!isNaN(number)) {
        $(ele).text(formatWithCommas(+number));
      }
    });
  }

  function getActiveTab() {
    return $('.nav.nav-tabs .active')
  }

  // return view type as "grid" or "list"
  function getCurrentViewType() {
    return $(".subheader .btn-group button.active").data("viewType")
  }
  function formatWithCommas(number) {
    internationalNumberFormat = new Intl.NumberFormat("en-US");
    return internationalNumberFormat.format(number);
  }

  function getUserCardHTML(user) {
    if (!user) {
      return "";
    }
    const {
      profile_image,
      username,
      name,
      return_percentage,
      copiers_count,
      risk_percentage,
      id,
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
      <span class="return-percentage font-bold">${return_percentage}%</span>
      <canvas class="triangle"></canvas>
    </div>
    <div class="d-flex justify-content-between mb-2">
      <span class="text-uppercase text-light-gray small-font">
        Return over last 2 yr
      </span>
      <span class="text-uppercase small-font">risk</span>
    </div>
    <canvas class="lineChart" class="mt-2"></canvas>
    <button class="btn btn-primary btn-block">
      Copy Trader
    </button>
    <!-- area chart here-->
    <div class="d-flex mt-2 justify-content-between">
      <span class="text-light-gray">${copiers_count} Copiers</span>
      <span class="text-dark-green">
        <i class="fa fa-play fa-rotate-270"></i> ${risk_percentage}%
      </span>
      <span class="ratings">
        <i class="fa fa-star active"></i>
        <i class="fa fa-star active"></i>
        <i class="fa fa-star active"></i>
        <i class="fa fa-star active"></i>
        <i class="fa fa-star"></i>
      </span>
    </div>
  </div>`;
  }
})();
