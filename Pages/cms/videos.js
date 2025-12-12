// Pages/cms/videos.js
let videoList = [];

export function loadVideos() {
    // Replace this with real API fetch if needed
    videoList = [
        { id: '1', title: 'Gameplay Video', description: 'Awesome gameplay', category: 'Gameplay', thumbnailUrl: 'https://via.placeholder.com/320x180' },
        { id: '2', title: 'Tutorial Video', description: 'Step by step tutorial', category: 'Tutorial', thumbnailUrl: 'https://via.placeholder.com/320x180' },
        { id: '3', title: 'Live Stream', description: 'Live gameplay session', category: 'Live', thumbnailUrl: 'https://via.placeholder.com/320x180' }
    ];
}

export function getVideos() {
    return videoList;
}

export function deleteVideo(id) {
    videoList = videoList.filter(v => v.id !== id);
}
