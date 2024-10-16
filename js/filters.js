// Assuming allForecastData is already populated with forecast data.
document.getElementById('sort-asc').addEventListener('click', () => {
    const sortedData = [...allForecastData].sort((a, b) => a.avgTemp - b.avgTemp);
    populateForecastTable(sortedData);
    updatePaginationControls();
});

document.getElementById('sort-desc').addEventListener('click', () => {
    const sortedData = [...allForecastData].sort((a, b) => b.avgTemp - a.avgTemp);
    populateForecastTable(sortedData);
    updatePaginationControls();
});

document.getElementById('filter-rain').addEventListener('click', () => {
    const rainyDays = allForecastData.filter(item => item.weather.toLowerCase().includes('rain'));
    populateForecastTable(rainyDays);
    updatePaginationControls();
});

document.getElementById('show-all').addEventListener('click', () => {
    populateForecastTable(allForecastData);
    updatePaginationControls();
});

document.getElementById('show-highest-temp').addEventListener('click', () => {
    const highestTempDay = allForecastData.reduce((max, item) => (parseFloat(item.avgTemp) > parseFloat(max.avgTemp)) ? item : max, allForecastData[0]);
    populateForecastTable([highestTempDay]); // Showing only the day with the highest temp
    updatePaginationControls();
});
