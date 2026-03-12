// ==UserScript==
// @name         Apps para Agente (V6.5)
// @namespace    http://tampermonkey.net/
// @version      1.5
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
            .latencia-box { font-size: 10px; font-weight: bold; color: #1b7e41; background: #fff; padding: 3px 5px; border-radius: 4px; border: 1px solid #999; min-width: 35px; text-align: center; }
        `;
        document.head.appendChild(style);

        const p = document.createElement('div'); p.id = 'panel-agente-pro'; p.className = 'panel-agente';
        const dCamp = document.createElement('div'); dCamp.id = 'campana-display';
        dCamp.className = 'campana-box';
        dCamp.innerText = "CAMPAÑA: " + (localStorage.getItem('ultima_campaign') || "...");
        p.append(dCamp);

        // FILA 1: Refresco, Plantillas, SPEECH, REFUT, FRACC + LATENCIA
        const f1 = document.createElement('div'); f1.className = 'fila-agente';
        const btnRef = document.createElement('button'); btnRef.className = 'btn-agente'; btnRef.innerText = '🔄'; btnRef.onclick = () => location.reload();
        
        const configP = [
            { n: 'FRACCIONAMIENTO', t: 'FRACC: Se ofreció al TT Campaña de Fraccionamiento del 25% //', e: ["Contacto_Efectivo", "FRACCIONAMIENTO", "Sin incidencia (PDP Pura)"] },
            { n: 'NUMERO EQUIVOCADO', t: 'NE: Cliente Indica que no conoce a persona en mención', e: ["Contacto_No_Efectivo", "Telefono no le corresponde/No lo conoce"] }
        ];
        for (let i = 0; i < 7; i++) {
            const idx = (hoy.getDay() + i) % 7;
            const nom = cap(diasSemana[idx]);
            const textoFecha = (i === 0) ? `Hoy ${getFM(i)}` : `${nom} ${getFM(i)}`;
            configP.push({ n: i === 0 ? 'PDP HOY' : `PDP ${nom.toUpperCase()}`, t: `PDP: TT indica que pagara el día ${textoFecha} //`, e: ["Contacto_Efectivo", "PDP", "Sin incidencia (PDP Pura)"] });
        }

        const selP = document.createElement('select'); selP.className = 'select-tipi'; selP.style.width = "90px";
        const optDefP = document.createElement('option'); optDefP.innerText = "📋 PLANTILLAS"; selP.append(optDefP);
        configP.forEach((it, i) => { const o = document.createElement('option'); o.innerText = it.n; o.value = i; selP.append(o); });
        selP.onchange = () => {
            const it = configP[selP.value];
            const cj = document.getElementById('observaciones');
            if (cj) { cj.value = ""; cj.focus(); document.execCommand('insertText', false, it.t); if (it.e) ejecutarEscalera(it.e); }
            selP.selectedIndex = 0;
        };

        const dLat = document.createElement('div'); dLat.className = 'latencia-box'; dLat.innerText = '...';
        const medirPing = async () => {
            const servidores = ["https://1.1.1.1", "https://8.8.8.8"];
            for (let sv of servidores) {
                const inicio = Date.now();
                try {
                    await fetch(sv, { mode: 'no-cors', cache: 'no-cache', signal: AbortSignal.timeout(2000) });
                    const ms = Date.now() - inicio;
                    dLat.innerText = ms + 'ms';
                    dLat.style.color = ms < 150 ? "#1b7e41" : "#d63031";
                    return;
                } catch (e) { continue; }
            }
        };
        setInterval(medirPing, 5000); medirPing();

        f1.append(btnRef, selP, dLat);
        p.append(f1);

        // FILA 3: Registro y Contadores
        const f3 = document.createElement('div'); f3.className = 'fila-agente';
        const selAg = document.createElement('select'); selAg.className = 'select-agente-reg'; selAg.style.width = "80px";
        const optDefA = document.createElement('option'); optDefA.innerText = "👤 AGENTE"; selAg.append(optDefA);
        const BLOQUEO_PERMANENTE = true;

        const inM = document.createElement('input'); inM.className = 'input-reg'; inM.placeholder = 'Móvil'; inM.style.width = "65px";
        const inF = document.createElement('input'); inF.type = 'date'; inF.className = 'input-reg'; inF.style.width = "65px";
        const btnR = document.createElement('button'); btnR.className = 'btn-agente'; btnR.style.background = '#3DBB9A'; btnR.innerText = 'PDP';

        const dAvance = document.createElement('div'); dAvance.className = 'avance-box'; dAvance.innerText = '...';
        const dAvancePlus = document.createElement('div'); dAvancePlus.className = 'avance-box'; dAvancePlus.innerText = '...'; dAvancePlus.style.color = '#1b7e41';
        const dAvanceF = document.createElement('div'); dAvanceF.className = 'avance-box'; dAvanceF.innerText = '...'; dAvanceF.style.color = '#0b518f';

        const actualizarAvance = async () => {
            const nombreActual = selAg.value;
            if (!nombreActual || nombreActual === "👤 AGENTE") return;
            try {
                const r = await fetch(`${URL_AVANCE}?agente=${encodeURIComponent(nombreActual)}`);
                const num = await r.text();
                if(selAg.value === nombreActual) dAvance.innerText = num || "0";
            } catch (e) { dAvance.innerText = 'err'; }
        };

        const actualizarAvancePlus = async () => {
            const nombreActual = selAg.value;
            if (!nombreActual || nombreActual === "👤 AGENTE") return;
            try {
                const r = await fetch(`${URL_AVANCE_PLUS}?agente=${encodeURIComponent(nombreActual)}`);
                const num = await r.text();
                if(selAg.value === nombreActual) dAvancePlus.innerText = num || "0";
            } catch (e) { dAvancePlus.innerText = 'err'; }
        };

        const actualizarAvanceF = async () => {
            const nombreActual = selAg.value;
            if (!nombreActual || nombreActual === "👤 AGENTE") return;
            try {
                const r = await fetch(`${URL_AVANCE_F}?agente=${encodeURIComponent(nombreActual)}`);
                const num = await r.text();
                if(selAg.value === nombreActual) dAvanceF.innerText = num || "0";
            } catch (e) { dAvanceF.innerText = 'err'; }
        };

        selAg.onchange = () => {
            if (selAg.value !== "👤 AGENTE") {
                localStorage.setItem('agente_fijo', selAg.value);
                if(BLOQUEO_PERMANENTE) selAg.disabled = true;
                actualizarAvance(); actualizarAvancePlus(); actualizarAvanceF();
            }
        };

        // --- INTERVENCIÓN QUIRÚRGICA: Lógica cíclica del botón PDP ---
        btnR.onclick = async () => {
            if(!selAg.value || !inM.value || !inF.value) { 
                btnR.style.background = '#e67e22';
                setTimeout(()=>btnR.style.background='#3DBB9A', 1000); 
                return; 
            }
            const [anio, mes, dia] = inF.value.split('-');
            const fFull = `${dia}/${mes}/${anio}`;
            btnR.innerText = "..."; btnR.style.background = '#f1c40f';
            
            try {
                // Función Principal: Registro
                await fetch(URL_REGISTRO, { method: 'POST', mode: 'no-cors', body: JSON.stringify({movil: inM.value, fechaPromesa: fFull, agente: selAg.value}) });
                btnR.style.background = '#3DBB9A'; inM.value = ""; inF.value = "";
            } catch (e) { 
                btnR.style.background = '#c0392b';
                setTimeout(() => btnR.style.background = '#3DBB9A', 2000); 
            } finally { 
                btnR.innerText = "PDP";
                // Función Secundaria: Actualización tras 10 segundos
                setTimeout(() => {
                    actualizarAvance();
                    actualizarAvancePlus();
                    actualizarAvanceF();
                }, 10000);
            }
        };

        f3.append(selAg, inM, inF, btnR, dAvance, dAvancePlus, dAvanceF);
        p.append(f3);

        // Carga de Agentes
        const cargarAgentes = async () => {
            try {
                const r = await fetch(URL_LISTA_AGENTES);
                const agentes = await r.json();
                if (Array.isArray(agentes)) {
                    LISTA_AGENTES = agentes;
                    const guardado = localStorage.getItem('agente_fijo');
                    selAg.innerHTML = ""; selAg.append(optDefA);
                    LISTA_AGENTES.sort().forEach(a => { const o = document.createElement('option'); o.innerText = o.value = a; selAg.append(o); });
                    if (guardado) { selAg.value = guardado; if(BLOQUEO_PERMANENTE) selAg.disabled = true; }
                }
            } catch (e) { console.error("Error al cargar lista de agentes"); }
        };
        cargarAgentes();

        document.body.append(p);
    }
    setTimeout(iniciarAppsAgente, 20);
})();
