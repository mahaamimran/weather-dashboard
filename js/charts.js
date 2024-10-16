

async function fetchFiveDayForecast(city) {
    try {
        showSpinner();
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        hideSpinner();
        if (!response.ok) {
            throw new Error('Failed to fetch 5-day forecast.');
        }
        const data = await response.json();
        processFiveDayForecast(data);
        initializeCharts(data);
    } catch (error) {
        console.error(error);
    }
}

function processFiveDayForecast(data) {
    const dailyData = {};
    data.list.forEach(entry => {
        const date = entry.dt_txt.split(' ')[0];
        if (!dailyData[date]) {
            dailyData[date] = {
                temp: [],
                weather: []
            };
        }
        dailyData[date].temp.push(entry.main.temp);
        dailyData[date].weather.push(entry.weather[0].main);
    });

    const simplifiedData = Object.keys(dailyData).map(date => {
        const temps = dailyData[date].temp;
        const weathers = dailyData[date].weather;
        const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2);
        const weatherCounts = weathers.reduce((acc, curr) => {
            acc[curr] = acc[curr] ? acc[curr] + 1 : 1;
            return acc;
        }, {});
        const mostFrequentWeather = Object.keys(weatherCounts).reduce((a, b) => weatherCounts[a] > weatherCounts[b] ? a : b);
        return {
            date,
            avgTemp,
            weather: mostFrequentWeather
        };
    });

    allForecastData = simplifiedData;
    populateForecastTable(allForecastData);
    updatePaginationControls();
}

function initializeCharts(forecastData) {
    const labels = forecastData.list.map(item => item.dt_txt.split(' ')[0]);

    // Bar Chart (Temperatures for 5 days)
    const barCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: forecastData.list.map(item => item.main.temp),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        }
    });

    // Doughnut Chart (Weather conditions)
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
        }
    });

    // Line Chart (Temperature over time)
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    new Chart(lineCtx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: forecastData.list.map(item => item.main.temp),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                fill: false
            }]
        }
    });
}

function populateForecastTable(data) {
    const tableBody = document.querySelector('#forecast-container');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach(item => {
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <h3>${item.date}</h3>
            <p>Temp: ${item.avgTemp} °C</p>
            <p>${item.weather}</p>
        `;
        tableBody.appendChild(forecastItem);
    });
}
