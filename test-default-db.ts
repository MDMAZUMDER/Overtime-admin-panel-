
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

async function test() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app, '(default)');
    console.log('Testing connection to:', firebaseConfig.projectId, 'Database: (default)');
    const testDoc = doc(db, 'test', 'connection');
    await getDocFromServer(testDoc);
    console.log('SUCCESS: (default) database is accessible!');
  } catch (error) {
    console.error('FAILURE:', error.message);
  }
}

test();
