import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

interface PasswordValidationProps {
  password: string;
}

export const PasswordValidation: React.FC<PasswordValidationProps> = ({ password }) => {
  const requirements: PasswordRequirement[] = [
    {
      label: 'At least 8 characters long',
      test: (pass) => pass.length >= 8,
    },
    {
      label: 'Contains uppercase letter',
      test: (pass) => /[A-Z]/.test(pass),
    },
    {
      label: 'Contains lowercase letter',
      test: (pass) => /[a-z]/.test(pass),
    },
    {
      label: 'Contains number',
      test: (pass) => /[0-9]/.test(pass),
    },
    {
      label: 'Contains special character',
      test: (pass) => /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    },
  ];

  return (
    <View style={styles.container}>
      {requirements.map((req, index) => (
        <View key={index} style={styles.requirementRow}>
          <Ionicons
            name={req.test(password) ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={req.test(password) ? '#4CAF50' : '#ccc'}
          />
          <Text style={[
            styles.requirementText,
            req.test(password) && styles.requirementMet
          ]}>
            {req.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 16,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  requirementText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  requirementMet: {
    color: '#4CAF50',
  },
});
