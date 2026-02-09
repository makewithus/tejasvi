import { collection, addDoc, getDocs, query, where, doc, setDoc, Timestamp, updateDoc, orderBy, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// --- Types ---
export interface Batch {
    id: string;
    name: string;
    active: boolean;
}

export interface EventItem {
    id: string;
    name: string;
    active: boolean;
    date?: string;
    location?: string;
    description?: string;
    createdAt?: Timestamp;
}

export interface RegistrationData {
    fullName: string;
    email: string;
    phone: string;
    whatsapp: string;
    branch: string;
    event: string;
    workingPlace: string;
    foodPreference: 'Veg' | 'Non-Veg';
    accompanyingPersons: number;
    interestedInTalk: boolean;
    internshipOpportunity: boolean;
    suggestions?: string;
}

// --- Batches ---
export const getActiveBatches = async (): Promise<Batch[]> => {
    const batchesRef = collection(db, 'batches');
    const q = query(batchesRef, where('active', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));
};

export const getAllBatches = async (): Promise<Batch[]> => {
    const batchesRef = collection(db, 'batches');
    const snapshot = await getDocs(batchesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));
};

export const addBatch = async (name: string) => {
    await addDoc(collection(db, 'batches'), {
        name,
        active: true
    });
};

export const toggleBatchStatus = async (id: string, currentStatus: boolean) => {
    const batchRef = doc(db, 'batches', id);
    await updateDoc(batchRef, { active: !currentStatus });
};

export const deleteBatch = async (id: string) => {
    await deleteDoc(doc(db, 'batches', id));
};

// --- Registrations ---
export const saveRegistration = async (uid: string, data: RegistrationData) => {
    const registrationId = `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const qrCodeData = registrationId; // Simplified to just the ID to avoid mail app triggers

    const registration = {
        ...data,
        userId: uid,
        registrationId,
        qrCodeData, // The raw string to generate QR from
        qrStatus: 'unused',
        createdAt: Timestamp.now(),
    };

    // Save to 'registrations' collection
    await setDoc(doc(db, 'registrations', registrationId), registration);

    // Also save a user profile in 'users' collection
    await setDoc(doc(db, 'users', uid), {
        uid,
        email: data.email,
        phone: data.phone,
        role: 'user',
        createdAt: Timestamp.now(),
        registrationId // Link back to registration
    });

    return { registrationId, qrCodeData };
};

export const getRegistrationByUserId = async (uid: string) => {
    const q = query(collection(db, 'registrations'), where('userId', '==', uid));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export const checkQRStatus = async (regId: string) => {
    const docRef = doc(db, 'registrations', regId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return docSnap.data().qrStatus;
}

// --- Admin Stats & Management ---
export const getDashboardStats = async () => {
    const regRef = collection(db, 'registrations');
    const snapshot = await getDocs(regRef);

    let total = 0;
    let used = 0;
    let unused = 0;
    let expired = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        total++;
        if (data.qrStatus === 'used') used++;
        else if (data.qrStatus === 'unused') unused++;
        else if (data.qrStatus === 'expired') expired++;
    });

    return { total, used, unused, expired };
};

export const getAllRegistrations = async () => {
    const regRef = collection(db, 'registrations');
    const q = query(regRef, orderBy('createdAt', 'desc')); // Default sort
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const validateAndScanQR = async (regId: string) => {
    const regRef = doc(db, 'registrations', regId);
    const regSnap = await getDoc(regRef);

    if (!regSnap.exists()) {
        return { success: false, message: 'Invalid QR Code' };
    }

    const data = regSnap.data();

    if (data.qrStatus === 'used') {
        return { success: false, message: 'QR Code already used', data };
    }

    if (data.qrStatus === 'expired') {
        return { success: false, message: 'QR Code expired', data };
    }

    // Mark as used
    await updateDoc(regRef, {
        qrStatus: 'used',
        scannedAt: Timestamp.now()
    });

    return { success: true, message: 'Entry Approved', data };
};

// --- Event Management ---
export const getAllEvents = async (): Promise<EventItem[]> => {
    const q = collection(db, 'events');
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));
};

export const getActiveEvents = async (): Promise<EventItem[]> => {
    const q = query(collection(db, 'events'), where('active', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));
};

export const addEvent = async (event: Omit<EventItem, 'id'>) => {
    return await addDoc(collection(db, 'events'), {
        ...event,
        createdAt: Timestamp.now()
    });
};

export const toggleEventStatus = async (id: string, currentStatus: boolean) => {
    const docRef = doc(db, 'events', id);
    await updateDoc(docRef, { active: !currentStatus });
};

export const deleteEvent = async (id: string) => {
    await deleteDoc(doc(db, 'events', id));
};
