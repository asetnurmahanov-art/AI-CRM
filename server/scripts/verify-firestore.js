const { db } = require('../src/config/firebase');

async function checkFirestore() {
    try {
        console.log('Checking Firestore for messages...');
        const snapshot = await db.collection('messages').get();

        if (snapshot.empty) {
            console.log('No matching documents.');
            return;
        }

        console.log(`Found ${snapshot.size} messages:`);
        snapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
        });
        process.exit(0);
    } catch (error) {
        console.error('Error getting documents', error);
        process.exit(1);
    }
}

checkFirestore();
