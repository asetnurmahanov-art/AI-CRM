import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Timestamp,
    serverTimestamp,
    DocumentData,
    WriteBatch,
    writeBatch
} from 'firebase/firestore';
import { db, auth } from '../firebase';

// Types
export interface AuditLog {
    action: 'create' | 'update' | 'delete' | 'backup' | 'restore';
    collection: string;
    documentId?: string;
    performedBy: string;
    timestamp: any;
    details?: any;
}

const AUDIT_COLLECTION = 'system_audit_logs';

/**
 * Corporate Data Service
 * Wraps Firestore operations with automatic audit logging and error handling.
 */
export const dbService = {

    // --- Generic CRUD with Auditing ---

    /**
     * Get all documents from a collection
     */
    getAll: async (collectionName: string) => {
        try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error(`Error fetching ${collectionName}:`, error);
            throw error;
        }
    },

    /**
     * Get a single document by ID
     */
    getById: async (collectionName: string, id: string) => {
        try {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error(`Error fetching ${collectionName} ${id}:`, error);
            throw error;
        }
    },

    /**
     * Add a new document with audit log
     */
    add: async (collectionName: string, data: any) => {
        try {
            const docRef = await addDoc(collection(db, collectionName), {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            await dbService.logAudit('create', collectionName, docRef.id, { data });
            return docRef.id;
        } catch (error) {
            console.error(`Error adding to ${collectionName}:`, error);
            throw error;
        }
    },

    /**
     * Update a document with audit log
     */
    update: async (collectionName: string, id: string, data: any) => {
        try {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            });

            await dbService.logAudit('update', collectionName, id, { changes: data });
        } catch (error) {
            console.error(`Error updating ${collectionName} ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete a document with audit log
     */
    delete: async (collectionName: string, id: string) => {
        try {
            await deleteDoc(doc(db, collectionName, id));
            await dbService.logAudit('delete', collectionName, id);
        } catch (error) {
            console.error(`Error deleting from ${collectionName}:`, error);
            throw error;
        }
    },

    // --- System Functions ---

    /**
     * Internal: Log an action to the audit collection
     */
    logAudit: async (action: AuditLog['action'], collectionName: string, docId?: string, details?: any) => {
        try {
            const user = auth.currentUser;
            const logEntry: AuditLog = {
                action,
                collection: collectionName,
                documentId: docId,
                performedBy: user ? user.email || user.uid : 'system',
                timestamp: serverTimestamp(),
                details: details || {}
            };

            // We don't audit the audit logs themselves to prevent infinite loops
            if (collectionName !== AUDIT_COLLECTION) {
                await addDoc(collection(db, AUDIT_COLLECTION), logEntry);
            }
        } catch (error) {
            // If auditing fails, we log to console but don't crash user flow
            console.error('AUDIT LOG FAILED:', error);
        }
    },

    /**
     * Get Audit Logs
     */
    getAuditLogs: async (limitCount = 100) => {
        // In a real app, we'd add ordering/limiting here
        const q = query(collection(db, AUDIT_COLLECTION));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /**
     * Export entire database (Backup)
     * Note: This is client-side heavy. For massive DBs, move to Cloud Functions.
     */
    backupDatabase: async (collectionsToBackup: string[] = ['users', 'deals', 'settings', 'audit_logs']) => {
        const backup: Record<string, any[]> = {};

        for (const colName of collectionsToBackup) {
            backup[colName] = await dbService.getAll(colName);
        }

        await dbService.logAudit('backup', 'ALL', undefined, { collections: collectionsToBackup });
        return backup;
    },

    /**
     * Restore database from JSON
     * WARNING: This can overwrite data.
     */
    restoreDatabase: async (backupData: Record<string, any[]>) => {
        const batch = writeBatch(db);
        let opCount = 0;

        for (const [colName, docs] of Object.entries(backupData)) {
            for (const docData of docs) {
                // We define a reference based on ID if it exists, otherwise auto-id
                const docId = docData.id;
                if (docId) {
                    const { id, ...data } = docData; // Remove ID from data payload
                    const ref = doc(db, colName, docId);
                    batch.set(ref, data);
                } else {
                    const ref = doc(collection(db, colName));
                    batch.set(ref, docData);
                }
                opCount++;

                // Firestore batches limit is 500
                if (opCount >= 450) {
                    await batch.commit();
                    opCount = 0; // Reset
                }
            }
        }

        if (opCount > 0) {
            await batch.commit();
        }

        await dbService.logAudit('restore', 'ALL', undefined, { collections: Object.keys(backupData) });
    }
};
