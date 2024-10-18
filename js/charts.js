async function fetchFiveDayForecast(city, unit = 'metric') {
    const apiKey = '796af28caa3c79132d85d04210976a50';
    const unitLabel = unit === 'metric' ? '°C' : '°F'; 

    try {
        showSpinner();
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`
        );
        hideSpinner();
        if (!response.ok) {
            throw new Error('Failed to fetch 5-day forecast.');
        }
        const data = await response.json();
        initializeCharts(data, unitLabel);
    } catch (error) {
        console.error(error);
    }
}

function initializeCharts(forecastData, unitLabel) {
    const labels = forecastData.list.map(item => item.dt_txt.split(' ')[0]);

    // Bar Chart (Temperatures for 5 days with delay animation)
    const barCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: `Temperature (${unitLabel})`,
                data: forecastData.list.map(item => item.main.temp),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                duration: 2000, // Duration of animation
                easing: 'easeOutQuart',
                delay: (context) => context.dataIndex * 100, // Delay for each bar
            }
        }
    });

    // Doughnut Chart (Weather conditions with delay animation and fixed aspect ratio)
    const weatherCounts = forecastData.list.reduce((acc, item) => {
        const weather = item.weather[0].main;
        acc[weather] = acc[weather] ? acc[weather] + 1 : 1;
        return acc;
    }, {});
    const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
    new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(weatherCounts),
            datasets: [{
                data: Object.values(weatherCounts),
                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Keep aspect ratio for doughnut chart
            aspectRatio: 1, // Ensure it's round
            animation: {
                duration: 2000, // Duration of animation
                easing: 'easeOutQuart',
                delay: (context) => context.dataIndex * 200, // Delay for each slice
            }
        }
    });

    // Line Chart (Temperature over time with drop animation)
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    new Chart(lineCtx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: `Temperature (${unitLabel})`,
                data: forecastData.list.map(item => item.main.temp),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                duration: 2000, // Duration of animation
                easing: 'easeOutBounce',
                onProgress: function(animation) {
                    // Simulate a drop effect
                    this.chart.data.datasets.forEach((dataset, i) => {
                        dataset.data.forEach((_, j) => {
                            const meta = this.chart.getDatasetMeta(i);
                            meta.data[j].y = meta.data[j].y * animation.easing;
                        });
                    });
                }
            }
        }
    });
}
