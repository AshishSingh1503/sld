import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

type LoadingButtonProps = {
  loading: boolean;
  onPress: () => void;
  title: string;
  buttonStyle?: any;
  textStyle?: any;
  accessibilityLabel: string;
};

export default function LoadingButton({ loading, onPress, title, buttonStyle, textStyle, accessibilityLabel }: LoadingButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.button, buttonStyle]} 
      onPress={onPress} 
      disabled={loading}
      accessibilityLabel={accessibilityLabel}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.text, textStyle]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 8,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 