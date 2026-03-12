// ==UserScript==
// @name         Apps para Agente (V6.6)
// @namespace    http://tampermonkey.net/
// @version      1.6
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
        .centrado {
            text-align: left !important;
            display: flex !important;
            justify-content: flex-start !important;
            padding-left: 80px !important;
        }
        @keyframes parpadeoRojo {
            0% { background-color: #C22100; }
            50% { background-color: rgba(194, 33, 0, 0.5); }
            100% { background-color: #C22100; }
        }
        @keyframes parpadeoNaranja {
            0% { background-color: #FF8C00; }
            50% { background-color: rgba(255, 140, 0, 0.5); }
            100% { background-color: #FF8C00; }
        }
        .alerta-desconectado {
            animation: parpadeoRojo 1s infinite !important;
        }
        .alerta-parpadeante {
            animation: parpadeoNaranja 1s infinite !important;
        }
    `;

    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

})();

(function() {
    'use strict';

    // URLs de conexión
    const URL_REGISTRO = "https://script.google.com/macros/s/AKfycbytENmtW_2zZFmQ0EiynSpAiCL8H3hoW2_iQ0uvh-paEb0yCU55crIVGnUInmY0lKvZgQ/exec";
    const URL_AVANCE = "https://script.google.com/macros/s/AKfycbyZMFrt4zi-JFMoX9sLxjfuipCmpdEhqDt_9L6AgQn1PQVYsqV_5gWxyV7hXatEEUBjNw/exec";
    const URL_AVANCE_PLUS = "https://script.google.com/macros/s/AKfycbwIijctr6-z-_FqVhWESKenC6CcURRf0DCw6Lj1GqHHWDP9etayspSEmr3hxhfTIXR1_w/exec";
    const URL_AVANCE_F = "https://script.google.com/macros/s/AKfycbzSOt75Hr3vcp_cxYWLUcER0OCtWwkGXZ2XqeM_6ZgapTNuVq9ww4iJA8CBLOvVh9yBnw/exec";
    const URL_ESTRATEGIAS = "https://script.google.com/macros/s/AKfycbzC1xj9tk9oIFfL36-644UB1E1XrYUb26fsJgt_uAvqDRtGoyrksAh_BvSQ5iaAwrHvsw/exec";
    const URL_LISTA_AGENTES = "https://script.google.com/macros/s/AKfycbyCaZXaUfzbJsxL4SxTNgQhgy3E1zMmD0UPwFsCnP2GMCe7f9XgNVyw9WnNYUhORhn_QA/exec";

    // URLs DINÁMICAS (L2, M2 y N2)
    const URL_SPEECH_DINAMICO = "https://script.google.com/macros/s/AKfycbyaUAQshAn6g3dSl2HaNwwn0kyGQ66whz-IbBrhnMUFpOTpgxybzQMKyvO2A4vEA0VfGw/exec";
    const URL_FRACC_DINAMICO = "https://script.google.com/macros/s/AKfycbwoFgnE0c2kiz3NcQUroVEQjVyrvHVIgK3i2IhsGIARviqxcBUCtWb1-aIvG0qKO9Q52Q/exec";
    const URL_REFUT_DINAMICO = "https://script.google.com/macros/s/AKfycbw3gfUMmkZTPGNoadliAvvhqekHXWhvaWtpVfOMfuYXSBmlKTe0REvgfkhP8pGqpoly8g/exec";

    let LISTA_AGENTES = [];

    function iniciarAppsAgente() {
        if (document.getElementById('panel-agente-pro')) return;

        function obtenerCampañaReal() {
            const btnCampana = document.querySelector('button[data-id="selCampana"] span.filter-option');
            if (btnCampana) {
                const txt = btnCampana.innerText.trim();
                return (txt !== "" && txt !== "Seleccione") ? txt : null;
            }
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
            } else if (display) {
                display.innerText = "CAMPAÑA: " + detectada;
            }
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
                opcionesCamp.forEach(opt => {
                    if (opt.innerText.trim() === guardada) {
                        opt.click();
                        exito = true;
                    }
                });
                if (exito || btnCampana.innerText.trim() === guardada) {
                    await new Promise(r => setTimeout(r, 500));
                    const btnConectar = document.getElementById('btnRegister');
                    if (btnConectar) btnConectar.click();
                }
            }
        }

        setInterval(monitorearCampaña, 5000);

        const hoy = new Date();
        const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
        const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        const getFM = (o) => {
            const d = new Date();
            d.setDate(d.getDate() + o);
            return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        };

        async function ejecutarEscalera(pasos) {
            for (const texto of pasos) {
                const opciones = Array.from(document.querySelectorAll('.dropdown-menu.open li a span.text, span.filter-option.pull-left, option'));
                for (let opt of opciones) {
                    if (opt.innerText.trim() === texto) {
                        if (opt.tagName === 'OPTION') {
                            opt.selected = true;
                            opt.parentElement.dispatchEvent(new Event('change', { bubbles: true }));
                        } else {
                            opt.click();
                        }
                        break;
                    }
                }
                await new Promise(r => setTimeout(r, 600));
            }
        }

        const style = document.createElement('style');
        style.innerHTML = `
            .panel-agente { position: fixed; top: 5px; right: 66px; background: rgba(211, 211, 211, 0.5); color: #333; padding: 10px; border-radius: 10px; z-index: 999999; display: flex; flex-direction: column; gap: 8px; font-family: Arial; border: 1px solid rgba(150,150,150,0.5); width: 420px; box-sizing: border-box; backdrop-filter: blur(4px); }
            .wrapper-checklist { position: fixed; top: 5px; right: 495px; z-index: 999999; display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
            .btn-toggle-check { background: #0b518f; color: white; border: none; border-radius: 6px; padding: 5px 12px; font-weight: bold; font-size: 11px; cursor: pointer; }
            .panel-checklist { background: rgba(211, 211, 211, 0.95); color: #333; padding: 10px; border-radius: 10px; display: none; flex-direction: column; gap: 4px; font-family: Arial; border: 1px solid rgba(150,150,150,0.5); width: 220px; backdrop-filter: blur(4px); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
            .check-item { display: flex; align-items: center; justify-content: space-between; padding: 3px 5px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: help; color: #555; transition: all 0.2s; }
            .check-item.item-rojo { color: #d63031; }
            .check-item.active { color: #1b7e41; background: rgba(61, 187, 154, 0.2); }
            .check-item.active-intenso { color: #fff !important; background: #3DBB9A !important
