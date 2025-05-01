// DOM Elements
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const calculadoraForm = document.getElementById('calculadoraForm');
const simulacaoForm = document.getElementById('simulacaoForm');
const resultado = document.getElementById('resultado');
const resultadoSimulacao = document.getElementById('resultadoSimulacao');

// Constants
const JORNADA_PADRAO = 8 * 60 + 48; // 8 horas e 48 minutos em minutos
const VALOR_VA = 30.45;
const TAXA_INSS = 0.0783;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    // Form submissions
    calculadoraForm.addEventListener('submit', handleCalculadoraSubmit);
    simulacaoForm.addEventListener('submit', handleSimulacaoSubmit);

    // Initialize date input with today's date
    document.getElementById('data').valueAsDate = new Date();
    
    // Setup time input formatting
    ['entrada', 'saidaAlmoco', 'retornoAlmoco', 'saida'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 4) {
                value = value.slice(0, 2) + ':' + value.slice(2, 4);
                e.target.value = value;
            }
        });
        
        input.addEventListener('blur', function(e) {
            const value = e.target.value;
            if (value && value.length === 5) {
                const [hours, minutes] = value.split(':');
                if (parseInt(hours) >= 0 && parseInt(hours) < 24 && 
                    parseInt(minutes) >= 0 && parseInt(minutes) < 60) {
                    e.target.value = value;
                } else {
                    e.target.value = '';
                    mostrarErro('Horário inválido. Use o formato HH:MM (24h)');
                }
            } else {
                e.target.value = '';
            }
        });
    });
    
    // Load histórico
    loadHistorico();

    // Setup filtros
    setupFiltros();
});

// Tab Switching
function switchTab(tabId) {
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}

// Validações
function validarData(data) {
    const hoje = new Date();
    const dataInput = new Date(data);
    const doisDiasFuturos = new Date();
    doisDiasFuturos.setDate(hoje.getDate() + 2);

    return dataInput <= doisDiasFuturos;
}

function validarHorarios(entrada, saidaAlmoco, retornoAlmoco, saida) {
    if (!entrada || !saidaAlmoco || !retornoAlmoco || !saida) {
        return false;
    }
    const entradaTime = new Date(`1970-01-01T${entrada}`);
    const saidaAlmocoTime = new Date(`1970-01-01T${saidaAlmoco}`);
    const retornoAlmocoTime = new Date(`1970-01-01T${retornoAlmoco}`);
    const saidaTime = new Date(`1970-01-01T${saida}`);

    return entradaTime < saidaAlmocoTime && 
           saidaAlmocoTime < retornoAlmocoTime && 
           retornoAlmocoTime < saidaTime;
}

// Helper to format decimal hours to "Xh Ym"
function formatDecimalHours(decimalHours) {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    let result = '';
    if (hours > 0) {
        result += `${hours}h `;
    }
    if (minutes > 0) {
        result += `${minutes}m`;
    }
    if (result === '') {
        result = '0h';
    }
    return result.trim();
}

// Cálculos de Horas
function calcularMinutosTrabalhados(entrada, saidaAlmoco, retornoAlmoco, saida) {
    const entradaTime = new Date(`1970-01-01T${entrada}`);
    const saidaAlmocoTime = new Date(`1970-01-01T${saidaAlmoco}`);
    const retornoAlmocoTime = new Date(`1970-01-01T${retornoAlmoco}`);
    const saidaTime = new Date(`1970-01-01T${saida}`);

    const periodoManha = saidaAlmocoTime - entradaTime;
    const periodoTarde = saidaTime - retornoAlmocoTime;

    return Math.floor((periodoManha + periodoTarde) / (1000 * 60));
}

function calcularHorasExtras(minutosTrabalhados, data, isFeriado) {
    const dataObj = new Date(data);
    const diaSemana = dataObj.getDay();
    
    // Se for sábado (6)
    if (diaSemana === 6) {
        const horasExtras = minutosTrabalhados / 60;
        return {
            normais: 0,
            extras100: horasExtras
        };
    }

    // Se for feriado
    if (isFeriado) {
        const minutosExtras = minutosTrabalhados - JORNADA_PADRAO;
        const horasExtras = minutosExtras > 0 ? minutosExtras / 60 : 0;
        return {
            normais: horasExtras,
            extras100: horasExtras
        };
    }

    // Para dias úteis
    const minutosExtras = minutosTrabalhados - JORNADA_PADRAO;
    if (minutosExtras <= 0) {
        return {
            normais: 0,
            extras100: 0
        };
    }

    return {
        normais: minutosExtras / 60,
        extras100: 0
    };
}

// Handlers
function handleCalculadoraSubmit(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const data = document.getElementById('data').value;
    const entrada = document.getElementById('entrada').value;
    const saidaAlmoco = document.getElementById('saidaAlmoco').value;
    const retornoAlmoco = document.getElementById('retornoAlmoco').value;
    const saida = document.getElementById('saida').value;
    const isFeriado = document.getElementById('feriado').checked;

    // Validações
    if (!validarData(data)) {
        mostrarErro('Data não pode ser superior a 2 dias futuros');
        return;
    }

    if (!validarHorarios(entrada, saidaAlmoco, retornoAlmoco, saida)) {
        mostrarErro('Horários inválidos. Verifique a sequência dos horários');
        return;
    }

    // Cálculos
    const minutosTrabalhados = calcularMinutosTrabalhados(entrada, saidaAlmoco, retornoAlmoco, saida);
    const horasExtras = calcularHorasExtras(minutosTrabalhados, data, isFeriado);

    // Mostrar resultado
    mostrarResultado(horasExtras);

    // Habilitar botão de salvar
    const registro = {
        nome,
        data,
        entrada,
        saidaAlmoco,
        retornoAlmoco,
        saida,
        isFeriado,
        horasExtras
    };

    document.getElementById('salvarRegistro').onclick = () => salvarRegistro(registro);
    resultado.classList.remove('hidden');
}

function handleSimulacaoSubmit(e) {
    e.preventDefault();

    const salarioBruto = parseFloat(document.getElementById('salarioBruto').value);
    const horasExtrasNormais = parseFloat(document.getElementById('horasExtrasNormaisSimulacao').value);
    const horasExtras100 = parseFloat(document.getElementById('horasExtras100Simulacao').value);

    // Cálculos
    const valorDiario = salarioBruto / 30;
    const valorSemanal = valorDiario * 6;
    const valorHoraNormal = valorSemanal / 44;

    const valorHorasExtrasNormais = valorHoraNormal * 1.5 * horasExtrasNormais;
    const valorHorasExtras100 = valorHoraNormal * 2 * horasExtras100;

    const totalBruto = salarioBruto + valorHorasExtrasNormais + valorHorasExtras100;
    const descontoINSS = totalBruto * TAXA_INSS;
    const valorFinal = totalBruto - descontoINSS - VALOR_VA;

    // Mostrar resultado
    mostrarResultadoSimulacao({
        valorHoraNormal,
        valorHorasExtras: valorHorasExtrasNormais + valorHorasExtras100,
        descontoINSS,
        valorFinal
    });
}

// UI Updates
function mostrarErro(mensagem) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error fade-in';
    errorDiv.textContent = mensagem;

    // Remove any existing error
    const existingError = document.querySelector('.error');
    if (existingError) {
        existingError.remove();
    }

    calculadoraForm.insertBefore(errorDiv, calculadoraForm.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function mostrarResultado(horasExtras) {
    document.getElementById('horasExtrasNormais').textContent = 
        formatDecimalHours(horasExtras.normais);
    document.getElementById('horasExtras100').textContent = 
        formatDecimalHours(horasExtras.extras100);
}

function mostrarResultadoSimulacao(resultado) {
    document.getElementById('valorHoraNormal').textContent = 
        `R$ ${resultado.valorHoraNormal.toFixed(2)}`;
    document.getElementById('totalHorasExtras').textContent = 
        `R$ ${resultado.valorHorasExtras.toFixed(2)}`;
    document.getElementById('descontoINSS').textContent = 
        `R$ ${resultado.descontoINSS.toFixed(2)}`;
    document.getElementById('valorFinal').textContent = 
        `R$ ${resultado.valorFinal.toFixed(2)}`;

    resultadoSimulacao.classList.remove('hidden');
}

// Local Storage
function salvarRegistro(registro) {
    let registros = JSON.parse(localStorage.getItem('registros') || '[]');
    registros.push(registro);
    localStorage.setItem('registros', JSON.stringify(registros));

    // Atualizar histórico
    loadHistorico();

    // Feedback
    alert('Registro salvo com sucesso!');
}

function loadHistorico() {
    const registros = JSON.parse(localStorage.getItem('registros') || '[]');
    const tbody = document.getElementById('historicoTableBody');
    tbody.innerHTML = '';

    registros.forEach((registro, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${formatarData(registro.data)}</td>
            <td class="px-6 py-4">${registro.nome}</td>
            <td class="px-6 py-4">
                ${registro.entrada} - ${registro.saidaAlmoco}<br>
                ${registro.retornoAlmoco} - ${registro.saida}
            </td>
            <td class="px-6 py-4">${registro.horasExtras.normais.toFixed(2)}h</td>
            <td class="px-6 py-4">${registro.horasExtras.extras100.toFixed(2)}h</td>
            <td class="px-6 py-4">
                <button onclick="editarRegistro(${index})" class="text-blue-600 hover:text-blue-800">
                    <i class="fas fa-edit"></i> Editar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    atualizarTotais(registros);
}

// Filtros
function setupFiltros() {
    const filtroTipo = document.getElementById('filtroTipo');
    const filtroData = document.getElementById('filtroData');

    filtroTipo.addEventListener('change', aplicarFiltros);
    filtroData.addEventListener('change', aplicarFiltros);
}

function aplicarFiltros() {
    const tipo = document.getElementById('filtroTipo').value;
    const data = document.getElementById('filtroData').value;
    
    let registros = JSON.parse(localStorage.getItem('registros') || '[]');
    
    if (data) {
        const dataFiltro = new Date(data);
        
        switch(tipo) {
            case 'dia':
                registros = registros.filter(r => r.data === data);
                break;
            case 'semana':
                registros = registros.filter(r => {
                    const dataRegistro = new Date(r.data);
                    return getWeekNumber(dataRegistro) === getWeekNumber(dataFiltro);
                });
                break;
            case 'mes':
                registros = registros.filter(r => {
                    const dataRegistro = new Date(r.data);
                    return dataRegistro.getMonth() === dataFiltro.getMonth() &&
                           dataRegistro.getFullYear() === dataFiltro.getFullYear();
                });
                break;
        }
    }

    atualizarTotais(registros);
}

// Helpers
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

function atualizarTotais(registros) {
    const totais = registros.reduce((acc, registro) => {
        return {
            normais: acc.normais + registro.horasExtras.normais,
            extras100: acc.extras100 + registro.horasExtras.extras100
        };
    }, { normais: 0, extras100: 0 });

    document.getElementById('totalHorasNormais').textContent = 
        `${totais.normais.toFixed(2)}h`;
    document.getElementById('totalHoras100').textContent = 
        `${totais.extras100.toFixed(2)}h`;
}

// Edição de Registros
function editarRegistro(index) {
    const registros = JSON.parse(localStorage.getItem('registros') || '[]');
    const registro = registros[index];

    // Preencher formulário com dados do registro
    document.getElementById('nome').value = registro.nome;
    document.getElementById('data').value = registro.data;
    document.getElementById('entrada').value = registro.entrada;
    document.getElementById('saidaAlmoco').value = registro.saidaAlmoco;
    document.getElementById('retornoAlmoco').value = registro.retornoAlmoco;
    document.getElementById('saida').value = registro.saida;
    document.getElementById('feriado').checked = registro.isFeriado;

    // Mudar para a aba de calculadora
    switchTab('calculadora');

    // Modificar o comportamento do botão salvar
    document.getElementById('salvarRegistro').onclick = () => {
        registros[index] = {
            ...registro,
            nome: document.getElementById('nome').value,
            data: document.getElementById('data').value,
            entrada: document.getElementById('entrada').value,
            saidaAlmoco: document.getElementById('saidaAlmoco').value,
            retornoAlmoco: document.getElementById('retornoAlmoco').value,
            saida: document.getElementById('saida').value,
            isFeriado: document.getElementById('feriado').checked
        };

        localStorage.setItem('registros', JSON.stringify(registros));
        loadHistorico();
        alert('Registro atualizado com sucesso!');
    };
}
