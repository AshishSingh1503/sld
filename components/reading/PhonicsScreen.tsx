import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import Slider from '@react-native-community/slider';
import { contentService } from '../../services/contentService';

// Import JSON files directly
import class1Data from '../../assets/class1.json';
import class2Data from '../../assets/class2.json';
import class3Data from '../../assets/class3.json';
import class4Data from '../../assets/class4.json';
import class5Data from '../../assets/class5.json';

interface PhonicsScreenProps {
  goBack: () => void;
  userClass: number;
}

interface PhonicsWord {
  word: string;
  sounds: string;
}

const PhonicsScreen = ({ goBack, userClass }: PhonicsScreenProps) => {
  const [rate, setRate] = useState(0.8);
  const [words, setWords] = useState<string[]>([]);
  const [phonicsWords, setPhonicsWords] = useState<PhonicsWord[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const current = phonicsWords[index];

  useEffect(() => {
    loadClassWords();
  }, [userClass]);

  const loadClassWords = async () => {
    try {
      setLoading(true);
      
      // Load class-specific content
      let classWords: string[] = [];
      
      switch (userClass) {
        case 1:
          classWords = (class1Data as any).words || [];
          break;
        case 2:
          classWords = (class2Data as any).words || [];
          break;
        case 3:
          classWords = (class3Data as any).words || [];
          break;
        case 4:
          classWords = (class4Data as any).words || [];
          break;
        case 5:
          classWords = (class5Data as any).words || [];
          break;
      }
      
      setWords(classWords);
      
      if (classWords.length > 0) {
        const phonics = generatePhonics(classWords);
        setPhonicsWords(phonics);
        setIndex(0);
      }
    } catch (error) {
      console.error('Error loading class words for phonics:', error);
      Alert.alert('Error', 'Failed to load words for your class.');
    } finally {
      setLoading(false);
    }
  };

  const generatePhonics = (wordList: string[]): PhonicsWord[] => {
    return wordList.map((word: string) => ({
      word,
      sounds: word.split('').join('-')
    }));
  };

  const speakPhonics = () => {
    if (!current) return;
    
    let delay = 0;
    current.sounds.split('-').forEach((sound, i) => {
      setTimeout(() => Speech.speak(sound, { rate }), delay);
      delay += 600;
    });
    setTimeout(() => Speech.speak(current.word, { rate }), delay);
  };

  const next = () => {
    if (phonicsWords.length > 0) {
      const newIndex = (index + 1) % phonicsWords.length;
      setIndex(newIndex);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={28} color="#9a3412" />
        </TouchableOpacity>
        <Text style={styles.loadingText}>Loading Class {userClass} phonics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button at Top Left */}
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={28} color="#9a3412" />
      </TouchableOpacity>

      <Text style={styles.title}>Phonics Practice</Text>
      <Text style={styles.classInfo}>Class {userClass} Phonics</Text>

      {/* Phonics Card */}
      <View style={styles.card}>
        <Text style={styles.word}>{current?.word || 'No words available'}</Text>
        <Text style={styles.sounds}>{current?.sounds || ''}</Text>
        <TouchableOpacity onPress={speakPhonics} style={styles.micButton}>
          <Ionicons name="volume-high" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Next Button */}
      <TouchableOpacity onPress={next} style={styles.nextButton}>
        <Text style={styles.nextButtonText}>Next Word</Text>
      </TouchableOpacity>

      {/* Speed Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Speech Speed</Text>
        <Slider
          style={{ width: 250, height: 40 }}
          minimumValue={0.3}
          maximumValue={1.5}
          step={0.1}
          value={rate}
          onValueChange={setRate}
          minimumTrackTintColor="#ea580c"
          maximumTrackTintColor="#fed7aa"
          thumbTintColor="#ea580c"
        />
        <Text style={styles.rateValue}>{rate.toFixed(1)}x</Text>
      </View>
    </View>
  );
};

export default PhonicsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    padding: 20
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
    zIndex: 1,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#9a3412',
    textAlign: 'center'
  },
  classInfo: {
    fontSize: 20,
    color: '#ea580c',
    marginBottom: 30,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 24,
    color: '#9a3412',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 30,
    borderRadius: 20,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 30,
    alignItems: 'center',
  },
  word: {
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 15,
    color: '#1e293b',
    textAlign: 'center'
  },
  sounds: {
    fontSize: 32,
    marginBottom: 25,
    color: '#ea580c',
    fontWeight: '600',
    textAlign: 'center'
  },
  micButton: {
    padding: 15,
    backgroundColor: '#ea580c',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButton: {
    backgroundColor: '#ea580c',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#9a3412',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sliderContainer: {
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#9a3412',
    fontWeight: '600',
  },
  rateValue: {
    fontSize: 16,
    marginTop: 5,
    color: '#9a3412',
    fontWeight: 'bold',
  },
});