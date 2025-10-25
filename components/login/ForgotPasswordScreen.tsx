import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  ScrollView, 
  Alert 
} from 'react-native';
import loginpageImage from '../../assets/loginpage.png';
import LoadingButton from '../login/LoadingButton';
import ErrorMessage from '../ui/ErrorMessage';
import { authService } from '../../services/authService';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // authService.resetPassword doesn't exist; use sendOTP for password reset flows
      // cast the type to bypass strict enum typing if needed
      await authService.sendOTP(email, 'PASSWORD_RESET' as unknown as any);
      Alert.alert('Success', 'Password reset email sent successfully!');
      navigation.navigate('Login');
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={loginpageImage} style={styles.background} resizeMode="cover">
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.formBox}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your registered email address to receive password reset instructions.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <LoadingButton
            loading={loading}
            onPress={handlePasswordReset}
            title="Send Reset Link"
            buttonStyle={styles.primaryButton}
            textStyle={styles.buttonText} accessibilityLabel={''}          />

          <ErrorMessage message={error} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  formBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 30,
    borderRadius: 20,
    padding: 25,
    marginTop: 80,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    flexGrow: 1,
    width:'60%'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Arial',
  },
  subtitle: {
    fontSize: 18,
    color: '#3a3f3fff',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Arial',
  },
  inputContainer: {
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
    fontWeight: '600',
    fontFamily: 'Arial',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 18,
    color: '#2c3e50',
    fontFamily: 'Arial',
  },
  primaryButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#0f1213ff',
    fontSize: 19,
    fontFamily: 'Arial',
  },
  footerLink: {
    color: '#3498db',
    fontSize: 19,
    fontWeight: 'bold',
    marginLeft: 5,
    fontFamily: 'Arial',
  },
});
