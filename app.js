const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Replace with your MySQL password
});

db.query('CREATE DATABASE IF NOT EXISTS consap_db', (err) => {
  if (err) {
    console.error('Error creating database:', err);
    return;
  }
  console.log('Database created or already exists.');

  const dbConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Replace with your MySQL password
    database: 'consap_db'
  });

  dbConnection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Connected to the database.');

    dbConnection.query(`
      CREATE TABLE IF NOT EXISTS csv_data (
        uique_id INT AUTO_INCREMENT PRIMARY KEY,
        id INT,
        postId VARCHAR(255),
        name VARCHAR(255),
        email VARCHAR(255),
        body VARCHAR(255)
      )
    `, (err, result) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('Table created or already exists.');
      }
    });

    app.post('/upload_csv', multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
          cb(null, Date.now() + '-' + file.originalname);
        }
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, 
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv') {
          cb(null, true);
        } else {
          cb(new Error('Only CSV files are allowed!'), false);
        }
      }
    }).single('csvFile'), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      console.log(`File uploaded: ${req.file.originalname}`);
      console.log(`File size: ${req.file.size} bytes`);

      let rowCount = 0;

      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (row) => {
            console.log("data",row)
          dbConnection.query('INSERT INTO csv_data (id, postId, name, email, body) VALUES (?, ?, ?, ?,?)', 
            [row.id,row.postId, row.name, row.email, row.body], 
            (err, result) => {
              if (err) {
                console.error('Error inserting row into database:', err);
              } else {
                rowCount++;
              }
            }
          );
        })
        .on('end', () => {
          console.log(`Total rows processed and saved: ${rowCount}`);
          res.status(200).json({ message: 'File uploaded and data stored successfully', rowCount: rowCount });
          fs.unlinkSync(req.file.path);
        })
        .on('error', (error) => {
          console.error('Error reading the CSV file:', error);
          res.status(500).json({ message: 'Error processing the file', error: error.message });
        });
    });


    app.get('/getdata', (req, res) => {
        dbConnection.query('SELECT * FROM csv_data', (err, results) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Error fetching data from database');
            }
            res.json(results);
          });
      });

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  });
});
