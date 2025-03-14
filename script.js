let API_KEY = ''; // Will be loaded from api.key file

const content = document.getElementById('content');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');

let isAnswerLoading = false;
let answerSectionId = 0;

// Disable send button until API key is loaded
sendButton.classList.add('send-button-nonactive');

// Load API key from file
fetch('api.key')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load API key');
        }
        return response.text();
    })
    .then(key => {
        API_KEY = key.trim();
        // Enable the send button once API key is loaded
        sendButton.classList.remove('send-button-nonactive');
        console.log('API key loaded successfully');
    })
    .catch(error => {
        console.error('Error loading API key:', error);
        // Display error message in chat
        const errorSection = document.createElement('section');
        errorSection.className = 'answer-section';
        errorSection.textContent = 'Error: Could not load API key. Please check the api.key file exists.';
        content.appendChild(errorSection);
    });

sendButton.addEventListener('click', () => handleSendMessage());
chatInput.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        handleSendMessage();
    }
})

function handleSendMessage() {
    // Get the user input and remove leading/tariling space
    const question = chatInput.value.trim();

    // Prevent sending empty message
    if (question === '' || isAnswerLoading) return;

    // Disable UI send button
    sendButton.classList.add('send-button-nonactive');

    addQuestionSection(question);
    chatInput.value = '';
}

function getAnswer(question) {
    const fetchData =
        fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "deepseek/deepseek-r1-distill-llama-70b:free",
                "messages": [
                    {
                        "role": "user",
                        "content": question
                    }
                ]
            })
        });

    fetchData.then(response => response.json())
        .then(data => {
            // Get response message
            const resultData = data.choices[0].message.content;
            // Mark as no longer loading
            isAnswerLoading = false;
            addAnswerSection(resultData);
        }).finally(() => {
            scrollToBottom();
            sendButton.classList.remove('send-button-nonactive');
        })
}

function addQuestionSection(message) {
    isAnswerLoading = true;
    // Create section element
    const sectionElement = document.createElement('section');
    sectionElement.className = 'question-section';
    sectionElement.textContent = message;

    content.appendChild(sectionElement);
    // Add answer section after added quesion section
    addAnswerSection(message)
    scrollToBottom();
}

function addAnswerSection(message) {
    if (isAnswerLoading) {
        // Increment answer section ID for tracking
        answerSectionId++;
        // Create and empty answer section with a loading animation
        const sectionElement = document.createElement('section');
        sectionElement.className = 'answer-section';
        sectionElement.innerHTML = getLoadingSvg();
        sectionElement.id = answerSectionId;

        content.appendChild(sectionElement);
        getAnswer(message);
    } else {
        // Fill in the answer once it's received
        const answerSectionElement = document.getElementById(answerSectionId);
        // Remove bold syntax from the bot's response
        answerSectionElement.textContent = removeBoldSyntax(message);
    }
}

// Function to remove markdown bold syntax from text
function removeBoldSyntax(text) {
    if (!text) return '';
    // Replace **text** with just text (remove the asterisks)
    return text.replace(/\*\*(.*?)\*\*/g, '$1');
}

function getLoadingSvg() {
    return '<svg style="height: 25px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle fill="#4F6BFE" stroke="#4F6BFE" stroke-width="15" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#4F6BFE" stroke="#4F6BFE" stroke-width="15" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#4F6BFE" stroke="#4F6BFE" stroke-width="15" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>';
}

function scrollToBottom() {
    content.scrollTo({
        top: content.scrollHeight,
        behavior: 'smooth'
    });
}