$(function () {
  const lineChartBorderColor = "#501EC6";
  function plotLineChart(lineChartCanvas, lineData) {
    if ($(lineChartCanvas).hasClass("sm")) {
      lineChartCanvas.height = 30;
    } else {
      lineChartCanvas.height = 40;
    }
    const ctx = lineChartCanvas.getContext("2d");
    var gradient = ctx.createLinearGradient(0, 0, 0, Math.max(...lineData));
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
          data: lineData,
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

  function plotAllLineCharts() {
    const canvasArray = document.querySelectorAll(".contact-box .lineChart");
    const data = [0, 13, 12, 20, 19, 17, 15, 11, 18];
    canvasArray.forEach((canvas) => {
      plotLineChart(canvas, data);
    });
  }

  function plotAllTableLineCharts() {
    const lineChartHolders = document.querySelectorAll("table td .line-chart");
    const data = [0, 13, 12, 20, 19, 17, 15, 11, 18];
    lineChartHolders.forEach((lineChart) => {
      plotTableLineChart(lineChart, data);
    });
  }

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

  function plotAllTriangleCharts() {
    const canvasArray = document.querySelectorAll(".triangle");
    canvasArray.forEach((canvas) => {
      plotTriangleChart(canvas, getRandomNumberBetween(10, 100));
    });
  }

  function plotTableLineChart(lineChartHolder, data) {
    $(lineChartHolder).text(data.join(",")).peity("line", {
      fill: "#B6A3E6",
      stroke: lineChartBorderColor,
      width: "100%",
      height: 25,
    });
  }
  plotAllLineCharts();
  plotAllTriangleCharts();
  plotAllTableLineCharts();

  // subheader - toggling active class on grid and list icons
  $(".subheader .btn-group button").click((event) => {
    const viewType = $(event.currentTarget).data("viewType");
    $(".subheader .btn-group button").removeClass("active");
    $(event.currentTarget).addClass("active");
    if (viewType === "list") {
      window.location.href = "strategy-providers-list.html";
    } else if (viewType === "grid") {
      window.location.href = "strategy-providers-grid.html";
    }
  });

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
});

function getRandomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function formatWithCommas(number) {
  internationalNumberFormat = new Intl.NumberFormat("en-US");
  return internationalNumberFormat.format(number);
}
