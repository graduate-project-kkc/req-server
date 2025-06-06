
// Sample search results data
const searchResultsData = {
    '강아지': [
        { title: '강아지 산책', emoji: '🐕', size: '1.5MB', date: '2024-01-12' },
        { title: '해변의 강아지', emoji: '🐕‍🦺', size: '2.1MB', date: '2024-01-08' }
    ],
    '바다': [
        { title: '바다 풍경', emoji: '🌊', size: '1.8MB', date: '2024-01-14' },
        { title: '해변의 강아지', emoji: '🐕‍🦺', size: '2.1MB', date: '2024-01-08' },
        { title: '일몰 바다', emoji: '🌅', size: '2.9MB', date: '2024-01-05' }
    ],
    '음식': [
        { title: '맛있는 피자', emoji: '🍕', size: '1.9MB', date: '2024-01-10' },
        { title: '스시 세트', emoji: '🍣', size: '2.3MB', date: '2024-01-07' }
    ]
};

// Tab switching
function switchTab(tab ) {
    // Update toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    document.getElementById(tab + '-section').classList.add('active');

    // 특정 탭 진입 시 동작 추가
    if (tab === 'search') {
        console.log("loadPhothoStatus")
        loadPhotoStats();  // 통계 API 요청
    }
}

// File upload handling
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

async function handleFiles(files) {
    if (files.length > 0) {
        alert(`${files.length}개의 파일이 선택되었습니다. 실제 서비스에서는 서버로 업로드됩니다.`);
        // 실제 구현에서는 여기서 FormData를 사용해 multipart/form-data로 서버에 전송
        const formData = new FormData();

        for (let i =0; i < files.length; i++){
            formData.append("files, files[i]"); // files가 key

        }

        return await apiPost("/upload", formData);
    }
}

// Search functionality
async function performSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    
    if (!query) {
        // Show default photos
        resultsContainer.innerHTML = renderDefaultPhtos();
        return;
    }

    // Find matching results
    const results = await apiGet('/search');


    // Display results
    if (results.length > 0) {
        const photosHtml = results.map(photo => `
            <div class="photo-card">
                <div class="photo-img">${photo.emoji}</div>
                <div class="photo-info">
                    <div class="photo-title">${photo.title}</div>
                    <div class="photo-meta">크기: ${photo.size}</div>
                    <div class="photo-meta">업로드: ${photo.date}</div>
                </div>
            </div>
        `).join('');

        resultsContainer.innerHTML = `
            <div style="margin-bottom: 1rem; color: #64748b;">
                "${query}" 검색 결과: ${results.length}개
            </div>
            <div class="photo-grid">${photosHtml}</div>
        `;
    } else {
        resultsContainer.innerHTML = `
            <div class="no-results">
                "${query}"에 대한 검색 결과가 없습니다.
            </div>
        `;
    }
}


async function loadPhotoStats() {
    try {

        const stats = await apiGet('/status'); // { photoCount: 1247, totalSize: "2.4GB" }
        
        document.getElementById('photoCount').textContent = stats.photoCount.toLocaleString();
        document.getElementById('totalSize').textContent = stats.totalSize;
    } catch (error) {
        console.error("사진 통계 오류:", error);
        document.getElementById('photoCount').textContent = "N/A";
        document.getElementById('totalSize').textContent = "N/A";
    }
}



// Login modal
function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
}

function handleLogin() {
    alert('로그인 기능은 실제 서비스에서 구현됩니다.');
    closeLoginModal();
}

// Close modal when clicking outside
document.getElementById('loginModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeLoginModal();
    }
});

// Enter key search
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        performSearch();
    }
});



function renderDefaultPhtos(){
    return `
            <div class="photo-grid" id="defaultPhotos">
                <div class="photo-card">
                    <div class="photo-img">🏔️</div>
                    <div class="photo-info">
                        <div class="photo-title">산악 풍경</div>
                        <div class="photo-meta">크기: 2.1MB</div>
                        <div class="photo-meta">업로드: 2024-01-15</div>
                    </div>
                </div>
                <div class="photo-card">
                    <div class="photo-img">🌊</div>
                    <div class="photo-info">
                        <div class="photo-title">바다 풍경</div>
                        <div class="photo-meta">크기: 1.8MB</div>
                        <div class="photo-meta">업로드: 2024-01-14</div>
                    </div>
                </div>
                <div class="photo-card">
                    <div class="photo-img">🌸</div>
                    <div class="photo-info">
                        <div class="photo-title">벚꽃 축제</div>
                        <div class="photo-meta">크기: 3.2MB</div>
                        <div class="photo-meta">업로드: 2024-01-13</div>
                    </div>
                </div>
                <div class="photo-card">
                    <div class="photo-img">🐕</div>
                    <div class="photo-info">
                        <div class="photo-title">강아지 산책</div>
                        <div class="photo-meta">크기: 1.5MB</div>
                        <div class="photo-meta">업로드: 2024-01-12</div>
                    </div>
                </div>
                <div class="photo-card">
                    <div class="photo-img">🌆</div>
                    <div class="photo-info">
                        <div class="photo-title">도시 야경</div>
                        <div class="photo-meta">크기: 2.7MB</div>
                        <div class="photo-meta">업로드: 2024-01-11</div>
                    </div>
                </div>
                <div class="photo-card">
                    <div class="photo-img">🍕</div>
                    <div class="photo-info">
                        <div class="photo-title">맛있는 피자</div>
                        <div class="photo-meta">크기: 1.9MB</div>
                        <div class="photo-meta">업로드: 2024-01-10</div>
                    </div>
                </div>
            </div>
        `;
}
