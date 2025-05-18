const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./hospital.db');

// نستخدم serialize لضمان ترتيب العمليات
db.serialize(() => {
    // users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'pending'
    )`);

    // doctors table
    db.run(`CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Create appointments table
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT DEFAULT 'upcoming',
        FOREIGN KEY(patient_id) REFERENCES users(id),
        FOREIGN KEY(doctor_id) REFERENCES doctors(id)
    )`);
});

// Sign up API
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    db.run(
        `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
        [name, email, hash],
        function(err) {
            if (err) return res.status(400).json({ error: 'Email already exists' });
            res.json({ success: true, userId: this.lastID });
        }
    );
});

// Login API
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });
        if (!bcrypt.compareSync(password, user.password))
            return res.status(400).json({ error: 'Invalid credentials' });
        res.json({ id: user.id, name: user.name, role: user.role });
    });
});

// Assign role to user
app.post('/assign-role', (req, res) => {
    const { userId, role, specialty } = req.body;
    db.run(`UPDATE users SET role = ? WHERE id = ?`, [role, userId], function(err) {
        if (err) return res.status(400).json({ error: 'Update failed' });

        if (role === 'doctor' && specialty) {
            db.get(`SELECT * FROM doctors WHERE user_id = ?`, [userId], (err, doctor) => {
                if (doctor) {
                    db.run(`UPDATE doctors SET specialty = ? WHERE user_id = ?`, [specialty, userId]);
                } else {
                    db.get(`SELECT name FROM users WHERE id = ?`, [userId], (err, user) => {
                        if (user) {
                            db.run(`INSERT INTO doctors (user_id, name, specialty) VALUES (?, ?, ?)`, [userId, user.name, specialty]);
                        }
                    });
                }
            });
        }
        res.json({ success: true });
    });
});

// Get all users
app.get('/users', (req, res) => {
    db.all(`SELECT id, name, email, role FROM users`, [], (err, rows) => {
        res.json(rows);
    });
});

// Get all doctors
app.get('/doctors', (req, res) => {
    db.all(`SELECT * FROM doctors`, [], (err, rows) => {
        res.json(rows);
    });
});

// Get doctor by user_id
app.get('/doctor/:user_id', (req, res) => {
    db.get(`SELECT * FROM doctors WHERE user_id = ?`, [req.params.user_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch doctor record' });
        res.json(row);
    });
});

// Book appointment
app.post('/appointments', (req, res) => {
    const { patient_id, doctor_id, date, time } = req.body;
    db.run(
        `INSERT INTO appointments (patient_id, doctor_id, date, time) VALUES (?, ?, ?, ?)`,
        [patient_id, doctor_id, date, time],
        function(err) {
            if (err) return res.status(400).json({ error: 'Booking failed' });
            res.json({ success: true, appointmentId: this.lastID });
        }
    );
});

// Get appointments for a patient
app.get('/appointments/patient/:patient_id', (req, res) => {
    db.all(
        `SELECT a.*, d.name as doctor_name, d.specialty FROM appointments a 
         JOIN doctors d ON a.doctor_id = d.id 
         WHERE a.patient_id = ? ORDER BY date DESC, time DESC`,
        [req.params.patient_id],
        (err, rows) => {
            res.json(rows);
        }
    );
});

// Get appointments for a doctor
app.get('/appointments/doctor/:doctor_id', (req, res) => {
    db.all(
        `SELECT a.*, u.name as patient_name FROM appointments a 
         JOIN users u ON a.patient_id = u.id 
         WHERE a.doctor_id = ? ORDER BY date DESC, time DESC`,
        [req.params.doctor_id],
        (err, rows) => {
            res.json(rows);
        }
    );
});

app.patch('/appointments/:id', (req, res) => {
    const { status } = req.body; // e.g.: "completed"
    const { id } = req.params;
    db.run(
        `UPDATE appointments SET status = ? WHERE id = ?`,
        [status, id],
        function(err) {
            if (err) return res.status(400).json({ error: 'Failed to update appointment' });
            res.json({ success: true });
        }
    );
});

// Start server
app.listen(3001, () => console.log('Server running on http://localhost:3001'));
