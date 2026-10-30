/**
 * Application Entrypoint Module
 */
import { login, logout } from './auth.js';
import { initMermaid, renderEnterpriseTopologyGraph } from './diagrams.js';
import {
    setupUserSessionUI, switchView, setBlueprintMode, toggleSidebar,
    closeAppDetailModal, openRegisterAssetModal, closeRegisterAssetModal,
    openBlueprintModal, closeBlueprintModal, handleSaveBlueprintComponent,
    handleSaveNewAsset, switchAssetDetailTab, getRegisteredApps
} from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    initMermaid();

    // Login Form Submit
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-user').value;
        const password = document.getElementById('login-pass').value;
        const errDiv = document.getElementById('login-error');

        try {
            await login(username, password);
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('app-wrapper').classList.remove('hidden');

            setupUserSessionUI();
            switchView('dashboard');
        } catch (err) {
            errDiv.textContent = err.message;
            errDiv.classList.remove('hidden');
        }
    });

    // Logout Button
    document.getElementById('btn-logout').addEventListener('click', () => {
        logout();
        document.getElementById('app-wrapper').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('login-user').value = '';
        document.getElementById('login-pass').value = '';
    });

    // Navigation Switches
    document.getElementById('btn-sidebar-toggle').addEventListener('click', toggleSidebar);
    document.getElementById('nav-dashboard').addEventListener('click', () => switchView('dashboard'));
    document.getElementById('nav-architecture').addEventListener('click', () => switchView('architecture'));
    document.getElementById('nav-assets').addEventListener('click', () => switchView('assets'));

    // Blueprint View Mode Toggles
    document.getElementById('btn-mode-lanes').addEventListener('click', () => setBlueprintMode('lanes'));
    document.getElementById('btn-mode-graph').addEventListener('click', () => setBlueprintMode('graph'));
    document.getElementById('btn-refresh-graph').addEventListener('click', () => {
        renderEnterpriseTopologyGraph(document.getElementById('mermaid-target'));
    });

    // Topology Tabs in Asset Details Modal
    document.getElementById('btn-detail-tab-l0').addEventListener('click', () => switchAssetDetailTab('l0'));
    document.getElementById('btn-detail-tab-l1').addEventListener('click', () => switchAssetDetailTab('l1'));

    // Asset Select auto fill
    document.getElementById('modal-asset-select').addEventListener('change', (e) => {
        const appId = e.target.value;
        const app = getRegisteredApps().find(a => a.id == appId);
        if (app) {
            const topo = app.topologyLevel0 || app.topologylevel0;
            document.getElementById('modal-network').value = topo === 'CORE_BANKING' ? 'Restricted' : 'LAN';
            document.getElementById('modal-desc').value = `Managed asset owned by ${app.owner} running on ${app.servers}`;
        }
    });

    // Modal Controls
    document.getElementById('btn-open-blueprint-modal').addEventListener('click', openBlueprintModal);
    document.getElementById('btn-close-blueprint-modal').addEventListener('click', closeBlueprintModal);
    document.getElementById('btn-save-blueprint-component').addEventListener('click', handleSaveBlueprintComponent);

    document.getElementById('btn-open-register-asset-modal').addEventListener('click', openRegisterAssetModal);
    document.getElementById('btn-close-register-asset-modal').addEventListener('click', closeRegisterAssetModal);
    document.getElementById('btn-cancel-register-asset').addEventListener('click', closeRegisterAssetModal);
    document.getElementById('register-asset-form').addEventListener('submit', handleSaveNewAsset);

    document.getElementById('btn-close-detail-modal').addEventListener('click', closeAppDetailModal);
    document.getElementById('btn-close-detail-modal-footer').addEventListener('click', closeAppDetailModal);

    // Live Header Clock
    setInterval(() => {
        const now = new Date();
        document.getElementById('current-time').textContent = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    }, 1000);
});