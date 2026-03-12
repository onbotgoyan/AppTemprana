// ==UserScript==
// @name         Apps para Agente (V6.9.2)
// @namespace    http://tampermonkey.net/
// @version      1.9.2
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
                        } else { opt.click(); }
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
                const txt = await r.text();
                const container = document.getElementById('refut-content-n2');
                if (container) container.innerText = txt;
            } catch (e) { console.error("Error al cargar refutaciones N2"); }
        };
        document.body.append(pContrato, pB1, pB2);

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
            { n: 'NUMERO EQUIVOCADO', t: 'NE: Cliente Indica que no conoce a persona en mención', e: ["Contacto_No_Efectivo", "Telefono no le corresponde/No lo conoce"] },
            { n: 'CORTA LLAMADA (SC)', t: 'CC: Corta Llamada - sin contacto', e: ["Contacto_No_Efectivo", "Se cortó la llamada"] },
            { n: 'NO CONTESTA', t: 'NC: No Contesta - sin contacto', e: ["No_Contacto", "No contesta"] },
            { n: 'BUZON DE VOZ', t: 'BZ: Llamada ingresa a Buzón de voz - sin contacto', e: ["No_Contacto", "Apagado / Casilla de voz/Congestión"] },
            { n: 'TT CORTA LLAMADA', t: 'CCT: TT corta llamada y no da fecha de pago', e: ["Contacto_Efectivo", "SIN PDP", "Cliente corta llamada"] },
            { n: 'LLAMADA VACIA', t: 'LV: Llamada Vacia', e: ["Contacto_No_Efectivo", "Se cortó la llamada"] },
            { n: 'TERCERO DEJA MENSAJE', t: 'TM: Tercero dejara mensaje a TT', e: ["Contacto_No_Efectivo", "Mensaje Tercero"] },
            { n: 'YA PAGO', t: 'YP: TT indica que ya pago su servicio a través del App', e: ["Contacto_Efectivo", "SIN PDP", "Cliente indica que ya pagó"] }
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

        const btnB1 = document.createElement('button'); btnB1.className = 'btn-agente'; btnB1.innerText = 'SPEECH';
        const btnB2 = document.createElement('button'); btnB2.className = 'btn-agente'; btnB2.innerText = 'INFO+';
        const btnC = document.createElement('button'); btnC.className = 'btn-agente'; btnC.style.background = '#3DBB9A'; btnC.innerText = 'FRACC';

        const togglePanel = (panelActivo) => {
            [pContrato, pB1, pB2].forEach(pnl => {
                if (pnl === panelActivo) pnl.style.display = (pnl.style.display === 'flex') ? 'none' : 'flex';
                else pnl.style.display = 'none';
            });
            if (panelActivo === pContrato && pContrato.style.display === 'flex') actualizarFraccDinamico();
            if (panelActivo === pB1 && pB1.style.display === 'flex') actualizarSpeechDinamico();
            if (panelActivo === pB2 && pB2.style.display === 'flex') actualizarRefutDinamico();
        };
        btnB1.onclick = () => togglePanel(pB1);
        btnB2.onclick = () => togglePanel(pB2);
        btnC.onclick = () => togglePanel(pContrato);

        const dLat = document.createElement('div'); dLat.className = 'latencia-box'; dLat.innerText = '...';
        const medirPing = async () => {
            const servidores = ["https://1.1.1.1", "https://8.8.8.8", "https://4.2.2.2"];
            for (let sv of servidores) {
                const inicio = Date.now();
                try {
                    await fetch(sv, { mode: 'no-cors', cache: 'no-cache', signal: AbortSignal.timeout(2000) });
                    const ms = Date.now() - inicio;
                    dLat.innerText = ms + 'ms';
                    dLat.style.color = ms < 150 ? "#1b7e41" : (ms < 300 ? "#e67e22" : "#d63031");
                    return;
                } catch (e) { continue; }
            }
            dLat.innerText = 'OFF'; dLat.style.color = "#d63031";
        };
        setInterval(medirPing, 5000); medirPing();
        f1.append(btnRef, selP, btnB1, btnB2, btnC, dLat);
        p.append(f1);

        // FILA 2: Calculadora
        const f2 = document.createElement('div'); f2.className = 'fila-agente';
        const dCal = document.createElement('div'); dCal.className = 'calc-box';
        const iP = document.createElement('input'); iP.className = 'input-calc'; iP.placeholder = 'Yape';
        const iD = document.createElement('input'); iD.className = 'input-calc'; iD.placeholder = '%'; iD.style.width = "35px";
        const chk = document.createElement('input'); chk.type = 'checkbox';
        const rA = document.createElement('span'); rA.className = 'res-val v-ahorro'; rA.innerText = 'Desc:0';
        const rV = document.createElement('span'); rV.className = 'res-val v-final'; rV.innerText = 'Monto:0';
        const rM = document.createElement('span'); rM.className = 'res-val v-cuota'; rM.innerText = 'Fracc:0';
        const rS = document.createElement('span'); rS.className = 'res-val v-total-p'; rS.innerText = 'Plan+Fracc:0';
        const calcLogic = () => {
            const val = parseFloat(iP.value) || 0; const pct = parseFloat(iD.value) || 0;
            let vV, cM, sA, aR;
            if (chk.checked) {
                iD.disabled = false; iD.style.background = "white"; iD.style.color = "black"; iP.placeholder = "Exigible";
                aR = val * (pct / 100); vV = val - aR; cM = vV / 6; sA = val + cM; rA.innerText = `Desc:${aR.toFixed(1)}`;
            } else {
                iD.disabled = true; iD.style.background = "#7f8c8d"; iD.style.color = "white"; iP.placeholder = "Yape";
                aR = 0; vV = val; cM = vV / 6; sA = (vV / 0.75) + cM; rA.innerText = `Desc:-`;
            }
            rV.innerText = `Monto:${vV.toFixed(1)}`; rM.innerText = `Fracc:${cM.toFixed(1)}`; rS.innerText = `Plan+Fracc:${sA.toFixed(1)}`;
        };
        iP.oninput = calcLogic; iD.oninput = calcLogic; chk.onchange = calcLogic;
        calcLogic();
        dCal.append(iP, iD, chk, rA, rV, rM, rS); f2.append(dCal);
        p.append(f2);

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
        setInterval(actualizarAvance, 2000); setInterval(actualizarAvancePlus, 2000); setInterval(actualizarAvanceF, 2000);
        selAg.onchange = () => {
            if (selAg.value !== "👤 AGENTE") {
                localStorage.setItem('agente_fijo', selAg.value);
                if(BLOQUEO_PERMANENTE) selAg.disabled = true;
                actualizarAvance(); actualizarAvancePlus(); actualizarAvanceF();
            }
        };
        btnR.onclick = async () => {
            if(!selAg.value || !inM.value || !inF.value) { btnR.style.background = '#e67e22'; setTimeout(()=>btnR.style.background='#3DBB9A', 1000); return; }
            const [anio, mes, dia] = inF.value.split('-'); const fFull = `${dia}/${mes}/${anio}`;
            btnR.innerText = "..."; btnR.style.background = '#f1c40f';
            try {
                await fetch(URL_REGISTRO, { method: 'POST', mode: 'no-cors', body: JSON.stringify({movil: inM.value, fechaPromesa: fFull, agente: selAg.value}) });
                btnR.style.background = '#3DBB9A'; inM.value = ""; inF.value = "";
            } catch (e) { btnR.style.background = '#c0392b'; setTimeout(() => btnR.style.background = '#3DBB9A', 2000); } finally { btnR.innerText = "PDP"; }
        };
        f3.append(selAg, inM, inF, btnR, dAvance, dAvancePlus, dAvanceF);
        p.append(f3);

        // FILA 4: Estrategias
        const f4 = document.createElement('div'); f4.className = 'fila-agente';
        const dColaBox = document.createElement('div'); dColaBox.id = 'container-estrategia'; dColaBox.className = 'calc-box'; dColaBox.style.background = 'rgba(61, 187, 154, 0.1)';
        const selEst = document.createElement('select'); selEst.className = 'select-agente-reg'; selEst.style.width = "80px";
        const optAuto = document.createElement('option'); optAuto.innerText = "📈 AUTO"; optAuto.value = "AUTO"; selEst.append(optAuto);
        ["Estrategia 1", "Estrategia 2", "Estrategia 3", "Estrategia 4", "Estrategia 5"].forEach(e => { const o = document.createElement('option'); o.innerText = o.value = e; selEst.append(o); });
        const resCola = document.createElement('span'); resCola.className = 'res-val'; resCola.style.cssText = 'color:#333; flex:1; text-align:center; border-right:1px solid #ccc; cursor:pointer; overflow: hidden; text-overflow: ellipsis;';
        resCola.innerText = '---';
        const resCuartil = document.createElement('span'); resCuartil.className = 'res-val'; resCuartil.style.cssText = 'color:#0b518f; min-width:60px; text-align:center; font-weight:bold;'; resCuartil.innerText = 'C: -';
        const iconMsg = document.createElement('span'); iconMsg.className = 'time-copy'; iconMsg.innerText = "📩"; iconMsg.style.cssText = "cursor:pointer; font-size: 14px; margin-left: 5px; min-width:35px; text-align:center;";
        iconMsg.style.display = 'none';

        const copiarEstrategia = () => {
            const textoOriginal = resCola.innerText;
            if (textoOriginal !== "---" && textoOriginal !== "..." && textoOriginal !== "¡Copiado!") {
                navigator.clipboard.writeText(textoOriginal);
                const ahora = new Date(); const horaStr = ahora.getHours().toString().padStart(2, '0') + ':' + ahora.getMinutes().toString().padStart(2, '0');
                localStorage.setItem(`last_copy_${selEst.value}`, horaStr);
                resCola.innerText = "¡Copiado!"; resCola.style.color = "#3DBB9A";
                iconMsg.innerText = horaStr; iconMsg.style.fontSize = "10px"; iconMsg.style.display = 'inline';
                setTimeout(() => { resCola.innerText = textoOriginal; resCola.style.color = (dColaBox.classList.contains('alerta-parpadeante') || dColaBox.classList.contains('alerta-desconectado')) ? "white" : "#333"; }, 1000);
            }
        };
        resCola.onclick = copiarEstrategia; iconMsg.onclick = copiarEstrategia;

        let ultimoValorE = "";
        let peticionActual = "";
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
                const savedTime = localStorage.getItem(`last_copy_${selEst.value}`);

                // --- CAMBIO QUIRÚRGICO: CONEXIÓN AUTOMÁTICA AL CAMBIAR ESTRATEGIA ---
                if (ultimoValorE !== "" && ultimoValorE !== valE) {
                    iconMsg.innerText = "📩"; iconMsg.style.fontSize = "14px"; iconMsg.style.display = 'inline';
                    localStorage.setItem('ultima_campaña', valE); // Actualiza la campaña guardada
                    reasignarCampañaYConectar(); // Conecta automáticamente
                } else if (savedTime) { 
                    iconMsg.innerText = savedTime; iconMsg.style.fontSize = "10px"; iconMsg.style.display = 'inline'; 
                }

                if (resCola.innerText !== "¡Copiado!") { 
                    ultimoValorE = valE; resCola.innerText = valE; resCuartil.innerText = `C: ${valQ}`; 
                }

                const dSup = document.getElementById('campana-display');
                const btnConectar = document.getElementById('btnRegister');
                if (dSup) {
                    const nomC = dSup.innerText.split(' - ')[1]?.split(' (')[0] || "";
                    if (btnConectar && !btnConectar.disabled && btnConectar.style.display !== 'none') { dColaBox.classList.remove('alerta-parpadeante'); dColaBox.classList.add('alerta-desconectado'); resCola.style.color = "white"; }
                    else if (valE !== "" && valE !== "---" && valE !== nomC) { dColaBox.classList.remove('alerta-desconectado'); dColaBox.classList.add('alerta-parpadeante'); resCola.style.color = "white"; }
                    else { dColaBox.style.background = 'rgba(61, 187, 154, 0.2)'; dColaBox.classList.remove('alerta-parpadeante', 'alerta-desconectado'); resCola.style.color = "#333"; }
                }
            } catch (e) { if (peticionActual === parametro) { resCola.innerText = "Error"; resCuartil.innerText = "C: Error"; } }
        };
        selEst.onchange = () => { ultimoValorE = ""; resCola.innerText = "..."; resCuartil.innerText = "C: ..."; iconMsg.style.display = 'none'; consultarEstrategia(); };
        setInterval(consultarEstrategia, 2000);
        dColaBox.append(selEst, resCola, resCuartil, iconMsg);
        f4.append(dColaBox);
        p.append(f4);

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
        cargarAgentes(); setInterval(cargarAgentes, 300000);
        document.body.append(p);
        setTimeout(reasignarCampañaYConectar, 1500);
    }
    setTimeout(iniciarAppsAgente, 20);
})();
