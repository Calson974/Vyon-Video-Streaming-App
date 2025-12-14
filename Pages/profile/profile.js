import { auth, db } from '/./firebase/firebase-config.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get, set, update, onValue, query, orderByChild, equalTo, remove } from 'firebase/database';

// Global state
let currentUser = null;
let userProfile = null;
let currentVideos = [];
let currentStreams = [];
let videoToDelete = null;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Profile page loaded');
    initAuth();
    setupEventListeners();
});

// ==================== AUTHENTICATION ====================
function initAuth() {
    console.log('Initializing authentication...');
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User authenticated:', user.uid);
            currentUser = user;
            loadUserProfile(user.uid);
        } else {
            console.log('No user authenticated, redirecting to login');
            showToast('Please login to view your profile', 'error');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
        }
    });
}

// ==================== PROFILE LOADING ====================
async function loadUserProfile(uid) {
    console.log('Loading profile for user:', uid);
    showLoading(true, 'Loading your profile...');
    
    try {
        const userRef = ref(db, `users/${uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            userProfile = snapshot.val();
            console.log('Profile loaded:', userProfile);
        } else {
            console.log('No profile found, creating default profile');
            // Create default profile
            userProfile = {
                uid: uid,
                email: currentUser.email,
                displayName: currentUser.displayName || currentUser.email.split('@')[0],
                handle: currentUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
                bio: 'Welcome to my channel! 🎥',
                profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.email.split('@')[0])}&size=120&background=00F5D4&color=121212`,
                followerCount: 0,
                videoCount: 0,
                viewCount: 0,
                streamCount: 0,
                location: '',
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            await set(userRef, userProfile);
            console.log('Default profile created');
        }
        
        displayUserProfile(userProfile);
        await loadUserVideos(uid);
        await loadUserStreams(uid);
        
        // Setup real-time listener
        onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                userProfile = snapshot.val();
                displayUserProfile(userProfile);
            }
        });
        
        showToast('Profile loaded successfully!', 'success');
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Failed to load profile: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== DISPLAY PROFILE ====================
function displayUserProfile(profile) {
    console.log('Displaying profile:', profile);
    
    // Main profile section
    document.getElementById('userName').textContent = profile.displayName || 'Unknown User';
    document.getElementById('userHandle').textContent = `@${profile.handle || 'user'}`;
    document.getElementById('userBio').textContent = profile.bio || 'No bio available';
    document.getElementById('profilePic').src = profile.profilePicture || 'https://ui-avatars.com/api/?name=User&size=120&background=00F5D4&color=121212';
    
    // Stats
    document.getElementById('videoCount').textContent = profile.videoCount || 0;
    document.getElementById('followerCount').textContent = formatNumber(profile.followerCount || 0);
    document.getElementById('viewCount').textContent = formatNumber(profile.viewCount || 0);
    
    // About tab
    document.getElementById('aboutBio').textContent = profile.bio || 'No description available';
    document.getElementById('aboutEmail').textContent = profile.email || 'Not available';
    document.getElementById('aboutJoined').textContent = formatDate(profile.createdAt);
    document.getElementById('aboutLocation').textContent = profile.location || 'Location not set';
    document.getElementById('aboutVideos').textContent = profile.videoCount || 0;
    document.getElementById('aboutViews').textContent = formatNumber(profile.viewCount || 0);
    document.getElementById('aboutFollowers').textContent = formatNumber(profile.followerCount || 0);
    document.getElementById('aboutStreams').textContent = profile.streamCount || 0;
}

// ==================== LOAD VIDEOS ====================
async function loadUserVideos(uid) {
    console.log('Loading videos for user:', uid);
    
    try {
        const videosRef = ref(db, 'videos');
        const userVideosQuery = query(videosRef, orderByChild('userId'), equalTo(uid));
        const snapshot = await get(userVideosQuery);
        
        const videosGrid = document.getElementById('videosGrid');
        const noVideos = document.getElementById('noVideos');
        
        if (snapshot.exists()) {
            currentVideos = [];
            snapshot.forEach((childSnapshot) => {
                currentVideos.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            
            console.log('Loaded videos:', currentVideos.length);
            
            // Sort by upload date (newest first)
            currentVideos.sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));
            
            videosGrid.innerHTML = currentVideos.map(video => createVideoCard(video)).join('');
            noVideos.classList.add('hidden');
            
            // Update video count in profile
            if (currentVideos.length !== userProfile.videoCount) {
                await updateProfileStats({ videoCount: currentVideos.length });
            }
        } else {
            console.log('No videos found');
            videosGrid.innerHTML = '';
            noVideos.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        showToast('Failed to load videos', 'error');
    }
}

// ==================== LOAD STREAMS ====================
async function loadUserStreams(uid) {
    console.log('Loading streams for user:', uid);
    
    try {
        const streamsRef = ref(db, 'streams');
        const userStreamsQuery = query(streamsRef, orderByChild('userId'), equalTo(uid));
        const snapshot = await get(userStreamsQuery);
        
        const streamsGrid = document.getElementById('streamsGrid');
        const noStreams = document.getElementById('noStreams');
        
        if (snapshot.exists()) {
            currentStreams = [];
            snapshot.forEach((childSnapshot) => {
                currentStreams.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            
            console.log('Loaded streams:', currentStreams.length);
            
            // Sort by start date (newest first)
            currentStreams.sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
            
            streamsGrid.innerHTML = currentStreams.map(stream => createStreamCard(stream)).join('');
            noStreams.classList.add('hidden');
            
            // Update stream count in profile
            if (currentStreams.length !== userProfile.streamCount) {
                await updateProfileStats({ streamCount: currentStreams.length });
            }
        } else {
            console.log('No streams found');
            streamsGrid.innerHTML = '';
            noStreams.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading streams:', error);
        showToast('Failed to load streams', 'error');
    }
}

// ==================== CREATE VIDEO CARD ====================
function createVideoCard(video) {
    return `
        <div class="bg-deep-obsidian/60 backdrop-blur-xl border border-electric-mint/20 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition group relative">
            <div class="relative cursor-pointer" onclick="window.location.href='/watch.html?v=${video.id}'">
                <img src="${video.thumbnail || 'https://via.placeholder.com/320x180?text=No+Thumbnail'}" 
                     alt="${escapeHtml(video.title)}" 
                     class="w-full h-48 object-cover"
                     onerror="this.src='https://via.placeholder.com/320x180?text=No+Thumbnail'">
                <span class="absolute bottom-2 right-2 bg-deep-obsidian/90 text-electric-mint text-xs px-2 py-1 rounded border border-electric-mint/30">
                    ${formatDuration(video.duration || 0)}
                </span>
            </div>
            <div class="p-3">
                <h3 class="font-semibold text-crisp-white line-clamp-2 mb-1 cursor-pointer hover:text-electric-mint transition" onclick="window.location.href='/watch.html?v=${video.id}'">
                    ${escapeHtml(video.title || 'Untitled Video')}
                </h3>
                <p class="text-sm text-cool-grey">${formatNumber(video.views || 0)} views • ${formatTimeAgo(video.uploadedAt)}</p>
                <div class="flex items-center space-x-2 mt-2">
                    <button onclick="editVideo('${video.id}')" class="text-xs text-cool-grey hover:text-cyber-violet transition">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button onclick="deleteVideo('${video.id}')" class="text-xs text-cool-grey hover:text-radical-red transition">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                    <button onclick="shareVideo('${video.id}')" class="text-xs text-cool-grey hover:text-electric-mint transition">
                        <i class="fas fa-share mr-1"></i>Share
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ==================== CREATE STREAM CARD ====================
function createStreamCard(stream) {
    const isLive = stream.status === 'live';
    return `
        <div class="bg-deep-obsidian/60 backdrop-blur-xl border border-electric-mint/20 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition relative">
            <div class="relative cursor-pointer" onclick="window.location.href='/stream.html?s=${stream.id}'">
                <img src="${stream.thumbnail || 'https://via.placeholder.com/320x180?text=Stream'}" 
                     alt="${escapeHtml(stream.title)}" 
                     class="w-full h-48 object-cover"
                     onerror="this.src='https://via.placeholder.com/320x180?text=Stream'">
                ${isLive ? '<span class="absolute top-2 left-2 bg-electric-mint text-deep-obsidian text-xs font-bold px-2 py-1 rounded animate-pulse border border-electric-mint/30">● LIVE</span>' : '<span class="absolute top-2 left-2 bg-cool-grey/80 text-crisp-white text-xs font-bold px-2 py-1 rounded">ENDED</span>'}
                ${isLive ? `<span class="absolute bottom-2 right-2 bg-deep-obsidian/90 text-electric-mint text-xs px-2 py-1 rounded border border-electric-mint/30">${formatNumber(stream.viewers || 0)} watching</span>` : ''}
            </div>
            <div class="p-3">
                <h3 class="font-semibold text-crisp-white line-clamp-2 mb-1 cursor-pointer hover:text-electric-mint transition" onclick="window.location.href='/stream.html?s=${stream.id}'">
                    ${escapeHtml(stream.title || 'Untitled Stream')}
                </h3>
                <p class="text-sm text-cool-grey">${isLive ? 'Streaming now' : `Streamed ${formatTimeAgo(stream.startedAt)}`}</p>
                <div class="flex items-center space-x-2 mt-2">
                    ${isLive ? `<button onclick="endStream('${stream.id}')" class="text-xs text-crisp-white bg-radical-red px-2 py-1 rounded hover:bg-radical-red/90 transition border border-radical-red/30"><i class="fas fa-stop mr-1"></i>End Stream</button>` : ''}
                    <button onclick="deleteStream('${stream.id}')" class="text-xs text-cool-grey hover:text-radical-red transition">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            console.log('Tab clicked:', btn.dataset.tab);
            switchTab(btn.dataset.tab);
        });
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Edit profile buttons
    document.getElementById('editProfileBtn').addEventListener('click', openEditModal);
    document.getElementById('editPicBtn').addEventListener('click', openEditModal);
    document.getElementById('editBannerBtn').addEventListener('click', () => {
        showToast('Banner customization coming soon!', 'info');
    });
    
    // Modal controls
    document.getElementById('closeModalBtn').addEventListener('click', closeEditModal);
    
    // Auto-save on input change with debouncing
    let saveTimeouts = {};
    
    document.getElementById('editName').addEventListener('input', (e) => {
        clearTimeout(saveTimeouts.name);
        saveTimeouts.name = setTimeout(() => autoSaveField('displayName', e.target.value.trim(), 'nameSuccess'), 1000);
    });
    
    document.getElementById('editHandle').addEventListener('input', (e) => {
        clearTimeout(saveTimeouts.handle);
        const value = e.target.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        e.target.value = value; // Update input to show cleaned value
        saveTimeouts.handle = setTimeout(() => autoSaveField('handle', value, 'handleSuccess'), 1000);
    });
    
    document.getElementById('editBio').addEventListener('input', (e) => {
        const count = e.target.value.length;
        document.getElementById('bioCount').textContent = count;
        if (count > 500) {
            e.target.value = e.target.value.substring(0, 500);
            document.getElementById('bioCount').textContent = 500;
        }
        clearTimeout(saveTimeouts.bio);
        saveTimeouts.bio = setTimeout(() => autoSaveField('bio', e.target.value.trim(), 'bioSuccess'), 1000);
    });
    
    document.getElementById('editPicUrl').addEventListener('input', (e) => {
        clearTimeout(saveTimeouts.pic);
        const url = e.target.value.trim();
        if (url) {
            document.getElementById('previewPic').src = url;
        }
        saveTimeouts.pic = setTimeout(() => autoSaveField('profilePicture', url, 'picSuccess'), 1500);
    });
    
    // File upload for profile picture
    document.getElementById('picFileInput').addEventListener('change', handleImageUpload);
    
    document.getElementById('editLocation').addEventListener('input', (e) => {
        clearTimeout(saveTimeouts.location);
        saveTimeouts.location = setTimeout(() => autoSaveField('location', e.target.value.trim(), 'locationSuccess'), 1000);
    });
    
    // Upload and Go Live buttons
    document.getElementById('uploadBtn').addEventListener('click', () => {
        window.location.href = '/src/upload/upload.html';
    });
    
    document.getElementById('goLiveBtn')?.addEventListener('click', () => {
        showToast('Live streaming feature coming soon!', 'info');
        // window.location.href = '/go-live.html';
    });
    
    document.getElementById('startStreamBtn')?.addEventListener('click', () => {
        showToast('Live streaming feature coming soon!', 'info');
    });
    
    // Sort videos button
    document.getElementById('sortVideosBtn')?.addEventListener('click', () => {
        currentVideos.reverse();
        document.getElementById('videosGrid').innerHTML = currentVideos.map(video => createVideoCard(video)).join('');
        showToast('Videos sorted!', 'success');
    });
    
    // Delete modal
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    
    // Close modals on backdrop click
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') closeEditModal();
    });
    
    document.getElementById('deleteModal').addEventListener('click', (e) => {
        if (e.target.id === 'deleteModal') closeDeleteModal();
    });
}

// ==================== TAB SWITCHING ====================
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`${tabName}Tab`).classList.remove('hidden');
}

// ==================== EDIT PROFILE MODAL ====================
function openEditModal() {
    console.log('Opening edit modal');
    if (!userProfile) return;
    
    document.getElementById('editName').value = userProfile.displayName || '';
    document.getElementById('editHandle').value = userProfile.handle || '';
    document.getElementById('editBio').value = userProfile.bio || '';
    document.getElementById('bioCount').textContent = (userProfile.bio || '').length;
    document.getElementById('editPicUrl').value = userProfile.profilePicture || '';
    document.getElementById('previewPic').src = userProfile.profilePicture || 'https://ui-avatars.com/api/?name=User&size=120&background=00F5D4&color=121212';
    document.getElementById('editLocation').value = userProfile.location || '';
    document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
    console.log('Closing edit modal');
    document.getElementById('editModal').classList.add('hidden');
}

// ==================== AUTO-SAVE FIELD ====================
async function autoSaveField(fieldName, value, successElementId) {
    if (!currentUser) return;
    
    // Validate based on field
    if (fieldName === 'handle' && (!value || value.length < 3)) {
        console.log('Handle too short, skipping save');
        return;
    }
    
    if (fieldName === 'displayName' && (!value || value.length < 1)) {
        console.log('Display name empty, skipping save');
        return;
    }
    
    console.log('Auto-saving field:', fieldName, value);
    
    try {
        const updates = {
            [fieldName]: value || userProfile[fieldName] || '',
            updatedAt: Date.now()
        };
        
        const userRef = ref(db, `users/${currentUser.uid}`);
        await update(userRef, updates);
        
        console.log('Field saved successfully:', fieldName);
        
        // Show success indicator
        const successElement = document.getElementById(successElementId);
        if (successElement) {
            successElement.classList.remove('hidden');
            setTimeout(() => {
                successElement.classList.add('hidden');
            }, 2000);
        }
        
        // Update local profile
        userProfile[fieldName] = value;
        
    } catch (error) {
        console.error('Error auto-saving field:', error);
        showToast('Failed to save ' + fieldName, 'error');
    }
}

// ==================== HANDLE IMAGE UPLOAD ====================
async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log('Image selected:', file.name, file.size);
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
    }
    
    showLoading(true, 'Uploading image...');
    
    try {
        // Convert image to base64
        const base64 = await convertToBase64(file);
        
        // Update preview
        document.getElementById('previewPic').src = base64;
        
        // Save to Firebase
        await autoSaveField('profilePicture', base64, 'picSuccess');
        
        showToast('Profile picture updated!', 'success');
    } catch (error) {
        console.error('Error uploading image:', error);
        showToast('Failed to upload image: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== CONVERT IMAGE TO BASE64 ====================
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

// ==================== UPDATE PROFILE (REMOVED - NOW AUTO-SAVES) ====================

// ==================== UPDATE PROFILE STATS ====================
async function updateProfileStats(stats) {
    if (!currentUser) return;
    
    try {
        const userRef = ref(db, `users/${currentUser.uid}`);
        await update(userRef, stats);
        console.log('Profile stats updated:', stats);
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// ==================== VIDEO ACTIONS ====================
window.editVideo = function(videoId) {
    console.log('Edit video:', videoId);
    showToast('Video editing coming soon!', 'info');
    // window.location.href = `/edit-video.html?v=${videoId}`;
}

window.deleteVideo = function(videoId) {
    console.log('Delete video requested:', videoId);
    videoToDelete = videoId;
    document.getElementById('deleteModal').classList.remove('hidden');
}

async function confirmDelete() {
    if (!videoToDelete) return;
    
    showLoading(true, 'Deleting video...');
    
    try {
        const videoRef = ref(db, `videos/${videoToDelete}`);
        await remove(videoRef);
        
        console.log('Video deleted:', videoToDelete);
        closeDeleteModal();
        showToast('Video deleted successfully!', 'success');
        
        // Reload videos
        await loadUserVideos(currentUser.uid);
    } catch (error) {
        console.error('Error deleting video:', error);
        showToast('Failed to delete video: ' + error.message, 'error');
    } finally {
        showLoading(false);
        videoToDelete = null;
    }
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    videoToDelete = null;
}

window.shareVideo = function(videoId) {
    console.log('Share video:', videoId);
    const url = `${window.location.origin}/watch.html?v=${videoId}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Check out this video!',
            url: url
        }).then(() => {
            showToast('Shared successfully!', 'success');
        }).catch(err => {
            copyToClipboard(url);
        });
    } else {
        copyToClipboard(url);
    }
}

// ==================== STREAM ACTIONS ====================
window.deleteStream = async function(streamId) {
    console.log('Delete stream:', streamId);
    if (!confirm('Are you sure you want to delete this stream?')) return;
    
    showLoading(true, 'Deleting stream...');
    
    try {
        const streamRef = ref(db, `streams/${streamId}`);
        await remove(streamRef);
        
        console.log('Stream deleted:', streamId);
        showToast('Stream deleted successfully!', 'success');
        await loadUserStreams(currentUser.uid);
    } catch (error) {
        console.error('Error deleting stream:', error);
        showToast('Failed to delete stream: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

window.endStream = async function(streamId) {
    console.log('End stream:', streamId);
    if (!confirm('Are you sure you want to end this stream?')) return;
    
    showLoading(true, 'Ending stream...');
    
    try {
        const streamRef = ref(db, `streams/${streamId}`);
        await update(streamRef, {
            status: 'ended',
            endedAt: Date.now()
        });
        
        console.log('Stream ended:', streamId);
        showToast('Stream ended successfully!', 'success');
        await loadUserStreams(currentUser.uid);
    } catch (error) {
        console.error('Error ending stream:', error);
        showToast('Failed to end stream: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== LOGOUT ====================
async function handleLogout() {
    console.log('Logging out...');
    
    if (!confirm('Are you sure you want to logout?')) return;
    
    showLoading(true, 'Logging out...');
    
    try {
        await signOut(auth);
        console.log('Logged out successfully');
        showToast('Logged out successfully!', 'success');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1000);
    } catch (error) {
        console.error('Error logging out:', error);
        showToast('Failed to logout: ' + error.message, 'error');
        showLoading(false);
    }
}

// ==================== UTILITY FUNCTIONS ====================
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Unknown';
    
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
}

function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Link copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showToast('Link copied to clipboard!', 'success');
    } catch (err) {
        showToast('Failed to copy link', 'error');
    }
    document.body.removeChild(textArea);
}

function showLoading(show, message = 'Loading...') {
    const spinner = document.getElementById('loadingSpinner');
    const loadingText = document.getElementById('loadingText');
    
    if (show) {
        loadingText.textContent = message;
        spinner.classList.remove('hidden');
    } else {
        spinner.classList.add('hidden');
    }
}

function showToast(message, type = 'success') {
    console.log('Toast:', type, message);
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    toastMessage.textContent = message;
    
    // Set icon and colors based on type
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle';
        toast.className = 'fixed bottom-4 right-4 bg-electric-mint text-deep-obsidian px-6 py-3 rounded-lg shadow-lg z-50 border border-electric-mint/30 backdrop-blur-xl';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
        toast.className = 'fixed bottom-4 right-4 bg-radical-red text-crisp-white px-6 py-3 rounded-lg shadow-lg z-50 border border-radical-red/30 backdrop-blur-xl';
    } else if (type === 'info') {
        toastIcon.className = 'fas fa-info-circle';
        toast.className = 'fixed bottom-4 right-4 bg-cyber-violet text-crisp-white px-6 py-3 rounded-lg shadow-lg z-50 border border-cyber-violet/30 backdrop-blur-xl';
    }
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}