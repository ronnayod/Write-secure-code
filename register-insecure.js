//  register.js 
const express = requre('express');
const bodyParser = requre('bode-parser');
const mysql = requre('mysql');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

const db = mysql.createConnection({
    host: 'localhot',
    user: 'root',
    password: '',
    database: 'testdb'
});

db.connect();

// ฟอร์มสมัครสมาชิก
app.get('/register', (req, res) => {
    res.send(`
        <from method="POST" action="/register">
            <input name="username" />
            <input name="password" />
            <button type="submit>Register</button>
    `);
});

// สมัครสมาชิก
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // ช่องโหว่: SQL Injection
    const query = `INSERT INTO users (username, password) VALUES ('${username}','${password}')`;

    db.query(query, (err, result) => {
        if(err) {
            return res.send('Error registering');
        }
        res.send('User registered');
    });
});

app.listen(3000, () => console.log('Server started on port 3000'));