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
// Função para exportar dados
function exportData(type, format) {
    const data = dados[type];
    if (data.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }
    const filename = `${type}.${format}`;
    if (format === 'csv') {
        let csv = Object.keys(data[0]).join(',') + '\n';
        data.forEach(row => {
            csv += Object.values(row).map(value => `"${value}"`).join(',') + '\n';
        });
        downloadFile('data:text/csv;charset=utf-8,' + encodeURIComponent(csv), filename);
    } else if (format === 'xml') {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<' + type + '>\n';
        data.forEach(item => {
            xml += '  <item>\n';
            for (let key in item) {
                xml += `    <${key}>${item[key] !== null && item[key] !== undefined ? item[key] : ''}</${key}>\n`;
            }
            xml += '  </item>\n';
        });
        xml += '</' + type + '>';
        downloadFile('data:application/xml;charset=utf-8,' + encodeURIComponent(xml), filename);
    } else if (format === 'docx') {
        const { Document, Packer, Paragraph, Table, TableRow, TableCell } = docx;
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: type.charAt(0).toUpperCase() + type.slice(1),
                        heading: 'Title',
                    }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: Object.keys(data[0]).map(key => new TableCell({
                                    children: [new Paragraph(key)],
                                })),
                            }),
                            ...data.map(row => new TableRow({
                                children: Object.values(row).map(value => new TableCell({
                                    children: [new Paragraph(value !== null && value !== undefined ? value.toString() : '')],
                                })),
                            })),
                        ],
                    }),
                ],
            }],
        });
        Packer.toBlob(doc).then(blob => {
            saveAs(blob, filename);
        }).catch(error => {
            console.error('Erro ao gerar DOCX:', error);
            alert('Falha ao gerar o arquivo DOCX. Verifique o console para detalhes.');
        });
    }
}
// Função auxiliar para download de CSV e XML
function downloadFile(uri, filename) {
    const link = document.createElement('a');
    link.href = uri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// === ABASTECIMENTOS ===
const abastecimentoForm = document.getElementById('abastecimento-form');
abastecimentoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const placa = document.getElementById('placa').value;
    const litros = parseFloat(document.getElementById('litros').value);
    const odometro = parseFloat(document.getElementById('odometro').value);
    const custo = parseFloat(document.getElementById('custo').value);
    const data = document.getElementById('data-abastecimento').value;
    const hora = document.getElementById('hora-abastecimento').value;

    // Verificar duplicidade: mesma placa, odometro e custo
    const duplicado = dados.abastecimentos.some(a => 
        a.placa === placa && a.odometro === odometro && a.custo === custo
    );
    if (duplicado) {
        alert('Registro já existente, verifique odômetro e valor de abastecimento.');
        return; // Impede o registro
    }

    dados.abastecimentos.push({ placa, litros, odometro, custo, data, hora });
    salvarDados();
    atualizarTabelaAbastecimentos();
    e.target.reset();
});
function atualizarTabelaAbastecimentos() {
    const tabela = document.getElementById('tabela-abastecimentos').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';
    // Agrupar abastecimentos por placa para calcular Km/L
    const abastecimentosPorPlaca = {};
    dados.abastecimentos.forEach(a => {
        if (!abastecimentosPorPlaca[a.placa]) {
            abastecimentosPorPlaca[a.placa] = [];
        }
        abastecimentosPorPlaca[a.placa].push(a);
    });
    // Ordenar cada grupo por data e hora (assumindo data no formato YYYY-MM-DD e hora HH:MM)
    Object.keys(abastecimentosPorPlaca).forEach(placa => {
        abastecimentosPorPlaca[placa].sort((a, b) => {
            const dateA = new Date(`${a.data}T${a.hora || '00:00'}`);
            const dateB = new Date(`${b.data}T${b.hora || '00:00'}`);
            return dateA - dateB;
        });
    });
    // Para cada abastecimento, calcular Km/L
    dados.abastecimentos.forEach(a => {
        const row = tabela.insertRow();
        row.insertCell().innerText = a.placa;
        row.insertCell().innerText = a.litros;
        row.insertCell().innerText = a.odometro;
        row.insertCell().innerText = a.custo;
        row.insertCell().innerText = a.data ? `${a.data} ${a.hora || ''}` : '';
        
        // Cálculo de Km/L
        const grupo = abastecimentosPorPlaca[a.placa];
        const index = grupo.findIndex(item => item === a);
        let kmL = '-';
        if (index > 0) {
            const anterior = grupo[index - 1];
            const kmRodados = a.odometro - anterior.odometro;
            if (kmRodados > 0 && a.litros > 0) {
                kmL = (kmRodados / a.litros).toFixed(2);
            }
        }
        row.insertCell().innerText = kmL;
    });
}
// === AGENDAMENTOS ===
const agendamentoForm = document.getElementById('agendamento-form');
agendamentoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const veiculo = document.getElementById('veiculo-agendamento').value;
    const data = document.getElementById('data-agendamento').value;
    const hora = document.getElementById('hora-agendamento').value;

    // Verificar duplicidade: mesmo veiculo, data e hora
    const duplicado = dados.agendamentos.some(a => 
        a.veiculo === veiculo && a.data === data && a.hora === hora
    );
    if (duplicado) {
        alert('Registro já existente, verifique veículo, data e hora do agendamento.');
        return;
    }

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

    // Verificar duplicidade: mesma placa
    const duplicado = dados.veiculos.some(v => v.placa === placa);
    if (duplicado) {
        alert('Registro já existente, verifique a placa do veículo.');
        return;
    }

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

    // Verificar duplicidade: mesma CNH
    const duplicado = dados.motoristas.some(m => m.cnh === cnh);
    if (duplicado) {
        alert('Registro já existente, verifique a CNH do motorista.');
        return;
    }

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

    // Verificar duplicidade: mesmo nome e endereço
    const duplicado = dados.postos.some(p => p.nome === nome && p.endereco === endereco);
    if (duplicado) {
        alert('Registro já existente, verifique nome e endereço do posto.');
        return;
    }

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
    const valorPecas = parseFloat(document.getElementById('valor-pecas').value);
    const maoDeObra = parseFloat(document.getElementById('mao-de-obra').value);
    const data = document.getElementById('data-manutencao').value;
    const hora = document.getElementById('hora-manutencao').value;
    const total = valorPecas + maoDeObra;

    // Verificar duplicidade: mesmo veículo, data, hora e total
    const duplicado = dados.manutencoes.some(m => 
        m.veiculo === veiculo && m.data === data && m.hora === hora && m.total === total
    );
    if (duplicado) {
        alert('Registro já existente, verifique veículo, data, hora e total da manutenção.');
        return;
    }

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
        row.insertCell().innerText = m.valorPecas.toFixed(2);
        row.insertCell().innerText = m.maoDeObra.toFixed(2);
        row.insertCell().innerText = m.total.toFixed(2);
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
