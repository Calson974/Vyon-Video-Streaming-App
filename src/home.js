// Home page functionality

// Import Firebase auth functions
import { auth } from '../firebase/firebase-config.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Check authentication state and update UI
export function checkAuthState() {
  const signUpBtn = document.getElementById('signUpBtn');
  const loginBtn = document.getElementById('loginBtn');
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      
      
      // Hide auth buttons and show user menu
      if (signUpBtn) signUpBtn.style.display = 'none';
      if (loginBtn) loginBtn.style.display = 'none';
      
      // Create and show user menu button
      showUserMenuButton(user);
    } else {
      // User is signed out
      
      
      // Show auth buttons and hide user menu
      if (signUpBtn) signUpBtn.style.display = 'block';
      if (loginBtn) loginBtn.style.display = 'block';
      
      // Hide user menu button
      hideUserMenuButton();
    }
  });
}

// Show user menu button when signed in
function showUserMenuButton(user) {
  const rightSection = document.querySelector('.flex.items-center.space-x-3');
  if (!rightSection) return;
  
  // Remove existing user menu button if it exists
  hideUserMenuButton();
  
  // Create user menu button
  const userMenuBtn = document.createElement('button');
  userMenuBtn.id = 'userMenuBtn';
  userMenuBtn.className = 'w-10 h-10 bg-electric-mint rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors';
  userMenuBtn.innerHTML = `
    <span class="text-deep-obsidian font-semibold text-sm">
      ${user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
    </span>
  `;
  
  // Insert user menu button before the existing buttons
  rightSection.insertBefore(userMenuBtn, rightSection.firstChild);
  
  // Initialize user menu dropdown
  initializeUserMenu();
}

// Hide user menu button
function hideUserMenuButton() {
  const userMenuBtn = document.getElementById('userMenuBtn');
  if (userMenuBtn) {
    userMenuBtn.remove();
  }
}

// User Menu Dropdown
export function initializeUserMenu() {
  const userMenuBtn = document.getElementById('userMenuBtn');
  let isMenuOpen = false;

  if (userMenuBtn) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Toggle menu
      isMenuOpen = !isMenuOpen;
      
      if (isMenuOpen) {
        showUserMenu();
      } else {
        hideUserMenu();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
      if (isMenuOpen) {
        hideUserMenu();
        isMenuOpen = false;
      }
    });
  }
}

function showUserMenu() {
  const userMenuBtn = document.getElementById('userMenuBtn');
  if (!userMenuBtn) return;

  const menu = document.createElement('div');
  menu.id = 'userDropdown';
  menu.className = 'absolute top-12 right-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 w-48 z-50';
  menu.innerHTML = `
    <a href="#" class="block px-4 py-2 hover:bg-gray-700 text-sm">View Profile</a>
    <a href="#" class="block px-4 py-2 hover:bg-gray-700 text-sm">Manage Videos</a>
    <a href="#" class="block px-4 py-2 hover:bg-gray-700 text-sm">Settings</a>
    <hr class="border-gray-700 my-2">
    <button id="logoutBtn" class="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm">Sign Out</button>
  `;
  
  document.body.appendChild(menu);
  
  // Add logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

function hideUserMenu() {
  const menu = document.getElementById('userDropdown');
  if (menu) {
    menu.remove();
  }
}

// Handle logout functionality
async function handleLogout() {
  try {
    // Sign out from Firebase
    await signOut(auth);
    
    // Hide menu
    hideUserMenu();
    
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

// Category Filter Functionality
export function initializeCategoryFilters() {
  const categoryButtons = document.querySelectorAll('button[class*="rounded-full"]');
  
  categoryButtons.forEach(button => {
    if (button.textContent.trim() !== 'All') {
      button.addEventListener('click', () => {
        // Remove active state from all buttons
        categoryButtons.forEach(btn => {
          btn.classList.remove('bg-electric-mint', 'text-deep-obsidian');
          btn.classList.add('bg-gray-800');
        });
        
        // Add active state to clicked button
        button.classList.remove('bg-gray-800');
        button.classList.add('bg-electric-mint', 'text-deep-obsidian');
        
        console.log(`Filtering by category: ${button.textContent}`);
      });
    }
  });
}

// Search Functionality
export function initializeSearch() {
  const searchInput = document.querySelector('input[placeholder*="Search"]');
  const searchButton = searchInput?.nextElementSibling;
  
  if (searchInput && searchButton) {
    const handleSearch = () => {
      const query = searchInput.value.trim();
      if (query) {
        console.log(`Searching for: ${query}`);
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

// Video Card Click Handlers
export function initializeVideoCards() {
  const videoCards = document.querySelectorAll('.group.cursor-pointer');
  
  videoCards.forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = '/404.html';
    });
  });
}

// Load More Videos
export function initializeLoadMore() {
  const loadMoreBtn = document.querySelector('button[class*="Load More"]');
  
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      console.log('Loading more videos...');
      loadMoreBtn.textContent = 'Loading...';
      
      setTimeout(() => {
        loadMoreBtn.textContent = 'Load More Videos';
        console.log('More videos loaded');
      }, 1000);
    });
  }
}

// Responsive Menu Toggle (for mobile)
export function initializeMobileMenu() {
  const menuBtn = document.querySelector('button i[data-lucide="menu"]')?.parentElement;
  
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      console.log('Mobile menu toggle');
    });
  }
}

// Auth Button Functionality
export function initializeAuthButtons() {
  const signUpBtn = document.getElementById('signUpBtn');
  const loginBtn = document.getElementById('loginBtn');
  
  if (signUpBtn) {
    signUpBtn.addEventListener('click', () => {
      window.location.href = '/Pages/auth/auth.html?action=signup';
    });
  }
  
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      window.location.href = '/Pages/auth/auth.html?action=login';
    });
  }
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
}

// Auto-start
setTimeout(() => {
  initializeHomePage();
}, 100);
