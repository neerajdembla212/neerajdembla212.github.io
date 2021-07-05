$(function () {
  function plotLineChart(lineChartCanvas) {
    lineChartCanvas.height = 50;
    const ctx = lineChartCanvas.getContext("2d");
    var gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(241, 235, 255, 1)");
    gradient.addColorStop(1, "rgba(182, 163, 229, 1)");

    const labels = ["", "", "", "", "", "", "", "", ""];
    const data = {
      labels: labels,
      datasets: [
        {
          label: "",
          backgroundColor: gradient,
          borderColor: "#501EC6",
          pointBackgroundColor: gradient,
          pointBorderColor: gradient,
          gradient: gradient,
          data: [0, 13, 12, 20, 19, 17, 15, 11, 18],
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
      },
    };

    new Chart(ctx, config);
  }
  function plotAllLineCharts() {
      const canvasArray = document.querySelectorAll('.contact-box .lineChart');
      canvasArray.forEach(canvas => {
          plotLineChart(canvas);
      })
  }
  plotAllLineCharts();
});
