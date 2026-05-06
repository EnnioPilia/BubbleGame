# 🎮 BubbleGame – Projet Concours Simplon 2025

Jeu d’arcade web dynamique basé sur les réflexes et la précision où le joueur doit cliquer, éviter et survivre dans un environnement en accélération constante où chaque seconde compte.

## Contexte du projet

- Formation : **CDA Simplon Grenoble 2025**
- Projet concours inter-promotion.
- Récompensé pour le jeu le plus "fun".
- Le projet a été amélioré après le concours avec de nouvelles fonctionnalités.

---

## Jouer au jeu

Le jeu est accessible en ligne via Vercel :

[Lancer le jeu](https://bubble-game-ennio.vercel.app/)

---

##  Présentation

**BubbleGame** est un jeu d’arcade dynamique basé sur les réflexes et la précision, où chaque seconde compte.

Le joueur évolue dans un environnement en constante accélération, mêlant pression, prise de décision rapide et gestion du risque. Entre bulles à cliquer, pièges à éviter et bonus stratégiques, le jeu propose une expérience nerveuse et progressive.

Accessible grâce à plusieurs niveaux de difficulté, le jeu s’adapte à tous les profils tout en offrant un défi de plus en plus intense au fil de la partie. **Bubble Game** met l’accent sur le score, la réactivité et l’amélioration continue du joueur.

---

##  Logique du jeu

###   Gameplay

Le joueur doit :

- Cliquer sur les bulles normales pour gagner des points
- Éviter les bulles rouges : Game Over immédiat
- Ne pas rater les bulles normales : perte de vie
- Faire face à une difficulté croissante : accélération progressive du jeu
- Utiliser les items bonus pour faciliter le game play
- Survivre le plus longtemps possible pour maximiser son score

**Boucle principale :**  
Cliquer → Éviter → Survivre → Score

###  Système de bulles et bonus


####  Bulles normales
- Donnent des points
- Perte de vie si non cliquées

####  Bulles rouges pièges
- Provoquent un Game Over instantané

####  Bulles spéciales
- Nécessitent plusieurs clics
- Rapportent un point par clic

###  Items bonus
-  Cœur  → Récupére une vie
-  Sablier → Mode slow : ralentit temporairement le jeu
-  Cible  → Mode aimbot : vise automatiquement au clic
-  Etoile  → Mode bonus : bulles avec multiplicateur de score

---

##  Modes de difficulté

Les modes modifient les paramètres du jeu sans changer les règles :

- Vitesse des bulles
- Tailles des bulles
- Perte en efficacité des bonus 
- Fréquence des bonus 

| Mode   | Description |
|--------|------------|
| Easy   | Expérience accessible |
| Hard   | Challenge équilibré |
| Expert | Difficulté élevée |

---

##  Mode Training

- Permet de s'entraîner librement
- Pas de Game Over
- Vitesse et tailles des bulles augmenté selon la difficulté (Easy / Medium / Hard / Expert)

---

##  Interface utilisateur (UI)

- Menu principal interactif
- Popups dynamiques (classement , paramètres…)
- Interface fluide et responsive
  
---

## Système de configuration 

- Réglage du système audio : volume de la musique et des effets sonores
- Curseur personnalisables : choix du style et ajustement de la taille
- Sélection de différents fonds d’écran

---

## Système de score

- Sauvegarde automatique en LocalStorage
- Classement Top 10 par difficulté
- Tri décroissant

---

##  Système audio
- Musiques dynamiques :
  - Menu
  - Jeu
  - Dernière vie
  - Modes : Slow, AimBot, Star, Training

- Effets sonores :
  - Bulles : normales, spéciales, star
  - Items bonus
  - Erreur
  - Game Over

---

## Navigation clavier

Le jeu implémente un système de navigation clavier contextuel :

- `keyboardContext` définit l’état actuel (menu, pause, settings…)
- `selectedIndex` permet de naviguer dans les éléments interactifs
- gestion du focus automatique

Objectif :
→ améliorer l’accessibilité et l’expérience utilisateur

---

##  Stack technique

- **JavaScript ES6 Modules** 
- **HTML5**
- **CSS3** (animations, responsive, effets visuels)
- **LocalStorage** (scores + settings)
- **Vercel** (déploiement)

---

## Architecture

Le projet repose sur une architecture modulaire en **JavaScript ES6**, avec séparation claire des responsabilités (Single Responsibility) afin de garantir :
- Maintenabilité
- Lisibilité
- Extensibilité (ajout de nouveaux modes, bonus...)

### Structure des modules

- `Game.js` : cœur du jeu (gestion de l’état global, boucle de jeu, score, difficulté, activation des modes)
- `Bubble.js` : gestion des entités du jeu (types, comportement, interactions, cycle de vie)
- `popupManager.js` : gestion centralisée des popups et du focus clavier
- `cursor.js` : gestion du curseur personnalisé (affichage, interactions, configuration)
- `audio.js` : gestion du son (musique, effets, état global audio)
- `UI.js` : synchronisation de l’interface avec l’état du jeu
- `background.js` : gestion des backgrounds utilisateur
    
### Flux de fonctionnement

Le module `Game` orchestre la logique globale et pilote la boucle de jeu :
- gestion de l’état global (score, vies, difficulté)
- gestion des effets actifs (slow, star, aim…)
- génération des entités

`Game` instancie dynamiquement les objets `Bubble`

Chaque `Bubble` est autonome et gère son propre cycle de vie :
- spawn
- animation
- interaction utilisateur
- destruction
  
Les interactions utilisateur déclenchent :
- des mises à jour du score
- modifie les états du jeu (slow, star, aim…)

L’interface `UI.js` est synchronisée en temps réel avec l’état du jeu.

Les popups et la navigation clavier sont gérés indépendamment via `popupManager`

### Modélisation des entités

Les bulles sont modélisées via une classe `Bubble` :
- encapsulation du comportement (clic, effets, destruction)
- gestion autonome du cycle de vie
- adaptation dynamique selon le contexte de jeu (difficulté, bonus actifs via `Game`)

---

##  Installation

1. Cloner le projet :

```bash
git clone <https://github.com/EnnioPilia/BubbleGame.git>
cd bubble-game
```

2. Ouvrir le projet (Utiliser un serveur local, ex: **Live Server** sur VS Code) : 

```bash
index.html 
```

 Aucun build nécessaire (100% front vanilla)

---

## Lancer le jeu

- Entrer votre pseudo
- Cliquer sur **"PLAY"**
- Jouer 


---

##  Améliorations possibles

-  Backend pour leaderboard global
-  Mode multijoueur
-  Nouveaux power-ups
-  Animations avancées

---

##  Auteur

**Ennio Pilia**  
Développeur Fullstack

---

##  Licence

Projet pédagogique – Simplon Grenoble 2025
