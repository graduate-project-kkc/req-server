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

function customScore(v) {
    let sigmoid = (x) => 1 / (1 + Math.exp(-x));
    const amplifier = 5;
    const scoreMin = sigmoid(-amplifier);
    const scoreMax = sigmoid(amplifier);
    return (sigmoid(v * amplifier) - scoreMin) / (scoreMax - scoreMin);
}

let tasks = {};
let taskGlobalId = 0;
const tooltip = document.querySelector(".tooltiptext");

setInterval(() => {
    if (tooltip.focusing) {
        const desc = tasks[tooltip.focusing].desc;
        if (desc) {
            tooltip.style.display = "block";
            tooltip.innerText = desc;
        } else {
            tooltip.style.display = "none";
            tooltip.innerText = "";
        }
    }
}, 1);

function capitalize(s) {
    return s.charAt(0).toUpperCase().concat(s.slice(1));
}

/* Task UI 업데이트 */
function renderTasks() {
    const box = document.getElementById("taskBox");
    const keys = Object.keys(tasks);

    if (keys.length === 0) {
        box.style.display = "none";
        return;
    }

    box.style.display = "block";
    box.innerHTML = ""; // 초기화

    keys.forEach((id) => {
        const t = tasks[id];

        const wrapper = document.createElement("div");
        wrapper.className = "taskItem";

        const title = document.createElement("div");
        title.className = "taskTitle";
        title.innerText = t.title;

        const status = document.createElement("div");
        status.className = "taskStatus status-" + t.status.split(" ")[0];
        status.innerText = capitalize(t.status);

        status.addEventListener("mousemove", (e) => {
            tooltip.style.left = e.pageX + 10 + "px"; // Adjust offset as needed
            tooltip.style.top = e.pageY + 10 + "px"; // Adjust offset as needed
        });

        status.addEventListener("mouseenter", () => {
            tooltip.focusing = id;
        });

        status.addEventListener("mouseleave", () => {
            tooltip.focusing = undefined;
        });

        const closeBtn = document.createElement("div");

        if (t.status === "done" || t.status === "error") {
            closeBtn.className = "taskClose";
            closeBtn.innerText = "\u2716";
            closeBtn.addEventListener("click", () => {
                delete tasks[id];
                renderTasks();
            });
        } else {
            closeBtn.className = "loading-spinner";
        }

        wrapper.appendChild(title);
        wrapper.appendChild(status);
        wrapper.appendChild(closeBtn);
        box.appendChild(wrapper);
    });
}

/* Task 추가 */
function addTask(taskId, title) {
    tasks[taskId] = {
        title,
        status: "pending",
    };
    renderTasks();
}

/* Task 상태 변경 */
function updateTaskStatus(taskId, status, desc) {
    if (!tasks[taskId]) return;
    tasks[taskId].status = status;
    tasks[taskId].desc = desc;
    renderTasks();
}

/* 데모용: 랜덤 작업 생성 & 상태 자동 변경 */
function demoCreateTask() {
    const id = Math.random().toString(36).slice(2, 7);
    const tid = "task-" + id;
    addTask(tid, "아무개 이미지 " + id);

    // 상태 변화를 데모로 보여주기 위한 흐름
    setTimeout(() => updateTaskStatus(tid, "processing"), 3000);
    if (Math.random() < 0.5) {
        setTimeout(() => updateTaskStatus(tid, "error"), 7000);
    } else {
        setTimeout(() => updateTaskStatus(tid, "done"), 7000);
    }
}

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
        // performSearch();
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

const taskNameDisplayLen = 15;

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
        let taskIds = [];

        for (let i = 0; i < files.length; i++) {
            const fileName = files[i].name;
            const taskId = "task-" + taskGlobalId++;
            taskIds.push(taskId);

            addTask(taskId, fileName.length > taskNameDisplayLen ? fileName.slice(0, taskNameDisplayLen) + "..." : fileName);
            if (files[i].fileSize > 13 << 19) {
                // The image is too big (>= 7.5MB)
                updateTaskStatus(taskId, "error", "파일이 너무 큽니다.");
                continue;
            }

            console.log(files[i]);
            formData.append("files", files[i]); // files가 key
        }

        const promise = apiPostFile("/api/images", formData);
        taskIds.forEach((id_) => updateTaskStatus(id_, "processing"));
        try {
            const results = await promise;
            taskIds.forEach((id_) => updateTaskStatus(id_, "done"));
            return results;
        } catch (error) {
            taskIds.forEach((id_) => updateTaskStatus(id_, "error", "통신 에러 : " + error));
        }
    }
}

function handleSearchDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");
    const file = e.dataTransfer.files;
    handleSearchFiles(file);
}

function handleSearchFileSelect(e) {
    const file = e.target.files;
    handleSearchFiles(file);
}

async function handleSearchFiles(file) {
    console.log(file);
    if (file) {
        performSearch(file);
    }
}

// Search functionality
async function performSearch(img_file) {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    const resultsContainer = document.getElementById("searchResults");
    let results = null;
    const taskId = "task-" + taskGlobalId++;

    if (img_file) {
        const formData = new FormData();

        const fileName = img_file.name;

        addTask(taskId, "검색 : " + (fileName.length > taskNameDisplayLen ? fileName.slice(0, taskNameDisplayLen) + "..." : fileName));
        if (img_file.fileSize > 13 << 19) {
            // The image is too big (>= 7.5MB)
            updateTaskStatus(taskId, "error", "파일이 너무 큽니다.");
            return;
        }
        console.log(img_file);

        formData.append("files", img_file);

        updateTaskStatus(taskId, "processing");
        try {
            results = await apiPostFile("/api/search/image", formData);
            updateTaskStatus(taskId, "done");
            document.getElementById("searchMessage").textContent = "업로드한 사진의 검색 결과";
        } catch (error) {
            updateTaskStatus(taskId, "error", "서버 통신 오류 : " + error);
        }
    } else if (query) {
        // Find matching results
        addTask(taskId, "검색 : " + (query.length > taskNameDisplayLen ? query.slice(0, taskNameDisplayLen) + "..." : query));
        try {
            results = await apiGet("/api/search/text?query=" + query);
            updateTaskStatus(taskId, "done");
            document.getElementById("searchMessage").textContent = "검색 결과 : " + results.query;
        } catch (error) {
            updateTaskStatus(taskId, "error", "서버 통신 오류 : " + error);
        }
    } else {
        // Show default photos
        resultsContainer.innerHTML = renderDefaultPhtos();
        return;
    }

    // Display results
    if (results.photos.length > 0) {
        const photosHtml = results.photos
            .map(
                (photos) => `
            <div class="photo-card">
                <img class="photo-img" src=${photos.url} alt="photo">
                <div class="photo-info">
                    <div class="photo-title">${photos.url.split("/").pop()}</div> 
                    <div class="photo-meta">유사도: ${(customScore(photos.score) * 100).toFixed(2)}%</div> 
                    <div class="photo-meta">용량: ${photos.size}MB</div>
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
    const formData = new FormData(document.getElementById("loginModal").querySelector("form"));
    let obj = {};
    formData.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
}

async function handleLogin(e) {
    const result = await apiPost("/api/users/login", JSON.stringify(getLoginFormData()));
    localStorage.setItem("accessToken", result.accessToken);
    localStorage.setItem("username", result.username);
    updateLoginState();
    closeLoginModal();
}

function updateLoginButtonState(e) {
    // Login modal : Enable login button only when the user filled both input boxes
    let loginBtn = document.getElementById("loginBtn");
    if (Object.values(getLoginFormData()).every((value) => value.trim().length > 0)) {
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

function updateLoginState() {
    if (localStorage.getItem("accessToken")) {
        document.getElementById("loginBtnContainer").style.display = "none";
        document.getElementById("logoutBtnContainer").style.display = "flex";
        document.getElementById("username").textContent = "환영합니다, " + localStorage.getItem("username");
    } else {
        document.getElementById("loginBtnContainer").style.display = "flex";
        document.getElementById("logoutBtnContainer").style.display = "none";
    }
}

function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
    updateLoginState();
}

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
    const formData = new FormData(document.getElementById("signUpModal").querySelector("form"));
    let obj = {};
    formData.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
}

function updateSignUpButtonState(e) {
    // Sign-up modal : If the input password is not confirmed, deactivate the sign-up-related buttons
    let confirmed =
        Object.entries(getSignUpFormData()).every((pair) => pair[0] === "verificationCode" || pair[1].trim().length > 0) &&
        document.getElementById("pwdInput").value === document.getElementById("pwdConfirmInput").value;

    let signUpButton = document.getElementById("signUpBtn");

    document.getElementById("sendCodeBtn").disabled = !confirmed || document.getElementById("signUpModal").emailSent;
    if (confirmed && document.getElementById("codeInput").value.trim().length > 0) {
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
        element.addEventListener("input", updateSignUpButtonState);
    });

async function sendEmailVerification() {
    let signUpModal = document.getElementById("signUpModal");
    let sendCodeButton = document.getElementById("sendCodeBtn");
    sendCodeButton.innerHTML = "전송 중...";
    sendCodeButton.disabled = true;

    try {
        const result = await apiPost("/api/users/email-verification", JSON.stringify(getSignUpFormData()));
    } catch (e) {
        sendCodeButton.innerHTML = "오류. 다시 시도";
        sendCodeButton.disabled = false;
        console.log(e);
        return;
    }

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
            sendCodeButton.disabled = false;
        }
    }
    countdownFunc();

    document.getElementById("codeInput").hidden = false;
}

async function handleSignUp() {
    let success = null;
    try {
        const result = await apiPost("/api/users/signup", JSON.stringify(getSignUpFormData()));
        console.log(result); // TODO
        success = true;
    } catch (e) {
        console.log(e);
        success = false;
    }

    const signUpNofityModal = document.createElement("div");
    signUpNofityModal.className = "modal active";

    const container = document.createElement("div");
    container.className = "modal-content";

    const message = document.createElement("div");
    message.innerText = success ? "회원가입이 완료되었습니다! 로그인 해주세요." : "회원가입에 실패했습니다! 다시 시도해주세요.";

    const btnContainer = document.createElement("div");
    btnContainer.className = "modal-buttons";

    if (success) {
        const closeBtn = document.createElement("button");
        closeBtn.className = "modal-btn secondary";
        closeBtn.innerText = "닫기";
        closeBtn.onclick = (e) => {
            document.body.removeChild(signUpNofityModal);
            closeSignUpModal();
        };

        const loginBtn = document.createElement("button");
        loginBtn.className = "modal-btn primary";
        loginBtn.innerText = "로그인";
        loginBtn.onclick = (e) => {
            document.body.removeChild(signUpNofityModal);
            openLoginModal();
        };

        btnContainer.appendChild(closeBtn);
        btnContainer.appendChild(loginBtn);
    } else {
        const closeBtn = document.createElement("button");
        closeBtn.className = "modal-btn secondary";
        closeBtn.innerText = "닫기";
        closeBtn.onclick = (e) => {
            document.body.removeChild(signUpNofityModal);
        };

        btnContainer.appendChild(closeBtn);
    }
    container.appendChild(message);
    container.appendChild(btnContainer);
    signUpNofityModal.appendChild(container);

    document.body.appendChild(signUpNofityModal);
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

let contextMenu = document.getElementById("customContextMenu");
let contextTarget = null;

function showMenu(x, y, target) {
    contextMenu.style.left = x + "px";
    contextMenu.style.top = y + "px";
    contextMenu.style.display = "block";
    contextMenu.setAttribute("aria-hidden", "false");
    contextTarget = target;
}

function hideMenu() {
    contextMenu.style.display = "none";
    contextMenu.setAttribute("aria-hidden", "true");
    contextTarget = null;
}

document.addEventListener("contextmenu", function (e) {
    let elem = e.target.closest(".photo-card");
    if (elem?.firstElementChild.tagName.toLowerCase() === "img") {
        if (contextTarget === elem) {
            hideMenu();
            return;
        }
        e.preventDefault();
        showMenu(e.pageX, e.pageY, elem);
    }
});

document.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".photo-card") !== contextTarget && !e.target.closest("#customContextMenu")) hideMenu();
});

document.addEventListener("scroll", function (e) {
    hideMenu();
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hideMenu();
});

contextMenu.addEventListener("click", async function (e) {
    const item = e.target.closest(".context-menu-item");
    if (!(item && contextTarget)) {
        hideMenu();
        return;
    }

    const img_src = contextTarget.firstElementChild.src;
    const action = item.dataset.action;

    try {
        if (action === "save") {
            const tempLink = document.createElement("a");
            tempLink.style.display = "none";
            tempLink.href = img_src;
            tempLink.download = img_src.split("/").pop().split("?")[0] || "image";
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
        }
    } catch (e) {
        console.error(e);
    } finally {
        hideMenu();
    }
});

/* View Modal Logic */
const viewModal = document.getElementById("viewModal");
const viewModalImg = document.getElementById("viewModalImg");
const viewModalTitle = document.getElementById("viewModalTitle");
const viewModalMeta = document.getElementById("viewModalMeta");

function openViewModal(card) {
    const img = card.querySelector("img");
    if (!img) return; // Should not happen based on requirements, but safety check

    const title = card.querySelector(".photo-title")?.innerText || "No Title";
    // Collect all meta info
    const metaDivs = card.querySelectorAll(".photo-meta");
    let metaHtml = "";
    metaDivs.forEach((div) => {
        metaHtml += `<div>${div.innerText}</div>`;
    });

    viewModalImg.src = img.src;
    viewModalTitle.innerText = title;
    viewModalMeta.innerHTML = metaHtml;

    viewModal.classList.add("active");
}

function closeViewModal() {
    viewModal.classList.remove("active");
    viewModalImg.src = ""; // Clear src
}

// Double click event for photo cards
document.addEventListener("dblclick", function (e) {
    const card = e.target.closest(".photo-card");
    if (card) {
        openViewModal(card);
    }
});

// Close modal when clicking outside
viewModal.addEventListener("click", function (e) {
    if (e.target === viewModal) {
        closeViewModal();
    }
});

// Close on Escape key
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && viewModal.classList.contains("active")) {
        closeViewModal();
    }
});
