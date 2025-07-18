import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../components/auth-context';

export default function Index() {
  const { user } = useAuth();

  useEffect(() => {
    // Always redirect to login screen on app start
    router.replace('/login');
  }, []);

  return null; // return nothing since we’re redirecting
}
