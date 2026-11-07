import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Google Auth Provider with Calendar Read-Only Scope
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events.readonly');
provider.setCustomParameters({
  prompt: 'consent',
  access_type: 'offline'
});

const STORAGE_KEYS = {
  TOKEN: 'chronos_google_access_token',
  USER: 'chronos_google_user',
  LAST_SYNC: 'chronos_google_last_sync'
};

export interface StoredGoogleUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export const getStoredGoogleToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch {
    return null;
  }
};

export const getStoredGoogleUser = (): StoredGoogleUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getLastSyncTime = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  } catch {
    return null;
  }
};

export const setLastSyncTime = (timestamp: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
  } catch {
    // Ignore
  }
};

/**
 * Signs in with Google popup and requests Calendar permissions.
 * Returns the authenticated user and Google OAuth access token.
 */
export const signInWithGoogle = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken;

  if (!accessToken) {
    throw new Error("Impossible d'obtenir le jeton d'accès Google Calendar.");
  }

  // Persist token and basic user info
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
    const userInfo: StoredGoogleUser = {
      uid: result.user.uid,
      displayName: result.user.displayName || (result.user.email ? result.user.email.split('@')[0] : 'Utilisateur Google'),
      email: result.user.email,
      photoURL: result.user.photoURL
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userInfo));
  } catch {
    // Ignore storage issues
  }

  return {
    user: result.user,
    accessToken
  };
};

/**
 * Signs out the user and clears stored calendar tokens.
 */
export const logoutFromGoogle = async (): Promise<void> => {
  await signOut(auth);
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
  } catch {
    // Ignore
  }
};

/**
 * Listens for Auth state changes.
 */
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};
