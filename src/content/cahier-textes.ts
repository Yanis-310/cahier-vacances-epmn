// Textes affichés en ouverture (/preambule) et en clôture (/conclusion) du cahier.
// Chaque section a un intertitre facultatif ; chaque entrée de `paragraphs` devient un paragraphe.

export type TexteSection = {
  heading?: string;
  paragraphs: string[];
};

export type TexteCahier = {
  title: string;
  sections: TexteSection[];
  closing?: string;
};

export const PREAMBULE: TexteCahier = {
  title: "Bienvenue dans le Cahier de vacances des médiateurs professionnels !",
  sections: [
    {
      paragraphs: [
        "Ce cahier de vacances a été conçu pour vous permettre de retrouver, d'entretenir et de consolider les connaissances et les compétences acquises au cours de votre formation à la médiation professionnelle.",
        "Vous y trouverez 30 pages d'exercices, portant sur de nombreuses thématiques abordées pendant votre parcours de formation : la restitution de sens, l'identification des PIC, l'inversion être/avoir, les courants de pensée, les issues d'un conflit et bien d'autres encore.",
      ],
    },
    {
      heading: "À vous de choisir votre parcours !",
      paragraphs: [
        "Vous pouvez réaliser les exercices dans l'ordre qui vous convient, en les sélectionnant par thématique. Vous êtes entièrement libres de revenir sur un sujet, de vous entraîner plusieurs fois ou de privilégier les domaines que vous souhaitez approfondir.",
      ],
    },
    {
      heading: "Un exercice peut être recommencé autant de fois que vous le souhaitez.",
      paragraphs: [
        "Pour cela, il vous suffit de cliquer sur la case « Recommencer cet exercice », située en bas à gauche de la page concernée. Le curseur revient alors en haut du tableau et, après votre confirmation, seul l'exercice sélectionné est réinitialisé. Vos réponses aux autres exercices restent inchangées.",
      ],
    },
    {
      heading: "Et pour faire le point sur vos connaissances ?",
      paragraphs: [
        "Vous disposez également d'un espace « Évaluation », accessible à tout moment.",
        "Chaque évaluation comporte 20 questions, sélectionnées parmi celles que vous avez pu rencontrer au fil des exercices du cahier. C'est une manière de vérifier vos acquis, de mesurer votre progression et de repérer les thématiques sur lesquelles vous souhaitez encore vous entraîner.",
      ],
    },
    {
      paragraphs: [
        "Ce cahier est avant tout un outil d'entraînement que vous pouvez utiliser à votre rythme, sans contrainte de temps, et retrouver aussi souvent que vous le souhaitez.",
        "Nous vous souhaitons de belles découvertes, quelques remises en question et surtout beaucoup de plaisir à retrouver les outils et les raisonnements de la médiation professionnelle !",
      ],
    },
  ],
  closing: "À vous de jouer !",
};

// Encadré « retours » affiché sous le préambule ; l'adresse devient un lien mailto.
export const PREAMBULE_RETOURS = {
  heading: "Vos retours sont les bienvenus !",
  before:
    "Si vous souhaitez partager vos impressions, formuler des remarques, signaler une difficulté ou proposer des améliorations, n'hésitez pas à nous écrire à l'adresse suivante :",
  email: "A.lascoux@epmm.fr",
  after: "Vos observations nous permettront de faire évoluer ce cahier et de l'enrichir au fil du temps.",
};

export const CONCLUSION: TexteCahier = {
  title: "Déjà la dernière page !",
  sections: [
    {
      paragraphs: [
        "Merci d'avoir parcouru ce cahier de vacances ! Nous espérons que vous aurez pris autant de plaisir à réaliser ces exercices que nous en avons eu à les concevoir.",
        "Et puisque l'entraînement est toujours utile, n'hésitez pas à revenir sur les exercices et à tester régulièrement vos connaissances.",
      ],
    },
  ],
  closing: "À bientôt pour de nouveaux défis !",
};
