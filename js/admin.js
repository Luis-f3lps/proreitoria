const statusAdmin = document.getElementById('statusAdmin');
const listaAdmin = document.getElementById('listaAdmin');

// --- 1. BUSCAR PROJETOS DO BANCO ---
async function carregarProjetosAdmin() {
    try {
        statusAdmin.innerText = "Conectando ao banco de dados...";
        statusAdmin.style.color = "#f39c12";

        const resposta = await fetch('/api/projetos');
        const dados = await resposta.json();

        renderizarListaAdmin(dados);

        statusAdmin.innerText = "Sistema online e conectado.";
        statusAdmin.style.color = "#00b894";
    } catch (erro) {
        console.error("Erro ao carregar dados do banco:", erro);
        statusAdmin.innerText = "Erro ao conectar com o banco de dados.";
        statusAdmin.style.color = "#d63031";
    }
}

// --- 2. RENDERIZAR A LISTA NA TELA ---
function renderizarListaAdmin(projetos) {
    listaAdmin.innerHTML = '';

    if (projetos.length === 0) {
        listaAdmin.innerHTML = '<p>Nenhum projeto encontrado no banco de dados.</p>';
        return;
    }

    projetos.forEach(projeto => {
        const div = document.createElement('div');
        div.style.padding = '15px';
        div.style.marginBottom = '12px';
        div.style.backgroundColor = '#f8f9fa';
        div.style.borderRadius = '8px';
        div.style.border = '1px solid #ddd';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';

        // Escapando aspas simples do título para não quebrar a função do botão
        const tituloSeguro = projeto.titulo.replace(/'/g, "\\'");

        div.innerHTML = `
            <div>
                <strong style="color: #2d3436; font-size: 1.1em; display: block; margin-bottom: 5px;">
                    ${projeto.titulo}
                </strong>
                <small style="color: #636e72;">
                    Coordenador: ${projeto.coordenador} | Unidade: ${projeto.unidade}
                </small>
            </div>
            <button onclick="apagarProjeto(${projeto.id}, '${tituloSeguro}')" style="background: #d63031; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; white-space: nowrap; margin-left: 15px;">
                <i class="fa-solid fa-trash"></i> Apagar
            </button>
        `;

        listaAdmin.appendChild(div);
    });
}

// --- 3. ADICIONAR NOVO PROJETO ---
async function adicionarProjeto(event) {
    event.preventDefault();

    const btnSalvar = document.getElementById('btnSalvar');
    const textoOriginalBtn = btnSalvar.innerHTML;

    const novoProjeto = {
        titulo: document.getElementById('addTitulo').value,
        area: document.getElementById('addArea').value,
        unidade: document.getElementById('addUnidade').value,
        coordenador: document.getElementById('addCoordenador').value,
        email: document.getElementById('addEmail') ? document.getElementById('addEmail').value : '',
        tipo: document.getElementById('addTipo').value,
        formacao: document.getElementById('addFormacao') ? document.getElementById('addFormacao').value : '',
        carreira: document.getElementById('addCarreira') ? document.getElementById('addCarreira').value : '',
        vigencia_inicio: document.getElementById('addInicio').value,
        vigencia_termino: document.getElementById('addTermino') ? document.getElementById('addTermino').value : '',
        processo_sei: document.getElementById('addSEI').value,
        etica_seguranca: document.getElementById('addEtica') ? document.getElementById('addEtica').value : ''
    };

    try {
        btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        btnSalvar.style.opacity = '0.7';
        btnSalvar.disabled = true;

        const resposta = await fetch('/api/projetos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoProjeto)
        });

        if (resposta.ok) {
            alert("Projeto adicionado com sucesso!");
            document.getElementById('formNovoProjeto').reset(); // Limpa os campos
            carregarProjetosAdmin(); // Recarrega a lista para mostrar o novo
        } else {
            alert("Erro ao salvar projeto no banco.");
        }
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro de conexão.");
    } finally {
        btnSalvar.innerHTML = textoOriginalBtn;
        btnSalvar.style.opacity = '1';
        btnSalvar.disabled = false;
    }
}

// --- 4. APAGAR PROJETO ---
async function apagarProjeto(id, titulo) {
    if (confirm(`Atenção: Tem certeza que deseja apagar definitivamente o projeto:\n\n"${titulo}"?`)) {
        try {
            statusAdmin.innerText = "Apagando projeto...";

            const resposta = await fetch('/api/projetos', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });

            if (resposta.ok) {
                carregarProjetosAdmin(); // Atualiza a lista na tela
            } else {
                alert("Erro ao apagar projeto do banco.");
            }
        } catch (erro) {
            console.error("Erro:", erro);
            alert("Erro de conexão ao tentar apagar.");
        }
    }
}

// Função do menu responsivo
function toggleMenu() {
    const sidebar = document.getElementById('sidemenu');
    sidebar.classList.toggle('active');
}

// Carrega os dados assim que a página abrir
window.onload = carregarProjetosAdmin;