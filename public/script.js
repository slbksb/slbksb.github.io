document.addEventListener('DOMContentLoaded', loadNotes);

const addButton = document.querySelector('#add-note-btn');
addButton.addEventListener('click', addNote);

function addNote() {
    const noteTitle = prompt('Gib einen Titel für die Notiz ein:');
    if (!noteTitle) return;
    const noteContent = prompt('Gib den Inhalt der Notiz ein:');
    if (!noteContent) return;

    const note = { title: noteTitle, content: noteContent };

    fetch('/save-note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
    })
    .then(response => response.json())
    .then(data => {
        createNoteElement(data.note);
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function loadNotes() {
    fetch('/load-notes')
    .then(response => response.json())
    .then(notes => {
        const notesContainer = document.querySelector('#notes-container');
        notesContainer.innerHTML = ''; // Leere den Container vor dem Neuladen
        notes.forEach((note, index) => createNoteElement(note, index));
    });
}

function updateNotesPeriodically() {
    setInterval(loadNotes, 3000); // Alle 3 Sekunden aktualisieren
}

function createNoteElement(note, index) {
    const notesContainer = document.querySelector('#notes-container');
    const newNote = document.createElement('div');
    const deleteButton = document.createElement('button');

    deleteButton.textContent = '✖';
    deleteButton.className = 'delete-note-btn';
    deleteButton.onclick = function() { deleteNote(index); };

    newNote.classList.add('note');
    newNote.innerHTML = `<h2>${note.title}</h2><p>${parseContent(note.content)}</p>`;
    newNote.appendChild(deleteButton);

    // Füge die neue Notiz am Anfang des Containers hinzu
    if (notesContainer.firstChild) {
        notesContainer.insertBefore(newNote, notesContainer.firstChild);
    } else {
        notesContainer.appendChild(newNote);
    }
}

function deleteNote(index) {
    fetch(`/delete-note/${index}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        loadNotes(); // Aktualisiere die Notizliste
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function parseContent(content) {
    // Regex, um Links zu erkennen
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    // Ersetze Links durch anklickbare HTML-Links
    return content.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
}

// Rufe die Notizen zum ersten Mal auf, wenn die Seite geladen ist
loadNotes();

// Aktualisiere die Notizen alle 3 Sekunden
updateNotesPeriodically();


function createNoteElement(note, index) {
    const notesContainer = document.querySelector('#notes-container');
    const newNote = document.createElement('div');
    const deleteButton = document.createElement('button');
    const favoriteButton = document.createElement('button');

    // Stern-Button Setup
    favoriteButton.innerHTML = '&#9733;'; // Stern-Symbol
    favoriteButton.className = 'favorite-note-btn';
    favoriteButton.style.backgroundColor = note.isFavorite ? 'gold' : 'yellow';
    favoriteButton.onclick = function() { toggleFavorite(index); };

    deleteButton.textContent = '✖';
    deleteButton.className = 'delete-note-btn';
    deleteButton.onclick = function() { deleteNote(index); };

    newNote.classList.add('note');
    if (note.isFavorite) {
        newNote.classList.add('favorite'); // Fügt die 'favorite' Klasse hinzu, wenn die Notiz favorisiert ist
    }
    newNote.innerHTML = `<h2>${note.title}</h2><p>${parseContent(note.content)}</p>`;
    newNote.appendChild(favoriteButton);
    newNote.appendChild(deleteButton);

    // Füge die neue Notiz am Anfang des Containers ein, wenn sie favorisiert ist
    if (note.isFavorite) {
        notesContainer.insertBefore(newNote, notesContainer.firstChild);
    } else {
        notesContainer.appendChild(newNote);
    }
}

function toggleFavorite(index) {
    fetch(`/toggle-favorite/${index}`, {
        method: 'PATCH'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        loadNotes(); // Reload the notes to reflect changes
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}