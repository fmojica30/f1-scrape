import express from 'express';
import mysql from 'mysql';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const connectionString = process.env.DATABASE_URL || 'mysql://i12ibs2htniagsw7ez47:pscale_pw_wxYuTbCt2FqodoYvqGyyLx9YpgqCZvTsXGuEr3xVJ8n@us-east.connect.psdb.cloud/f1api?ssl={"rejectUnauthorized":true}';
const connection = mysql.createConnection(connectionString);
connection.connect();
app.get('/api/drivers', (req, res) => {
    const query = 'select * from driver';
    connection.query(query, (err, rows) => {
        if (err)
            throw err;
        console.log(rows);
        const retVal = {
            data: rows,
            message: rows.length === 0 ? 'No Records Found' : 'Success'
        };
        return res.send(retVal);
    });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('App is running');
});
//# sourceMappingURL=app.js.map