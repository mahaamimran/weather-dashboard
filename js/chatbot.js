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
        handleGeneralQuery(message);  // Handles non-weather queries
    }
}

function displayMessage(message, sender) {
    const chatBody = document.getElementById('chat-body');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    // Add some emoji flair to user messages
    if (sender === 'user') {
        messageDiv.textContent = `🙋‍♂️ ${message}`;
    } else {
        messageDiv.textContent = message;
    }
    
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
    const city = extractCityFromMessage(message);
    if (!city) {
        removeTypingIndicator();
        displayMessage("🌍 Please specify a city name for the weather information.", 'bot');
        return;
    }

    try {
        const weatherData = await fetchWeatherData(city);
        const response = formatWeatherResponse(weatherData);
        removeTypingIndicator();
        displayMessage(response, 'bot');
    } catch (error) {
        removeTypingIndicator();
        displayMessage(`❌ Sorry, I couldn't find the weather for that city.`, 'bot');
    }
}

function extractCityFromMessage(message) {
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
    return `🌤️ Current weather in ${data.name}: ${data.weather[0].description}, 🌡️ Temp: ${data.main.temp}°C, 💧 Humidity: ${data.main.humidity}%, 🌬️ Wind: ${data.wind.speed} m/s.`;
}

async function handleGeneralQuery(message) {
    const lowerMessage = message.toLowerCase();

    let response;
    
    // Handle common non-weather queries
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        response = "👋 Hi there! How can I assist you today?";
    } else if (lowerMessage.includes('how are you')) {
        response = "😊 I'm just a bot, but thanks for asking! How about you?";
    } else if (lowerMessage.includes('joke')) {
        response = "😂 Why don't scientists trust atoms? Because they make up everything!";
    } else if (lowerMessage.includes('time')) {
        const currentTime = new Date().toLocaleTimeString();
        response = `🕒 The current time is ${currentTime}.`;
    } else if (lowerMessage.includes('date')) {
        const currentDate = new Date().toLocaleDateString();
        response = `📅 Today's date is ${currentDate}.`;
    } else {
        // If it's an unknown question, use a mock response to avoid API error.
        response = "🤖 I'm sorry, I couldn't find an answer for that right now. How about asking me a weather question or something else fun?";
    }
    
    removeTypingIndicator();
    displayMessage(`🤖 ${response}`, 'bot');
}
