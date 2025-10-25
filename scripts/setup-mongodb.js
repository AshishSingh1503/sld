const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'sld_app';

async function setupMongoDB() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Create collections with indexes
    console.log('Creating collections and indexes...');
    
    // Users collection
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log('✓ Users collection created with email index');
    
    // Folders collection
    const foldersCollection = db.collection('folders');
    await foldersCollection.createIndex({ userId: 1 });
    await foldersCollection.createIndex({ userId: 1, name: 1 });
    console.log('✓ Folders collection created with indexes');
    
    // Notes collection
    const notesCollection = db.collection('notes');
    await notesCollection.createIndex({ userId: 1 });
    await notesCollection.createIndex({ folderId: 1 });
    await notesCollection.createIndex({ userId: 1, title: 'text', content: 'text' });
    console.log('✓ Notes collection created with indexes');
    
    console.log('MongoDB setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up MongoDB:', error);
  } finally {
    await client.close();
  }
}

setupMongoDB();