import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  googleProvider,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; code?: string }>;
  signup: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    city: string;
    carrier: User['carrier'];
  }) => Promise<{ success: boolean; error?: string; code?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string; error?: string }>;
  deleteAccount: () => Promise<boolean>;
  firebaseConfigured: boolean;
  projectId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const projectId = auth.app.options.projectId || 'gen-lang-client-0268220873';

  // Run test connection on app load
  useEffect(() => {
    testFirestoreConnection().catch((err) => console.warn('Firestore test connection:', err));
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          // Fetch user profile from Firestore /users/{uid}
          const userDocRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({
              id: fbUser.uid,
              name: data.name || fbUser.displayName || 'PakCall User',
              email: fbUser.email || '',
              phone: data.phone || '+92 300 0000000',
              city: data.city || 'Lahore',
              carrier: data.carrier || 'Jazz',
              createdAt: data.createdAt || new Date().toISOString(),
              isVerified: fbUser.emailVerified,
            });
          } else {
            // New user without Firestore doc yet (e.g. Google Sign-in)
            const newUser: User = {
              id: fbUser.uid,
              name: fbUser.displayName || 'PakCall User',
              email: fbUser.email || '',
              phone: '+92 300 1234567',
              city: 'Islamabad',
              carrier: 'Jazz',
              createdAt: new Date().toISOString(),
              isVerified: fbUser.emailVerified,
            };
            await setDoc(userDocRef, {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              phone: newUser.phone,
              city: newUser.city,
              carrier: newUser.carrier,
              createdAt: newUser.createdAt,
            });
            setUser(newUser);
          }
        } catch (error) {
          console.warn('Error reading user profile document:', error);
          // Fallback user from Firebase Auth record
          setUser({
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'PakCall User',
            email: fbUser.email || '',
            phone: '+92 300 0000000',
            city: 'Pakistan',
            carrier: 'Jazz',
            createdAt: new Date().toISOString(),
            isVerified: fbUser.emailVerified,
          });
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Parse Firebase error code to user-friendly message
  const formatFirebaseError = (err: any): { error: string; code?: string } => {
    const code = err?.code || '';
    if (code === 'auth/operation-not-allowed') {
      return {
        code,
        error:
          'Email/Password sign-in is not yet enabled in this Firebase project. You can sign in using Google, or enable Email/Password in the Firebase Console under Authentication > Sign-in method.',
      };
    }
    if (code === 'auth/email-already-in-use') {
      return { code, error: 'This email is already registered. Please sign in instead.' };
    }
    if (code === 'auth/invalid-email') {
      return { code, error: 'Invalid email address format.' };
    }
    if (code === 'auth/weak-password') {
      return { code, error: 'Password is too weak. Please use at least 6 characters.' };
    }
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return { code, error: 'Incorrect email or password. Please check your credentials.' };
    }
    if (code === 'auth/too-many-requests') {
      return { code, error: 'Too many unsuccessful attempts. Please try again in a few minutes.' };
    }
    if (code === 'auth/popup-closed-by-user') {
      return { code, error: 'Sign-in popup was closed before completing.' };
    }
    return { code, error: err?.message || 'Authentication error occurred.' };
  };

  const login = async (email: string, pass: string) => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!pass || pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      return { success: true };
    } catch (err: any) {
      return { success: false, ...formatFirebaseError(err) };
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (err: any) {
      return { success: false, ...formatFirebaseError(err) };
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    city: string;
    carrier: User['carrier'];
  }) => {
    if (!data.name.trim()) return { success: false, error: 'Full name is required.' };
    if (!data.email.includes('@')) return { success: false, error: 'Valid email is required.' };
    if (!data.phone.trim() || data.phone.length < 10) {
      return { success: false, error: 'Valid Pakistani phone number (+92 3XX XXXXXXX) is required.' };
    }
    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      // 1. Create user in Firebase Authentication (Passwords are NEVER stored locally or in plaintext)
      const userCred = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      const fbUser = userCred.user;

      // 2. Update display name in Firebase Auth
      await updateFirebaseProfile(fbUser, { displayName: data.name.trim() });

      // 3. Save telecom profile details in Firestore /users/{uid}
      const formattedPhone = data.phone.startsWith('+92') ? data.phone.trim() : `+92 ${data.phone.trim()}`;
      const userDocRef = doc(db, 'users', fbUser.uid);
      await setDoc(userDocRef, {
        id: fbUser.uid,
        name: data.name.trim(),
        email: data.email.trim(),
        phone: formattedPhone,
        city: data.city || 'Lahore',
        carrier: data.carrier || 'Jazz',
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, ...formatFirebaseError(err) };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateProfile = async (updatedData: Partial<User>) => {
    if (!auth.currentUser || !user) return;
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, updatedData);
      setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  };

  const resetPassword = async (email: string) => {
    if (!email || !email.includes('@')) {
      return { success: false, message: '', error: 'Please enter a valid email address.' };
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return {
        success: true,
        message: `A password reset link has been sent to ${email.trim()}. Check your inbox and spam folder.`,
      };
    } catch (err: any) {
      const formatted = formatFirebaseError(err);
      return { success: false, message: '', error: formatted.error };
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await auth.currentUser.delete();
      return true;
    } catch (err) {
      console.error('Account deletion error:', err);
      // If reauthentication is needed
      await signOut(auth);
      return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!firebaseUser,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        logout,
        updateProfile,
        resetPassword,
        deleteAccount,
        firebaseConfigured: true,
        projectId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
