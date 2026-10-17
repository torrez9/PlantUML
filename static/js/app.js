/**
 * ======================================================================================
 * Motor Frontend: app.js
 * Aplicación: DiagramCraft Studio
 * Creador y Desarrollador: Jose
 * Licencia: Código Abierto y Uso Gratuito Local (MIT)
 * Descripción: Controla la interactividad del editor de DiagramCraft, el lienzo de vista previa,
 * transformaciones de paneo y zoom, descargas en múltiples formatos y gestión de diagramas.
 * ======================================================================================
 */

// Estado global de la aplicación
const state = {
    currentFormat: "svg",             // Formato activo de vista previa: 'svg', 'png', 'txt'
    currentTemplateId: "sequence",     // Identificador de la plantilla actual
    zoom: 1.0,                        // Factor de escala actual del lienzo (1.0 = 100%)
    pan: { x: 0, y: 0 },              // Desplazamiento actual en coordenadas X e Y
    isDragging: false,                // Bandera indicadora de arrastre activo en el lienzo
    dragStart: { x: 0, y: 0 },        // Coordenadas iniciales del clic al arrastrar
    autoRender: true,                 // Interruptor de renderizado automático al escribir
    debounceTimer: null,              // Temporizador para esperar que el usuario termine de escribir
    lastRenderedCode: "",             // Caché en memoria del último código renderizado exitosamente
    theme: localStorage.getItem("diagramcraft_theme") || "dark", // Tema visual de la interfaz (dark/light)
    exportScale: "1"                  // Escala de exportación (1x, 2x, 3x)
};

// Referencias a los elementos del DOM
const editor = document.getElementById("code-editor");
const lineNumbers = document.getElementById("line-numbers");
const viewport = document.getElementById("diagram-viewport");
const canvasContainer = document.getElementById("canvas-container");
const loadingOverlay = document.getElementById("loading-overlay");
const errorBanner = document.getElementById("error-banner");
const errorMessage = document.getElementById("error-message");
const zoomLevelText = document.getElementById("zoom-level");
const lineCountText = document.getElementById("line-count");
const charCountText = document.getElementById("char-count");
const autoRenderToggle = document.getElementById("auto-render-toggle");
const categoryTabsContainer = document.getElementById("category-tabs");

// Iconos SVG reutilizables
const SVG_ICONS = {
    moon: `<svg class="icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    sun: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    folderOpen: `<svg class="icon" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
    trash: `<svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    umlBadge: `<svg class="icon" style="width:13px; height:13px;" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    techBadge: `<svg class="icon" style="width:13px; height:13px;" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
};

/**
 * Muestra una notificación temporal flotante (Toast) en pantalla sin emojis.
 * @param {string} msg Mensaje a desplegar.
 * @param {number} duration Duración en milisegundos.
 */
function showToast(msg, duration = 2500) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, duration);
}

/**
 * Aplica el tema visual a la interfaz (Modo Oscuro o Modo Claro) y lo almacena localmente.
 * @param {string} theme 'dark' o 'light'
 */
function applyAppTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("diagramcraft_theme", theme);
    const themeIcon = document.getElementById("theme-toggle-icon");
    if (themeIcon) {
        themeIcon.innerHTML = theme === "dark" ? SVG_ICONS.moon : SVG_ICONS.sun;
    }
}

/**
 * Recalcula y actualiza la columna de numeración de líneas y estadísticas del editor.
 */
function updateLineNumbers() {
    const lines = editor.value.split("\n");
    const count = lines.length;
    let numbers = "";
    for (let i = 1; i <= count; i++) {
        numbers += i + "\n";
    }
    lineNumbers.textContent = numbers;
    lineCountText.textContent = `${count} líneas`;
    charCountText.textContent = `${editor.value.length} caracs`;
}

// Sincronizar el desplazamiento vertical de los números de línea con el editor
editor.addEventListener("scroll", () => {
    lineNumbers.scrollTop = editor.scrollTop;
});

// Manejo de atajos de teclado y sangría en el editor
editor.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + "  " + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 2;
        updateLineNumbers();
        triggerAutoRender();
    } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        renderDiagram(true);
    } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        openModal("save-modal");
    }
});

editor.addEventListener("input", () => {
    updateLineNumbers();
    triggerAutoRender();
});

/**
 * Activa el renderizado automático con una pausa de 600 ms tras el último tipeo.
 */
function triggerAutoRender() {
    if (!state.autoRender) return;
    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(() => {
        if (editor.value.trim() !== state.lastRenderedCode) {
            renderDiagram();
        }
    }, 600);
}

/**
 * Actualiza la matriz CSS de transformación (translate y scale) del contenedor del diagrama.
 */
function updateViewportTransform() {
    viewport.style.transform = `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`;
    zoomLevelText.textContent = `${Math.round(state.zoom * 100)}%`;
}

// Controles de ampliación y reducción
function zoomIn() {
    state.zoom = Math.min(state.zoom + 0.15, 3.5);
    updateViewportTransform();
}

function zoomOut() {
    state.zoom = Math.max(state.zoom - 0.15, 0.2);
    updateViewportTransform();
}

function resetZoom() {
    state.zoom = 1.0;
    state.pan = { x: 0, y: 0 };
    updateViewportTransform();
}

// Control de arrastre del lienzo con el ratón (Panning)
canvasContainer.addEventListener("mousedown", (e) => {
    if (e.button !== 0 && e.button !== 1) return;
    state.isDragging = true;
    canvasContainer.classList.add("grabbing");
    state.dragStart = {
        x: e.clientX - state.pan.x,
        y: e.clientY - state.pan.y
    };
});

window.addEventListener("mousemove", (e) => {
    if (!state.isDragging) return;
    state.pan = {
        x: e.clientX - state.dragStart.x,
        y: e.clientY - state.dragStart.y
    };
    updateViewportTransform();
});

window.addEventListener("mouseup", () => {
    state.isDragging = false;
    canvasContainer.classList.remove("grabbing");
});

// Control de zoom interactivo con la rueda del ratón
canvasContainer.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    state.zoom = Math.min(Math.max(state.zoom + delta, 0.2), 4.0);
    updateViewportTransform();
}, { passive: false });

// Control del panel de errores
function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.classList.add("show");
}

function hideError() {
    errorBanner.classList.remove("show");
}

/**
 * Realiza la petición POST a la API de Flask para generar el diagrama localmente.
 * @param {boolean} force Si es True, ignora la caché local y fuerza el renderizado.
 */
async function renderDiagram(force = false) {
    const code = editor.value.trim();
    if (!code) {
        viewport.innerHTML = `<div style="color: var(--text-muted); padding: 2rem;">Ingresa código o selecciona una plantilla en la barra superior de DiagramCraft.</div>`;
        return;
    }

    if (!force && code === state.lastRenderedCode) return;

    hideError();
    loadingOverlay.classList.add("active");

    try {
        const response = await fetch("/api/render", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: code,
                format: state.currentFormat
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            state.lastRenderedCode = data.decoded_code || code;
            
            // Si el backend decodificó una cadena comprimida o URL, actualizar el editor con el código limpio
            if (data.decoded_code && data.decoded_code !== code) {
                editor.value = data.decoded_code;
                updateLineNumbers();
                showToast("Cadena codificada traducida a código fuente en DiagramCraft");
            }

            if (data.format === "svg") {
                viewport.innerHTML = data.content;
            } else if (data.format === "png") {
                viewport.innerHTML = `<img src="data:image/png;base64,${data.base64}" alt="Diagrama Renderizado en DiagramCraft" />`;
            } else if (data.format === "txt") {
                viewport.innerHTML = `<pre>${escapeHtml(data.content)}</pre>`;
            }
        } else {
            showError(data.error || "Ocurrió un error al compilar el diagrama en DiagramCraft.");
        }
    } catch (err) {
        showError("No fue posible comunicarse con el servidor local: " + err.message);
    } finally {
        loadingOverlay.classList.remove("active");
    }
}

/**
 * Solicita al usuario una cadena codificada o URL, la decodifica y la carga en el editor.
 */
async function promptDecodeInput() {
    const raw = prompt("Pega aquí la cadena codificada (~1...) o la URL del diagrama:");
    if (!raw || !raw.trim()) return;

    try {
        const response = await fetch("/api/decode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ encoded: raw.trim() })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            editor.value = data.code;
            updateLineNumbers();
            renderDiagram(true);
            showToast("Diagrama decodificado y renderizado con éxito");
        } else {
            showToast(data.error || "No se pudo decodificar la cadena.");
        }
    } catch (err) {
        showToast("Error en el decodificador local: " + err.message);
    }
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
}

/**
 * Inyecta o reemplaza la directiva de tema en el código actual.
 * @param {string} themeName Nombre del tema de estilo (ej: 'cerulean', 'materia').
 */
function setDiagramTheme(themeName) {
    let code = editor.value;
    const themeRegex = /^!theme\s+[^\r\n]+/m;
    if (themeRegex.test(code)) {
        if (themeName === "default") {
            code = code.replace(themeRegex, "");
        } else {
            code = code.replace(themeRegex, `!theme ${themeName}`);
        }
    } else {
        if (themeName !== "default") {
            const startRegex = /^(@start[a-z]+)/m;
            if (startRegex.test(code)) {
                code = code.replace(startRegex, `$1\n!theme ${themeName}`);
            } else {
                code = `!theme ${themeName}\n` + code;
            }
        }
    }
    editor.value = code;
    updateLineNumbers();
    renderDiagram(true);
    showToast(`Tema de estilo '${themeName}' aplicado`);
}

/**
 * Inyecta fragmentos útiles de personalización rápida en el código (orientación, títulos, etc.).
 * @param {string} snippetTipo Tipo de fragmento a inyectar.
 */
function insertSnippet(snippetTipo) {
    let code = editor.value;
    if (snippetTipo === "orientation") {
        if (code.includes("left to right direction")) {
            code = code.replace("left to right direction\n", "");
            showToast("Orientación vertical restablecida");
        } else {
            const startRegex = /^(@start[a-z]+)/m;
            if (startRegex.test(code)) {
                code = code.replace(startRegex, "$1\nleft to right direction");
            } else {
                code = "left to right direction\n" + code;
            }
            showToast("Orientación horizontal (Izquierda a Derecha) aplicada");
        }
    } else if (snippetTipo === "autonumber") {
        if (!code.includes("autonumber")) {
            const startRegex = /^(@start[a-z]+)/m;
            if (startRegex.test(code)) {
                code = code.replace(startRegex, "$1\nautonumber");
            } else {
                code = "autonumber\n" + code;
            }
            showToast("Autonumeración de pasos activada");
        }
    } else if (snippetTipo === "handwritten") {
        if (!code.includes("skinparam handwritten true")) {
            const startRegex = /^(@start[a-z]+)/m;
            if (startRegex.test(code)) {
                code = code.replace(startRegex, "$1\nskinparam handwritten true");
            } else {
                code = "skinparam handwritten true\n" + code;
            }
            showToast("Estilo boceto a mano alzada activado");
        }
    } else if (snippetTipo === "title") {
        const titleText = prompt("Ingresa el título para el diagrama:", "Diagrama de Arquitectura");
        if (titleText) {
            const startRegex = /^(@start[a-z]+)/m;
            if (startRegex.test(code)) {
                code = code.replace(startRegex, `$1\ntitle ${titleText}`);
            } else {
                code = `title ${titleText}\n` + code;
            }
            showToast("Título agregado al diagrama");
        }
    }

    editor.value = code;
    updateLineNumbers();
    renderDiagram(true);
}

/**
 * Solicita la descarga directa del archivo generado por DiagramCraft.
 * @param {string} format Formato de descarga ('png', 'svg', 'txt', 'puml').
 */
function downloadFile(format) {
    const code = editor.value.trim();
    if (!code) {
        showToast("El código del diagrama está vacío");
        return;
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/download";

    const codeField = document.createElement("input");
    codeField.type = "hidden";
    codeField.name = "code";
    codeField.value = code;
    form.appendChild(codeField);

    const fmtField = document.createElement("input");
    fmtField.type = "hidden";
    fmtField.name = "format";
    fmtField.value = format;
    form.appendChild(fmtField);

    const nameField = document.createElement("input");
    nameField.type = "hidden";
    nameField.name = "filename";
    nameField.value = `diagramcraft_${Date.now()}`;
    form.appendChild(nameField);

    const scaleField = document.createElement("input");
    scaleField.type = "hidden";
    scaleField.name = "scale";
    scaleField.value = state.exportScale;
    form.appendChild(scaleField);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    showToast(`Descargando en formato ${format.toUpperCase()} (${state.exportScale}x)...`);
}

/**
 * Abre el diálogo de impresión configurado para exportar a PDF.
 */
function exportToPdf() {
    window.print();
}

// Copiar contenidos al portapapeles
async function copyCode() {
    try {
        await navigator.clipboard.writeText(editor.value);
        showToast("Código copiado al portapapeles");
    } catch {
        showToast("Error al copiar al portapapeles");
    }
}

async function copySvg() {
    const svgEl = viewport.querySelector("svg");
    if (!svgEl) {
        showToast("No hay gráfico SVG disponible para copiar");
        return;
    }
    try {
        await navigator.clipboard.writeText(svgEl.outerHTML);
        showToast("SVG vectorial copiado al portapapeles");
    } catch {
        showToast("Error al copiar SVG");
    }
}

/**
 * Llena dinámicamente las pestañas de categorías en la barra superior.
 */
function setupCategoryTabs() {
    categoryTabsContainer.innerHTML = "";

    // Grupo 1: UML
    const umlLabel = document.createElement("div");
    umlLabel.className = "category-group-label";
    umlLabel.innerHTML = `${SVG_ICONS.umlBadge} UML:`;
    categoryTabsContainer.appendChild(umlLabel);

    Object.values(DIAGRAM_TEMPLATES).forEach(tmpl => {
        if (tmpl.category === "uml") {
            const btn = createTabButton(tmpl);
            categoryTabsContainer.appendChild(btn);
        }
    });

    // Separador
    const div = document.createElement("div");
    div.className = "category-divider";
    categoryTabsContainer.appendChild(div);

    // Grupo 2: No-UML
    const nonUmlLabel = document.createElement("div");
    nonUmlLabel.className = "category-group-label";
    nonUmlLabel.innerHTML = `${SVG_ICONS.techBadge} No UML:`;
    categoryTabsContainer.appendChild(nonUmlLabel);

    Object.values(DIAGRAM_TEMPLATES).forEach(tmpl => {
        if (tmpl.category === "non_uml") {
            const btn = createTabButton(tmpl);
            categoryTabsContainer.appendChild(btn);
        }
    });
}

function createTabButton(tmpl) {
    const btn = document.createElement("button");
    btn.className = "category-tab";
    btn.id = `tab-${tmpl.id}`;
    btn.textContent = tmpl.name;
    btn.title = tmpl.description;

    if (tmpl.id === state.currentTemplateId) {
        btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
        document.querySelectorAll(".category-tab").forEach(t => t.classList.remove("active"));
        btn.classList.add("active");
        loadTemplate(tmpl.id);
    });

    return btn;
}

function loadTemplate(id) {
    const tmpl = DIAGRAM_TEMPLATES[id];
    if (!tmpl) return;

    state.currentTemplateId = id;
    editor.value = tmpl.code.trim();
    updateLineNumbers();
    resetZoom();
    renderDiagram(true);
    showToast(`Plantilla cargada: ${tmpl.name}`);
}

// Control de ventanas modales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("show");
        if (modalId === "saved-modal") {
            fetchSavedDiagrams();
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("show");
    }
}

// Guardar diagrama en el servidor local
async function saveCurrentDiagram() {
    const nameInput = document.getElementById("save-diagram-name");
    const name = nameInput.value.trim();
    const code = editor.value.trim();

    if (!name) {
        showToast("Por favor ingresa un nombre para el diagrama");
        return;
    }

    try {
        const response = await fetch("/api/diagrams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, code })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            showToast(`Diagrama guardado exitosamente: ${data.filename}`);
            closeModal("save-modal");
            nameInput.value = "";
        } else {
            showToast(data.error || "Ocurrió un error al guardar");
        }
    } catch (err) {
        showToast("Error de conexión: " + err.message);
    }
}

// Listar diagramas guardados en disco
async function fetchSavedDiagrams() {
    const container = document.getElementById("saved-diagrams-list");
    container.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem;">Cargando diagramas de DiagramCraft...</div>`;

    try {
        const response = await fetch("/api/diagrams");
        const data = await response.json();
        if (response.ok && data.success) {
            if (data.diagrams.length === 0) {
                container.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem;">Aún no tienes diagramas guardados en la carpeta local.</div>`;
                return;
            }

            container.innerHTML = "";
            data.diagrams.forEach(diag => {
                const item = document.createElement("div");
                item.className = "saved-item";

                const title = document.createElement("div");
                title.className = "saved-item-title";
                title.textContent = diag.filename;
                title.title = "Haz clic para abrir este diagrama";
                title.addEventListener("click", () => loadSavedDiagram(diag.filename));

                const actions = document.createElement("div");
                actions.className = "saved-item-actions";

                const loadBtn = document.createElement("button");
                loadBtn.className = "btn btn-secondary btn-icon";
                loadBtn.innerHTML = SVG_ICONS.folderOpen;
                loadBtn.title = "Abrir diagrama";
                loadBtn.addEventListener("click", () => loadSavedDiagram(diag.filename));

                const delBtn = document.createElement("button");
                delBtn.className = "btn btn-ghost btn-icon";
                delBtn.innerHTML = SVG_ICONS.trash;
                delBtn.title = "Eliminar archivo";
                delBtn.style.color = "var(--accent-rose)";
                delBtn.addEventListener("click", () => deleteSavedDiagram(diag.filename));

                actions.appendChild(loadBtn);
                actions.appendChild(delBtn);

                item.appendChild(title);
                item.appendChild(actions);
                container.appendChild(item);
            });
        }
    } catch (err) {
        container.innerHTML = `<div style="color: var(--accent-rose); font-size: 0.8rem;">Error: ${err.message}</div>`;
    }
}

async function loadSavedDiagram(filename) {
    try {
        const response = await fetch(`/api/diagrams/${encodeURIComponent(filename)}`);
        const data = await response.json();
        if (response.ok && data.success) {
            editor.value = data.code;
            updateLineNumbers();
            closeModal("saved-modal");
            renderDiagram(true);
            showToast(`Diagrama '${filename}' abierto`);
        }
    } catch (err) {
        showToast("Error al cargar el archivo: " + err.message);
    }
}

async function deleteSavedDiagram(filename) {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente '${filename}'?`)) return;
    try {
        const response = await fetch(`/api/diagrams/${encodeURIComponent(filename)}`, { method: "DELETE" });
        const data = await response.json();
        if (response.ok && data.success) {
            showToast(`Diagrama eliminado`);
            fetchSavedDiagrams();
        }
    } catch (err) {
        showToast("Error al eliminar: " + err.message);
    }
}

// Menús desplegables
function setupDropdown(btnId, menuId) {
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(menuId);
    if (!btn || !menu) return;

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isShown = menu.classList.contains("show");
        document.querySelectorAll(".dropdown-menu").forEach(m => m.classList.remove("show"));
        if (!isShown) {
            menu.classList.add("show");
        }
    });
}

document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-menu").forEach(m => m.classList.remove("show"));
});

// Inicialización al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    applyAppTheme(state.theme);
    setupCategoryTabs();

    // Configuración de menús
    setupDropdown("export-dropdown-btn", "export-dropdown-menu");
    setupDropdown("theme-dropdown-btn", "theme-dropdown-menu");
    setupDropdown("tools-dropdown-btn", "tools-dropdown-menu");

    // Cargar plantilla inicial
    loadTemplate("sequence");

    // Selector de temas
    document.querySelectorAll(".theme-option").forEach(item => {
        item.addEventListener("click", () => {
            const themeName = item.getAttribute("data-theme");
            setDiagramTheme(themeName);
        });
    });

    // Selector de escala PNG
    const scaleSelect = document.getElementById("export-scale-select");
    if (scaleSelect) {
        scaleSelect.addEventListener("change", (e) => {
            state.exportScale = e.target.value;
            showToast(`Resolución de exportación fijada en ${state.exportScale}x`);
        });
    }

    // Botón de alternancia de tema claro/oscuro
    document.getElementById("theme-toggle-btn").addEventListener("click", () => {
        const nextTheme = state.theme === "dark" ? "light" : "dark";
        applyAppTheme(nextTheme);
    });

    // Interruptor de auto-render
    autoRenderToggle.addEventListener("change", (e) => {
        state.autoRender = e.target.checked;
        showToast(state.autoRender ? "Renderizado automático activado" : "Renderizado manual (usa Ctrl+Enter)");
    });

    // Doble clic en el lienzo para restablecer el zoom
    canvasContainer.addEventListener("dblclick", () => {
        resetZoom();
        showToast("Zoom restablecido (100%)");
    });

    // Desplazamiento horizontal fluido con la rueda del ratón en la barra de categorías
    const categoryBar = document.querySelector(".category-bar-wrapper");
    if (categoryBar) {
        categoryBar.addEventListener("wheel", (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                categoryBar.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    }

    // Cerrar modales y menús desplegables con tecla Escape
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.querySelectorAll(".modal-backdrop.show").forEach(m => m.classList.remove("show"));
            document.querySelectorAll(".dropdown-menu.show").forEach(d => d.classList.remove("show"));
        }
    });

    // Cerrar modal al hacer clic en el fondo oscuro exterior
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
        backdrop.addEventListener("click", (e) => {
            if (e.target === backdrop) {
                backdrop.classList.remove("show");
            }
        });
    });

    // Comprobar estado del motor local de DiagramCraft
    fetch("/api/status")
        .then(r => r.json())
        .then(data => {
            const badge = document.getElementById("engine-status-text");
            if (badge && data.is_offline) {
                badge.textContent = "Motor 100% Local (Offline)";
            }
        })
        .catch(() => {});
});
