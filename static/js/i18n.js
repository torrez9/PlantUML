/**
 * ======================================================================================
 * Sistema de Internacionalización (i18n): i18n.js
 * Aplicación: DiagramCraft Studio
 * Autor: Jose
 * Idiomas Soportados: Español (es) e Inglés (en)
 * ======================================================================================
 */

const I18N = {
    es: {
        // Navbar
        brandSubtitle: "Studio",
        brandAuthor: "Por Jose",
        engineLocal: "Motor 100% Local",
        engineOffline: "Motor 100% Local (Offline)",
        engineRemote: "Motor Remoto",
        myDiagrams: "Mis Diagramas",
        save: "Guardar",
        customize: "Personalizar",
        themes: "Temas",
        export: "Exportar",
        render: "Renderizar",
        about: "Acerca de",
        switchTheme: "Cambiar tema claro / oscuro",
        switchLang: "Cambiar a Inglés / Switch to English",

        // Menú Personalizar
        toggleOrientation: "Alternar Orientación (H / V)",
        enableAutonumber: "Activar Autonumeración",
        insertTitle: "Insertar Título de Diagrama",
        handwrittenStyle: "Estilo Boceto a Mano Alzada",
        decodeString: "Decodificar Cadena / URL",
        printPdf: "Imprimir / Exportar a PDF",

        // Menú Temas
        themeCerulean: "Cerulean (Moderno Azul)",
        themeMateria: "Materia (Material Design)",
        themeVibrant: "Vibrant (Colorido y Vivo)",
        themeSketchy: "Sketchy (Boceto Arquitectónico)",
        themeMint: "Mint (Verde Menta)",
        themeBlueprint: "Blueprint (Plano Técnico)",
        themeCarbon: "Carbon Gray (Neutro)",
        themeSpacelab: "Spacelab (Gris Metálico)",
        themeCyborg: "Cyborg (Alto Contraste)",
        themeDefault: "Por Defecto",

        // Menú Exportar
        resolutionLabel: "Resolución PNG:",
        resStandard: "1x (Estándar)",
        resHd: "2x (Alta Definición)",
        resUhd: "3x (Ultra HD / 4K)",
        downloadPng: "Descargar PNG (Imagen)",
        downloadSvg: "Descargar SVG (Vectorial)",
        downloadTxt: "Descargar TXT (Arte ASCII)",
        downloadPuml: "Descargar Código Fuente",
        copySvg: "Copiar código SVG",
        copyCode: "Copiar código fuente",

        // Panel Izquierdo: Editor
        editorTitle: "Editor de DiagramCraft",
        autoRenderLabel: "Auto-render",
        clearEditor: "Limpiar todo el editor",
        copyEditor: "Copiar código al portapapeles",
        placeholderEditor: "Escribe tu código de diagrama aquí...",
        linesText: "líneas",
        charsText: "caracs",
        shortcutsHelp: "Atajo: <strong>Ctrl + Enter</strong> compilar | <strong>Ctrl + S</strong> guardar",

        // Panel Derecho: Vista Previa
        previewTitle: "Formato:",
        zoomInTooltip: "Acercar (+)",
        zoomOutTooltip: "Alejar (-)",
        zoomResetTooltip: "Restablecer escala original (1:1)",
        compilingText: "Compilando diagrama en DiagramCraft...",
        emptyEditorHint: "Ingresa código o selecciona una plantilla en la barra superior de DiagramCraft.",

        // Modal Guardar
        saveModalTitle: "Guardar Diagrama Local",
        fileNameLabel: "Nombre del archivo:",
        fileNamePlaceholder: "Ej: Diagrama_Secuencia_Ventas",
        fileNameHelp: "Se guardará en la carpeta local saved_diagrams/ con formato .puml",
        cancelBtn: "Cancelar",
        saveBtn: "Guardar Archivo",

        // Modal Mis Diagramas
        savedModalTitle: "Mis Diagramas Guardados",
        loadingSaved: "Cargando diagramas de DiagramCraft...",
        noSavedDiagrams: "Aún no tienes diagramas guardados en la carpeta local.",
        openDiagramTooltip: "Abrir diagrama",
        deleteDiagramTooltip: "Eliminar archivo",
        closeBtn: "Cerrar",
        confirmDelete: "¿Estás seguro de que deseas eliminar permanentemente",

        // Modal Acerca de
        aboutModalTitle: "Acerca de DiagramCraft Studio",
        aboutParagraph1: "DiagramCraft Studio es una plataforma de software libre creada por Jose para permitir a desarrolladores, arquitectos de software y estudiantes modelar, visualizar y exportar diagramas técnicos de forma 100% local, sin conexión a internet y sin intermediarios.",
        aboutAuthor: "Autor y Creador: Jose",
        aboutLicense: "Licencia: Código Abierto (MIT License)",
        aboutEngine: "Motor de Ejecución: 100% Local Offline (Java + JAR nativo)",
        aboutPrivacy: "Privacidad: Los diagramas residen exclusivamente en tu disco local",
        aboutFormats: "Formatos Exportables: PNG (1x, 2x, 3x UHD), SVG vectorial, TXT ASCII y PDF",
        understoodBtn: "Entendido",

        // Toasts y Mensajes
        toastOrientationH: "Orientación horizontal (Izquierda a Derecha) aplicada",
        toastOrientationV: "Orientación vertical restablecida",
        toastAutonumber: "Autonumeración de pasos activada",
        toastHandwritten: "Estilo boceto a mano alzada activado",
        toastTitlePrompt: "Ingresa el título para el diagrama:",
        toastTitleApplied: "Título agregado al diagrama",
        toastThemeApplied: "Tema de estilo aplicado",
        toastCodeCopied: "Código copiado al portapapeles",
        toastSvgCopied: "SVG vectorial copiado al portapapeles",
        toastZoomReset: "Zoom restablecido (100%)",
        toastResolutionset: "Resolución de exportación fijada en",
        toastAutoRenderOn: "Renderizado automático activado",
        toastAutoRenderOff: "Renderizado manual (usa Ctrl+Enter)",
        toastDiagramSaved: "Diagrama guardado exitosamente:",
        toastDiagramDeleted: "Diagrama eliminado del disco",
        toastDiagramOpened: "Diagrama abierto:",
        toastEmptyCode: "El código del diagrama está vacío",
        toastNameRequired: "Por favor ingresa un nombre para el diagrama",
        toastDownloadStarting: "Descargando en formato",
        toastDecodedSuccess: "Cadena codificada traducida a código fuente en DiagramCraft",
        toastDecodePrompt: "Pega aquí la cadena codificada (~1...) o la URL del diagrama:",
        toastErrorPrefix: "Error en DiagramCraft:",

        // Categorías
        catUML: "UML:",
        catNonUML: "No UML:"
    },

    en: {
        // Navbar
        brandSubtitle: "Studio",
        brandAuthor: "By Jose",
        engineLocal: "100% Local Engine",
        engineOffline: "100% Local Engine (Offline)",
        engineRemote: "Remote Fallback Engine",
        myDiagrams: "My Diagrams",
        save: "Save",
        customize: "Customize",
        themes: "Themes",
        export: "Export",
        render: "Render",
        about: "About",
        switchTheme: "Toggle dark / light mode",
        switchLang: "Cambiar a Español / Switch to Spanish",

        // Customize Menu
        toggleOrientation: "Toggle Orientation (H / V)",
        enableAutonumber: "Enable Autonumbering",
        insertTitle: "Insert Diagram Title",
        handwrittenStyle: "Handwritten Sketch Style",
        decodeString: "Decode String / URL",
        printPdf: "Print / Export to PDF",

        // Themes Menu
        themeCerulean: "Cerulean (Modern Blue)",
        themeMateria: "Materia (Material Design)",
        themeVibrant: "Vibrant (Colorful & Sharp)",
        themeSketchy: "Sketchy (Architectural Sketch)",
        themeMint: "Mint (Soft Green)",
        themeBlueprint: "Blueprint (Technical Plan)",
        themeCarbon: "Carbon Gray (Neutral)",
        themeSpacelab: "Spacelab (Metallic Gray)",
        themeCyborg: "Cyborg (High Contrast)",
        themeDefault: "Default Theme",

        // Export Menu
        resolutionLabel: "PNG Resolution:",
        resStandard: "1x (Standard)",
        resHd: "2x (High Definition)",
        resUhd: "3x (Ultra HD / 4K)",
        downloadPng: "Download PNG (Image)",
        downloadSvg: "Download SVG (Vector)",
        downloadTxt: "Download TXT (ASCII Art)",
        downloadPuml: "Download Source Code",
        copySvg: "Copy SVG markup",
        copyCode: "Copy source code",

        // Left Panel: Editor
        editorTitle: "DiagramCraft Editor",
        autoRenderLabel: "Auto-render",
        clearEditor: "Clear entire editor",
        copyEditor: "Copy code to clipboard",
        placeholderEditor: "Write your diagram code here...",
        linesText: "lines",
        charsText: "chars",
        shortcutsHelp: "Shortcut: <strong>Ctrl + Enter</strong> compile | <strong>Ctrl + S</strong> save",

        // Right Panel: Preview
        previewTitle: "Format:",
        zoomInTooltip: "Zoom In (+)",
        zoomOutTooltip: "Zoom Out (-)",
        zoomResetTooltip: "Reset to 100% scale (1:1)",
        compilingText: "Compiling diagram in DiagramCraft...",
        emptyEditorHint: "Enter diagram code or select a template from the top bar in DiagramCraft.",

        // Save Modal
        saveModalTitle: "Save Diagram Locally",
        fileNameLabel: "File name:",
        fileNamePlaceholder: "e.g., Sales_Sequence_Diagram",
        fileNameHelp: "Will be saved in the local saved_diagrams/ folder with .puml extension",
        cancelBtn: "Cancel",
        saveBtn: "Save File",

        // My Diagrams Modal
        savedModalTitle: "My Saved Diagrams",
        loadingSaved: "Loading DiagramCraft diagrams...",
        noSavedDiagrams: "You have no saved diagrams in the local folder yet.",
        openDiagramTooltip: "Open diagram",
        deleteDiagramTooltip: "Delete file",
        closeBtn: "Close",
        confirmDelete: "Are you sure you want to permanently delete",

        // About Modal
        aboutModalTitle: "About DiagramCraft Studio",
        aboutParagraph1: "DiagramCraft Studio is an open-source platform created by Jose to empower developers, software architects, and students to model, visualize, and export technical diagrams 100% locally, with no internet connection required and zero telemetry.",
        aboutAuthor: "Author & Creator: Jose",
        aboutLicense: "License: Open Source (MIT License)",
        aboutEngine: "Execution Engine: 100% Local Offline (Java + Native JAR)",
        aboutPrivacy: "Privacy: Diagrams reside exclusively on your local storage",
        aboutFormats: "Export Formats: PNG (1x, 2x, 3x UHD), Vector SVG, ASCII TXT, and PDF",
        understoodBtn: "Understood",

        // Toasts & Messages
        toastOrientationH: "Horizontal orientation (Left to Right) applied",
        toastOrientationV: "Vertical orientation restored",
        toastAutonumber: "Step autonumbering enabled",
        toastHandwritten: "Handwritten sketch style enabled",
        toastTitlePrompt: "Enter title for the diagram:",
        toastTitleApplied: "Title added to diagram",
        toastThemeApplied: "Style theme applied",
        toastCodeCopied: "Code copied to clipboard",
        toastSvgCopied: "Vector SVG copied to clipboard",
        toastZoomReset: "Zoom reset (100%)",
        toastResolutionset: "Export resolution set to",
        toastAutoRenderOn: "Automatic rendering enabled",
        toastAutoRenderOff: "Manual rendering enabled (use Ctrl+Enter)",
        toastDiagramSaved: "Diagram saved successfully:",
        toastDiagramDeleted: "Diagram deleted from disk",
        toastDiagramOpened: "Diagram opened:",
        toastEmptyCode: "Diagram code is empty",
        toastNameRequired: "Please enter a file name for the diagram",
        toastDownloadStarting: "Downloading in format",
        toastDecodedSuccess: "Encoded string translated to source code in DiagramCraft",
        toastDecodePrompt: "Paste here the encoded string (~1...) or diagram URL:",
        toastErrorPrefix: "DiagramCraft Error:",

        // Categories
        catUML: "UML:",
        catNonUML: "Non-UML:"
    }
};

let currentLang = localStorage.getItem("diagramcraft_lang") || "es";

/**
 * Obtiene una traducción por su clave en el idioma activo.
 */
function t(key) {
    if (I18N[currentLang] && I18N[currentLang][key]) {
        return I18N[currentLang][key];
    }
    if (I18N.es && I18N.es[key]) {
        return I18N.es[key];
    }
    return key;
}

/**
 * Cambia el idioma activo de la aplicación ('es' o 'en') y actualiza la UI.
 */
function setLanguage(lang) {
    if (lang !== "es" && lang !== "en") lang = "es";
    currentLang = lang;
    localStorage.setItem("diagramcraft_lang", currentLang);
    document.documentElement.setAttribute("lang", currentLang);
    applyTranslations();
}

/**
 * Recorre todos los elementos con atributo data-i18n y actualiza su contenido.
 */
function applyTranslations() {
    // 1. Textos directos
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (I18N[currentLang] && I18N[currentLang][key]) {
            el.innerHTML = I18N[currentLang][key];
        }
    });

    // 2. Títulos / Tooltips
    document.querySelectorAll("[data-i18n-title]").forEach(el => {
        const key = el.getAttribute("data-i18n-title");
        if (I18N[currentLang] && I18N[currentLang][key]) {
            el.setAttribute("title", I18N[currentLang][key]);
        }
    });

    // 3. Placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (I18N[currentLang] && I18N[currentLang][key]) {
            el.setAttribute("placeholder", I18N[currentLang][key]);
        }
    });

    // 4. Actualizar botón de idioma
    const langBtnText = document.getElementById("current-lang-text");
    if (langBtnText) {
        langBtnText.textContent = currentLang.toUpperCase();
    }
    const langBtn = document.getElementById("lang-toggle-btn");
    if (langBtn) {
        langBtn.setAttribute("title", t("switchLang"));
    }

    // 5. Re-renderizar pestañas de categorías para reflejar idioma
    if (typeof setupCategoryTabs === "function") {
        setupCategoryTabs();
    }
}
