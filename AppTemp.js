// ==UserScript==
// @name         Apps para Agente (V6.9)
// @namespace    http://tampermonkey.net/
// @version      1.9
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

    // URLs DINÁMICAS
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
            .check-item.active-intenso { color: #fff !important; background: #3DBB9A !important; }
            .check-item input { cursor: pointer; width: 13px; height: 13px; margin: 0; }
            .res-calidad { text-align: center; font-size: 13px; font-weight: bold; border-top: 1px solid #999; padding-top: 5px; margin-top: 5px; color: #2c3e50; }
            .panel-drop-info { position: fixed; top: 210px; right: 66px; background: rgba(211, 211, 211, 0.98); color: #333; padding: 12px; border-radius: 10px; z-index: 999998; display: none; flex-direction: column; gap: 8px; font-family: Arial; border: 1px solid rgba(150,150,150,0.5); width: 420px; box-sizing: border-box; backdrop-filter: blur(8px); box-shadow: 0 8px 20px rgba(0,0,0,0.3); max-height: 480px; overflow-y: auto; }
            .fila-agente { display: flex; align-items: center; gap: 5px; justify-content: space-between; width: 100%; }
            .btn-agente { cursor: pointer; border: none; border-radius: 4px; padding: 4px 8px; color: white; font-weight: bold; background: #0b518f; font-size: 11px; }
            .select-tipi, .select-agente-reg { padding: 4px; border-radius: 4px; font-weight: bold; background: white; color: black !important; font-size: 11px; }
            .calc-box { display: flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.4); padding: 5px; border-radius: 6px; border: 1px solid #999; width: 100%; box-sizing: border-box; justify-content: space-between; }
            .input-calc, .input-reg { width: 50px; padding: 3px; border-radius: 4px; border: 1px solid #999; text-align: center; font-size: 11px; background: white !important; }
            .res-val { font-size: 11.5px; font-weight: bold; white-space: nowrap; }
            .v-ahorro { color: #d63031; } .v-final { color: #1b7e41; } .v-cuota { color: #5b48d9; } .v-total-p { color: #0984e3; }
            .campana-box { background: #34495e; padding: 5px; border-radius: 5px; font-size: 11px; text-align: center; border: 1px solid #2d8c73; color: white; font-weight: bold; transition: background 0.5s ease; text-shadow: none; width: 100%; }
            .avance-box { background: #fff; padding: 3px 6px; border-radius: 4px; border: 1px solid #999; font-weight: bold; color: #e67e22; font-size: 11px; min-width: 32px; text-align: center; }
            .time-copy { font-size: 10px; color: #1b7e41; font-weight: bold; margin-left: 5px; }
            .latencia-box { font-size: 10px; font-weight: bold; color: #1b7e41; background: #fff; padding: 3px 5px; border-radius: 4px; border: 1px solid #999; min-width: 35px; text-align: center; }
        `;
        document.head.appendChild(style);

        // --- CHECKLIST CALIDAD ---
        const wrapperCheck = document.createElement('div');
        wrapperCheck.className = 'wrapper-checklist';
        const btnToggleCheck = document.createElement('button');
        btnToggleCheck.className = 'btn-toggle-check';
        btnToggleCheck.innerText = "📋 Calidad";
        const pCheck = document.createElement('div');
        pCheck.className = 'panel-checklist';
        const dataCalidad = [
            { n: "Protocolo saludo/despedida", p: 5, d: "Realiza saludo y presentación correcta." },
            { n: "Datos de la cobranza", p: 15, d: "Informa producto y deuda total." },
            { n: "Indaga motivo de atraso", p: 10, d: "Consulta y confirma el motivo del retraso.", r: true },
            { n: "Expresa atributos de pago", p: 10, d: "Comunica beneficios y consecuencias." },
            { n: "Manejo de objeción", p: 5, d: "Responde objeciones con actitud profesional." },
            { n: "Canales de pago", p: 10, d: "Indica medios de pago disponibles." },
            { n: "Realiza compromiso cerrado", p: 25, d: "Concreta acuerdo con fecha definida.", r: true },
            { n: "Cierre efectivo", p: 20, d: "Finaliza reforzando información.", r: true }
        ];
        const resDiv = document.createElement('div');
        resDiv.className = 'res-calidad';
        resDiv.innerText = "Resultado: 0%";
        const calcular = () => {
            let total = 0;
            pCheck.querySelectorAll('.check-item').forEach(item => {
                const chk = item.querySelector('input');
                const esEspecial = chk.dataset.especial === "true";
                if (chk.checked) {
                    total += parseInt(chk.dataset.peso);
                    if (esEspecial) { item.classList.add('active-intenso'); item.classList.remove('item-rojo', 'active'); }
                    else { item.classList.add('active'); }
                } else {
                    item.classList.remove('active', 'active-intenso');
                    if (esEspecial) item.classList.add('item-rojo');
                }
            });
            resDiv.innerText = `Resultado: ${total}%`;
            resDiv.style.color = (total === 100) ? "#1b7e41" : "#2c3e50";
        };
        dataCalidad.forEach(item => {
            const label = document.createElement('label');
            label.className = 'check-item';
            if (item.r) label.classList.add('item-rojo');
            label.title = item.d;
            label.innerHTML = `<span><input type="checkbox" data-peso="${item.p}" data-especial="${item.r || false}"> ${item.n}</span> <span>${item.p}%</span>`;
            label.querySelector('input').onchange = calcular;
            pCheck.append(label);
        });
        const btnLimpiarCheck = document.createElement('button');
        btnLimpiarCheck.innerText = "Limpiar Check";
        btnLimpiarCheck.className = "btn-agente";
        btnLimpiarCheck.style.cssText = "background:#7f8c8d; margin-top:5px; font-size:9px;";
        btnLimpiarCheck.onclick = () => { pCheck.querySelectorAll('input').forEach(i => i.checked = false); calcular(); };
        btnToggleCheck.onclick = () => { pCheck.style.display = (pCheck.style.display === 'flex') ? 'none' : 'flex'; };
        pCheck.append(resDiv, btnLimpiarCheck);
        wrapperCheck.append(btnToggleCheck, pCheck);
        document.body.append(wrapperCheck);

        // --- PANELES DINÁMICOS ---
        const pContrato = document.createElement('div');
        pContrato.className = 'panel-drop-info';
        pContrato.innerHTML = `<h4 style="margin:0 0 5px 0; color:#0b518f; font-size:13px; border-bottom:1px solid #999;"><b>📓 SCRIPT FRACCIONAMIENTO</b></h4><div id="fracc-content-m2" style="font-size: 10.5px; line-height: 1.35; text-align: justify; color: #222;">Cargando script M2...</div>`;
        const actualizarFraccDinamico = async () => {
            try {
                const r = await fetch(URL_FRACC_DINAMICO);
                const txt = await r.text();
                const container = document.getElementById('fracc-content-m2');
                if (container) container.innerText = txt;
            } catch (e) { console.error("Error al cargar script M2"); }
        };
        const pB1 = document.createElement('div');
        pB1.className = 'panel-drop-info';
        pB1.innerHTML = `<h4 style="margin:0 0 5px 0; color:#0b518f; font-size:13px; border-bottom:1px solid #999;"><b>📓 SPEECH DE COBRANZA</b></h4><div id="speech-content-l2" style="font-size: 10.5px; line-height: 1.3; color: #222; text-align: justify;">Cargando speech L2...</div>`;
        const actualizarSpeechDinamico = async () => {
            try {
                const r = await fetch(URL_SPEECH_DINAMICO);
                const txt = await r.text();
                const container = document.getElementById('speech-content-l2');
                if (container) container.innerText = txt;
            } catch (e) { console.error("Error al cargar speech L2"); }
        };
        const pB2 = document.createElement('div');
        pB2.className = 'panel-drop-info';
        pB2.innerHTML = `<h4 style="margin:0 0 5px 0; color:#0b518f; font-size:13px; border-bottom:1px solid #999;"><b>📓 INFORMACION+</b></h4><div id="refut-content-n2" style="font-size: 11px; line-height: 1.3; color: #222; text-align: justify;">Cargando refutaciones N2...</div>`;
        const actualizarRefutDinamico = async () => {
            try {
                const r = await fetch(URL_REFUT_DINAMICO);
