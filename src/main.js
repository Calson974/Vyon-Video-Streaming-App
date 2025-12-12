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

// Load and render Home page
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
