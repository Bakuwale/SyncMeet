import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useThemeContext } from './ThemeContext';

interface PhotoUploadProps {
  currentPhoto?: string;
  onPhotoSelected: (photoUri: string) => void;
  onClose: () => void;
  visible: boolean;
}

export default function PhotoUpload({ 
  currentPhoto, 
  onPhotoSelected, 
  onClose, 
  visible 
}: PhotoUploadProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';

  const themeColors = {
    background: isDarkTheme ? '#121212' : '#ffffff',
    cardBackground: isDarkTheme ? '#1e1e1e' : '#f8f9fa',
    textPrimary: isDarkTheme ? '#ffffff' : '#000000',
    textSecondary: isDarkTheme ? '#bbbbbb' : '#666666',
    borderColor: isDarkTheme ? '#333333' : '#e0e0e0',
    accent: '#007AFF',
    error: '#FF3B30',
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    if (mediaStatus !== 'granted') {
      Alert.alert(
        'Media Library Permission Required',
        'Please grant media library permission to access photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  };

  const takePhoto = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickFromGallery = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save the selected photo
  const handleSave = () => {
    if (selectedPhoto) {
      // Just pass the URI to the parent component
      // The actual upload will be handled by fileUploadService
      // which uses multipart/form-data specifically for file uploads
      onPhotoSelected(selectedPhoto);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedPhoto(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: themeColors.borderColor }]}>
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: themeColors.accent }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
              Update Photo
            </Text>
            <TouchableOpacity 
              onPress={handleSave} 
              style={[styles.headerButton, !selectedPhoto && styles.headerButtonDisabled]}
              disabled={!selectedPhoto}
            >
              <Text style={[
                styles.headerButtonText, 
                { color: selectedPhoto ? themeColors.accent : themeColors.textSecondary }
              ]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          {/* Photo Preview */}
          <View style={styles.photoContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themeColors.accent} />
                <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
                  Processing...
                </Text>
              </View>
            ) : selectedPhoto ? (
              <Image source={{ uri: selectedPhoto }} style={styles.previewImage} />
            ) : (
              <View style={[styles.placeholderContainer, { backgroundColor: themeColors.cardBackground }]}>
                <Image 
                  source={currentPhoto ? { uri: currentPhoto } : require('../assets/images/profile.jpg')} 
                  style={styles.currentImage} 
                />
                <Text style={[styles.placeholderText, { color: themeColors.textSecondary }]}>
                  Select a new photo
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: themeColors.accent }]}
              onPress={takePhoto}
              disabled={loading}
            >
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.borderColor }]}
              onPress={pickFromGallery}
              disabled={loading}
            >
              <Ionicons name="images" size={24} color={themeColors.textPrimary} />
              <Text style={[styles.actionButtonText, { color: themeColors.textPrimary }]}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  photoContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  placeholderContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  currentImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  actionContainer: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});