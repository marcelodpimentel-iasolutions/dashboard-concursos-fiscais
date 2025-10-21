document.addEventListener('DOMContentLoaded', function () {
    // --- DADOS ---
    const concursosData = [
        { id: 1, nome: 'Sefaz PR', status: 'Edital Publicado', salario: 12960.00, prova: '2026-01-25', lat: -25.42, lon: -49.27, banca: 'Cebraspe', requisitos: 'Nível Superior em qualquer área.', link: 'https://www.cebraspe.org.br/concursos/SEFAZ_PR_25' },
        { id: 2, nome: 'ISS São José do Rio Preto (SP )', status: 'Edital Publicado', salario: 17351.00, prova: '2026-01-18', lat: -20.82, lon: -49.37, banca: 'Vunesp', requisitos: 'Nível Superior em Direito, Ciências Contábeis, Economia ou Administração.', link: 'https://www.vunesp.com.br/PMSR2401' },
        { id: 3, nome: 'Sefaz GO', status: 'Edital Iminente', salario: 27247.26, prova: '9999-12-31', lat: -16.68, lon: -49.25, banca: 'A definir', requisitos: 'Nível Superior em qualquer área.', link: 'https://www.google.com/search?q=concurso+sefaz+go' },
        { id: 4, nome: 'ISS Manaus (AM )', status: 'Edital Iminente', salario: 24817.05, prova: '9999-12-31', lat: -3.11, lon: -60.02, banca: 'A definir', requisitos: 'Nível Superior.', link: 'https://www.google.com/search?q=concurso+iss+manaus' },
        { id: 5, nome: 'Sefaz SP (Auditor )', status: 'Edital Iminente', salario: 21177.10, prova: '9999-12-31', lat: -23.55, lon: -46.63, banca: 'FGV (provável)', requisitos: 'Nível Superior em qualquer área.', link: 'https://www.google.com/search?q=concurso+sefaz+sp+auditor' },
        { id: 6, nome: 'ISS Porto Velho (RO )', status: 'Edital Iminente', salario: 32301.00, prova: '9999-12-31', lat: -8.76, lon: -63.90, banca: 'A definir', requisitos: 'Nível Superior.', link: 'https://www.google.com/search?q=concurso+iss+porto+velho' },
        { id: 7, nome: 'Sefaz RN', status: 'Edital Iminente', salario: 13283.00, prova: '9999-12-31', lat: -5.79, lon: -35.20, banca: 'Cebraspe', requisitos: 'Nível Superior.', link: 'https://www.google.com/search?q=concurso+sefaz+rn' },
        { id: 8, nome: 'Sefa PA', status: 'Autorizado', salario: 16659.63, prova: '9999-12-31', lat: -1.45, lon: -48.49, banca: 'A definir', requisitos: 'Nível Superior.', link: 'https://www.google.com/search?q=concurso+sefa+pa' },
        { id: 9, nome: 'ISS Belém (PA )', status: 'Autorizado', salario: 16659.63, prova: '9999-12-31', lat: -1.455, lon: -48.495, banca: 'A definir', requisitos: 'Nível Superior.', link: 'https://www.google.com/search?q=concurso+iss+belem' },
        { id: 10, nome: 'ISS Planaltina (GO )', status: 'Edital Publicado', salario: 3182.00, prova: '2026-01-11', lat: -15.62, lon: -47.65, banca: 'Instituto ACESS', requisitos: 'Nível Médio.', link: 'https://www.acess.org.br/concurso/1' }
    ];
    const aeroportosData = [
        { nome: 'Aeroporto de Curitiba (CWB )', lat: -25.53, lon: -49.17 }, { nome: 'Aeroporto de S. J. do Rio Preto (SJP)', lat: -20.81, lon: -49.40 }, { nome: 'Aeroporto de Goiânia (GYN)', lat: -16.63, lon: -49.22 }, { nome: 'Aeroporto de Manaus (MAO)', lat: -3.03, lon: -60.04 }, { nome: 'Aeroporto de Congonhas (CGH)', lat: -23.62, lon: -46.65 }, { nome: 'Aeroporto de Porto Velho (PVH)', lat: -8.71, lon: -63.90 }, { nome: 'Aeroporto de Natal (NAT)', lat: -5.76, lon: -35.36 }, { nome: 'Aeroporto de Belém (BEL)', lat: -1.38, lon: -48.47 }, { nome: 'Aeroporto de Brasília (BSB)', lat: -15.87, lon: -47.91 }
    ];

    // --- ELEMENTOS DO DOM ---
    const tableBody = document.querySelector('#concursos-table tbody');
    const searchInput = document.getElementById('search-input');
    const headers = document.querySelectorAll('#concursos-table thead th');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('modal-close-btn');
    const salaryChartDiv = document.getElementById('salary-chart');
    const mapDiv = document.getElementById('map');

    let currentData = [...concursosData];

    // --- RENDERIZAÇÃO E EVENTOS (sem alterações) ---
    function renderTable(data) { tableBody.innerHTML = ''; data.forEach(c => { const row = document.createElement('tr'); row.dataset.concursoId = c.id; const statusClass = c.status.toLowerCase().replace('edital ', '').replace(' ', '-'); row.innerHTML = `<td>${c.nome}</td><td><span class="status status-${statusClass}">${c.status}</span></td><td>R$ ${c.salario.toFixed(2).replace('.', ',')}</td><td>${c.prova !== '9999-12-31' ? new Date(c.prova).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'A definir'}</td>`; row.addEventListener('click', () => openModal(c.id)); tableBody.appendChild(row); }); }
    function renderSalaryChart(data) { const sorted = [...data].sort((a, b) => b.salario - a.salario); const plotData = [{ x: sorted.map(c => c.nome), y: sorted.map(c => c.salario), type: 'bar', marker: { color: '#007bff' } }]; const layout = { title: 'Comparativo de Salários Iniciais', xaxis: { tickangle: -45 }, yaxis: { title: 'Salário (R$)' }, margin: { b: 150 } }; Plotly.newPlot(salaryChartDiv, plotData, layout, { responsive: true }); }
    function openModal(concursoId) { const concurso = concursosData.find(item => item.id === concursoId); if (!concurso) return; modalTitle.textContent = concurso.nome; modalBody.innerHTML = `<p><strong>Status:</strong> ${concurso.status}</p><p><strong>Salário:</strong> R$ ${concurso.salario.toFixed(2).replace('.', ',')}</p><p><strong>Prova:</strong> ${concurso.prova !== '9999-12-31' ? new Date(c.prova).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'A definir'}</p><p><strong>Banca:</strong> ${concurso.banca}</p><p><strong>Requisitos:</strong> ${concurso.requisitos}</p><p><a href="${concurso.link}" target="_blank">Página do Concurso</a></p>`; modalOverlay.classList.remove('hidden'); }
    function closeModal() { modalOverlay.classList.add('hidden'); }
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    searchInput.addEventListener('input', () => { const term = searchInput.value.toLowerCase(); currentData = concursosData.filter(c => c.nome.toLowerCase().includes(term) || c.status.toLowerCase().includes(term)); renderTable(currentData); renderSalaryChart(currentData); });
    headers.forEach((header, index) => { header.addEventListener('click', () => { const isAsc = header.classList.toggle('asc'); const key = ['nome', 'status', 'salario', 'prova'][index]; currentData.sort((a, b) => { let valA = a[key], valB = b[key]; if (key === 'salario') { valA = parseFloat(valA); valB = parseFloat(valB); } if (valA < valB) return isAsc ? -1 : 1; if (valA > valB) return isAsc ? 1 : -1; return 0; }); renderTable(currentData); }); });
    
        // Evento do Botão de Atualização
    const updateBtn = document.getElementById('update-btn');
    updateBtn.addEventListener('click', function() {
        // Adiciona um feedback visual de que o processo começou
        updateBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6"/><path d="M22 11.5A10 10 0 0 1 3.2 7.2M2 12.5a10 10 0 0 1 18.8 4.2"/></svg>
            Atualizando...`;
        updateBtn.disabled = true;
        updateBtn.classList.add('loading');

        // SIMULAÇÃO DA CHAMADA AO AGENTE DE IA
        // No futuro, aqui seria a chamada para o backend.
        // Por enquanto, vamos simular uma espera de 5 segundos.
        console.log("Pedido de atualização enviado ao Agente de IA...");
        setTimeout(() => {
            console.log("Agente de IA concluiu a busca. Novos dados estão prontos.");
            alert("Atualização concluída pelo Agente de IA! Os novos dados estarão disponíveis ao recarregar a página.");
            
            // Restaura o botão ao estado original
            updateBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6"/><path d="M22 11.5A10 10 0 0 1 3.2 7.2M2 12.5a10 10 0 0 1 18.8 4.2"/></svg>
                Atualizar com IA`;
            updateBtn.disabled = false;
            updateBtn.classList.remove('loading');
        }, 5000); // Simula 5 segundos de trabalho do agente
    });


    // ====================================================================
    // INICIALIZAÇÃO DO MAPA (COM ÍCONES SVG - ABORDAGEM CORRIGIDA)
    // ====================================================================
    const map = L.map(mapDiv).setView([-15.78, -47.92], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' ).addTo(map);

    // Função para criar um ícone SVG com uma cor específica
    function createMarkerIcon(color) {
        const markerHtml = `<svg viewBox="0 0 32 32" style="fill:${color}; stroke:black; stroke-width:1; stroke-opacity:0.5; opacity:0.8;">
            <path d="M16 32s16-15.5 16-24C32 7.163 24.837 0 16 0S0 7.163 0 8c0 8.5 16 24 16 24z"/>
            <circle cx="16" cy="12" r="6" fill="white"/>
        </svg>`;
        return L.divIcon({
            html: markerHtml,
            className: '', // Remove classes desnecessárias
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -28]
        });
    }

    const stateIcon = createMarkerIcon('#007bff'); // Azul para estadual
    const municipalIcon = createMarkerIcon('#28a745'); // Verde para municipal
    
    const airportIcon = L.divIcon({ html: `<svg viewBox="0 0 24 24" fill="#333" width="24px" height="24px"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`, className: 'airport-icon', iconSize: [24, 24], iconAnchor: [12, 12] });

    // Lógica para adicionar marcadores com a cor correta
    concursosData.forEach(c => {
        let iconToUse = stateIcon;
        if (c.nome.includes('ISS')) {
            iconToUse = municipalIcon;
        }
        L.marker([c.lat, c.lon], { icon: iconToUse }).addTo(map).bindPopup(`<b>${c.nome}</b>`);
    });

    aeroportosData.forEach(a => {
        L.marker([a.lat, a.lon], { icon: airportIcon }).addTo(map).bindPopup(`<b>${a.nome}</b>`);
    });

    // --- RENDERIZAÇÃO INICIAL ---
    renderTable(currentData);
    renderSalaryChart(currentData);
});

