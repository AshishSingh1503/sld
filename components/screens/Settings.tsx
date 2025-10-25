import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';
import { authService } from '../../services/authService';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  class?: number;
}

const Settings = ({ navigation }: { navigation: any }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    class: undefined
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    class: undefined
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const user = await authService.getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'No user found. Please log in again.');
        navigation.navigate('Login');
        return;
      }

      // Get user data from auth metadata
      const profile: UserProfile = {
        firstName: user.user_metadata?.firstName || '',
        lastName: user.user_metadata?.lastName || '',
        email: user.email || '',
        class: user.user_metadata?.class || undefined
      };

      // Also try to get profile data from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData && !profileError) {
        profile.firstName = profileData.first_name || profile.firstName;
        profile.lastName = profileData.last_name || profile.lastName;
        profile.class = profileData.class || profile.class;
      }

      setUserProfile(profile);
      setOriginalProfile(profile);
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate input
      if (!userProfile.firstName.trim() || !userProfile.lastName.trim()) {
        Alert.alert('Error', 'First name and last name are required');
        return;
      }

      if (!userProfile.email.trim() || !isValidEmail(userProfile.email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      // Update user metadata in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        email: userProfile.email,
        data: {
          firstName: userProfile.firstName.trim(),
          lastName: userProfile.lastName.trim(),
          full_name: `${userProfile.firstName.trim()} ${userProfile.lastName.trim()}`,
          class: userProfile.class
        }
      });

      if (updateError) {
        throw updateError;
      }

      // Update profile in profiles table
      const user = await authService.getCurrentUser();
      if (user) {
        // First check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        const profileData = {
          id: user.id,
          email: userProfile.email,
          first_name: userProfile.firstName.trim(),
          last_name: userProfile.lastName.trim(),
          class: userProfile.class,
          updated_at: new Date().toISOString()
        };

        let profileError;
        if (!existingProfile) {
          // Insert new profile
          const { error } = await supabase
            .from('profiles')
            .insert([profileData]);
          profileError = error;
        } else {
          // Update existing profile
          const { error } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', user.id);
          profileError = error;
        }

        if (profileError) {
          console.error('Error updating profile table:', profileError);
          throw new Error('Failed to update profile data');
        }
      }

      // Update the original profile to reflect saved changes
      setOriginalProfile(userProfile);
      setIsEditing(false);
      
      Alert.alert('Success', 'Profile updated successfully!');
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setUserProfile(originalProfile);
    setIsEditing(false);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity 
          onPress={() => setIsEditing(!isEditing)} 
          style={styles.editButton}
          accessibilityLabel={isEditing ? "Cancel editing" : "Edit profile"}
        >
          <Ionicons name={isEditing ? "close" : "pencil"} size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          {/* First Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>First Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={userProfile.firstName}
                onChangeText={(text) => setUserProfile({...userProfile, firstName: text})}
                placeholder="Enter first name"
                autoCapitalize="words"
                editable={!saving}
              />
            ) : (
              <View style={styles.fieldValue}>
                <Text style={styles.fieldText}>
                  {userProfile.firstName || 'Not set'}
                </Text>
              </View>
            )}
          </View>

          {/* Last Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Last Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={userProfile.lastName}
                onChangeText={(text) => setUserProfile({...userProfile, lastName: text})}
                placeholder="Enter last name"
                autoCapitalize="words"
                editable={!saving}
              />
            ) : (
              <View style={styles.fieldValue}>
                <Text style={styles.fieldText}>
                  {userProfile.lastName || 'Not set'}
                </Text>
              </View>
            )}
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={userProfile.email}
                onChangeText={(text) => setUserProfile({...userProfile, email: text})}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!saving}
              />
            ) : (
              <View style={styles.fieldValue}>
                <Text style={styles.fieldText}>
                  {userProfile.email || 'Not set'}
                </Text>
              </View>
            )}
          </View>

          {/* Class */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Class</Text>
            {isEditing ? (
              <View style={styles.classSelector}>
                {[1, 2, 3, 4, 5].map((classNum) => (
                  <TouchableOpacity
                    key={classNum}
                    style={[
                      styles.classOption,
                      userProfile.class === classNum && styles.classOptionSelected
                    ]}
                    onPress={() => setUserProfile({...userProfile, class: classNum})}
                  >
                    <Text style={[
                      styles.classOptionText,
                      userProfile.class === classNum && styles.classOptionTextSelected
                    ]}>
                      Class {classNum}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.fieldValue}>
                <Text style={styles.fieldText}>
                  {userProfile.class ? `Class ${userProfile.class}` : 'Not set'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.cancelButton, saving && styles.disabledButton]} 
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={[styles.cancelButtonText, saving && styles.disabledText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.disabledButton]} 
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={[styles.saveButtonText, saving && styles.disabledText]}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Additional Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="notifications-outline" size={24} color="#666" />
              <Text style={styles.settingItemText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="lock-closed-outline" size={24} color="#666" />
              <Text style={styles.settingItemText}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#666" />
              <Text style={styles.settingItemText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
              <Text style={[styles.settingItemText, styles.signOutText]}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Refresh Profile Button */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={fetchUserProfile}
            disabled={loading}
          >
            <Ionicons name="refresh-outline" size={20} color="#007AFF" />
            <Text style={styles.refreshButtonText}>Refresh Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 20,
    padding: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  fieldValue: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  fieldText: {
    fontSize: 16,
    color: '#333',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    fontSize: 16,
    color: '#333',
  },
  classSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: '18%',
    alignItems: 'center',
  },
  classOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  classOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  classOptionTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  signOutText: {
    color: '#e74c3c',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  refreshButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default Settings;