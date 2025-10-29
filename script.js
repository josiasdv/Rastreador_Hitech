// Verificar login
if (localStorage.getItem('loggedIn') !== 'true') {
    window.location.href = 'login.html';
}
// Logout
document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('loggedIn');
    window.location.href = 'login.html';
});
// Animação menu accordion
const links = document.querySelectorAll('.nav-links a');
links.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        const sections = document.querySelectorAll('.section');
        sections.forEach(sec => sec.classList.remove('active'));
        if (target) {
            target.classList.add('active');
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
// Dados em localStorage
let dados = localStorage.getItem('dados') ? JSON.parse(localStorage.getItem('dados')) : {
    abastecimentos: [],
    agendamentos: [],
    veiculos: [],
    motoristas: [],
    postos: [],
    manutencoes: [] 
};
// Salvar dados
function salvarDados() {
    localStorage.setItem('dados', JSON.stringify(dados));
}
// === ABASTECIMENTOS ===
const abastecimentoForm = document.getElementById('abastecimento-form');
abastecimentoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const placa = document.getElementById('placa').value;
    const litros = document.getElementById('litros').value;
    const odometro = document.getElementById('odometro').value;
    const custo = document.getElementById('custo').value;
    const data = document.getElementById('data-abastecimento').value; 
    const hora = document.getElementById('hora-abastecimento').value; 
    dados.abastecimentos.push({ placa, litros, odometro, custo, data, hora });
    salvarDados();
    atualizarTabelaAbastecimentos();
    e.target.reset();
});
function atualizarTabelaAbastecimentos() {
    const tabela = document.getElementById('tabela-abastecimentos').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';
    dados.abastecimentos.forEach(a => {
        const row = tabela.insertRow();
        row.insertCell().innerText = a.placa;
        row.insertCell().innerText = a.litros;
        row.insertCell().innerText = a.odometro;
        row.insertCell().innerText = a.custo;
        row.insertCell().innerText = a.data ? `${a.data} ${a.hora || ''}` : ''; 
        row.insertCell().innerText = 'Km/L calculado'; 
    });
}
// === AGENDAMENTOS ===
const agendamentoForm = document.getElementById('agendamento-form');
agendamentoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const veiculo = document.getElementById('veiculo-agendamento').value;
    const data = document.getElementById('data-agendamento').value;
    const hora = document.getElementById('hora-agendamento').value; 
    dados.agendamentos.push({ veiculo, data, hora });
    salvarDados();
    atualizarTabelaAgendamentos();
    e.target.reset();
});
function atualizarTabelaAgendamentos() {
    const tabela = document.getElementById('tabela-agendamentos').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';
    dados.agendamentos.forEach(a => {
        const row = tabela.insertRow();
        row.insertCell().innerText = a.veiculo;
        row.insertCell().innerText = `${a.data} ${a.hora || ''}`; 
        row.insertCell().innerText = 'Status';
    });
}
// === VEÍCULOS ===
const veiculoForm = document.getElementById('veiculo-form');
veiculoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const placa = document.getElementById('placa').value;
    const modelo = document.getElementById('modelo').value;
    const proprietario = document.getElementById('proprietario').value;
    dados.veiculos.push({ placa, modelo, proprietario });
    salvarDados();
    atualizarTabelaVeiculos();
    e.target.reset();
});
function atualizarTabelaVeiculos() {
    const tabela = document.getElementById('tabela-veiculos').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';
    dados.veiculos.forEach(v => {
        const row = tabela.insertRow();
        row.insertCell().innerText = v.placa;
        row.insertCell().innerText = v.modelo;
        row.insertCell().innerText = v.proprietario;
    });
}
// === MOTORISTAS ===
const motoristaForm = document.getElementById('motorista-form');
motoristaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome-motorista').value;
    const cnh = document.getElementById('cnh').value;
    const contato = document.getElementById('contato-motorista').value;
    dados.motoristas.push({ nome, cnh, contato });
    salvarDados();
    atualizarTabelaMotoristas();
    e.target.reset();
});
function atualizarTabelaMotoristas() {
    const tabela = document.getElementById('tabela-motoristas').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';
    dados.motoristas.forEach(m => {
        const row = tabela.insertRow();
        row.insertCell().innerText = m.nome;
        row.insertCell().innerText = m.cnh;
        row.insertCell().innerText = m.contato;
    });
}
// === POSTOS ===
const postoForm = document.getElementById('posto-form');
postoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome-posto').value;
    const endereco = document.getElementById('endereco-posto').value;
    dados.postos.push({ nome, endereco });
    salvarDados();
    atualizarTabelaPostos();
    e.target.reset();
});
function atualizarTabelaPostos() {
    const tabela = document.getElementById('tabela-postos').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';
    dados.postos.forEach(p => {
        const row = tabela.insertRow();
        row.insertCell().innerText = p.nome;
        row.insertCell().innerText = p.endereco;
    });
}
// === MANUTENÇÕES === 
const manutencaoForm = document.getElementById('manutencao-form');
manutencaoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const veiculo = document.getElementById('veiculo-manutencao').value;
    const oficina = document.getElementById('oficina').value;
    const cnpj = document.getElementById('cnpj-oficina').value;
    const pecas = document.getElementById('pecas').value;
    const valorPecas = document.getElementById('valor-pecas').value;
    const maoDeObra = document.getElementById('mao-de-obra').value;
    const data = document.getElementById('data-manutencao').value;
    const hora = document.getElementById('hora-manutencao').value; 
    const total = parseFloat(valorPecas) + parseFloat(maoDeObra);
    dados.manutencoes.push({ veiculo, oficina, cnpj, pecas, valorPecas, maoDeObra, total, data, hora });
    salvarDados();
    atualizarTabelaManutencoes();
    e.target.reset();
});
function atualizarTabelaManutencoes() {
    const tabela = document.getElementById('tabela-manutencoes').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';
    dados.manutencoes.forEach(m => {
        const row = tabela.insertRow();
        row.insertCell().innerText = m.veiculo;
        row.insertCell().innerText = m.oficina;
        row.insertCell().innerText = m.cnpj;
        row.insertCell().innerText = m.pecas;
        row.insertCell().innerText = m.valorPecas;
        row.insertCell().innerText = m.maoDeObra;
        row.insertCell().innerText = m.total;
        row.insertCell().innerText = `${m.data} ${m.hora || ''}`; 
    });
}
// Inicializa tabelas
atualizarTabelaAbastecimentos();
atualizarTabelaAgendamentos();
atualizarTabelaVeiculos();
atualizarTabelaMotoristas();
atualizarTabelaPostos();
atualizarTabelaManutencoes(); 
// Init Maps
function initMap() {
    new google.maps.Map(document.getElementById('map'), {
        center: { lat: -16.4856, lng: -52.6924 },
        zoom: 14
    });
}
