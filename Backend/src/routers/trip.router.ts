// routes/trip.routes.ts
import { db } from "../server";
import express from 'express';

const router = express.Router();

// Get all trips
router.get("/get", (req: any, res: any) => {
  const sql = 'SELECT * FROM trip';
  db.query(sql, (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database query failed' });
    }
    res.send(result);
  });
});

// Get trip by id
router.get("/get/:id", (req: any, res: any) => {
  const sql = 'SELECT * FROM trip WHERE id = ?';
  const tripId = req.params.id;

  db.query(sql, [tripId], (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database query failed' });
    }
    if (result.length === 0) {
      return res.status(404).send({ error: 'Trip not found' });
    }
    res.send(result[0]);
  });
});

//rechercher
router.get("/filtrer", (req: any, res: any) => {
    const { prix_min, prix_max, date_depart, date_arrivee, type, lieu_arrive } = req.query;
  
    // Construction de la requête SQL
    let sql = 'SELECT * FROM trip WHERE 1=1'; // 1=1 est un truc pour faciliter l'ajout de conditions
    const params: any[] = [];
  
    // Filtrer par prix minimum
    if (prix_min) {
      sql += ' AND prix >= ?';
      params.push(prix_min);
    }
  
    // Filtrer par prix maximum
    if (prix_max) {
      sql += ' AND prix <= ?';
      params.push(prix_max);
    }
  
    // Filtrer par date de départ
    if (date_depart) {
      sql += ' AND date_depart >= ?';
      params.push(date_depart);
    }
  
    // Filtrer par date d'arrivée
    if (date_arrivee) {
      sql += ' AND date_destination <= ?';
      params.push(date_arrivee);
    }
  
    // Filtrer par type de voyage
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
  
    // Filtrer par lieu d'arrivée
    if (lieu_arrive) {
      sql += ' AND lieu_destination = ?';
      params.push(lieu_arrive);
    }
  
    // Exécution de la requête
    db.query(sql, params, (err: any, result: any) => {
      if (err) {
        return res.status(500).send({ error: 'Database query failed' });
      }
      res.send(result);
    });
  });
  //rechercher
  router.get("/search", (req: any, res: any) => {
    const { query } = req.query;

    // Check if the query parameter is provided
    if (!query) {
        return res.status(400).send({ error: 'Please provide a search term' });
    }

    // Construct the SQL query to search in both `lieu_destination`, `type`, and `prix`
    const sql = `
        SELECT * 
        FROM trip 
        WHERE lieu_destination LIKE ? 
        OR type LIKE ? 
        OR prix LIKE ?
    `;
    const params = [`%${query}%`, `%${query}%`, `%${query}%`]; // Including prix as well

    // Execute the query
    db.query(sql, params, (err: any, result: any) => {
        if (err) {
            return res.status(500).send({ error: 'Database query failed' });
        }
        res.send(result);
    });
});


// Submit rating for a trip
router.post("/rate", (req: any, res: any) => {
  const { trip_id, user_id, rating } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).send({ error: 'Rating must be between 1 and 5' });
  }

  // Insert the rating into the database
  const sql = 'INSERT INTO ratings (trip_id, user_id, rating) VALUES (?, ?, ?)';
  db.query(sql, [trip_id, user_id, rating], (err: any) => {
    if (err) {
      return res.status(500).send({ error: err +'Database query failed' });
    }

    // Recalculate the average rating for the trip
    const updateAvgRatingSql = `
      SELECT AVG(rating) as average_rating FROM ratings WHERE trip_id = ?
    `;
    db.query(updateAvgRatingSql, [trip_id], (err: any, result: any) => {
      if (err) {
        return res.status(500).send({ error: 'Error calculating average rating' });
      }

      const avgRating = result[0].average_rating;
      const updateTripRatingSql = 'UPDATE trip SET average_rating = ? WHERE id = ?';
      db.query(updateTripRatingSql, [avgRating, trip_id], (err: any) => {
        if (err) {
          return res.status(500).send({ error: 'Error updating trip rating' });
        }
        res.send({ success: true });
      });
    });
  });
});

// Get the average rating of a trip
router.get("/rating/:trip_id", (req: any, res: any) => {
  const tripId = req.params.trip_id;
  const sql = 'SELECT average_rating FROM trip WHERE id = ?';

  db.query(sql, [tripId], (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database query failed' });
    }

    if (result.length === 0) {
      return res.status(404).send({ error: 'Trip not found' });
    }

    res.send({ average_rating: result[0].average_rating });
  });
});

// Create a trip
router.post("/create", (req: any, res: any) => {
  const {
    type,
    lieu_depart,
    lieu_destination,
    date_depart,
    date_destination,
    prix,
    nb_place,
    description,
    photo,
  } = req.body;

  // Validate required fields
  if (!type || !lieu_depart || !lieu_destination) {
    return res.status(400).json({ error: "Type, Lieu Depart, and Lieu Destination are required" });
  }

  // SQL query with optional fields for date_depart, date_destination, prix, nb_place, description, photo
  const sql = `
    INSERT INTO trip 
    (type, lieu_depart, lieu_destination, date_depart, date_destination, prix, nb_place, description, photo, average_rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`;

  const params = [
    type,
    lieu_depart,
    lieu_destination,
    date_depart || null,
    date_destination || null,
    prix ? parseFloat(prix) : null, // Ensure prix is a number or null
    nb_place ? parseInt(nb_place, 10) : null, // Ensure nb_place is an integer or null
    description || null,
    photo || null,
  ];

  db.query(sql, params, (err: any, result: any) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Database insertion failed", details: err.message });
    }
    res.json({ message: "Trip created successfully", tripId: result.insertId });
  });
});


// Update a trip
router.put("/update/:id", (req: any, res: any) => {
  const tripId = req.params.id;
  const { nb_place, description, photo } = req.body;

  // Build dynamic SQL query
  const sql = `
    UPDATE trip
    SET nb_place = ?, description = ?, photo = ?
    WHERE id = ?`;

  const params = [nb_place, description, photo, tripId];

  db.query(sql, params, (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: "Database update failed" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ error: "Trip not found" });
    }
    res.send({ message: "Trip updated successfully" });
  });
});



// Delete a trip
// Delete a trip and associated ratings
router.delete("/delete/:id", (req, res) => {
  const tripId = req.params.id;

  // First, check if there are any ratings for the trip
  const checkRatingsSql = "SELECT COUNT(*) AS count FROM ratings WHERE trip_id = ?";
  db.query(checkRatingsSql, [tripId], (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: "Database query failed" });
    }

    if (result[0].count > 0) {
      // If there are ratings, remove them first
      const deleteRatingsSql = "DELETE FROM ratings WHERE trip_id = ?";
      db.query(deleteRatingsSql, [tripId], (err: any) => {
        if (err) {
          return res.status(500).send({ error: "Failed to delete ratings" });
        }

        // After deleting ratings, proceed with deleting the trip
        const deleteTripSql = "DELETE FROM trip WHERE id = ?";
        db.query(deleteTripSql, [tripId], (err: any, result: any) => {
          if (err) {
            return res.status(500).send({ error: "Database deletion failed" });
          }
          if (result.affectedRows === 0) {
            return res.status(404).send({ error: "Trip not found" });
          }
          res.send({ message: "Trip and associated ratings deleted successfully" });
        });
      });
    }
  });
});




export default router;











