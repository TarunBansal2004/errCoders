// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const optionsContainer = document.getElementById('options-container');
const weatherForm = document.getElementById('weather-form');
const cropForm = document.getElementById('crop-form');
const diseaseForm = document.getElementById('disease-form');
const otherForm = document.getElementById('other-form');

// API Endpoint - Update this to your Flask server URL
const API_URL = 'http://localhost:5000';

// Back Buttons
document.getElementById('back-button-weather').addEventListener('click', showOptions);
document.getElementById('back-button-crop').addEventListener('click', showOptions);
document.getElementById('back-button-disease').addEventListener('click', showOptions);
document.getElementById('back-button-other').addEventListener('click', showOptions);

// Option Buttons
document.querySelectorAll('.option-button').forEach(button => {
    button.addEventListener('click', () => {
        const option = button.getAttribute('data-option');
        
        // Hide options
        optionsContainer.classList.add('hidden');
        
        // Show corresponding form
        if (option === '1') {
            weatherForm.classList.remove('hidden');
            addUserMessage('I want to check the weather / मैं मौसम की जानकारी चाहता हूँ');
        } else if (option === '2') {
            cropForm.classList.remove('hidden');
            addUserMessage('I want information about a crop / मुझे फसल के बारे में जानकारी चाहिए');
        } else if (option === '3') {
            diseaseForm.classList.remove('hidden');
            addUserMessage('I need help with a crop disease / मुझे फसल की बीमारी के बारे में मदद चाहिए');
        } else if (option === '4') {
            otherForm.classList.remove('hidden');
            addUserMessage('I have another question / मेरा एक और सवाल है');
        }
    });
});

// Submit Buttons
document.getElementById('weather-submit').addEventListener('click', () => {
    const location = document.getElementById('weather-input').value.trim();
    if (location) {
        addUserMessage(`Weather in / मौसम: ${location}`);
        processWeatherRequest(location);
        document.getElementById('weather-input').value = '';
        showOptions();
    }
});

document.getElementById('crop-submit').addEventListener('click', () => {
    const crop = document.getElementById('crop-input').value.trim();
    if (crop) {
        addUserMessage(`Crop information for / फसल की जानकारी: ${crop}`);
        processCropRequest(crop);
        document.getElementById('crop-input').value = '';
        showOptions();
    }
});

document.getElementById('disease-submit').addEventListener('click', () => {
    const crop = document.getElementById('disease-crop-input').value.trim();
    const symptom = document.getElementById('symptom-input').value.trim();
    if (crop && symptom) {
        addUserMessage(`Disease information for / बीमारी की जानकारी: ${crop} with symptom / लक्षण: ${symptom}`);
        processDiseaseRequest(crop, symptom);
        document.getElementById('disease-crop-input').value = '';
        document.getElementById('symptom-input').value = '';
        showOptions();
    }
});

document.getElementById('other-submit').addEventListener('click', () => {
    const query = document.getElementById('other-input').value.trim();
    if (query) {
        addUserMessage(query);
        processOtherRequest(query);
        document.getElementById('other-input').value = '';
        showOptions();
    }
});

// Input Enter Key Handling
document.getElementById('weather-input').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') document.getElementById('weather-submit').click();
});

document.getElementById('crop-input').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') document.getElementById('crop-submit').click();
});

document.getElementById('symptom-input').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') document.getElementById('disease-submit').click();
});

document.getElementById('other-input').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') document.getElementById('other-submit').click();
});

// Helper Functions
function showOptions() {
    weatherForm.classList.add('hidden');
    cropForm.classList.add('hidden');
    diseaseForm.classList.add('hidden');
    otherForm.classList.add('hidden');
    optionsContainer.classList.remove('hidden');
}

function addUserMessage(text) {
    const message = document.createElement('div');
    message.className = 'message user-message';
    message.textContent = text;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(text) {
    const message = document.createElement('div');
    message.className = 'message bot-message';
    message.innerHTML = text.replace(/\n/g, '<br>');
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addLoadingMessage() {
    const message = document.createElement('div');
    message.className = 'message bot-message loading-message';
    
    const spinner = document.createElement('span');
    spinner.className = 'loading-spinner';
    
    const loadingText = document.createElement('span');
    loadingText.textContent = 'Processing your request... / आपके अनुरोध पर कार्रवाई की जा रही है...';
    
    message.appendChild(spinner);
    message.appendChild(loadingText);
    
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return message;
}

function removeLoadingMessage(loadingMessage) {
    chatMessages.removeChild(loadingMessage);
}

// API Requests
async function processWeatherRequest(location) {
    const loadingMessage = addLoadingMessage();
    
    try {
        const response = await fetch(`${API_URL}/api/weather`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ location }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            removeLoadingMessage(loadingMessage);
            addBotMessage(data.result);
        } else {
            throw new Error(data.error || 'Failed to get weather information');
        }
    } catch (error) {
        removeLoadingMessage(loadingMessage);
        addBotMessage(`Error: ${error.message || 'Could not connect to server'}`);
    }
}

async function processCropRequest(crop) {
    const loadingMessage = addLoadingMessage();
    
    try {
        const response = await fetch(`${API_URL}/api/crop`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ crop }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            removeLoadingMessage(loadingMessage);
            addBotMessage(data.result);
        } else {
            throw new Error(data.error || 'Failed to get crop information');
        }
    } catch (error) {
        removeLoadingMessage(loadingMessage);
        addBotMessage(`Error: ${error.message || 'Could not connect to server'}`);
    }
}

async function processDiseaseRequest(crop, symptom) {
    const loadingMessage = addLoadingMessage();
    
    try {
        const response = await fetch(`${API_URL}/api/disease`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ crop, symptom }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            removeLoadingMessage(loadingMessage);
            addBotMessage(data.result);
        } else {
            throw new Error(data.error || 'Failed to get disease information');
        }
    } catch (error) {
        removeLoadingMessage(loadingMessage);
        addBotMessage(`Error: ${error.message || 'Could not connect to server'}`);
    }
}

async function processOtherRequest(query) {
    const loadingMessage = addLoadingMessage();
    
    try {
        const response = await fetch(`${API_URL}/api/other`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            removeLoadingMessage(loadingMessage);
            addBotMessage(data.result);
        } else {
            throw new Error(data.error || 'Failed to process query');
        }
    } catch (error) {
        removeLoadingMessage(loadingMessage);
        addBotMessage(`Error: ${error.message || 'Could not connect to server'}`);
    }
}