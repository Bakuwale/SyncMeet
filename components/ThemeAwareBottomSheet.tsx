import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useThemeContext } from './ThemeContext';

interface BottomSheetOption {
  label: string;
  value: string;
  icon?: string;
  onPress?: () => void;
  destructive?: boolean;
}

interface ThemeAwareBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: BottomSheetOption[];
}

const { width, height } = Dimensions.get('window');

export default function ThemeAwareBottomSheet({
  visible,
  onClose,
  title,
  options,
}: ThemeAwareBottomSheetProps) {
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';

  const themeColors = {
    background: isDarkTheme ? '#1c1c1c' : '#ffffff',
    sheetBackground: isDarkTheme ? '#2a2a2a' : '#f8f9fa',
    textPrimary: isDarkTheme ? '#ffffff' : '#000000',
    textSecondary: isDarkTheme ? '#aaaaaa' : '#666666',
    borderColor: isDarkTheme ? '#333333' : '#e0e0e0',
    overlay: isDarkTheme ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
    danger: '#ff4d4f',
    accent: '#2563eb',
  };

  const handleOptionPress = (option: BottomSheetOption) => {
    if (option.onPress) {
      option.onPress();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: themeColors.overlay }]}>
        <TouchableOpacity style={styles.overlayTouch} onPress={onClose} />
        <View style={[styles.sheetContainer, { backgroundColor: themeColors.sheetBackground }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: themeColors.borderColor }]} />
          
          {/* Header */}
          {title && (
            <View style={[styles.header, { borderBottomColor: themeColors.borderColor }]}>
              <Text style={[styles.title, { color: themeColors.textPrimary }]}>{title}</Text>
            </View>
          )}

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  { borderBottomColor: themeColors.borderColor },
                  index === options.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => handleOptionPress(option)}
              >
                {option.icon && (
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={option.destructive ? themeColors.danger : themeColors.textPrimary}
                    style={styles.optionIcon}
                  />
                )}
                <Text
                  style={[
                    styles.optionText,
                    { color: option.destructive ? themeColors.danger : themeColors.textPrimary }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Cancel Button */}
          <TouchableOpacity
            style={[styles.cancelButton, { borderTopColor: themeColors.borderColor }]}
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: themeColors.textPrimary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  sheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 