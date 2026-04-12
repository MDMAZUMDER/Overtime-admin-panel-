import { NativeBiometric, BiometryType } from 'capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();

export async function checkBiometricAvailability(): Promise<boolean> {
  if (!isNative) return false;
  try {
    const result = await NativeBiometric.isAvailable();
    return result.isAvailable;
  } catch (error) {
    console.error('Biometric availability check failed:', error);
    return false;
  }
}

export async function authenticateNative(reason: string, title: string): Promise<boolean> {
  if (!isNative) {
    // Fallback for web: simulate success if enabled for testing or just return true
    // In a real app, you might want a password fallback
    return true;
  }

  try {
    const result = await NativeBiometric.verifyIdentity({
      reason,
      title,
      subtitle: 'Authenticate to continue',
      description: 'Use your device fingerprint, face, or PIN',
    });
    return true;
  } catch (error) {
    console.error('Native authentication failed:', error);
    return false;
  }
}

export function isNativeLockEnabled(): boolean {
  return localStorage.getItem('native_lock_enabled') === 'true';
}

export function setNativeLockEnabled(enabled: boolean) {
  localStorage.setItem('native_lock_enabled', enabled.toString());
}
