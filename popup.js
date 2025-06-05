document.addEventListener('DOMContentLoaded', function() {
    const statusDiv = document.getElementById('status');
    const manualTitle = document.getElementById('manualTitle');
    const manualCode = document.getElementById('manualCode');
    const manualUpload = document.getElementById('manualUpload');
    const githubToken = document.getElementById('githubToken');
    const githubRepo = document.getElementById('githubRepo');
    const saveConfig = document.getElementById('saveConfig');
    const configStatus = document.getElementById('configStatus');
    
    function showStatus(message, type = 'success') {
        statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
    }
    
    function showConfigStatus(message, type = 'success') {
        configStatus.innerHTML = `<span class="${type === 'success' ? 'configured' : ''}">${message}</span>`;
    }
    
    // Load saved configuration
    function loadConfig() {
        chrome.storage.local.get(['githubToken', 'githubRepo'], function(result) {
            if (result.githubToken) {
                githubToken.value = result.githubToken;
                showConfigStatus('✓ Token configured', 'success');
            }
            if (result.githubRepo) {
                githubRepo.value = result.githubRepo;
            }
            
            // Enable/disable upload based on configuration
            manualUpload.disabled = !result.githubToken;
            if (!result.githubToken) {
                showStatus('Please configure your GitHub token first', 'warning');
            }
        });
    }
    
    // Save configuration
    saveConfig.addEventListener('click', function() {
        const token = githubToken.value.trim();
        const repo = githubRepo.value.trim();
        
        if (!token) {
            showConfigStatus('Please enter a GitHub token', 'error');
            return;
        }
        
        if (!repo || !repo.includes('/')) {
            showConfigStatus('Please enter repo as: username/repo-name', 'error');
            return;
        }
        
        chrome.storage.local.set({
            githubToken: token,
            githubRepo: repo
        }, function() {
            showConfigStatus('✓ Configuration saved', 'success');
            manualUpload.disabled = false;
            showStatus('Ready to upload!', 'success');
        });
    });
    
    async function uploadToGitHub(title, code) {
        // Get configuration from storage
        const config = await new Promise(resolve => {
            chrome.storage.local.get(['githubToken', 'githubRepo'], resolve);
        });
        
        if (!config.githubToken || !config.githubRepo) {
            showStatus('Please configure GitHub token and repository first', 'error');
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
        
        // Get current tab URL for the comment
        let currentUrl = 'https://leetcode.com';
        try {
            const tabs = await new Promise(resolve => {
                chrome.tabs.query({active: true, currentWindow: true}, resolve);
            });
            
            if (tabs && tabs[0] && tabs[0].url) {
                currentUrl = tabs[0].url;
            }
        } catch (e) {
            console.log('Could not get tab URL, using default');
        }
        
        // Add URL comment at the beginning of the code
        const codeWithComment = `//${currentUrl}\n${code}`;
        
        console.log('Code with comment:', codeWithComment.substring(0, 100)); // Debug log
        
        const content = btoa(unescape(encodeURIComponent(codeWithComment)));
        const url = `https://api.github.com/repos/${username}/${repo}/contents/${fileName}`;

        try {
            showStatus('Checking if file exists...', 'warning');
            
            // Check if file exists
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
                    showStatus('File exists, will update...', 'warning');
                } else {
                    showStatus('Creating new file...', 'warning');
                }
            } catch (e) {
                showStatus('Creating new file...', 'warning');
            }

            const payload = {
                message: `Add solution for ${title}`,
                content
            };

            if (sha) {
                payload.sha = sha;
            }

            showStatus('Uploading to GitHub...', 'warning');

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
                showStatus(`✅ Successfully uploaded: ${fileName} to ${config.githubRepo}`, 'success');
                // Clear the form
                manualTitle.value = '';
                manualCode.value = '';
                return { success: true, fileName };
            } else {
                showStatus(`❌ Upload failed: ${result.message || 'Unknown error'}`, 'error');
                console.error('GitHub API Error:', result);
                return { success: false, error: result };
            }
        } catch (error) {
            showStatus(`❌ Network error: ${error.message}`, 'error');
            console.error('Upload error:', error);
            return { success: false, error: error.message };
        }
    }
    
    manualUpload.addEventListener('click', async function() {
        const title = manualTitle.value.trim();
        const code = manualCode.value.trim();
        
        if (!title) {
            showStatus('Please enter a problem title', 'error');
            return;
        }
        
        if (!code || code.length < 10) {
            showStatus('Please paste your code', 'error');
            return;
        }
        
        manualUpload.disabled = true;
        manualUpload.textContent = 'Uploading...';
        
        try {
            await uploadToGitHub(title, code);
        } catch (error) {
            showStatus(`Error: ${error.message}`, 'error');
        } finally {
            manualUpload.disabled = false;
            manualUpload.textContent = 'Upload as .java file';
        }
    });
    
    // Try to get problem title from current tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const tab = tabs[0];
        if (tab.url && tab.url.includes('leetcode.com/problems/')) {
            const match = tab.url.match(/\/problems\/([^\/\?]+)/);
            if (match) {
                const urlTitle = match[1]
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                manualTitle.value = urlTitle;
            }
        }
    });
    
    // Load configuration on popup open
    loadConfig();
});