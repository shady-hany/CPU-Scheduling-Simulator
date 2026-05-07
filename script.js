(function() {
    const PROCESS_COLORS = [
        '#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0',
        '#00BCD4', '#FF5722', '#795548', '#607D8B', '#8BC34A',
        '#FFC107', '#03A9F4', '#CDDC39', '#FF6F00', '#673AB7',
        '#009688', '#F44336', '#3F51B5', '#827717', '#00695C'
    ];
    const IDLE_COLOR = '#d5dbe3';

    const processTbody = document.getElementById('process-tbody');
    const validationErrors = document.getElementById('validation-errors');
    const validationList = document.getElementById('validation-list');
    const procCountBadge = document.getElementById('proc-count-badge');
    const ganttSection = document.getElementById('gantt-section');
    const comparisonSection = document.getElementById('comparison-section');
    const ruleBoxes = document.getElementById('rule-boxes');

    const ganttPriority = document.getElementById('gantt-priority');
    const ganttPriorityMarkers = document.getElementById('gantt-priority-markers');
    const ganttSrtf = document.getElementById('gantt-srtf');
    const ganttSrtfMarkers = document.getElementById('gantt-srtf-markers');
    const priorityIdleNotice = document.getElementById('priority-idle-notice');
    const srtfIdleNotice = document.getElementById('srtf-idle-notice');

    const resultsPriorityTbody = document.getElementById('results-priority-tbody');
    const resultsSrtfTbody = document.getElementById('results-srtf-tbody');
    const metricsPriority = document.getElementById('metrics-priority');
    const metricsSrtf = document.getElementById('metrics-srtf');
    const comparisonContent = document.getElementById('comparison-content');
    const conclusionText = document.getElementById('conclusion-text');

    let processCounter = 1;

    function getProcessRows() { return Array.from(processTbody.querySelectorAll('tr.process-row')); }
    function updateProcCount() { const c = getProcessRows().length; procCountBadge.textContent = c + ' process' + (c !== 1 ? 'es' : ''); }
    function assignColor(pid) { let h = 0; for (let i = 0; i < pid.length; i++) { h = ((h << 5) - h) + pid.charCodeAt(i); h |= 0; } return PROCESS_COLORS[Math.abs(h) % PROCESS_COLORS.length]; }
    function naturalCompare(a, b) { return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }); }
    function escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

    function createProcessRow(pidVal, atVal, btVal, priVal) {
        const tr = document.createElement('tr');
        tr.className = 'process-row';
        const pid = pidVal !== undefined ? String(pidVal) : 'P' + processCounter;
        if (pidVal === undefined) processCounter++;
        const at = atVal !== undefined ? String(atVal) : '0';
        const bt = btVal !== undefined ? String(btVal) : '';
        const pri = priVal !== undefined ? String(priVal) : '';
        tr.innerHTML = `<td><input type="text" value="${escapeHtml(pid)}" placeholder="P1" class="input-pid"></td>
                        <td><input type="text" value="${escapeHtml(at)}" placeholder="0" class="input-at"></td>
                        <td><input type="text" value="${escapeHtml(bt)}" placeholder="5" class="input-bt"></td>
                        <td><input type="text" value="${escapeHtml(pri)}" placeholder="1" class="input-pri"></td>
                        <td><button class="btn-remove" title="Remove">X</button></td>`;
        tr.querySelector('.btn-remove').addEventListener('click', () => { tr.remove(); updateProcCount(); hideResults(); clearValidationErrors(); });
        tr.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => { inp.classList.remove('input-error'); clearValidationErrors(); }));
        return tr;
    }

    function addProcessRow(pidVal, atVal, btVal, priVal) {
        const row = createProcessRow(pidVal, atVal, btVal, priVal);
        processTbody.appendChild(row);
        updateProcCount();
        hideResults();
        clearValidationErrors();
        return row;
    }

    function clearAllProcesses() { processTbody.innerHTML = ''; processCounter = 1; updateProcCount(); hideResults(); clearValidationErrors(); }
    function hideResults() { ganttSection.style.display = 'none'; comparisonSection.style.display = 'none'; if(ruleBoxes) ruleBoxes.style.display = 'none'; [ganttPriority, ganttPriorityMarkers, ganttSrtf, ganttSrtfMarkers].forEach(el => el.innerHTML = ''); [resultsPriorityTbody, resultsSrtfTbody, metricsPriority, metricsSrtf, comparisonContent].forEach(el => el.innerHTML = ''); conclusionText.textContent = ''; priorityIdleNotice.style.display = 'none'; srtfIdleNotice.style.display = 'none'; }
    function clearValidationErrors() { validationErrors.classList.remove('show'); validationList.innerHTML = ''; }

    function validateAllInputs() {
        const rawData = []; const rows = getProcessRows();
        rows.forEach(row => { const inputs = row.querySelectorAll('input'); rawData.push({ pid: inputs[0].value.trim(), atRaw: inputs[1].value.trim(), btRaw: inputs[2].value.trim(), priRaw: inputs[3].value.trim(), inputs, row }); });
        const errors = []; const pidSet = new Set();
        rawData.forEach(d => d.inputs.forEach(inp => inp.classList.remove('input-error')));
        if (rawData.length === 0) { errors.push('At least one process is required.'); return { valid: false, errors, processes: [] }; }
        const validated = [];
        rawData.forEach((d, i) => {
            const rn = i + 1; let err = false;
            if (!d.pid) { errors.push(`Row ${rn}: Process ID empty.`); d.inputs[0].classList.add('input-error'); err = true; } else if (pidSet.has(d.pid.toLowerCase())) { errors.push(`Row ${rn}: Duplicate ID "${d.pid}".`); d.inputs[0].classList.add('input-error'); err = true; } else pidSet.add(d.pid.toLowerCase());
            const atN = Number(d.atRaw); if (d.atRaw === '' || isNaN(atN) || !isFinite(atN) || !Number.isInteger(atN) || atN < 0) { errors.push(`Row ${rn}: Arrival Time must be non-negative integer.`); d.inputs[1].classList.add('input-error'); err = true; }
            const btN = Number(d.btRaw); if (d.btRaw === '' || isNaN(btN) || !isFinite(btN) || !Number.isInteger(btN) || btN <= 0) { errors.push(`Row ${rn}: Burst Time must be positive integer.`); d.inputs[2].classList.add('input-error'); err = true; }
            const prN = Number(d.priRaw); if (d.priRaw === '' || isNaN(prN) || !isFinite(prN) || !Number.isInteger(prN) || prN < 0) { errors.push(`Row ${rn}: Priority must be non-negative integer.`); d.inputs[3].classList.add('input-error'); err = true; }
            if (!err) validated.push({ pid: d.pid, at: atN, bt: btN, priority: prN });
        });
        if (errors.length > 0) return { valid: false, errors, processes: [] };
        return { valid: true, errors: [], processes: validated };
    }

    function displayValidationErrors(errors) { validationList.innerHTML = errors.map(e => `<li>${e}</li>`).join(''); validationErrors.classList.add('show'); }

    function simulatePriority(procs) {
        const p = procs.map(pp => ({ ...pp, remaining: pp.bt, ct: null, firstResponse: null, started: false }));
        const segs = []; let cur = null, segStart = 0, time = 0;
        const limit = procs.reduce((s, pp) => s + pp.bt, 0) + Math.max(...procs.map(pp => pp.at), 0) + 2000;
        while (time < limit) {
            if (p.every(pp => pp.remaining === 0)) break;
            const ready = p.filter(pp => pp.at <= time && pp.remaining > 0);
            let sel = null;
            if (ready.length > 0) { ready.sort((a, b) => a.priority - b.priority || a.at - b.at || naturalCompare(a.pid, b.pid)); sel = ready[0].pid; }
            if (sel) { const proc = p.find(pp => pp.pid === sel); if (proc && !proc.started) { proc.firstResponse = time; proc.started = true; } }
            if (sel !== cur) {
                if (cur !== null && time > segStart) segs.push({ pid: cur, start: segStart, end: time, isIdle: false });
                else if (cur === null && sel === null && time > segStart) segs.push({ pid: 'IDLE', start: segStart, end: time, isIdle: true });
                else if (cur === null && sel !== null && time > segStart) segs.push({ pid: 'IDLE', start: segStart, end: time, isIdle: true });
                else if (cur !== null && sel === null && time > segStart) segs.push({ pid: cur, start: segStart, end: time, isIdle: false });
                cur = sel; segStart = time;
            }
            if (sel) { const proc = p.find(pp => pp.pid === sel); proc.remaining--; if (proc.remaining === 0) proc.ct = time + 1; }
            time++;
        }
        if (time > segStart) segs.push({ pid: cur || 'IDLE', start: segStart, end: time, isIdle: !cur });
        const merged = []; segs.forEach(s => { if (merged.length && merged[merged.length-1].pid === s.pid && merged[merged.length-1].end === s.start) merged[merged.length-1].end = s.end; else merged.push({ ...s }); });
        const results = p.map(pp => ({ pid: pp.pid, at: pp.at, bt: pp.bt, priority: pp.priority, ct: pp.ct || time, tat: (pp.ct || time) - pp.at, wt: ((pp.ct || time) - pp.at) - pp.bt, rt: pp.firstResponse !== null ? pp.firstResponse - pp.at : 0 }));
        const avgs = { avgWT: results.reduce((s, r) => s + r.wt, 0) / results.length, avgTAT: results.reduce((s, r) => s + r.tat, 0) / results.length, avgRT: results.reduce((s, r) => s + r.rt, 0) / results.length };
        return { segments: merged, results, averages: avgs, totalTime: time, hasIdle: merged.some(s => s.isIdle) };
    }

    function simulateSRTF(procs) {
        const p = procs.map(pp => ({ ...pp, remaining: pp.bt, ct: null, firstResponse: null, started: false }));
        const segs = []; let cur = null, segStart = 0, time = 0;
        const limit = procs.reduce((s, pp) => s + pp.bt, 0) + Math.max(...procs.map(pp => pp.at), 0) + 2000;
        while (time < limit) {
            if (p.every(pp => pp.remaining === 0)) break;
            const ready = p.filter(pp => pp.at <= time && pp.remaining > 0);
            let sel = null;
            if (ready.length > 0) { ready.sort((a, b) => a.remaining - b.remaining || a.at - b.at || naturalCompare(a.pid, b.pid)); sel = ready[0].pid; }
            if (sel) { const proc = p.find(pp => pp.pid === sel); if (proc && !proc.started) { proc.firstResponse = time; proc.started = true; } }
            if (sel !== cur) {
                if (cur !== null && time > segStart) segs.push({ pid: cur, start: segStart, end: time, isIdle: false });
                else if (cur === null && sel === null && time > segStart) segs.push({ pid: 'IDLE', start: segStart, end: time, isIdle: true });
                else if (cur === null && sel !== null && time > segStart) segs.push({ pid: 'IDLE', start: segStart, end: time, isIdle: true });
                else if (cur !== null && sel === null && time > segStart) segs.push({ pid: cur, start: segStart, end: time, isIdle: false });
                cur = sel; segStart = time;
            }
            if (sel) { const proc = p.find(pp => pp.pid === sel); proc.remaining--; if (proc.remaining === 0) proc.ct = time + 1; }
            time++;
        }
        if (time > segStart) segs.push({ pid: cur || 'IDLE', start: segStart, end: time, isIdle: !cur });
        const merged = []; segs.forEach(s => { if (merged.length && merged[merged.length-1].pid === s.pid && merged[merged.length-1].end === s.start) merged[merged.length-1].end = s.end; else merged.push({ ...s }); });
        const results = p.map(pp => ({ pid: pp.pid, at: pp.at, bt: pp.bt, priority: pp.priority, ct: pp.ct || time, tat: (pp.ct || time) - pp.at, wt: ((pp.ct || time) - pp.at) - pp.bt, rt: pp.firstResponse !== null ? pp.firstResponse - pp.at : 0 }));
        const avgs = { avgWT: results.reduce((s, r) => s + r.wt, 0) / results.length, avgTAT: results.reduce((s, r) => s + r.tat, 0) / results.length, avgRT: results.reduce((s, r) => s + r.rt, 0) / results.length };
        return { segments: merged, results, averages: avgs, totalTime: time, hasIdle: merged.some(s => s.isIdle) };
    }

    function renderGantt(segments, totalTime, containerEl, markersEl) {
        containerEl.innerHTML = ''; markersEl.innerHTML = '';
        if (!segments.length || !totalTime) { containerEl.innerHTML = '<div style="text-align:center;padding:14px;color:#8899a6;">No data</div>'; return; }
        const tw = Math.max(totalTime * 48, 280);
        containerEl.style.width = tw + 'px'; markersEl.style.width = tw + 'px';
        segments.forEach(s => { const block = document.createElement('div'); block.className = 'gantt-block'; block.style.left = (s.start / totalTime * 100) + '%'; block.style.width = Math.max((s.end - s.start) / totalTime * 100, 0.5) + '%'; if (s.isIdle) { block.classList.add('idle-block'); block.style.backgroundColor = IDLE_COLOR; block.textContent = 'idle'; } else { block.style.backgroundColor = assignColor(s.pid); block.textContent = s.pid; } block.title = s.isIdle ? `idle: ${s.start}--${s.end}` : `${s.pid}: ${s.start}--${s.end}`; containerEl.appendChild(block); });
        const bounds = new Set([0, totalTime]); segments.forEach(s => { bounds.add(s.start); bounds.add(s.end); });
        for (let t = 0; t <= totalTime; t++) bounds.add(t);
        const sorted = [...bounds].sort((a, b) => a - b); const filtered = sorted.length > 30 ? sorted.filter(t => { const segB = new Set(); segments.forEach(s => { segB.add(s.start); segB.add(s.end); }); return segB.has(t) || t === 0 || t === totalTime || (t % Math.ceil(totalTime / 22) === 0); }) : sorted;
        filtered.forEach(t => { const m = document.createElement('span'); m.className = 'gantt-marker'; m.style.left = (t / totalTime * 100) + '%'; m.textContent = t; markersEl.appendChild(m); });
    }

    function renderResultsTable(results, averages, tbodyEl) { const sorted = [...results].sort((a, b) => naturalCompare(a.pid, b.pid)); tbodyEl.innerHTML = sorted.map(r => `<tr><td><strong>${escapeHtml(r.pid)}</strong></td><td>${r.at}</td><td>${r.bt}</td><td>${r.priority}</td><td>${r.ct}</td><td>${r.wt}</td><td>${r.tat}</td><td>${r.rt}</td></tr>`).join('') + `<tr class="avg-row"><td><strong>AVG</strong></td><td>--</td><td>--</td><td>--</td><td>--</td><td>${averages.avgWT.toFixed(2)}</td><td>${averages.avgTAT.toFixed(2)}</td><td>${averages.avgRT.toFixed(2)}</td></tr>`; }
    function renderMetricsCards(averages, containerEl, other) { const items = [{ l: 'Avg Waiting Time', v: averages.avgWT, k: 'avgWT' }, { l: 'Avg Turnaround Time', v: averages.avgTAT, k: 'avgTAT' }, { l: 'Avg Response Time', v: averages.avgRT, k: 'avgRT' }]; containerEl.innerHTML = items.map(m => { let cls = 'metric-card'; if (other && averages[m.k] < other[m.k]) cls += ' better'; return `<div class="${cls}"><div class="metric-value">${m.v.toFixed(2)}</div><div class="metric-label">${m.l}</div></div>`; }).join(''); }
    function generateComparison(pri, srt) { const pa = pri.averages, sa = srt.averages; const items = []; const cmp = (paV, saV) => Math.abs(paV - saV) < 0.01 ? 'same' : (paV < saV ? 'pri' : 'srt'); items.push(cmp(pa.avgWT, sa.avgWT) === 'same' ? { text: 'Same average Waiting Time.' } : cmp(pa.avgWT, sa.avgWT) === 'pri' ? { text: `Priority Scheduling has lower average Waiting Time (${pa.avgWT.toFixed(2)} vs ${sa.avgWT.toFixed(2)}).` } : { text: `SRTF has lower average Waiting Time (${sa.avgWT.toFixed(2)} vs ${pa.avgWT.toFixed(2)}).` }); items.push(cmp(pa.avgTAT, sa.avgTAT) === 'same' ? { text: 'Same average Turnaround Time.' } : cmp(pa.avgTAT, sa.avgTAT) === 'pri' ? { text: `Priority Scheduling has lower average Turnaround Time (${pa.avgTAT.toFixed(2)} vs ${sa.avgTAT.toFixed(2)}).` } : { text: `SRTF has lower average Turnaround Time (${sa.avgTAT.toFixed(2)} vs ${pa.avgTAT.toFixed(2)}).` }); items.push(cmp(pa.avgRT, sa.avgRT) === 'same' ? { text: 'Same average Response Time.' } : cmp(pa.avgRT, sa.avgRT) === 'pri' ? { text: `Priority Scheduling has better average Response Time (${pa.avgRT.toFixed(2)} vs ${sa.avgRT.toFixed(2)}).` } : { text: `SRTF has better average Response Time (${sa.avgRT.toFixed(2)} vs ${pa.avgRT.toFixed(2)}).` }); items.push({ text: 'SRTF naturally favors short jobs; Priority Scheduling prioritizes high-priority processes regardless of length.' }); return items; }
    function generateConclusion(pri, srt, processes) { const pa = pri.averages, sa = srt.averages; let c = `Analysis for ${processes.length} processes:\n\n`; if (sa.avgWT < pa.avgWT && sa.avgTAT < pa.avgTAT) c += 'SRTF outperforms Priority Scheduling in both waiting and turnaround time. This is expected due to SRTFs optimality in minimizing average completion time.\n'; else if (pa.avgWT < sa.avgWT && pa.avgTAT < sa.avgTAT) c += 'Priority Scheduling performed better in this workload. This typically occurs when priority ordering aligns favorably with burst times.\n'; else c += 'Mixed results — the relative performance depends on the correlation between priority values and burst durations.\n'; const starve = processes.filter(pp => pp.priority >= 3 && pp.bt >= 8); if (starve.length) c += `\nStarvation note: ${starve.map(pp=>pp.pid).join(', ')} may experience starvation under Priority Scheduling if higher-priority processes keep arriving. SRTF ensures eventual completion of all processes.\n`; c += '\nConclusion: Priority Scheduling is suitable for policy-driven systems where process importance matters. SRTF is ideal for throughput-oriented environments.'; return c; }

    async function runSimulationWithSpinner() { const runBtn = document.getElementById('btn-run-simulation'); const originalText = runBtn.innerHTML; runBtn.innerHTML = '<span class="spinner"></span> Running...'; runBtn.disabled = true; await new Promise(r => setTimeout(r, 100)); const v = validateAllInputs(); if (!v.valid) { displayValidationErrors(v.errors); validationErrors.scrollIntoView({ behavior: 'smooth', block: 'center' }); runBtn.innerHTML = originalText; runBtn.disabled = false; return; } clearValidationErrors(); const processes = v.processes; const priRes = simulatePriority(processes); const srtRes = simulateSRTF(processes); ganttSection.style.display = ''; comparisonSection.style.display = ''; if(ruleBoxes) ruleBoxes.style.display = 'grid'; renderGantt(priRes.segments, priRes.totalTime, ganttPriority, ganttPriorityMarkers); renderGantt(srtRes.segments, srtRes.totalTime, ganttSrtf, ganttSrtfMarkers); priorityIdleNotice.style.display = priRes.hasIdle ? '' : 'none'; srtfIdleNotice.style.display = srtRes.hasIdle ? '' : 'none'; if (priRes.hasIdle) priorityIdleNotice.textContent = 'CPU idle period detected - no process ready to execute.'; if (srtRes.hasIdle) srtfIdleNotice.textContent = 'CPU idle period detected - no process ready to execute.'; renderResultsTable(priRes.results, priRes.averages, resultsPriorityTbody); renderResultsTable(srtRes.results, srtRes.averages, resultsSrtfTbody); renderMetricsCards(priRes.averages, metricsPriority, srtRes.averages); renderMetricsCards(srtRes.averages, metricsSrtf, priRes.averages); const items = generateComparison(priRes, srtRes); comparisonContent.innerHTML = items.map(it => `<div class="comparison-item"><span>•</span><span>${it.text}</span></div>`).join(''); conclusionText.textContent = generateConclusion(priRes, srtRes, processes); ganttSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); runBtn.innerHTML = originalText; runBtn.disabled = false; }

    const scenarios = { A: [{ pid: 'P1', at: 0, bt: 8, priority: 2 }, { pid: 'P2', at: 1, bt: 4, priority: 1 }, { pid: 'P3', at: 2, bt: 9, priority: 3 }, { pid: 'P4', at: 3, bt: 5, priority: 2 }], B: [{ pid: 'P1', at: 0, bt: 10, priority: 1 }, { pid: 'P2', at: 1, bt: 3, priority: 3 }, { pid: 'P3', at: 2, bt: 2, priority: 4 }, { pid: 'P4', at: 3, bt: 1, priority: 2 }], C: [{ pid: 'P1', at: 0, bt: 20, priority: 5 }, { pid: 'P2', at: 1, bt: 2, priority: 1 }, { pid: 'P3', at: 2, bt: 2, priority: 1 }, { pid: 'P4', at: 3, bt: 2, priority: 2 }, { pid: 'P5', at: 4, bt: 2, priority: 2 }], D: [{ pid: 'P1', at: 0, bt: 5, priority: 2 }, { pid: 'P1', at: -1, bt: 0, priority: -2 }] };
    function loadScenario(key) { if (key === 'random') { const count = Math.floor(Math.random() * 4) + 4; const newProcs = []; for (let i = 1; i <= count; i++) { newProcs.push({ pid: `P${i}`, at: Math.floor(Math.random() * 6), bt: Math.floor(Math.random() * 8) + 1, priority: Math.floor(Math.random() * 5) + 1 }); } processTbody.innerHTML = ''; processCounter = 1; hideResults(); clearValidationErrors(); let maxN = 0; newProcs.forEach(p => { const m = String(p.pid).match(/\d+/); if (m) maxN = Math.max(maxN, parseInt(m[0])); }); processCounter = maxN + 1; newProcs.forEach(p => addProcessRow(p.pid, p.at, p.bt, p.priority)); updateProcCount(); return; } const data = scenarios[key]; if (!data) return; processTbody.innerHTML = ''; processCounter = 1; hideResults(); clearValidationErrors(); let maxN = 0; data.forEach(p => { const m = String(p.pid).match(/\d+/); if (m) maxN = Math.max(maxN, parseInt(m[0])); }); processCounter = maxN + 1; data.forEach(p => addProcessRow(p.pid, p.at, p.bt, p.priority)); updateProcCount(); }

    document.getElementById('btn-add-process').addEventListener('click', () => { const row = addProcessRow(); row.querySelector('.input-bt')?.focus(); });
    document.getElementById('btn-run-simulation').addEventListener('click', runSimulationWithSpinner);
    document.getElementById('btn-clear-all').addEventListener('click', () => { clearAllProcesses(); ganttSection.style.display = 'none'; comparisonSection.style.display = 'none'; if(ruleBoxes) ruleBoxes.style.display = 'none'; });
    document.querySelectorAll('.btn-scenario[data-scenario]').forEach(b => b.addEventListener('click', () => loadScenario(b.dataset.scenario)));
    document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runSimulationWithSpinner(); } });
    loadScenario('A'); updateProcCount();
})();