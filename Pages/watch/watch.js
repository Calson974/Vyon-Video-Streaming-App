import { auth, db } from "../../firebase/firebase-config"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { ref, set, get, onValue, push, runTransaction } from "firebase/database"

// -------------------- STATE --------------------
let isLoggedIn = false
let currentUserId = null
let currentUserName = "Anonymous"

const urlParams = new URLSearchParams(window.location.search)
const videoId = urlParams.get("v") || "demoVideo1"

// -------------------- DOM ELEMENTS --------------------
const likeBtn = document.getElementById("likeBtn")
const likeCountEl = document.getElementById("likeCount")
const likeIcon = document.getElementById("likeIcon")
const subscribeBtn = document.getElementById("subscribeBtn")
const addCommentBtn = document.getElementById("addCommentBtn")
const commentInput = document.getElementById("commentInput")
const commentList = document.getElementById("commentList")
const commentCountEl = document.getElementById("commentCount")
const loginLink = document.getElementById("loginLink")
const loginPrompt = document.getElementById("loginPrompt")
const recommendedList = document.getElementById("recommendedList")

// -------------------- UI UPDATES --------------------
const updateInteractionUI = () => {
  const elements = [likeBtn, subscribeBtn, addCommentBtn, commentInput]

  elements.forEach((el) => {
    if (el) {
      el.disabled = !isLoggedIn
    }
  })

  // Show/hide login prompt
  if (loginPrompt) {
    loginPrompt.classList.toggle("hidden", isLoggedIn)
  }
}

// -------------------- AUTH STATE --------------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    isLoggedIn = true
    currentUserId = user.uid
    currentUserName = user.displayName || user.email?.split("@")[0] || "User"
    loginLink.textContent = "Logout"
    loginLink.href = "#"

    // Load user-specific like/subscribe state
    await loadUserInteractions()
  } else {
    isLoggedIn = false
    currentUserId = null
    currentUserName = "Anonymous"
    loginLink.textContent = "Login"
    loginLink.href = "/auth.html"
    resetUserState()
  }
  updateInteractionUI()
})

// -------------------- LOGIN/LOGOUT HANDLER --------------------
loginLink.addEventListener("click", async (e) => {
  if (isLoggedIn) {
    e.preventDefault()
    await signOut(auth)
  }
})

// -------------------- LOAD GLOBAL VIDEO DATA --------------------
const loadGlobalVideoData = () => {
  // Listen to global like count
  const likeCountRef = ref(db, `videos/${videoId}/likeCount`)
  onValue(likeCountRef, (snapshot) => {
    const count = snapshot.val() || 0
    likeCountEl.textContent = count
  })

  // Listen to global comments
  const commentsRef = ref(db, `videos/${videoId}/comments`)
  onValue(commentsRef, (snapshot) => {
    const commentsData = snapshot.val()
    renderComments(commentsData)
  })
}

// -------------------- LOAD USER-SPECIFIC INTERACTIONS --------------------
const loadUserInteractions = async () => {
  if (!currentUserId) return

  // Check if user has liked this video
  const userLikeRef = ref(db, `videos/${videoId}/likes/${currentUserId}`)
  const likeSnapshot = await get(userLikeRef)
  const hasLiked = likeSnapshot.exists() && likeSnapshot.val() === true
  updateLikeButton(hasLiked)

  // Check if user has subscribed to the channel
  const channelId = "vyonOfficial" 
  const userSubRef = ref(db, `channels/${channelId}/subscribers/${currentUserId}`)
  const subSnapshot = await get(userSubRef)
  const hasSubscribed = subSnapshot.exists() && subSnapshot.val() === true
  updateSubscribeButton(hasSubscribed)
}

// -------------------- RESET USER STATE --------------------
const resetUserState = () => {
  updateLikeButton(false)
  updateSubscribeButton(false)
}

// -------------------- RENDER COMMENTS --------------------
const renderComments = (commentsData) => {
  commentList.innerHTML = ""

  if (!commentsData) {
    commentCountEl.textContent = "0"
    return
  }

  
  const commentsArray = Object.entries(commentsData)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

  commentCountEl.textContent = commentsArray.length

  commentsArray.forEach((comment) => {
    const div = document.createElement("div")
    div.className = "flex gap-3 p-3 bg-[#1a1a1a] rounded"
    div.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-[#7F5AF0] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        ${(comment.userName || "A").charAt(0).toUpperCase()}
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-white text-sm">${escapeHtml(comment.userName || "Anonymous")}</p>
        <p class="text-[#94A1B2] text-sm mt-1 break-words">${escapeHtml(comment.text)}</p>
      </div>
    `
    commentList.appendChild(div)
  })
}

// -------------------- UPDATE BUTTON STATES --------------------
const updateLikeButton = (isLiked) => {
  if (isLiked) {
    likeBtn.classList.add("like-active")
    likeIcon.setAttribute("fill", "currentColor")
  } else {
    likeBtn.classList.remove("like-active")
    likeIcon.setAttribute("fill", "none")
  }
  likeBtn.dataset.liked = isLiked
}

const updateSubscribeButton = (isSubscribed) => {
  if (isSubscribed) {
    subscribeBtn.textContent = "Subscribed"
    subscribeBtn.classList.add("subscribed")
  } else {
    subscribeBtn.textContent = "Subscribe"
    subscribeBtn.classList.remove("subscribed")
  }
  subscribeBtn.dataset.subscribed = isSubscribed
}

// -------------------- LIKE HANDLER --------------------
likeBtn.addEventListener("click", async () => {
  if (!isLoggedIn) {
    alert("Please log in to like this video.")
    return
  }

  const currentlyLiked = likeBtn.dataset.liked === "true"
  const newLikedState = !currentlyLiked

  // Optimistic UI update
  updateLikeButton(newLikedState)

  try {
    // Update user's like status
    const userLikeRef = ref(db, `videos/${videoId}/likes/${currentUserId}`)
    await set(userLikeRef, newLikedState ? true : null)

    // Update global like count using transaction
    const likeCountRef = ref(db, `videos/${videoId}/likeCount`)
    await runTransaction(likeCountRef, (currentCount) => {
      if (currentCount === null) {
        return newLikedState ? 1 : 0
      }
      return newLikedState ? currentCount + 1 : Math.max(0, currentCount - 1)
    })
  } catch (error) {
    console.error("Error updating like:", error)
    // Revert on error
    updateLikeButton(currentlyLiked)
  }
})

// -------------------- SUBSCRIBE HANDLER --------------------
subscribeBtn.addEventListener("click", async () => {
  if (!isLoggedIn) {
    alert("Please log in to subscribe.")
    return
  }

  const channelId = "vyonOfficial" 
  const currentlySubscribed = subscribeBtn.dataset.subscribed === "true"
  const newSubscribedState = !currentlySubscribed

  // Optimistic UI update
  updateSubscribeButton(newSubscribedState)

  try {
    const userSubRef = ref(db, `channels/${channelId}/subscribers/${currentUserId}`)
    await set(userSubRef, newSubscribedState ? true : null)
  } catch (error) {
    console.error("Error updating subscription:", error)
    // Revert on error
    updateSubscribeButton(currentlySubscribed)
  }
})

// -------------------- COMMENT HANDLER --------------------
addCommentBtn.addEventListener("click", async () => {
  if (!isLoggedIn) {
    alert("Please log in to comment.")
    return
  }

  const text = commentInput.value.trim()
  if (!text) return

  try {
    const commentsRef = ref(db, `videos/${videoId}/comments`)
    await push(commentsRef, {
      userId: currentUserId,
      userName: currentUserName,
      text: text,
      timestamp: Date.now(),
    })
    commentInput.value = ""
  } catch (error) {
    console.error("Error adding comment:", error)
    alert("Failed to add comment. Please try again.")
  }
})

// -------------------- RENDER RECOMMENDED VIDEOS --------------------
const renderRecommendedVideos = () => {
  const recommendedVideos = [
    {
      id: "rec1",
      title: "Another Live Stream",
      views: "2.4k watching",
      thumbnail: "https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg",
    },
    {
      id: "rec2",
      title: "Nature Camera Feed",
      views: "9k watching",
      thumbnail: "https://i.ytimg.com/vi/YE7VzlLtp-4/hqdefault.jpg",
    },
    {
      id: "rec3",
      title: "Tech Talk Live",
      views: "1.1k watching",
      thumbnail: "https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg",
    },
  ]

  recommendedList.innerHTML = recommendedVideos
    .map(
      (video) => `
      <a href="/watch.html?v=${video.id}" class="flex gap-3 cursor-pointer hover:bg-[#7F5AF0]/20 p-2 rounded transition-colors">
        <img src="${video.thumbnail}" alt="${escapeHtml(video.title)}" class="w-40 h-24 rounded object-cover flex-shrink-0" />
        <div class="flex flex-col min-w-0">
          <p class="font-semibold text-white text-sm line-clamp-2">${escapeHtml(video.title)}</p>
          <span class="text-[#94A1B2] text-xs mt-1">${video.views}</span>
        </div>
      </a>
    `,
    )
    .join("")
}

// -------------------- UTILITY FUNCTIONS --------------------
const escapeHtml = (text) => {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// -------------------- INITIALIZE --------------------
loadGlobalVideoData()
renderRecommendedVideos()
