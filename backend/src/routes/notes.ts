import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import Note from '../models/Note';
import Folder from '../models/Folder';

const router = express.Router();

// Get notes by folder
router.get('/folder/:folderId', authenticate, async (req: any, res, next) => {
  try {
    const notes = await Note.find({
      folderId: req.params.folderId,
      userId: req.user._id
    }).sort({ updatedAt: -1 });

    res.json(notes.map(note => ({
      id: note._id,
      title: note.title,
      content: note.content,
      type: note.type,
      color: note.color,
      folderId: note.folderId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    })));
  } catch (error) {
    next(error);
  }
});

// Get single note
router.get('/:id', authenticate, async (req: any, res, next) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      id: note._id,
      title: note.title,
      content: note.content,
      type: note.type,
      color: note.color,
      folderId: note.folderId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

// Create note
router.post('/', authenticate, [
  body('title').trim().isLength({ min: 1 }),
  body('folderId').isMongoId(),
  body('content').optional().isString(),
  body('type').optional().isIn(['text', 'handwritten']),
  body('color').optional().isString()
], async (req: any, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, folderId, content = '', type = 'handwritten', color = '#FF6B6B' } = req.body;

    // Verify folder exists and belongs to user
    const folder = await Folder.findOne({
      _id: folderId,
      userId: req.user._id
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const note = new Note({
      userId: req.user._id,
      folderId,
      title,
      content,
      type,
      color
    });

    await note.save();

    res.status(201).json({
      id: note._id,
      title: note.title,
      content: note.content,
      type: note.type,
      color: note.color,
      folderId: note.folderId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

// Update note
router.put('/:id', authenticate, [
  body('title').optional().trim().isLength({ min: 1 }),
  body('content').optional().isString(),
  body('color').optional().isString()
], async (req: any, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      id: note._id,
      title: note.title,
      content: note.content,
      type: note.type,
      color: note.color,
      folderId: note.folderId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

// Delete note
router.delete('/:id', authenticate, async (req: any, res, next) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Search notes
router.get('/search/:query', authenticate, async (req: any, res, next) => {
  try {
    const { query } = req.params;
    
    const notes = await Note.find({
      userId: req.user._id,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ]
    }).sort({ updatedAt: -1 });

    res.json(notes.map(note => ({
      id: note._id,
      title: note.title,
      content: note.content,
      type: note.type,
      color: note.color,
      folderId: note.folderId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    })));
  } catch (error) {
    next(error);
  }
});

export default router;