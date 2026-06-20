async function sendMessage() {

    let input = document.getElementById("user-input");
    let message = input.value.trim();

    if (!message) return;

    let chatBox = document.getElementById("chat-box");

    // User Message
    chatBox.innerHTML += `
        <div class="user-message">
            ${message}
        </div>
    `;

    input.value = "";

    chatBox.scrollTop = chatBox.scrollHeight;

    // Thinking
    chatBox.innerHTML += `
        <div class="bot-message" id="typing">
            Thinking...
        </div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;

    try {

        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        document.getElementById("typing").remove();

        chatBox.innerHTML += `
            <div class="bot-message">
                ${data.response}
            </div>
        `;

        chatBox.scrollTop = chatBox.scrollHeight;

        // Refresh sidebar history
        loadHistory();

    } catch (error) {

        document.getElementById("typing").remove();

        chatBox.innerHTML += `
            <div class="bot-message">
                Error connecting to AI service.
            </div>
        `;

        console.error(error);
    }
}

// Enter Key Support
document.getElementById("user-input")
.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        sendMessage();
    }

});

// Load Chat History
async function loadHistory() {

    try {

        const response = await fetch("/history");

        const chats = await response.json();

        const historyList =
            document.getElementById("history-list");

        historyList.innerHTML = "";

        chats.forEach(chat => {

            let text = chat.user;

            if (text.length > 25) {
                text = text.substring(0, 25) + "...";
            }

           historyList.innerHTML += `
    <div
        class="history-item"
        onclick="loadChat(${chat.id})"
    >
        ${text}
    </div>
`;

        });

    } catch (error) {

        console.error(
            "History Load Error:",
            error
        );

    }
}

// New Chat Button
document
.querySelector(".new-chat-btn")
.addEventListener("click", () => {

    document.getElementById("chat-box").innerHTML = `
        <div class="bot-message">
            👋 New Chat Started. Ask me anything!
        </div>
    `;

});

// Load history on page startup
window.onload = () => {
    loadHistory();
};
function generateNotes() {
    document.getElementById("user-input").value =
    "Generate detailed engineering exam notes on ";
}

function generateMCQs() {
    document.getElementById("user-input").value =
    "Generate 20 MCQs with answers on ";
}

function generateQuestions() {
    document.getElementById("user-input").value =
    "Generate important 8-mark questions on ";
}

function studyPlan() {
    document.getElementById("user-input").value =
    "Create a study plan for ";
}
async function loadChat(chatId) {

    try {

        const response =
            await fetch(`/chat/${chatId}`);

        const data =
            await response.json();

        const chatBox =
            document.getElementById("chat-box");

        chatBox.innerHTML = `
            <div class="user-message">
                ${data.user}
            </div>

            <div class="bot-message">
                ${data.bot}
            </div>
        `;

    } catch (error) {

        console.error(error);

    }
}
async function uploadPDF() {

    const input =
        document.getElementById("pdf-upload");

    input.click();

    input.onchange = async () => {

        const file = input.files[0];

        if (!file) return;

        const formData = new FormData();

        formData.append(
            "pdf",
            file
        );

        try {

            const response =
                await fetch(
                    "/upload-pdf",
                    {
                        method: "POST",
                        body: formData
                    }
                );

            const data =
                await response.json();

            const chatBox =
                document.getElementById(
                    "chat-box"
                );

            chatBox.innerHTML += `
                <div class="bot-message">
                    📄 ${file.name}
                    uploaded successfully.
                </div>
            `;

        } catch (error) {

            console.error(error);

        }

    };

}