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

interface SentenceScreenProps {
  goBack: () => void;
  userClass: number;
}

const SentenceScreen = ({ goBack, userClass }: SentenceScreenProps) => {
  const [sentences, setSentences] = useState<string[]>([]);
  const [sentence, setSentence] = useState('');
  const [rate, setRate] = useState(0.8);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClassSentences();
  }, [userClass]);

  const loadClassSentences = async () => {
    try {
      setLoading(true);
      
      // Load class-specific content
      let classSentences: string[] = [];
      
      switch (userClass) {
        case 1:
          classSentences = (class1Data as any).sentences || [];
          break;
        case 2:
          classSentences = (class2Data as any).sentences || [];
          break;
        case 3:
          classSentences = (class3Data as any).sentences || [];
          break;
        case 4:
          classSentences = (class4Data as any).sentences || [];
          break;
        case 5:
          classSentences = (class5Data as any).sentences || [];
          break;
      }
      
      setSentences(classSentences);
      
      if (classSentences.length > 0) {
        setSentence(contentService.getRandomItem(classSentences));
      }
    } catch (error) {
      console.error('Error loading class sentences:', error);
      Alert.alert('Error', 'Failed to load sentences for your class.');
    } finally {
      setLoading(false);
    }
  };

  const pickRandomSentence = () => {
    if (sentences.length > 0) {
      const randomSentence = contentService.getRandomItem(sentences);
      setSentence(randomSentence);
    }
  };

  const speak = () => {
    if (sentence) {
      Speech.speak(sentence, { rate });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={28} color="#9a3412" />
        </TouchableOpacity>
        <Text style={styles.loadingText}>Loading Class {userClass} sentences...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button at Top Left */}
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={28} color="#9a3412" />
      </TouchableOpacity>

      <Text style={styles.title}>Sentence Practice</Text>
      <Text style={styles.classInfo}>Class {userClass} Sentences</Text>

      {/* Sentence Card */}
      <View style={styles.card}>
        <Text style={styles.sentence}>{sentence || 'No sentences available'}</Text>
        <TouchableOpacity onPress={speak} style={styles.micButton}>
          <Ionicons name="volume-high" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Next Sentence Button */}
      <TouchableOpacity onPress={pickRandomSentence} style={styles.nextButton}>
        <Text style={styles.nextButtonText}>Next Sentence</Text>
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

export default SentenceScreen;

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
    padding: 50,
    borderRadius: 20,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentence: {
    fontSize: 40,
    fontWeight: '500',
    marginBottom: 45,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 32
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