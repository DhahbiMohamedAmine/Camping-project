// user.model.ts
export interface User {
    id?: number;  // Optionnel lors de l'insertion car généré par la BDD
    type: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    cin: string;
    password: string; // Champ ajouté pour le mot de passe haché
  }
  