// Pages/cms/manage/manage.js
import { loadVideos, getVideos, deleteVideo } from '../videos.js';
import { openDetailsModal, closeDetailsModal, openDeleteModal, closeDeleteModal, confirmDelete } from './modals.js';
import { CustomDropdown } from '../dropdown.js';

export function initManagePage() {
    const categoryDropdown = new CustomDropdown('filterDropdown', {
        placeholder: 'All Categories',
        items: [
            { value: '', label: 'All Categories' },
            { value: 'Gameplay', label: 'Gameplay' },
            { value: 'Tutorial', label: 'Tutorial' },
            { value: 'Live', label: 'Live' },
        ],
        onChange: renderVideos
    });

    function renderVideos() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = categoryDropdown.getValue();
        const videos = getVideos();

        const filtered = videos.filter(video => 
            (video.title.toLowerCase().includes(searchTerm) || video.description.toLowerCase().includes(searchTerm)) &&
            (!categoryFilter || video.category === categoryFilter)
        );

        const grid = document.getElementById('videosGrid');
        const empty = document.getElementById('emptyState');

        if (!filtered.length) {
            grid.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }

        empty.classList.add('hidden');
        grid.innerHTML = filtered.map(video => generateVideoCard(video)).join('');
    }

    function generateVideoCard(video) {
        return `
            <div class="glass-effect rounded-2xl overflow-hidden card-hover border border-slate-700">
                <div class="relative bg-slate-800" style="padding-bottom: 56.25%;">
                    <img src="${video.thumbnailUrl}" alt="${video.title}" class="absolute inset-0 w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                    <div class="absolute top-3 right-3 category-badge text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">${video.category}</div>
                </div>
                <div class="p-5">
                    <h3 class="font-bold text-xl mb-2 truncate text-slate-100">${video.title}</h3>
                    <p class="text-slate-400 text-sm mb-5">${video.description}</p>
                    <div class="flex gap-2">
                        <button onclick="openDetailsModal('${video.id}')" class="flex-1 bg-slate-700 text-white py-2.5 rounded-lg btn-icon">Details</button>
                        <button onclick="editVideo('${video.id}')" class="flex-1 bg-blue-500 text-white py-2.5 rounded-lg btn-icon">Edit</button>
                        <button onclick="openDeleteModal('${video.id}')" class="bg-red-500 text-white py-2.5 rounded-lg btn-icon">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }

    function editVideo(id) {
        window.location.href = `upload.html?edit=${id}`;
    }

    // Search input
    document.getElementById('searchInput').addEventListener('input', renderVideos);

    // Modals click to close
    document.getElementById('detailsModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeDetailsModal(); });
    document.getElementById('deleteModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeDeleteModal(); });

    window.confirmDelete = () => confirmDelete(deleteVideoAndRender);
    function deleteVideoAndRender(id) {
        deleteVideo(id);
        renderVideos();
    }

    // Initial load
    loadVideos();
    renderVideos();
}
