import mongoose, { Document, Schema } from 'mongoose';

export interface IFolder extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  color: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    default: '#6C63FF',
  },
  icon: {
    type: String,
    default: 'folder-outline',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Folder || mongoose.model<IFolder>('Folder', FolderSchema);