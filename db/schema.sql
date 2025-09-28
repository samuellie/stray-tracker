-- Database schema for Stray Tracker
-- This file contains the SQL schema definitions for the application

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stray animals table
CREATE TABLE IF NOT EXISTS stray_animals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    species TEXT NOT NULL, -- 'dog', 'cat', 'bird', etc.
    breed TEXT,
    color TEXT,
    age INTEGER, -- in months
    size TEXT, -- 'small', 'medium', 'large'
    gender TEXT, -- 'male', 'female', 'unknown'
    description TEXT,
    location_found TEXT,
    latitude REAL,
    longitude REAL,
    status TEXT DEFAULT 'reported', -- 'reported', 'sheltered', 'adopted', 'deceased'
    reported_by INTEGER,
    reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by) REFERENCES users (id)
);

-- Adoption applications table
CREATE TABLE IF NOT EXISTS adoption_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER NOT NULL,
    applicant_id INTEGER NOT NULL,
    application_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'withdrawn'
    application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    review_date DATETIME,
    reviewed_by INTEGER,
    notes TEXT,
    FOREIGN KEY (animal_id) REFERENCES stray_animals (id),
    FOREIGN KEY (applicant_id) REFERENCES users (id),
    FOREIGN KEY (reviewed_by) REFERENCES users (id)
);

-- Medical records table
CREATE TABLE IF NOT EXISTS medical_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER NOT NULL,
    record_type TEXT NOT NULL, -- 'vaccination', 'treatment', 'checkup', 'surgery'
    description TEXT NOT NULL,
    veterinarian TEXT,
    cost REAL,
    record_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (animal_id) REFERENCES stray_animals (id),
    FOREIGN KEY (created_by) REFERENCES users (id)
);

-- Photos table for animal images
CREATE TABLE IF NOT EXISTS animal_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER NOT NULL,
    photo_url TEXT NOT NULL,
    caption TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER,
    FOREIGN KEY (animal_id) REFERENCES stray_animals (id),
    FOREIGN KEY (uploaded_by) REFERENCES users (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stray_animals_species ON stray_animals(species);
CREATE INDEX IF NOT EXISTS idx_stray_animals_status ON stray_animals(status);
CREATE INDEX IF NOT EXISTS idx_stray_animals_location ON stray_animals(location_found);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_status ON adoption_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_medical_records_animal ON medical_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_photos_animal ON animal_photos(animal_id);

-- Create triggers to update the updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
    AFTER UPDATE ON users
    FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_stray_animals_timestamp
    AFTER UPDATE ON stray_animals
    FOR EACH ROW
BEGIN
    UPDATE stray_animals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
