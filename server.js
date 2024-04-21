const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors()); // Ermöglicht Cross-Origin Resource Sharing
app.use(express.static('public')); // Bedient Dateien aus dem 'public' Verzeichnis

const NOTES_FILE = './notes.json';

// Route, um die Startseite zu bedienen
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notizen.html'));
});

// Route, um Notizen zu speichern
app.post('/save-note', (req, res) => {
    let notes = [];
    if (fs.existsSync(NOTES_FILE)) {
        notes = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
    }
    notes.push(req.body); // Neue Notiz hinzufügen
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2), 'utf8'); // Notizen speichern
    res.send({ status: 'Note saved', note: req.body });
});

// Route, um gespeicherte Notizen zu laden
app.get('/load-notes', (req, res) => {
    if (fs.existsSync(NOTES_FILE)) {
        let notes = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
        res.send(notes);
    } else {
        res.send([]);
    }
});

// Optional: CORS Header für alle Anfragen setzen
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// Server starten
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.delete('/delete-note/:index', (req, res) => {
    const index = req.params.index;
    let notes = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));

    if (index >= 0 && index < notes.length) {
        notes.splice(index, 1);
        fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2), 'utf8');
        res.send({ status: 'Note deleted' });
    } else {
        res.status(404).send({ status: 'Note not found' });
    }
});

// Route, um den Favoritenstatus einer Notiz zu ändern
app.patch('/toggle-favorite/:index', (req, res) => {
    const index = parseInt(req.params.index);
    let notes = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));

    if (index >= 0 && index < notes.length) {
        notes[index].isFavorite = !notes[index].isFavorite; // Toggle the favorite status
        fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2), 'utf8');
        res.send({ status: 'Favorite toggled', note: notes[index] });
    } else {
        res.status(404).send({ status: 'Note not found' });
    }
});
