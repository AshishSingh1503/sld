import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Alert } from 'react-native';
import { authService } from '../../services/authService';
import LoadingButton from '../login/LoadingButton';
import ErrorMessage from '../ui/ErrorMessage';
import loginpageImage from '../../assets/loginpage.png';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { user, session } = await authService.signInWithPasswordLegacy(email, password);
      console.log('Login successful:', user);
      navigation.navigate('Home'); 
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      Alert.alert('Login Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={loginpageImage} style={styles.background} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Please enter your details to login</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="your.email@example.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            accessibilityLabel="Enter your email address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            accessibilityLabel="Enter your password"
          />
        </View>

        <LoadingButton
          loading={loading}
          onPress={login}
          title="Login"
          buttonStyle={styles.primaryButton}
          textStyle={styles.buttonText}
          accessibilityLabel="Login button"
        />

        <ErrorMessage message={error} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')} accessibilityLabel="Go to sign up screen">
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} accessibilityLabel="Forgot password help">
          <Text style={styles.forgotPassword}>Forgot your password?</Text>
        </TouchableOpacity>
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
  container: {
    flexGrow: 1,
    padding: 30,
    width: '50%',
    marginLeft: 60,
    marginTop: 80,
    marginBottom: 80,
    borderRadius: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(243, 247, 238, 0.8)', // semi-transparent overlay
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
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Arial',
  },
  inputContainer: {
    marginBottom: 25,
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
    marginBottom: 15,
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
  forgotPassword: {
    color: '#169df7ff',
    textAlign: 'center',
    fontSize: 19,
    fontFamily: 'Arial',
  },
});
