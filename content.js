/* ==========================================================================
   LeetCode Insights — Content Script & 3D Mascot Screen Companion
   ========================================================================== */

let insightsData = null;
let isEnabled = true;
let searchBarOpen = false;
let currentCompanionState = 'idle'; // 'idle' | 'clicked' | 'creating' | 'active' | 'working'
let activeSearchQuery = '';

// Asset path resolver for Manifest V3
function getAssetUrl(filename) {
  try {
    return chrome.runtime.getURL(`assets/${filename}`);
  } catch (e) {
    return `assets/${filename}`;
  }
}

const MASCOT_IMAGES = {
  idle: getAssetUrl('mascot_idle.png'),
  clicked: getAssetUrl('mascot_clicked.png'),
  creating: getAssetUrl('mascot_creating.png'),
  active: getAssetUrl('mascot_active.png'),
  working: getAssetUrl('mascot_working.png')
};

// ── 1. Data Loader & URL Parsing ──────────────────────────────────────────

async function loadData() {
  try {
    const url = chrome.runtime.getURL('data.json');
    const response = await fetch(url);
    insightsData = await response.json();
  } catch (error) {
    console.error("LeetCode Insights: Failed to load data.json", error);
  }
}

function getSlugFromHref(href) {
  if (!href) return null;
  const match = href.match(/\/problems\/([^/?#]+)/);
  return match ? match[1] : null;
}

// ── 2. Badge Construction ─────────────────────────────────────────────────

function createBadge(companies) {
  const badgeContainer = document.createElement('div');
  badgeContainer.className = 'lc-insights-container';

  // Sort companies by frequency desc, display top 3
  const topCompanies = [...companies].sort((a, b) => b.freq - a.freq).slice(0, 3);

  topCompanies.forEach(c => {
    const badge = document.createElement('span');
    badge.className = 'lc-insights-badge';

    let domain = c.company.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + '.com';
    if (c.company.toLowerCase() === 'apple') domain = 'apple.com';
    if (c.company.toLowerCase() === 'amazon') domain = 'amazon.com';

    const img = document.createElement('img');
    img.src = `https://logo.clearbit.com/${domain}`;
    img.className = 'lc-company-logo';
    img.alt = '';
    img.onerror = function() {
      this.style.display = 'none';
    };

    const text = document.createElement('span');
    text.textContent = `${c.company} (${c.freq})`;

    badge.appendChild(img);
    badge.appendChild(text);
    badgeContainer.appendChild(badge);
  });

  return badgeContainer;
}

// ── 3. Robust Sidebar & Weekly Premium Exclusion ──────────────────────────

function shouldSkipLink(link) {
  const text = (link.textContent || '').trim();

  // Skip if empty or too short
  if (!text || text.length < 2) return true;

  // Skip Weekly Premium buttons: "W1", "W 1", "W40", "W 40", "W41", "W42", etc.
  if (/^W\s*\d+$/i.test(text)) return true;

  // Skip calendar day numbers: "1", "21", "30", etc.
  if (/^\d+$/.test(text)) return true;

  // Skip statistics / difficulty / status strings / buttons
  if (/^\d+\/\d+/.test(text) || /^\d+(\.\d+)?%/.test(text) || /^(Easy|Med\.|Medium|Hard|Solved|Expand|Rules|Redeem)$/i.test(text)) {
    return true;
  }

  // Walk up ancestors to skip sidebars and weekly widgets
  let current = link.parentElement;
  let depth = 0;
  while (current && current !== document.body && depth < 15) {
    const classStr = typeof current.className === 'string' ? current.className.toLowerCase() : '';
    const idStr = typeof current.id === 'string' ? current.id.toLowerCase() : '';
    const content = (current.textContent || '');

    if (classStr.includes('weekly') || idStr.includes('weekly') || classStr.includes('sidebar') || idStr.includes('sidebar')) {
      return true;
    }

    if (content.length < 2500) {
      if (/weekly\s*premium/i.test(content) || /days\s*left/i.test(content) || /redeem/i.test(content)) {
        return true;
      }
      if (/trending\s*companies/i.test(content) || /friends\s*check-in/i.test(content)) {
        return true;
      }
    }

    current = current.parentElement;
    depth++;
  }

  return false;
}

function cleanInvalidBadges() {
  document.querySelectorAll('.lc-insights-container').forEach(badge => {
    let current = badge.parentElement;
    let depth = 0;
    while (current && current !== document.body && depth < 15) {
      const classStr = typeof current.className === 'string' ? current.className.toLowerCase() : '';
      const idStr = typeof current.id === 'string' ? current.id.toLowerCase() : '';
      const content = (current.textContent || '');

      if (classStr.includes('weekly') || idStr.includes('weekly') || classStr.includes('sidebar') || idStr.includes('sidebar')) {
        badge.remove();
        return;
      }

      if (content.length < 2500 && (/weekly\s*premium/i.test(content) || /days\s*left/i.test(content) || /redeem/i.test(content))) {
        badge.remove();
        return;
      }

      current = current.parentElement;
      depth++;
    }
  });
}

function processLinks(rootNode = document) {
  if (!isEnabled || !insightsData) return;

  cleanInvalidBadges();

  const links = rootNode.querySelectorAll('a[href*="/problems/"]');

  links.forEach(link => {
    if (shouldSkipLink(link)) return;
    if (link.parentElement.querySelector('.lc-insights-container')) return;

    const slug = getSlugFromHref(link.getAttribute('href'));
    if (slug && insightsData[slug]) {
      const badge = createBadge(insightsData[slug]);
      link.insertAdjacentElement('beforebegin', badge);
    }
  });
}

function removeBadges() {
  document.querySelectorAll('.lc-insights-container').forEach(el => el.remove());
  document.querySelectorAll('.lc-row-highlight').forEach(el => el.classList.remove('lc-row-highlight'));
}

// ── 4. Mascot Companion Visual FX (Sparkles & Particle Trails) ───────────

function triggerSparkles(avatarElement) {
  if (!avatarElement) return;

  const container = document.createElement('div');
  container.className = 'lc-sparkles';
  avatarElement.appendChild(container);

  const colors = ['#ffd700', '#ff6b81', '#ffffff', '#ffa116', '#70a1ff', '#2ed573'];
  const particleCount = 10;

  for (let i = 0; i < particleCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'lc-sparkle';

    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
    const distance = 25 + Math.random() * 35;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 8;

    sparkle.style.setProperty('--dx', `${dx.toFixed(1)}px`);
    sparkle.style.setProperty('--dy', `${dy.toFixed(1)}px`);
    sparkle.style.top = `${35 + Math.random() * 30}%`;
    sparkle.style.left = `${35 + Math.random() * 30}%`;
    sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];

    container.appendChild(sparkle);
  }

  setTimeout(() => container.remove(), 750);
}

function triggerParticleTrails(avatarElement) {
  if (!avatarElement || avatarElement.querySelector('.lc-particle-container')) return;

  const container = document.createElement('div');
  container.className = 'lc-particle-container';
  avatarElement.appendChild(container);

  const snippets = ['0101', 'cy 8r', '{ }', 'Google', 'amazon', 'High', '101', 'if()'];

  snippets.forEach((txt, idx) => {
    setTimeout(() => {
      if (!container.parentElement) return;
      const p = document.createElement('span');
      p.className = 'lc-particle-item';
      p.textContent = txt;
      p.style.left = `${10 + Math.random() * 60}%`;
      p.style.top = `${20 + Math.random() * 40}%`;
      container.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }, idx * 140);
  });

  setTimeout(() => container.remove(), 1800);
}

// ── 5. Companion State Machine ─────────────────────────────────────────────

function setCompanionState(newState) {
  currentCompanionState = newState;
  const avatar = document.getElementById('lc-companion-avatar');
  const img = document.getElementById('lc-companion-img');
  if (!avatar || !img) return;

  // Clear previous transient classes
  avatar.classList.remove('lc-state-clicked', 'lc-state-searching');

  if (!isEnabled) {
    avatar.classList.add('lc-state-disabled');
    img.src = MASCOT_IMAGES.idle;
    return;
  }
  avatar.classList.remove('lc-state-disabled');

  switch (newState) {
    case 'clicked':
      avatar.classList.add('lc-state-clicked');
      img.src = MASCOT_IMAGES.clicked;
      triggerSparkles(avatar);
      break;

    case 'creating':
      img.src = MASCOT_IMAGES.creating;
      break;

    case 'active':
      img.src = MASCOT_IMAGES.active;
      break;

    case 'working':
    case 'searching':
      avatar.classList.add('lc-state-searching');
      img.src = MASCOT_IMAGES.working;
      triggerParticleTrails(avatar);
      break;

    case 'idle':
    default:
      img.src = MASCOT_IMAGES.idle;
      break;
  }
}

// ── 6. Search Bar Overlay & Instant Filter Mechanics ───────────────────────

function openSearchBar() {
  const wrap = document.getElementById('lc-companion-wrap');
  const avatar = document.getElementById('lc-companion-avatar');
  if (!wrap || !avatar || document.getElementById('lc-search-bar-overlay')) return;

  searchBarOpen = true;
  setCompanionState('creating');

  // Adorable glass-morphic search bar
  const overlay = document.createElement('div');
  overlay.className = 'lc-search-bar-overlay';
  overlay.id = 'lc-search-bar-overlay';

  overlay.innerHTML = `
    <div class="lc-search-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="7.5"></circle>
        <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
      </svg>
    </div>
    <input type="text" class="lc-search-input" id="lc-company-input" placeholder="Search for company..." autocomplete="off" />
    <button type="button" class="lc-go-btn" id="lc-go-btn">Go!</button>
    <button type="button" class="lc-close-btn" id="lc-close-btn" title="Close Search">✕</button>
  `;

  // Insert before the avatar so it floats nicely to the left
  wrap.insertBefore(overlay, avatar);

  // Transition to Search UI Active state once visible
  setTimeout(() => {
    if (searchBarOpen) {
      setCompanionState('active');
    }
  }, 220);

  // Focus input automatically
  setTimeout(() => {
    const input = document.getElementById('lc-company-input');
    if (input) input.focus();
  }, 320);

  // Event Handlers
  const input = document.getElementById('lc-company-input');
  const goBtn = document.getElementById('lc-go-btn');
  const closeBtn = document.getElementById('lc-close-btn');

  let searchTimeout = null;

  input.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      executeCompanyFilter(input.value);
    }, 200);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(searchTimeout);
      executeCompanyFilter(input.value);
    } else if (e.key === 'Escape') {
      closeSearchBar();
    }
  });

  goBtn.addEventListener('click', () => {
    clearTimeout(searchTimeout);
    executeCompanyFilter(input.value);
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeSearchBar();
  });
}

function closeSearchBar() {
  searchBarOpen = false;
  activeSearchQuery = '';

  const overlay = document.getElementById('lc-search-bar-overlay');
  const results = document.getElementById('lc-search-results');

  // Remove table row highlights
  document.querySelectorAll('.lc-row-highlight').forEach(el => el.classList.remove('lc-row-highlight'));

  if (overlay) {
    overlay.classList.add('lc-closing');
    setTimeout(() => {
      overlay.remove();
      if (results) results.remove();
    }, 260);
  } else if (results) {
    results.remove();
  }

  setCompanionState('idle');
}

function executeCompanyFilter(rawQuery) {
  const query = (rawQuery || '').trim();
  activeSearchQuery = query;

  const wrap = document.getElementById('lc-companion-wrap');
  let resultsDiv = document.getElementById('lc-search-results');

  if (!query) {
    if (resultsDiv) resultsDiv.remove();
    document.querySelectorAll('.lc-row-highlight').forEach(el => el.classList.remove('lc-row-highlight'));
    setCompanionState('active');
    return;
  }

  // Set companion to Searching / Working state
  setCompanionState('working');

  const lowerQuery = query.toLowerCase();
  const matches = [];

  if (insightsData) {
    for (const [slug, companies] of Object.entries(insightsData)) {
      const match = companies.find(c => c.company.toLowerCase().includes(lowerQuery));
      if (match) {
        matches.push({
          slug,
          company: match.company,
          freq: match.freq
        });
      }
    }
  }

  matches.sort((a, b) => b.freq - a.freq);

  // 1. Highlight visible matching problem rows in LeetCode table
  const currentProblemLinks = document.querySelectorAll('a[href*="/problems/"]');
  currentProblemLinks.forEach(link => {
    if (shouldSkipLink(link)) return;
    const slug = getSlugFromHref(link.getAttribute('href'));
    const isMatched = matches.some(m => m.slug === slug);
    const row = link.closest('[role="row"]') || link.closest('tr') || link.parentElement;

    if (row) {
      if (isMatched) {
        row.classList.add('lc-row-highlight');
      } else {
        row.classList.remove('lc-row-highlight');
      }
    }
  });

  // 2. Build or update Search Results Popup
  if (!resultsDiv && wrap) {
    resultsDiv = document.createElement('div');
    resultsDiv.className = 'lc-search-results';
    resultsDiv.id = 'lc-search-results';
    wrap.appendChild(resultsDiv);
  }

  if (resultsDiv) {
    resultsDiv.innerHTML = '';

    const countHeader = document.createElement('div');
    countHeader.className = 'lc-result-count';
    countHeader.textContent = matches.length > 0
      ? `Found ${matches.length} questions for "${query}"`
      : `No questions found for "${query}"`;
    resultsDiv.appendChild(countHeader);

    matches.slice(0, 100).forEach(m => {
      const item = document.createElement('a');
      item.href = `/problems/${m.slug}/`;
      item.className = 'lc-search-result-item';

      const title = m.slug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      item.innerHTML = `
        <div class="lc-result-title">${title}</div>
        <div class="lc-result-meta">
          <span>${m.company}</span>
          <span class="lc-freq-badge">Freq: ${m.freq}</span>
        </div>
      `;

      resultsDiv.appendChild(item);
    });
  }

  // After brief working animation, settle back to active state
  setTimeout(() => {
    if (searchBarOpen) {
      setCompanionState('active');
    }
  }, 500);
}

// ── 7. Companion DOM Construction ──────────────────────────────────────────

function buildCompanion() {
  if (document.getElementById('lc-companion-wrap')) return;

  const wrap = document.createElement('div');
  wrap.id = 'lc-companion-wrap';
  wrap.className = 'lc-companion-wrap';

  const avatar = document.createElement('div');
  avatar.className = 'lc-companion-avatar';
  avatar.id = 'lc-companion-avatar';
  avatar.title = 'LeetCode Companion — Click to Search & Toggle';

  const img = document.createElement('img');
  img.id = 'lc-companion-img';
  img.className = 'lc-companion-img';
  img.src = MASCOT_IMAGES.idle;
  img.alt = 'LeetCode Companion';

  avatar.appendChild(img);
  wrap.appendChild(avatar);
  document.body.appendChild(wrap);

  // Mascot Click Event: triggers "cuteness" reaction first, then toggles search bar
  avatar.addEventListener('click', () => {
    setCompanionState('clicked');

    setTimeout(() => {
      if (!searchBarOpen) {
        openSearchBar();
      } else {
        closeSearchBar();
      }
    }, 280);
  });
}

// ── 8. Lifecycle & SPA Single-Instance Management ─────────────────────────

async function init() {
  await loadData();

  // Load state from chrome.storage.local
  chrome.storage.local.get(['insightsEnabled'], (result) => {
    isEnabled = result.insightsEnabled !== false;
    buildCompanion();
    setCompanionState(isEnabled ? 'idle' : 'idle');

    if (isEnabled) {
      processLinks();
    }
  });

  // MutationObserver for React/Next.js dynamic navigation and virtual table scrolling
  const observer = new MutationObserver((mutations) => {
    let hasRelevantMutations = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        hasRelevantMutations = true;
        break;
      }
    }

    if (hasRelevantMutations) {
      clearTimeout(window.lcInsightsTimeout);
      window.lcInsightsTimeout = setTimeout(() => {
        buildCompanion();
        if (isEnabled) {
          processLinks();
          if (activeSearchQuery) {
            executeCompanyFilter(activeSearchQuery);
          }
        }
      }, 250);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Listen for toggle updates from popup or storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.insightsEnabled) {
    isEnabled = changes.insightsEnabled.newValue;
    if (isEnabled) {
      processLinks();
      setCompanionState('idle');
    } else {
      removeBadges();
      closeSearchBar();
      setCompanionState('idle');
    }
  }
});

// Initialize
init();
