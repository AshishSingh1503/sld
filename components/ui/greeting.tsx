import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { authService } from '../../services/authService';

interface GreetingProps {
  styles?: any; // Accept external styles
}

const GreetingComponent: React.FC<GreetingProps> = ({ styles: externalStyles }) => {
  const [firstName, setFirstName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    try {
      setLoading(true);
      
      // Get current user from Supabase
      const user = await authService.getCurrentUser();
      
      if (user && user.user_metadata?.firstName) {
        setFirstName(user.user_metadata.firstName);
      } else {
        // Fallback: try to get name from email or use generic greeting
        const emailName = user?.email?.split('@')[0] || '';
        setFirstName(emailName || 'User');
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
      setFirstName('User'); // Fallback name
    } finally {
      setLoading(false);
    }
  };

  // Use external styles if provided, otherwise use default styles
  const componentStyles = externalStyles || defaultStyles;

  return (
    <View style={{ flex: 1 }}>
      <Text style={componentStyles.greeting}>
        {loading ? 'Hello 👋' : `Hello, ${firstName} 👋`}
      </Text>
      <Text style={componentStyles.subtitle}>
        What would you like to do today?
      </Text>
    </View>
  );
};

// Default styles (only used if no external styles provided)
const defaultStyles = StyleSheet.create({
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});

export default GreetingComponent;