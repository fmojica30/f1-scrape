import express, {Request, Response} from 'express';
import mysql from 'mysql';

const app = express();

const connectionString = process.env.DATABASE_URL || '';
const connection = mysql.createConnection(connectionString);
connection.connect();

app.get('/api/characters', (req: Request, res: Response) => {
  const query = 'Select * from Characters;';
  connection.query(query, (err, rows) => {
    const retVal = {
      data: rows.length > 0 ? rows[0] : null,
      message: rows.length === 0 ? 'No Records Found' : 'Success'
    }
    return res.send(retVal);
  })
});

app.get('/api/characters/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  res.send('It works for id: ' + id);
});


const port = process.env.PORT || 3000;
app.listen(port, ()=> {
  console.log('App is running')
});