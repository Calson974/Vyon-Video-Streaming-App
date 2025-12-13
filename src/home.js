
import { auth } from '../firebase/firebase-config.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export function checkAuthState() {
  const signUpBtn = document.getElementById('signUpBtn');
  const loginBtn = document.getElementById('loginBtn');
  const userProfileNav = document.getElementById('userProfileNav');
  const userProfileLetter = document.getElementById('userProfileLetter');
  const userProfileName = document.getElementById('userProfileName');
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      
      if (signUpBtn) signUpBtn.style.display = 'none';
      if (loginBtn) loginBtn.style.display = 'none';
      
      if (userProfileNav) {
        userProfileNav.style.display = 'flex';
        const userName = user.displayName || user.email?.split('@')[0] || 'User';
        if (userProfileLetter) {
          userProfileLetter.textContent = userName.charAt(0).toUpperCase();
        }
        if (userProfileName) {
          userProfileName.textContent = userName;
        }
      }
      
      initializeUserProfileDropdown();
    } else {
      
      if (signUpBtn) signUpBtn.style.display = 'block';
      if (loginBtn) loginBtn.style.display = 'block';
      
      if (userProfileNav) {
        userProfileNav.style.display = 'none';
      }
    }
  });
}

function initializeUserProfileDropdown() {
  const userProfileNav = document.getElementById('userProfileNav');
  let isMenuOpen = false;

  if (userProfileNav) {
    userProfileNav.addEventListener('click', (e) => {
      e.stopPropagation();
      
      isMenuOpen = !isMenuOpen;
      
      if (isMenuOpen) {
        showUserProfileDropdown();
      } else {
        hideUserProfileDropdown();
      }
    });

    document.addEventListener('click', () => {
      if (isMenuOpen) {
        hideUserProfileDropdown();
        isMenuOpen = false;
      }
    });
  }
}

function showUserProfileDropdown() {
  const userProfileNav = document.getElementById('userProfileNav');
  if (!userProfileNav) return;

  hideUserProfileDropdown();

  const menu = document.createElement('div');
  menu.id = 'userProfileDropdown';
  menu.className = 'absolute top-12 right-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 w-48 z-50';
  menu.innerHTML = `
    <a href="#" class="block px-4 py-2 hover:bg-gray-700 text-sm">View Profile</a>
    <a href="/Pages/cms/manage.html" class="block px-4 py-2 hover:bg-gray-700 text-sm">Manage Videos</a>
    <a href="#" class="block px-4 py-2 hover:bg-gray-700 text-sm">Settings</a>
    <hr class="border-gray-700 my-2">
    <button id="logoutBtn" class="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm">Sign Out</button>
  `;
  
  document.body.appendChild(menu);
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

function hideUserProfileDropdown() {
  const menu = document.getElementById('userProfileDropdown');
  if (menu) {
    menu.remove();
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
    
    hideUserProfileDropdown();
    
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

export function initializeCategoryFilters() {
  const categoryButtons = document.querySelectorAll('button[class*="rounded-full"]');
  
  categoryButtons.forEach(button => {
    if (button.id === 'headerMenuBtn' || button.id === 'uploadBtn') {
      return;
    }
    
    if (button.textContent.trim() !== 'All') {
      button.addEventListener('click', () => {
        categoryButtons.forEach(btn => {
          btn.classList.remove('bg-electric-mint', 'text-deep-obsidian');
          btn.classList.add('bg-gray-800');
        });
        
        button.classList.remove('bg-gray-800');
        button.classList.add('bg-electric-mint', 'text-deep-obsidian');
        
      });
    }
  });
}

export function initializeSearch() {
  const searchInput = document.querySelector('input[placeholder*="Search"]');
  const searchButton = searchInput?.nextElementSibling;
  
  if (searchInput && searchButton) {
    const handleSearch = () => {
      const query = searchInput.value.trim();
      if (query) {
      }
    };
    
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
  }
}

export function initializeVideoCards() {
  const videoCards = document.querySelectorAll('.group.cursor-pointer');
  
  videoCards.forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = '/404.html';
    });
  });
}

export function initializeLoadMore() {
  const loadMoreBtn = document.querySelector('button[class*="Load More"]');
  
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      loadMoreBtn.textContent = 'Loading...';
      
      setTimeout(() => {
        loadMoreBtn.textContent = 'Load More Videos';
      }, 1000);
    });
  }
}

export function initializeMobileMenu() {
  const menuBtn = document.querySelector('button i[data-lucide="menu"]')?.parentElement ||
                   document.querySelector('button:has(i[data-lucide="menu"])') ||
                   document.querySelector('button.p-2.hover\\:bg-gray-800') ||
                   document.getElementById('headerMenuBtn');
  
  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isLargeScreen = window.innerWidth >= 1024;
      if (isLargeScreen) {
        toggleSidebar();
      } else {
        toggleMobileMenu();
      }
    });
  } else {
    setTimeout(() => {
      const retryBtn = document.querySelector('button i[data-lucide="menu"]')?.parentElement ||
                       document.querySelector('button:has(i[data-lucide="menu"])') ||
                       document.querySelector('button.p-2.hover\\:bg-gray-800') ||
                       document.getElementById('headerMenuBtn');
      if (retryBtn) {
        retryBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const isLargeScreen = window.innerWidth >= 1024;
          if (isLargeScreen) {
            toggleSidebar();
          } else {
            toggleMobileMenu();
          }
        });
      } else {
      }
    }, 500);
  }

  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSidebar();
    });
  }

  window.addEventListener('resize', () => {
    handleResponsiveLayout();
  });

  handleResponsiveLayout();
}

// Handle responsive layout changes
function handleResponsiveLayout() {
  const sidebar = document.getElementById('pageSidebar');
  const mainContent = document.getElementById('mainContent');
  const isLargeScreen = window.innerWidth >= 1024;

  if (sidebar && mainContent) {
    if (isLargeScreen) {
      // Large screen - show sidebar
      sidebar.classList.remove('hidden');
      sidebar.classList.add('lg:block');
      mainContent.style.marginLeft = sidebar.style.width || '72px';
    } else {
      // Small screen - hide sidebar
      sidebar.classList.add('hidden');
      sidebar.classList.remove('lg:block');
      mainContent.style.marginLeft = '0px';
    }
  }
}

// Toggle Mobile Menu (for small screens)
function toggleMobileMenu() {
  // Check if mobile menu already exists
  let mobileMenu = document.getElementById('mobileMenuOverlay');
  
  if (!mobileMenu) {
    // Create mobile menu as overlay for small screens
    mobileMenu = document.createElement('div');
    mobileMenu.id = 'mobileMenuOverlay';
    mobileMenu.className = 'fixed inset-0 bg-black/95 z-50 flex flex-col lg:hidden';
    mobileMenu.innerHTML = `
      <!-- Menu Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-700">
        <div class="flex items-center space-x-3">
          <button class="p-2 hover:bg-gray-800 rounded-full text-crisp-white" id="closeMobileMenuOverlay">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <div class="flex items-center space-x-1">
            <div class="bg-electric-mint rounded-lg px-2 py-1">
              <span class="text-deep-obsidian font-bold text-lg">V</span>
            </div>
            <span class="text-crisp-white font-bold text-lg">yon</span>
          </div>
        </div>
      </div>
      
      <!-- Menu Items -->
      <div class="py-2">
        <a href="#" class="flex items-center px-4 py-3 hover:bg-gray-800">
          <svg class="w-6 h-6 mr-6 text-crisp-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span class="text-crisp-white">Home</span>
        </a>
        
        <a href="#" class="flex items-center px-4 py-3 hover:bg-gray-800">
          <svg class="w-6 h-6 mr-6 text-crisp-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <span class="text-crisp-white">Trending</span>
        </a>
        
        <a href="#" class="flex items-center px-4 py-3 hover:bg-gray-800">
          <svg class="w-6 h-6 mr-6 text-crisp-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4"></path>
          </svg>
          <span class="text-crisp-white">Subscriptions</span>
        </a>
      </div>
      
      <div class="border-t border-gray-700 my-2"></div>
      
      <!-- Library Section -->
      <div class="py-2">
        <a href="#" class="flex items-center px-4 py-3 hover:bg-gray-800">
          <svg class="w-6 h-6 mr-6 text-crisp-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          <span class="text-crisp-white">Library</span>
        </a>
        
        <a href="#" class="flex items-center px-4 py-3 hover:bg-gray-800">
          <svg class="w-6 h-6 mr-6 text-crisp-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-crisp-white">History</span>
        </a>
      </div>
      
      <div class="border-t border-gray-700 my-2"></div>
      
      <!-- Categories -->
      <div class="py-2">
        <p class="px-4 py-2 text-sm font-semibold text-cool-grey uppercase">CATEGORIES</p>
        <a href="#" class="flex items-center px-4 py-3 hover:bg-gray-800">
          <svg class="w-6 h-6 mr-6 text-crisp-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          <span class="text-crisp-white">Gaming</span>
        </a>
        
        <a href="#" class="flex items-center px-4 py-3 hover:bg-gray-800">
          <svg class="w-6 h-6 mr-6 text-crisp-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
          </svg>
          <span class="text-crisp-white">Music</span>
        </a>
      </div>
    `;
    
    document.body.appendChild(mobileMenu);
    
    // Add close button functionality
    const closeBtn = document.getElementById('closeMobileMenuOverlay');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMobileMenu();
      });
    }
    
    // Close menu on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
    
  } else {
    closeMobileMenu();
  }
}

// Close Mobile Menu
function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenuOverlay');
  if (mobileMenu) {
    mobileMenu.remove();
  }
}

// Toggle Sidebar between compact and expanded
function toggleSidebar() {
  const sidebar = document.getElementById('pageSidebar');
  const mainContent = document.getElementById('mainContent');
  
  if (sidebar && mainContent) {
    const expandedContent = sidebar.querySelectorAll('.sidebar-expanded-content');
    const isExpanded = sidebar.style.width === '240px';
    
    if (isExpanded) {
      // Collapse to compact mode
      sidebar.style.width = '72px';
      mainContent.style.marginLeft = '72px';
      expandedContent.forEach(el => el.classList.add('hidden'));
    } else {
      // Expand to full mode
      sidebar.style.width = '240px';
      mainContent.style.marginLeft = '240px';
      expandedContent.forEach(el => el.classList.remove('hidden'));
    }
  } else {
  }
}

// Auth Button Functionality
export function initializeAuthButtons() {
  const signUpBtn = document.getElementById('signUpBtn');
  const loginBtn = document.getElementById('loginBtn');
  
  if (signUpBtn) {
    signUpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/Pages/auth/auth.html?action=signup';
    });
    
    // Add touch event support for mobile
    signUpBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      window.location.href = '/Pages/auth/auth.html?action=signup';
    });
  }
  
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/Pages/auth/auth.html?action=login';
    });
    
    // Add touch event support for mobile
    loginBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      window.location.href = '/Pages/auth/auth.html?action=login';
    });
  }
}

// Upload Button Functionality
export function initializeUploadButton() {
  const uploadBtn = document.getElementById('uploadBtn');
  
  if (uploadBtn) {
    uploadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Check if user is authenticated
      const user = auth.currentUser;
      if (user) {
        // User is authenticated, redirect to upload page
                window.location.href = '/Pages/cms/upload.html';
      } else {
        // User is not authenticated, redirect to login
                window.location.href = '/Pages/auth/auth.html?action=login&redirect=upload';
      }
    });
    
    // Add touch event support for mobile
    uploadBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      // Check if user is authenticated
      const user = auth.currentUser;
      if (user) {
        // User is authenticated, redirect to upload page
                window.location.href = '/Pages/cms/upload.html';
      } else {
        // User is not authenticated, redirect to login
                window.location.href = '/Pages/auth/auth.html?action=login&redirect=upload';
      }
    });
  }
}

// Show Upload Modal
function showUploadModal() {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.id = 'uploadModal';
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
      <h2 class="text-xl font-semibold mb-4 text-crisp-white">Upload Content</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-cool-grey mb-2">Select File</label>
          <input type="file" id="fileInput" accept="video/*" class="w-full bg-gray-700 text-crisp-white rounded-lg px-3 py-2 focus:outline-none focus:border-electric-mint">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-cool-grey mb-2">Title</label>
          <input type="text" id="videoTitle" placeholder="Enter video title" class="w-full bg-gray-700 text-crisp-white rounded-lg px-3 py-2 focus:outline-none focus:border-electric-mint">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-cool-grey mb-2">Description</label>
          <textarea id="videoDescription" placeholder="Enter video description" rows="3" class="w-full bg-gray-700 text-crisp-white rounded-lg px-3 py-2 focus:outline-none focus:border-electric-mint"></textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-cool-grey mb-2">Category</label>
          <select id="videoCategory" class="w-full bg-gray-700 text-crisp-white rounded-lg px-3 py-2 focus:outline-none focus:border-electric-mint">
            <option value="">Select category</option>
            <option value="gaming">Gaming</option>
            <option value="music">Music</option>
            <option value="education">Education</option>
            <option value="sports">Sports</option>
            <option value="entertainment">Entertainment</option>
            <option value="technology">Technology</option>
          </select>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 mt-6">
        <button id="cancelUpload" class="px-4 py-2 bg-gray-700 text-crisp-white rounded-lg hover:bg-gray-600 transition-colors">
          Cancel
        </button>
        <button id="confirmUpload" class="px-4 py-2 bg-electric-mint text-deep-obsidian rounded-lg hover:bg-opacity-90 transition-colors font-medium">
          Upload
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners
  const cancelBtn = document.getElementById('cancelUpload');
  const confirmBtn = document.getElementById('confirmUpload');
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', hideUploadModal);
  }
  
  if (confirmBtn) {
    confirmBtn.addEventListener('click', handleUpload);
  }
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideUploadModal();
    }
  });
}

// Hide Upload Modal
function hideUploadModal() {
  const modal = document.getElementById('uploadModal');
  if (modal) {
    modal.remove();
  }
}

// Handle Upload
async function handleUpload() {
  const fileInput = document.getElementById('fileInput');
  const title = document.getElementById('videoTitle').value;
  const description = document.getElementById('videoDescription').value;
  const category = document.getElementById('videoCategory').value;
  
  if (!fileInput.files[0]) {
    alert('Please select a file to upload');
    return;
  }
  
  if (!title) {
    alert('Please enter a video title');
    return;
  }
  
  const file = fileInput.files[0];
  
  // Show upload progress
  const confirmBtn = document.getElementById('confirmUpload');
  confirmBtn.textContent = 'Uploading...';
  confirmBtn.disabled = true;
  
  // Simulate upload process (replace with actual upload logic)
  setTimeout(() => {
    hideUploadModal();
    
    // Show success message
    showUploadSuccess();
  }, 2000);
}

// Show Upload Success Message
function showUploadSuccess() {
  const successMessage = document.createElement('div');
  successMessage.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  successMessage.textContent = 'Video uploaded successfully!';
  
  document.body.appendChild(successMessage);
  
  // Remove message after 3 seconds
  setTimeout(() => {
    successMessage.remove();
  }, 3000);
}

// Initialize all components
export function initializeHomePage() {
  checkAuthState(); // Check auth state first
  initializeAuthButtons();
  initializeCategoryFilters();
  initializeSearch();
  initializeVideoCards();
  initializeLoadMore();
  initializeMobileMenu();
  initializeUploadButton(); // Add upload button initialization
}

// Auto-start
setTimeout(() => {
  initializeHomePage();
}, 100);
