import React, { useEffect, useState } from 'react';
import './Cards.css';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import axios from 'axios';

function Cards() {
    const [notes, setNotes] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleCreateClick = () => setShowForm(true);

    useEffect(() => {
        fetchNotes();
    }, []);

    async function fetchNotes() {
        const response = await axios.get('http://localhost:4000/api/notes');
        setNotes(response.data);
    }

    const handleCancel = () => {
        setShowForm(false);
        setEditingNote(null);
        setTitle('');
        setContent('');
    };

    const handleEditClick = (note) => {
        setEditingNote(note);
        setTitle(note.title || '');
        setContent(note.description || note.content || '');
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() && !content.trim()) return;

        const noteData = { title: title.trim(), description: content.trim() };
        const response = editingNote
            ? await axios.put(`http://localhost:4000/api/notes/${editingNote._id}`, noteData)
            : await axios.post('http://localhost:4000/api/notes', noteData);

        setNotes(prev => editingNote
            ? prev.map(note => note._id === editingNote._id ? response.data : note)
            : [response.data, ...prev]);
        handleCancel();
    }

    async function deleteNote(id) {
        await axios.delete(`http://localhost:4000/api/notes/${id}`);
        setNotes(prev => prev.filter(note => note._id !== id));
    }



    return (
        <div className='Cards-container'>
            <div>
                {!showForm ? (
                    <button className='btn' onClick={handleCreateClick}>Create</button>
                ) : (
                    <form onSubmit={handleSubmit} className='note-form'>
                        <input
                            type='text'
                            placeholder='Note Title'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <textarea
                            placeholder='Note Content'
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <div className='form-actions'>
                            <button className='btn' type='submit'>{editingNote ? 'Update' : 'Submit'}</button>
                            <button className='btn' type='button' onClick={handleCancel}>Cancel</button>
                        </div>
                    </form>
                )}
            </div>

            {notes.map((value) => (
                <div className='Card' key={value._id}>
                    <h1>{value.title}</h1>
                    <p>{value.title}</p>
                    <p>{value.description || value.content}</p>
                    <div className='Card-actions'>
                        <button className='Card-btn' onClick={() => handleEditClick(value)} aria-label={`edit-${value._id}`}>
                            <EditRoundedIcon />
                        </button>
                        <button className='Card-btn' onClick={() => deleteNote(value._id)} aria-label={`delete-${value._id}`}>
                            <DeleteForeverRoundedIcon />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Cards;