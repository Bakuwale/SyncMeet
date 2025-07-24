import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    View
} from 'react-native';
import { useAuth } from '../components/auth-context';

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const startAnimations = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isMounted) {
          setTimeout(() => {
            if (user) {
              router.replace('/(tabs)');
            } else {
              router.replace('/login');
            }
          }, 800);
        }
      });
    };

    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimations();
    startPulse();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0f2027', '#2c5364', '#000000']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />
      <Animated.View
        style={[
          styles.logoGlow,
          {
            opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] }),
            transform: [
              { scale: scaleAnim.interpolate({ inputRange: [0.8, 1], outputRange: [1.2, 1.5] }) },
            ],
          },
        ]}
      />
      <Animated.Image
        source={require('../assets/images/Logo.png')}
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim },
            ],
            shadowOpacity: glowAnim,
          },
        ]}
      />
      <Animated.Text
        style={[
          styles.text,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: pulseAnim },
            ],
            textShadowColor: '#00eaff',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 16,
          },
        ]}
      >
        Welcome to SyncMeet
      </Animated.Text>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 24,
    resizeMode: 'contain',
    shadowColor: '#00eaff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 32,
    elevation: 24,
  },
  logoGlow: {
    position: 'absolute',
    top: '32%',
    left: '25%',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: '#00eaff',
    opacity: 0.5,
    shadowColor: '#00eaff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 60,
    elevation: 40,
    zIndex: 0,
  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: '#00eaff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
});

export default SplashScreen;
