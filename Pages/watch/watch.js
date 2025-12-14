import { auth, db } from "../../firebase/firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, set, get, onValue, push, runTransaction } from "firebase/database";

// -------------------- STATE --------------------
let isLoggedIn = false;
let currentUserId = null;
let currentUserName = "Anonymous";

const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get("v");
const channelId = "vyonOfficial";

// -------------------- DOM ELEMENTS --------------------
const likeBtn = document.getElementById("likeBtn");
const likeCountEl = document.getElementById("likeCount");
const likeIcon = document.getElementById("likeIcon");
const subscribeBtn = document.getElementById("subscribeBtn");
const subscriberCountEl = document.getElementById("subscriberCount");
const addCommentBtn = document.getElementById("addCommentBtn");
const commentInput = document.getElementById("commentInput");
const commentList = document.getElementById("commentList");
const commentCountEl = document.getElementById("commentCount");
const loginLink = document.getElementById("loginLink");
const loginPrompt = document.getElementById("loginPrompt");
const recommendedList = document.getElementById("recommendedList");
const viewsCountEl = document.getElementById("viewsCount"); // New element for views

// -------------------- UI UPDATES --------------------
const updateInteractionUI = () => {
  const elements = [likeBtn, subscribeBtn, addCommentBtn, commentInput];

  elements.forEach((el) => {
    if (el) el.disabled = !isLoggedIn;
  });

  if (loginPrompt) {
    loginPrompt.classList.toggle("hidden", isLoggedIn);
  }
};

// -------------------- AUTH STATE --------------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    isLoggedIn = true;
    currentUserId = user.uid;
    currentUserName = user.displayName || user.email?.split("@")[0] || "User";
    channelName.textContent = user.displayName || user.email?.split("@")[0] || "User";
    loginLink.textContent = "Logout";
    loginLink.href = "#";

    await loadUserInteractions();
  } else {
    isLoggedIn = false;
    currentUserId = null;
    currentUserName = "Anonymous";
    loginLink.textContent = "Login";
    loginLink.href = "/auth.html";
    resetUserState();
  }
  updateInteractionUI();
});

// -------------------- LOGIN/LOGOUT HANDLER --------------------
loginLink.addEventListener("click", async (e) => {
  if (isLoggedIn) {
    e.preventDefault();
    await signOut(auth);
  }
});

// -------------------- LOAD GLOBAL VIDEO DATA --------------------
const loadGlobalVideoData = () => {
  // Increment views
  incrementViews();

  // Listen to global like count
  const likeCountRef = ref(db, `videos/${videoId}/likeCount`);
  onValue(likeCountRef, (snapshot) => {
    const count = snapshot.val() || 0;
    likeCountEl.textContent = count;
  });

  // Listen to global views
  const viewsRef = ref(db, `videos/${videoId}/views`);
  onValue(viewsRef, (snapshot) => {
    const count = snapshot.val() || 0;
    if (viewsCountEl) viewsCountEl.textContent = `${formatCount(count)} views`;
  });

  const subscriberCountRef = ref(db, `channels/${channelId}/subscriberCount`);
  onValue(subscriberCountRef, (snapshot) => {
    const count = snapshot.val() || 0;
    subscriberCountEl.textContent = formatCount(count) + " subscribers";
  });

  // Listen to global comments
  const commentsRef = ref(db, `videos/${videoId}/comments`);
  onValue(commentsRef, (snapshot) => {
    const commentsData = snapshot.val();
    renderComments(commentsData);
  });
};

// -------------------- INCREMENT VIEWS --------------------
const incrementViews = () => {
  const viewsRef = ref(db, `videos/${videoId}/views`);
  runTransaction(viewsRef, (current) => (current || 0) + 1);
};

// -------------------- LOAD USER-SPECIFIC INTERACTIONS --------------------
const loadUserInteractions = async () => {
  if (!currentUserId) return;

  const userLikeRef = ref(db, `videos/${videoId}/likes/${currentUserId}`);
  const likeSnapshot = await get(userLikeRef);
  const hasLiked = likeSnapshot.exists() && likeSnapshot.val() === true;
  updateLikeButton(hasLiked);

  const userSubRef = ref(db, `channels/${channelId}/subscribers/${currentUserId}`);
  const subSnapshot = await get(userSubRef);
  const hasSubscribed = subSnapshot.exists() && subSnapshot.val() === true;
  updateSubscribeButton(hasSubscribed);
};

// -------------------- RESET USER STATE --------------------
const resetUserState = () => {
  updateLikeButton(false);
  updateSubscribeButton(false);
};

// -------------------- RENDER COMMENTS --------------------
const renderComments = (commentsData) => {
  commentList.innerHTML = "";

  if (!commentsData) {
    commentCountEl.textContent = "0";
    return;
  }

  const commentsArray = Object.entries(commentsData)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  commentCountEl.textContent = commentsArray.length;

  commentsArray.forEach((comment) => {
    const div = document.createElement("div");
    div.className = "flex gap-3 p-3 bg-[#1a1a1a] rounded";
    div.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-[#7F5AF0] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        ${(comment.userName || "A").charAt(0).toUpperCase()}
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-white text-sm">${escapeHtml(comment.userName || "Anonymous")}</p>
        <p class="text-[#94A1B2] text-sm mt-1 break-words">${escapeHtml(comment.text)}</p>
      </div>
    `;
    commentList.appendChild(div);
  });
};

// -------------------- UPDATE BUTTON STATES --------------------
const updateLikeButton = (isLiked) => {
  if (isLiked) {
    likeBtn.classList.add("like-active");
    likeIcon.setAttribute("fill", "currentColor");
  } else {
    likeBtn.classList.remove("like-active");
    likeIcon.setAttribute("fill", "none");
  }
  likeBtn.dataset.liked = isLiked;
};

const updateSubscribeButton = (isSubscribed) => {
  if (isSubscribed) {
    subscribeBtn.textContent = "Subscribed";
    subscribeBtn.classList.add("subscribed");
  } else {
    subscribeBtn.textContent = "Subscribe";
    subscribeBtn.classList.remove("subscribed");
  }
  subscribeBtn.dataset.subscribed = isSubscribed;
};

// -------------------- LIKE HANDLER --------------------
likeBtn.addEventListener("click", async () => {
  if (!isLoggedIn) {
    alert("Please log in to like this video.");
    return;
  }

  const currentlyLiked = likeBtn.dataset.liked === "true";
  const newLikedState = !currentlyLiked;

  updateLikeButton(newLikedState);

  try {
    const userLikeRef = ref(db, `videos/${videoId}/likes/${currentUserId}`);
    await set(userLikeRef, newLikedState ? true : null);

    const likeCountRef = ref(db, `videos/${videoId}/likeCount`);
    await runTransaction(likeCountRef, (currentCount) => {
      if (currentCount === null) return newLikedState ? 1 : 0;
      return newLikedState ? currentCount + 1 : Math.max(0, currentCount - 1);
    });
  } catch (error) {
    console.error("Error updating like:", error);
    updateLikeButton(currentlyLiked);
  }
});

// -------------------- SUBSCRIBE HANDLER --------------------
subscribeBtn.addEventListener("click", async () => {
  if (!isLoggedIn) {
    alert("Please log in to subscribe.");
    return;
  }

  const currentlySubscribed = subscribeBtn.dataset.subscribed === "true";
  const newSubscribedState = !currentlySubscribed;

  updateSubscribeButton(newSubscribedState);

  try {
    const userSubRef = ref(db, `channels/${channelId}/subscribers/${currentUserId}`);
    await set(userSubRef, newSubscribedState ? true : null);

    const subscriberCountRef = ref(db, `channels/${channelId}/subscriberCount`);
    await runTransaction(subscriberCountRef, (currentCount) => {
      if (currentCount === null) return newSubscribedState ? 1 : 0;
      return newSubscribedState ? currentCount + 1 : Math.max(0, currentCount - 1);
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    updateSubscribeButton(currentlySubscribed);
  }
});

// -------------------- COMMENT HANDLER --------------------
addCommentBtn.addEventListener("click", async () => {
  if (!isLoggedIn) {
    alert("Please log in to comment.");
    return;
  }

  const text = commentInput.value.trim();
  if (!text) return;

  try {
    const commentsRef = ref(db, `videos/${videoId}/comments`);
    await push(commentsRef, {
      userId: currentUserId,
      userName: currentUserName,
      text: text,
      timestamp: Date.now(),
    });
    commentInput.value = "";
  } catch (error) {
    console.error("Error adding comment:", error);
    alert("Failed to add comment. Please try again.");
  }
});

// -------------------- RENDER RECOMMENDED VIDEOS --------------------

const loadRecommendedVideos = () => {
  const videosRef = ref(db, "videos");
  onValue(videosRef, (snapshot) => {
    const videosData = snapshot.val();
    if (!videosData) return;

    const videosArray = Object.entries(videosData)
      .map(([id, data]) => ({ id, ...data }))
      .filter(v => v.id !== videoId)
      .slice(0, 5);

    recommendedList.innerHTML = ""; // clear first

    videosArray.forEach(video => {
      const a = document.createElement("a");
      a.href = "#"; // prevent default navigation
      a.className = "flex gap-3 cursor-pointer hover:bg-[#7F5AF0]/20 p-2 rounded transition-colors";

      a.innerHTML = `
        <img src="${video.thumbnailUrl}" 
             alt="${video.title}" class="w-40 h-24 rounded object-cover flex-shrink-0" />
        <div class="flex flex-col min-w-0">
          <p class="font-semibold text-white text-sm line-clamp-2">${video.title}</p>
          <span class="text-[#94A1B2] text-xs mt-1">${formatCount(video.views || 0)} views</span>
        </div>
      `;

      a.addEventListener("click", async (e) => {
        e.preventDefault();
        const videoRef = ref(db, `videos/${video.id}/views`);
        await runTransaction(videoRef, (current) => (current || 0) + 1);
        window.location.href = `/Pages/watch/watch.html?v=${video.id}`;
      });

      recommendedList.appendChild(a);
    });
  });
};



// -------------------- UTILITY FUNCTIONS --------------------
const escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

const formatCount = (count) => {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
  if (count >= 1000) return (count / 1000).toFixed(1) + "k";
  return count.toString();
};





if (!videoId) {
  alert("No video specified");
  window.location.href = "/";
}

const videoPlayer = document.getElementById("videoPlayer");
const videoTitle = document.getElementById("videoTitle");
const videoDescription = document.getElementById("videoDescription");
const channelName = document.getElementById("channelName");
const viewsCount = document.getElementById("viewCount");

const loadVideoData = async () => {
  try {
    const videoRef = ref(db, `videos/${videoId}`);
    const snapshot = await get(videoRef);

    if (!snapshot.exists()) {
      // Video doesn't exist
      alert("Video not found");
      window.location.href = "/";
      return;
    }

    const videoData = snapshot.val();

    // Update HTML elements
    videoPlayer.src = videoData.videoUrl || "";
    videoTitle.textContent = videoData.title || "Untitled";
    videoDescription.textContent = videoData.description || "";
    channelName.textContent = videoData.channelName || "Unknown";
    viewsCount.textContent = `${videoData.views || 0} watching`;

    // Increment views safely
    const viewsRef = ref(db, `videos/${videoId}/views`);
    await runTransaction(viewsRef, (current) => (current || 0) + 1);

  } catch (error) {
    console.error("Error loading video:", error);
  }
};

// loadVideoData();



// -------------------- INITIALIZE --------------------
loadGlobalVideoData();
loadRecommendedVideos();
loadVideoData();
