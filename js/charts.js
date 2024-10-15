// js/charts.js

let barChart;

function initializeCharts(forecastData) {
    const dates = forecastData.map(item => item.date);
    const temperatures = forecastData.map(item => item.avgTemp);

    const ctx = document.getElementById('barChart').getContext('2d');

    if (barChart) {
        barChart.destroy();
    }

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Average Temperature (°C)',
                data: temperatures,
                backgroundColor: 'rgba(52, 152, 219, 0.6)',
                borderColor: 'rgba(41, 128, 185, 1)',
                borderWidth: 1
            }]
        },
        options: {
            animation: {
                delay: 500
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Initialize other charts
    initializeDoughnutChart(forecastData);
    initializeLineChart(forecastData);
}
// js/charts.js (continued)

let doughnutChart;

function initializeDoughnutChart(forecastData) {
    // Calculate weather condition percentages
    const conditionCounts = forecastData.reduce((acc, curr) => {
        acc[curr.weather] = acc[curr.weather] ? acc[curr.weather] + 1 : 1;
        return acc;
    }, {});

    const conditions = Object.keys(conditionCounts);
    const counts = Object.values(conditionCounts);
    const total = counts.reduce((a, b) => a + b, 0);
    const percentages = counts.map(count => ((count / total) * 100).toFixed(2));

    const ctx = document.getElementById('doughnutChart').getContext('2d');

    if (doughnutChart) {
        doughnutChart.destroy();
    }

    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: conditions,
            datasets: [{
                data: percentages,
                backgroundColor: [
                    '#e74c3c',
                    '#2ecc71',
                    '#f1c40f',
                    '#9b59b6',
                    '#3498db',
                    '#95a5a6'
                ],
                borderWidth: 1
            }]
        },
        options: {
            animation: {
                delay: 500
            }
        }
    });
}
// js/charts.js (continued)

let lineChart;

function initializeLineChart(forecastData) {
    const dates = forecastData.map(item => item.date);
    const temperatures = forecastData.map(item => item.avgTemp);

    const ctx = document.getElementById('lineChart').getContext('2d');

    if (lineChart) {
        lineChart.destroy();
    }

    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Average Temperature (°C)',
                data: temperatures,
                fill: false,
                borderColor: '#e67e22',
                tension: 0.1
            }]
        },
        options: {
            animation: {
                duration: 1000,
                easing: 'easeOutBounce'
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
