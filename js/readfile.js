var CSVcontent = null;

/* =========================================
   Parsing CSV
   ========================================= */
function parseCsvLine(line) {
  return line.split(',').map(function(v) { return v.replace(/"/g, '').trim(); });
}

function parseCsvText(text) {
  var lines = text.split('\n').map(function(l) { return l.replace(/\r$/, ''); });
  if (lines.length < 2) throw new Error('Fichier CSV trop court ou vide.');
  var headers = parseCsvLine(lines[0]);
  var people = [];
  for (var i = 1; i < lines.length; i++) {
    var vals = parseCsvLine(lines[i]);
    if (vals.length < headers.length || vals.every(function(v) { return v === ''; })) continue;
    var obj = {};
    headers.forEach(function(h, j) { obj[h] = vals[j] || ''; });
    people.push(obj);
  }
  if (people.length === 0) throw new Error('Aucune donnée valide trouvée dans le fichier CSV.');
  return people;
}

/* =========================================
   UI helpers
   ========================================= */
function showStatus(msg, type) {
  var el = document.getElementById('uploadStatus');
  if (!el) return;
  el.textContent = msg;
  el.className = 'upload-status ' + type;
}

function setFileInfo(text, hasFile) {
  var el = document.getElementById('fileInfo');
  if (!el) return;
  el.textContent = text;
  el.className = 'file-info' + (hasFile ? ' has-file' : '');
}

function enableLoadBtn(enabled) {
  var btn = document.getElementById('load_btn');
  if (btn) btn.disabled = !enabled;
}

/* =========================================
   Auto-chargement du CSV par défaut
   ========================================= */
function autoLoadDefault() {
  showStatus('Chargement des données par défaut…', 'info');

  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'data/suicide.csv', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;
    /* status 0 = succès local sur file://, 200 = succès HTTP */
    if (xhr.status === 200 || xhr.status === 0) {
      if (!xhr.responseText) {
        showStatus('Fichier par défaut vide. Importez un fichier CSV.', 'error');
        return;
      }
      CSVcontent = xhr.responseText;
      enableLoadBtn(true);
      try {
        var data = parseCsvText(CSVcontent);
        run(data);
        showStatus('Données 2000–2018 chargées automatiquement (' + data.length + ' entrées).', 'success');
        setFileInfo('suicide.csv — données par défaut (' + data.length + ' entrées)', true);
      } catch (e) {
        showStatus('Erreur lors du parsing : ' + e.message, 'error');
      }
    } else {
      showStatus('Impossible de charger les données par défaut. Importez un fichier CSV manuellement.', 'error');
    }
  };
  xhr.onerror = function() {
    showStatus('Impossible de charger les données par défaut. Importez un fichier CSV manuellement.', 'error');
  };
  xhr.send();
}

/* =========================================
   Input fichier
   ========================================= */
function handleFile(file) {
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.csv')) {
    showStatus('Erreur : le fichier doit être au format CSV.', 'error');
    return;
  }
  var reader = new FileReader();
  reader.onload = function() {
    CSVcontent = reader.result;
    enableLoadBtn(true);
    var sizeKb = (file.size / 1024).toFixed(0);
    setFileInfo(file.name + ' (' + sizeKb + ' Ko)', true);
    showStatus('Fichier chargé. Cliquez sur « Lancer l\'analyse » pour mettre à jour les graphiques.', 'success');
  };
  reader.onerror = function() {
    showStatus('Erreur lors de la lecture du fichier.', 'error');
  };
  reader.readAsText(file);
}

/* Input */
var fileInput = document.getElementById('csv');
if (fileInput) {
  fileInput.addEventListener('change', function() {
    handleFile(this.files[0]);
  });
}

/* =========================================
   Bouton « Lancer l'analyse »
   ========================================= */
var loadBtn = document.getElementById('load_btn');
if (loadBtn) {
  loadBtn.addEventListener('click', function() {
    if (!CSVcontent) {
      showStatus('Aucun fichier sélectionné.', 'error');
      return;
    }
    try {
      var data = parseCsvText(CSVcontent);
      run(data);
      showStatus('Analyse mise à jour avec succès — ' + data.length + ' entrées traitées.', 'success');
    } catch (e) {
      showStatus('Erreur : ' + e.message, 'error');
    }
  });
}

/* =========================================
   Drag & Drop
   ========================================= */
var dropZone = document.getElementById('dropZone');
if (dropZone) {
  dropZone.addEventListener('dragenter', function(e) { e.preventDefault(); });
  dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', function(e) {
    if (!this.contains(e.relatedTarget)) this.classList.remove('drag-over');
  });
  dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    var file = e.dataTransfer.files[0];
    if (!file) return;
    handleFile(file);
  });
  /* Rend toute la zone cliquable pour ouvrir le sélecteur de fichier */
  dropZone.addEventListener('click', function(e) {
    if (e.target.tagName !== 'LABEL' && e.target.tagName !== 'INPUT') {
      var inp = document.getElementById('csv');
      if (inp) inp.click();
    }
  });
}

/* =========================================
   Lancement automatique au chargement
   ========================================= */
window.addEventListener('DOMContentLoaded', autoLoadDefault);
