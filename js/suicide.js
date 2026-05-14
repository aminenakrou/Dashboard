/* Palette de couleurs cohérente */
var COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#06b6d4', '#eab308', '#ef4444'];

/* Layout de base partagé par tous les graphiques */
var BASE_LAYOUT = {
  font: { family: 'Inter, Segoe UI, sans-serif', size: 12, color: '#475569' },
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  margin: { t: 24, b: 52, l: 54, r: 20 },
  xaxis: {
    gridcolor: '#e2e8f0',
    zerolinecolor: '#e2e8f0',
    linecolor: '#e2e8f0',
    tickfont: { size: 11 }
  },
  yaxis: {
    gridcolor: '#e2e8f0',
    zerolinecolor: '#cbd5e1',
    linecolor: '#e2e8f0',
    tickfont: { size: 11 }
  },
  hoverlabel: {
    bgcolor: '#1e293b',
    bordercolor: '#1e293b',
    font: { color: '#fff', size: 12, family: 'Inter, sans-serif' }
  }
};

var CONFIG = {
  responsive: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['select2d', 'lasso2d', 'zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d'],
  toImageButtonOptions: {
    format: 'png',
    filename: 'dashboard_chart',
    height: 500,
    width: 900,
    scale: 2
  }
};

/* Point d'entrée principal — appelé après chargement des données */
function run(all_datas) {
  compute_kpis(all_datas);
  taux_global(all_datas);
  variation_de_taux(all_datas);
  taux_sexe(all_datas);
  taux_age(all_datas);
  taux_origin(all_datas);
  populate_selects(all_datas);
}

/* =========================================
   KPI Cards
   ========================================= */
function compute_kpis(all_datas) {
  var total = all_datas.filter(function(d) { return d.STUB_NAME === 'Total'; });
  total.sort(function(a, b) { return +a.YEAR - +b.YEAR; });
  var estimates = total.map(function(d) { return +d.ESTIMATE; });

  if (estimates.length === 0) return;

  var avg = estimates.reduce(function(a, b) { return a + b; }, 0) / estimates.length;
  var peak = Math.max.apply(null, estimates);
  var first = estimates[0];
  var last = estimates[estimates.length - 1];
  var increase = ((last - first) / first) * 100;

  var males = all_datas.filter(function(d) { return d.STUB_NAME === 'Sex' && d.STUB_LABEL.trim() === 'Male'; });
  var females = all_datas.filter(function(d) { return d.STUB_NAME === 'Sex' && d.STUB_LABEL.trim() === 'Female'; });

  var avgMale = males.length ? males.reduce(function(a, b) { return a + +b.ESTIMATE; }, 0) / males.length : 0;
  var avgFemale = females.length ? females.reduce(function(a, b) { return a + +b.ESTIMATE; }, 0) / females.length : 1;
  var ratio = avgMale / avgFemale;

  animateKpi('kpi-avg', avg.toFixed(1));
  animateKpi('kpi-peak', peak.toFixed(1));
  animateKpi('kpi-ratio', ratio.toFixed(1) + 'x');
  animateKpi('kpi-increase', (increase >= 0 ? '+' : '') + increase.toFixed(0) + '%');
}

function animateKpi(id, finalValue) {
  var el = document.getElementById(id);
  if (!el) return;
  el.style.opacity = '0';
  el.style.transform = 'translateY(8px)';
  el.textContent = finalValue;
  setTimeout(function() {
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, 50);
}

/* =========================================
   Graphique 1 : Évolution globale
   ========================================= */
function taux_global(all_datas) {
  var taux_total = all_datas.filter(function(d) { return d.STUB_NAME === 'Total'; });
  taux_total.sort(function(a, b) { return +a.YEAR - +b.YEAR; });
  var years = taux_total.map(function(d) { return +d.YEAR; });
  var estimates = taux_total.map(function(d) { return +d.ESTIMATE; });

  var data = [{
    x: years,
    y: estimates,
    mode: 'lines+markers',
    type: 'scatter',
    line: { color: '#3b82f6', width: 3, shape: 'spline', smoothing: 0.8 },
    marker: { size: 6, color: '#fff', line: { color: '#3b82f6', width: 2 } },
    fill: 'tozeroy',
    fillcolor: 'rgba(59,130,246,0.08)',
    name: 'Taux global',
    hovertemplate: '<b>%{x}</b><br>Taux : %{y:.1f} / 100k<extra></extra>'
  }];

  var layout = Object.assign({}, BASE_LAYOUT, {
    xaxis: Object.assign({}, BASE_LAYOUT.xaxis, { title: { text: 'Année', standoff: 10 }, dtick: 2 }),
    yaxis: Object.assign({}, BASE_LAYOUT.yaxis, { title: { text: 'Taux / 100 000 hab.', standoff: 10 } }),
    showlegend: false
  });

  Plotly.newPlot('myplot_taux', data, layout, CONFIG);
}

/* =========================================
   Graphique 2 : Variation annuelle
   ========================================= */
function variation_de_taux(all_datas) {
  var taux_total = all_datas.filter(function(d) { return d.STUB_NAME === 'Total'; });
  taux_total.sort(function(a, b) { return +a.YEAR - +b.YEAR; });
  var years = taux_total.map(function(d) { return +d.YEAR; });
  var estimates = taux_total.map(function(d) { return +d.ESTIMATE; });

  var variations = [];
  var var_years = [];
  for (var i = 1; i < estimates.length; i++) {
    variations.push(((estimates[i] - estimates[i - 1]) / estimates[i - 1]) * 100);
    var_years.push(years[i]);
  }

  var bar_colors = variations.map(function(v) { return v >= 0 ? '#22c55e' : '#ef4444'; });
  var bar_line = variations.map(function(v) { return v >= 0 ? '#16a34a' : '#dc2626'; });

  var data = [{
    x: var_years,
    y: variations,
    type: 'bar',
    marker: {
      color: bar_colors,
      line: { color: bar_line, width: 1 }
    },
    hovertemplate: '<b>%{x}</b><br>Variation : %{y:.2f} %<extra></extra>'
  }];

  var layout = Object.assign({}, BASE_LAYOUT, {
    xaxis: Object.assign({}, BASE_LAYOUT.xaxis, { title: { text: 'Année', standoff: 10 }, dtick: 2 }),
    yaxis: Object.assign({}, BASE_LAYOUT.yaxis, { title: { text: 'Variation (%)', standoff: 10 }, zeroline: true }),
    showlegend: false,
    bargap: 0.25
  });

  Plotly.newPlot('myplot_évolution', data, layout, CONFIG);
}

/* =========================================
   Graphique 3 : Répartition par sexe (donut)
   ========================================= */
function taux_sexe(all_datas) {
  var taux_sex = all_datas.filter(function(d) { return d.STUB_NAME === 'Sex'; });
  var groupe_sex = {};
  taux_sex.forEach(function(d) {
    var sex = d.STUB_LABEL.trim();
    if (!groupe_sex[sex]) groupe_sex[sex] = { sum: 0, count: 0 };
    groupe_sex[sex].sum += +d.ESTIMATE;
    groupe_sex[sex].count++;
  });

  var labels = Object.keys(groupe_sex);
  var values = labels.map(function(s) { return groupe_sex[s].sum / groupe_sex[s].count; });

  var data = [{
    labels: labels,
    values: values,
    type: 'pie',
    hole: 0.48,
    textinfo: 'percent',
    textposition: 'inside',
    insidetextfont: { color: '#fff', size: 12, family: 'Inter, sans-serif' },
    marker: {
      colors: ['#3b82f6', '#f97316'],
      line: { color: '#fff', width: 3 }
    },
    hovertemplate: '<b>%{label}</b><br>Taux moy. : %{value:.1f}<br>%{percent}<extra></extra>'
  }];

  var layout = Object.assign({}, BASE_LAYOUT, {
    margin: { t: 20, b: 30, l: 20, r: 20 },
    showlegend: true,
    legend: {
      orientation: 'h',
      x: 0.5,
      y: -0.05,
      xanchor: 'center',
      font: { size: 12 }
    }
  });

  Plotly.newPlot('myplot_sexe', data, layout, CONFIG);
}

function nuage_sexe(groupe_sex, all_datas) {
  var filtered = all_datas.filter(function(d) {
    return d.STUB_NAME === 'Sex' && d.STUB_LABEL.trim() === groupe_sex;
  });
  filtered.sort(function(a, b) { return +a.YEAR - +b.YEAR; });
  var years = filtered.map(function(d) { return +d.YEAR; });
  var estimates = filtered.map(function(d) { return +d.ESTIMATE; });
  var color = groupe_sex === 'Male' ? '#3b82f6' : '#f97316';

  var data = [{
    x: years, y: estimates,
    mode: 'lines+markers',
    type: 'scatter',
    line: { color: color, width: 3, shape: 'spline', smoothing: 0.8 },
    marker: { size: 6, color: '#fff', line: { color: color, width: 2 } },
    fill: 'tozeroy',
    fillcolor: color === '#3b82f6' ? 'rgba(59,130,246,0.08)' : 'rgba(249,115,22,0.08)',
    name: groupe_sex,
    hovertemplate: '<b>%{x}</b><br>Taux : %{y:.1f}<extra></extra>'
  }];

  var layout = Object.assign({}, BASE_LAYOUT, {
    xaxis: Object.assign({}, BASE_LAYOUT.xaxis, { title: { text: 'Année', standoff: 10 }, dtick: 2 }),
    yaxis: Object.assign({}, BASE_LAYOUT.yaxis, { title: { text: 'Taux / 100 000', standoff: 10 } }),
    showlegend: false
  });

  Plotly.newPlot('myplot_sexe', data, layout, CONFIG);
}

/* =========================================
   Graphique 4 : Répartition par âge (donut)
   ========================================= */
function taux_age(all_datas) {
  var taux_age_data = all_datas.filter(function(d) { return d.STUB_NAME === 'Age'; });
  var groupe_age = {};
  var ordre = [];
  taux_age_data.forEach(function(d) {
    var label = d.STUB_LABEL.trim();
    var key = label.toLowerCase();
    if (ordre.indexOf(key) === -1) ordre.push(key);
    if (!groupe_age[key]) groupe_age[key] = { sum: 0, count: 0, label: label };
    groupe_age[key].sum += +d.ESTIMATE;
    groupe_age[key].count++;
  });

  var liste = ordre.map(function(k) {
    return { label: groupe_age[k].label, value: groupe_age[k].sum / groupe_age[k].count };
  });

  var data = [{
    labels: liste.map(function(p) { return p.label; }),
    values: liste.map(function(p) { return p.value; }),
    type: 'pie',
    hole: 0.48,
    textinfo: 'percent',
    textposition: 'inside',
    insidetextfont: { color: '#fff', size: 10, family: 'Inter, sans-serif' },
    marker: { colors: COLORS, line: { color: '#fff', width: 2 } },
    hovertemplate: '<b>%{label}</b><br>Taux moy. : %{value:.1f}<br>%{percent}<extra></extra>'
  }];

  var layout = Object.assign({}, BASE_LAYOUT, {
    margin: { t: 20, b: 30, l: 20, r: 20 },
    showlegend: true,
    legend: {
      orientation: 'h',
      x: 0.5,
      y: -0.05,
      xanchor: 'center',
      font: { size: 9 }
    }
  });

  Plotly.newPlot('myplot_age', data, layout, CONFIG);
}

function nuage_age(groupe_age, all_datas) {
  var filtered = all_datas.filter(function(d) {
    return d.STUB_NAME === 'Age' && d.STUB_LABEL.trim() === groupe_age;
  });
  filtered.sort(function(a, b) { return +a.YEAR - +b.YEAR; });
  var years = filtered.map(function(d) { return +d.YEAR; });
  var estimates = filtered.map(function(d) { return +d.ESTIMATE; });

  var data = [{
    x: years, y: estimates,
    mode: 'lines+markers',
    type: 'scatter',
    line: { color: '#a855f7', width: 3, shape: 'spline', smoothing: 0.8 },
    marker: { size: 6, color: '#fff', line: { color: '#a855f7', width: 2 } },
    fill: 'tozeroy',
    fillcolor: 'rgba(168,85,247,0.08)',
    hovertemplate: '<b>%{x}</b><br>Taux : %{y:.1f}<extra></extra>'
  }];

  var layout = Object.assign({}, BASE_LAYOUT, {
    xaxis: Object.assign({}, BASE_LAYOUT.xaxis, { title: { text: 'Année', standoff: 10 }, dtick: 2 }),
    yaxis: Object.assign({}, BASE_LAYOUT.yaxis, { title: { text: 'Taux / 100 000', standoff: 10 } }),
    showlegend: false
  });

  Plotly.newPlot('myplot_age', data, layout, CONFIG);
}

/* =========================================
   Graphique 5 : Répartition par origine (barres horizontales)
   ========================================= */
function taux_origin(all_datas) {
  var data_orig = all_datas.filter(function(d) { return d.STUB_NAME === 'Sex and race'; });
  var groupe = {};
  data_orig.forEach(function(d) {
    var parts = d.STUB_LABEL.split(':');
    var origin = parts.length > 1 ? parts[1].trim() : d.STUB_LABEL.trim();
    if (!groupe[origin]) groupe[origin] = { sum: 0, count: 0 };
    groupe[origin].sum += +d.ESTIMATE;
    groupe[origin].count++;
  });

  var items = Object.keys(groupe).map(function(k) {
    return { label: k, value: groupe[k].sum / groupe[k].count };
  }).sort(function(a, b) { return a.value - b.value });

  var labels = items.map(function(i) { return i.label; });
  var values = items.map(function(i) { return i.value; });
  var colors = values.map(function(_, i) { return COLORS[i % COLORS.length]; });

  var data = [{
    y: labels,
    x: values,
    type: 'bar',
    orientation: 'h',
    marker: {
      color: colors,
      line: { color: 'rgba(255,255,255,0.3)', width: 1 }
    },
    hovertemplate: '<b>%{y}</b><br>Taux moy. : %{x:.1f}<extra></extra>'
  }];

  var layout = Object.assign({}, BASE_LAYOUT, {
    margin: { t: 20, b: 40, l: 148, r: 20 },
    xaxis: Object.assign({}, BASE_LAYOUT.xaxis, { title: { text: 'Taux moyen / 100 000', standoff: 8 } }),
    yaxis: Object.assign({}, BASE_LAYOUT.yaxis, { tickfont: { size: 10 }, gridcolor: 'transparent' }),
    showlegend: false,
    bargap: 0.3
  });

  Plotly.newPlot('myplot_origin', data, layout, CONFIG);
}

function nuage_origin(groupe_origin, all_datas) {
  var filtered = all_datas.filter(function(d) {
    var parts = d.STUB_LABEL.split(':');
    var origin = parts.length > 1 ? parts[1].trim() : d.STUB_LABEL.trim();
    return d.STUB_NAME === 'Sex and race' && origin === groupe_origin;
  });

  var par_annee = {};
  filtered.forEach(function(d) {
    var y = +d.YEAR;
    if (!par_annee[y]) par_annee[y] = [];
    par_annee[y].push(+d.ESTIMATE);
  });

  var years = Object.keys(par_annee).map(Number).sort(function(a, b) { return a - b; });
  var avgs = years.map(function(y) {
    var vals = par_annee[y];
    return vals.reduce(function(a, b) { return a + b; }, 0) / vals.length;
  });

  var data = [{
    x: years, y: avgs,
    mode: 'lines+markers',
    type: 'scatter',
    line: { color: '#06b6d4', width: 3, shape: 'spline', smoothing: 0.8 },
    marker: { size: 6, color: '#fff', line: { color: '#06b6d4', width: 2 } },
    fill: 'tozeroy',
    fillcolor: 'rgba(6,182,212,0.08)',
    hovertemplate: '<b>%{x}</b><br>Taux moy. : %{y:.1f}<extra></extra>'
  }];

  var layout = Object.assign({}, BASE_LAYOUT, {
    xaxis: Object.assign({}, BASE_LAYOUT.xaxis, { title: { text: 'Année', standoff: 10 }, dtick: 2 }),
    yaxis: Object.assign({}, BASE_LAYOUT.yaxis, { title: { text: 'Taux / 100 000', standoff: 10 } }),
    showlegend: false
  });

  Plotly.newPlot('myplot_origin', data, layout, CONFIG);
}

/* =========================================
   Peupler les menus déroulants
   ========================================= */
function populate_selects(all_datas) {
  /* Sexe */
  var sel_sexe = document.getElementById('select_sexe');
  if (sel_sexe) {
    var genders = unique(all_datas.filter(function(d) { return d.STUB_NAME === 'Sex'; })
      .map(function(d) { return d.STUB_LABEL.trim(); }));
    clearSelect(sel_sexe);
    genders.forEach(function(g) { addOption(sel_sexe, g, g); });
    sel_sexe.onchange = function() {
      this.value ? nuage_sexe(this.value, all_datas) : taux_sexe(all_datas);
    };
  }

  /* Âge */
  var sel_age = document.getElementById('select_age');
  if (sel_age) {
    var ages = unique(all_datas.filter(function(d) { return d.STUB_NAME === 'Age'; })
      .map(function(d) { return d.STUB_LABEL.trim(); }));
    clearSelect(sel_age);
    ages.forEach(function(g) { addOption(sel_age, g, g); });
    sel_age.onchange = function() {
      this.value ? nuage_age(this.value, all_datas) : taux_age(all_datas);
    };
  }

  /* Origine */
  var sel_origin = document.getElementById('select_origin');
  if (sel_origin) {
    var origins = unique(all_datas.filter(function(d) { return d.STUB_NAME === 'Sex and race'; })
      .map(function(d) {
        var p = d.STUB_LABEL.split(':');
        return p.length > 1 ? p[1].trim() : d.STUB_LABEL.trim();
      }));
    clearSelect(sel_origin);
    origins.forEach(function(g) { addOption(sel_origin, g, g); });
    sel_origin.onchange = function() {
      this.value ? nuage_origin(this.value, all_datas) : taux_origin(all_datas);
    };
  }
}

/* Helpers */
function unique(arr) {
  return arr.filter(function(v, i, a) { return a.indexOf(v) === i; });
}

function clearSelect(sel) {
  while (sel.options.length > 1) sel.remove(1);
}

function addOption(sel, value, text) {
  var opt = document.createElement('option');
  opt.value = value;
  opt.textContent = text;
  sel.appendChild(opt);
}
