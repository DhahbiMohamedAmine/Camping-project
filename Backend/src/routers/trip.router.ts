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


export default router;
