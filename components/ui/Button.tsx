import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

const Button = ({ onPress, children, variant = 'default' }: {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'outline';
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        variant === 'outline' ? styles.outline : styles.default
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === 'outline' ? styles.outlineText : styles.defaultText
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 6,
    marginVertical: 6,
    minWidth: 100,
    alignItems: 'center'
  },
  default: {
    backgroundColor: '#2563eb'
  },
  outline: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2563eb'
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  defaultText: {
    color: '#fff'
  },
  outlineText: {
    color: '#2563eb'
  }
});

export default Button;
