async function uploadToGitHub(title, code, language) {
  try {
    // Get configuration from storage
    const config = await new Promise(resolve => {
      chrome.storage.local.get(['githubToken', 'githubRepo'], resolve);
    });
    
    if (!config.githubToken || !config.githubRepo) {
      console.error("[Background] Configuration missing");
      return { success: false, error: 'Configuration missing' };
    }
    
    const [username, repo] = config.githubRepo.split('/');
    const token = config.githubToken;

    // Convert title to camelCase for Java convention
    const camelCaseTitle = title
      .split(/[\s\-_]+/)
      .map((word, index) => {
        // First word lowercase, rest capitalized
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');

    const fileName = `${camelCaseTitle}.java`;
    const content = btoa(unescape(encodeURIComponent(code)));
    const url = `https://api.github.com/repos/${username}/${repo}/contents/${fileName}`;

    console.log(`[Background] Uploading: ${fileName} to ${config.githubRepo}`);

    // Check if file exists to get SHA
    let sha = null;
    try {
      const checkResponse = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (checkResponse.ok) {
        const existingFile = await checkResponse.json();
        sha = existingFile.sha;
        console.log(`[Background] File exists, updating with SHA`);
      }
    } catch (checkError) {
      console.log("[Background] File doesn't exist, creating new file");
    }

    // Prepare payload
    const payload = {
      message: `Add solution for ${title}`,
      content
    };

    if (sha) {
      payload.sha = sha;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Successfully uploaded to GitHub:", fileName);
      return { success: true, result };
    } else {
      console.error("❌ GitHub upload failed:", result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error("❌ Upload error:", error);
    return { success: false, error: error.message };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Background] Received message:", message);

  if (message.type === "leetcodeSubmission") {
    const { title, code, language } = message;
    console.log(`[Background] Processing: ${title} (${language})`);

    uploadToGitHub(title, code, language)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        console.error("[Background] Upload failed:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep message channel open for async response
  }
});