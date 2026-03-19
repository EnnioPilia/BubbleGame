# 🎮 Bubble Game – Projet Concours Simplon 2025

Jeu web développé en JavaScript dans le cadre d’un projet de promotion **Concepteur Développeur d’Applications (CDA)** chez Simplon (2025).

Récompensé pour le jeu le plus "fun"

---

##  Présentation

**Bubble Game** est un jeu d’arcade rapide et addictif basé sur les réflexes.

Le joueur doit :

-  Cliquer sur les bonnes bulles (vertes)
-  Éviter les mauvaises bulles (rouges)
-  Réagir rapidement à une difficulté croissante
-  Gérer ses vies limitées
-  Obtenir le meilleur score possible

---

##  Gameplay

- Les bulles apparaissent aléatoirement à l’écran
- Leur vitesse augmente avec le score
- Si une bonne bulle n’est pas cliquée → perte de vie
- Si une mauvaise bulle est cliquée → **Game Over immédiat**

---

##  Fonctionnalités

-  Gameplay dynamique en temps réel  
-  Difficulté progressive (vitesse des bulles)  
-  Effets sonores (explosion, erreur, stress, game over)  
-  Système de vies avec feedback visuel  
-  Classement des scores (Top 10)  
-  Sauvegarde des scores en **LocalStorage**  
-  Saisie du nom du joueur  
-  Affichage du ranking  
-  Bouton restart  
-  Responsive design  

---

##  Logique du jeu

###  Bubble

- Génération aléatoire (taille, position)
- 45% de bulles "pièges" (rouges)
- Animation verticale (du bas vers le haut)
- Destruction automatique ou au clic

### Game

- Gestion du score
- Gestion des vies
- Accélération progressive
- Détection des bulles ratées
- Gestion du Game Over
- Système de classement

---

##  Stack technique

- **JavaScript (Vanilla)**
- **HTML5**
- **CSS3 (animations, responsive)**
- **LocalStorage (scores)**

---

##  Sons utilisés

- Explosion bulle
- Erreur
- Stress (dernière vie)
- Game Over

---

##  Installation

1. Cloner le projet :

```bash
git clone <repo-url>
cd bubble-game
```

2. Ouvrir le fichier :

```bash
index.html
```

 Aucun build nécessaire (100% front vanilla)

---

##  Lancer le jeu

- Cliquer sur **Start**
- Entrer un pseudo
- Jouer 

---

##  Système de score

- Sauvegarde automatique
- Classement Top 10
- Tri décroissant
- Affichage dans une modal

---

##  Responsive

Le jeu est entièrement responsive :

- Desktop   
- Tablette   
- Mobile  

---

## Améliorations possibles

- Backend pour leaderboard global
- Mode multijoueur
- Niveaux / progression
- Power-ups
- Animations avancées
- Sons dynamiques

---

##  Contexte du projet

- Formation : **Simplon CDA 2025**
- Travail en promotion (2 groupes)
- Projet présenté en concours
- Sélection parmi les meilleurs projets

---

##  Auteur

**Ennio Pilia**  
Développeur Fullstack

---

## 📄 Licence

Projet pédagogique – Simplon 2025
