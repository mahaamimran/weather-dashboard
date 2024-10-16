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

// Function to fetch current weather data
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

// Function to display current weather data
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

// Function to display current weather data and change background
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
            backgroundImage = 'url("assets/images/default.png")'; // Use a default background if condition doesn't match
            break;
    }

    document.body.style.backgroundImage = backgroundImage;
}


// Function to manage the spinner visibility
function showSpinner() {
    document.getElementById('spinner').classList.remove('hidden');
}

function hideSpinner() {
    document.getElementById('spinner').classList.add('hidden');
}

document.getElementById('hamburger').addEventListener('click', function () {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden'); // Toggle the sidebar's hidden class
});
