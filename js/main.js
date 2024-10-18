const apiKey = '796af28caa3c79132d85d04210976a50';
let unit = 'metric';  // Default to Celsius

// Add event listener to update the unit when the toggle is changed
document.querySelectorAll('input[name="unit"]').forEach(input => {
    input.addEventListener('change', (event) => {
        unit = event.target.value;
        const city = document.getElementById('city-input').value.trim();
        if (city) {
            fetchCurrentWeather(city, unit);  // Pass the unit as a parameter
            fetchFiveDayForecast(city, unit);  // Pass the unit as a parameter
        }
    });
});

document.getElementById('search-btn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value.trim();
    if (city === '') {
        alert('Please enter a city name.');
        return;
    }
    fetchCurrentWeather(city, unit);  // Pass the unit as a parameter
    fetchFiveDayForecast(city, unit);  // Pass the unit as a parameter
});

// Function to fetch current weather data
async function fetchCurrentWeather(city, unit) {  // Accept the unit as a parameter
    try {
        showSpinner();
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`
        );
        hideSpinner();
        if (!response.ok) {
            throw new Error('City not found.');
        }
        const data = await response.json();
        displayCurrentWeather(data, unit);  // Pass the unit to the display function
    } catch (error) {
        alert(error.message);
    }
}

// Function to display current weather data
function displayCurrentWeather(data, unit) {  // Accept the unit as a parameter
    const tempUnit = unit === 'metric' ? '°C' : '°F';
    const weatherDetails = document.getElementById('weather-details');
    weatherDetails.innerHTML = `
        <div class="weather-info">
            <h2>${data.name}, ${data.sys.country}</h2>
            <p>${data.weather[0].description}</p>
            <p>Temperature: ${data.main.temp} ${tempUnit}</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Wind Speed: ${data.wind.speed} m/s</p>
        </div>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
    `;

    // Change the background image based on weather condition
    const weatherCondition = data.weather[0].main.toLowerCase();
    changeBackgroundImage(weatherCondition);
}

// Function to change the background image
function changeBackgroundImage(condition) {
    let backgroundImage = '';

    switch (condition) {
        case 'clear':
            backgroundImage = 'url("assets/images/sunny.png")';
            break;
        case 'clouds':
            backgroundImage = 'url("assets/images/cloudy.png")';
            break;
        case 'rain':
            backgroundImage = 'url("assets/images/rainy.png")';
            break;
        case 'snow':
            backgroundImage = 'url("assets/images/snow.png")';
            break;
        case 'wind':
            backgroundImage = 'url("assets/images/windy.png")';
            break;
        default:
            backgroundImage = 'url("assets/images/default.png")'; // Default background
            break;
    }

    document.body.style.backgroundImage = backgroundImage;
}

// Spinner functions
function showSpinner() {
    document.getElementById('spinner').classList.remove('hidden');
}

function hideSpinner() {
    document.getElementById('spinner').classList.add('hidden');
}
