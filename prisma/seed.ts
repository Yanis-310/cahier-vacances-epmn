import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.evaluation.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.exercise.deleteMany();

  const exercises = [
  {
    "id": "a609c175-c96c-4227-93ab-9e4cf062974e",
    "number": 1,
    "title": "PIC+ et PIC-",
    "type": "single_choice",
    "content": {
      "options": [
        "P+",
        "P-",
        "I+",
        "I-",
        "C+",
        "C-"
      ],
      "questions": [
        {
          "id": 1,
          "text": "\"Tu es vraiment quelqu'un de fiable.\""
        },
        {
          "id": 2,
          "text": "\"Il veut me faire payer quelque chose.\""
        },
        {
          "id": 3,
          "text": "\"Tu as fait du bon travail, tu pourras partir plus tôt ce soir.\""
        },
        {
          "id": 4,
          "text": "\"Tu vas me rendre ce dossier immédiatement !\""
        },
        {
          "id": 5,
          "text": "\"Elle cherche à me nuire.\""
        },
        {
          "id": 6,
          "text": "\"C'est quelqu'un de créatif et dynamique.\""
        },
        {
          "id": 7,
          "text": "\"Merci d'avoir fermé la fenêtre, j'avais froid.\""
        },
        {
          "id": 8,
          "text": "\"Tais-toi !\""
        },
        {
          "id": 9,
          "text": "\"Tu fais exprès de me contredire.\""
        },
        {
          "id": 10,
          "text": "\"Elle fait toujours passer les autres avant elle.\""
        },
        {
          "id": 11,
          "text": "\"Il veut ma place, c'est évident.\""
        },
        {
          "id": 12,
          "text": "\"De toute façon, on ne peut faire confiance à personne.\""
        }
      ],
      "instruction": "Pour chaque phrase, identifiez s'il s'agit d'un PIC positif ou négatif et de quel type (P, I ou C)."
    },
    "answers": {
      "1": "I+",
      "2": "P-",
      "3": "C+",
      "4": "C-",
      "5": "P-",
      "6": "I+",
      "7": "C+",
      "8": "C-",
      "9": "P-",
      "10": "I+",
      "11": "P-",
      "12": "I-"
    }
  },
  {
    "id": "00cb7b57-720b-4f44-a877-ed8bcc9d9d09",
    "number": 2,
    "title": "Restitution de sens par inversion",
    "type": "free_text",
    "content": {
      "columns": {
        "left": "La personne dit",
        "right": "Le MP répond"
      },
      "questions": [
        {
          "id": 1,
          "text": "Ce qui me manque :"
        },
        {
          "id": 2,
          "text": "Ce que je crains :"
        },
        {
          "id": 3,
          "text": "Ce que je redoute :"
        },
        {
          "id": 4,
          "text": "J'ai peur de ne pas être à la hauteur :"
        },
        {
          "id": 5,
          "text": "Je ne suis pas en conflit avec :"
        },
        {
          "id": 6,
          "text": "Je ne supporte pas :"
        },
        {
          "id": 7,
          "text": "Cela m'est difficile de… :"
        },
        {
          "id": 8,
          "text": "Ce n'est pas quelque chose de désagréable pour moi :"
        },
        {
          "id": 9,
          "text": "Ce n'est pas impossible que je le fasse :"
        },
        {
          "id": 10,
          "text": "Je n'arriverai pas à :"
        }
      ],
      "instruction": "Pour chaque phrase dite par la personne, proposez une restitution de sens par inversion (reformulation positive)."
    },
    "answers": {
      "1": "vous auriez besoin de…",
      "2": "ce qui vous rassurerait…",
      "3": "ce que vous préféreriez…",
      "4": "vous auriez besoin d'être en confiance",
      "5": "vous avez de bonnes relations avec…",
      "6": "ce que vous aimeriez…",
      "7": "cela serait plus facile pour vous si…",
      "8": "vous voulez dire que vous pourriez en tirer du plaisir",
      "9": "vous voulez dire que vous pourriez le faire à certaines conditions",
      "10": "vous aimeriez avoir les moyens de…"
    }
  },
  {
    "id": "b71f484c-5b4d-424a-91dc-69def4300b05",
    "number": 3,
    "title": "Être et Avoir",
    "type": "free_text",
    "content": {
      "columns": {
        "left": "Phrase en \"être\"",
        "right": "Transformation en \"avoir\""
      },
      "questions": [
        {
          "id": 1,
          "text": "\"Je suis triste.\""
        },
        {
          "id": 2,
          "text": "\"Je suis épuisé.\""
        },
        {
          "id": 3,
          "text": "\"Je suis passionné.\""
        },
        {
          "id": 4,
          "text": "\"Je suis en colère.\""
        },
        {
          "id": 5,
          "text": "\"Je suis stressé.\""
        },
        {
          "id": 6,
          "text": "\"Je suis jaloux.\""
        },
        {
          "id": 7,
          "text": "\"Je suis frustré.\""
        },
        {
          "id": 8,
          "text": "\"Je suis motivé.\""
        },
        {
          "id": 9,
          "text": "\"Je suis anxieux.\""
        },
        {
          "id": 10,
          "text": "\"Je suis fier.\""
        }
      ],
      "instruction": "Transformez chaque phrase en \"être\" en une phrase en \"avoir\"."
    },
    "answers": {
      "1": "Vous avez de la peine par rapport à une situation.",
      "2": "Vous avez besoin de repos.",
      "3": "Vous avez un intérêt fort pour quelque chose.",
      "4": "Vous avez des attentes qui n'ont pas été satisfaites.",
      "5": "Vous avez des préoccupations qui vous envahissent.",
      "6": "Vous avez peur de perdre quelque chose ou quelqu'un.",
      "7": "Vous avez des besoins qui ne sont pas comblés.",
      "8": "Vous avez envie de vous investir dans quelque chose.",
      "9": "Vous avez des inquiétudes face à l'avenir.",
      "10": "Vous avez accompli quelque chose qui compte pour vous."
    }
  },
  {
    "id": "9cebc332-1836-4720-a08c-88583fec83a8",
    "number": 4,
    "title": "Les organisations de la profession",
    "type": "single_choice",
    "content": {
      "options": [
        "EPMN",
        "CPMN",
        "Viamediation",
        "CREISIR",
        "Officiel de la médiation",
        "Mediateur.tv",
        "Allomediateur.com",
        "Symposium"
      ],
      "questions": [
        {
          "id": 1,
          "text": "Organisme de formation des médiateurs professionnels"
        },
        {
          "id": 2,
          "text": "Organisation syndicale des médiateurs professionnels"
        },
        {
          "id": 3,
          "text": "Réseau professionnel de labellisation des entreprises"
        },
        {
          "id": 4,
          "text": "Centre de Recherche"
        },
        {
          "id": 5,
          "text": "Journal numérique des MP"
        },
        {
          "id": 6,
          "text": "WebTV des MP"
        },
        {
          "id": 7,
          "text": "Annuaire des MP"
        },
        {
          "id": 8,
          "text": "Événement annuel de la MP"
        }
      ],
      "instruction": "Pour chaque description, identifiez l'organisation correspondante."
    },
    "answers": {
      "1": "EPMN",
      "2": "CPMN",
      "3": "Viamediation",
      "4": "CREISIR",
      "5": "Officiel de la médiation",
      "6": "Mediateur.tv",
      "7": "Allomediateur.com",
      "8": "Symposium"
    }
  },
  {
    "id": "b5359d5c-361c-4677-93e9-3915be422211",
    "number": 5,
    "title": "Les issues d'un conflit",
    "type": "single_choice",
    "content": {
      "options": [
        "Résignation",
        "Domination",
        "Abandon",
        "Reprise",
        "Aménagement",
        "Rupture consensuelle"
      ],
      "questions": [
        {
          "id": 1,
          "text": "\"Je crains qu'il n'y ait pas d'autres solutions que d'envisager le licenciement\""
        },
        {
          "id": 2,
          "text": "\"C'est le licenciement, point barre\""
        },
        {
          "id": 3,
          "text": "\"Moi, je préfère me mettre en arrêt maladie en attendant\""
        },
        {
          "id": 4,
          "text": "\"Maintenant qu'on a échangé, je souhaite reprendre ma mission comme avant\""
        },
        {
          "id": 5,
          "text": "\"Je suis d'accord pour reprendre mon poste mais sur un autre site\""
        },
        {
          "id": 6,
          "text": "\"Moi aussi, je suis d'accord pour ce licenciement\""
        },
        {
          "id": 7,
          "text": "Choisir de ne plus travailler ensemble et continuer à jouer au foot"
        },
        {
          "id": 8,
          "text": "Faire le choix de ne plus se voir"
        },
        {
          "id": 9,
          "text": "Décider ensemble de changer de local pour être plus performant"
        },
        {
          "id": 10,
          "text": "Ne pas vouloir d'autres solutions que le divorce"
        },
        {
          "id": 11,
          "text": "Ne pas aller aux réunions par crainte"
        },
        {
          "id": 12,
          "text": "Ne pas oser donner son avis et accepter la solution par défaut"
        },
        {
          "id": 13,
          "text": "Divorcer et se mettre d'accord sur la garde des enfants"
        }
      ],
      "instruction": "Pour chaque situation, identifiez le type d'issue du conflit."
    },
    "answers": {
      "1": "Résignation",
      "2": "Domination",
      "3": "Abandon",
      "4": "Reprise",
      "5": "Aménagement",
      "6": "Rupture consensuelle",
      "7": "Aménagement",
      "8": "Rupture consensuelle",
      "9": "Aménagement",
      "10": "Domination",
      "11": "Abandon",
      "12": "Résignation",
      "13": "Aménagement"
    }
  },
  {
    "id": "18d2c930-295c-42a0-9adf-c739b5f4f65d",
    "number": 6,
    "title": "Les courants de pensée",
    "type": "single_choice",
    "content": {
      "legend": "CC = Confessionnel | CJ = Juridique | CP = Psychosociologique | CR = Rationnel",
      "options": [
        "CC (Confessionnel)",
        "CJ (Juridique)",
        "CP (Psychosociologique)",
        "CR (Rationnel)"
      ],
      "questions": [
        {
          "id": 1,
          "text": "Penser que la vie a été engendrée par une entité fictive dont l'autorité fluctue."
        },
        {
          "id": 2,
          "text": "Il existe des personnalités. Cette modélisation repose sur des représentations culturelles."
        },
        {
          "id": 3,
          "text": "L'individu peut être considéré comme un risque dans la relation."
        },
        {
          "id": 4,
          "text": "La résilience, le pardon, les prières permettent aux communautés de guérir."
        },
        {
          "id": 5,
          "text": "Il y a un cadre pour rappeler à tous les citoyens leurs responsabilités."
        },
        {
          "id": 6,
          "text": "Les personnes ne peuvent pas tout savoir. Elles peuvent apprendre."
        },
        {
          "id": 7,
          "text": "Je fais à l'autre ce qu'il aimerait que je lui fasse."
        }
      ],
      "instruction": "Pour chaque affirmation, identifiez le courant de pensée correspondant."
    },
    "answers": {
      "1": "CC (Confessionnel)",
      "2": "CP (Psychosociologique)",
      "3": "CP (Psychosociologique)",
      "4": "CC (Confessionnel)",
      "5": "CJ (Juridique)",
      "6": "CR (Rationnel)",
      "7": "CR (Rationnel)"
    }
  },
  {
    "id": "dbfaba31-c484-41f9-922f-963daa7ab36f",
    "number": 7,
    "title": "La reconnaissance",
    "type": "single_choice",
    "content": {
      "options": [
        "Légitimité de point de vue",
        "Légitimité d'action",
        "Légitimité d'intention",
        "Maladresse",
        "Ignorance",
        "Confusion identitaire",
        "FCR+",
        "FCR-"
      ],
      "questions": [
        {
          "id": 1,
          "text": "\"Vous avez une idée précise du fonctionnement d'un service\""
        },
        {
          "id": 2,
          "text": "\"Ce que vous dites c'est que vous avez mis en place un process que vous avez réfléchi et déjà expérimenté et vous aimeriez être reconnu pour cette compétence que vous avez mise au service de votre entreprise\""
        },
        {
          "id": 3,
          "text": "\"Lorsque vous mettez en place ce processus c'est pour améliorer le fonctionnement du service, optimiser les relations et permettre un engagement de chacun dans le projet de l'entreprise\""
        },
        {
          "id": 4,
          "text": "\"Sur le moment et dans le contexte où vous étiez, vous n'avez pas su dire les choses autrement...\""
        },
        {
          "id": 5,
          "text": "\"Ce que vous dites c'est que vous n'aviez pas tous les éléments pour prendre une décision éclairée...\""
        },
        {
          "id": 6,
          "text": "\"Lorsque vous avez mis ce processus en place dans votre service, vous n'avez pas jugé nécessaire de solliciter l'avis de vos collaborateurs...\""
        },
        {
          "id": 7,
          "text": "\"Quand votre partenaire prépare vos valises à chacun de vos déplacements, cela vous donne du temps...\""
        },
        {
          "id": 8,
          "text": "\"Ce que vous dites c'est que lorsque votre collaborateur vous a remis les documents à 14h alors que vous aviez convenu 9h...\""
        }
      ],
      "instruction": "Pour chaque formulation du MP, identifiez le type de reconnaissance."
    },
    "answers": {
      "1": "Légitimité de point de vue",
      "2": "Légitimité d'action",
      "3": "Légitimité d'intention",
      "4": "Maladresse",
      "5": "Ignorance",
      "6": "Confusion identitaire",
      "7": "FCR+",
      "8": "FCR-"
    }
  },
  {
    "id": "f9a799fd-794b-46e4-8023-7e755139ca72",
    "number": 8,
    "title": "Fatalisme fonctionnel",
    "type": "qcm",
    "content": {
      "questions": [
        {
          "id": 1,
          "text": "\"Je ne peux pas faire autrement, je suis comme ça\"",
          "options": [
            {
              "text": "Si vous aviez pensé avoir le choix, vous auriez pris une décision plus satisfaisante.",
              "label": "A"
            },
            {
              "text": "Vous n'imaginez pas encore que vous pourriez changer les choses.",
              "label": "B"
            },
            {
              "text": "Vous vous sentez peut-être prisonnier de cette manière de faire.",
              "label": "C"
            }
          ]
        },
        {
          "id": 2,
          "text": "\"J'ai pris cette décision parce que je n'ai pas eu le choix\"",
          "options": [
            {
              "text": "Si vous aviez pensé avoir le choix, vous auriez pris une décision plus satisfaisante.",
              "label": "A"
            },
            {
              "text": "Vous n'imaginez pas encore que vous pourriez changer les choses.",
              "label": "B"
            },
            {
              "text": "Ce que vous dites, c'est que vous considérez que votre manière de communiquer vous convient.",
              "label": "C"
            }
          ]
        },
        {
          "id": 3,
          "text": "\"Y a des choses comme ça, c'est pas la peine de lutter\"",
          "options": [
            {
              "text": "Si vous aviez pensé avoir le choix, vous auriez pris une décision plus satisfaisante.",
              "label": "A"
            },
            {
              "text": "Vous n'imaginez pas encore que vous pourriez changer les choses.",
              "label": "B"
            },
            {
              "text": "Vous vous sentez peut-être prisonnier de cette manière de faire.",
              "label": "C"
            }
          ]
        },
        {
          "id": 4,
          "text": "\"Maintenant, je n'ai plus l'âge pour mener ce genre de combat\"",
          "options": [
            {
              "text": "Vous exprimez un doute sur votre légitimité à intervenir.",
              "label": "A"
            },
            {
              "text": "Vous dites que ce genre de situation vous demande désormais trop d'efforts. Vous préférez peut-être vous préserver.",
              "label": "B"
            },
            {
              "text": "Vous vous sentez peut-être prisonnier de cette manière de faire.",
              "label": "C"
            }
          ]
        },
        {
          "id": 5,
          "text": "\"C'est ma manière de dire les choses, il va falloir qu'ils s'y habituent\"",
          "options": [
            {
              "text": "Vous exprimez un doute sur votre légitimité à intervenir.",
              "label": "A"
            },
            {
              "text": "Vous dites que ce genre de situation vous demande désormais trop d'efforts.",
              "label": "B"
            },
            {
              "text": "Ce que vous dites, c'est que vous considérez que votre manière de communiquer vous convient et que vous n'envisagez pas de la modifier.",
              "label": "C"
            }
          ]
        },
        {
          "id": 6,
          "text": "\"Je ne me sens pas légitime à le faire\"",
          "options": [
            {
              "text": "Vous exprimez un doute sur votre légitimité à intervenir.",
              "label": "A"
            },
            {
              "text": "Vous n'imaginez pas encore que vous pourriez changer les choses.",
              "label": "B"
            },
            {
              "text": "Vous vous sentez peut-être prisonnier de cette manière de faire.",
              "label": "C"
            }
          ]
        }
      ],
      "instruction": "Pour chaque phrase dite par la personne, choisissez la meilleure réponse du MP."
    },
    "answers": {
      "1": "C",
      "2": "A",
      "3": "B",
      "4": "B",
      "5": "C",
      "6": "A"
    }
  },
  {
    "id": "748a7cfc-fba4-455d-90d5-444648c7e1ec",
    "number": 9,
    "title": "Restitution par recentrage",
    "type": "free_text",
    "content": {
      "columns": {
        "left": "La personne dit",
        "right": "Recentrage du MP"
      },
      "questions": [
        {
          "id": 1,
          "text": "\"On n'a rien sans rien\""
        },
        {
          "id": 2,
          "text": "\"On ne peut pas avoir confiance dans les gens\""
        },
        {
          "id": 3,
          "text": "\"Mes collaborateurs ne font rien\""
        },
        {
          "id": 4,
          "text": "\"Il ne s'occupe pas de moi\""
        },
        {
          "id": 5,
          "text": "\"Il n'en fait qu'à sa tête\""
        },
        {
          "id": 6,
          "text": "\"Il a changé, ce n'est plus le même\""
        },
        {
          "id": 7,
          "text": "\"Je n'ai pas le droit de m'exprimer\""
        },
        {
          "id": 8,
          "text": "\"Je ne vaux rien\""
        },
        {
          "id": 9,
          "text": "\"Il passe son temps à me critiquer\""
        },
        {
          "id": 10,
          "text": "\"Il raconte n'importe quoi\""
        }
      ],
      "instruction": "Pour chaque phrase, proposez un recentrage."
    },
    "answers": {
      "1": "Vous voulez dire peut-être que vous avez fait beaucoup d'effort pour avoir ce que vous avez aujourd'hui.",
      "2": "Vous avez peut-être vécu des expériences relationnelles qui ne vous ont pas été agréables.",
      "3": "Ce que vous dites c'est que vous avez du mal à faire passer vos directives.",
      "4": "Vous aimeriez avoir plus d'attention de sa part.",
      "5": "Vous préféreriez qu'il fasse selon vos attentes.",
      "6": "Ce que vous dites c'est que vous ne le reconnaissez plus dans ses attitudes.",
      "7": "Vous vous sentez limité dans votre expression.",
      "8": "Vous vous sentez dévalorisé.",
      "9": "Vous vous demandez peut-être comment ne pas donner prise à ses propos.",
      "10": "Vous avez le sentiment qu'il n'est pas crédible."
    }
  },
  {
    "id": "d641a9af-b5b7-4479-8319-538c3b68f822",
    "number": 10,
    "title": "Le changement",
    "type": "single_choice",
    "content": {
      "legend": "A = Motivation, confiance, QR | B = Résistance, méfiance, conflit | C = Tolérance, acceptation, soupçon | D = Contestation, défiance, polémique",
      "options": [
        "A. Motivation, confiance, QR",
        "B. Résistance, méfiance, conflit",
        "C. Tolérance, acceptation, soupçon",
        "D. Contestation, défiance, polémique"
      ],
      "questions": [
        {
          "id": 1,
          "text": "\"J'ai dû changer de bureau mais finalement je suis contente parce que j'ai une belle vue.\" (Imposé + Bien accueilli)"
        },
        {
          "id": 2,
          "text": "\"On m'a imposé ce nouveau logiciel et je n'arrive pas à m'y faire, c'est pénible.\" (Imposé + Mal accueilli)"
        },
        {
          "id": 3,
          "text": "\"J'ai choisi de prendre ce poste et je suis ravi de cette décision.\" (Désiré + Bien accueilli)"
        },
        {
          "id": 4,
          "text": "\"J'ai choisi de déménager mais je regrette, mes amis me manquent.\" (Désiré + Mal accueilli)"
        },
        {
          "id": 5,
          "text": "\"Je n'étais pas d'accord avec cette réorganisation mais finalement ça se passe bien.\" (Imposé + Bien accueilli)"
        },
        {
          "id": 6,
          "text": "\"J'ai fini par accepter ce changement d'horaires mais ça reste difficile pour moi.\" (Imposé + Mal accueilli)"
        },
        {
          "id": 7,
          "text": "\"Je refuse ce changement et je le vis très mal, on ne m'a pas écouté.\" (Imposé + Mal accueilli)"
        },
        {
          "id": 8,
          "text": "\"J'ai dû me créer une structure professionnelle et ça se passe mal, je suis très déçu.\" (Imposé + Mal accueilli)"
        }
      ],
      "instruction": "Pour chaque situation, identifiez le type de changement et l'état résultant."
    },
    "answers": {
      "1": "C. Tolérance, acceptation, soupçon",
      "2": "B. Résistance, méfiance, conflit",
      "3": "A. Motivation, confiance, QR",
      "4": "D. Contestation, défiance, polémique",
      "5": "C. Tolérance, acceptation, soupçon",
      "6": "B. Résistance, méfiance, conflit",
      "7": "B. Résistance, méfiance, conflit",
      "8": "B. Résistance, méfiance, conflit"
    }
  },
  {
    "id": "62fd41be-3ccd-4e07-882d-377f864a4594",
    "number": 11,
    "title": "Le nettoyage du bocal",
    "type": "multi_select",
    "content": {
      "questions": [
        {
          "id": 1,
          "text": "Si jamais je rate, il sera toujours possible de passer par un juge."
        },
        {
          "id": 2,
          "text": "Ça ne devrait pas être pire qu'avant pour la personne qui va venir."
        },
        {
          "id": 3,
          "text": "J'ai peur. J'espère qu'elle ne le verra pas sinon j'arrête tout."
        },
        {
          "id": 4,
          "text": "C'est quelqu'un qui souhaite se débarrasser de cette situation conflictuelle. Je suis là pour l'aider grâce à mon expertise."
        },
        {
          "id": 5,
          "text": "La personne est dans cette dégradation relationnelle parce qu'elle n'a pas su faire autrement. Elle n'a qu'une envie, c'est d'en sortir dans les meilleures conditions."
        },
        {
          "id": 6,
          "text": "Avec un peu de chance, il n'y aura pas d'animosité entre les deux."
        },
        {
          "id": 7,
          "text": "Je vais tenter de faire le maximum pour ma cliente qui souhaite sortir de cette situation conflictuelle."
        },
        {
          "id": 8,
          "text": "C'est une personne qui vit une situation désagréable pour elle et qui souhaite trouver une entente pour vivre mieux. Mon objectif est de l'accompagner dans sa démarche et dans ses réflexions."
        },
        {
          "id": 9,
          "text": "La personne sera satisfaite de trouver un espace où elle va pouvoir exprimer tout ce qu'elle n'a pas pu exprimer jusqu'à maintenant."
        },
        {
          "id": 10,
          "text": "La personne ne connaît pas le processus qui conduit l'entretien. Tant mieux, parce que moi non plus."
        }
      ],
      "instruction": "Quelles propositions mettent en condition le MP avant une médiation ? Sélectionnez les bonnes réponses."
    },
    "answers": {
      "correctIds": [
        4,
        5,
        8,
        9
      ]
    }
  },
  {
    "id": "cd9491fc-fcb0-451d-a6d3-04361f1c16ed",
    "number": 12,
    "title": "La déontologie en question 1/2",
    "type": "free_text",
    "content": {
      "questions": [
        {
          "id": 1,
          "text": "Tu es saisi par un DRH. Après l'entretien, il te demande \"Alors comment s'est passé cet entretien ?\". Que réponds-tu ?"
        },
        {
          "id": 2,
          "text": "Les parties te demandent de rédiger et signer leur accord. Que fais-tu ?"
        },
        {
          "id": 3,
          "text": "Une médiatrice a publié sur les réseaux sociaux le dessin d'un enfant réalisé en médiation. Qu'en penses-tu ?"
        },
        {
          "id": 4,
          "text": "Tu rencontres une difficulté. Vers qui te tournes-tu ?"
        },
        {
          "id": 5,
          "text": "Un salarié peut-il être médiateur dans son entreprise ?"
        },
        {
          "id": 6,
          "text": "Quelle instance contacter si tu ne peux pas poursuivre une médiation ?"
        },
        {
          "id": 7,
          "text": "Tu ne te sens pas apte à mener une médiation. Que fais-tu ?"
        },
        {
          "id": 8,
          "text": "Différence entre éthique et déontologie ?"
        },
        {
          "id": 9,
          "text": "Peux-tu soutenir un candidat en revendiquant la CPMN ?"
        },
        {
          "id": 10,
          "text": "L'adhésion à la CPMN suffit-elle pour exercer ?"
        }
      ],
      "instruction": "Répondez à chaque question sur la déontologie du médiateur professionnel."
    },
    "answers": {
      "1": "Tu perds ta posture d'indépendance. Tu peux dire \"je vous remercie de l'attention que vous portez à cette médiation\".",
      "2": "Tu peux aider à la rédaction d'un accord. En aucun cas, tu ne peux le signer.",
      "3": "C'est un document couvert par la garantie de confidentialité.",
      "4": "Tu peux échanger avec un MP ou poser ta demande sur Discord.",
      "5": "Oui, le MP peut mettre en place un DQR. Il est important que la direction de l'entreprise signe la charte qui permet au MP de garder sa posture INI-C.",
      "6": "Le Comité de Supervision de la Médiation (CSM) - Art.7 du Codeome",
      "7": "Tu peux te tourner vers une consoeur ou un confrère.",
      "8": "L'éthique relève des comportements qu'un MP adopte dans le respect des principes de la médiation. La déontologie fait référence aux règles auxquelles se soumet le médiateur dans le cadre de sa profession.",
      "9": "Non. Art. 5.1.2 du Codeome.",
      "10": "L'assurance RCP est indispensable."
    }
  },
  {
    "id": "c670cebd-3a84-4575-9e83-2d177553f742",
    "number": 13,
    "title": "La déontologie en question 2/2",
    "type": "free_text",
    "content": {
      "questions": [
        {
          "id": 1,
          "text": "Les tarifs sont-ils réglementés ?"
        },
        {
          "id": 2,
          "text": "Quels documents contractuels utilises-tu ?"
        },
        {
          "id": 3,
          "text": "L'accord de médiation est-il obligatoire pour toutes les médiations ?"
        },
        {
          "id": 4,
          "text": "Quels sont les avantages CPMN ?"
        },
        {
          "id": 5,
          "text": "En tant que MP, tu cherches toujours la solution gagnant-gagnant ?"
        },
        {
          "id": 6,
          "text": "La confidentialité est-elle un élément de posture du MP ?"
        },
        {
          "id": 7,
          "text": "La profession de médiateur doit-elle être placée sous tutelle de l'état ?"
        },
        {
          "id": 8,
          "text": "Qu'est-ce que le droit à la médiation ?"
        },
        {
          "id": 9,
          "text": "Connais-tu le nom que portait la chambre syndicale avant d'être la CPMN ?"
        },
        {
          "id": 10,
          "text": "Quelle est l'utilité sociétale de la profession de médiateur ?"
        },
        {
          "id": 11,
          "text": "Où trouver le CODEOME ?"
        }
      ],
      "instruction": "Répondez à chaque question sur la déontologie du médiateur professionnel."
    },
    "answers": {
      "1": "Non, la tarification est libre.",
      "2": "Lettre de mission / convention / devis",
      "3": "Non, ce sont les parties qui décident de rédiger leur accord ou pas.",
      "4": "Assurance avantageuse, allomediateur, tarifs réduits formations",
      "5": "Non, c'est perdant le moins possible.",
      "6": "Non, c'est une garantie, pas un élément de posture.",
      "7": "Non, le MP y perdrait son indépendance.",
      "8": "Promotion de la liberté de décision, processus hors tutelle, promotion de l'altérité et du paradigme de l'entente sociale.",
      "9": "Unam",
      "10": "Porter le paradigme de l'entente sociale",
      "11": "https://www.cpmn.info/codeome/"
    }
  },
  {
    "id": "fc430981-90a0-48d2-adab-3c3ea9ed255d",
    "number": 14,
    "title": "Les doutes",
    "type": "single_choice",
    "content": {
      "legend": "Em = Émotionnel | Ra = Rationnel | Ex = Expérientiel",
      "options": [
        "Em (Émotionnel)",
        "Ra (Rationnel)",
        "Ex (Expérientiel)"
      ],
      "questions": [
        {
          "id": 1,
          "text": "\"Et si ça ne marchait pas ?\""
        },
        {
          "id": 2,
          "text": "\"J'ai déjà essayé, ça n'a pas fonctionné\""
        },
        {
          "id": 3,
          "text": "\"J'ai peur de ne pas y arriver\""
        },
        {
          "id": 4,
          "text": "\"Je ne suis pas sûr que ce soit une bonne idée\""
        },
        {
          "id": 5,
          "text": "\"J'ai le sentiment que ça va mal se passer\""
        },
        {
          "id": 6,
          "text": "\"La dernière fois, c'était catastrophique\""
        },
        {
          "id": 7,
          "text": "\"Les statistiques montrent que ça échoue souvent\""
        },
        {
          "id": 8,
          "text": "\"Dans mon expérience, ça ne marche jamais\""
        },
        {
          "id": 9,
          "text": "\"Logiquement, ça ne peut pas fonctionner\""
        },
        {
          "id": 10,
          "text": "\"J'ai vu d'autres personnes échouer\""
        },
        {
          "id": 11,
          "text": "\"Les études prouvent que c'est inefficace\""
        },
        {
          "id": 12,
          "text": "\"Mes tentatives précédentes ont toutes échoué\""
        }
      ],
      "instruction": "Pour chaque phrase, identifiez le type de doute."
    },
    "answers": {
      "1": "Em (Émotionnel)",
      "2": "Ex (Expérientiel)",
      "3": "Em (Émotionnel)",
      "4": "Em (Émotionnel)",
      "5": "Em (Émotionnel)",
      "6": "Ex (Expérientiel)",
      "7": "Ra (Rationnel)",
      "8": "Ex (Expérientiel)",
      "9": "Ra (Rationnel)",
      "10": "Ex (Expérientiel)",
      "11": "Ra (Rationnel)",
      "12": "Ex (Expérientiel)"
    }
  },
  {
    "id": "eefe0c81-d978-4cd9-9e48-52d0667c0e30",
    "number": 15,
    "title": "Restitution de sens à brûle-pourpoint",
    "type": "free_text",
    "content": {
      "columns": {
        "left": "La personne dit",
        "right": "Restitution du MP"
      },
      "questions": [
        {
          "id": 1,
          "text": "\"Mon chef ne me dit jamais que je fais du bon travail\""
        },
        {
          "id": 2,
          "text": "\"Je ne sais plus où j'en suis avec lui\""
        },
        {
          "id": 3,
          "text": "\"J'aimerais vraiment m'améliorer dans ce domaine\""
        },
        {
          "id": 4,
          "text": "\"Ça fait des années que je supporte cette situation\""
        },
        {
          "id": 5,
          "text": "\"On n'arrive plus à travailler ensemble\""
        },
        {
          "id": 6,
          "text": "\"Je ne peux rien y faire de toute façon\""
        },
        {
          "id": 7,
          "text": "\"Ma femme gère très bien les finances\""
        },
        {
          "id": 8,
          "text": "\"Mon associé est vraiment doué pour la négociation\""
        },
        {
          "id": 9,
          "text": "\"Ses performances sont remarquables\""
        },
        {
          "id": 10,
          "text": "\"Parfois je m'énerve et je dis des choses que je regrette\""
        },
        {
          "id": 11,
          "text": "\"Je suis prête à tout pour que ça change\""
        },
        {
          "id": 12,
          "text": "\"J'ai bien réfléchi avant de prendre cette décision\""
        },
        {
          "id": 13,
          "text": "\"Je ne vois pas comment on pourrait s'en sortir\""
        },
        {
          "id": 14,
          "text": "\"Personne ne m'aide dans cette histoire\""
        },
        {
          "id": 15,
          "text": "\"C'est toujours moi qui dois tout faire\""
        }
      ],
      "instruction": "Pour chaque phrase, proposez une restitution de sens."
    },
    "answers": {
      "1": "Vous avez le sentiment de bien accomplir votre mission et vous ne vous sentez pas reconnu par votre chef. Vous êtes déçu...",
      "2": "Des choses ont changé dans votre relation et vous ne vous sentez plus en confiance.",
      "3": "Vous avez envie de progresser et vous vous demandez peut-être par quoi commencer.",
      "4": "Ce que vous dites c'est qu'aujourd'hui vous êtes peut-être en train de vous demander si vous allez la supporter plus longtemps...",
      "5": "Vous regrettez peut-être de ne pas savoir comment faire pour arriver à nouveau à travailler agréablement ensemble.",
      "6": "Vous vous sentez impuissant.",
      "7": "Vous avez confiance en elle.",
      "8": "Vous savez que vous pouvez compter sur ses compétences de négociateur et vous êtes rassuré/satisfait.",
      "9": "Ce que vous dites c'est que ses résultats vous donnent satisfaction.",
      "10": "Ce que vous dites c'est qu'il y a des situations où vous avez du mal à réguler vos émotions.",
      "11": "Vous pourriez dire à quoi précisément vous êtes prête pour que les choses changent.",
      "12": "Ce que vous dites c'est que vous avez pris le temps de peser le pour et le contre de chaque élément et vous êtes satisfait de cette réflexion.",
      "13": "Vous ne parvenez pas à imaginer une issue qui vous serait favorable.",
      "14": "Vous ne vous sentez pas soutenu.",
      "15": "Vous aimeriez peut-être savoir comment faire pour motiver les autres afin qu'ils vous aident."
    }
  },
  {
    "id": "fb77062e-f3a8-4061-91b5-c35a263ab30f",
    "number": 16,
    "title": "Les étapes du processus de l'EI",
    "type": "single_choice",
    "content": {
      "legend": "1. Accueil | 2. Attentes médiation | 3. Attentes MP | 4. Élévation | 5. Engagement | 6. Inversion | 7. Déclinaison | 8. Proposition",
      "options": [
        "1. Accueil et contextualisation",
        "2. Attentes vis-à-vis de la médiation",
        "3. Attentes vis-à-vis du MP",
        "4. Élévation conceptuelle",
        "5. Engagement du MP",
        "6. Inversion",
        "7. Déclinaison",
        "8. Proposition de service"
      ],
      "questions": [
        {
          "id": 1,
          "text": "\"Si vous étiez en difficulté pour respecter ces principes, vous m'autorisez à vous les rappeler.\""
        },
        {
          "id": 2,
          "text": "\"Je m'engage à ce que votre collègue respecte ces principes.\""
        },
        {
          "id": 3,
          "text": "\"... appliqué à vous même.\""
        },
        {
          "id": 4,
          "text": "\"Je pourrais vous poser une question.\""
        },
        {
          "id": 5,
          "text": "\"Vous m'avez appelé jeudi parce que vous souhaitez une médiation avec votre oncle.\""
        },
        {
          "id": 6,
          "text": "\"Il y a d'autres choses que vous pourriez attendre de cette médiation.\""
        },
        {
          "id": 7,
          "text": "\"... que je transmette ce message que vous n'avez pas réussi à faire passer.\""
        },
        {
          "id": 8,
          "text": "\"Pour que cette médiation se passe bien, vous pourriez dire ce qu'il ne faudrait pas que votre voisine fasse.\""
        },
        {
          "id": 9,
          "text": "\"Je vous remercie d'avoir choisi la médiation professionnelle.\""
        },
        {
          "id": 10,
          "text": "\"Vous pourriez dire ce que vous attendez de moi.\""
        },
        {
          "id": 11,
          "text": "\"Vous pourriez dire ce qu'il ne faudrait pas qu'il fasse, dise ou pense...\""
        },
        {
          "id": 12,
          "text": "\"Ce que vous dites c'est que pour que cette médiation se passe dans les meilleures conditions il ne faudrait pas qu'il vous impose sa manière de voir les choses, sa solution.\""
        },
        {
          "id": 13,
          "text": "\"Ce que vous dites c'est que vous vous engagez à ne pas avoir de mots dévalorisants...\""
        },
        {
          "id": 14,
          "text": "\"Dans le cas où vous seriez en difficulté pour respecter ces règles de communication, vous m'autorisez à vous les rappeler.\""
        }
      ],
      "instruction": "Pour chaque phrase du MP, identifiez l'étape du processus de l'entretien individuel."
    },
    "answers": {
      "1": "8. Proposition de service",
      "2": "5. Engagement du MP",
      "3": "7. Déclinaison",
      "4": "6. Inversion",
      "5": "1. Accueil et contextualisation",
      "6": "2. Attentes vis-à-vis de la médiation",
      "7": "3. Attentes vis-à-vis du MP",
      "8": "4. Élévation conceptuelle",
      "9": "1. Accueil et contextualisation",
      "10": "3. Attentes vis-à-vis du MP",
      "11": "4. Élévation conceptuelle",
      "12": "4. Élévation conceptuelle",
      "13": "7. Déclinaison",
      "14": "8. Proposition de service"
    }
  },
  {
    "id": "ee6c055d-e411-4b93-8dfe-44d304e4c1e7",
    "number": 17,
    "title": "L'alterocentrage",
    "type": "free_text",
    "content": {
      "columns": {
        "left": "Question classique",
        "right": "Version alterocentrée"
      },
      "questions": [
        {
          "id": 1,
          "text": "Qu'est-ce qui est le plus important pour vous ?"
        },
        {
          "id": 2,
          "text": "Qu'est-ce qui ne va pas ?"
        },
        {
          "id": 3,
          "text": "Dites-moi ce que vous attendez de la médiation ?"
        },
        {
          "id": 4,
          "text": "Pourquoi vous n'êtes pas d'accord ?"
        },
        {
          "id": 5,
          "text": "Comment allez-vous faire ?"
        },
        {
          "id": 6,
          "text": "Où avez-vous prévu d'aller ?"
        },
        {
          "id": 7,
          "text": "Qu'est-ce qui vous en empêche ?"
        },
        {
          "id": 8,
          "text": "Expliquez-moi pourquoi vous ne pouvez pas le faire"
        },
        {
          "id": 9,
          "text": "Je ne comprends pas ce que vous souhaitez"
        },
        {
          "id": 10,
          "text": "Ce que vous dites n'est pas clair"
        },
        {
          "id": 11,
          "text": "Racontez-moi votre histoire s'il vous plaît"
        },
        {
          "id": 12,
          "text": "Pourquoi vous pleurez ?"
        },
        {
          "id": 13,
          "text": "Pourriez-vous peut-être dire..."
        },
        {
          "id": 14,
          "text": "Et alors, à ce moment là, qu'est ce que vous avez fait ?"
        },
        {
          "id": 15,
          "text": "Pourquoi vous n'en avez pas parlé ?"
        },
        {
          "id": 16,
          "text": "Est-ce que vous pouvez m'expliquer ?"
        },
        {
          "id": 17,
          "text": "Est-ce que c'est difficile pour vous ?"
        }
      ],
      "instruction": "Transformez ces questions en langage alterocentré."
    },
    "answers": {
      "1": "Vous pourriez dire ce qui est prioritaire pour vous.",
      "2": "Vous êtes perturbé par quelque chose.",
      "3": "Vous pourriez dire ce que vous attendez de cette médiation.",
      "4": "Vous avez un point de désaccord.",
      "5": "Vous avez peut-être un plan d'action.",
      "6": "Vous pourriez peut-être partager votre projet.",
      "7": "Vous êtes arrêté par un point précis…",
      "8": "Vous pourriez dire ce qui vous empêche de…",
      "9": "Vous pourriez peut-être clarifier vos attentes.",
      "10": "Vous pourriez peut-être clarifier le point que vous évoquez.",
      "11": "Vous pourriez raconter…",
      "12": "Ce que vous dites vous touche fortement.",
      "13": "Vous pourriez peut-être dire…",
      "14": "À ce moment, vous avez fait quelque chose de précis.",
      "15": "Vous n'avez pas pensé utile d'aborder ce sujet.",
      "16": "Vous pourriez peut-être m'en dire plus.",
      "17": "Vous vivez peut-être quelque chose de difficile."
    }
  },
  {
    "id": "78e2cfac-4422-4d7f-be01-4ba219eb00b1",
    "number": 18,
    "title": "Questions tous azimuts",
    "type": "free_text",
    "content": {
      "questions": [
        {
          "id": 1,
          "text": "Quel est le terreau du CES ?"
        },
        {
          "id": 2,
          "text": "En 2 ou 3 mots, l'objectif visé par le MP :"
        },
        {
          "id": 3,
          "text": "Avec quels outils stopper l'escalade de la surenchère :"
        },
        {
          "id": 4,
          "text": "De quoi le MP est-il l'acteur :"
        },
        {
          "id": 5,
          "text": "Quelles sont les 3 lois du fonctionnement humain ?"
        },
        {
          "id": 6,
          "text": "Quels sont les 4 états du changement :"
        },
        {
          "id": 7,
          "text": "Quels sont les 3 éléments de la diversification de l'expression :"
        },
        {
          "id": 8,
          "text": "Quel est l'objectif du raisonnement aporétique :"
        },
        {
          "id": 9,
          "text": "Quelles sont les issues dans l'adversité :"
        },
        {
          "id": 10,
          "text": "Quelles sont les 3 libertés recouvrées :"
        },
        {
          "id": 11,
          "text": "Comment s'appelle le code d'éthique :"
        },
        {
          "id": 12,
          "text": "Comment s'appelle le dispositif EPMN pour la QR :"
        },
        {
          "id": 13,
          "text": "Comment s'appelle l'outil qui consiste à parler de l'autre à l'autre :"
        }
      ],
      "instruction": "Répondez à chaque question."
    },
    "answers": {
      "1": "3R",
      "2": "restaurer l'entente/liberté de décision",
      "3": "FCR - le merci - le langage attributif",
      "4": "la reconnaissance",
      "5": "Satisfaction, Harmonie, Equilibre",
      "6": "Désiré, non désiré, bien accueilli, mal accueilli",
      "7": "Verbal, action, implication",
      "8": "stopper l'entêtement",
      "9": "Abandon, Domination, Résignation",
      "10": "réflexion, expression, décision",
      "11": "CODEOME",
      "12": "DQR / DMPI",
      "13": "alterocentrage"
    }
  },
  {
    "id": "4e0281e3-2024-48a4-b828-74c72d99567a",
    "number": 19,
    "title": "Structures et interactions en communication 1/2",
    "type": "single_choice",
    "content": {
      "legend": "Réception : Visuelle, Auditive, Sensitive | Réflexion : Émotionnelle, Analytique, Analogique",
      "options": [
        "Visuelle (Réception)",
        "Auditive (Réception)",
        "Sensitive (Réception)",
        "Émotionnelle (Réflexion)",
        "Analytique (Réflexion)",
        "Analogique (Réflexion)"
      ],
      "questions": [
        {
          "id": 1,
          "text": "Sophie regarde son écran. Des diagrammes colorés illustrent le défi."
        },
        {
          "id": 2,
          "text": "Une voix éloquente expose les détails du défi."
        },
        {
          "id": 3,
          "text": "Sophie sent un frisson parcourir sa peau."
        },
        {
          "id": 4,
          "text": "Sophie ferme les yeux et laisse les sentiments affluer."
        },
        {
          "id": 5,
          "text": "Sophie énumère les faits concrets comme des pièces d'un puzzle."
        },
        {
          "id": 6,
          "text": "Sophie compare les éléments à des éléments familiers."
        }
      ],
      "instruction": "Pour chaque situation, identifiez le mode de réception ou de réflexion."
    },
    "answers": {
      "1": "Visuelle (Réception)",
      "2": "Auditive (Réception)",
      "3": "Sensitive (Réception)",
      "4": "Émotionnelle (Réflexion)",
      "5": "Analytique (Réflexion)",
      "6": "Analogique (Réflexion)"
    }
  },
  {
    "id": "ab73e18a-dad5-45ae-97e6-d5418741e814",
    "number": 20,
    "title": "Structures et interactions en communication 2/2",
    "type": "single_choice",
    "content": {
      "legend": "Verbal = Je te dis | Action = Je te montre | Émotionnel = Je t'implique",
      "options": [
        "Verbal (Je te dis)",
        "Action (Je te montre)",
        "Émotionnel (Je t'implique)"
      ],
      "questions": [
        {
          "id": 1,
          "text": "Sophie: \"Avant la présentation, vous avez peut-être des attentes. Vous pourriez en parler…\""
        },
        {
          "id": 2,
          "text": "Sophie : \"J'ai préparé un dossier exhaustif avec toutes les modalités.\""
        },
        {
          "id": 3,
          "text": "Sophie montre les plans sur son ordinateur."
        },
        {
          "id": 4,
          "text": "Sophie: \"Comment envisagez-vous la communication autour du projet ?\""
        }
      ],
      "instruction": "Pour chaque situation, identifiez le type d'information."
    },
    "answers": {
      "1": "Émotionnel (Je t'implique)",
      "2": "Verbal (Je te dis)",
      "3": "Action (Je te montre)",
      "4": "Émotionnel (Je t'implique)"
    }
  },
  {
    "id": "fc7a3858-f01d-4548-948c-4eb554b6adc7",
    "number": 21,
    "title": "Processus de la réunion de médiation",
    "type": "single_choice",
    "content": {
      "legend": "1. Accueil | 2. Rappel 3 accords | 3. Bilan | 4. Inventaire | 5. Projet",
      "options": [
        "Accueil et contextualisation",
        "Rappel des 3 accords",
        "Bilan",
        "Inventaire",
        "Projet"
      ],
      "questions": [
        {
          "id": 1,
          "text": "\"Je vous remercie d'être présents à cette réunion de médiation\""
        },
        {
          "id": 2,
          "text": "\"Vous m'avez donné votre accord pour vous rappeler les principes de QR\""
        },
        {
          "id": 3,
          "text": "\"Vous aviez initialement envisagé le licenciement. Aujourd'hui, vous vous dirigez vers un aménagement\""
        },
        {
          "id": 4,
          "text": "\"Vous avez été d'accord pour vous engager à respecter des principes de QR\""
        },
        {
          "id": 5,
          "text": "\"Il y a des choses à mettre en place pour que l'accord s'inscrive dans la durée\""
        },
        {
          "id": 6,
          "text": "\"Vous êtes en train de construire un projet relationnel\""
        },
        {
          "id": 7,
          "text": "\"Vous pourriez indiquer ce qui fait que vous en êtes arrivés à cette impasse\""
        },
        {
          "id": 8,
          "text": "\"Vous avez choisi de faire appel à la médiation, votre premier accord\""
        }
      ],
      "instruction": "Pour chaque phrase du MP, identifiez l'étape de la réunion de médiation."
    },
    "answers": {
      "1": "Accueil et contextualisation",
      "2": "Rappel des 3 accords",
      "3": "Bilan",
      "4": "Rappel des 3 accords",
      "5": "Projet",
      "6": "Projet",
      "7": "Inventaire",
      "8": "Accueil et contextualisation"
    }
  },
  {
    "id": "519a4ea6-f43c-4686-9575-91f888c1598e",
    "number": 22,
    "title": "Les 5 langages",
    "type": "single_choice",
    "content": {
      "options": [
        "Sympathie → Complicité → Confiance",
        "Antipathie → Adversité → Méfiance",
        "Mésopathie → Réprobation → Défiance",
        "Alterocentrage → Altérité → Accueil",
        "Empathie → Bienveillance → Compréhension"
      ],
      "questions": [
        {
          "id": 1,
          "text": "\"Je suis tout à fait d'accord avec toi, tu as tout mon soutien.\""
        },
        {
          "id": 2,
          "text": "\"Je ne suis pas du tout d'accord, je ne souhaite plus être en relation avec toi.\""
        },
        {
          "id": 3,
          "text": "\"Je comprends les raisons mais je ne suis pas d'accord sur la façon de faire.\""
        },
        {
          "id": 4,
          "text": "\"Tu as été en difficulté, tu as fait comme tu as pu.\""
        },
        {
          "id": 5,
          "text": "\"Si je comprends bien tu as besoin d'aide. J'entends que c'est compliqué.\""
        }
      ],
      "instruction": "Pour chaque phrase, identifiez le langage, la posture et la dynamique."
    },
    "answers": {
      "1": "Sympathie → Complicité → Confiance",
      "2": "Antipathie → Adversité → Méfiance",
      "3": "Mésopathie → Réprobation → Défiance",
      "4": "Alterocentrage → Altérité → Accueil",
      "5": "Empathie → Bienveillance → Compréhension"
    }
  },
  {
    "id": "8929dbd7-2621-4284-a989-f9e387eff0ca",
    "number": 23,
    "title": "Les pensées limitantes et les regrets",
    "type": "single_choice",
    "content": {
      "legend": "Pensées : Conviction, Certitude, Croyance | Regrets : Remords, Rancune, Rancoeur",
      "options": [
        "Conviction",
        "Certitude",
        "Croyance",
        "Remords",
        "Rancune",
        "Rancoeur"
      ],
      "questions": [
        {
          "id": 1,
          "text": "\"Je sais que le cerveau humain n'utilise que 10%.\""
        },
        {
          "id": 2,
          "text": "\"Les autres sont toujours meilleurs que moi.\""
        },
        {
          "id": 3,
          "text": "\"C'est le destin qui contrôle tout.\""
        },
        {
          "id": 4,
          "text": "\"L'argent ne fait pas le bonheur.\""
        },
        {
          "id": 5,
          "text": "\"Je suis convaincu que je ne serai jamais capable de réussir.\""
        },
        {
          "id": 6,
          "text": "\"Personne ne comprend mes idées, je ne dis plus rien.\""
        },
        {
          "id": 7,
          "text": "\"Je n'ai pas été traité équitablement.\""
        },
        {
          "id": 8,
          "text": "\"Si seulement j'avais écouté les conseils…\""
        },
        {
          "id": 9,
          "text": "\"Je regrette de ne pas avoir saisi l'occasion. Goût amer.\""
        },
        {
          "id": 10,
          "text": "\"Ses mots étaient blessants, ça ne restera pas impuni.\""
        },
        {
          "id": 11,
          "text": "\"Cette injustice doit être réparée ; œil pour œil...\""
        },
        {
          "id": 12,
          "text": "\"Je n'aurais pas dû lui confier cette mission.\""
        },
        {
          "id": 13,
          "text": "\"Il va le payer !\""
        },
        {
          "id": 14,
          "text": "\"Il y a toujours cette douleur persistante en moi.\""
        }
      ],
      "instruction": "Pour chaque phrase, identifiez s'il s'agit d'une pensée limitante ou d'un type de regret."
    },
    "answers": {
      "1": "Conviction",
      "2": "Croyance",
      "3": "Croyance",
      "4": "Croyance",
      "5": "Conviction",
      "6": "Certitude",
      "7": "Rancoeur",
      "8": "Remords",
      "9": "Rancoeur",
      "10": "Rancune",
      "11": "Rancune",
      "12": "Remords",
      "13": "Rancune",
      "14": "Rancoeur"
    }
  },
  {
    "id": "40091133-cdf2-4c1a-b21e-672ecf5cbe06",
    "number": 24,
    "title": "Points à relier",
    "type": "single_choice",
    "content": {
      "options": [
        "Posture du MP",
        "Outil de la restitution de sens",
        "Outil utilisé pour structurer la réunion de médiation",
        "Positifs ou négatifs, ils entretiennent une entente ou un conflit",
        "Issues d'une médiation dans l'adversité",
        "Issues d'une médiation dans l'altérité",
        "Modèle qui définit la relation d'une personne à elle-même",
        "Les fondamentaux de la reconnaissance",
        "Outils de la qualité relationnelle appliqués à l'environnement professionnel",
        "Quand il est en soi",
        "Les relations sous le modèle du contrat social",
        "La chambre syndicale des MP",
        "Indispensable pour être un pro de la médiation",
        "Système d'intégration de la MP dans une structure",
        "Les relations sous le modèle de l'entente sociale"
      ],
      "questions": [
        {
          "id": 1,
          "text": "INI"
        },
        {
          "id": 2,
          "text": "FCR"
        },
        {
          "id": 3,
          "text": "BIP"
        },
        {
          "id": 4,
          "text": "PIC"
        },
        {
          "id": 5,
          "text": "ADR"
        },
        {
          "id": 6,
          "text": "RAR"
        },
        {
          "id": 7,
          "text": "SHE"
        },
        {
          "id": 8,
          "text": "R3"
        },
        {
          "id": 9,
          "text": "QR(T)"
        },
        {
          "id": 10,
          "text": "CES"
        },
        {
          "id": 11,
          "text": "JTE"
        },
        {
          "id": 12,
          "text": "CPMN"
        },
        {
          "id": 13,
          "text": "CAP'M"
        },
        {
          "id": 14,
          "text": "DQR"
        },
        {
          "id": 15,
          "text": "ETJ"
        }
      ],
      "instruction": "Pour chaque sigle, identifiez sa signification."
    },
    "answers": {
      "1": "Posture du MP",
      "2": "Outil de la restitution de sens",
      "3": "Outil utilisé pour structurer la réunion de médiation",
      "4": "Positifs ou négatifs, ils entretiennent une entente ou un conflit",
      "5": "Issues d'une médiation dans l'adversité",
      "6": "Issues d'une médiation dans l'altérité",
      "7": "Modèle qui définit la relation d'une personne à elle-même",
      "8": "Les fondamentaux de la reconnaissance",
      "9": "Outils de la qualité relationnelle appliqués à l'environnement professionnel",
      "10": "Quand il est en soi",
      "11": "Les relations sous le modèle du contrat social",
      "12": "La chambre syndicale des MP",
      "13": "Indispensable pour être un pro de la médiation",
      "14": "Système d'intégration de la MP dans une structure",
      "15": "Les relations sous le modèle de l'entente sociale"
    }
  },
  {
    "id": "94a3ab09-0cfd-454d-b6f7-beb1f104f61c",
    "number": 25,
    "title": "Vrai / Faux",
    "type": "true_false",
    "content": {
      "questions": [
        {
          "id": 1,
          "text": "Le MP fait uniquement de la résolution de conflits"
        },
        {
          "id": 2,
          "text": "La réussite d'une médiation dépend de la compétence du MP"
        },
        {
          "id": 3,
          "text": "L'acronyme RAR désigne les trois issues dans l'adversité"
        },
        {
          "id": 4,
          "text": "C'est l'absence de reconnaissance qui crée le conflit"
        },
        {
          "id": 5,
          "text": "JTE signifie Judiciaire, Technique, Émotionnel"
        },
        {
          "id": 6,
          "text": "Les MP sont promoteurs du paradigme de l'Entente et de l'Entente sociale"
        },
        {
          "id": 7,
          "text": "L'expertise du MP consiste notamment à faire circuler la reconnaissance"
        },
        {
          "id": 8,
          "text": "Il faut obligatoirement qu'un conflit soit judiciarisé pour saisir un MP"
        },
        {
          "id": 9,
          "text": "Tous les médiateurs sont des professionnels"
        },
        {
          "id": 10,
          "text": "Le paradigme de l'Entente sociale date du siècle des Lumières"
        },
        {
          "id": 11,
          "text": "Les PIC+ sont un gage de qualité relationnelle"
        },
        {
          "id": 12,
          "text": "La médiation professionnelle est une alternative à la gestion des conflits"
        },
        {
          "id": 13,
          "text": "L'ingénierie relationnelle englobe la qualité relationnelle"
        },
        {
          "id": 14,
          "text": "La qualité relationnelle englobe l'ingénierie relationnelle"
        },
        {
          "id": 15,
          "text": "Un MP peut faire une réunion de médiation sans entretiens préparatoires"
        }
      ],
      "instruction": "Pour chaque affirmation, indiquez si elle est vraie ou fausse."
    },
    "answers": {
      "1": "Faux",
      "2": "Vrai",
      "3": "Faux",
      "4": "Vrai",
      "5": "Faux",
      "6": "Vrai",
      "7": "Vrai",
      "8": "Faux",
      "9": "Faux",
      "10": "Faux",
      "11": "Vrai",
      "12": "Faux",
      "13": "Vrai",
      "14": "Faux",
      "15": "Faux"
    }
  },
  {
    "id": "06caf00b-93ed-43e7-8fad-cbed46d7d1cf",
    "number": 26,
    "title": "Restitutions de sens (QCM)",
    "type": "qcm",
    "content": {
      "questions": [
        {
          "id": 1,
          "text": "\"Il a obtenu le poste alors que j'avais plus d'ancienneté.\"",
          "options": [
            {
              "text": "Vous devriez en parler à votre supérieur.",
              "label": "A"
            },
            {
              "text": "Vous avez le sentiment que votre expérience n'a pas été prise en compte et cela vous affecte.",
              "label": "B"
            },
            {
              "text": "C'est injuste ce qui vous arrive.",
              "label": "C"
            }
          ]
        },
        {
          "id": 2,
          "text": "\"Elle raconte ma vie privée à tout le bureau.\"",
          "options": [
            {
              "text": "Vous avez besoin de préserver votre intimité et cette situation vous met mal à l'aise.",
              "label": "A"
            },
            {
              "text": "Vous devriez lui dire d'arrêter.",
              "label": "B"
            },
            {
              "text": "Est-ce que vous lui avez dit que ça vous dérangeait ?",
              "label": "C"
            }
          ]
        },
        {
          "id": 3,
          "text": "\"Mes idées ne sont jamais retenues en réunion.\"",
          "options": [
            {
              "text": "Peut-être que vous ne les présentez pas de la bonne manière.",
              "label": "A"
            },
            {
              "text": "Pourquoi pensez-vous que c'est le cas ?",
              "label": "B"
            },
            {
              "text": "Vous aimeriez que vos contributions soient davantage considérées.",
              "label": "C"
            }
          ]
        },
        {
          "id": 4,
          "text": "\"Il ne répond jamais à mes messages.\"",
          "options": [
            {
              "text": "Avez-vous essayé de l'appeler ?",
              "label": "A"
            },
            {
              "text": "Vous aimeriez avoir des échanges plus fluides et ce silence vous pèse.",
              "label": "B"
            },
            {
              "text": "Il est probablement très occupé.",
              "label": "C"
            }
          ]
        },
        {
          "id": 5,
          "text": "\"On m'a retiré ce dossier sans explication.\"",
          "options": [
            {
              "text": "Vous auriez aimé avoir des informations pour comprendre le choix qui a été fait.",
              "label": "A"
            },
            {
              "text": "C'est normal de se sentir frustré.",
              "label": "B"
            },
            {
              "text": "Demandez des explications à votre responsable.",
              "label": "C"
            }
          ]
        },
        {
          "id": 6,
          "text": "\"Depuis le télétravail, je me sens isolé de l'équipe.\"",
          "options": [
            {
              "text": "Vous devriez proposer des visioconférences.",
              "label": "A"
            },
            {
              "text": "Beaucoup de gens vivent la même chose.",
              "label": "B"
            },
            {
              "text": "Le lien avec vos collègues vous manque et vous aimeriez retrouver cette connexion.",
              "label": "C"
            }
          ]
        },
        {
          "id": 7,
          "text": "\"Il s'attribue le mérite de mon travail devant la direction.\"",
          "options": [
            {
              "text": "Vous avez besoin que votre contribution soit reconnue et cette situation vous frustre.",
              "label": "A"
            },
            {
              "text": "Vous devriez en parler directement avec lui.",
              "label": "B"
            },
            {
              "text": "C'est inadmissible !",
              "label": "C"
            }
          ]
        },
        {
          "id": 8,
          "text": "\"Elle change d'avis en permanence, je ne sais plus quoi faire.\"",
          "options": [
            {
              "text": "Vous avez besoin de clarifier ses attentes pour adapter vos réponses.",
              "label": "A"
            },
            {
              "text": "Demandez-lui de mettre ses demandes par écrit.",
              "label": "B"
            },
            {
              "text": "C'est quelqu'un d'instable.",
              "label": "C"
            }
          ]
        }
      ],
      "instruction": "Pour chaque phrase, choisissez la meilleure restitution de sens. Une bonne restitution reformule le vécu/ressenti sans jugement, sans question, sans conseil."
    },
    "answers": {
      "1": "B",
      "2": "A",
      "3": "C",
      "4": "B",
      "5": "A",
      "6": "C",
      "7": "A",
      "8": "A"
    }
  },
  {
    "id": "2a5dc7be-6e81-4397-a03c-a226c8c9ea6b",
    "number": 27,
    "title": "Transforme en FCR",
    "type": "free_text",
    "content": {
      "legend": "F = Faits | C = Conséquences | R = Ressenti",
      "columns": {
        "left": "Propos",
        "right": "Transformation FCR"
      },
      "questions": [
        {
          "id": 1,
          "text": "\"T'es vraiment pas fiable ! Tu devais ouvrir la boutique à 9h et comme d'habitude t'es arrivé en retard !\" (FCR)"
        },
        {
          "id": 2,
          "text": "\"Elle est complètement nulle ! Elle a encore planté la présentation devant le client !\" (C+R)"
        },
        {
          "id": 3,
          "text": "\"Ce type est un profiteur ! 3 fois qu'il me demande de finir son boulot !\" (FCR)"
        },
        {
          "id": 4,
          "text": "\"Mon chef est un harceleur ! Il me convoque tous les jours pour vérifier ce que je fais !\" (R)"
        },
        {
          "id": 5,
          "text": "\"Ils m'ont mis devant le fait accompli ! Ils ont changé les horaires sans prévenir !\" (C+R)"
        },
        {
          "id": 6,
          "text": "\"Ce client est un malade ! Il m'a appelé 8 fois hier pour la même réclamation !\" (FCR)"
        },
        {
          "id": 7,
          "text": "\"Mon collègue est un parasite ! Il passe ses journées sur son téléphone !\" (C)"
        },
        {
          "id": 8,
          "text": "\"Elle m'a volé mon idée ! Elle a présenté MON projet à la direction !\" (FCR)"
        }
      ],
      "instruction": "Pour chaque propos, transformez en FCR (Faits, Conséquences, Ressenti)."
    },
    "answers": {
      "1": "Vous aviez convenu qu'il arriverait à 9h pour l'ouverture. Il est arrivé à 9h15 (F). Vous avez dû recevoir les premiers clients seule et vous avez pris du retard dans la réception des colis (C). Vous ne vous sentez pas respectée dans vos missions (R).",
      "2": "Vous avez dû reprendre la présentation en urgence et rattraper la situation devant le client (C). Vous êtes épuisée et frustrée (R).",
      "3": "Cette semaine, il vous a demandé trois fois de terminer ses dossiers à 17h pour partir plus tôt (F). Vous avez dû rester tard et décaler vos propres rendez-vous (C). Vous vous sentez utilisée (R).",
      "4": "Vous vous sentez surveillée en permanence et cela vous stresse.",
      "5": "Vous découvrez le nouveau planning alors que vous aviez déjà organisé vos vacances avec votre famille (C). Vous vous sentez méprisée et en colère (R).",
      "6": "Hier, ce client vous a appelé 8 fois pour la même demande malgré votre réponse initiale (F). Vous n'avez pas pu avancer sur vos autres dossiers et vous avez pris du retard (C). Vous êtes épuisée et démotivée (R).",
      "7": "Vous devez assumer sa charge de travail en plus de la vôtre, ce qui alourdit considérablement vos journées.",
      "8": "Lors de la réunion de ce matin, elle a présenté le projet sur lequel vous avez travaillé pendant 3 semaines sans mentionner votre contribution (F). La direction pense que c'est son travail et vous n'avez reçu aucune reconnaissance (C). Vous vous sentez trahi et dévalorisé (R)."
    }
  },
  {
    "id": "1cc23469-da15-454b-96f1-9c9a37c17286",
    "number": 28,
    "title": "Raisonnement Aporétique — Identifier",
    "type": "single_choice",
    "content": {
      "legend": "1. Gagnez à NE PAS (présent+nég) | 2. Perdez à NE PAS (présent+nég) | 3. Pourriez GAGNER (cond+aff) | 4. Pourriez PERDRE (cond+aff)",
      "options": [
        "Étape 1 — Ce que vous GAGNEZ à NE PAS",
        "Étape 2 — Ce que vous PERDEZ à NE PAS",
        "Étape 3 — Ce que vous POURRIEZ GAGNER",
        "Étape 4 — Ce que vous POURRIEZ PERDRE",
        "Piège — Question directe ou orientée"
      ],
      "questions": [
        {
          "id": 1,
          "text": "\"Vous pourriez dire ce que vous gagnez à ne pas quitter votre emploi ?\""
        },
        {
          "id": 2,
          "text": "\"Vous pourriez dire ce que vous pourriez gagner à quitter votre emploi ?\""
        },
        {
          "id": 3,
          "text": "\"Pourquoi restez-vous si vous êtes malheureuse ?\""
        },
        {
          "id": 4,
          "text": "\"Vous pourriez dire ce que vous perdez à ne pas quitter votre emploi ?\""
        },
        {
          "id": 5,
          "text": "\"Vous pourriez dire ce que vous gagneriez à quitter votre emploi ?\""
        },
        {
          "id": 6,
          "text": "\"Vous ne pensez pas qu'il serait temps de partir ?\""
        },
        {
          "id": 7,
          "text": "\"Vous pourriez dire ce que vous pourriez perdre à quitter votre emploi ?\""
        },
        {
          "id": 8,
          "text": "\"Qu'est-ce qui vous retient de partir ?\""
        },
        {
          "id": 9,
          "text": "\"Vous pourriez dire ce que vous perdriez à quitter votre emploi ?\""
        },
        {
          "id": 10,
          "text": "\"Vous pourriez dire ce que vous perdez à quitter votre emploi ?\""
        }
      ],
      "instruction": "Pour chaque formulation du MP, identifiez s'il s'agit d'une étape du raisonnement aporétique ou d'un piège."
    },
    "answers": {
      "1": "Étape 1 — Ce que vous GAGNEZ à NE PAS",
      "2": "Étape 3 — Ce que vous POURRIEZ GAGNER",
      "3": "Piège — Question directe ou orientée",
      "4": "Étape 2 — Ce que vous PERDEZ à NE PAS",
      "5": "Étape 3 — Ce que vous POURRIEZ GAGNER",
      "6": "Piège — Question directe ou orientée",
      "7": "Étape 4 — Ce que vous POURRIEZ PERDRE",
      "8": "Piège — Question directe ou orientée",
      "9": "Étape 4 — Ce que vous POURRIEZ PERDRE",
      "10": "Piège — Question directe ou orientée"
    }
  },
  {
    "id": "653e83b8-c75a-4357-b617-2fbb64b0c610",
    "number": 29,
    "title": "Labyrinthe du Raisonnement Aporétique",
    "type": "labyrinth",
    "content": {
      "scenario": "M. Bertrand hésite à quitter son emploi. Il est malheureux mais n'arrive pas à se décider. En tant que Médiateur Professionnel, accompagnez-le en posant les bonnes questions dans l'ordre du Raisonnement Aporétique.",
      "questions": [
        {
          "id": 1,
          "text": "Étape 1 — Quelle première question poser ?",
          "options": [
            {
              "text": "Vous pourriez dire ce que vous gagnez à ne pas quitter votre emploi ?",
              "label": "A"
            },
            {
              "text": "Pourquoi restez-vous si vous êtes malheureux ?",
              "label": "B"
            },
            {
              "text": "Vous pourriez dire ce que vous pourriez gagner à quitter votre emploi ?",
              "label": "C"
            }
          ]
        },
        {
          "id": 2,
          "text": "Étape 2 — Quelle question vient ensuite ?",
          "options": [
            {
              "text": "Vous ne pensez pas qu'il serait temps de partir ?",
              "label": "A"
            },
            {
              "text": "Vous pourriez dire ce que vous perdez à ne pas quitter votre emploi ?",
              "label": "B"
            },
            {
              "text": "Vous pourriez dire ce que vous pourriez perdre à quitter votre emploi ?",
              "label": "C"
            }
          ]
        },
        {
          "id": 3,
          "text": "Étape 3 — Comment continuer ?",
          "options": [
            {
              "text": "Qu'est-ce qui vous retient de partir ?",
              "label": "A"
            },
            {
              "text": "Vous pourriez dire ce que vous gagnez à ne pas quitter votre emploi ?",
              "label": "B"
            },
            {
              "text": "Vous pourriez dire ce que vous pourriez gagner à quitter votre emploi ?",
              "label": "C"
            }
          ]
        },
        {
          "id": 4,
          "text": "Étape 4 — Dernière question pour compléter le raisonnement ?",
          "options": [
            {
              "text": "Vous pourriez dire ce que vous pourriez perdre à quitter votre emploi ?",
              "label": "A"
            },
            {
              "text": "Alors, vous allez quitter votre emploi ?",
              "label": "B"
            },
            {
              "text": "Vous pourriez dire ce que vous perdez à ne pas quitter votre emploi ?",
              "label": "C"
            }
          ]
        }
      ],
      "instruction": "Guidez M. Bertrand à travers les 4 étapes du Raisonnement Aporétique dans le bon ordre."
    },
    "answers": {
      "1": "A",
      "2": "B",
      "3": "C",
      "4": "A"
    }
  },
  {
    "id": "7369f264-c231-4d86-97b4-3bc7ed11d648",
    "number": 30,
    "title": "Labyrinthe du Processus de la Réunion",
    "type": "labyrinth",
    "content": {
      "scenario": "Vous menez votre première réunion de médiation entre deux collègues en conflit. Suivez les étapes du processus dans le bon ordre pour mener la réunion à bien.",
      "questions": [
        {
          "id": 1,
          "text": "Première étape — Comment débuter la réunion ?",
          "options": [
            {
              "text": "Accueil et contextualisation",
              "label": "A"
            },
            {
              "text": "Inventaire des points de désaccord",
              "label": "B"
            },
            {
              "text": "Rappel des 3 accords",
              "label": "C"
            }
          ]
        },
        {
          "id": 2,
          "text": "Deuxième étape — Que faire ensuite ?",
          "options": [
            {
              "text": "Projet de résolution",
              "label": "A"
            },
            {
              "text": "Bilan de la situation",
              "label": "B"
            },
            {
              "text": "Rappel des 3 accords",
              "label": "C"
            }
          ]
        },
        {
          "id": 3,
          "text": "Troisième étape — Comment poursuivre ?",
          "options": [
            {
              "text": "Inventaire",
              "label": "A"
            },
            {
              "text": "Projet de résolution",
              "label": "B"
            },
            {
              "text": "Bilan de la situation",
              "label": "C"
            }
          ]
        },
        {
          "id": 4,
          "text": "Quatrième étape — L'avant-dernière étape ?",
          "options": [
            {
              "text": "Rappel des 3 accords",
              "label": "A"
            },
            {
              "text": "Bilan",
              "label": "B"
            },
            {
              "text": "Projet de résolution",
              "label": "C"
            }
          ]
        },
        {
          "id": 5,
          "text": "Cinquième étape — Comment conclure ?",
          "options": [
            {
              "text": "Inventaire complémentaire",
              "label": "A"
            },
            {
              "text": "Retour à l'accueil",
              "label": "B"
            },
            {
              "text": "Projet",
              "label": "C"
            }
          ]
        }
      ],
      "instruction": "Retrouvez le bon enchaînement des étapes du processus de la réunion de médiation."
    },
    "answers": {
      "1": "A",
      "2": "C",
      "3": "A",
      "4": "B",
      "5": "C"
    }
  }
];

  for (const exercise of exercises) {
    await prisma.exercise.create({ data: exercise });
  }

  console.log(`Seed completed: ${exercises.length} exercises inserted.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });