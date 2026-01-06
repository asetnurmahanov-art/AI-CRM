import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    Timestamp,
    setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Specification } from '../types';

const SPECS_COLLECTION = 'specifications';

export const docsService = {
    /**
     * Subscribe to real-time updates of specifications
     */
    subscribe: (callback: (specs: Specification[]) => void) => {
        const q = query(collection(db, SPECS_COLLECTION), orderBy('updatedAt', 'desc'));

        return onSnapshot(q, (snapshot) => {
            const specs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Specification[];
            callback(specs);
        });
    },

    /**
     * Create a new specification
     */
    create: async (spec: Omit<Specification, 'id'>) => {
        const docRef = await addDoc(collection(db, SPECS_COLLECTION), {
            ...spec,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        return docRef.id;
    },

    /**
     * Update an existing specification
     */
    update: async (id: string, updates: Partial<Specification>) => {
        const docRef = doc(db, SPECS_COLLECTION, id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
    },

    /**
     * Delete a specification
     */
    delete: async (id: string) => {
        await deleteDoc(doc(db, SPECS_COLLECTION, id));
    }
};
