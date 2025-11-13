import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  deleteUser,
  type User
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBi2JyVsQ5JOH4dQyxdml4uS3e6ZUQejhI",
  authDomain: "playnwin-d184e.firebaseapp.com",
  projectId: "playnwin-d184e",
  storageBucket: "playnwin-d184e.firebasestorage.app",
  messagingSenderId: "289329056865",
  appId: "1:289329056865:web:808767a03dbf21392cee20",
  measurementId: "G-24NN3RSG57"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const signUp = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const sendPasswordReset = (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const logout = () => {
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const updateUserProfile = (user: User, profile: { displayName?: string, photoURL?: string }) => {
    return updateProfile(user, profile);
};

// Fix: Corrected function signature by removing extraneous 'B'.
export const reauthenticateUser = (user: User, currentPassword: string) => {
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    return reauthenticateWithCredential(user, credential);
}

// Fix: Corrected function signature by removing extraneous 'B'.
export const updateUserPassword = (user: User, newPassword: string) => {
    return updatePassword(user, newPassword);
}

export const deleteUserAccount = (user: User) => {
    return deleteUser(user);
}


export type { User };