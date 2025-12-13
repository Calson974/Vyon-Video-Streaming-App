// @ts-nocheck
import { db } from '../../firebase/firebase-config.js';
import { ref, onValue, remove } from 'firebase/database';
import { CustomDropdown } from '../dropdown.js';

/* ---------------- Video Management ---------------- */
let videos = [];
let deleteVideoId = null;

const filterDropdown = new CustomDropdown('filterDropdownContainer', {
    placeholder:'All Categories',
    items:[
        { value:'', label:'All Categories' },
        { value:'Valorant', label:'Valorant' },
        { value:'YORU', label:'YORU' },
        { value:'Battle Royale', label:'Battle Royale' },
        { value:'FPS', label:'FPS' },
        { value:'Strategy', label:'Strategy' },
        { value:'Other', label:'Other' }
    ],
    onChange: renderVideos
});

// Load videos from Firebase
function loadVideos() {
    const videosRef = ref(db, 'videos');
    onValue(videosRef, (snapshot) => {
        const data = snapshot.val();
        console.log('Firebase data:', data); // Debug log
        
        videos = data ? Object.values(data) : [];
        console.log('Parsed videos:', videos); // Debug log
        
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('videosGrid').classList.remove('hidden');
        
        renderVideos();
    }, (error) => {
        console.error('Error loading videos:', error);
        document.getElementById('loadingState').innerHTML = '<p class="text-red-400">Error loading videos</p>';
    });
}

function renderVideos() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilterValue = filterDropdown.getValue();
    
    const filteredVideos = videos.filter(video => {
        if (!video || !video.title) return false; // Skip invalid videos
        
        const matchesSearch = (video.title || '').toLowerCase().includes(searchTerm) || 
                            (video.description || '').toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilterValue || video.category === categoryFilterValue;
        return matchesSearch && matchesCategory;
    });

    const grid = document.getElementById('videosGrid');
    const emptyState = document.getElementById('emptyState');

    if (filteredVideos.length === 0) {
        grid.innerHTML = '';
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    grid.classList.remove('hidden');
    
    grid.innerHTML = filteredVideos.map(video => `
        <div class="glass-effect rounded-2xl overflow-hidden card-hover border border-slate-700">
            <div class="relative bg-slate-800" style="padding-bottom: 56.25%;">
                <img src="${video.thumbnailUrl}" alt="${video.title}" 
                     class="absolute inset-0 w-full h-full object-cover" 
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 225%22%3E%3Crect fill=%22%231e293b%22 width=%22400%22 height=%22225%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2218%22 fill=%22%2394a3b8%22%3ENo Thumbnail%3C/text%3E%3C/svg%3E'">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                <div class="absolute top-3 right-3 category-badge text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    ${video.category || 'Uncategorized'}
                </div>
                <div class="absolute bottom-3 left-3 flex items-center gap-3 text-xs text-white">
                    <span class="flex items-center gap-1 bg-black bg-opacity-50 px-2 py-1 rounded-lg">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        ${video.views || 0}
                    </span>
                </div>
            </div>
            <div class="p-5">
                <h3 class="font-bold text-xl mb-2 truncate text-slate-100">${video.title || 'Untitled'}</h3>
                <p class="text-slate-400 text-sm mb-5 overflow-hidden" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${video.description || 'No description'}</p>
                <div class="flex gap-2">
                    <button onclick="window.viewDetails('${video.id}')" class="flex-1 bg-slate-700 bg-opacity-50 hover:bg-opacity-70 text-white text-sm font-semibold py-2.5 rounded-lg transition-all btn-icon border border-slate-600">
                        Details
                    </button>
                    <button onclick="window.editVideo('${video.id}')" class="flex-1 bg-blue-500 bg-opacity-80 hover:bg-opacity-100 text-white text-sm font-semibold py-2.5 rounded-lg transition-all btn-icon">
                        Edit
                    </button>
                    <button onclick="window.openDeleteModalHandler('${video.id}')" class="bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all btn-icon">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Make functions globally accessible for onclick handlers
window.viewDetails = function(id) {
    const video = videos.find(v => v.id === id);
    if (!video) return;

    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <div class="space-y-6">
            <div class="rounded-xl overflow-hidden">
                <video src="${video.videoUrl}" controls class="w-full" controlsList="nodownload"></video>
            </div>
            <div>
                <h3 class="text-2xl font-bold mb-3 text-slate-100">${video.title}</h3>
                <span class="inline-block category-badge text-xs font-bold px-3 py-1.5 rounded-full">${video.category}</span>
            </div>
            <div class="bg-slate-800 bg-opacity-50 rounded-xl p-5 border border-slate-700">
                <h4 class="font-bold text-slate-300 mb-2">Description</h4>
                <p class="text-slate-400">${video.description}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-slate-800 bg-opacity-50 rounded-xl p-5 border border-slate-700">
                    <h4 class="font-bold text-slate-300 mb-2">Views</h4>
                    <p class="text-2xl font-bold text-pink-400">${video.views || 0}</p>
                </div>
                <div class="bg-slate-800 bg-opacity-50 rounded-xl p-5 border border-slate-700">
                    <h4 class="font-bold text-slate-300 mb-2">Uploaded By</h4>
                    <p class="text-slate-400 font-semibold">${video.uploaderName || 'Anonymous'}</p>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
};

window.closeDetailsModal = function() {
    document.getElementById('detailsModal').classList.add('hidden');
};

window.editVideo = function(id) {
    window.location.href = `../upload/upload.html?edit=${id}`;
};

window.openDeleteModalHandler = function(id) {
    deleteVideoId = id;
    document.getElementById('deleteModal').classList.remove('hidden');
};

window.closeDeleteModal = function() {
    deleteVideoId = null;
    document.getElementById('deleteModal').classList.add('hidden');
};

window.confirmDelete = async function() {
    if (!deleteVideoId) return;
    
    try {
        const videoRef = ref(db, `videos/${deleteVideoId}`);
        await remove(videoRef);
        
        window.closeDeleteModal();
        // Videos will auto-update via onValue listener
    } catch (error) {
        console.error('Error deleting video:', error);
        alert('Failed to delete video: ' + error.message);
    }
};

// Search input
document.getElementById('searchInput').addEventListener('input', renderVideos);

// Modal click to close
document.getElementById('detailsModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) window.closeDetailsModal();
});

document.getElementById('deleteModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) window.closeDeleteModal();
});

// Initial load
loadVideos();