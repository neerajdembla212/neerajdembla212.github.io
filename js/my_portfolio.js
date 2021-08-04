(() => {
    // document ready function
    $(function () {
        const linechartCanvas = document.getElementById("line-chart");


        const data = [{
            time: "9:20",
            data: 0
        }, {
            time: "9:21",
            data: -13
        },
        {
            time: "9:22",
            data: 0
        },
        {
            time: "9:22",
            data: 16
        }, {
            time: "9:22",
            data: 20
        },
        {
            time: "9:22",
            data: 18
        }, {
            time: "9:22",
            data: 30
        },
        {
            time: "9:22",
            data: 26
        },
        {
            time: "9:22",
            data: 28
        },
        {
            time: "9:22",
            data: 40
        },
        {
            time: "9:22",
            data: 32
        },
        {
            time: "9:22",
            data: 37
        },
        {
            time: "9:22",
            data: 25
        }]
        plotLineChart(linechartCanvas, data)
    })

    // Plot Line chart 
    function plotLineChart(lineChartCanvas, lineData) {
        if (!lineData || !Array.isArray(lineData)) {
            return;
        }
        const lineDataPoints = lineData.reduce((acc, curr) => {
            acc.push(curr.data);
            return acc;
        }, []);
        const positiveLineDataPoints = lineDataPoints.filter(d => d > 0)
        lineChartCanvas.height = 300;
        const ctx = lineChartCanvas.getContext("2d");
        var positiveGradient = ctx.createLinearGradient(
            0,
            0,
            0,
            Math.max(...positiveLineDataPoints)
        );
        const borderColor = "#22D091";
        const negativeBorderColor = "#C00000"
        // positiveGradient.addColorStop(0, "rgba(34, 208, 145, 0)");
        // positiveGradient.addColorStop(0.2, "rgba(34, 208, 145, 0.5)");


        const labels = lineData.map(d => d.time);

        const datasetNeg25 = lineData.filter(d => d.data <= 0 && d.data >= -25
        )

        const negative25LinePoints = datasetNeg25.reduce((acc, curr) => {
            acc.push(curr.data);
            return acc;
        }, []);

        const data = {
            labels: labels,
            datasets: [
                {
                    label: "",
                    backgroundColor: positiveGradient,
                    borderColor: negativeBorderColor,
                    pointBackgroundColor: negativeBorderColor,
                    pointBorderColor: negativeBorderColor,
                    gradient: positiveGradient,
                    data: negative25LinePoints,
                    cubicInterpolationMode: 'monotone',
                    tension: 0.1
                },
                {
                    label: "",
                    backgroundColor: positiveGradient,
                    borderColor: borderColor,
                    pointBackgroundColor: borderColor,
                    pointBorderColor: borderColor,
                    gradient: positiveGradient,
                    data: lineDataPoints,
                    cubicInterpolationMode: 'monotone',
                    tension: 0.1
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
                                display: true,
                                tickMarkLength: 0,
                            },
                            ticks: {
                                display: true,
                                tickMarkLength: 0,
                                maxTicksLimit: 4,
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
                        bottom: 0,
                        left: 10,
                    },
                },
            },
        };
        new Chart(ctx, config);
    }
})();