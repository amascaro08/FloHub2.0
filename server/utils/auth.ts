import crypto from 'crypto';
import { storage } from '../storage';

/**
 * Simple authentication utility for FloHub
 */

// Generate a salt for password hashing
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Hash a password with a given salt
export function hashPassword(password: string, salt: string): string {
  return crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
}

// Verify a password against a hash
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const hashedPassword = hashPassword(password, salt);
  return hashedPassword === hash;
}

// Generate a session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create a new user with hashed password
export async function createUser(email: string, password: string, firstName?: string, lastName?: string) {
  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  
  // Check if user already exists
  const existingUser = await storage.getUserByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Create the user in storage
  const user = await storage.createUser({
    email,
    passwordHash,
    passwordSalt: salt,
    firstName: firstName || '',
    lastName: lastName || '',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return user;
}

// Authenticate user
export async function authenticateUser(email: string, password: string) {
  const user = await storage.getUserByEmail(email);
  
  if (!user) {
    return null;
  }
  
  const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
  
  if (!isValid) {
    return null;
  }
  
  return user;
}

// Create a session for a user
export async function createSession(userId: number) {
  const token = generateSessionToken();
  const session = await storage.createSession({
    userId,
    token,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });
  
  return session;
}

// Validate a session token
export async function validateSession(token: string) {
  const session = await storage.getSessionByToken(token);
  
  if (!session) {
    return null;
  }
  
  // Check if session is expired
  if (new Date() > session.expiresAt) {
    await storage.deleteSession(session.id);
    return null;
  }
  
  return session;
}

// Get user from session token
export async function getUserFromSession(token: string) {
  const session = await validateSession(token);
  
  if (!session) {
    return null;
  }
  
  const user = await storage.getUser(session.userId);
  return user;
}

// Delete a session
export async function deleteSession(token: string) {
  const session = await storage.getSessionByToken(token);
  
  if (session) {
    await storage.deleteSession(session.id);
  }
  
  return true;
}