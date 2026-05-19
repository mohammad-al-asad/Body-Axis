import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

export interface CustomSheetOption<T> {
  label: string;
  value: T;
}

interface CustomSheetProps<T> {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: CustomSheetOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

export function CustomSheet<T>({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}: CustomSheetProps<T>) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {title}
          </Text>
          {options.map((option) => {
            const isActive = selectedValue === option.value;
            return (
              <TouchableOpacity
                key={String(option.value)}
                style={[
                  styles.modalOption,
                  { borderColor: theme.inputBorder },
                  isActive && { borderColor: theme.secondary },
                ]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    { color: theme.textSecondary },
                    isActive && [
                      styles.modalOptionTextActive,
                      { color: theme.secondary },
                    ],
                  ]}
                >
                  {option.label}
                </Text>
                {isActive && (
                  <Feather name="check" size={18} color={theme.secondary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 20, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalOptionTextActive: {
    fontWeight: '600',
  },
});
