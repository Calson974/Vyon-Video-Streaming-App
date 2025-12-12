// Pages/cms/manage/modals.js
let currentDeleteId = null;

export function openDetailsModal(id) {
    const modal = document.getElementById('detailsModal');
    modal.classList.remove('hidden');
    // populate details dynamically if needed
}

export function closeDetailsModal() {
    document.getElementById('detailsModal').classList.add('hidden');
}

export function openDeleteModal(id) {
    currentDeleteId = id;
    document.getElementById('deleteModal').classList.remove('hidden');
}

export function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    currentDeleteId = null;
}

export function confirmDelete(callback) {
    if (currentDeleteId) {
        callback(currentDeleteId);
        closeDeleteModal();
    }
}
