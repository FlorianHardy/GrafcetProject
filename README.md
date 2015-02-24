# GrafcetToList

L'idée du projet :

Le Grafcet est un mode de représentation et d'analyse d'un automatisme.
C'est le langage graphique le plus utilisé par les automaticiens.
Parfois, les logiciels de programmation d'automate n'utilisent pas le Grafcet,
mais d'autres langages tels que le Ladder ou le LIST.
Le langage LIST est complexe car il se rapproche de l'assembleur.
De plus, l'étape de traduction manuelle est longue et complexe.
Ainsi, notre application permet de simplifier la vie des automaticiens, en traduisant leur Grafcet directement en LIST.
			
Description du projet :

Ce projet permet donc aux utilisateurs de transformer leur Grafcet en LIST, à travers une interface simple.

Membres de l'équipe :

- Florian Hardy : Réalisation du site web avec bootstrap et travail sur l'application.

- Emeric Leclair : Rédaction du cahier des charges et travail sur l'application.

- Paul Mégueule : Etat des lieux de l'existant et travail sur l'application.

Technologies utilisées :

- HTML5 / CSS3 / JavaScript

- Bootstrap

- Framework GoJs 

Utiliser l'application :

	1) Commencer par cliquer sur une étape
	2) En sélectionnant une des étapes, vous pouvez soit :
		- Ajouter une étape.
		- Réaliser une boucle vers une autre étape.
	3) Pour modifier le nom d'une action, d'une étape ou son numéro, il vous suffit de double-cliquer dessus.
	4) Le Grafcet convertit en LIST est automatiquement ajouté dans la zone de texte.
		Celle-ci est composée de 3 parties :
		- La première génère le code d'initialisation.
		- Le deuxième génère le code de la logique des étapes.
		- Le troisième génère le code des sorties.

Bugs connus :

- Dans le code des sorties, une sortie doit être initialisée qu'une seule fois.
- L'étape finale ne peut pas reboucler sur l'étape initiale.
- Avant ce rebouclage, la fin du Grafcet doit être une transition et non une étape.
