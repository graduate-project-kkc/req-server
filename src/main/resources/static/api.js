const API_BASE_URL = "http://52.79.227.178:8080";

// 공통 fetch wrapper
async function apiGet(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
        throw new Error(`GET ${endpoint} 실패`);
    }
    return await response.json();
}

async function apiPost(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        //headers: { 'Content-Type': 'application/json' },
        body: data//JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error(`POST ${endpoint} 실패`);
    }
    return await response.json();
}

