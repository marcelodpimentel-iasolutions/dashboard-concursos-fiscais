// VERSÃO COM DESTAQUE NO MAPA E DEMAIS FUNCIONALIDADES
document.addEventListener('DOMContentLoaded', function () {
    
    const DATA_URL = 'https://raw.githubusercontent.com/marcelodpimentel-iasolutions/dashboard-concursos-fiscais/main/dados.json';

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
    const filterContainer = document.querySelector('.filter-container');

    // --- VARIÁVEIS DE ESTADO ---
    let concursosData = [];
    let aeroportosData = [];
    let currentFilter = 'atuais';
    let map;
    let mapMarkers = {}; // NOVO: Objeto para armazenar os marcadores do mapa

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    const renderTable = (data) => {
        tableBody.innerHTML = '';
        data.forEach(c => {
            const row = document.createElement('tr');
            row.dataset.concursoId = c.id;
            const statusClass = c.status.toLowerCase().replace(/\s+/g, '-');
            const vagasTexto = (c.vagas === 'CR' || c.vagas > 0) ? c.vagas : 'A definir';
            const dataProvaFormatada = c.prova !== '9999-12-31' ? new Date(c.prova).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'A definir';
            
            row.innerHTML = `
                <td>${c.nome}</td>
                <td><span class="status status-${statusClass}">${c.status}</span></td>
                <td>${vagasTexto}</td>
                <td>R$ ${c.salario.toFixed(2).replace('.', ',')}</td>
                <td>${dataProvaFormatada}</td>
            `;
            row.addEventListener('click', () => openModal(c.id));

            // NOVO: Adiciona eventos de mouse para destacar o marcador no mapa
            row.addEventListener('mouseenter', () => {
                const marker = mapMarkers[c.id];
                if (marker) {
                    marker.getElement().classList.add('highlight-marker');
                }
            });
            row.addEventListener('mouseleave', () => {
                const marker = mapMarkers[c.id];
                if (marker) {
                    marker.getElement().classList.remove('highlight-marker');
                }
            });

            tableBody.appendChild(row);
        });
    };

    const renderSalaryChart = (data) => {
        const sorted = [...data].sort((a, b) => b.salario - a.salario);
        const plotData = [{ x: sorted.map(c => c.nome), y: sorted.map(c => c.salario), type: 'bar', marker: { color: '#007bff' } }];
        const layout = { title: 'Comparativo de Salários Iniciais', xaxis: { tickangle: -45 }, yaxis: { title: 'Salário (R$)' }, margin: { b: 150 } };
        Plotly.newPlot(salaryChartDiv, plotData, layout, { responsive: true });
    };

    const renderMap = (concursosFiltrados) => {
        if (map) { map.remove(); }
        map = L.map(mapDiv).setView([-15.78, -47.92], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' ).addTo(map);
        
        mapMarkers = {}; // NOVO: Limpa os marcadores antigos

        const createMarkerIcon = (color) => { const markerHtml = `<svg viewBox="0 0 32 32" style="fill:${color}; stroke:black; stroke-width:1; stroke-opacity:0.5; opacity:0.8;"><path d="M16 32s16-15.5 16-24C32 7.163 24.837 0 16 0S0 7.163 0 8c0 8.5 16 24 16 24z"/><circle cx="16" cy="12" r="6" fill="white"/></svg>`; return L.divIcon({ html: markerHtml, className: '', iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28] }); };
        const stateIcon = createMarkerIcon('#007bff');
        const municipalIcon = createMarkerIcon('#28a745');
        const airportIcon = L.divIcon({ html: `<svg viewBox="0 0 24 24" fill="#333" width="24px" height="24px"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`, className: 'airport-icon', iconSize: [24, 24], iconAnchor: [12, 12] });
        
        concursosFiltrados.forEach(c => {
            let iconToUse = stateIcon;
            if (c.nome.includes('ISS')) { iconToUse = municipalIcon; }
            const marker = L.marker([c.lat, c.lon], { icon: iconToUse }).addTo(map).bindPopup(`<b>${c.nome}</b>`);
            mapMarkers[c.id] = marker; // NOVO: Armazena a referência do marcador
        });
        
        const aeroportosRelevantes = aeroportosData.filter(aeroporto => {
            return concursosFiltrados.some(concurso => {
                const distancia = map.distance([aeroporto.lat, aeroporto.lon], [concurso.lat, concurso.lon]);
                return distancia < 200000;
            });
        });
        aeroportosRelevantes.forEach(a => { L.marker([a.lat, a.lon], { icon: airportIcon }).addTo(map).bindPopup(`<b>${a.nome}</b>`); });
    };

    // --- FUNÇÕES DE LÓGICA E EVENTOS ---
    const applyFilters = () => {
        let filteredData = [...concursosData];
        if (currentFilter === 'atuais') {
            const statusAtuais = ['Edital Publicado', 'Edital Iminente', 'Autorizado'];
            filteredData = filteredData.filter(c => statusAtuais.includes(c.status));
        } else if (currentFilter !== 'todos') {
            const year = parseInt(currentFilter, 10);
            filteredData = filteredData.filter(c => c.prova.startsWith(year.toString()));
        }
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredData = filteredData.filter(c => c.nome.toLowerCase().includes(searchTerm) || c.status.toLowerCase().includes(searchTerm));
        }
        renderTable(filteredData);
        renderSalaryChart(filteredData);
        renderMap(filteredData);
    };

    const openModal = (concursoId) => {
        const concurso = concursosData.find(item => item.id === concursoId);
        if (!concurso) return;
        modalTitle.textContent = concurso.nome;
        const vagasTexto = (concurso.vagas === 'CR' || concurso.vagas > 0) ? concurso.vagas : 'A definir';
        const dataProvaFormatada = concurso.prova !== '9999-12-31' ? new Date(concurso.prova).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'A definir';
        modalBody.innerHTML = `<p><strong>Status:</strong> ${concurso.status}</p><p><strong>Vagas:</strong> ${vagasTexto}</p><p><strong>Salário:</strong> R$ ${concurso.salario.toFixed(2).replace('.', ',')}</p><p><strong>Prova:</strong> ${dataProvaFormatada}</p><p><strong>Banca:</strong> ${concurso.banca}</p><p><strong>Requisitos:</strong> ${concurso.requisitos}</p><p><a href="${concurso.link}" target="_blank">Página do Concurso</a></p>`;
        modalOverlay.classList.remove('hidden');
    };
    const closeModal = () => { modalOverlay.classList.add('hidden'); };
    
    const setupEventListeners = () => {
        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
        searchInput.addEventListener('input', applyFilters);
        updateBtn.addEventListener('click', () => { alert("O Agente de IA foi notificado. As atualizações aparecerão no seu próximo recarregamento da página."); });
        
        headers.forEach((header, index) => {
            header.addEventListener('click', () => {
                const isAsc = header.classList.toggle('asc');
                const key = ['nome', 'status', 'vagas', 'salario', 'prova'][index];
                const dataToSort = [...tableBody.rows].map(row => concursosData.find(c => c.id === parseInt(row.dataset.concursoId)));
                dataToSort.sort((a, b) => {
                    let valA = a[key], valB = b[key];
                    if (key === 'salario' || key === 'vagas') { valA = (valA === 'CR') ? 0 : parseFloat(valA) || 0; valB = (valB === 'CR') ? 0 : parseFloat(valB) || 0; }
                    if (valA < valB) return isAsc ? -1 : 1; if (valA > valB) return isAsc ? 1 : -1; return 0;
                });
                renderTable(dataToSort);
            });
        });

        filterContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                filterContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.dataset.year;
                applyFilters();
            }
        });
    };

    const initializeDashboard = async () => {
        try {
            const urlComAntiCache = `${DATA_URL}?v=${new Date().getTime()}`;
            const response = await fetch(urlComAntiCache);
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            const data = await response.json();
            concursosData = data.concursos;
            aeroportosData = data.aeroportos;
            setupEventListeners();
            applyFilters();
        } catch (error) {
            console.error("Falha ao inicializar o dashboard:", error);
            document.body.
