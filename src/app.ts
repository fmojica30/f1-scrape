import express, {Request, Response} from 'express';
import mysql from 'mysql';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const connectionString = process.env.DATABASE_URL || '';
const connection = mysql.createConnection(connectionString);
connection.connect();

app.get('/api/drivers', (req: Request, res: Response) => {
  const query = 'Select * from Characters;';
  connection.query(query, (err, rows) => {
    if (err) throw err;

    const retVal = {
      data: rows.length > 0 ? rows[0] : null,
      message: rows.length === 0 ? 'No Records Found' : 'Success'
    }
    return res.send(retVal);
  })
});

const port = process.env.PORT || 3000;
app.listen(port, ()=> {
  console.log('App is running')
});