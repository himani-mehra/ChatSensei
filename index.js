let responseList = [];

const tooltipEl = document.querySelector(".tooltip");
const inputEl = document.getElementById("input");
const getQueryButton = document.getElementById("getQuery");
const historySection = document.getElementById("history");

function revertQuery() {
  inputEl.value = "";
}
// Delay function to simulate streaming
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Copy to clipboard function
function copyToClipboard() {
  navigator.clipboard.writeText(inputEl.value).then(() => {
    tooltipEl.textContent = "Copied!";
    setTimeout(() => {
      tooltipEl.textContent = "Copy text";
    }, 2000);
  });
}

// Main function to handle query submission
getQueryButton.addEventListener("click", async () => {
  const userInput = inputEl.value.trim();
  if (!userInput) {
    document.getElementById("output").textContent = "Please enter a query.";
    return;
  }

  // Add user query to history
  const historyItem = document.createElement('div');
  historyItem.classList.add('user-message');
  historyItem.textContent = userInput;
  historySection.appendChild(historyItem);

  // Clear input
  inputEl.value = "";

  // Create container for streamed output
  const outputContainer = document.createElement("div");
  outputContainer.classList.add("output-container");
  document.getElementById("output").insertBefore(outputContainer, document.getElementById("output").firstChild);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer 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",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: userInput }],
        model: "llama3-8b-8192",
        temperature: 1,
        top_p: 1,
        max_tokens: 100,
        stream: true,
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let buffer = '';

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;

      if (value) {
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonString = line.slice(6);
            if (jsonString === "[DONE]") continue;

            try {
              const parsedChunk = JSON.parse(jsonString);
              const content = parsedChunk?.choices?.[0]?.delta?.content;
              if (content) {
                outputContainer.innerHTML += content;
                await delay(50);
              }
            } catch (error) {
              console.error("JSON parse error:", error);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("output").textContent = "Error fetching data.";
  }
});

// Toggle history section visibility
const toggleHistoryButton = document.createElement('button');
toggleHistoryButton.textContent = "Toggle History";
toggleHistoryButton.classList.add("toggle-history");

const wrapper = document.querySelector('.container-wrapper') || document.body;
wrapper.insertBefore(toggleHistoryButton, document.querySelector('.container'));

const leftSection = document.querySelector('.left_section');
leftSection.style.transition = 'all 0.3s ease';

toggleHistoryButton.addEventListener('click', () => {
  leftSection.classList.toggle('closed');
  toggleHistoryButton.textContent = leftSection.classList.contains('closed') ? "Open History" : "Close History";
});
