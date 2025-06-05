console.log("[LeetCode Extension] Content script loaded");

let isProcessing = false;

function getLanguageFromUrl() {
  // Always return java since user wants .java files
  return 'java';
}

function getLanguageExtension(code, urlLang) {
  // Always return .java
  return '.java';
}

function getCodeFromEditor() {
  // Manual capture only - return empty string to force manual capture
  console.log("[LeetCode Extension] Manual capture only - use the green button");
  return "";
}

function getProblemTitle() {
  try {
    // Method 1: Try the main title element
    const titleSelectors = [
      '[data-cy="question-title"]',
      'h1[data-cy="question-title"]',
      '.css-v3d350',
      'a[href*="/problems/"]',
      '.text-title-large'
    ];
    
    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent && element.textContent.trim().length > 3) {
        let title = element.textContent.trim();
        // Remove leading numbers and dots
        title = title.replace(/^\d+\.\s*/, '');
        if (title.length > 3) {
          console.log(`[LeetCode Extension] Found title: ${title}`);
          return title;
        }
      }
    }
    
    // Method 2: Extract from URL
    const pathMatch = window.location.pathname.match(/\/problems\/([^\/\?]+)/);
    if (pathMatch) {
      const urlTitle = pathMatch[1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      console.log(`[LeetCode Extension] Title from URL: ${urlTitle}`);
      return urlTitle;
    }
    
    console.log("[LeetCode Extension] Could not find title");
    return "unknown-problem";
    
  } catch (error) {
    console.error("[LeetCode Extension] Error getting title:", error);
    return "unknown-problem";
  }
}

// Add a manual capture button to the page
function addManualCaptureButton() {
  // Check if button already exists
  if (document.getElementById('leetcode-github-btn')) {
    return;
  }
  
  const button = document.createElement('button');
  button.id = 'leetcode-github-btn';
  button.innerHTML = '📤 Capture & Upload to GitHub (.java)';
  button.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 10000;
    background: #28a745;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `;
  
  button.addEventListener('click', () => {
    console.log("[LeetCode Extension] Manual capture triggered");
    manualCapture();
  });
  
  document.body.appendChild(button);
  console.log("[LeetCode Extension] Added manual capture button");
}

function manualCapture() {
  // Tell user to select their code
  const userCode = prompt(`
LeetCode GitHub Extension

Please follow these steps:
1. Click OK to close this dialog
2. Select ALL your code in the editor (Ctrl+A)
3. Copy it (Ctrl+C) 
4. Click the green button again

After you copy the code, we'll capture it automatically and save as .java file.

Click OK to continue.
  `);
  
  if (userCode !== null) {
    // Try to get code from clipboard
    navigator.clipboard.readText().then(clipboardText => {
      if (clipboardText && clipboardText.length > 10) {
        console.log("[LeetCode Extension] Got code from clipboard:", clipboardText.length, "characters");
        
        const title = getProblemTitle();
        const language = 'java'; // Always java
        const currentUrl = window.location.href;
        
        // Add URL comment at the beginning
        const codeWithComment = `//${currentUrl}\n${clipboardText}`;
        
        // Store and upload
        const submissionData = {
          title,
          code: codeWithComment,
          language,
          timestamp: Date.now()
        };
        
        localStorage.setItem('leetcode_pending_submission', JSON.stringify(submissionData));
        
        // Try to upload
        if (chrome.runtime?.id) {
          chrome.runtime.sendMessage({
            type: "leetcodeSubmission",
            title,
            code: codeWithComment,
            language
          }, (response) => {
            if (chrome.runtime.lastError) {
              alert("Extension context issue. Code saved. Click the extension icon to upload.");
            } else if (response && response.success) {
              alert("✅ Successfully uploaded to GitHub as .java file!");
              localStorage.removeItem('leetcode_pending_submission');
            } else {
              alert("❌ Upload failed. Code saved. Click the extension icon to retry.");
            }
          });
        } else {
          alert("Extension context issue. Code saved. Click the extension icon to upload.");
        }
      } else {
        alert("No code found in clipboard. Please copy your code first.");
      }
    }).catch(err => {
      console.error("Clipboard access failed:", err);
      alert("Couldn't access clipboard. Make sure you granted clipboard permissions.");
    });
  }
}

// No automatic upload function - manual only
// Remove the observer for automatic detection

// Add manual capture button when page loads
setTimeout(() => {
  addManualCaptureButton();
}, 2000);

console.log("[LeetCode Extension] Manual capture mode - use the green button");