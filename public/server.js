const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Melayani file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Koneksi Database
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
});

// Perbaikan cara cek koneksi agar tidak crash
db.connect((err) => {
    if (err) {
        console.error('DATABASE GAGAL KONEK: ' + err.message);
        // Jangan hentikan server, tapi log saja errornya
    } else {
        console.log('DATABASE BERHASIL TERHUBUNG!');
    }
});
// --- API LOGIN ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username = ? AND password = ?";
    
    db.query(query, [username, password], (err, results) => {
        if (err) return res.status(500).json({ status: 'error', message: "Database Error" });
        
        if (results.length > 0) {
            res.json({ 
                status: 'success', 
                nama: results[0].nama_display, 
                role: results[0].role 
            });
        } else {
            res.json({ status: 'error', message: 'Username atau Password salah!' });
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

// Jalankan Server (Settingan Port untuk Railway)
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server aktif di port ${PORT}`);
});
