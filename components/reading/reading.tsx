import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../../services/userService';

const WordSentenceScreen = ({ goBack }: { goBack: () => void }) => {
  const [mode, setMode] = useState<'word' | 'sentence' | 'phonics' | null>(null);
  const [userClass, setUserClass] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserClass();
  }, []);

  const loadUserClass = async () => {
    try {
      setLoading(true);
      const classNumber = await userService.getUserClass();
      setUserClass(classNumber);
    } catch (error) {
      console.error('Error loading user class:', error);
      Alert.alert('Error', 'Failed to load your class information. Please check your settings.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={28} color="#9a3412" />
        </TouchableOpacity>
        <Text style={styles.loadingText}>Loading your class content...</Text>
      </View>
    );
  }

  if (!userClass) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={28} color="#9a3412" />
        </TouchableOpacity>
        <Text style={styles.title}>Choose a Learning Mode</Text>
        <Text style={styles.classInfo}>Please set your class in settings first</Text>
        <TouchableOpacity 
          style={styles.setClassButton} 
          onPress={() => {
            Alert.alert(
              'Class Not Set',
              'Please go to Settings and set your class (1-5) to access personalized content.',
              [
                { text: 'OK', style: 'default' }
              ]
            );
          }}
        >
          <Text style={styles.setClassButtonText}>Set Your Class</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!mode) {
    return (
      <View style={styles.container}>
        {/* Back button at top left */}
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={28} color="#9a3412" />
        </TouchableOpacity>

        <Text style={styles.title}>Choose a Learning Mode</Text>
        <Text style={styles.classInfo}>Class {userClass} Content</Text>
        
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.customButton, styles.wordButton]} 
            onPress={() => setMode('word')}
          >
            <Text style={styles.customButtonText}>Words</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.customButton, styles.sentenceButton]} 
            onPress={() => setMode('sentence')}
          >
            <Text style={styles.customButtonText}>Sentences</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.customButton, styles.phonicsButton]} 
            onPress={() => setMode('phonics')}
          >
            <Text style={styles.customButtonText}>Phonetics</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Lazy load based on mode
  if (mode === 'word') {
    const WordScreen = require('./WordScreen').default;
    return <WordScreen goBack={() => setMode(null)} userClass={userClass} />;
  }

  if (mode === 'sentence') {
    const SentenceScreen = require('./SentenceScreen').default;
    return <SentenceScreen goBack={() => setMode(null)} userClass={userClass} />;
  }

  if (mode === 'phonics') {
    const PhonicsScreen = require('./PhonicsScreen').default;
    return <PhonicsScreen goBack={() => setMode(null)} userClass={userClass} />;
  }

  return null;
};

export default WordSentenceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    padding: 20
  },
  title: {
    fontSize: 58,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#9a3412',
  },
  classInfo: {
    fontSize: 24,
    color: '#ea580c',
    marginBottom: 40,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 24,
    color: '#9a3412',
    textAlign: 'center',
  },
  setClassButton: {
    backgroundColor: '#ea580c',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  setClassButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  customButton: {
    borderRadius: 32,
    paddingHorizontal: 50,
    paddingVertical: 50,
    marginHorizontal: 10,
    marginVertical: 10,
    minWidth: 100,
    alignItems: 'center',
    minHeight: 80,
  },
  wordButton: {
    backgroundColor: '#ea580c',
  },
  sentenceButton: {
    backgroundColor: '#f97316',
  },
  phonicsButton: {
    backgroundColor: '#fb923c',
  },
  customButtonText: {
    color: '#fff',
    fontSize: 44,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    lineHeight: 52,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
    zIndex: 1,
  },
});