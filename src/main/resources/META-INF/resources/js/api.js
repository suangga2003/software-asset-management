/**
 * Centralized API service module for REST communication.
 */

export async function loginApi(username, password) {
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
        throw new Error('Invalid username or password');
    }
    return await res.json();
}

export async function fetchDashboardApi() {
    const res = await fetch('/api/dashboard');
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return await res.json();
}

export async function fetchApplicationsApi() {
    const res = await fetch('/api/applications');
    if (!res.ok) throw new Error('Failed to fetch application assets');
    return await res.json();
}

export async function createApplicationApi(payload) {
    const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to register application asset');
    return await res.json();
}

export async function fetchArchitectureApi() {
    const res = await fetch('/api/architecture');
    if (!res.ok) throw new Error('Failed to fetch architecture blueprint');
    return await res.json();
}

export async function createArchitectureApi(payload) {
    const res = await fetch('/api/architecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to save architecture component');
    }
    return await res.json();
}

export async function updateArchitectureApi(id, payload) {
    const res = await fetch(`/api/architecture/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update architecture component');
    return await res.json();
}