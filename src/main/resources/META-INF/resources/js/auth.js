/**
 * Authentication and RBAC Module
 */
import { loginApi } from './api.js';

let currentUser = null;

export function getCurrentUser() {
    return currentUser;
}

export async function login(username, password) {
    currentUser = await loginApi(username, password);
    return currentUser;
}

export function logout() {
    currentUser = null;
}

export function isArchitect() {
    return currentUser && currentUser.role === 'IT-Architect';
}