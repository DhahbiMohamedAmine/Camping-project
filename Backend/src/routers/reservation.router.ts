import { db } from "../server";
import express from 'express';

const router = express.Router();

// Make a reservation
router.post("/create", (req: any, res: any) => {
  const { user_id, trip_id, date_reservation, status } = req.body;

  if (!user_id || !trip_id || !date_reservation || !status) {
    return res.status(400).send({ error: "All fields are required" });
  }

  // Check if the user has already made a reservation for the trip
  const checkExistingReservationSql = 'SELECT * FROM reservation WHERE user_id = ? AND trip_id = ?';
  db.query(checkExistingReservationSql, [user_id, trip_id], (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database query failed' });
    }
    if (result.length > 0) {
      return res.status(400).send({ error: 'User has already reserved for this trip' });
    }

    // Check available places for the trip
    const checkPlacesSql = 'SELECT nb_place FROM trip WHERE id = ?';
    db.query(checkPlacesSql, [trip_id], (err: any, result: any) => {
      if (err) {
        return res.status(500).send({ error: 'Database query failed' });
      }
      if (result.length === 0) {
        return res.status(404).send({ error: 'Trip not found' });
      }

      const availablePlaces = result[0].nb_place;
      if (availablePlaces <= 0) {
        return res.status(400).send({ error: 'No available places' });
      }

      // Proceed with the reservation
      const createReservationSql = 'INSERT INTO reservation (user_id, trip_id, date_reservation, status) VALUES (?, ?, ?, ?)';
      db.query(createReservationSql, [user_id, trip_id, date_reservation, status], (err: any, result: any) => {
        if (err) {
          return res.status(500).send({ error: 'Database insertion failed' });
        }

        // Update the number of available places for the trip
        const updatePlacesSql = 'UPDATE trip SET nb_place = nb_place - 1 WHERE id = ?';
        db.query(updatePlacesSql, [trip_id], (err: any, updateResult: any) => {
          if (err) {
            return res.status(500).send({ error: 'Failed to update trip places' });
          }
          res.send({ message: 'Reservation created successfully', reservationId: result.insertId });
        });
      });
    });
  });
});

// Get all reservations
router.get("/get", (req: any, res: any) => {
  const sql = 'SELECT * FROM reservation';
  db.query(sql, (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database query failed' });
    }
    res.send(result);
  });
});

// Get reservation by id
router.get("/get/:id", (req: any, res: any) => {
  const reservationId = req.params.id;
  const sql = 'SELECT * FROM reservation WHERE id = ?';
  db.query(sql, [reservationId], (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database query failed' });
    }
    if (result.length === 0) {
      return res.status(404).send({ error: 'Reservation not found' });
    }
    res.send(result[0]);
  });
});

// Update reservation
router.put("/update/:id", (req: any, res: any) => {
  const reservationId = req.params.id;
  const { user_id, trip_id, date_reservation, status } = req.body;

  if (!user_id || !trip_id || !date_reservation || !status) {
    return res.status(400).send({ error: "All fields are required" });
  }

  // Get current reservation details
  const getReservationSql = 'SELECT * FROM reservation WHERE id = ?';
  db.query(getReservationSql, [reservationId], (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database query failed' });
    }
    if (result.length === 0) {
      return res.status(404).send({ error: 'Reservation not found' });
    }

    // Update the reservation
    const updateReservationSql = 'UPDATE reservation SET user_id = ?, trip_id = ?, date_reservation = ?, status = ? WHERE id = ?';
    db.query(updateReservationSql, [user_id, trip_id, date_reservation, status, reservationId], (err: any, updateResult: any) => {
      if (err) {
        return res.status(500).send({ error: 'Database update failed' });
      }
      res.send({ message: 'Reservation updated successfully' });
    });
  });
});

// Delete reservation
router.delete("/delete/:id", (req: any, res: any) => {
  const reservationId = req.params.id;

  // Get the reservation details before deletion
  const getReservationSql = 'SELECT * FROM reservation WHERE id = ?';
  db.query(getReservationSql, [reservationId], (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database query failed' });
    }
    if (result.length === 0) {
      return res.status(404).send({ error: 'Reservation not found' });
    }

    const reservation = result[0];

    // Delete the reservation
    const deleteReservationSql = 'DELETE FROM reservation WHERE id = ?';
    db.query(deleteReservationSql, [reservationId], (err: any, deleteResult: any) => {
      if (err) {
        return res.status(500).send({ error: 'Database deletion failed' });
      }

      // Update the number of available places for the trip
      const updatePlacesSql = 'UPDATE trip SET nb_place = nb_place + 1 WHERE id = ?';
      db.query(updatePlacesSql, [reservation.trip_id], (err: any, updatePlacesResult: any) => {
        if (err) {
          return res.status(500).send({ error: 'Failed to update trip places' });
        }
        res.send({ message: 'Reservation deleted successfully' });
      });
    });
  });
});

// Fetch reservation history for a specific user
router.get("/history/:userId", (req: any, res: any) => {
  const userId = req.params.userId;
  console.log("Received User ID:", userId); // Debug log

  const sql = `
    SELECT 
      r.id AS reservation_id, 
      r.date_reservation, 
      r.status,
      t.id AS trip_id, 
      t.lieu_depart, 
      t.lieu_destination, 
      t.date_depart, 
      t.date_destination, 
      t.prix, 
      t.type
    FROM 
      reservation r
    JOIN 
      trip t ON r.trip_id = t.id
    WHERE 
      r.user_id = ?
    ORDER BY 
      r.date_reservation DESC
  `;

  db.query(sql, [userId], (err: any, result: any) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send({ error: 'Database query failed' });
    }
    console.log("Result Length:", result.length); // Debug log
    if (result.length === 0) {
      return res.status(404).send({ message: 'No reservations found for this user' });
    }
    res.send(result);
  });
});
router.post("/check", (req: any, res: any) => {
  const { user_id, trip_id } = req.body;

  if (!user_id || !trip_id) {
    return res.status(400).send({ error: "User ID and Trip ID are required" });
  }

  const sql = 'SELECT * FROM reservation WHERE user_id = ? AND trip_id = ?';
  db.query(sql, [user_id, trip_id], (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database query failed' });
    }
    res.send({ isRegistered: result.length > 0 });
  });
});

// Cancel a reservation
router.post("/cancel", (req: any, res: any) => {
  const { user_id, trip_id } = req.body;

  if (!user_id || !trip_id) {
    return res.status(400).send({ error: "User ID and Trip ID are required" });
  }

  // First, check if the reservation exists
  const checkSql = 'SELECT * FROM reservation WHERE user_id = ? AND trip_id = ?';
  db.query(checkSql, [user_id, trip_id], (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database query failed' });
    }
    if (result.length === 0) {
      return res.status(404).send({ error: 'Reservation not found' });
    }

    // If reservation exists, proceed with cancellation
    const cancelSql = 'DELETE FROM reservation WHERE user_id = ? AND trip_id = ?';
    db.query(cancelSql, [user_id, trip_id], (err: any, deleteResult: any) => {
      if (err) {
        return res.status(500).send({ error: 'Failed to cancel reservation' });
      }

      // Update the number of available places for the trip
      const updatePlacesSql = 'UPDATE trip SET nb_place = nb_place + 1 WHERE id = ?';
      db.query(updatePlacesSql, [trip_id], (err: any, updateResult: any) => {
        if (err) {
          return res.status(500).send({ error: 'Failed to update trip places' });
        }
        res.send({ message: 'Reservation cancelled successfully' });
      });
    });
  });
});

export default router;
