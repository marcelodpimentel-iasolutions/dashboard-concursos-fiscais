// VERSÃO FINAL - CONECTADO À NUVEM (GIST)
document.addEventListener('DOMContentLoaded', function () {
    
    // O LINK DO SEU GIST VAI AQUI!
    const GIST_URL = 'https://gist.githack.com/marcelodpimentel-iasolutions/b829f7dfdef0248ed13114f92520d5ab/raw/6a52bf8e6c86d3990758fe433827b696de7b793d/concursos.json';

    // --- ELEMENTOS DO DOM ---
    const tableBody = document.querySelector('#concursos-table tbody' );
    const searchInput = document.getElementById('search-input');
    const headers = document.querySelectorAll('#concursos-table thead th');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('modal-close-btn');
    const salaryChartDiv = document.getElementById('salary-chart');
    const mapDiv = document.getElementById('map');
    const updateBtn = document.getElementById('update-btn');

    // --- VARIÁVEIS DE ESTADO ---
    let concursosData = [];
    let aeroportosData = [];
    let currentData = [];

    // --- FUNÇÕES ---
    const renderTable = (data) => { tableBody.innerHTML = ''; data.forEach(c => { const row = document.createElement('tr'); row.dataset.concursoId = c.id; const statusClass = c.status.toLowerCase().replace('edital ', '').replace(' ', '-'); row.innerHTML = `<td>${c.nome}</td><td><span class="status status-${statusClass}">${c.status}</span></td><td>R$ ${c.salario.toFixed(2).replace('.', ',')}</td><td>${c.prova !== '9999-12-31' ? new Date(c.prova).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'A definir'}</td>`; row.addEventListener('click', () => openModal(c.id)); tableBody.appendChild(row); }); };
    const renderSalaryChart = (data) => { const sorted = [...data].sort((a, b) => b.salario - a.salario); const plotData = [{ x: sorted.map(c => c.nome), y: sorted.map(c => c.salario), type: 'bar', marker: { color: '#007bff' } }]; const layout = { title: 'Comparativo de Salários Iniciais', xaxis: { tickangle: -45 }, yaxis: { title: 'Salário (R$)' }, margin: { b: 150 } }; Plotly.newPlot(salaryChartDiv, plotData, layout, { responsive: true }); };
    const openModal = (concursoId) => { const concurso = concursosData.find(item => item.id === concursoId); if (!concurso) return; modalTitle.textContent = concurso.nome; modalBody.innerHTML = `<p><strong>Status:</strong> ${concurso.status}</p><p><strong>Salário:</strong> R$ ${concurso.salario.toFixed(2).replace('.', ',')}</p><p><strong>Prova:</strong> ${concurso.prova !== '9999-12-31' ? new Date(concurso.prova).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'A definir'}</p><p><strong>Banca:</strong> ${concurso.banca}</p><p><strong>Requisitos:</strong> ${concurso.requisitos}</p><p><a href="${concurso.link}" target="_blank">Página do Concurso</a></p>`; modalOverlay.classList.remove('hidden'); };
    const closeModal = () => { modalOverlay.classList.add('hidden'); };
    const initializeMap = (concursos, aeroportos) => { const map = L.map(mapDiv).setView([-15.78, -47.92], 4); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' ).addTo(map); const createMarkerIcon = (color) => { const markerHtml = `<svg viewBox="0 0 32 32" style="fill:${color}; stroke:black; stroke-width:1; stroke-opacity:0.5; opacity:0.8;"><path d="M16 32s16-15.5 16-24C32 7.163 24.837 0 16 0S0 7.163 0 8c0 8.5 16 24 16 24z"/><circle cx="16" cy="12" r="6" fill="white"/></svg>`; return L.divIcon({ html: markerHtml, className: '', iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28] }); }; const stateIcon = createMarkerIcon('#007bff'); const municipalIcon = createMarkerIcon('#28a745'); const airportIcon = L.divIcon({ html: `<svg viewBox="0 0 24 24" fill="#333" width="24px" height="24px"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`, className: 'airport-icon', iconSize: [24, 24], iconAnchor: [12, 12] }); concursos.forEach(c => { let iconToUse = stateIcon; if (c.nome.includes('ISS')) { iconToUse = municipalIcon; } L.marker([c.lat, c.lon], { icon: iconToUse }).addTo(map).bindPopup(`<b>${c.nome}</b>`); }); aeroportos.forEach(a => { L.marker([a.lat, a.lon], { icon: airportIcon }).addTo(map).bindPopup(`<b>${a.nome}</b>`); }); };
    const setupEventListeners = () => { closeModalBtn.addEventListener('click', closeModal); modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); }); searchInput.addEventListener('input', () => { const term = searchInput.value.toLowerCase(); currentData = concursosData.filter(c => c.nome.toLowerCase().includes(term) || c.status.toLowerCase().includes(term)); renderTable(currentData); renderSalaryChart(currentData); }); headers.forEach((header, index) => { header.addEventListener('click', () => { const isAsc = header.classList.toggle('asc'); const key = ['nome', 'status', 'salario', 'prova'][index]; currentData.sort((a, b) => { let valA = a[key], valB = b[key]; if (key === 'salario') { valA = parseFloat(valA); valB = parseFloat(valB); } if (valA < valB) return isAsc ? -1 : 1; if (valA > valB) return isAsc ? 1 : -1; return 0; }); renderTable(currentData); }); }); updateBtn.addEventListener('click', () => { alert("O Agente de IA foi notificado para buscar novos dados. As atualizações aparecerão aqui em breve."); }); };

    // --- FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ---
    const initializeDashboard = async () => {
        try {
            // const response = await fetch(GIST_URL);
            // Adiciona um parâmetro anti-cache para garantir que os dados mais recentes sejam buscados
            const urlComAntiCache = `${GIST_URL}?v=${new Date().getTime()}`;
            const response = await fetch(urlComAntiCache);

            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            const data = await response.json();
            
            concursosData = data.concursos;
            aeroportosData = data.aeroportos;
            currentData = [...concursosData];

            initializeMap(concursosData, aeroportosData);
            renderTable(currentData);
            renderSalaryChart(currentData);
            setupEventListeners();
        } catch (error) {
            console.error("Falha ao inicializar o dashboard:", error);
            document.body.innerHTML = '<h1>Erro ao carregar dados. Verifique o console.</h1>';
        }
    };

    // --- PONTO DE PARTIDA ---
    initializeDashboard();
});

