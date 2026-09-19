import { PresetSample } from '../types';

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'paypal_phish',
    name: 'Alerte PayPal (Compte suspendu)',
    badge: 'Email Phishing',
    category: 'email',
    difficulty: 'Dangereux',
    description: 'Urgence artificielle, demande d\'identifiants et menace de suspension sous 24h.',
    content: `De : Service Client PayPal <support-securite@paypal-verification-account.xyz>
À : vous@exemple.com
Objet : URGENT : Votre compte PayPal a été suspendu temporairement !

Cher client,

Nous avons détecté une activité inhabituelle sur votre compte. Conformément à nos protocoles de sécurité, votre compte a été suspendu pour prévenir tout accès frauduleux.

Action requise immédiate :
Vous devez confirmer vos informations personnelles sous 24 heures, dernier délai avant fermeture définitive de votre compte.

Veuillez cliquer sur le lien ci-dessous pour vérifier votre mot de passe et réactiver votre compte :
https://paypa1-security-center.com/login?token=92847291

Lors de votre connexion, il vous sera demandé de saisir votre mot de passe ainsi que votre numéro de carte bancaire pour certifier votre identité.

Cordialement,
Le Service de Sécurité PayPal`,
  },
  {
    id: 'typosquatting_url',
    name: 'URL Typosquatting (amaz0n)',
    badge: 'URL Suspecte',
    category: 'url',
    difficulty: 'Dangereux',
    description: 'Imitation d\'Amazon avec substitution leetspeak (0 à la place de o) et extension à risque.',
    content: `https://amaz0n-secure-verification.xyz/fr/signin?redirect=order_id_4920`,
  },
  {
    id: 'colis_chronopost',
    name: 'Faux Colis Chronopost (SMS/Email)',
    badge: 'Arnaque Colis',
    category: 'email',
    difficulty: 'Dangereux',
    description: 'Colis bloqué, petits frais d\'affranchissement réclamés et lien raccourci suspect.',
    content: `Chronopost Info : Votre colis n° FR-9482931 n'a pas pu être livré en raison d'une adresse incomplète.

Frais de port restants en attente d'affranchissement : 1,99 €.
Dernier avis avant retour du colis à l'expéditeur sous 48h.

Cliquez ici pour reprogrammer la livraison et régler les frais :
https://bit.ly/chronopost-colis-suivi-948`,
  },
  {
    id: 'ameli_refund',
    name: 'Faux Remboursement Ameli',
    badge: 'Fausse Administration',
    category: 'email',
    difficulty: 'Dangereux',
    description: 'Miroir financier d\'un trop-perçu avec collecte de numéro fiscal et carte vitale.',
    content: `De : Assurance Maladie <contact-ameli@gmail.com>
Objet : Notification de remboursement en votre faveur

Cher assuré(e),

Après les derniers calculs de vos droits de santé, vous bénéficiez d'un remboursement d'un trop-perçu de 312,50 €.

Cette somme est en attente sur votre dossier médical. Pour déclencher le virement sous 24 heures, vous devez actualiser votre dossier et valider votre Carte Vitale v3.

Veuillez confirmer vos coordonnées bancaires et votre numéro de sécurité sociale ici :
http://185.220.101.42/ameli-portail/remboursement`,
  },
  {
    id: 'legit_order',
    name: 'Email Légitime (Exemple Sûr)',
    badge: 'Message Sûr',
    category: 'email',
    difficulty: 'Sûr',
    description: 'Notification standard sans pression, sans demande d\'identifiants, avec domaine officiel.',
    content: `De : Confirmation de commande <auto-confirm@amazon.fr>
À : jean.dupont@email.com
Objet : Votre commande Amazon.fr n° 408-1928492 a bien été expédiée

Bonjour Jean Dupont,

Votre colis contenant "Livre Clean Code" a été expédié aujourd'hui par notre transporteur partenaire.
La livraison est estimée entre le mardi 22 et le mercredi 23.

Vous pouvez suivre l'acheminement de votre colis à tout moment en vous connectant directement à votre compte sur notre site officiel :
https://www.amazon.fr/gp/your-account/order-history

Merci pour votre confiance.
L'équipe Amazon.fr`,
  },
];
