import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../components/auth-context';

export default function Index() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    } else {
      router.replace('/login');
    }
  }, [user]);

  return null;
}
