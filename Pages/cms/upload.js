// @ts-nocheck
import { auth, db } from "../../firebase/firebase-config";
import { ref, push, set } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

const CLOUD_NAME = "dqt42pket";
const UPLOAD_PRESET = "vyon_videos";


const status = document.getElementById("status");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
   if (user) currentUser = user; 
});

document.getElementById('uploadForm').addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentUser) return;

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    // const catergory = categoryDropdown.getValue() || "";
    const thumbnailFile = document.getElementById("thumbnailUrl").files[0];
    const videoFile = document.getElementById("videoUrl").files[0];

    if (!title || !description || !thumbnailFile || !videoFile) {
        status.textContent = "Please fill in all required fields.";
        return;
    }

    status.textContent = "Uploading video and thumbnail...";


    try{

        // uploading video to cloudinary
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

        // uploading thumbnail to cloudinary
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

        // saving video info to realtime database
        const videoRef = push(ref(db, "videos"));

        await set(videoRef, {
            id: videoRef.key,
            title,
            description,
            // catergory,
            videoUrl: videoData.secure_url,
            thumbnailUrl: thumbData.secure_url,
            uploadedBy: currentUser.uid,
            uploaderName: currentUser.displayName || "Anonymous",
            createdAt: Date.now(),
            views: 0
        });

        status.textContent = "Upload successful!";
        e.target.reset();

    } catch (error) {
        console.error("Upload failed", error);
        status.textContent = "Error uploading files: " + error.message;
        return;
    }
});