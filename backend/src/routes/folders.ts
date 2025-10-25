import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import Folder from '../models/Folder';
import Note from '../models/Note';

const router = express.Router();

// Get all folders for user
router.get('/', authenticate, async (req: any, res, next) => {
  try {
    const folders = await Folder.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    const foldersWithNotes = await Promise.all(
      folders.map(async (folder) => {
        const notes = await Note.find({ folderId: folder._id }).sort({ updatedAt: -1 });
        return {
          id: folder._id,
          name: folder.name,
          color: folder.color,
          icon: folder.icon,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
          notes: notes.map(note => ({
            id: note._id,
            title: note.title,
            content: note.content,
            type: note.type,
            color: note.color,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
          }))
        };
      })
    );

    res.json(foldersWithNotes);
  } catch (error) {
    next(error);
  }
});

// Create folder
router.post('/', authenticate, [
  body('name').trim().isLength({ min: 1 }),
  body('color').optional().isString(),
  body('icon').optional().isString()
], async (req: any, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, color = '#6C63FF', icon = 'folder-outline' } = req.body;

    const folder = new Folder({
      userId: req.user._id,
      name,
      color,
      icon
    });

    await folder.save();

    res.status(201).json({
      id: folder._id,
      name: folder.name,
      color: folder.color,
      icon: folder.icon,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      notes: []
    });
  } catch (error) {
    next(error);
  }
});

// Update folder
router.put('/:id', authenticate, [
  body('name').optional().trim().isLength({ min: 1 }),
  body('color').optional().isString(),
  body('icon').optional().isString()
], async (req: any, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json({
      id: folder._id,
      name: folder.name,
      color: folder.color,
      icon: folder.icon,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

// Delete folder
router.delete('/:id', authenticate, async (req: any, res, next) => {
  try {
    const folder = await Folder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Delete all notes in the folder
    await Note.deleteMany({ folderId: req.params.id });

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;