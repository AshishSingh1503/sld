import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';

interface OTPProps {
  email: string;
  value: string;
  onChange: (otp: string) => void;
  onResend: () => Promise<void>;
  error?: string;
  timerDuration?: number; // seconds, default 300
}

export const OTP: React.FC<OTPProps> = ({
  email,
  value,
  onChange,
  onResend,
  error,
  timerDuration = 300,
}) => {
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    setTimeLeft(timerDuration);
  }, [timerDuration, email]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
      Alert.alert(
        'Code Expired',
        'Your verification code has expired. Please request a new one.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send New Code', onPress: handleResend },
        ]
      );
    }
  }, [timeLeft]);

  const handleResend = async () => {
    try {
      await onResend();
      setTimeLeft(timerDuration);
      setCanResend(false);
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (text: string, idx: number) => {
    let newValue = value.split('');
    newValue[idx] = text[text.length - 1] || '';
    const joined = newValue.join('').slice(0, 6);
    onChange(joined);
    if (text && idx < 5 && inputs.current[idx + 1]) {
      inputs.current[idx + 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        Enter the verification code sent to {email}
      </Text>
      <Text style={styles.timer}>
        Code expires in: {formatTime(timeLeft)}
      </Text>
      <View style={styles.otpInputContainer}>
        {[...Array(6)].map((_, idx) => (
          <TextInput
            key={idx}
            ref={ref => {
              inputs.current[idx] = ref;
            }}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            value={value[idx] || ''}
            onChangeText={text => handleInputChange(text, idx)}
            autoFocus={idx === 0}
            accessibilityLabel={`OTP Input ${idx + 1}`}
          />
        ))}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity
        onPress={handleResend}
        disabled={!canResend}
        style={styles.resendButton}
      >
        <Text style={[styles.resendText, !canResend && styles.resendDisabled]}>
          {canResend ? 'Resend Code' : `Wait ${formatTime(timeLeft)} to resend`}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  timer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    marginHorizontal: 4,
  },
  error: {
    color: '#ff0000',
    marginBottom: 10,
  },
  resendButton: {
    padding: 10,
  },
  resendText: {
    color: '#3498db',
    fontSize: 14,
  },
  resendDisabled: {
    color: '#ccc',
  },
});

export default OTP; 