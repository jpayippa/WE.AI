import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs,getDoc,setDoc, doc, serverTimestamp, addDoc, query, orderBy, limit } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function createUserIfNotExists(user) {
    const userRef = doc(db, "users", user); // Reference to user's document
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // User does not exist, create a new document
        await setDoc(userRef, {

        });
        //console.log("New user added to Firestore:");
    } else {
        //console.log("User already exists:");
    }
}

export async function createNewChat(userId) {
    const chatRef = collection(db, `users/${userId}/chats`);
    const newChat = await addDoc(chatRef, {
        title: Date(),
        createdAt: serverTimestamp()
    });

    //console.log("Chat created with ID:", newChat.id);
    return newChat.id; // Return chat ID to store messages
}

export async function saveMessage(userId, chatId, sender, content) {
    const messagesRef = collection(db, `users/${userId}/chats/${chatId}/messages`);
    
    await addDoc(messagesRef, {
        sender: sender, 
        content: content,
        timestamp: serverTimestamp()
    });

    //console.log("Message added to Firestore");
}

export async function fetchChatMessages(userId, chatId) {
    if (!userId || !chatId) {
        //console.error("Missing userId or chatId");
        return null;
    }

    try {
        const messagesRef = collection(db, `users/${userId}/chats/${chatId}/messages`);
        const q = query(messagesRef, orderBy("timestamp")); // Sort by time
        const querySnapshot = await getDocs(q);

        // Convert Firestore documents into a normal JavaScript object
        const messagesObj = {};
        querySnapshot.forEach(doc => {
            messagesObj[doc.id] = doc.data(); // Store each message as an object property
        });

        //console.log("Messages fetched successfully:", messagesObj);
        return messagesObj;
    } catch (error) {
        console.error("Error fetching messages:", error);
        return null;
    }
}

export async function getLatestChatId(userId) {
    if (!userId) {
        console.warn("❌ Missing userId, cannot fetch latest chat.");
        return null;
    }

    try {
        // Reference to the user's chats collection
        const chatsRef = collection(db, `users/${userId}/chats`);
        
        // Query to get the latest chat by createdAt timestamp (descending order)
        const q = query(chatsRef, orderBy("createdAt", "desc"), limit(1));
        
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.warn(`⚠️ No chats found for user: ${userId}`);
            return null; // No chats exist
        }

        // Get the latest chat document name (chat ID)
        const latestChatDocName = querySnapshot.docs[0].id;
        //console.log(`✅ Latest chat document name for ${userId}:`, latestChatDocName);

        return latestChatDocName;
    } catch (error) {
        console.error("❌ Error fetching latest chat document name:", error);
        return null; // Gracefully handle errors
    }
}

export async function getAllChatDocs(userId) {
    if (!userId) {
        console.warn("❌ Missing userId, cannot fetch chats.");
        return [];
    }

    try {
        // Reference to the user's chats collection
        const chatsRef = collection(db, `users/${userId}/chats`);
        
        // Query to get all chats sorted by createdAt timestamp (oldest to newest)
        const q = query(chatsRef, orderBy("createdAt", "desc"));
        
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.warn(`⚠️ No chats found for user: ${userId}`);
            return []; // Return an empty array if no chats exist
        }

        // Convert documents into an array of chat document names (chat IDs)
        const chatDocs = querySnapshot.docs.map(doc => ({
            id: doc.id, // Chat document name
            ...doc.data() // Include other chat details if needed
        }));

        //console.log(`✅ Retrieved ${chatDocs.length} chats for ${userId}:`, chatDocs);
        return chatDocs;
    } catch (error) {
        console.error("❌ Error fetching chats:", error);
        return []; // Gracefully return an empty array on error
    }
}
