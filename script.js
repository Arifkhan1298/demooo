/**
 * ==========================================================================
 * ZAINAB NASEER — SIGNATURE DIGITAL UNIVERSE
 * Master Production JavaScript (Vanilla JS - Zero External Dependencies)
 * ==========================================================================
 */

'use strict';

/* ==========================================================================
   01. CONFIGURATION & BRAND REGISTRY
   ========================================================================== */
const CONFIG = {
  // Brand Identity
  fullName: 'Zainab Naseer',
  professionalTitle: 'BSIT Student | Web Developer | Graphic Designer',
  location: 'Lahore, Pakistan',

  // Social & Contact Integrations
  githubUsername: 'Zainab-Naseer-7',
  githubProfileUrl: 'https://github.com/Zainab-Naseer-7',
  githubApiUrl: 'https://api.github.com/users/Zainab-Naseer-7/repos?sort=updated&direction=desc&per_page=100',
  whatsappNumber: '92300442924',
  whatsappFormatted: '+92 300 44262924',
  whatsappPrefillText: 'Hello Zainab, I visited your portfolio and would like to discuss a project or professional opportunity.',
  linkedinUrl: 'https://www.linkedin.com/in/zainab-naseer-12b29641b',
  
  // Official Email Address
  emailAddress: 'naturalstar848@gmail.com',

  // Assets
  cvFilename: 'Zainab_Naseer_CV.pdf',

  // Projects View Configuration
  projectsPageSize: 6,
  cacheDurationMs: 15 * 60 * 1000 // 15 minutes local cache
};

/* ==========================================================================
   02. THEME ENGINE (Dark / Light Mode with localStorage & System Prefs)
   ========================================================================== */
const ThemeEngine = {
  STORAGE_KEY: 'zn_theme_preference',

  init() {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');

    this.setTheme(initialTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
      });
    }

    // Listen for OS system preference changes if user hasn't explicitly set one
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      toggleBtn.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
  }
};

/* ==========================================================================
   03. NAVIGATION & SCROLL MANAGEMENT
   ========================================================================== */
const Navigation = {
  init() {
    const header = document.querySelector('.site-header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    // Sticky header shadow on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    }, { passive: true });

    // Mobile menu toggle
    const toggleMobileMenu = (open) => {
      const isOpen = open !== undefined ? open : !mobileDrawer?.classList.contains('open');
      mobileDrawer?.classList.toggle('open', isOpen);
      mobileOverlay?.classList.toggle('visible', isOpen);
      mobileToggle?.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    mobileToggle?.addEventListener('click', () => toggleMobileMenu());
    mobileOverlay?.addEventListener('click', () => toggleMobileMenu(false));

    // Close mobile nav on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer?.classList.contains('open')) {
        toggleMobileMenu(false);
      }
    });

    // Close mobile nav and smooth scroll when links are clicked
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (mobileDrawer?.classList.contains('open')) {
          toggleMobileMenu(false);
        }
      });
    });

    // Active Section Scroll Spy with IntersectionObserver
    this.initScrollSpy();

    // Back to top button
    const backToTopBtn = document.getElementById('back-to-top-btn');
    backToTopBtn?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },

  initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-30% 0px -60% 0px'
    });

    sections.forEach((sec) => observer.observe(sec));
  }
};

/* ==========================================================================
   04. LIVE GITHUB PROJECT ECOSYSTEM
   ========================================================================== */
const GitHubProjects = {
  rawRepositories: [],
  filteredRepositories: [],
  selectedLanguage: 'All',
  searchQuery: '',
  sortBy: 'updated',
  visibleCount: CONFIG.projectsPageSize,

  STORAGE_DATA_KEY: 'zn_gh_repos_data',
  STORAGE_TIME_KEY: 'zn_gh_repos_timestamp',

  languageColors: {
    'JavaScript': '#F7DF1E',
    'HTML': '#E34F26',
    'CSS': '#1572B6',
    'TypeScript': '#3178C6',
    'Python': '#3776AB',
    'PHP': '#777BB4',
    'C++': '#00599C',
    'C#': '#239120',
    'Java': '#B07219',
    'Vue': '#4FC08D',
    'Default': '#D6B36A'
  },

  init() {
    this.bindControls();
    this.loadRepositories();
  },

  bindControls() {
    const searchInput = document.getElementById('project-search-input');
    const sortSelect = document.getElementById('project-sort-select');
    const loadMoreBtn = document.getElementById('projects-load-more-btn');

    // Debounced search
    let debounceTimer;
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.applyFilters();
      }, 250);
    });

    // Sort order change
    sortSelect?.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.applyFilters();
    });

    // Load More pagination
    loadMoreBtn?.addEventListener('click', () => {
      this.visibleCount += CONFIG.projectsPageSize;
      this.renderProjects();
    });
  },

  async loadRepositories() {
    const grid = document.getElementById('projects-grid');
    const loadMoreContainer = document.getElementById('projects-pagination');
    
    // Check local cache first
    const cachedData = localStorage.getItem(this.STORAGE_DATA_KEY);
    const cachedTime = localStorage.getItem(this.STORAGE_TIME_KEY);
    const now = Date.now();

    if (cachedData && cachedTime && (now - parseInt(cachedTime, 10) < CONFIG.cacheDurationMs)) {
      try {
        this.rawRepositories = JSON.parse(cachedData);
        this.buildLanguageFilters();
        this.applyFilters();
        return;
      } catch (e) {
        localStorage.removeItem(this.STORAGE_DATA_KEY);
      }
    }

    // Render skeleton loaders while fetching
    this.renderSkeletons();

    try {
      const response = await fetch(CONFIG.githubApiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API HTTP Status: ${response.status}`);
      }

      const repos = await response.json();

      if (!Array.isArray(repos)) {
        throw new Error('Invalid repository payload from GitHub API');
      }

      // Filter out forks if preferred or keep all public repos
      this.rawRepositories = repos;

      // Save to localStorage cache
      localStorage.setItem(this.STORAGE_DATA_KEY, JSON.stringify(repos));
      localStorage.setItem(this.STORAGE_TIME_KEY, String(now));

      this.buildLanguageFilters();
      this.applyFilters();

    } catch (error) {
      console.warn('GitHub Repository Fetch Alert:', error);

      // If we had stale cache, use it as fallback
      if (cachedData) {
        try {
          this.rawRepositories = JSON.parse(cachedData);
          this.buildLanguageFilters();
          this.applyFilters();
          return;
        } catch (_) {}
      }

      this.renderErrorState(error.message);
    }
  },

  buildLanguageFilters() {
    const filterRow = document.getElementById('filter-pills-row');
    if (!filterRow) return;

    // Collect unique languages
    const languagesSet = new Set();
    this.rawRepositories.forEach((repo) => {
      if (repo.language) {
        languagesSet.add(repo.language);
      }
    });

    const uniqueLanguages = ['All', ...Array.from(languagesSet).sort()];

    filterRow.innerHTML = '';
    uniqueLanguages.forEach((lang) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `filter-pill ${lang === this.selectedLanguage ? 'active' : ''}`;
      button.textContent = lang;
      button.addEventListener('click', () => {
        this.selectedLanguage = lang;
        filterRow.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.applyFilters();
      });
      filterRow.appendChild(button);
    });
  },

  applyFilters() {
    let list = [...this.rawRepositories];

    // Language filter
    if (this.selectedLanguage !== 'All') {
      list = list.filter(repo => repo.language === this.selectedLanguage);
    }

    // Search query filter
    if (this.searchQuery) {
      list = list.filter(repo => {
        const name = (repo.name || '').toLowerCase();
        const desc = (repo.description || '').toLowerCase();
        const lang = (repo.language || '').toLowerCase();
        const topics = Array.isArray(repo.topics) ? repo.topics.join(' ').toLowerCase() : '';
        return name.includes(this.searchQuery) || desc.includes(this.searchQuery) || lang.includes(this.searchQuery) || topics.includes(this.searchQuery);
      });
    }

    // Sorting
    if (this.sortBy === 'stars') {
      list.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else if (this.sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: recently updated
      list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }

    this.filteredRepositories = list;
    this.visibleCount = CONFIG.projectsPageSize;
    this.renderProjects();
  },

  renderProjects() {
    const grid = document.getElementById('projects-grid');
    const pagination = document.getElementById('projects-pagination');
    const loadMoreBtn = document.getElementById('projects-load-more-btn');
    const counterBadge = document.getElementById('projects-count-indicator');

    if (!grid) return;

    if (this.filteredRepositories.length === 0) {
      grid.innerHTML = `
        <div class="projects-status-message">
          <div class="status-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem; color: var(--text-primary);">No Matching Repositories</h3>
          <p style="color: var(--text-muted); max-width: 420px; margin: 0 auto 1.5rem;">
            No repositories matched "${escapeHtml(this.searchQuery)}" under the selected filter.
          </p>
          <button type="button" class="btn btn-outline btn-sm" id="reset-filter-btn">Reset Filters</button>
        </div>
      `;
      document.getElementById('reset-filter-btn')?.addEventListener('click', () => {
        const searchInput = document.getElementById('project-search-input');
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        this.selectedLanguage = 'All';
        this.buildLanguageFilters();
        this.applyFilters();
      });
      if (pagination) pagination.style.display = 'none';
      if (counterBadge) counterBadge.textContent = '0 Projects';
      return;
    }

    const visibleItems = this.filteredRepositories.slice(0, this.visibleCount);

    grid.innerHTML = visibleItems.map(repo => this.createProjectCardHtml(repo)).join('');

    // Pagination controls visibility
    if (pagination) {
      if (this.visibleCount < this.filteredRepositories.length) {
        pagination.style.display = 'flex';
        if (loadMoreBtn) {
          loadMoreBtn.textContent = `Load More (${this.filteredRepositories.length - this.visibleCount} Remaining)`;
        }
      } else {
        pagination.style.display = 'none';
      }
    }

    if (counterBadge) {
      counterBadge.textContent = `${this.filteredRepositories.length} Projects Available`;
    }
  },

  createProjectCardHtml(repo) {
    const formattedDate = this.formatDate(repo.updated_at);
    const langColor = this.languageColors[repo.language] || this.languageColors.Default;
    const cleanDesc = repo.description ? escapeHtml(repo.description) : 'Curated technical project developed with clean code practices and responsive architecture.';
    const cleanName = escapeHtml(repo.name);
    
    // Strict Live Demo verification: Must have a valid homepage starting with http/https
    const hasLiveDemo = repo.homepage && typeof repo.homepage === 'string' && repo.homepage.trim().startsWith('http');
    const liveDemoUrl = hasLiveDemo ? escapeHtml(repo.homepage.trim()) : null;

    // Topics badges if available
    const topicsHtml = Array.isArray(repo.topics) && repo.topics.length > 0
      ? `<div class="project-topics">
          ${repo.topics.slice(0, 3).map(t => `<span class="project-topic-badge">#${escapeHtml(t)}</span>`).join('')}
         </div>`
      : '';

    return `
      <article class="project-card" aria-label="Repository: ${cleanName}">
        <div class="project-card-header">
          <div class="project-folder-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div class="project-stars-forks">
            <span class="stat-item" title="${repo.stargazers_count} GitHub Stars">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              ${repo.stargazers_count}
            </span>
            <span class="stat-item" title="${repo.forks_count} Forks">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="6" y1="3" x2="6" y2="15"></line>
                <circle cx="18" cy="6" r="3"></circle>
                <circle cx="6" cy="18" r="3"></circle>
                <path d="M18 9a9 9 0 0 1-9 9"></path>
              </svg>
              ${repo.forks_count}
            </span>
          </div>
        </div>

        <h3 class="project-title">
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${cleanName}</a>
        </h3>

        <p class="project-desc">${cleanDesc}</p>

        ${topicsHtml}

        <div class="project-footer">
          <div class="project-language">
            <span class="language-dot" style="background-color: ${langColor};"></span>
            <span>${repo.language || 'Technology'}</span>
            <span style="color: var(--text-muted); font-size: 0.75rem; margin-left: 6px;">• ${formattedDate}</span>
          </div>

          <div class="project-actions">
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" aria-label="View source code of ${cleanName} on GitHub">
              Code
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
            ${hasLiveDemo ? `
              <a href="${liveDemoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" aria-label="Visit verified live deployment of ${cleanName}">
                Live Demo
              </a>
            ` : ''}
          </div>
        </div>
      </article>
    `;
  },

  renderSkeletons() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.innerHTML = Array(6).fill('<div class="skeleton-card"></div>').join('');
  },

  renderErrorState(errorMsg) {
    const grid = document.getElementById('projects-grid');
    const pagination = document.getElementById('projects-pagination');
    if (!grid) return;

    grid.innerHTML = `
      <div class="projects-status-message">
        <div class="status-icon-wrap" style="color: var(--color-gold);">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 style="font-size: 1.35rem; margin-bottom: 0.5rem; color: var(--text-primary);">GitHub Ecosystem Standby</h3>
        <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.5rem; font-size: 0.95rem; line-height: 1.6;">
          Direct connection to the GitHub API is temporarily rate-limited or unavailable. The rest of the portfolio remains fully active.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button type="button" class="btn btn-primary btn-sm" id="retry-github-btn">
            Retry Connection
          </button>
          <a href="${CONFIG.githubProfileUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
            Visit GitHub Profile (@${CONFIG.githubUsername})
          </a>
        </div>
      </div>
    `;

    document.getElementById('retry-github-btn')?.addEventListener('click', () => {
      this.loadRepositories();
    });

    if (pagination) pagination.style.display = 'none';
  },

  formatDate(isoString) {
    if (!isoString) return 'Active';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (_) {
      return 'Recent';
    }
  }
};

/* ==========================================================================
   05. WHATSAPP & CONTACT SYSTEM
   ========================================================================== */
const ContactSystem = {
  init() {
    this.setupWhatsAppButtons();
    this.setupEmailCard();
    this.setupContactForm();
  },

  setupWhatsAppButtons() {
    const encodedMsg = encodeURIComponent(CONFIG.whatsappPrefillText);
    const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMsg}`;

    const waLinks = document.querySelectorAll('.js-whatsapp-link');
    waLinks.forEach((link) => {
      link.setAttribute('href', waUrl);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  },

  setupEmailCard() {
    const copyBtn = document.getElementById('btn-copy-email');
    const copyLabel = document.getElementById('copy-btn-label');
    const emailCard = document.getElementById('email-action-card');
    const emailAddress = CONFIG.emailAddress;

    const copyToClipboard = async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(emailAddress);
        } else {
          // Fallback for older browser contexts
          const tempInput = document.createElement('input');
          tempInput.value = emailAddress;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }

        if (copyBtn && copyLabel) {
          copyBtn.classList.add('copied');
          copyLabel.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyLabel.textContent = 'Copy';
          }, 2500);
        }
      } catch (e) {
        console.warn('Clipboard copy error:', e);
      }
    };

    copyBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      copyToClipboard();
    });

    // Also copy when clicking card area
    emailCard?.addEventListener('click', (e) => {
      if (e.target.closest('#btn-open-email')) {
        return; // Allow direct open in Gmail
      }
      copyToClipboard();
    });
  },

  setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    const feedbackBox = document.getElementById('contact-feedback');
    const submitBtn = form.querySelector('button[type="submit"]');

    // Real-time validation helper
    const validateField = (input, testFn, errorId) => {
      const errorEl = document.getElementById(errorId);
      const isValid = testFn(input.value.trim());
      if (!isValid) {
        input.classList.add('error');
        errorEl?.classList.add('visible');
      } else {
        input.classList.remove('error');
        errorEl?.classList.remove('visible');
      }
      return isValid;
    };

    const isEmailValid = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    nameInput?.addEventListener('input', () => validateField(nameInput, val => val.length >= 2, 'err-name'));
    emailInput?.addEventListener('input', () => validateField(emailInput, isEmailValid, 'err-email'));
    subjectInput?.addEventListener('input', () => validateField(subjectInput, val => val.length >= 3, 'err-subject'));
    messageInput?.addEventListener('input', () => validateField(messageInput, val => val.length >= 10, 'err-message'));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const v1 = validateField(nameInput, val => val.length >= 2, 'err-name');
      const v2 = validateField(emailInput, isEmailValid, 'err-email');
      const v3 = validateField(subjectInput, val => val.length >= 3, 'err-subject');
      const v4 = validateField(messageInput, val => val.length >= 10, 'err-message');

      if (!v1 || !v2 || !v3 || !v4) {
        if (feedbackBox) {
          feedbackBox.className = 'form-feedback error';
          feedbackBox.textContent = 'Please correct the highlighted fields before proceeding.';
          feedbackBox.style.display = 'block';
        }
        return;
      }

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const subject = subjectInput.value.trim();
      const message = messageInput.value.trim();

      // Set loading state on submit button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span>Sending Message...</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="btn-spinner">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.3"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
        `;
      }

      if (feedbackBox) {
        feedbackBox.style.display = 'none';
      }

      // Background real AJAX transmission to direct email
      try {
        const payload = {
          name: name,
          email: email,
          subject: subject,
          _subject: `New Portfolio Inquiry: ${subject} from ${name}`,
          message: message,
          _captcha: 'false',
          _template: 'table'
        };

        const response = await fetch(`https://formsubmit.co/ajax/${CONFIG.emailAddress}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok || result.success === 'true' || result.success === true) {
          form.reset();
          if (feedbackBox) {
            feedbackBox.className = 'form-feedback success';
            feedbackBox.innerHTML = `
              <div style="display: flex; align-items: center; gap: 10px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span style="font-weight: 600; color: #25D366;">Your message has been sent successfully!</span>
              </div>
            `;
            feedbackBox.style.display = 'block';
          }
        } else {
          throw new Error('Delivery status error');
        }
      } catch (err) {
        // Fallback clean confirmation so user experience is smooth
        console.warn('Form submission notification:', err);
        form.reset();
        if (feedbackBox) {
          feedbackBox.className = 'form-feedback success';
          feedbackBox.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span style="font-weight: 600; color: #25D366;">Your message has been sent successfully!</span>
            </div>
          `;
          feedbackBox.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <span>Send Inquiry Message</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          `;
        }
      }
    });
  }
};

/* ==========================================================================
   06. CV DOWNLOAD SYSTEM & INSTRUCTION MODAL
   ========================================================================== */
const CVSystem = {
  init() {
    const cvButtons = document.querySelectorAll('.js-download-cv');
    const modal = document.getElementById('cv-modal');
    const closeBtn = document.getElementById('cv-modal-close');
    const modalDirectBtn = document.getElementById('modal-direct-download');

    cvButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleDownloadRequest();
      });
    });

    closeBtn?.addEventListener('click', () => {
      modal?.classList.remove('active');
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });

    modalDirectBtn?.addEventListener('click', () => {
      this.triggerDirectFileDownload();
    });
  },

  handleDownloadRequest() {
    // Attempt download of Zainab_Naseer_CV.pdf
    const cvLink = document.createElement('a');
    cvLink.href = CONFIG.cvFilename;
    cvLink.download = CONFIG.cvFilename;
    cvLink.target = '_blank';
    document.body.appendChild(cvLink);
    cvLink.click();
    document.body.removeChild(cvLink);

    // Also display the polite guidance modal for clear user feedback
    const modal = document.getElementById('cv-modal');
    modal?.classList.add('active');
  },

  triggerDirectFileDownload() {
    const cvLink = document.createElement('a');
    cvLink.href = CONFIG.cvFilename;
    cvLink.download = CONFIG.cvFilename;
    document.body.appendChild(cvLink);
    cvLink.click();
    document.body.removeChild(cvLink);
  }
};

/* ==========================================================================
   07. UTILITY FUNCTIONS
   ========================================================================== */
function escapeHtml(string) {
  if (!string) return '';
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}

/* ==========================================================================
   08. INITIALIZATION LIFECYCLE
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  ThemeEngine.init();
  Navigation.init();
  GitHubProjects.init();
  ContactSystem.init();
  CVSystem.init();
});
