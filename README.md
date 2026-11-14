<div align="center">

# ⚡ LeetCode Insights Chrome Extension
### *Instant Company Tags, Interview Frequency Metrics & Advanced In-Page Filtering*

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-orange?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/Styling-Custom%20CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/Zishan3909/leetcode-insights-extension/pulls)

<br />

<img src="https://raw.githubusercontent.com/Zishan3909/leetcode-insights-extension/main/assets/banner.png" alt="LeetCode Insights Banner" width="100%" onerror="this.src='https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'" />

<p align="center">
  <b>Eliminate interview guesswork. Inject real-time company tags, frequency counts, and custom search filters directly into the LeetCode problemset interface.</b>
</p>

</div>

---

## 📌 Executive Summary

Practicing blindly across thousands of algorithmic problems is inefficient. **LeetCode Insights** bridges the preparation gap by parsing and injecting company frequency intelligence directly into LeetCode's client-side SPA. 

Built with **Zero External Dependencies** on Chrome's **Manifest V3** standard, it provides high-speed $O(1)$ in-memory lookups, custom modals, and non-intrusive UI badging without degrading browser performance.

---

## ✨ Features

- 🏷️ **Native In-Line Badges:** Seamlessly appends company brand icons and historical frequency badges directly next to problem titles on the main problemset page.
- 🔍 **Dynamic DOM Ingestion (`MutationObserver`):** Reliably detects client-side React/Next.js page switches and row re-renders without full-page reloads.
- 🗂️ **Floating Company Filter Modal:** Search and filter problems asked by Meta, Google, Amazon, Uber, or Bloomberg instantly, bypassing native pagination limits.
- 🚀 **Zero Network Overhead:** Queries an optimized local JSON dataset mapping 3,300+ problem IDs to verified company occurrences for immediate rendering.
- 🌓 **Adaptive Theme Integration:** Fully integrated CSS variables automatically match both LeetCode Dark and Light themes cleanly.

---

## 🛠️ Tech Stack

- **Platform:** Chromium Browser Ecosystem (Manifest V3)
- **Scripting:** Vanilla JavaScript (ES6+ Modules, Async/Await)
- **DOM Engine:** `MutationObserver` API, Custom Event Listeners
- **Styling:** Modular CSS3, CSS Flexbox & Grid, Glassmorphic Modals
- **Data Engine:** Local In-Memory JSON indexing

---

## 🚀 Quick Start / Installation

No build steps required. Install directly into any Chromium browser (Chrome, Brave, Edge):

```bash
# 1. Clone this repository to your local machine
git clone https://github.com/Zishan3909/leetcode-insights-extension.git
```

### Load the Extension in Google Chrome:
1. Open Chrome and navigate to `chrome://extensions/`.
2. Toggle on **Developer mode** in the top-right corner.
3. Click the **Load unpacked** button in the top-left.
4. Select the cloned `leetcode-insights-extension` directory.
5. Navigate to [leetcode.com/problemset/](https://leetcode.com/problemset/) and explore live company insights!

---

## 📸 Screenshots & Previews

<div align="center">
  <table width="100%">
    <tr>
      <td width="50%" align="center">
        <b>Inline Badges in Problem Table</b><br/>
        <img src="https://via.placeholder.com/450x250/1e293b/38bdf8?text=Inline+Company+Badges" alt="Inline Badges Preview" width="100%" />
      </td>
      <td width="50%" align="center">
        <b>Custom Company Filter Modal</b><br/>
        <img src="https://via.placeholder.com/450x250/1e293b/38bdf8?text=Company+Filter+Modal" alt="Filter Modal Preview" width="100%" />
      </td>
    </tr>
  </table>
</div>

---

## ⚖️ License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more details.

---

<div align="center">
  <sub>Maintained by <a href="https://github.com/Zishan3909">Zishan Ali</a></sub>
</div>
