# AgroClima Stat - Estatística Climática e Aptidão Agrícola

Aplicação web interativa para análise estatística de dados meteorológicos e recomendação de culturas agrícolas em tempo real, utilizando a API pública **Open-Meteo**.

## Funcionalidades

- **Estatística Descritiva Aplicada:** Cálculo automático de temperatura média (μ), mediana, amplitude térmica, desvio padrão (σ) e coeficiente de variação (CV%).
- **Balanço Hídrico Climatológico:** Comparação diária e acumulada entre a precipitação pluvial (mm) e a evapotranspiração de referência FAO (ET0).
- **Motor de Aptidão Agrícola:** Avaliação da frequência de dias dentro da zona de conforto térmico para fruticultura (limão, laranja, manga, goiaba, maracujá e uva), grãos (feijão e milho), raízes (mandioca) e hortaliças (cebola).
- **Visualização de Dados:** Gráficos de série temporal com faixa ótima por cultura, balanço hídrico diário e histograma de distribuição de frequência.
- **Busca Global de Municípios:** Pesquisa integrada de cidades com salvamento rápido no navegador (`localStorage`).

## Tecnologias Utilizadas

- **HTML5 e CSS3** (Estilização responsiva em modo escuro via Tailwind CSS)
- **JavaScript (ES6+)** (Cálculos estatísticos e consumo de API via `fetch`)
- **Chart.js** (Renderização dos gráficos interativos)
- **Open-Meteo API** (Dados meteorológicos históricos e previsão de 14 dias)

## Estrutura de Arquivos

- `index.html` - Estrutura principal da página e cartões de indicadores.
- `style.css` - Ajustes visuais e dimensionamento responsivo dos gráficos.
- `script.js` - Lógica estatística, catálogo de culturas e integração com a API.
- `README.md` - Documentação do projeto.

## Como Acessar o Site

Acesse a ferramenta diretamente pelo navegador (celular ou computador) através do link oficial:
👉 **[https://SEU-USUARIO.github.io/agroclima-stat/](https://SEU-USUARIO.github.io/agroclima-stat/)**

---

## Como Rodar o Código Localmente (Para Desenvolvedores)

Caso queira baixar o código-fonte para estudar ou modificar no seu computador:

1. Clone este repositório:
   ```bash
   git clone [https://github.com/SEU-USUARIO/agroclima-stat.git](https://github.com/SEU-USUARIO/agroclima-stat.git)
