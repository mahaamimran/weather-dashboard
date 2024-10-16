const geminiApiKey = 'AIzaSyCpXzI_slJ75hxey2PhYtIaD_Oa4y-PQIA';

document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (message === '') return;

    displayMessage(message, 'user');
    input.value = '';

    // Show typing indicator
    displayTypingIndicator();

    // Determine if the query is weather-related
    if (isWeatherQuery(message)) {
        handleWeatherQuery(message);
    } else {
        handleGeneralQuery(message);
    }
}

function displayMessage(message, sender) {
    const chatBody = document.getElementById('chat-body');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.textContent = message;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function displayTypingIndicator() {
    const chatBody = document.getElementById('chat-body');
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.classList.add('typing-indicator');
    typingIndicator.textContent = 'Gemini is typing...';
    chatBody.appendChild(typingIndicator);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) typingIndicator.remove();
}

function isWeatherQuery(message) {
    const weatherKeywords = ['weather', 'temperature', 'forecast', 'rain', 'sunny', 'cloudy', 'wind', 'humidity'];
    return weatherKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

async function handleWeatherQuery(message) {
    // Extract city name from the message
    const city = extractCityFromMessage(message);
    if (!city) {
        removeTypingIndicator();
        displayMessage("Please specify a city name for the weather information.", 'bot');
        return;
    }

    try {
        const weatherData = await fetchWeatherData(city);
        const response = formatWeatherResponse(weatherData);
        removeTypingIndicator();
        displayMessage(response, 'bot');
    } catch (error) {
        removeTypingIndicator();
        displayMessage(error.message, 'bot');
    }
}

function extractCityFromMessage(message) {
    // Simple extraction logic (can be enhanced with NLP)
    const words = message.split(' ');
    const cityIndex = words.findIndex(word => ['in', 'for'].includes(word.toLowerCase()));
    if (cityIndex !== -1 && words.length > cityIndex + 1) {
        return words.slice(cityIndex + 1).join(' ');
    }
    return null;
}

async function fetchWeatherData(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) {
            throw new Error('Unable to fetch weather data for the specified city.');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

function formatWeatherResponse(data) {
    return `Current weather in ${data.name}: ${data.weather[0].description}, Temperature: ${data.main.temp}°C, Humidity: ${data.main.humidity}%, Wind Speed: ${data.wind.speed} m/s.`;
}

async function handleGeneralQuery(message) {
    try {
        const response = await fetchGeminiResponse(message);
        removeTypingIndicator();
        displayMessage(response, 'bot');
    } catch (error) {
        removeTypingIndicator();
        displayMessage("I'm sorry, I couldn't process your request.", 'bot');
    }
}

async function fetchGeminiResponse(message) {
    try {
        const response = await fetch('https://gemini-api-endpoint.com/query', { // Replace with actual Gemini API endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${geminiApiKey}`
            },
            body: JSON.stringify({ query: message })
        });

        if (!response.ok) {
            throw new Error('Gemini API error.');
        }

        const data = await response.json();
        return data.reply; // Adjust based on Gemini API response structure
    } catch (error) {
        console.error(error);
        throw error;
    }
}
