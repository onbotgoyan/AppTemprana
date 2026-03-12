// ==UserScript==
// @name         Apps para Agente (V6.9.4)
// @namespace    http://tampermonkey.net/
// @version      1.9.4
// @description  Apps CRM
// @author       Yancarlos
// @match        https://home1_ch.mibot.cl/softphone/webphonev2.php*
// @updateURL    https://raw.githubusercontent.com/onbotgoyan/AppTemprana/main/AppTemp.js
// @downloadURL  https://raw.githubusercontent.com/onbotgoyan/AppTemprana/main/AppTemp.js
// @grant        none
// @run-at       document-end
// ==/UserScript==


(function() {
    'use strict';
    const css = `
        .centrado { text-align: left !important; display: flex !important; justify-content: flex-start !important; padding-left: 80px !important; }
        @keyframes parpadeoRojo { 0% { background-color: #C22100; } 50% { background-color: rgba(194, 33, 0, 0.5); } 100% { background-color: #C22100; } }
        @keyframes parpadeoNaranja { 0% { background-color: #FF8C00; } 50% { background-color: rgba(255, 140, 0, 0.5); } 100% { background-color: #FF8C00; } }
        .alerta-desconectado { animation: parpadeoRojo 1s infinite !important; }
        .alerta-parpadeante { animation: parpadeoNaranja 1s infinite !important; }
    `;
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
})();

(function() {
    'use strict';
    const URL_REGISTRO = "https://script.google.com/macros/s/AKfycbytENmtW_2zZFmQ0EiynSpAiCL8H3hoW2_iQ0uvh-paEb0yCU55crIVGnUInmY0lKvZgQ/exec";
    const URL_AVANCE = "https://script.google.com/macros/s/AKfycbyZMFrt4zi-JFMoX9sLxjfuipCmpdEhqDt_9L6AgQn1PQVYsqV_5gWxyV7hXatEEUBjNw/exec";
    const URL_AVANCE_PLUS = "https://script.google.com/macros/s/AKfycbwIijctr6-z-_FqVhWESKenC6CcURRf0DCw6Lj1GqHHWDP9etayspSEmr3hxhfTIXR1_w/exec";
    const URL_AVANCE_F = "https://script.google.com/macros/s/AKfycbzSOt75Hr3vcp_cxYWLUcER0OCtWwkGXZ2XqeM_6ZgapTNuVq9ww4iJA8CBLOvVh9yBnw/exec";
    const URL_ESTRATEGIAS = "https://script.google.com/macros/s/AKfycbzC1xj9tk9oIFfL36-644UB1E1XrYUb26fsJgt_uAvqDRtGoyrksAh_BvSQ5iaAwrHvsw/exec";
    const URL_LISTA_AGENTES = "https://script.google.com/macros/s/AKfycbyCaZXaUfzbJsxL4SxTNgQhgy3E1zMmD0UPwFsCnP2GMCe7f9XgNVyw9WnNYUhORhn_QA/exec";
    const URL_SPEECH_DINAMICO = "https://script.google.com/macros/s/AKfycbyaUAQshAn6g3dSl2HaNwwn0kyGQ66whz-IbBrhnMUFpOTpgxybzQMKyvO2A4vEA0VfGw/exec";
    const URL_FRACC_DINAMICO = "https://script.google.com/macros/s/AKfycbwoFgnE0c2kiz3NcQUroVEQjVyrvHVIgK3i2IhsGIARviqxcBUCtWb1-aIvG0qKO9Q52Q/exec";
    const URL_REFUT_DINAMICO = "https://script.google.com/macros/s/AKfycbw3gfUMmkZTPGNoadliAvvhqekHXWhvaWtpVfOMfuYXSBmlKTe0REvgfkhP8pGqpoly8g/exec";

    let LISTA_AGENTES = [];

    function iniciarAppsAgente() {
        if (document.getElementById('panel-agente-pro')) return;

        function obtenerCampañaReal() {
            const btnCampana = document.querySelector('button[data-id="selCampana"] span.filter-option');
            if (btnCampana) { const txt = btnCampana.innerText.trim(); return (txt !== "" && txt !== "Seleccione") ? txt : null; }
            return null;
        }

        function monitorearCampaña() {
            const detectada = obtenerCampañaReal() || localStorage.getItem('ultima_campaña') || "...";
            const display = document.getElementById('campana-display');
            const barraOriginal = document.getElementById('barra_progreso_ruts');
            if (detectada) localStorage.setItem('ultima_campaña', detectada);
            if (display && barraOriginal) {
                const porcentaje = barraOriginal.getAttribute('aria-valuenow') || "0";
                display.innerText = `CAMPAÑA: ${detectada} (${porcentaje}%)`;
                display.style.background = `linear-gradient(to right, #3DBB9A ${porcentaje}%, #34495e ${porcentaje}%)`;
            } else if (display) { display.innerText = "CAMPAÑA: " + detectada; }
        }

        async function reasignarCampañaYConectar() {
            const guardada = localStorage.getItem('ultima_campaña');
            if (!guardada) return;
            const btnTipo = document.querySelector('button[data-id="selTipoGestion"]');
            if (btnTipo && btnTipo.title !== "Por campaña") {
                btnTipo.click();
                await new Promise(r => setTimeout(r, 500));
                const opcionesTipo = document.querySelectorAll('.dropdown-menu.open li a span.text');
                opcionesTipo.forEach(opt => { if (opt.innerText.trim() === "Por campaña") opt.click(); });
            }
            await new Promise(r => setTimeout(r, 500));
            const btnCampana = document.querySelector('button[data-id="selCampana"]');
            if (btnCampana) {
                btnCampana.click();
                await new Promise(r => setTimeout(r, 300));
                const opcionesCamp = document.querySelectorAll('.dropdown-menu.open li a span.text');
                let exito = false;
                opcionesCamp.forEach(opt => { if (opt.innerText.trim() === guardada) { opt.click(); exito = true; } });
                if (exito || btnCampana.innerText.trim() === guardada) {
                    await new Promise(r => setTimeout(r, 500));
                    const btnConectar = document.getElementById('btnRegister');
                    if (btnConectar) btnConectar.click();
                }
            }
        }

        setInterval(monitorearCampaña, 5000);
        
        // ... [Código de checklists, calculadoras y paneles mantenido igual] ...
        
        // MANTENIENDO TU ESTRUCTURA ORIGINAL, SOLO CAMBIO EN consultarEstrategia
        let ultimoValorE = "";
        const consultarEstrategia = async () => {
            let seleccion = selEst.value;
            let parametro = seleccion;
            if (seleccion === "AUTO") {
                const ag = selAg.value;
                if (!ag || ag === "👤 AGENTE") { resCola.innerText = "Sel. Agente"; resCuartil.innerText = "C: -"; return; }
                parametro = ag;
            }
            peticionActual = parametro;
            try {
                const r = await fetch(`${URL_ESTRATEGIAS}?estrategia=${encodeURIComponent(parametro)}`);
                const raw = await r.text();
                let valE = raw, valQ = "-";
                if (raw.includes('|')) { const partes = raw.split('|'); valE = partes[0].trim(); valQ = partes[1].trim(); }
                if (peticionActual !== parametro) return;
                
                // --- INTEGRACIÓN: CONEXIÓN AUTOMÁTICA ---
                if (ultimoValorE !== "" && ultimoValorE !== valE) {
                    localStorage.setItem('ultima_campaña', valE);
                    reasignarCampañaYConectar();
                    iconMsg.innerText = "📩"; iconMsg.style.fontSize = "14px"; iconMsg.style.display = 'inline';
                }
                
                if (resCola.innerText !== "¡Copiado!") { ultimoValorE = valE; resCola.innerText = valE; resCuartil.innerText = `C: ${valQ}`; }
                // ... [Lógica de colores de alerta mantenida igual] ...
            } catch (e) { if (peticionActual === parametro) { resCola.innerText = "Error"; resCuartil.innerText = "C: Error"; } }
        };
        
        // ... [Resto de tu script original: carga de agentes, inicialización, etc.] ...
    }
    setTimeout(iniciarAppsAgente, 20);
})();
