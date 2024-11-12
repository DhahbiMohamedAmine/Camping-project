const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Allow all origins by default

app.use(cors({
  origin: 'http://localhost:3001' // Replace with the frontend URL
}));

app.use(express.json());
import userRouter from './routers/user.router';
import loginRouter from './routers/login.router';
import tripRouter from './routers/trip.router';
import reservationRouter from './routers/reservation.router';
const mysql = require('mysql');

export const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gestion_vol'
});

db.connect((err: Error ) => {
  if (err) {
    throw err;
  }
  console.log('MySQL connected ..');
});

app.listen(3000, () => {
  console.log('Server running at port 3000');
});


app.use("/user",userRouter)
app.use("/",loginRouter)
app.use("/trip",tripRouter)
app.use("/reservation",reservationRouter)