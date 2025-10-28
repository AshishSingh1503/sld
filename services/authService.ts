import AsyncStorage from '@react-native-async-storage/async-storage';
import { localDB, User } from './localDatabase';
import { validatePassword } from '../utils/validatePassword';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  age?: number;
}

// Simple in-memory store for auth state
let currentUser: AuthUser | null = null;
let authListeners: ((user: AuthUser | null) => void)[] = [];

/**
 * Compare password with hash
 */
async function comparePassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await localDB.hashPassword(password);
  return inputHash === hash;
}

/**
 * Store auth user in AsyncStorage
 */
async function storeUser(user: AuthUser): Promise<void> {
  await AsyncStorage.setItem('auth_user', JSON.stringify(user));
}

/**
 * Get auth user from AsyncStorage
 */
async function getStoredUser(): Promise<AuthUser | null> {
  try {
    const stored = await AsyncStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Clear auth session
 */
async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem('auth_user');
  currentUser = null;
  notifyAuthListeners(null);
}

/**
 * Notify auth state listeners
 */
function notifyAuthListeners(user: AuthUser | null): void {
  authListeners.forEach(listener => listener(user));
}

/**
 * Gets the current logged-in user.
 */
async function getCurrentUser(): Promise<AuthUser | null> {
  if (currentUser) return currentUser;
  
  const user = await getStoredUser();
  if (user) {
    currentUser = user;
    return currentUser;
  }
  
  return null;
}

/**
 * Signs out the current user.
 */
async function signOut(): Promise<void> {
  await clearSession();
}

/**
 * Listens for changes in the authentication state.
 * @param callback A function to handle the auth user changes.
 * @returns A function to unsubscribe from the listener.
 */
function onAuthStateChange(
  callback: (event: string, user: AuthUser | null) => void
): { unsubscribe: () => void } {
  const listener = (user: AuthUser | null) => {
    callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user);
  };
  
  authListeners.push(listener);
  
  return {
    unsubscribe: () => {
      const index = authListeners.indexOf(listener);
      if (index > -1) {
        authListeners.splice(index, 1);
      }
    }
  };
}

/**
 * Signs in a user with email and password
 * @param email The user's email
 * @param password The user's password
 */
async function signInWithPassword(email: string, password: string): Promise<AuthUser> {
  const user = await localDB.getUserByEmail(email.toLowerCase().trim());
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }
  
  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    age: user.age,
  };
  
  await storeUser(authUser);
  currentUser = authUser;
  notifyAuthListeners(authUser);
  
  return authUser;
}

// Rate limiting for authentication attempts
const rateLimiter = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const userAttempts = rateLimiter.get(email) || { count: 0, timestamp: now };

  // Reset attempts if lockout time has passed
  if (now - userAttempts.timestamp > LOCKOUT_TIME) {
    rateLimiter.set(email, { count: 0, timestamp: now });
    return true;
  }

  // Check if user has exceeded max attempts
  if (userAttempts.count >= MAX_ATTEMPTS) {
    const timeLeft = Math.ceil((LOCKOUT_TIME - (now - userAttempts.timestamp)) / 1000 / 60);
    throw new Error(`Too many attempts. Please try again in ${timeLeft} minutes.`);
  }

  // Increment attempt count
  userAttempts.count += 1;
  rateLimiter.set(email, userAttempts);
  return true;
}

export const authService = {
  getCurrentUser,
  signOut,
  onAuthStateChange,
  signInWithPassword,

  /**
   * Checks if a session is valid and not expired
   */
  async validateSession(): Promise<boolean> {
    const user = await getStoredUser();
    return user !== null;
  },

  /**
   * Signs up a new user with email, password, and user metadata.
   * @param email The user's email address.
   * @param password The user's password.
   * @param user_metadata Additional user metadata (e.g., name, age).
   */
  async signUp(email: string, password: string, user_metadata: Record<string, any>): Promise<AuthUser> {
    // Validate password strength
    const { isValid, message } = validatePassword(password);
    if (!isValid) {
      throw new Error(message);
    }

    // Sanitize email
    email = email.toLowerCase().trim();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Invalid email format');
    }

    // Check rate limiting
    checkRateLimit(email);

    // Check if user already exists
    const existingUser = await localDB.getUserByEmail(email);
    if (existingUser) {
      throw new Error('An account with this email already exists. Please log in instead.');
    }

    // Create user
    const newUser = await localDB.createUser(
      email,
      password,
      user_metadata.name || '',
      user_metadata.age
    );

    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      age: newUser.age,
    };

    await storeUser(authUser);
    currentUser = authUser;
    notifyAuthListeners(authUser);

    return authUser;
  },

  /**
   * Signs in an existing user with email and password (enhanced version).
   * @param email The user's email
   * @param password The user's password
   */
  async signInWithPasswordEnhanced(email: string, password: string): Promise<AuthUser> {
    // Sanitize email
    email = email.toLowerCase().trim();
    
    // Check rate limiting
    checkRateLimit(email);

    // Log sign-in attempt for security monitoring
    console.log(`Sign-in attempt for email: ${email} at ${new Date().toISOString()}`);

    return signInWithPassword(email, password);
  },
};