// Sample search results data
const searchResultsData = {
    "강아지": [
        { title: "강아지 산책", emoji: "🐕", size: "1.5MB", date: "2024-01-12" },
        { title: "해변의 강아지", emoji: "🐕‍🦺", size: "2.1MB", date: "2024-01-08" },
    ],
    "바다": [
        { title: "바다 풍경", emoji: "🌊", size: "1.8MB", date: "2024-01-14" },
        { title: "해변의 강아지", emoji: "🐕‍🦺", size: "2.1MB", date: "2024-01-08" },
        { title: "일몰 바다", emoji: "🌅", size: "2.9MB", date: "2024-01-05" },
    ],
    "음식": [
        { title: "맛있는 피자", emoji: "🍕", size: "1.9MB", date: "2024-01-10" },
        { title: "스시 세트", emoji: "🍣", size: "2.3MB", date: "2024-01-07" },
    ],
};

// Tab switching
function switchTab(tab) {
    // Update toggle buttons
    document.querySelectorAll(".toggle-btn").forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");

    // Update content sections
    document.querySelectorAll(".content-section").forEach((section) => section.classList.remove("active"));
    document.getElementById(tab + "-section").classList.add("active");

    // 특정 탭 진입 시 동작 추가
    if (tab === "search") {
        console.log("loadPhothoStatus");
        loadPhotoStats(); // 통계 API 요청
    }
}

// File upload handling
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add("dragover");
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove("dragover");
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");
    const files = e.dataTransfer.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

async function handleFiles(files) {
    if (files.length > 0) {
        //alert(`${files.length}개의 파일이 선택되었습니다. 실제 서비스에서는 서버로 업로드됩니다.`);
        // 실제 구현에서는 여기서 FormData를 사용해 multipart/form-data로 서버에 전송
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            if (files[i].fileSize > 13 << 19) {
                // The image is too big (>= 7.5MB)
                continue;
            }

            console.log(files[i]);
            formData.append("files", files[i]); // files가 key
        }

        return await apiPost("/api/images", formData);
    }
}

// Search functionality
async function performSearch() {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    const resultsContainer = document.getElementById("searchResults");

    if (!query) {
        // Show default photos
        resultsContainer.innerHTML = renderDefaultPhtos();
        return;
    }

    // Find matching results
    const results = await apiGet("/api/search?query=" + query);
    console.log(results);
    console.log(JSON.stringify(results));

    // TODO : Get the translated text of query
    // and display it to the user

    // Display results
    if (results.photos.length > 0) {
        const photosHtml = results.photos
            .map(
                (photos) => `
            <div class="photo-card">
                <img class="photo-img" src=${photos.url} alt="photo">
                <div class="photo-info">
                    <div class="photo-title">${photos.url.split("/").pop()}</div> 
                    <div class="photo-meta">socre: ${photos.score.toFixed(3)}</div> 
                    <div class="photo-meta">size: ${photos.size}MB</div>
                </div>
            </div>
        `
            )
            .join("");

        resultsContainer.innerHTML = `
            <div style="margin-bottom: 1rem; color: #64748b;">
                "${query}" 검색 결과: ${results.photos.length}개
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
        const stats = await apiGet("/api/status"); // { photoCount: 1247, totalSize: "2.4GB" }

        document.getElementById("photoCount").textContent = stats.fileCount.toLocaleString();
        document.getElementById("totalSize").textContent = stats.fileSize;
    } catch (error) {
        console.error("사진 통계 오류:", error);
        document.getElementById("photoCount").textContent = "N/A";
        document.getElementById("totalSize").textContent = "N/A";
    }
}

// TODO
// - 로그인/회원가입 시 return값 이용
//   - 로그인 후 세션 관리?

// Login modal
function openLoginModal() {
    document.getElementById("signUpModal").classList.remove("active");
    document.getElementById("loginModal").classList.add("active");
    updateLoginButtonState();
}

function closeLoginModal() {
    document.getElementById("loginModal").classList.remove("active");
}

function getLoginFormData() {
    return new FormData(document.getElementById("loginModal").querySelector("form"));
}

function handleLogin(e) {
    const result = apiPost("/api/users/login", getLoginFormData());
    localStorage.setItem("token", result.token);
    closeLoginModal();
}

function updateLoginButtonState(e) {
    // Login modal : Enable login button only when the user filled both input boxes
    let loginBtn = document.getElementById("loginBtn");
    if (
        getLoginFormData()
            .values()
            .every((value) => value.trim().length > 0)
    ) {
        loginBtn.disabled = false;
        loginBtn.classList.add("primary");
    } else {
        loginBtn.disabled = true;
        loginBtn.classList.remove("primary");
    }
}

document
    .getElementById("loginModal")
    .querySelectorAll("input")
    .forEach((element) => element.addEventListener("input", updateLoginButtonState));

// Sign-up modal
function openSignUpModal() {
    document.getElementById("loginModal").classList.remove("active");
    document.getElementById("signUpModal").classList.add("active");
    updateSignUpButtonState();
}

function closeSignUpModal() {
    document.getElementById("signUpModal").classList.remove("active");
}

function getSignUpFormData() {
    return new FormData(document.getElementById("signUpModal").querySelector("form"));
}

function updateSignUpButtonState(e) {
    // Sign-up modal : If the input password is not confirmed, deactivate the sign-up-related buttons
    let confirmed =
        getSignUpFormData()
            .entries()
            .every((pair) => pair[0] == "verificationCode" || pair[1].trim().length > 0) &&
        document.getElementById("pwdInput").value == document.getElementById("pwdConfirmInput").value;

    let signUpButton = document.getElementById("signUpBtn");

    document.getElementById("sendCodeBtn").disabled = !confirmed || document.getElementById("signUpModal").emailSent;
    if (confirmed) {
        signUpButton.disabled = false;
        signUpButton.classList.add("primary");
    } else {
        signUpButton.disabled = true;
        signUpButton.classList.remove("primary");
    }
}

document
    .getElementById("signUpModal")
    .querySelectorAll("input")
    .forEach((element) => {
        if (!element.hidden) {
            element.addEventListener("input", updateSignUpButtonState);
        }
    });

function sendEmailVerification() {
    let signUpModal = document.getElementById("signUpModal");
    let sendCodeButton = document.getElementById("sendCodeBtn");
    sendCodeButton.innerHTML = "전송 중...";
    sendCodeButton.disabled = true;

    const result = apiPost("/api/users/email-verification", getSignUpFormData()); // TODO: to be tested
    console.log(result);

    // Wait 5 minutes (EMAIL_VERIFICATION_EXPIRY_MINUTES) for next sending verification code
    signUpModal.emailSent = true;
    let countdownVar = 300;
    function countdownFunc() {
        if (countdownVar-- > 0) {
            sendCodeButton.innerHTML = countdownVar + "s";
            setTimeout(countdownFunc, 1000);
        } else {
            signUpModal.emailSent = false;
            updateButtonState();
            sendCodeButton.innerHTML = "인증번호 다시 요청";
        }
    }
    countdownFunc();

    document.getElementById("codeInput").hidden = false;
}

function handleSignUp() {
    const result = apiPost("/api/users/signup", getSignUpFormData());
    console.log(result); // TODO
    closeSignUpModal();
}

// Close modal when clicking outside
document.getElementById("loginModal").addEventListener("click", function (e) {
    if (e.target === this) {
        closeLoginModal();
    }
});

// Enter key search
document.getElementById("searchInput").addEventListener("keypress", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        performSearch();
    }
});

function renderDefaultPhtos() {
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
