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

interface ModalOption {
  label: string;
  value: string;
  icon?: string;
  onPress?: () => void;
  destructive?: boolean;
}

interface ThemeAwareModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: ModalOption[];
  type?: 'menu' | 'picker' | 'action';
}

const { width } = Dimensions.get('window');

export default function ThemeAwareModal({
  visible,
  onClose,
  title,
  options,
  type = 'menu',
}: ThemeAwareModalProps) {
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';

  const themeColors = {
    background: isDarkTheme ? '#1c1c1c' : '#ffffff',
    modalBackground: isDarkTheme ? '#2a2a2a' : '#f8f9fa',
    textPrimary: isDarkTheme ? '#ffffff' : '#000000',
    textSecondary: isDarkTheme ? '#aaaaaa' : '#666666',
    borderColor: isDarkTheme ? '#333333' : '#e0e0e0',
    overlay: isDarkTheme ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
    danger: '#ff4d4f',
    accent: '#2563eb',
  };

  const handleOptionPress = (option: ModalOption) => {
    if (option.onPress) {
      option.onPress();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: themeColors.overlay }]}>
        <View style={[styles.modalContainer, { backgroundColor: themeColors.modalBackground }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: themeColors.borderColor }]}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

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
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={themeColors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  modalContainer: {
    width: width * 0.85,
    maxHeight: '70%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    maxHeight: 400,
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
}); 