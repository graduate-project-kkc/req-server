const API_BASE_URL = "http://52.79.227.178:8080";

// 공통 fetch wrapper
async function apiGet(endpoint) {
    let init = {
        method: "GET",
    };
    if (localStorage.getItem("token")) {
        init.headers = { "Authorization": "Bearer " + localStorage.getItem("token") };
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, init);
    if (!response.ok) {
        throw new Error(`GET ${endpoint} 실패`);
    }
    return await response.json();
}

async function apiPost(endpoint, data) {
    let init = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: data,
    };
    if (localStorage.getItem("token")) {
        init.headers = { "Authorization": "Bearer " + localStorage.getItem("token") };
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, init);
    if (!response.ok) {
        throw new Error(`POST ${endpoint} 실패`);
    }
    return await response.json();
}
