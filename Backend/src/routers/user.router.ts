import { db } from "../server";
import express from 'express';

const router = express.Router();

// Get all users
router.get("/get", (req: any, res: any) => {
  const sql = 'SELECT * FROM user';
  db.query(sql, (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database query failed' });
    }
    res.send(result);
  });
});

// Get user by id
router.get("/get/:id", (req: any, res: any) => {
  const sql = 'SELECT * FROM user WHERE id = ?';
  const userId = req.params.id;

  db.query(sql, [userId], (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database query failed' });
    }
    if (result.length === 0) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send(result[0]);
  });
});

// Update user
router.put("/update/:id", (req: any, res: any) => {
  const userId = req.params.id;
  const { type, nom, prenom, email, telephone, cin } = req.body;

  if (!type || !nom || !prenom || !email || !telephone || !cin) {
    return res.status(400).send({ error: "All fields are required" });
  }

  // Build the SQL update query
  const sql = 'UPDATE user SET type = ?, nom = ?, prenom = ?, email = ?, telephone = ?, cin = ? WHERE id = ?';
  const values = [type, nom, prenom, email, telephone, cin, userId];

  db.query(sql, values, (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database update failed' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send({ message: 'User updated successfully' });
  });
});

// Delete user
router.delete("/delete/:id", (req: any, res: any) => {
  const userId = req.params.id;
  const sql = 'DELETE FROM user WHERE id = ?';

  db.query(sql, [userId], (err: any, result: any) => {
    if (err) {
      return res.status(500).send({ error: 'Database deletion failed' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send({ message: 'User deleted successfully' });
  });
});

export default router;
