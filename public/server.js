const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Melayani file index.html dari folder public

// Koneksi Database (Railway otomatis menyediakan variable ini)
const db = mysql.createConnection({
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'railway',
    port: process.env.MYSQLPORT || 3306
});

db.connect((err) => {
    if (err) {
        console.error('Database koneksi error: ' + err.stack);
        return;
    }
    console.log('Terhubung ke Database MySQL Railway');
});

// --- API LOGIN ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username = ? AND password = ?";
    
    db.query(query, [username, password], (err, results) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        if (results.length > 0) {
            res.json({ status: 'success', nama: results[0].nama_display, role: results[0].role });
        } else {
            res.json({ status: 'error', message: 'Username/Password Salah!' });
        }
    });
});

// --- API AMBIL SEMUA PELANGGAN ---
app.get('/api/pelanggan', (req, res) => {
    db.query("SELECT * FROM pelanggan ORDER BY tgl_daftar DESC", (err, results) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        res.json(results);
    });
});

// Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server jalan di port ${PORT}`);
});
