import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ImageBackground } from 'react-native';
import LoadingButton from '../login/LoadingButton';
import ErrorMessage from '../ui/ErrorMessage';
import { authService } from '../../services/authService';
import { supabase } from '../../lib/supabase'; // Add this import
import OTP from './OTP';
import loginpageImage from '../../assets/loginpage.png';

interface SignupScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export default function SignupScreen({ navigation }: SignupScreenProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');

  const handleOtpChange = (newOtp: string) => {
    if (error) {
      setError('');
    }
    setOtp(newOtp);
  };

  const sendOTP = async () => {
    if (!email || !firstName || !lastName || !password || selectedClass === null) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    console.log('📤 Attempting to send OTP to:', email);

    try {
      await authService.sendOTP(email, 'signup');
      console.log('✅ OTP sent successfully');
      setOtpSent(true);
      Alert.alert('Success', 'Check your email for the verification code!');
    } catch (e) {
      const err = e as Error;
      console.error('❌ Send OTP error:', err.message);
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('🚀 Starting account creation process...');
      
      // FIRST: Test which OTP verification method works
      console.log('🧪 Testing OTP verification methods...');
      const testResult = await authService.testOTPVerification(email, otp);
      
      if (!testResult.success) {
        throw new Error('OTP verification failed with all methods. Please request a new code.');
      }
      
      console.log('✅ OTP verification successful with method:', testResult.method);
      
      // Now set password and update profile
      if (testResult.data?.user) {
        console.log('Setting password and updating profile...');
        
        const { data: updateData, error: updateError } = await supabase.auth.updateUser({
          password: password,
          data: {
            firstName: firstName,
            lastName: lastName,
            full_name: `${firstName} ${lastName}`,
            class: selectedClass
          }
        });

        if (updateError) {
          console.error('❌ Failed to update user:', updateError);
          throw updateError;
        }

        // Insert profile data into profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: testResult.data.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            class: selectedClass
          });

        if (profileError) {
          console.error('❌ Failed to insert profile:', profileError);
          // Don't throw here as the user account was created successfully
        }

        console.log('✅ User profile updated successfully');
      }

      Alert.alert(
        'Success',
        'Account created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );

    } catch (e) {
      const err = e as Error;
      console.error('❌ Account creation error:', err.message);
      setError(err.message);
      
      // Handle specific error cases
      if (err.message.includes('expired') || err.message.includes('Token has expired')) {
        Alert.alert(
          'Code Expired',
          'Your verification code has expired. Would you like to request a new one?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Send New Code', onPress: () => {
              setOtpSent(false);
              setOtp('');
              setError('');
              sendOTP();
            }}
          ]
        );
      } else if (err.message.includes('invalid') || err.message.includes('Invalid token')) {
        Alert.alert(
          'Invalid Code',
          'The verification code you entered is invalid. Please check and try again, or request a new code.',
          [
            { text: 'Try Again', style: 'cancel' },
            { text: 'Send New Code', onPress: () => {
              setOtpSent(false);
              setOtp('');
              setError('');
              sendOTP();
            }}
          ]
        );
      } else {
        Alert.alert('Error', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderClassButtons = () => {
    return (
      <View style={styles.classContainer}>
        <Text style={styles.inputLabel}>Select Your Class</Text>
        <View style={styles.classButtons}>
          {[1, 2, 3, 4, 5].map((classNum) => (
            <TouchableOpacity
              key={classNum}
              style={[
                styles.classButton,
                selectedClass === classNum && styles.classButtonSelected
              ]}
              onPress={() => setSelectedClass(classNum)}
            >
              <Text style={[
                styles.classButtonText,
                selectedClass === classNum && styles.classButtonTextSelected
              ]}>
                Class {classNum}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ImageBackground source={loginpageImage} style={styles.background} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Join us to get started</Text>

      {!otpSent ? (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              accessibilityLabel="Enter your first name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Doe"
              placeholderTextColor="#999"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              accessibilityLabel="Enter your last name"
            />
          </View>

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
            <Text style={styles.inputLabel}>Create Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              accessibilityLabel="Create a password"
            />
          </View>

          {renderClassButtons()}

          <LoadingButton 
            loading={loading} 
            onPress={sendOTP} 
            title="Send Verification Code" 
            buttonStyle={styles.primaryButton}
            textStyle={styles.buttonText}
            accessibilityLabel="Send verification code button"
          />
        </>
      ) : (
        <>
          <Text style={styles.otpInstructions}>
            We've sent a verification code to {email}
          </Text>
          
          <OTP
            email={email}
            value={otp}
            onChange={handleOtpChange}
            onResend={sendOTP}
            error={error}
            timerDuration={600} // 10 minutes
          />
          
          <LoadingButton 
            loading={loading} 
            onPress={createAccount} 
            title="Verify & Create Account" 
            buttonStyle={styles.primaryButton}
            textStyle={styles.buttonText}
            accessibilityLabel="Verify and create account button"
          />

          <TouchableOpacity 
            onPress={() => {
              setOtpSent(false);
              setOtp('');
              setError('');
            }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back to form</Text>
          </TouchableOpacity>
        </>
      )}

      <ErrorMessage message={error} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')}
          accessibilityLabel="Go to login screen"
        >
          <Text style={styles.footerLink}>Login</Text>
        </TouchableOpacity>
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
  classContainer: {
    marginBottom: 25,
  },
  classButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  classButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    minWidth: '18%',
  },
  classButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  classButtonText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    fontFamily: 'Arial',
  },
  classButtonTextSelected: {
    color: 'white',
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
  otpInstructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Arial',
  },
  backButton: {
    marginTop: 10,
    padding: 10,
  },
  backButtonText: {
    color: '#3498db',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Arial',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontFamily: 'Arial',
  },
  footerLink: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
    fontFamily: 'Arial',
  },
});