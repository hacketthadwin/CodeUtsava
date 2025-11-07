import React, { useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../App';
 
/**
 * AdminGate
 * - Hardcoded gate: if the signed-in user's id matches the HARDCODED_ADMIN_ID,
 *   automatically navigates to the 'Admin' screen.
 *
 * USAGE:
 * - This component should be rendered somewhere inside navigation/provider tree
 *   (for example in `AppContent` in `App.js`). It will run on mount and on
 *   auth changes.
 *
 * SECURITY: This is a dev-only, hardcoded backdoor. Remove or protect it before production.
 */
 
const HARDCODED_ADMIN_ID = 'admin@123.com'; // <- Change this to the target user id
 
export default function AdminGate() {
  const navigation = useNavigation();
  const auth = useContext(AuthContext);
 
  useEffect(() => {
    try {
      const user = auth && auth.user;
      const id = user && (user.id || user._id || user._userId || user.email);
 
      if (!id) return;
 
      if (String(id) === String(HARDCODED_ADMIN_ID)) {
        // Optionally show a small alert for confirmation during dev
        // Alert.alert('Admin access', 'Hardcoded admin detected, opening Admin panel');
        navigation.navigate('Admin');
      }
    } catch (err) {
      console.warn('AdminGate error', err);
    }
  }, [auth && auth.user]);
 
  return null;
}
 