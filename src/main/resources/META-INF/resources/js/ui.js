/**
 * UI Manipulation, Rendering, and Event Handler Module
 */
import { getCurrentUser, isArchitect } from './auth.js';
import { fetchDashboardApi, fetchApplicationsApi, fetchArchitectureApi, createArchitectureApi, updateArchitectureApi, createApplicationApi } from './api.js';
import { renderEnterpriseTopologyGraph, renderAssetLevel0Diagram, renderAssetLevel1Diagram, escapeHtml } from './diagrams.js';

let registeredApps = [];
let sortableInstances = [];
let isSidebarExpanded = true;
let currentSelectedApp = null;
let currentDetailTab = 'l0';

export function getRegisteredApps() {
    return registeredApps;
}

export function toggleSidebar() {
    isSidebarExpanded = !isSidebarExpanded;
    const sidebar = document.getElementById('sidebar');
    const labels = sidebar.querySelectorAll('.nav-label');
    if (isSidebarExpanded) {
        sidebar.classList.remove('w-20');
        sidebar.classList.add('w-64');
        labels.forEach(l => l.classList.remove('hidden'));
    } else {
        sidebar.classList.remove('w-64');
        sidebar.classList.add('w-20');
        labels.forEach(l => l.classList.add('hidden'));
    }
}

export function setupUserSessionUI() {
    const user = getCurrentUser();
    if (!user) return;

    document.getElementById('sidebar-fullname').textContent = user.fullName;
    document.getElementById('sidebar-role-badge').textContent = user.role;

    const initials = user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('user-initials').textContent = initials;

    const architectControls = document.getElementById('architect-controls');
    const architectAssetControls = document.getElementById('architect-asset-controls');

    if (isArchitect()) {
        architectControls.classList.remove('hidden');
        architectAssetControls.classList.remove('hidden');
        enableDragAndDrop(true);
    } else {
        architectControls.classList.add('hidden');
        architectAssetControls.classList.add('hidden');
        enableDragAndDrop(false);
    }
}

export function switchView(viewName) {
    ['dashboard', 'architecture', 'assets'].forEach(v => {
        const viewEl = document.getElementById('view-' + v);
        const navEl = document.getElementById('nav-' + v);
        if (viewEl) viewEl.classList.add('hidden');
        if (navEl) navEl.className = 'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold hover:bg-indigo-800/60 text-indigo-200 transition';
    });

    document.getElementById('view-' + viewName).classList.remove('hidden');
    const activeNav = document.getElementById('nav-' + viewName);
    if (activeNav) activeNav.className = 'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold bg-indigo-800 text-white transition';

    document.getElementById('current-page-title').textContent = viewName.charAt(0).toUpperCase() + viewName.slice(1);

    if (viewName === 'dashboard') loadDashboard();
    if (viewName === 'architecture') loadArchitecture();
    if (viewName === 'assets') loadRegisteredApps();
}

export function setBlueprintMode(mode) {
    const lanesContainer = document.getElementById('blueprint-lanes-container');
    const graphContainer = document.getElementById('blueprint-graph-container');
    const btnLanes = document.getElementById('btn-mode-lanes');
    const btnGraph = document.getElementById('btn-mode-graph');

    if (mode === 'lanes') {
        lanesContainer.classList.remove('hidden');
        graphContainer.classList.add('hidden');
        btnLanes.className = 'px-3 py-1.5 rounded-md text-xs font-bold bg-indigo-600 text-white shadow';
        btnGraph.className = 'px-3 py-1.5 rounded-md text-xs font-bold text-gray-700 hover:bg-gray-300';
    } else {
        lanesContainer.classList.add('hidden');
        graphContainer.classList.remove('hidden');
        btnGraph.className = 'px-3 py-1.5 rounded-md text-xs font-bold bg-indigo-600 text-white shadow';
        btnLanes.className = 'px-3 py-1.5 rounded-md text-xs font-bold text-gray-700 hover:bg-gray-300';
        renderEnterpriseTopologyGraph(document.getElementById('mermaid-target'));
    }
}

export async function loadDashboard() {
    try {
        const data = await fetchDashboardApi();
        document.getElementById('app-count').textContent = data.appCount;

        const tbody = document.getElementById('migration-table-body');
        tbody.innerHTML = '';
        if (data.lastMigrations && data.lastMigrations.length > 0) {
            data.lastMigrations.forEach(m => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-50';
                tr.innerHTML = `
                    <td class="p-3 font-medium">${escapeHtml(m.appName || m.appname)}</td>
                    <td class="p-3 text-gray-500">${escapeHtml(m.targetVersion || m.targetversion || 'N/A')}</td>
                    <td class="p-3 text-gray-500">${escapeHtml(m.migrationDate || m.migrationdate)}</td>
                    <td class="p-3"><span class="px-2 py-0.5 text-[11px] rounded bg-green-100 text-green-800 font-bold">${escapeHtml(m.status || 'SUCCESS')}</span></td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4" class="p-3 text-center text-gray-400">No migration history recorded.</td></tr>';
        }
    } catch (err) {
        console.error("Dashboard error:", err);
    }
}

export async function loadRegisteredApps() {
    try {
        registeredApps = await fetchApplicationsApi();
        populateAssetTable();
        populateAssetDropdown();
    } catch (err) {
        console.error("Asset error:", err);
    }
}

function populateAssetTable() {
    const tbody = document.getElementById('asset-table-body');
    tbody.innerHTML = '';

    if (registeredApps.length > 0) {
        registeredApps.forEach(app => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-indigo-50/40 transition cursor-pointer';
            tr.innerHTML = `
                <td class="p-3 font-bold text-indigo-900">${escapeHtml(app.appName || app.appname)}</td>
                <td class="p-3 text-gray-600">${escapeHtml(app.owner || 'N/A')}</td>
                <td class="p-3 font-mono text-xs text-gray-600">${escapeHtml(app.servers || 'N/A')}</td>
                <td class="p-3 text-gray-600">${escapeHtml(app.programmingLanguage || app.programminglanguage || 'N/A')}</td>
                <td class="p-3"><span class="px-2 py-0.5 text-[11px] rounded bg-green-100 text-green-800 font-bold">${escapeHtml(app.status || 'ACTIVE')}</span></td>
            `;
            tr.addEventListener('click', () => openAppDetailModal(app));
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="p-3 text-center text-gray-400">No application assets registered.</td></tr>';
    }
}

function populateAssetDropdown() {
    const select = document.getElementById('modal-asset-select');
    select.innerHTML = '<option value="">-- Choose Application Asset --</option>';
    registeredApps.forEach(app => {
        const option = document.createElement('option');
        option.value = app.id;
        option.textContent = `${app.appName || app.appname} (${app.owner})`;
        select.appendChild(option);
    });
}

export async function loadArchitecture() {
    try {
        const components = await fetchArchitectureApi();
        ['CORE_BANKING', 'MIDDLEWARE', 'INTERNAL_APP', 'PUBLIC_APP', 'DATAWAREHOUSE'].forEach(type => {
            document.getElementById('lane-' + type).innerHTML = '';
        });

        components.forEach(c => {
            const type = c.componentType || c.componenttype;
            const name = c.componentName || c.componentname;
            const net = c.networkAccess || c.networkaccess;

            const lane = document.getElementById('lane-' + type);
            if (lane) {
                const card = document.createElement('div');
                card.className = "bg-white p-3 rounded-lg shadow-sm border border-gray-200 relative group";
                if (isArchitect()) {
                    card.classList.add('cursor-move');
                    card.setAttribute('data-id', c.id);
                }

                card.innerHTML = `
                    <h5 class="font-bold text-xs text-gray-900 pr-6">${escapeHtml(name)}</h5>
                    <p class="text-[11px] text-gray-500 mt-1 line-clamp-2">${escapeHtml(c.description || 'No description')}</p>
                    <div class="mt-2 pt-2 border-t flex justify-between items-center text-[10px] text-gray-400">
                        <span>Net: <strong class="net-tag">${escapeHtml(net)}</strong></span>
                        <span class="${c.active ? 'text-green-600' : 'text-red-600'} font-semibold">${c.active ? 'Active' : 'Inactive'}</span>
                    </div>
                `;
                lane.appendChild(card);
            }
        });
    } catch (err) {
        console.error("Architecture error:", err);
    }
}

export function openAppDetailModal(app) {
    currentSelectedApp = app;
    const name = app.appName || app.appname;
    const l0 = app.topologyLevel0 || app.topologylevel0 || 'INTERNAL_APP';

    document.getElementById('detail-app-name').textContent = name;
    document.getElementById('detail-owner').textContent = app.owner || 'Unassigned';
    document.getElementById('detail-servers').textContent = app.servers || 'None';
    document.getElementById('detail-status-badge').textContent = app.status || 'ACTIVE';
    document.getElementById('detail-topo-l0-badge').textContent = l0;

    document.getElementById('detail-source-code').textContent = (app.sourceCodeAvailable ?? app.sourcecodeavailable) ? 'Available (GitLab)' : 'Restricted';
    document.getElementById('detail-lang').textContent = app.programmingLanguage || app.programminglanguage || 'Not specified';
    document.getElementById('detail-os').textContent = app.osVersion || app.osversion || 'Standard Linux';
    document.getElementById('detail-cicd').textContent = (app.cicdAvailable ?? app.cicdavailable) ? 'Active (GitLab Runner)' : 'None';

    document.getElementById('detail-first-release').textContent = app.firstReleaseDate || app.firstreleasedate || '2025-01-10';
    document.getElementById('detail-sunset').textContent = app.sunsetDate || app.sunsetdate || 'Active Product Line';
    document.getElementById('detail-change-history').textContent = app.changeHistory || app.changehistory || 'Standard rolling maintenance.';

    document.getElementById('app-detail-modal').classList.remove('hidden');

    switchAssetDetailTab('l0');
}

export function switchAssetDetailTab(tab) {
    currentDetailTab = tab;
    const btnL0 = document.getElementById('btn-detail-tab-l0');
    const btnL1 = document.getElementById('btn-detail-tab-l1');
    const container = document.getElementById('mermaid-modal-container');

    if (tab === 'l0') {
        btnL0.className = 'px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow';
        btnL1.className = 'px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200';
        if (currentSelectedApp) {
            renderAssetLevel0Diagram(currentSelectedApp, container);
        }
    } else {
        btnL1.className = 'px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow';
        btnL0.className = 'px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200';
        if (currentSelectedApp) {
            renderAssetLevel1Diagram(currentSelectedApp, container);
        }
    }
}

export function closeAppDetailModal() {
    currentSelectedApp = null;
    document.getElementById('app-detail-modal').classList.add('hidden');
}

export function openRegisterAssetModal() {
    document.getElementById('register-asset-modal').classList.remove('hidden');
}

export function closeRegisterAssetModal() {
    document.getElementById('register-asset-modal').classList.add('hidden');
}

export function openBlueprintModal() {
    document.getElementById('modal-asset-select').value = "";
    document.getElementById('modal-type').value = "INTERNAL_APP";
    document.getElementById('modal-network').value = "LAN";
    document.getElementById('modal-desc').value = "";
    document.getElementById('component-modal').classList.remove('hidden');
}

export function closeBlueprintModal() {
    document.getElementById('component-modal').classList.add('hidden');
}

export async function handleSaveBlueprintComponent() {
    const assetSelect = document.getElementById('modal-asset-select');
    const selectedApp = registeredApps.find(a => a.id == assetSelect.value);

    if (!selectedApp) {
        alert("Please select a registered application asset.");
        return;
    }

    const payload = {
        componentName: selectedApp.appName || selectedApp.appname,
        componentType: document.getElementById('modal-type').value,
        networkAccess: document.getElementById('modal-network').value,
        description: document.getElementById('modal-desc').value,
        active: true
    };

    try {
        await createArchitectureApi(payload);
        closeBlueprintModal();
        loadArchitecture();
    } catch (err) {
        alert("Validation Error: " + err.message);
    }
}

export async function handleSaveNewAsset(e) {
    e.preventDefault();

    const topoL0 = document.getElementById('reg-topo-l0').value;
    if (!topoL0) {
        alert("Level 0 Application Position is mandatory.");
        return;
    }

    const payload = {
        appName: document.getElementById('reg-name').value,
        owner: document.getElementById('reg-owner').value,
        servers: document.getElementById('reg-servers').value,
        status: document.getElementById('reg-status').value,
        topologyLevel0: topoL0,
        interconnections: document.getElementById('reg-interconn').value,
        topologyLevel1Web: document.getElementById('reg-l1-web').value,
        topologyLevel1Backend: document.getElementById('reg-l1-back').value,
        topologyLevel1Database: document.getElementById('reg-l1-db').value,
        programmingLanguage: document.getElementById('reg-lang').value,
        osVersion: document.getElementById('reg-os').value,
        sourceCodeAvailable: document.getElementById('reg-source-code').checked,
        cicdAvailable: document.getElementById('reg-cicd').checked,
        firstReleaseDate: document.getElementById('reg-first-release').value || null,
        sunsetDate: document.getElementById('reg-sunset').value || null,
        changeHistory: document.getElementById('reg-change-history').value
    };

    try {
        await createApplicationApi(payload);
        closeRegisterAssetModal();
        loadRegisteredApps();
    } catch (err) {
        alert("Error registering asset: " + err.message);
    }
}

function enableDragAndDrop(enabled) {
    sortableInstances.forEach(s => s.destroy());
    sortableInstances = [];
    if (!enabled || !window.Sortable) return;

    ['CORE_BANKING', 'MIDDLEWARE', 'INTERNAL_APP', 'PUBLIC_APP', 'DATAWAREHOUSE'].forEach(type => {
        const el = document.getElementById('lane-' + type);
        const sortable = window.Sortable.create(el, {
            group: 'blueprint-lanes',
            animation: 150,
            onAdd: async function (evt) {
                const itemEl = evt.item;
                const id = itemEl.getAttribute('data-id');
                const newType = evt.to.getAttribute('data-type');

                if (newType === 'CORE_BANKING') {
                    const netAccess = itemEl.querySelector('.net-tag').innerText;
                    if (netAccess.toLowerCase() !== 'restricted') {
                        alert("Routing Policy Violation: Core Banking components must have Restricted network access!");
                        loadArchitecture();
                        return;
                    }
                }

                try {
                    const comps = await fetchArchitectureApi();
                    const comp = comps.find(c => c.id == id);
                    if (comp) {
                        comp.componentType = newType;
                        await updateArchitectureApi(id, comp);
                        loadArchitecture();
                    }
                } catch (err) {
                    console.error("Failed to update position:", err);
                }
            }
        });
        sortableInstances.push(sortable);
    });
}