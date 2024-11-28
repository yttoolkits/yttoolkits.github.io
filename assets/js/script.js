const keywordApiUrl = "https://api.datamuse.com/words?ml="; // API for related words
const clickbaitKeywords = ["click now", "don't miss", "amazing", "shocking", "unbelievable", "mind-blowing"];

document.getElementById("analyzeButton").addEventListener("click", analyzeTitle);

async function analyzeTitle() {
  const title = document.getElementById("titleInput").value.trim();
  const resultDiv = document.getElementById("result");
  resultDiv.style.display = "none";

  // Validate input: Title must have at least 3 words and a reasonable length
  if (!title || title.split(/\s+/).length < 3) {
    alert("Please enter a title with at least 3 words to analyze.");
    return;
  }

  if (title.length < 10) {
    alert("Title is too short. Please provide a title with at least 10 characters.");
    return;
  }
  if (title.length > 100) {
    alert("Title is too long. Consider shortening it to under 100 characters.");
    return;
  }

  showLoadingIndicator(resultDiv); // Show loading indicator

  try {
    // 1. Title Length Analysis
    const titleLength = title.length;
    const titleWords = title.toLowerCase().split(/\s+/);
    const lengthFeedback = titleLength <= 60 ? "Good length!" : "Consider shortening to improve readability.";

    // 2. Keyword Density Check
    const keywordSuggestions = await fetchKeywordSuggestions(titleWords);

    // 3. Sentiment Analysis
    const sentiment = await fetchSentimentAnalysis(title);

    // 4. Clickbait Warning
    const clickbaitDetected = checkForClickbait(title);

    // 5. Generate Suggestions
    const suggestions = [];
    if (titleLength > 60) suggestions.push("Shorten the title to around 60 characters.");
    if (sentiment.score < 0.3) {
      suggestions.push(
        "Consider using more positive language. The title seems very negative."
      );
    } else if (sentiment.score < 0.5) {
      suggestions.push("The title leans slightly negative. Consider rephrasing for a more positive tone.");
    }

    if (clickbaitDetected) {
      suggestions.push("Avoid clickbait phrases to maintain credibility.");
    }

    // Display Results
    resultDiv.style.display = "block";
    hideLoadingIndicator(resultDiv); // Hide loading indicator
    document.getElementById("titleLength").textContent = `${titleLength} characters - ${lengthFeedback}`;
    document.getElementById("keywordScore").textContent = `Top ${Math.min(keywordSuggestions.length, 5)} Related Keywords`; // Highlight top keywords
    document.getElementById("clickbaitWarning").textContent = clickbaitDetected
      ? "Warning: Clickbait detected."
      : "No clickbait detected.";
    document.getElementById("suggestions").innerHTML = suggestions
      .map((s) => `<li>${s}</li>`)
      .join("");

    // Display the top 5 keyword suggestions
    document.getElementById("keywordSuggestions").innerHTML = keywordSuggestions
      .slice(0, 5) // Limit to top 5 suggestions
      .map((k) => `<li>${k}</li>`)
      .join("");
  } catch (error) {
    console.error(error);
    showError("Something went wrong. Please try again later."); // Show error message if something fails
  }
}

// Show loading indicator
function showLoadingIndicator(resultDiv) {
  const loadingElement = document.createElement('div');
  loadingElement.classList.add('loading');
  loadingElement.textContent = "Analyzing your title... Please wait!";
  resultDiv.appendChild(loadingElement);
}

// Hide loading indicator
function hideLoadingIndicator(resultDiv) {
  const loadingElement = resultDiv.querySelector('.loading');
  if (loadingElement) {
    resultDiv.removeChild(loadingElement);
  }
}

// Show error message
function showError(message) {
  const resultDiv = document.getElementById("result");
  resultDiv.style.display = "block";
  const errorElement = document.createElement('div');
  errorElement.classList.add('error');
  errorElement.textContent = message;
  resultDiv.appendChild(errorElement);
}

// Fetch related keywords from the Datamuse API
async function fetchKeywordSuggestions(words) {
  try {
    const promises = words.map((word) => fetch(`${keywordApiUrl}${word}`));
    const responses = await Promise.all(promises);
    const keywords = await Promise.all(responses.map((res) => res.json()));
    return keywords.flat().slice(0, 10).map((k) => k.word); // First 10 related words
  } catch (error) {
    console.error("Error fetching keyword suggestions:", error);
    return [];
  }
}

// Fetch sentiment analysis from the Sentim API
async function fetchSentimentAnalysis(title) {
    try {
      // Check Sentim API documentation for authentication requirements (e.g., API key)
      const apiKey = "VniSkaemO6sRMRcY"; // Replace with your actual API key
      const sentimentApiUrl = "https://sentim-api.com/api/v1/analyze";
      const response = await fetch(sentimentApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`, // Example authentication header (check Sentim API docs)
        },
        body: JSON.stringify({ text: title }),
      });
  
      const data = await response.json();
  
      // Check Sentim API documentation for exact response structure
      // Extract relevant fields (e.g., polarity, score, confidence)
      return {
        polarity: data.data?.polarity || "neutral", // Handle potential missing data
        score: data.data?.comparative || 0.5, // Handle potential missing data
        confidence: data.data?.confidence, // Example confidence score (check API docs)
      };
    } catch (error) {
      console.error("Error fetching sentiment analysis:", error);
      return { polarity: "neutral", score: 0.5 };
    }
  }

// Check if the title contains clickbait phrases
function checkForClickbait(title) {
  const titleLower = title.toLowerCase();
  return clickbaitKeywords.some((keyword) => titleLower.includes(keyword));
}
