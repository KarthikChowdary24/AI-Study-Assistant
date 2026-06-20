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

    // Auto Scroll
    chatBox.scrollTop = chatBox.scrollHeight;

    // Thinking Animation
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

        // Remove Thinking Message
        document.getElementById("typing").remove();

        // Bot Response
        chatBox.innerHTML += `
            <div class="bot-message">
                ${data.response}
            </div>
        `;

        chatBox.scrollTop = chatBox.scrollHeight;

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

// Send Message on Enter Key
document.getElementById("user-input")
.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        sendMessage();
    }

});