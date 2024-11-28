const keywordApiUrl = "https://api.datamuse.com/words?ml="; // Example API for related words
const sentimentApiUrl = "https://api.textgears.com/sentiment?text="; // Example sentiment API
const sentimentApiKey = "YOUR_TEXTGEARS_API_KEY";

document.getElementById("analyzeButton").addEventListener("click", analyzeTitle);

async function analyzeTitle() {
  const title = document.getElementById("titleInput").value.trim();
  const resultDiv = document.getElementById("result");
  resultDiv.style.display = "none";

  if (!title) {
    alert("Please enter a title to analyze.");
    return;
  }

  // Local Analysis
  const titleLength = title.length;
  const titleWords = title.toLowerCase().split(/\s+/);
  const lengthFeedback = titleLength <= 60 ? "Good length!" : "Too long, consider shortening.";

  // Keyword Suggestions
  const keywordSuggestions = await fetchKeywordSuggestions(titleWords);

  // Sentiment Analysis
  const sentiment = await fetchSentimentAnalysis(title);

  // Generate Suggestions
  const suggestions = [];
  if (titleLength > 60) suggestions.push("Shorten the title to 50-60 characters.");
  if (sentiment.score < 0.5) suggestions.push("Consider using more positive language.");

  // Display Results
  resultDiv.style.display = "block";
  document.getElementById("titleLength").textContent = `${titleLength} characters - ${lengthFeedback}`;
  document.getElementById("keywordScore").textContent = keywordSuggestions.length;
  document.getElementById("clickbaitWarning").textContent =
    sentiment.positive ? "Positive sentiment detected." : "Title could appear negative.";
  document.getElementById("suggestions").innerHTML = suggestions
    .map((s) => `<li>${s}</li>`)
    .join("");
}

// Fetch related keywords from API
async function fetchKeywordSuggestions(words) {
  try {
    const promises = words.map((word) => fetch(`${keywordApiUrl}${word}`));
    const responses = await Promise.all(promises);
    const keywords = await Promise.all(responses.map((res) => res.json()));
    return keywords.flat().slice(0, 10).map((k) => k.word); // First 10 keywords
  } catch (error) {
    console.error("Error fetching keyword suggestions:", error);
    return [];
  }
}

// Fetch sentiment analysis from API
async function fetchSentimentAnalysis(title) {
  try {
    const response = await fetch(`${sentimentApiUrl}${encodeURIComponent(title)}&key=${sentimentApiKey}`);
    const data = await response.json();
    return { positive: data.response.positive, score: data.response.score };
  } catch (error) {
    console.error("Error fetching sentiment analysis:", error);
    return { positive: false, score: 0 };
  }
}
