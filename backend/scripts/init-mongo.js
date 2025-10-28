// MongoDB initialization script for Docker
db = db.getSiblingDB('sld_app');

// Create collections
db.createCollection('users');
db.createCollection('folders');
db.createCollection('notes');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.folders.createIndex({ userId: 1 });
db.folders.createIndex({ userId: 1, name: 1 });
db.notes.createIndex({ userId: 1 });
db.notes.createIndex({ folderId: 1 });
db.notes.createIndex({ userId: 1, title: 'text', content: 'text' });

print('Database initialized successfully!');