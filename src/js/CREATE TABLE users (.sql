CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'pending' -- 'pending', 'patient', 'doctor', 'staff', 'admin'
);

-- Staff assigns roles later:
-- UPDATE users SET role='doctor' WHERE id=2;