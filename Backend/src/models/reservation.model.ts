// reservation.model.ts

export interface Reservation {
    id: number;
    user_id: number;
    trip_id: number;
    date_reservation: Date;
    status: string; // e.g., 'pending', 'confirmed', 'canceled'
  }
  