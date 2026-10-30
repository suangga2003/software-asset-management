/**
 * Topology Diagram Visualization Module (Mermaid.js)
 */
import { fetchArchitectureApi } from './api.js';

export function initMermaid() {
    if (window.mermaid) {
        window.mermaid.initialize({
            startOnLoad: false,
            theme: 'neutral',
            securityLevel: 'loose'
        });
    }
}

function escapeMermaidLabel(str) {
    if (!str) return 'N/A';
    return String(str)
        .replace(/["'\r\n]/g, ' ')
        .replace(/\(/g, '&#40;') .replace(/\)/g, '&#41;')
        .replace(/\[/g, '&#91;') .replace(/\]/g, '&#93;')
        .replace(/;/g, ' ');
}

export function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export async function renderEnterpriseTopologyGraph(targetElement) {
    targetElement.innerHTML = '<p class="text-xs text-gray-400 p-4">Generating enterprise topology flowchart...</p>';

    try {
        const components = await fetchArchitectureApi();
        if (!components || components.length === 0) {
            targetElement.innerHTML = '<p class="text-xs text-gray-400 p-4">No blueprint components found.</p>';
            return;
        }

        let graphDef = 'flowchart LR\n';
        const pubApps = components.filter(c => (c.componentType || c.componenttype) === 'PUBLIC_APP');
        const intApps = components.filter(c => (c.componentType || c.componenttype) === 'INTERNAL_APP');
        const middleware = components.filter(c => (c.componentType || c.componenttype) === 'MIDDLEWARE');
        const coreBanking = components.filter(c => (c.componentType || c.componenttype) === 'CORE_BANKING');
        const datawarehouse = components.filter(c => (c.componentType || c.componenttype) === 'DATAWAREHOUSE');

        if (pubApps.length > 0) {
            graphDef += '  subgraph Public_Zone ["Public Apps"]\n';
            pubApps.forEach(c => graphDef += `    node_${c.id}["${escapeMermaidLabel(c.componentName || c.componentname)}"]\n`);
            graphDef += '  end\n';
        }

        if (intApps.length > 0) {
            graphDef += '  subgraph Internal_Zone ["Internal Apps"]\n';
            intApps.forEach(c => graphDef += `    node_${c.id}["${escapeMermaidLabel(c.componentName || c.componentname)}"]\n`);
            graphDef += '  end\n';
        }

        if (middleware.length > 0) {
            graphDef += '  subgraph Middleware_Zone ["Middleware Gateway"]\n';
            middleware.forEach(c => graphDef += `    node_${c.id}["${escapeMermaidLabel(c.componentName || c.componentname)}"]\n`);
            graphDef += '  end\n';
        }

        if (coreBanking.length > 0) {
            graphDef += '  subgraph Core_Zone ["Core Banking"]\n';
            coreBanking.forEach(c => graphDef += `    node_${c.id}["${escapeMermaidLabel(c.componentName || c.componentname)}"]\n`);
            graphDef += '  end\n';
        }

        if (datawarehouse.length > 0) {
            graphDef += '  subgraph Data_Zone ["Datawarehouse"]\n';
            datawarehouse.forEach(c => graphDef += `    node_${c.id}["${escapeMermaidLabel(c.componentName || c.componentname)}"]\n`);
            graphDef += '  end\n';
        }

        pubApps.forEach(pub => middleware.forEach(mw => graphDef += `  node_${pub.id} --> node_${mw.id}\n`));
        intApps.forEach(ia => middleware.forEach(mw => graphDef += `  node_${ia.id} -.-> node_${mw.id}\n`));
        middleware.forEach(mw => coreBanking.forEach(cb => graphDef += `  node_${mw.id} ==> node_${cb.id}\n`));
        coreBanking.forEach(cb => datawarehouse.forEach(dw => graphDef += `  node_${cb.id} --> node_${dw.id}\n`));

        targetElement.innerHTML = '';
        const { svg } = await window.mermaid.render('mermaid_svg_' + Date.now(), graphDef);
        targetElement.innerHTML = svg;
    } catch (err) {
        console.error("Failed to render topology graph:", err);
        targetElement.innerHTML = `<p class="text-xs text-red-500 p-4">Error rendering diagram: ${escapeHtml(err.message)}</p>`;
    }
}

/**
 * Dynamically renders Level 0 diagram (Enterprise Position & Interconnection Directives)
 */
export async function renderAssetLevel0Diagram(app, container) {
    container.innerHTML = '<p class="text-xs text-gray-400 p-4">Rendering Level 0 diagram...</p>';
    const appName = app.appName || app.appname || 'Selected Asset';
    const l0 = app.topologyLevel0 || app.topologylevel0 || 'INTERNAL_APP';
    const interconn = app.interconnections || '';

    let graphDef = 'flowchart LR\n';
    graphDef += '  classDef targetAsset fill:#4f46e5,stroke:#312e81,color:#ffffff,font-weight:bold\n';
    graphDef += '  classDef connectedNode fill:#059669,stroke:#047857,color:#ffffff,font-weight:bold\n';
    graphDef += '  classDef zoneNode fill:#f3f4f6,stroke:#d1d5db,color:#6b7280\n';

    graphDef += `  ASSET["${escapeMermaidLabel(appName)}<br/>&#40;${l0}&#41;"]:::targetAsset\n`;

    // Parse interconnection directives (e.g., "ESB Gateway -> Core Banking" or comma separated list)
    if (interconn.trim().length > 0) {
        const directives = interconn.split(/[\n,;]+/);
        directives.forEach((dir, idx) => {
            const cleanDir = dir.trim();
            if (cleanDir) {
                if (cleanDir.includes('->')) {
                    const parts = cleanDir.split('->');
                    const src = parts[0].trim();
                    const dest = parts[1].trim();
                    graphDef += `  N_SRC_${idx}["${escapeMermaidLabel(src)}"]:::connectedNode --> N_DEST_${idx}["${escapeMermaidLabel(dest)}"]:::connectedNode\n`;
                } else {
                    graphDef += `  NODE_${idx}["${escapeMermaidLabel(cleanDir)}"]:::connectedNode\n`;
                    graphDef += `  ASSET --> NODE_${idx}\n`;
                }
            }
        });
    } else {
        graphDef += '  ZONE_MW["Middleware Gateway"]:::zoneNode\n';
        graphDef += '  ZONE_CORE["Core Banking Zone"]:::zoneNode\n';
        if (l0 === 'CORE_BANKING') {
            graphDef += '  ZONE_MW ==> ASSET\n';
        } else {
            graphDef += '  ASSET -.-> ZONE_MW\n';
            graphDef += '  ZONE_MW ==> ZONE_CORE\n';
        }
    }

    try {
        container.innerHTML = '';
        const { svg } = await window.mermaid.render('l0_svg_' + Date.now(), graphDef);
        container.innerHTML = svg;
    } catch (err) {
        console.error("Level 0 Diagram Render Error:", err);
        container.innerHTML = `<p class="text-xs text-red-500 p-4">Error generating Level 0 topology: ${escapeHtml(err.message)}</p>`;
    }
}

/**
 * Dynamically renders Level 1 diagram (Internal Component Stack Relationships)
 */
export async function renderAssetLevel1Diagram(app, container) {
    container.innerHTML = '<p class="text-xs text-gray-400 p-4">Rendering Level 1 diagram...</p>';
    const l1web = app.topologyLevel1Web || app.topologylevel1web;
    const l1back = app.topologyLevel1Backend || app.topologylevel1backend;
    const l1db = app.topologyLevel1Database || app.topologylevel1database;

    let graphDef = 'flowchart LR\n';
    graphDef += '  classDef tierNode fill:#3b82f6,stroke:#1d4ed8,color:#ffffff,font-weight:bold\n';
    graphDef += '  classDef dbNode fill:#0284c7,stroke:#0369a1,color:#ffffff,font-weight:bold\n';

    let hasTier = false;

    if (l1web) {
        graphDef += `  WEB["Web Tier<br/>${escapeMermaidLabel(l1web)}"]:::tierNode\n`;
        hasTier = true;
    }
    if (l1back) {
        graphDef += `  BACK["Backend Tier<br/>${escapeMermaidLabel(l1back)}"]:::tierNode\n`;
        hasTier = true;
    }
    if (l1db) {
        graphDef += `  DB[("Database Tier<br/>${escapeMermaidLabel(l1db)}")]:::dbNode\n`;
        hasTier = true;
    }

    if (l1web && l1back) graphDef += '  WEB --> BACK\n';
    if (l1back && l1db) graphDef += '  BACK --> DB\n';
    if (l1web && l1db && !l1back) graphDef += '  WEB --> DB\n';

    if (!hasTier) {
        graphDef += '  EMPTY["No internal component stack specified"]:::tierNode\n';
    }

    try {
        container.innerHTML = '';
        const { svg } = await window.mermaid.render('l1_svg_' + Date.now(), graphDef);
        container.innerHTML = svg;
    } catch (err) {
        console.error("Level 1 Diagram Render Error:", err);
        container.innerHTML = `<p class="text-xs text-red-500 p-4">Error generating Level 1 topology: ${escapeHtml(err.message)}</p>`;
    }
}