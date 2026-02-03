var tablinks = document.getElementsByClassName("tab-links");
var tabcontents = document.getElementsByClassName("tab-contents");

function opentab(tabname) {
  for (var i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active-link");
  }
  for (var i = 0; i < tabcontents.length; i++) {
    tabcontents[i].classList.remove("active-tab");
    if (tabcontents[i].id === tabname) {
      tabcontents[i].classList.add("active-tab");
    }
  }
  event.currentTarget.classList.add("active-link");
}

const inputPesquisa = document.getElementById('barraPesquisa');
const containerLista = document.getElementById('containerLista');
const contadorProjetos = document.getElementById('contadorProjetos');
const selectUnidade = document.getElementById('selectUnidade');

let graficoUnidades, graficoTipos, graficoFormacao, graficoAreas, graficoAno;

function contarOcorrencias(dados, chave) {
  return dados.reduce((acc, projeto) => {
    const valor = projeto[chave] || 'Não Informado';
    acc[valor] = (acc[valor] || 0) + 1;
    return acc;
  }, {});
}

function contarProjetosPorAno(dados) {
  const contagem = {};

  dados.forEach(projeto => {
    const dataInicio = projeto['Vigência (Início)'];

    if (dataInicio && dataInicio.trim() !== "") {
      const dataObj = new Date(dataInicio);
      const ano = dataObj.getFullYear();

      if (!isNaN(ano)) {
        contagem[ano] = (contagem[ano] || 0) + 1;
      }
    }
  });

  const anosOrdenados = Object.keys(contagem).sort();
  const valoresOrdenados = anosOrdenados.map(ano => contagem[ano]);

  return { anos: anosOrdenados, valores: valoresOrdenados };
}

function popularSelectUnidades() {
  const unidadesUnicas = [...new Set(projetosIFNMG.map(p => p['Unidade']))].filter(Boolean).sort();

  selectUnidade.innerHTML = '<option value="">Todos os Campi</option>';
  unidadesUnicas.forEach(unidade => {
    const option = document.createElement('option');
    option.value = unidade;
    option.textContent = unidade;
    selectUnidade.appendChild(option);
  });
}

function renderizarLista(dados) {
  contadorProjetos.innerText = `Mostrando ${dados.length} projetos.`;
  containerLista.innerHTML = '';

  dados.slice(0, 100).forEach(projeto => {
    const div = document.createElement('div');
    div.style.padding = '10px';
    div.style.borderBottom = '1px solid #ddd';
    div.innerHTML = `<strong>${projeto['Título do Projeto']}</strong><br>
                     <small>${projeto['Unidade']} | ${projeto['Área']} | Coordenador: ${projeto['Coordenador']}</small>`;
    containerLista.appendChild(div);
  });
}

function atualizarGraficos(dadosCompletos, dadosSemFiltroUnidade) {
  const contagemUnidades = contarOcorrencias(dadosSemFiltroUnidade, 'Unidade');
  const contagemTipos = contarOcorrencias(dadosCompletos, 'Tipo');
  const contagemFormacao = contarOcorrencias(dadosCompletos, 'Formação');
  const contagemAreas = contarOcorrencias(dadosCompletos, 'Área');
  const dadosAno = contarProjetosPorAno(dadosCompletos);

  if (graficoUnidades) graficoUnidades.destroy();
  if (graficoTipos) graficoTipos.destroy();
  if (graficoFormacao) graficoFormacao.destroy();
  if (graficoAreas) graficoAreas.destroy();
  if (graficoAno) graficoAno.destroy();

  graficoUnidades = new Chart(document.getElementById('graficoUnidades'), {
    type: 'bar',
    data: {
      labels: Object.keys(contagemUnidades),
      datasets: [{
        label: 'Projetos',
        data: Object.values(contagemUnidades),
        backgroundColor: '#2e7d32'
      }]
    }
  });

  graficoTipos = new Chart(document.getElementById('graficoTipos'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(contagemTipos),
      datasets: [{
        data: Object.values(contagemTipos),
        backgroundColor: ['#2e7d32', '#66bb6a', '#a5d6a7', '#1b5e20', '#4caf50']
      }]
    }
  });

  graficoFormacao = new Chart(document.getElementById('graficoFormacao'), {
    type: 'pie',
    data: {
      labels: Object.keys(contagemFormacao),
      datasets: [{
        data: Object.values(contagemFormacao),
        backgroundColor: ['#1565c0', '#42a5f5', '#90caf9', '#0d47a1', '#1976d2']
      }]
    }
  });

  graficoAreas = new Chart(document.getElementById('graficoAreas'), {
    type: 'bar',
    data: {
      labels: Object.keys(contagemAreas),
      datasets: [{
        label: 'Projetos',
        data: Object.values(contagemAreas),
        backgroundColor: '#f57c00'
      }]
    },
    options: { indexAxis: 'y' }
  });

  graficoAno = new Chart(document.getElementById('graficoAno'), {
    type: 'line',
    data: {
      labels: dadosAno.anos,
      datasets: [{
        label: 'Novos Projetos',
        data: dadosAno.valores,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.2)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
      }
    }
  });
}

function inicializarDashboard() {
  popularSelectUnidades();
  atualizarGraficos(projetosIFNMG, projetosIFNMG);
  renderizarLista(projetosIFNMG);
}

function aplicarFiltros() {
  const termo = inputPesquisa.value.toLowerCase();
  const unidadeSelecionada = selectUnidade.value;

  const dadosFiltradosApenasPesquisa = projetosIFNMG.filter(projeto => {
    return (projeto['Título do Projeto'] && projeto['Título do Projeto'].toLowerCase().includes(termo)) ||
      (projeto['Coordenador'] && projeto['Coordenador'].toLowerCase().includes(termo)) ||
      (projeto['Área'] && projeto['Área'].toLowerCase().includes(termo));
  });
  
  const dadosFiltradosTotal = dadosFiltradosApenasPesquisa.filter(projeto => {
    return unidadeSelecionada === "" || projeto['Unidade'] === unidadeSelecionada;
  });
  
  atualizarGraficos(dadosFiltradosTotal, dadosFiltradosApenasPesquisa);
  renderizarLista(dadosFiltradosTotal);
}

inputPesquisa.addEventListener('input', aplicarFiltros);
selectUnidade.addEventListener('change', aplicarFiltros);
window.onload = inicializarDashboard;

document.addEventListener("DOMContentLoaded", function () {
  const innerContainer = document.getElementById("logoloop-inner");
  const originalList = document.getElementById("original-list");

  if (innerContainer && originalList) {
    setupLogoLoop();
    window.addEventListener("resize", setupLogoLoop);
  }

  function setupLogoLoop() {
    innerContainer
      .querySelectorAll('.logoloop-list[aria-hidden="true"]')
      .forEach((clone) => clone.remove());

    const totalClones = 2;

    for (let i = 0; i < totalClones; i++) {
      const clone = originalList.cloneNode(true);
      clone.removeAttribute("id");
      clone.setAttribute("aria-hidden", "true");
      innerContainer.appendChild(clone);
    }

    const gap =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--logo-gap"
        )
      ) || 0;
    const originalWidth = originalList.offsetWidth + gap;

    innerContainer.style.setProperty("--scroll-distance", `${originalWidth}px`);
  }
});