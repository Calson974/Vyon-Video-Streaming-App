import './style.css'
import homePageContent from '../Pages/Home.html?raw'
import { 
  createIcons,
  Menu,
  Search,
  Video,
  Bell,
  User,
  Filter,
  ChevronDown
} from 'lucide';
import { auth } from '../firebase/firebase-config.js';
import { onAuthStateChanged } from 'firebase/auth';

async function loadHomePage() {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(homePageContent, 'text/html')
    
    const bodyContent = doc.body.innerHTML
    
    const appContainer = document.querySelector('#app')
    appContainer.innerHTML = bodyContent
    
    createIcons({
      icons: {
        Menu,
        Search,
        Video,
        Bell,
        User,
        Filter,
        ChevronDown
      }
    });
    
    const hamburgerBtn = document.getElementById('headerMenuBtn');
    
    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        let mobileMenu = document.getElementById('mobileMenuOverlay');
        
        if (!mobileMenu) {
          mobileMenu = document.createElement('div');
          mobileMenu.id = 'mobileMenuOverlay';
          mobileMenu.className = 'fixed inset-0 bg-black/95 z-50 flex flex-col lg:hidden';
          
          const isAuthenticated = auth.currentUser !== null;
          
          mobileMenu.innerHTML = `
            <div class="flex items-center justify-between p-4 border-b border-gray-700">
              <div class="flex items-center space-x-3">
                <button onclick="this.closest('#mobileMenuOverlay').remove()" class="p-2 hover:bg-gray-800 rounded-full text-crisp-white">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
                <div class="flex items-center space-x-2">
                  ${isAuthenticated ? `
                    <div class="w-8 h-8 bg-electric-mint rounded-full flex items-center justify-center">
                      <span class="text-deep-obsidian font-bold text-sm">${(auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User').charAt(0).toUpperCase()}</span>
                    </div>
                    <span class="text-crisp-white font-medium">${auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User'}</span>
                  ` : `
                    <svg class="w-8 h-8 text-crisp-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span class="text-crisp-white font-medium">Guest</span>
                  `}
                </div>
              </div>
            </div>
            
            <div class="py-4">
              <div class="grid grid-cols-2 gap-4 px-4">
                <a href="/" class="flex flex-col items-center space-y-2 p-3 hover:bg-gray-800 rounded-lg" onclick="window.location.href='/'; this.closest('#mobileMenuOverlay').remove();">
                  <svg class="w-8 h-8 text-crisp-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  <span class="text-xs text-crisp-white">Home</span>
                </a>
                
                ${isAuthenticated ? `
                <a href="/Pages/cms/manage.html" class="flex flex-col items-center space-y-2 p-3 hover:bg-gray-800 rounded-lg" onclick="window.location.href='/Pages/cms/manage.html'; this.closest('#mobileMenuOverlay').remove();">
                  <svg class="w-8 h-8 text-crisp-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span class="text-xs text-crisp-white">Manage</span>
                </a>
                ` : ''}
              </div>
            </div>
          `;
          document.body.appendChild(mobileMenu);
        } else {
          mobileMenu.remove();
        }
      });
    } else {
    }
    
  } catch (error) {
    console.error('Error loading Home page:', error)
    document.querySelector('#app').innerHTML = '<p>Error loading page</p>'
  }
}

loadHomePage()

import('./home.js').then(module => {
  module.initializeHomePage();
}).catch(error => {
  console.error('Error loading home.js:', error);
});
