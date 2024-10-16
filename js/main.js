const apiKey = '796af28caa3c79132d85d04210976a50';
let allForecastData = [];
let currentPage = 1;
const entriesPerPage = 5;

document.getElementById('search-btn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value.trim();
    if (city === '') {
        alert('Please enter a city name.');
        return;
    }
    fetchCurrentWeather(city);
    fetchFiveDayForecast(city);
});

async function fetchCurrentWeather(city) {
    try {
        showSpinner();
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        hideSpinner();
        if (!response.ok) {
            throw new Error('City not found.');
        }
        const data = await response.json();
        displayCurrentWeather(data);
    } catch (error) {
        alert(error.message);
    }
}

function displayCurrentWeather(data) {
    const weatherDetails = document.getElementById('weather-details');
    weatherDetails.innerHTML = `
        <div class="weather-info">
            <h2>${data.name}, ${data.sys.country}</h2>
            <p>${data.weather[0].description}</p>
            <p>Temperature: ${data.main.temp} °C</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Wind Speed: ${data.wind.speed} m/s</p>
        </div>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
    `;

    changeBackground(data.weather[0].main);
}


function changeBackground(condition) {
    const weatherDetails = document.getElementById('weather-details');
    let backgroundImage;

    switch (condition.toLowerCase()) {
        case 'clear':
            backgroundImage = "url('https://source.unsplash.com/1600x900/?clear-sky')";
            break;
        case 'clouds':
            backgroundImage = "url('https://source.unsplash.com/1600x900/?cloudy')";
            break;
        case 'rain':
            backgroundImage = "url('https://source.unsplash.com/1600x900/?rain')";
            break;
        case 'snow':
            backgroundImage = "url('https://source.unsplash.com/1600x900/?snow')";
            break;
        default:
            backgroundImage = "url('https://via.placeholder.com/1600x900?text=No+Image+Available')";
    }

    weatherDetails.style.backgroundImage = backgroundImage;
    weatherDetails.style.backgroundSize = 'cover';
    weatherDetails.style.color = '#fff';
}



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

function updatePaginationControls() {
    const totalPages = Math.ceil(allForecastData.length / entriesPerPage);
    document.getElementById('current-page').textContent = `${currentPage} / ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

// Pagination Event Listeners
document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        populateForecastTable(allForecastData);
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(allForecastData.length / entriesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        populateForecastTable(allForecastData);
    }
});

// Debounce the input for city search
let debounceTimer;
document.getElementById('city-input').addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const city = document.getElementById('city-input').value.trim();
        if (city !== '') {
            fetchCurrentWeather(city);
            fetchFiveDayForecast(city);
        }
    }, 500); // Adjust debounce delay as needed
});

function showSpinner() {
    document.getElementById('spinner').classList.remove('hidden');
}

function hideSpinner() {
    document.getElementById('spinner').classList.add('hidden');
}
