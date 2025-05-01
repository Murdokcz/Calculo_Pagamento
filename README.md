```markdown
# Calculadora de Horas Extras e Simulação de Salário

## Project Overview
Calculadora de Horas Extras e Simulação de Salário é uma aplicação web que permite aos usuários calcular horas extras trabalhadas, visualizar um histórico de registros e simular seus salários mensais. A interface é construída utilizando HTML, CSS (com Tailwind CSS), e JavaScript. A aplicação é ideal para trabalhadores que desejam obter uma visão clara de como suas horas extras afetam o salário final.

## Installation
Para executar a aplicação localmente, siga estes passos:

1. Faça o download ou clone o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   ```

2. Navegue até o diretório do projeto:
   ```bash
   cd <DIRETORIO_DO_PROJETO>
   ```

3. Abra o arquivo `index.html` em um navegador de sua escolha. Não é necessário um servidor backend, pois a aplicação é totalmente client-side.

## Usage
1. **Registrar Horas Trabalhadas**: No primeiro tab, insira seu nome, a data e os horários de entrada, saída para almoço, retorno do almoço e saída do trabalho. Você também pode marcar se é um feriado. Clique no botão "Calcular Horas Extras" para visualizar os resultados.

2. **Histórico de Registros**: No segundo tab, você pode visualizar históricos de registros com opções de filtro. Os dados serão exibidos em uma tabela.

3. **Simulação de Salário**: No terceiro tab, forneça o salário bruto e as horas extras para calcular o valor final a receber, considerando descontos como INSS e vale alimentação.

## Features
- Calcule horas extras normais e 100%.
- Visualização de histórico de registros.
- Simulação de salário considerando horas extras e descontos.
- Interface responsiva construída com Tailwind CSS.
- Uso de ícones Font Awesome para uma melhor experiência do usuário.

## Dependencies
Foram utilizadas as seguintes bibliotecas para a construção do projeto:
- [Tailwind CSS](https://tailwindcss.com/) - Para estilização e layouts responsivos.
- [Font Awesome](https://fontawesome.com/) - Para ícones auxiliares.

## Project Structure
A estrutura do projeto é a seguinte:

```
/projeto-raiz
│
├── index.html          # O arquivo principal HTML que contém o layout da aplicação.
├── css/                # Diretório que pode conter os estilos adicionais (se necessário).
│   └── styles.css      # Arquivo CSS para estilos personalizados.
└── js/                 # Diretório para scripts JavaScript.
    └── app.js          # Script principal que controla a lógica da aplicação.
```

Esta estrutura permite uma fácil navegação e manutenção do código. Você pode adicionar mais arquivos CSS ou JS conforme a necessidade para ampliar as funcionalidades.

---

Sinta-se à vontade para contribuir, reportar problemas ou indicar melhorias. Divirta-se usando a aplicação!
```
