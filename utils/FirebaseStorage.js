import admin from 'firebase-admin';
import { createReadStream } from 'fs';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const bucket = admin.storage().bucket();

export const uploadToFirebase = async (file, folder) => {
  try {
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}-${file.originalname}`;
    
    // Create a reference to the file in Firebase Storage
    const fileRef = bucket.file(fileName);
    
    // Create a write stream and pipe the file to it
    const stream = fileRef.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Return a promise that resolves with the public URL
    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        reject(error);
      });

      stream.on('finish', async () => {
        // Make the file public
        await fileRef.makePublic();
        
        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve(publicUrl);
      });

      // Create a read stream from the temporary file and pipe it to Firebase Storage
      const readStream = createReadStream(file.path);
      readStream.pipe(stream);
    });
  } catch (error) {
    throw error;
  }
};
