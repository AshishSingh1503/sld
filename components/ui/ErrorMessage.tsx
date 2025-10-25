import React from 'react';
import { Text } from 'react-native';

type ErrorMessageProps = {
  message: string;
};

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  return <Text style={{ color: 'red', marginVertical: 4 }}>{message}</Text>;
} 