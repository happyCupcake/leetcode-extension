# LeetCode to GitHub Extension

A Chrome extension that automatically syncs your LeetCode solutions to your GitHub repository as `.java` files with proper naming conventions and source URLs.

## 🚀 Features

- **Automatic Java File Creation**: Converts any LeetCode solution to `.java` format
- **Smart File Naming**: Uses camelCase convention (e.g., "Two Sum" → `twoSum.java`)
- **Source URL Tracking**: Adds the LeetCode problem URL as a comment at the top of each file
- **GitHub Integration**: Direct upload to your specified GitHub repository
- **Manual Code Capture**: Easy-to-use interface for capturing and uploading solutions
- **File Overwriting**: Updates existing solutions automatically
- **Secure Token Storage**: Your GitHub token is stored locally and encrypted

## 📦 Installation

### Option 1: Load as Unpacked Extension (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your toolbar

### Option 2: Chrome Web Store
*Coming soon

## ⚙️ Setup

### 1. Generate GitHub Personal Access Token
1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "LeetCode Extension"
4. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `public_repo` (Access to public repositories)
5. Click "Generate token" and **copy the token immediately**

### 2. Configure the Extension
1. Click the extension icon in your Chrome toolbar
2. Paste your GitHub token in the "GitHub Token" field
3. Enter your repository in the format: `username/repository-name`
   - Example: `johnsmith/leetcode-solutions`
4. Click "Save Configuration"

## 🎯 Usage

### Method 1: Manual Capture (Recommended)
1. Navigate to any LeetCode problem page
2. Write and test your solution in the LeetCode editor
3. Click the green "📤 Capture & Upload to GitHub (.java)" button that appears on the page
4. Follow the popup instructions:
   - Select all your code (Ctrl+A)
   - Copy it (Ctrl+C)
   - Click OK
5. Your solution will be automatically uploaded as a `.java` file


## 📁 File Structure

Your solutions will be saved with the following structure:

```
your-repo/
├── twoSum.java
├── addTwoNumbers.java
├── longestSubstringWithoutRepeatingCharacters.java
└── ...
```

Each file includes:
- **URL Comment**: The LeetCode problem URL at the top
- **Your Solution**: The complete Java code you wrote

Example file content:
```java
//https://leetcode.com/problems/two-sum/
class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
    }
}
```

## 🔧 Technical Details

### File Naming Convention
- Converts problem titles to camelCase
- Removes special characters and numbers
- Examples:
  - "1. Two Sum" → `twoSum.java`
  - "Add Two Numbers" → `addTwoNumbers.java`
  - "Longest Substring Without Repeating Characters" → `longestSubstringWithoutRepeatingCharacters.java`

### Security
- GitHub tokens are stored locally using Chrome's secure storage API
- No data is sent to external servers except GitHub's official API
- All operations are performed client-side

### Permissions Required
- `activeTab`: To read the current LeetCode page
- `storage`: To save your GitHub configuration
- `clipboardRead`: To capture code from clipboard
- `scripting`: To inject the capture button
- Host permissions for LeetCode and GitHub API

## 🐛 Troubleshooting

### Common Issues

**"Please configure GitHub token first"**
- Make sure you've entered a valid GitHub personal access token
- Verify the token has `repo` permissions
- Check that your repository exists and is accessible

**"Upload failed: Configuration missing"**
- Double-check your repository format: `username/repo-name`
- Ensure your GitHub token hasn't expired
- Verify the repository exists

**"No code found in clipboard"**
- Make sure to copy your code (Ctrl+C) before clicking the capture button
- Try refreshing the page and attempting again
- Ensure clipboard permissions are granted to the extension

**Extension button not appearing**
- Refresh the LeetCode problem page
- Make sure you're on a `/problems/` URL
- Check that the extension is enabled in `chrome://extensions/`

### Manual Upload Issues
- If automatic capture fails, use the extension popup
- Copy your code and paste it manually in the popup
- The problem title should auto-populate from the current page

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Setup
1. Clone the repository
2. Make your changes
3. Test by loading as unpacked extension
4. Submit a pull request

### Planned Features
- Support for multiple programming languages
- Batch upload functionality
- Custom file organization options
- Solution statistics and tracking

## 📞 Support

If you encounter any issues or have feature requests:
1. Check the troubleshooting section above
2. Open an issue on GitHub
3. Include your Chrome version and extension version in bug reports

---

**Happy Coding! 🚀**

*Star this repository if you find it helpful!*



