const { db } = require('../config/firebase');

class DbService {
    /**
     * Save message to Firestore 'messages' collection
     * @param {Object} message 
     */
    async saveMessage(message) {
        try {
            // Use 'id' (message mid) as the document ID to prevent duplicates
            const docRef = db.collection('messages').doc(message.id);

            await docRef.set({
                ...message,
                savedAt: new Date().toISOString() // Firestore timestamp could also be used: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true }); // Merge true allows updating existing records safely

            console.log('Message saved to Firestore ID:', message.id);
            return true;
        } catch (error) {
            console.error('Error saving to Firestore:', error);
            // Don't crash the server, just log
            return false;
        }
    }
}

module.exports = new DbService();
