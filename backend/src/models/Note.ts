import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  folderId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: 'text' | 'handwritten';
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  folderId: {
    type: Schema.Types.ObjectId,
    ref: 'Folder',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['text', 'handwritten'],
    default: 'handwritten',
  },
  color: {
    type: String,
    default: '#FF6B6B',
  },
}, {
  timestamps: true,
});

export default mongoose.model<INote>('Note', NoteSchema);