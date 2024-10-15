// js/main.js

const apiKey = '796af28caa3c79132d85d04210976a50';

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
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
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

    // Change background based on weather condition
    changeBackground(data.weather[0].main);
}

function changeBackground(condition) {
    const weatherDetails = document.getElementById('weather-details');
    switch (condition.toLowerCase()) {
        case 'clear':
            weatherDetails.style.backgroundImage = "url('assets/images/clear.jpg')";
            break;
        case 'clouds':
            weatherDetails.style.backgroundImage = "url('assets/images/cloudy.jpg')";
            break;
        case 'rain':
            weatherDetails.style.backgroundImage = "url('assets/images/rainy.jpg')";
            break;
        case 'snow':
            weatherDetails.style.backgroundImage = "url('assets/images/snowy.jpg')";
            break;
        // Add more cases as needed
        default:
            weatherDetails.style.backgroundImage = "url('assets/images/default.jpg')";
    }
    weatherDetails.style.backgroundSize = 'cover';
    weatherDetails.style.color = '#fff';
}
// js/main.js (continued)

async function fetchFiveDayForecast(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) {
            throw new Error('Failed to fetch 5-day forecast.');
        }
        const data = await response.json();
        processFiveDayForecast(data);
    } catch (error) {
        console.error(error);
    }
}

function processFiveDayForecast(data) {
    // Extract daily forecasts
    const dailyData = {};

    data.list.forEach(entry => {
        const date = entry.dt_txt.split(' ')[0];
        if (!dailyData[date]) {
            dailyData[date] = {
                temp: [],
                weather: []
            };
        }
        dailyData[date].push(entry.main.temp);
        dailyData[date].push(entry.weather[0].main);
    });

    // Simplify data: average temperature and most frequent weather condition
    const simplifiedData = Object.keys(dailyData).map(date => {
        const temps = dailyData[date].filter(item => typeof item === 'number');
        const weathers = dailyData[date].filter(item => typeof item === 'string');
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

    // Pass the simplified data to charts and tables
    initializeCharts(simplifiedData);
    populateForecastTable(simplifiedData);
}
// js/main.js (continued)

let currentPage = 1;
const entriesPerPage = 10;
let allForecastData = [];

function processFiveDayForecast(data) {
    // Previous processing...
    allForecastData = simplifiedData;
    initializeCharts(simplifiedData);
    populateForecastTable(simplifiedData);
}

function populateForecastTable(data) {
    const tableBody = document.querySelector('#forecast-table tbody');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.avgTemp} °C</td>
            <td>${item.weather}</td>
        `;
        tableBody.appendChild(row);
    });

    updatePaginationControls();
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
// js/main.js (continued)

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
