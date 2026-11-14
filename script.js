// Estações agrícolas padrão
const DEFAULT_CITIES = [
  { name: "Irecê - BA", lat: -11.3042, lon: -41.8558 },
  { name: "Ibititá - BA", lat: -11.5472, lon: -41.9756 },
  { name: "Barreiras - BA", lat: -12.1528, lon: -44.9900 },
  { name: "Petrolina - PE", lat: -9.3891, lon: -40.5030 },
  { name: "Luís Eduardo Magalhães - BA", lat: -12.0964, lon: -45.7869 }
];

// Catálogo de culturas e parâmetros agroclimáticos
const CROPS_CATALOG = [
  {
    id: "citros",
    name: "Limão e Laranja (Citros)",
    category: "Fruticultura",
    tMin: 20,
    tMax: 32,
    waterNeedMm90d: 250,
    droughtTolerance: "Média",
    notes: "Excelente resposta a alporquia e mudas aclimatadas; em períodos secos, cobertura morta com folhas secas e rega localizada mantêm a florada."
  },
  {
    id: "manga",
    name: "Manga",
    category: "Fruticultura",
    tMin: 22,
    tMax: 34,
    waterNeedMm90d: 180,
    droughtTolerance: "Alta",
    notes: "Adapta-se muito bem ao semiárido; um período de estresse hídrico moderado antes da floração estimula a produção de frutos doces."
  },
  {
    id: "goiaba",
    name: "Goiaba",
    category: "Fruticultura",
    tMin: 20,
    tMax: 32,
    waterNeedMm90d: 220,
    droughtTolerance: "Média-Alta",
    notes: "Rústica e com ótimo pegamento por alporquia; responde rápido à adubação orgânica com esterco curtido e irrigação complementar."
  },
  {
    id: "maracuja",
    name: "Maracujá",
    category: "Fruticultura",
    tMin: 21,
    tMax: 32,
    waterNeedMm90d: 260,
    droughtTolerance: "Média",
    notes: "Exige alta insolação e solo bem drenado (terra vermelha adubada); pede proteção contra ventos fortes e rega constante."
  },
  {
    id: "uva",
    name: "Uva (Videira)",
    category: "Fruticultura",
    tMin: 20,
    tMax: 33,
    waterNeedMm90d: 200,
    droughtTolerance: "Média-Alta",
    notes: "Baixa umidade relativa reduz doenças fúngicas nas folhas; estacas enraizadas desenvolvem alto teor de açúcar sob sol pleno."
  },
  {
    id: "feijao",
    name: "Feijão e Milho",
    category: "Grãos",
    tMin: 18,
    tMax: 30,
    waterNeedMm90d: 280,
    droughtTolerance: "Baixa-Média",
    notes: "Ideais para a janela chuvosa; exigem umidade regular no solo durante o florescimento e enchimento de grãos."
  },
  {
    id: "mandioca",
    name: "Mandioca e Mamona",
    category: "Raízes / Oleaginosas",
    tMin: 20,
    tMax: 35,
    waterNeedMm90d: 140,
    droughtTolerance: "Muito Alta",
    notes: "Altíssima resistência à estiagem e ao déficit hídrico elevado, aproveitando qualquer recarga de chuva no solo."
  },
  {
    id: "cebola",
    name: "Cebola e Hortaliças",
    category: "Horticultura",
    tMin: 16,
    tMax: 28,
    waterNeedMm90d: 240,
    droughtTolerance: "Baixa",
    notes: "Tradição regional com irrigação; prefere temperaturas amenas à noite e controle rigoroso da lâmina de água."
  },
  {
    id: "milho",
    name: "Milho Verde",
    category: "Grãos",
    tMin: 20,
    tMax: 30,
    waterNeedMm90d: 300,
    droughtTolerance: "Baixa",
    notes: "Exige boa umidade no solo durante o pendoamento e enchimento de grãos; prefere solos férteis."
  },
  {
    id: "tomate",
    name: "Tomate",
    category: "Horticultura",
    tMin: 18,
    tMax: 27,
    waterNeedMm90d: 320,
    droughtTolerance: "Baixa",
    notes: "Exige irrigação regular e solo bem drenado; alta sensibilidade a excesso de umidade nas folhas e oscilações bruscas de água."
  }
];

let savedCities = JSON.parse(localStorage.getItem("agroclima_cities")) || DEFAULT_CITIES;
let currentCity = savedCities[0];
let rawDailyData = null;
let selectedCrop = CROPS_CATALOG[0];

// Instâncias dos gráficos
let tempChartInstance = null;
let waterChartInstance = null;
let histChartInstance = null;

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  renderQuickCities();
  loadClimateData(currentCity.lat, currentCity.lon, currentCity.name);

  document.getElementById("searchBtn").addEventListener("click", handleCitySearch);
  document.getElementById("citySearchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleCitySearch();
  });

  document.getElementById("saveCityBtn").addEventListener("click", saveCurrentCity);
  document.getElementById("windowSelect").addEventListener("change", updateDashboard);
});

// Renderiza os botões de cidades rápidas
function renderQuickCities() {
  const container = document.getElementById("quickCitiesContainer");
  container.innerHTML = "";

  savedCities.forEach((city) => {
    const isActive = city.name === currentCity.name;
    const btn = document.createElement("button");
    btn.className = `px-3 py-1.5 rounded-full text-xs font-medium border transition shrink-0 ${
      isActive
        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
    }`;
    btn.textContent = `📍 ${city.name}`;
    btn.addEventListener("click", () => {
      currentCity = city;
      renderQuickCities();
      loadClimateData(city.lat, city.lon, city.name);
    });
    container.appendChild(btn);
  });
}

// Busca coordenadas na API de Geocoding da Open-Meteo
async function handleCitySearch() {
  const input = document.getElementById("citySearchInput");
  const rawQuery = input.value.trim();
  if (!rawQuery) return;

  // Limpa sufixos como "- Bahia" ou "- BA" para melhorar a precisão da busca
  const cleanName = rawQuery.split(/[-,/]/)[0].trim();

  try {
    document.getElementById("activeLocationTitle").textContent = `Buscando "${rawQuery}"...`;
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanName)}&count=5&language=pt&format=json`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      alert("Município não encontrado. Tente digitar apenas o nome da cidade.");
      return;
    }

    const place = data.results[0];
    const stateAbbr = place.admin1 ? ` - ${place.admin1}` : "";
    const formattedName = `${place.name}${stateAbbr}`;

    currentCity = {
      name: formattedName,
      lat: place.latitude,
      lon: place.longitude
    };

    renderQuickCities();
    loadClimateData(currentCity.lat, currentCity.lon, currentCity.name);
  } catch (err) {
    console.error("Erro ao buscar cidade:", err);
    alert("Erro ao conectar com o serviço de busca de cidades.");
  }
}

// Salva a cidade atual nos atalhos (localStorage)
function saveCurrentCity() {
  const exists = savedCities.some((c) => c.name.toLowerCase() === currentCity.name.toLowerCase());
  if (!exists) {
    savedCities.push(currentCity);
    localStorage.setItem("agroclima_cities", JSON.stringify(savedCities));
    renderQuickCities();
  }
}

// Carrega dados meteorológicos reais da Open-Meteo
async function loadClimateData(lat, lon, label) {
  try {
    document.getElementById("activeLocationTitle").textContent = label;
    document.getElementById("activeLocationMeta").textContent = `Coordenadas: ${lat.toFixed(4)}°, ${lon.toFixed(4)}° • Sincronizando API Open-Meteo...`;

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,et0_fao_evapotranspiration&timezone=America%2FSao_Paulo&past_days=92&forecast_days=14`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    rawDailyData = data.daily;
    updateDashboard();
  } catch (err) {
    console.error("Erro ao carregar clima:", err);
    document.getElementById("activeLocationMeta").textContent = "Falha ao carregar dados da API. Verifique sua conexão.";
  }
}

// Filtra a janela selecionada e atualiza estatísticas, culturas e gráficos
function updateDashboard() {
  if (!rawDailyData) return;

  const windowType = document.getElementById("windowSelect").value;
  const totalLen = rawDailyData.time.length; // ~106 dias (92 passados + 14 futuros)
  const todayIndex = totalLen - 14;

  let startIdx = 0;
  let endIdx = totalLen;

  if (windowType === "past90") {
    startIdx = Math.max(0, todayIndex - 90);
    endIdx = todayIndex;
  } else if (windowType === "past30") {
    startIdx = Math.max(0, todayIndex - 30);
    endIdx = todayIndex;
  } else if (windowType === "forecast14") {
    startIdx = todayIndex;
    endIdx = totalLen;
  }

  const dates = [];
  const tMax = [];
  const tMin = [];
  const tMean = [];
  const rain = [];
  const et0 = [];

  for (let i = startIdx; i < endIdx; i++) {
    const maxVal = rawDailyData.temperature_2m_max[i];
    const minVal = rawDailyData.temperature_2m_min[i];
    if (maxVal === null || minVal === null) continue;

    const meanVal = rawDailyData.temperature_2m_mean[i] !== null
      ? rawDailyData.temperature_2m_mean[i]
      : (maxVal + minVal) / 2;

    dates.push(formatDateBR(rawDailyData.time[i]));
    tMax.push(maxVal);
    tMin.push(minVal);
    tMean.push(Number(meanVal.toFixed(1)));
    rain.push(rawDailyData.precipitation_sum[i] || 0);
    et0.push(rawDailyData.et0_fao_evapotranspiration[i] || 0);
  }

  const stats = calculateDescriptiveStats(tMean, tMax, tMin, rain, et0);
  renderStatsCards(stats, dates.length);
  renderCropRecommendations(stats, tMean);
  renderCharts(dates, tMax, tMean, tMin, rain, et0);
  renderMonthlyHistory(rawDailyData);
}

// Funções de Estatística Descritiva
function calculateDescriptiveStats(tMean, tMax, tMin, rain, et0) {
  const n = tMean.length;
  const sumMean = tMean.reduce((acc, v) => acc + v, 0);
  const mean = sumMean / n;

  const sorted = [...tMean].sort((a, b) => a - b);
  const mid = Math.floor(n / 2);
  const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  const variance = tMean.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const cv = (stdDev / mean) * 100;

  const absMax = Math.max(...tMax);
  const absMin = Math.min(...tMin);
  const amplitude = absMax - absMin;

  const rainSum = rain.reduce((acc, v) => acc + v, 0);
  const rainyDays = rain.filter((v) => v >= 1.0).length;
  const et0Sum = et0.reduce((acc, v) => acc + v, 0);
  const waterBalance = rainSum - et0Sum;

  return {
    n,
    mean,
    median,
    stdDev,
    cv,
    absMax,
    absMin,
    amplitude,
    rainSum,
    rainyDays,
    et0Sum,
    waterBalance
  };
}

function renderStatsCards(stats, count) {
  document.getElementById("sampleSizeBadge").textContent = `Amostra: n = ${count} dias`;
  document.getElementById("activeLocationMeta").textContent =
    `Coordenadas: ${currentCity.lat.toFixed(3)}°, ${currentCity.lon.toFixed(3)}° • Mín absoluta: ${stats.absMin.toFixed(1)}°C | Máx absoluta: ${stats.absMax.toFixed(1)}°C`;

  document.getElementById("statMeanTemp").textContent = `${stats.mean.toFixed(1)} °C`;
  document.getElementById("statMedianTemp").textContent =
    `Mediana: ${stats.median.toFixed(1)} °C | Amplitude: ${stats.amplitude.toFixed(1)} °C`;

  document.getElementById("statStdTemp").textContent = `±${stats.stdDev.toFixed(2)} °C`;
  document.getElementById("statCvTemp").textContent =
    `Coef. de Variação (CV): ${stats.cv.toFixed(1)}% (${stats.cv < 10 ? "Clima Estável" : "Oscilação Moderada"})`;

  document.getElementById("statRainSum").textContent = `${stats.rainSum.toFixed(1)} mm`;
  document.getElementById("statRainDays").textContent = `Dias chuvosos (≥ 1 mm): ${stats.rainyDays} dias`;

  const balEl = document.getElementById("statWaterBalance");
  const sign = stats.waterBalance >= 0 ? "+" : "";
  balEl.textContent = `${sign}${stats.waterBalance.toFixed(1)} mm`;
  balEl.className = `text-2xl font-bold mt-1 ${stats.waterBalance >= 0 ? "text-emerald-400" : "text-amber-400"}`;

  document.getElementById("statEt0Sum").innerHTML = `Demanda ET<sub>0</sub> acumulada: ${stats.et0Sum.toFixed(1)} mm`;
}

// Motor de Aptidão Agrícola
function renderCropRecommendations(stats, tMeanArray) {
  const grid = document.getElementById("cropCardsGrid");
  grid.innerHTML = "";

  // Ajusta exigência hídrica proporcionalmente ao número de dias analisados
  const periodFactor = stats.n / 90;

  CROPS_CATALOG.forEach((crop) => {
    const daysInComfort = tMeanArray.filter((t) => t >= crop.tMin && t <= crop.tMax).length;
    const comfortPct = Math.round((daysInComfort / stats.n) * 100);
    const scaledWaterNeed = crop.waterNeedMm90d * periodFactor;

    let badgeText = "";
    let badgeClass = "";

    if (comfortPct >= 70 && stats.rainSum >= scaledWaterNeed * 0.8) {
      badgeText = "Ideal em Sequeiro";
      badgeClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    } else if (comfortPct >= 65) {
      badgeText = "Ideal com Irrigação";
      badgeClass = "bg-sky-500/20 text-sky-300 border-sky-500/40";
    } else {
      badgeText = "Exige Manejo Térmico";
      badgeClass = "bg-amber-500/20 text-amber-300 border-amber-500/40";
    }

    const isSelected = selectedCrop.id === crop.id;
    const card = document.createElement("div");
    card.className = `p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-2 ${
      isSelected
        ? "bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/50"
        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
    }`;

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-2">
          <div>
            <span class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">${crop.category}</span>
            <h4 class="text-sm font-bold text-white">${crop.name}</h4>
          </div>
          <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${badgeClass}">
            ${badgeText}
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-2 leading-relaxed">${crop.notes}</p>
      </div>
      <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
        <span>Faixa Ótima: <strong>${crop.tMin}°C a ${crop.tMax}°C</strong></span>
        <span class="text-emerald-400 font-semibold">${comfortPct}% dos dias na faixa</span>
      </div>
    `;

    card.addEventListener("click", () => {
      selectedCrop = crop;
      document.getElementById("selectedCropIndicator").textContent = `Cultura ativa: ${crop.name}`;
      updateDashboard();
    });

    grid.appendChild(card);
  });
}

// Renderiza os 3 gráficos usando símbolos Unicode limpos (sem cifrões LaTeX)
function renderCharts(dates, tMax, tMean, tMin, rain, et0) {
  const ctxTemp = document.getElementById("tempChart").getContext("2d");
  const ctxWater = document.getElementById("waterChart").getContext("2d");
  const ctxHist = document.getElementById("histChart").getContext("2d");

  if (tempChartInstance) tempChartInstance.destroy();
  if (waterChartInstance) waterChartInstance.destroy();
  if (histChartInstance) histChartInstance.destroy();

  const cropMaxLine = Array(dates.length).fill(selectedCrop.tMax);
  const cropMinLine = Array(dates.length).fill(selectedCrop.tMin);

  // 1. Gráfico de Série Temporal de Temperatura
  tempChartInstance = new Chart(ctxTemp, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Temp. Máxima (°C)",
          data: tMax,
          borderColor: "#f97316",
          backgroundColor: "transparent",
          borderWidth: 2,
          pointRadius: 1.5,
          tension: 0.3
        },
        {
          label: "Temp. Média μ (°C)",
          data: tMean,
          borderColor: "#f8fafc",
          backgroundColor: "transparent",
          borderWidth: 2.5,
          pointRadius: 2,
          tension: 0.3
        },
        {
          label: "Temp. Mínima (°C)",
          data: tMin,
          borderColor: "#38bdf8",
          backgroundColor: "transparent",
          borderWidth: 2,
          pointRadius: 1.5,
          tension: 0.3
        },
        {
          label: `Limite Ótimo Máx (${selectedCrop.name}: ${selectedCrop.tMax}°C)`,
          data: cropMaxLine,
          borderColor: "#10b981",
          borderDash: [6, 6],
          borderWidth: 1.5,
          pointRadius: 0
        },
        {
          label: `Limite Ótimo Mín (${selectedCrop.name}: ${selectedCrop.tMin}°C)`,
          data: cropMinLine,
          borderColor: "#10b981",
          borderDash: [6, 6],
          borderWidth: 1.5,
          pointRadius: 0
        }
      ]
    },
    options: getCommonChartOptions("°C")
  });

  // 2. Gráfico de Balanço Hídrico (Precipitação vs ET₀)
  waterChartInstance = new Chart(ctxWater, {
    data: {
      labels: dates,
      datasets: [
        {
          type: "line",
          label: "Evapotranspiração ET₀ (mm/dia)",
          data: et0,
          borderColor: "#f43f5e",
          backgroundColor: "rgba(244, 63, 94, 0.1)",
          borderWidth: 2,
          pointRadius: 1,
          tension: 0.3,
          fill: true
        },
        {
          type: "bar",
          label: "Precipitação Diária (mm)",
          data: rain,
          backgroundColor: "#3b82f6",
          borderRadius: 4
        }
      ]
    },
    options: getCommonChartOptions(" mm")
  });

  // 3. Histograma de Frequência das Temperaturas Médias
  const bins = buildHistogramBins(tMean, 1.5);
  histChartInstance = new Chart(ctxHist, {
    type: "bar",
    data: {
      labels: bins.labels,
      datasets: [
        {
          label: "Frequência (Nº de dias)",
          data: bins.counts,
          backgroundColor: bins.midpoints.map((m) =>
            m >= selectedCrop.tMin && m <= selectedCrop.tMax ? "#10b981" : "#475569"
          ),
          borderRadius: 6
        }
      ]
    },
    options: getCommonChartOptions(" dias")
  });
}

function buildHistogramBins(values, step) {
  const min = Math.floor(Math.min(...values));
  const max = Math.ceil(Math.max(...values));
  const labels = [];
  const counts = [];
  const midpoints = [];

  for (let b = min; b < max; b += step) {
    const low = b;
    const high = b + step;
    const count = values.filter((v) => v >= low && (high >= max ? v <= high : v < high)).length;
    labels.push(`${low.toFixed(1)}–${high.toFixed(1)}°C`);
    counts.push(count);
    midpoints.push((low + high) / 2);
  }
  return { labels, counts, midpoints };
}

function getCommonChartOptions(unitSuffix) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        labels: { color: "#cbd5e1", font: { size: 11 } }
      }
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8", maxRotation: 45, minRotation: 45, font: { size: 10 } },
        grid: { color: "rgba(148, 163, 184, 0.08)" }
      },
      y: {
        ticks: {
          color: "#94a3b8",
          font: { size: 11 },
          callback: (val) => `${val}${unitSuffix}`
        },
        grid: { color: "rgba(148, 163, 184, 0.08)" }
      }
    }
  };
}

function formatDateBR(isoDate) {
  const parts = isoDate.split("-");
  return `${parts[2]}/${parts[1]}`;
}

function renderMonthlyHistory(rawDailyData) {
  const tbody = document.getElementById("monthlyTableBody");
  tbody.innerHTML = "";

  const monthsMap = {};

  rawDailyData.time.forEach((dateStr, i) => {
    const max = rawDailyData.temperature_2m_max[i];
    const min = rawDailyData.temperature_2m_min[i];
    if (max === null || min === null) return;

    const mean = rawDailyData.temperature_2m_mean[i] !== null
      ? rawDailyData.temperature_2m_mean[i]
      : (max + min) / 2;
    
    const rain = rawDailyData.precipitation_sum[i] || 0;
    const et0 = rawDailyData.et0_fao_evapotranspiration[i] || 0;

    const yearMonth = dateStr.substring(0, 7);

    if (!monthsMap[yearMonth]) {
      monthsMap[yearMonth] = {
        temps: [],
        maxs: [],
        rainSum: 0,
        et0Sum: 0
      };
    }

    monthsMap[yearMonth].temps.push(mean);
    monthsMap[yearMonth].maxs.push(max);
    monthsMap[yearMonth].rainSum += rain;
    monthsMap[yearMonth].et0Sum += et0;
  });

  const monthNames = {
    "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
    "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
    "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro"
  };

  const sortedKeys = Object.keys(monthsMap).sort();

  sortedKeys.forEach((ym) => {
    const data = monthsMap[ym];
    const [year, monthNum] = ym.split("-");
    const monthLabel = `${monthNames[monthNum] || monthNum}/${year}`;

    const n = data.temps.length;
    const meanTemp = data.temps.reduce((a, b) => a + b, 0) / n;
    const maxAbsolute = Math.max(...data.maxs);
    const balance = data.rainSum - data.et0Sum;

    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-800/40 transition";
    tr.innerHTML = `
      <td class="py-3 px-4 font-semibold text-white">${monthLabel}</td>
      <td class="py-3 px-4">${meanTemp.toFixed(1)} °C</td>
      <td class="py-3 px-4 text-orange-400">${maxAbsolute.toFixed(1)} °C</td>
      <td class="py-3 px-4 text-sky-400">${data.rainSum.toFixed(1)} mm</td>
      <td class="py-3 px-4 text-rose-400">${data.et0Sum.toFixed(1)} mm</td>
      <td class="py-3 px-4 font-semibold ${balance >= 0 ? "text-emerald-400" : "text-amber-400"}">
        ${balance >= 0 ? "+" : ""}${balance.toFixed(1)} mm
      </td>
    `;
    tbody.appendChild(tr);
  });
}
