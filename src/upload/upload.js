// @ts-nocheck
import { auth, db } from "../../firebase/firebase-config.js";
import { ref, push, set, get, update } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { CustomDropdown } from "../dropdown.js";
import { protectPage } from '../../firebase/auth-guard.js'; 


protectPage(); // Ensure only authenticated users can access this page

const CLOUD_NAME = "dqt42pket";
const UPLOAD_PRESET = "vyon_videos";

let currentUser = null;
let categoryDropdown = null;
let editMode = false;
let editVideoId = null;
let existingVideoData = null;

// Check if we're in edit mode
const urlParams = new URLSearchParams(window.location.search);
editVideoId = urlParams.get('edit');
editMode = !!editVideoId;

// Initialize dropdown
window.addEventListener('DOMContentLoaded', async () => {
    categoryDropdown = new CustomDropdown("categoryDropdown", {
        placeholder: "Select a category",
        items: [
            { value: "Valorant", label: "Valorant" },
            { value: "YORU", label: "YORU" },
            { value: "Battle Royale", label: "Battle Royale" },
            { value: "FPS", label: "FPS" },
            { value: "Strategy", label: "Strategy" },
            { value: "Other", label: "Other" }
        ]
    });

    // If in edit mode, load existing video data
    if (editMode && editVideoId) {
        await loadVideoDataForEdit(editVideoId);
    }
});

// Load existing video data for editing
async function loadVideoDataForEdit(videoId) {
    try {
        const videoRef = ref(db, `videos/${videoId}`);
        const snapshot = await get(videoRef);
        
        if (snapshot.exists()) {
            existingVideoData = snapshot.val();
            
            // Pre-fill form fields
            document.getElementById("title").value = existingVideoData.title || '';
            document.getElementById("description").value = existingVideoData.description || '';
            
            // Set category dropdown
            if (categoryDropdown && existingVideoData.category) {
                categoryDropdown.setValue(existingVideoData.category);
            }
            
            // Change page title and button text
            const pageTitle = document.getElementById("pageTitle");
            if (pageTitle) {
                pageTitle.textContent = "Edit Video";
            }
            
            const submitButton = document.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = "Update Video";
            }
            
            // Make file inputs optional when editing
            document.getElementById("thumbnailUrl").removeAttribute("required");
            document.getElementById("videoUrl").removeAttribute("required");
            
            // Add help text
            const thumbInput = document.getElementById("thumbnailUrl");
            const videoInput = document.getElementById("videoUrl");
            
            if (thumbInput.nextElementSibling?.tagName !== 'P') {
                const thumbHelp = document.createElement('p');
                thumbHelp.className = "text-slate-400 text-xs mt-2";
                thumbHelp.textContent = "Leave empty to keep existing thumbnail";
                thumbInput.parentElement.appendChild(thumbHelp);
            }
            
            if (videoInput.nextElementSibling?.tagName !== 'P') {
                const videoHelp = document.createElement('p');
                videoHelp.className = "text-slate-400 text-xs mt-2";
                videoHelp.textContent = "Leave empty to keep existing video";
                videoInput.parentElement.appendChild(videoHelp);
            }
            
            console.log('Loaded video data for editing:', existingVideoData);
        } else {
            console.error('Video not found');
            alert('Video not found!');
            window.location.href = "../manage/manage.html";
        }
    } catch (error) {
        console.error('Error loading video data:', error);
        alert('Error loading video data: ' + error.message);
    }
}

onAuthStateChanged(auth, (user) => {
   if (user) currentUser = user; 
});

function getVideoDuration(file) {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src);
            resolve(video.duration);
        };

        video.onerror = () => reject("Failed to load video metadata");
        video.src = URL.createObjectURL(file);
    });
}

function formatDuration(seconds) {
    seconds = Math.floor(seconds);

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }

    return `${m}:${s.toString().padStart(2, "0")}`;
}


document.getElementById('uploadForm').addEventListener("submit", async (e) => {
    e.preventDefault();

    const status = document.getElementById("status");

    if (!currentUser) {
        status.textContent = "You must be logged in to upload videos.";
        status.className = "mt-4 text-red-400";
        return;
    }

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const category = categoryDropdown ? categoryDropdown.getValue() : "";
    const thumbnailFile = document.getElementById("thumbnailUrl").files[0];
    const videoFile = document.getElementById("videoUrl").files[0];

    // Validation
    if (!title || !description || !category) {
        status.textContent = "Please fill in title, description, and category.";
        status.className = "mt-4 text-red-400";
        return;
    }

    // In create mode, files are required
    if (!editMode && (!thumbnailFile || !videoFile)) {
        status.textContent = "Please select both thumbnail and video files.";
        status.className = "mt-4 text-red-400";
        return;
    }

    status.textContent = editMode ? "Updating video..." : "Uploading video and thumbnail...";
    status.className = "mt-4 text-blue-400";

    try {
        let videoUrl = existingVideoData?.videoUrl;
        let thumbnailUrl = existingVideoData?.thumbnailUrl;

        // Getting the video duration
        let duration = existingVideoData?.duration || "0:00";
        let durationSeconds = existingVideoData?.durationSeconds || 0;

        // Only calculate duration if a new video is uploaded
        if (videoFile) {
            status.textContent = "Reading video duration...";
            durationSeconds = await getVideoDuration(videoFile);
            duration = formatDuration(durationSeconds);
        }


        // Upload new video if provided
        if (videoFile) {
            status.textContent = "Uploading video file...";
            const videoForm = new FormData();
            videoForm.append("file", videoFile);
            videoForm.append("upload_preset", UPLOAD_PRESET);

            const videoRes = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
                { 
                    method: "POST", 
                    body: videoForm 
                }
            );
            const videoData = await videoRes.json();
            videoUrl = videoData.secure_url;
        }

        // Upload new thumbnail if provided
        if (thumbnailFile) {
            status.textContent = "Uploading thumbnail...";
            const thumbForm = new FormData();
            thumbForm.append("file", thumbnailFile);
            thumbForm.append("upload_preset", UPLOAD_PRESET);

            const thumbRes = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                { 
                    method: "POST", 
                    body: thumbForm 
                }
            );
            const thumbData = await thumbRes.json();
            thumbnailUrl = thumbData.secure_url;
        }

        const videoData = {
        title,
        description,
        category,
        videoUrl,
        thumbnailUrl,
        duration,      
        durationSeconds,    
        uploadedBy: currentUser.uid,
        uploaderName: currentUser.displayName || "Anonymous",
        views: existingVideoData?.views || 0
    };


        if (editMode && editVideoId) {
            // Update existing video
            status.textContent = "Saving changes...";
            const videoRef = ref(db, `videos/${editVideoId}`);
            await update(videoRef, {
                ...videoData,
                updatedAt: Date.now()
            });
            
            status.textContent = "Video updated successfully! Redirecting...";
            status.className = "mt-4 text-green-400";
        } else {
            // Create new video
            status.textContent = "Saving video info...";
            const videoRef = push(ref(db, "videos"));
            
            await set(videoRef, {
                id: videoRef.key,
                ...videoData,
                createdAt: Date.now()
            });
            
            status.textContent = "Upload successful! Redirecting...";
            status.className = "mt-4 text-green-400";
        }
        
        setTimeout(() => {
            window.location.href = "../manage/manage.html";
        }, 1500);

    } catch (error) {
        console.error("Upload failed", error);
        status.textContent = "Error: " + error.message;
        status.className = "mt-4 text-red-400";
    }
});