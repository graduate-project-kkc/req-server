const API_BASE_URL = "http://52.79.227.178:8080";

class APIError extends Error {
    constructor(message, endpoint, status) {
        super(message + " " + endpoint + " " + status);
        this.endpoint = endpoint;
        this.status = status;
    }
}

// 공통 fetch wrapper
async function apiGet(endpoint) {
    let init = {
        method: "GET",
    };
    if (localStorage.getItem("accessToken")) {
        init.headers = { "Authorization": "Bearer " + localStorage.getItem("accessToken") };
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, init);
    if (!response.ok) {
        throw new APIError(`GET`, endpoint, response.status);
    }
    const contentType = response.headers.get("Content-type");
    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    } else {
        return null;
    }
}

async function apiPost(endpoint, data) {
    let init = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
    };
    if (localStorage.getItem("accessToken")) {
        init.headers["Authorization"] = "Bearer " + localStorage.getItem("accessToken");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, init);
    if (!response.ok) {
        throw new APIError(`POST`, endpoint, response.status);
    }
    const contentType = response.headers.get("Content-type");
    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    } else {
        return null;
    }
}

async function apiPostFile(endpoint, data) {
    let init = {
        method: "POST",
        body: data,
    };
    if (localStorage.getItem("accessToken")) {
        init.headers = { "Authorization": "Bearer " + localStorage.getItem("accessToken") };
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, init);
    if (!response.ok) {
        throw new APIError(`POST`, endpoint, response.status);
    }
    const contentType = response.headers.get("Content-type");
    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    } else {
        return null;
    }
}
