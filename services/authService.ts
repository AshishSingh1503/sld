import { supabase } from '../lib/supabase';
import {
  type AuthChangeEvent,
  type EmailOtpType,
  type Session,
  type User,
} from '@supabase/supabase-js';
import { validatePassword } from '../utils/validatePassword';

export { EmailOtpType };

/**
 * Sends a one-time password (OTP) to the user's email.
 * @param email The user's email address.
 * @param type The type of OTP, either 'signup' or 'magiclink'.
 * @returns A promise that resolves when the OTP is sent.
 */
async function sendOTP(email: string, type: EmailOtpType) {
  console.log('📤 Sending OTP:', { email, type });
  
  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      // For new users, this will not sign them in immediately.
      // They will be redirected to the app to verify the OTP.
      // For existing users, it will sign them in.
      shouldCreateUser: type === 'signup',
    },
  });

  if (error) {
    console.error('❌ Supabase sendOTP error:', error.message);
    throw error;
  }
  
  console.log('✅ OTP sent successfully');
}

/**
 * Verifies the one-time password (OTP) entered by the user.
 * @param email The user's email address.
 * @param token The OTP token from the email.
 * @param type The type of OTP to verify.
 */
async function verifyOTP(email: string, token: string, type: EmailOtpType) {
  console.log('🔍 Verifying OTP:', { 
    email, 
    tokenLength: token.length, 
    type,
    actualToken: token // Remove this in production for security
  });
  
  try {
    const { data, error } = await supabase.auth.verifyOtp({ 
      email, 
      token, 
      type,
    });
    
    console.log('🔍 Raw Supabase verifyOtp response:', { 
      hasData: !!data, 
      hasError: !!error,
      errorMessage: error?.message,
      userData: data?.user ? 'User exists' : 'No user',
      sessionExists: data?.session ? 'Session created' : 'No session'
    });
    
    if (error) {
      console.error('❌ Supabase verifyOTP detailed error:', {
        message: error.message,
        status: error.status,
        statusCode: error.status
      });
      
      if (error.message.includes('Token has expired') || error.message.includes('expired')) {
        throw new Error('Verification code has expired. Please request a new code.');
      } else if (error.message.includes('Invalid token') || error.message.includes('invalid')) {
        throw new Error('Invalid verification code. Please check and try again.');
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please verify your email address first.');
      }
      
      console.error('Supabase verifyOTP error:', error.message);
      throw error;
    }
    
    console.log('✅ OTP verification successful');
    return data;
  } catch (error) {
    console.error('❌ OTP verification error:', error);
    throw error;
  }
}

/**
 * FIXED: Complete signup process with OTP verification and user creation
 * This combines OTP verification with user account creation
 */
async function completeSignupWithOTP(
  email: string, 
  token: string, 
  password: string, 
  user_metadata: Record<string, any>
) {
  console.log('🚀 Starting complete signup process:', { email, user_metadata });
  
  try {
    // Step 1: Verify OTP and create user account
    console.log('Step 1: Verifying OTP...');
    console.log('🔍 Detailed OTP verification attempt:', {
      email: email.trim().toLowerCase(),
      token: token,
      tokenLength: token.length,
      tokenType: typeof token,
      type: 'signup'
    });

    const otpResult = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'signup'
    });

    console.log('🔍 FULL OTP verification result:', {
      data: otpResult.data,
      error: otpResult.error,
      hasData: !!otpResult.data,
      hasError: !!otpResult.error,
      hasUser: !!otpResult.data?.user,
      hasSession: !!otpResult.data?.session,
      errorDetails: otpResult.error ? {
        message: otpResult.error.message,
        status: otpResult.error.status,
        statusCode: otpResult.error.status
      } : null
    });

    // IMPORTANT: Check if we have both data and error (Supabase edge case)
    if (otpResult.error) {
      console.error('❌ OTP verification failed with error:', {
        message: otpResult.error.message,
        status: otpResult.error.status,
        hasDataDespiteError: !!otpResult.data
      });
      
      // Try alternative approach if we have this specific error
      if (otpResult.error.message.includes('Token has expired or is invalid')) {
        console.log('🔄 Trying alternative OTP verification approach...');
        
        // Sometimes Supabase has issues with 'signup' type, try 'email' type
        const alternativeResult = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: token.trim(),
          type: 'email'
        });
        
        console.log('🔄 Alternative verification result:', {
          hasData: !!alternativeResult.data,
          hasError: !!alternativeResult.error,
          hasUser: !!alternativeResult.data?.user,
          errorMessage: alternativeResult.error?.message
        });
        
        if (alternativeResult.error) {
          throw new Error(`OTP verification failed: ${otpResult.error.message}. Please request a new code.`);
        } else {
          // Use alternative result if successful
          console.log('✅ Alternative verification successful');
          return alternativeResult.data;
        }
      } else {
        throw otpResult.error;
      }
    }

    // Step 2: Set password and update user metadata
    if (otpResult.data?.user) {
      console.log('Step 2: Updating user with password and metadata...');
      
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: user_metadata
      });

      if (updateError) {
        console.error('❌ Failed to update user:', updateError);
        throw updateError;
      }

      console.log('✅ User updated successfully');

      // Step 3: Store additional profile data if needed
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: otpResult.data.user.id,
            email: email,
            ...user_metadata,
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.warn('⚠️ Profile creation warning (not critical):', profileError);
        } else {
          console.log('✅ Profile created successfully');
        }
      } catch (profileError) {
        console.warn('⚠️ Profile creation failed (not critical):', profileError);
      }

      return {
        user: otpResult.data.user,
        session: otpResult.data.session
      };
    } else {
      throw new Error('No user data returned from OTP verification');
    }

  } catch (error) {
    console.error('❌ Complete signup failed:', error);
    throw error;
  }
}

/**
 * Gets the current logged-in user.
 */
async function getCurrentUser(): Promise<User | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}

/**
 * Signs out the current user.
 */
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Supabase signOut error:', error.message);
    throw error;
  }
}

/**
 * Listens for changes in the authentication state.
 * @param callback A function to handle the auth event and session.
 * @returns A subscription object to unsubscribe from the listener.
 */
function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}

/**
 * Signs in a user with email and password
 * @param email The user's email
 * @param password The user's password
 */
async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error('Supabase signIn error:', error.message);
    throw error;
  }
  return data;
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
  sendOTP,
  verifyOTP,
  /**
   * Simple OTP test method - tries multiple verification approaches
   */
  async testOTPVerification(email: string, token: string) {
    console.log('🧪 Testing OTP verification with multiple approaches...');
    
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();
    
    // Test 1: signup type
    console.log('Test 1: Using type "signup"');
    try {
      const result1 = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'signup'
      });
      console.log('Test 1 result:', { hasError: !!result1.error, hasData: !!result1.data, error: result1.error?.message });
      if (!result1.error) return { success: true, method: 'signup', data: result1.data };
    } catch (e) {
      console.log('Test 1 exception:', (e as Error).message);
    }

    // Test 2: email type
    console.log('Test 2: Using type "email"');
    try {
      const result2 = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email'
      });
      console.log('Test 2 result:', { hasError: !!result2.error, hasData: !!result2.data, error: result2.error?.message });
      if (!result2.error) return { success: true, method: 'email', data: result2.data };
    } catch (e) {
      console.log('Test 2 exception:', (e as Error).message);
    }

    // Test 3: magiclink type
    console.log('Test 3: Using type "magiclink"');
    try {
      const result3 = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'magiclink'
      });
      console.log('Test 3 result:', { hasError: !!result3.error, hasData: !!result3.data, error: result3.error?.message });
      if (!result3.error) return { success: true, method: 'magiclink', data: result3.data };
    } catch (e) {
      console.log('Test 3 exception:', (e as Error).message);
    }

    return { success: false, error: 'All verification methods failed' };
  },

  completeSignupWithOTP, // NEW: Add this method
  getCurrentUser,
  signOut,
  onAuthStateChange,
  signInWithPasswordLegacy: signInWithPassword,

  /**
   * Checks if a session is valid and not expired
   */
  async validateSession(): Promise<boolean> {
    const session = await supabase.auth.getSession();
    if (!session.data.session) return false;
    
    const expiresAt = new Date(session.data.session.expires_at!).getTime();
    const now = Date.now();
    
    // If session expires in less than 5 minutes, refresh it
    if (expiresAt - now < 5 * 60 * 1000) {
      const { error } = await supabase.auth.refreshSession();
      if (error) return false;
    }
    
    return true;
  },

  /**
   * Signs up a new user with email, password, and user metadata.
   * Checks if email already exists and handles appropriate error messages.
   * @param email The user's email address.
   * @param password The user's password.
   * @param user_metadata Additional user metadata (e.g., name, age).
   */
  async signUp(email: string, password: string, user_metadata: Record<string, any>) {
    try {
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

      // First check if user exists
      const { data: existingUser } = await supabase
        .from('auth.users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('An account with this email already exists. Please log in instead.');
      }

      // If no existing user, proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: user_metadata,
          emailRedirectTo: undefined, // Disable email confirmation redirect
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please log in instead.');
        }
        console.error('Supabase signUp error:', error.message);
        throw error;
      }

      // Store additional user metadata in a custom profile table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: email,
            ...user_metadata,
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Error saving user profile:', profileError);
        }
      }

      return data;
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  },

  /**
   * Signs in an existing user with email and password.
   * @param email The user's email
   * @param password The user's password
   */
  async signInWithPasswordEnhanced(email: string, password: string) {
    try {
      // Sanitize email
      email = email.toLowerCase().trim();
      
      // Check rate limiting
      checkRateLimit(email);

      // Log sign-in attempt for security monitoring
      console.log(`Sign-in attempt for email: ${email} at ${new Date().toISOString()}`);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        }
        console.error('Supabase signIn error:', error.message);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('SignIn error:', error);
      throw error;
    }
  },
};