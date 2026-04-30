# 🎮 Bubble Game – Projet Concours Simplon 2025

Jeu web développé en JavaScript dans le cadre d’un projet de promotion **Concepteur Développeur d’Applications (CDA)** chez Simplon (2025).
Récompensé pour le jeu le plus "fun"

---

## Démo

Disponible en ligne via Vercel  
[Lancer le jeu](https://bubble-game-ennio.vercel.app/)

---

##  Présentation

**Bubble Game** est un jeu d’arcade dynamique basé sur les réflexes et la précision, où chaque seconde compte.

Le joueur évolue dans un environnement en constante accélération, mêlant pression, prise de décision rapide et gestion du risque. Entre bulles à cliquer, pièges à éviter et bonus stratégiques, le jeu propose une expérience nerveuse et progressive.

Accessible grâce à plusieurs niveaux de difficulté, le jeu s’adapte à tous les profils tout en offrant un défi de plus en plus intense au fil de la partie . **Bubble Game** met l’accent sur le score, la réactivité et l’amélioration continue du joueur.

---



##  Logique du jeu

###   Gameplay

Le joueur doit :

- Cliquer sur les bulles normales pour gagner des points
- Éviter les bulles rouges (Game Over immédiat)
- Ne pas rater les bulles normales (perte de vie)
- Faire face à une difficulté croissante : accélération progressive du jeu
- Des Items bonus à disposition pour aider le joueur 
- Survivre le plus longtemps possible pour maximiser le score



**Boucle principale :**  
Cliquer → Éviter → Survivre → Score

---

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
- Fréquence de spawn
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

- Menu principal
- Popups interactives
- Classement (Top 10 local)
- Paramètres :
  - Réglage du système audio (musique et effets sonores)
  - Curseur personnalisables 
  - Choix de différents fonds d’écran


---

## Système de score

- Sauvegarde automatique en LocalStorage
- Classement Top 10 par difficulté
- Tri décroissant
- Affichage dans une popup

---

##  Système audio
- Musiques dynamiques :
  - Menu
  - Gameplay
  - Stress (dernière vie)
  - Slow mode
  - AimBot mode
  - Star mode
  - Training mode

- Effets sonores :
  - Bulles (normales, spéciales, star...)
  - Items bonus
  - Erreur
  - Explosion Game Over

---

##  Stack technique

- **JavaScript (Vanilla ES6 Modules)**
- **HTML5**
- **CSS3 (animations, responsive, effets visuels)**
- **LocalStorage (scores + settings)**
- **Vercel (déploiement)**

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


##  Responsive

Le jeu est entièrement responsive :

- Desktop  
- Mobile  
- Tablette  

---

##  Améliorations possibles

-  Backend pour leaderboard global
-  Mode multijoueur
-  Nouveaux power-ups
-  Animations avancées

---

## Contexte du projet

- Formation : **CDA Simplon Grenoble 2025**
- Travail "concours" entre promotion 
- Récompensé parmi les meilleurs projets
- Le projet a été amélioré après le concours avec de nouvelles fonctionnalités, des optimisations et des ajustements de gameplay.

---

##  Auteur

**Ennio Pilia**  
Développeur Fullstack

---

##  Licence

Projet pédagogique – Simplon Grenoble 2025
