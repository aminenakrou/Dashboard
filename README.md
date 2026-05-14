# Dashboard — Taux de Suicide aux États-Unis (2000–2018)

> Tableau de bord interactif développé dans le cadre du projet Data Science — Polytech Lille 3A

**Live demo :** [https://aminenakrou.github.io/Dashboard/](https://aminenakrou.github.io/Dashboard/)

---

## Présentation

Ce projet est un tableau de bord web interactif permettant d'explorer et d'analyser les taux de suicide aux États-Unis entre 2000 et 2018, à partir des données publiques du **Centers for Disease Control and Prevention (CDC)**.

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Tableau de bord principal avec graphiques interactifs et KPI |
| `indicateurs.html` | Description et méthodologie des indicateurs |
| `analyse.html` | Analyse approfondie par thématique |

## Fonctionnalités

- **Chargement automatique** des données par défaut au démarrage
- **Import de fichiers CSV** personnalisés par glisser-déposer ou sélection
- **KPI animés** : taux moyen, pic historique, ratio H/F, augmentation sur 18 ans
- **5 visualisations interactives** avec filtres dynamiques :
  - Évolution du taux global (courbe avec remplissage)
  - Variation annuelle (barres rouge/vert)
  - Répartition par sexe (donut chart)
  - Répartition par tranche d'âge (donut chart)
  - Répartition par origine ethnique (barres horizontales)
- **Sidebar collapsible** et design responsive

## Technologies

- HTML5 / CSS3 / JavaScript (vanilla)
- [Plotly.js](https://plotly.com/javascript/) — visualisation interactive
- [Bootstrap Icons](https://icons.getbootstrap.com/) — icônes
- CSS Grid & Variables CSS — layout et design system

## Structure du projet

```
Dashboard/
├── index.html           # Tableau de bord principal
├── analyse.html         # Page d'analyse
├── indicateurs.html     # Page des indicateurs
├── data/
│   └── suicide.csv      # Données CDC (2000–2018)
├── css/
│   └── dashboard.css    # Design system complet
├── js/
│   ├── suicide.js       # Logique des graphiques
│   ├── readfile.js      # Parsing CSV et upload
│   └── plotly-2.18.0.min.js
└── img/
    └── logo_ecole.png
```

## Format des données

Le fichier CSV doit contenir les colonnes suivantes :

```
STUB_NAME, STUB_LABEL, YEAR, AGE, ESTIMATE
```

- **STUB_NAME** : catégorie (`Total`, `Sex`, `Age`, `Sex and race`)
- **STUB_LABEL** : valeur de la catégorie (ex. `Male`, `Female`, `5-14 years`…)
- **YEAR** : année (2000–2018)
- **AGE** : tranche d'âge ou `All ages`
- **ESTIMATE** : taux de suicide pour 100 000 habitants

Source originale : [data.gov — CDC Suicide Death Rates](https://catalog.data.gov/dataset/death-rates-for-suicide-by-sex-race-hispanic-origin-and-age-united-states-020c1)

## Auteurs

**Hajar Mahmoudi** & **Amine Nakrou**  
Polytech Lille — 3ème année Ingénierie des Données
