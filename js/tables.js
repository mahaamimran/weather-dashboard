const apiKey = '796af28caa3c79132d85d04210976a50';
let allForecastData = [];
let currentPage = 1;
const entriesPerPage = 5;

// Event listener for the search button
document.getElementById('search-btn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value.trim();
    if (city === '') {
        alert('Please enter a city name.');
        return;
    }
    fetchFiveDayForecast(city);
});

// Fetch the 5-day forecast data from OpenWeather API
async function fetchFiveDayForecast(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) {
            throw new Error('City not found.');
        }
        const data = await response.json();
        processForecastData(data);
    } catch (error) {
        alert(error.message);
    }
}

// Process the 5-day forecast data and store it in allForecastData
function processForecastData(data) {
    const forecastData = data.list.map(entry => ({
        date: entry.dt_txt,  // Date and time of forecast
        avgTemp: entry.main.temp.toFixed(2),  // Temperature
        weather: entry.weather[0].description // Weather description
    }));

    allForecastData = forecastData;
    currentPage = 1; // Reset to the first page
    populateForecastTable(allForecastData);  // Render the table with the new forecast data
    updatePaginationControls();
}

// Populate the forecast table with pagination
function populateForecastTable(data) {
    const tableBody = document.getElementById('forecast-body');
    tableBody.innerHTML = ''; // Clear the previous table data

    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const paginatedData = data.slice(start, end);

    // Populate the table with the paginated forecast data
    paginatedData.forEach(item => {
        const row = `<tr>
            <td>${item.date}</td>
            <td>${item.avgTemp} °C</td>
            <td>${item.weather}</td>
        </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
    updatePaginationControls(data);
}

// Update the pagination controls
function updatePaginationControls(data = allForecastData) {
    const totalPages = Math.ceil(data.length / entriesPerPage);
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

// Pagination event listeners
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

// Sort Ascending (by temperature)
document.getElementById('sort-asc').addEventListener('click', () => {
    const sortedData = [...allForecastData].sort((a, b) => a.avgTemp - b.avgTemp);
    currentPage = 1;
    populateForecastTable(sortedData);
    updatePaginationControls(sortedData);
});

// Sort Descending (by temperature)
document.getElementById('sort-desc').addEventListener('click', () => {
    const sortedData = [...allForecastData].sort((a, b) => b.avgTemp - a.avgTemp);
    currentPage = 1;
    populateForecastTable(sortedData);
    updatePaginationControls(sortedData);
});

// Filter by rainy days
document.getElementById('filter-rain').addEventListener('click', () => {
    const rainyDays = allForecastData.filter(item => item.weather.toLowerCase().includes('rain'));
    currentPage = 1;
    populateForecastTable(rainyDays);
    updatePaginationControls(rainyDays);
});

// Show all data
document.getElementById('show-all').addEventListener('click', () => {
    currentPage = 1;
    populateForecastTable(allForecastData);
    updatePaginationControls(allForecastData);
});

// Show only the highest temperature day
document.getElementById('show-highest-temp').addEventListener('click', () => {
    const highestTempDay = allForecastData.reduce((max, item) => (parseFloat(item.avgTemp) > parseFloat(max.avgTemp)) ? item : max, allForecastData[0]);
    currentPage = 1;
    populateForecastTable([highestTempDay]); // Show only the day with the highest temp
    updatePaginationControls([highestTempDay]);
});
