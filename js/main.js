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
function populateForecastTable(data) {
    const tableBody = document.querySelector('#forecast-container');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * entriesPerPage; // Calculate the start index
    const end = start + entriesPerPage; // Calculate the end index
    const paginatedData = data.slice(start, end); // Slice the data for the current page

    paginatedData.forEach(item => {
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item-container');
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
        currentPage--;  // Decrement currentPage
        populateForecastTable(allForecastData);  // Re-render the forecast table
        updatePaginationControls();  // Update the pagination controls
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(allForecastData.length / entriesPerPage);
    if (currentPage < totalPages) {
        currentPage++;  // Increment currentPage
        populateForecastTable(allForecastData);  // Re-render the forecast table
        updatePaginationControls();  // Update the pagination controls
    }
});


function showSpinner() {
    document.getElementById('spinner').classList.remove('hidden');
}

function hideSpinner() {
    document.getElementById('spinner').classList.add('hidden');
}
