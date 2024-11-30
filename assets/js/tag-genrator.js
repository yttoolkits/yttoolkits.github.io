const keywordApiUrl = "https://rappid.in/apis/youtube_tags.php?title="; // API for related words

document.getElementById("generateTagsButton").addEventListener("click", generateTags);

async function generateTags() {
  const title = document.getElementById("titleInput").value.trim();
  const resultDiv = document.getElementById("result");
  resultDiv.style.display = "none";

  if (!title || title.split(/\s+/).length < 3) {
    alert("Please enter a title with at least 3 words to generate tags.");
    return;
  }

  showLoadingIndicator(resultDiv); // Show loading indicator

  try {
    let res = await fetch(`https://api.allorigins.win/get?url=https://rappid.in/apis/youtube_tags.php?title=${title}`,{
      headers: {
        'Content-Type': 'application/json'
      }
    });
    let tagsData = await res.json();
    let tags = JSON.parse(tagsData?.contents)?.tags

    // 5. Display Tags
    resultDiv.style.display = "block";
    hideLoadingIndicator(resultDiv); // Hide loading indicator
    let resultDiv2 = document.getElementById("tagsResult");
    tags.map(item => {
      const span = `<span class="tag" title="Click to COPY">${item}</span>`; // Create a span for each tag
      resultDiv2.innerHTML += span; // Append to the div
    });
  } catch (error) {
    console.error(error);
    showError("Something went wrong. Please try again later."); // Show error message if something fails
  }
}

// Show loading indicator
function showLoadingIndicator(resultDiv) {
  const loadingElement = document.createElement('div');
  loadingElement.classList.add('loading');
  loadingElement.textContent = "Generating tags... Please wait!";
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


// Function to handle copying the clicked tag
function copyTagContent(event) {
  // Check if a tag element was clicked
  if (event.target.classList.contains('tag')) {
      const tagContent = event.target.textContent; // Get the tag's text content

      // Copy to clipboard
      navigator.clipboard.writeText(tagContent)
          .then(() => {
              alert(`Copied: ${tagContent}`); // Show confirmation
          })
          .catch(err => {
              console.error('Failed to copy: ', err);
          });
  }
}

// Attach the function to the container
document.getElementById('tagsResult').addEventListener('click', copyTagContent);
// Function to copy all tags' content
function copyAllTags() {
  // Get all tag elements
  const tags = document.querySelectorAll('#tagsResult .tag');
  
  // Collect the text content of each tag
  const allTagsText = Array.from(tags).map(tag => tag.textContent).join(', ');

  // Copy to clipboard
  navigator.clipboard.writeText(allTagsText)
      .then(() => {
          alert(`Copied all tags: ${allTagsText}`); // Show confirmation
      })
      .catch(err => {
          console.error('Failed to copy all tags: ', err);
      });
}

// Attach the function to the button
document.getElementById('copyAllButton').addEventListener('click', copyAllTags);


