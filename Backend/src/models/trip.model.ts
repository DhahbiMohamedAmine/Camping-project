// trip.model.ts
export interface Trip {
    id?: number;  // Optionnel lors de l'insertion car généré par la BDD
    type: string;
    lieu_depart: string;
    lieu_destination: string;
    date_depart: Date;
    date_destination: Date;
    prix: number;
  }
  