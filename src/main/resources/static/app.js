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
    } else {
        tooltip.style.display = "none";
        tooltip.innerText = "";
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
            tooltip.style.right = window.innerWidth - e.pageX + 10 + "px"; // Adjust offset as needed
            tooltip.style.bottom = window.innerHeight - e.pageY + "px"; // Adjust offset as needed
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
            if (t.status === "done") {
                setTimeout(() => {
                    delete tasks[id];
                    renderTasks();
                }, 5000);
            }
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
        let taskIds = [];
        let promises = [];

        for (let i = 0; i < files.length; i++) {
            const fileName = files[i].name;
            const taskId = "task-" + taskGlobalId++;
            taskIds.push(taskId);

            addTask(taskId, fileName.length > taskNameDisplayLen ? fileName.slice(0, taskNameDisplayLen) + "..." : fileName);
        }

        for (let i = 0; i < files.length; i++) {
            const taskId = taskIds[i];
            const file = files[i];

            if (file.fileSize > 13 << 19) {
                // The image is too big (>= 7.5MB)
                updateTaskStatus(taskId, "error", "파일이 너무 큽니다.");
                promises.push(Promise.reject(null));
                continue;
            }

            const formData = new FormData();
            formData.append("files", file); // files가 key

            updateTaskStatus(taskId, "processing");
            promises.push(
                apiPostFile("/api/images", formData)
                    .then((result) => {
                        updateTaskStatus(taskId, "done");
                        return result;
                    })
                    .catch((error) => {
                        updateTaskStatus(taskId, "error", "통신 에러 : " + error.status || error.message);
                        return Promise.reject(null);
                    })
            );
        }

        return await Promise.all(promises);
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

async function handleSearchFiles(files) {
    console.log(files);
    if (files && files.length > 0) {
        performSearch(files[0]);
    }
}

let recentSearchPhotos = {};

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

        formData.append("image", img_file);

        updateTaskStatus(taskId, "processing");
        try {
            results = await apiPostFile("/api/search/image", formData);
            updateTaskStatus(taskId, "done");
            document.getElementById("searchMessage").textContent = "업로드한 사진의 검색 결과";
        } catch (error) {
            updateTaskStatus(taskId, "error", "Internal Server Error : " + error.status || error.message);
        }
    } else if (query) {
        // Find matching results
        addTask(taskId, "검색 : " + (query.length > taskNameDisplayLen ? query.slice(0, taskNameDisplayLen) + "..." : query));
        try {
            results = await apiGet("/api/search/text?query=" + query);
            updateTaskStatus(taskId, "done");
            document.getElementById("searchMessage").textContent = "검색 결과 : " + results.query;
        } catch (error) {
            updateTaskStatus(taskId, "error", "Internal Server Error : " + error.status || error.message);
        }
    } else {
        // Show default photos
        resultsContainer.innerHTML = renderDefaultPhtos();
        return;
    }

    // Display results
    if (results.photos.length > 0) {
        recentSearchPhotos = results.photos.reduce((acc, photo) => {
            acc[photo.url] = photo;
            return acc;
        }, {});
        const photosHtml = results.photos
            .map(
                (photo) => `
            <div class="photo-card">
                <img class="photo-img" src=${photo.url} alt="photo">
                <div class="photo-info">
                    <div class="photo-title">${photo.originalFilename}</div> 
                    <div class="photo-meta">유사도: ${(customScore(photo.score) * 100).toFixed(2)}%</div> 
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
        console.error("사진 통계 오류 : " + (error.status || error.message));
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
    try {
        let loginBtn = document.getElementById("loginBtn");
        let loginMessage = document.getElementById("loginMessage");

        loginBtn.disabled = true;
        loginBtn.classList.remove("primary");

        const result = await apiPost("/api/users/login", JSON.stringify(getLoginFormData()));
        localStorage.setItem("accessToken", result.accessToken);
        localStorage.setItem("username", result.username);
        updateLoginState();
        closeLoginModal();
        loginMessage.hidden = true;
    } catch (error) {
        if (error.status === 404) {
            loginMessage.textContent = "로그인 정보가 일치하지 않습니다.";
            loginMessage.hidden = false;
        } else {
            loginMessage.textContent = "Internal Server Error";
            loginMessage.hidden = false;
            console.error("로그인 오류:", error.status || error.message);
        }
    } finally {
        loginBtn.disabled = false;
        loginBtn.classList.add("primary");
    }
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
    switchTab("upload");
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
        console.error("이메일 인증 오류 : " + (e.status || e.message));
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
        success = true;
    } catch (e) {
        console.error("회원가입 오류 : " + (e.status || e.message));
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
                    <div class="photo-img">📸</div>
                    <div class="photo-info">
                        <div class="photo-title">로그인하세요!</div>
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
    const imgId = img_src.split("/").pop().split("?")[0];

    try {
        if (action === "save") {
            const tempLink = document.createElement("a");
            tempLink.style.display = "none";
            tempLink.href = img_src;
            tempLink.download = recentSearchPhotos[img_src].originalFilename;
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
        } else if (action === "delete") {
            const response = await fetch(`/api/images/${imgId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                delete recentSearchPhotos[img_src];
                const card = contextTarget.closest(".photo-card");
                card.remove();
            }
        }
    } catch (e) {
        console.error("사진 작업 에러 : " + e);
    } finally {
        hideMenu();
    }
});

/* View Modal Logic */
const viewModal = document.getElementById("viewModal");
const viewModalImg = document.getElementById("viewModalImg");
const viewModalInfo = document.getElementById("viewModalInfo");

function openViewModal(card) {
    const img = card.querySelector("img");
    if (!img) return; // Should not happen based on requirements, but safety check

    const photo = recentSearchPhotos[img.src];
    if (!photo) return;

    viewModalImg.src = img.src;
    viewModalImg.alt = photo.originalFilename;
    viewModalInfo.innerHTML = "<div class='photo-meta'>로딩 중...</div>";
    viewModalImg.onload = () => {
        viewModalInfo.innerHTML = `
    <div class="photo-info">
        <div class="photo-subtitle">파일 이름</div>
        <div class="photo-meta">${photo.originalFilename}</div>
    </div>
    <div class="photo-info">
        <div class="photo-subtitle">유사도</div>
        <div class="photo-meta">${(customScore(photo.score) * 100).toFixed(2)}%</div>
    </div>
    <div class="photo-info">
        <div class="photo-subtitle">해상도</div>
        <div class="photo-meta">${viewModalImg.naturalWidth} x ${viewModalImg.naturalHeight}</div>
    </div>
    <div class="photo-info">
        <div class="photo-subtitle">크기</div>
        <div class="photo-meta">${photo.size}MB</div>
    </div>
    <div class="photo-info">
        <div class="photo-subtitle">올린 날짜</div>
        <div class="photo-meta">${photo.takenDate}</div>
    </div>
    `;
    };
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

updateLoginState();
