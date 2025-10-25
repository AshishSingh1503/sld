import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';

// --- Constants ---
const COLORS = {
  primary: '#3498DB', // Blue for this module
  secondary: '#2980B9',
  background: '#EBF5FB',
  card: '#FFFFFF',
  text: '#34495E',
  lightText: '#7F8C8D',
  white: '#FFFFFF',
  headerText: '#1A5276',
  correct: '#2ECC71',
  incorrect: '#E74C3C',
};

// --- Type Definitions ---
type ScreenType = 'hub' | 'length' | 'weight' | 'volume';
type HubProps = {
    onSelect: (screen: ScreenType) => void;
};
type ConversionProps = {
    onBack: () => void;
    title: string;
    icon: string;
    units: { from: string; to: string; factor: number };
};
type Feedback = {
    message: string;
    type: 'correct' | 'incorrect';
};

// --- Reusable Components ---
const ModuleCard: React.FC<{title: string, icon: string, description: string, onPress: () => void}> = ({ title, icon, description, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Text style={styles.cardIcon}>{icon}</Text>
    <View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  </TouchableOpacity>
);

const AppButton: React.FC<{title: string, onPress: () => void, disabled?: boolean}> = ({ title, onPress, disabled }) => (
    <TouchableOpacity style={[styles.button, disabled && styles.disabledButton]} onPress={onPress} disabled={disabled}>
        <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
);

const FeedbackIndicator: React.FC<Feedback> = ({ message, type }) => (
  <View style={[styles.feedbackContainer, { backgroundColor: type === 'correct' ? COLORS.correct : COLORS.incorrect }]}>
    <Text style={styles.feedbackText}>{message}</Text>
  </View>
);

// --- Screen Components ---

const HubScreen: React.FC<HubProps> = ({ onSelect }) => (
    <View>
        <Text style={styles.mainHeader}>Measurement Conversions</Text>
        <Text style={styles.introText}>Learn how to convert between different units of measurement!</Text>
        <ModuleCard title="Length" icon="📏" description="Convert cm, m, and km." onPress={() => onSelect('length')} />
        <ModuleCard title="Weight" icon="⚖️" description="Convert g and kg." onPress={() => onSelect('weight')} />
        <ModuleCard title="Volume" icon="💧" description="Convert ml and L." onPress={() => onSelect('volume')} />
    </View>
);

const ConversionScreen: React.FC<ConversionProps> = ({ onBack, title, icon, units }) => {
    const [question, setQuestion] = useState({ value: 0, from: units.from, to: units.to });
    const [options, setOptions] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const correctAnswer = question.from === units.from ? question.value / units.factor : question.value * units.factor;

    const generateNewQuestion = () => {
        const isForward = Math.random() > 0.5; // e.g., cm -> m
        const fromUnit = isForward ? units.from : units.to;
        const toUnit = isForward ? units.to : units.from;
        
        let value = 0;
        if (isForward) {
            value = (Math.floor(Math.random() * 9) + 2) * units.factor; // e.g., 200, 300... cm
        } else {
            value = Math.floor(Math.random() * 9) + 2; // e.g., 2, 3... m
        }
        
        const newQuestion = { value, from: fromUnit, to: toUnit };
        setQuestion(newQuestion);
        setFeedback(null);

        const newAnswer = isForward ? newQuestion.value / units.factor : newQuestion.value * units.factor;
        const otherOptions: number[] = [];
        while(otherOptions.length < 2) {
            const randomFactor = Math.random() > 0.5 ? units.factor : (1 / units.factor);
            const randomOption = newQuestion.value * randomFactor;
            if(randomOption !== newAnswer && !otherOptions.includes(randomOption)) {
                otherOptions.push(parseFloat(randomOption.toFixed(2)));
            }
        }
        setOptions([newAnswer, ...otherOptions].sort(() => 0.5 - Math.random()));
    };

    useEffect(generateNewQuestion, []);

    const handleAnswer = (answer: number) => {
        if (answer === correctAnswer) {
            setFeedback({ type: 'correct', message: 'Correct!' });
            setTimeout(generateNewQuestion, 1500);
        } else {
            setFeedback({ type: 'incorrect', message: `The answer is ${correctAnswer}` });
            setTimeout(generateNewQuestion, 2000);
        }
    };

    return (
        <View>
            <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back to Menu</Text></TouchableOpacity>
            <Text style={styles.sectionHeader}>{title} Conversion {icon}</Text>
            
            <View style={styles.ruleBox}>
                <Text style={styles.ruleText}>{units.factor} {units.from} = 1 {units.to}</Text>
            </View>

            <View style={styles.practiceBox}>
                <Text style={styles.questionText}>Practice Question:</Text>
                <Text style={styles.question}>Convert {question.value} {question.from} to {question.to}</Text>
                {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
                <View style={styles.optionsContainer}>
                    {options.map(opt => <AppButton key={opt} title={String(opt)} onPress={() => handleAnswer(opt)} disabled={!!feedback} />)}
                </View>
            </View>
        </View>
    );
};


// --- Main App Component ---
const ConversionsModule: React.FC = () => {
    const [screen, setScreen] = useState<ScreenType>('hub');

    const renderScreen = () => {
        switch (screen) {
            case 'length': return <ConversionScreen onBack={() => setScreen('hub')} title="Length" icon="📏" units={{from: 'cm', to: 'm', factor: 100}} />;
            case 'weight': return <ConversionScreen onBack={() => setScreen('hub')} title="Weight" icon="⚖️" units={{from: 'g', to: 'kg', factor: 1000}} />;
            case 'volume': return <ConversionScreen onBack={() => setScreen('hub')} title="Volume" icon="💧" units={{from: 'ml', to: 'L', factor: 1000}} />;
            default: return <HubScreen onSelect={setScreen} />;
        }
    };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderScreen()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ConversionsModule;

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, flexGrow: 1 },
  mainHeader: { fontSize: 32, fontWeight: 'bold', color: COLORS.headerText, textAlign: 'center', marginBottom: 10 },
  sectionHeader: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginTop: 10, marginBottom: 25 },
  introText: { fontSize: 16, lineHeight: 24, color: COLORS.lightText, textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: COLORS.card, borderRadius: 15, padding: 20, marginBottom: 15, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  cardIcon: { fontSize: 30, marginRight: 20 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  cardDescription: { fontSize: 14, color: COLORS.lightText, marginTop: 2 },
  backButton: { alignSelf: 'flex-start', marginBottom: 20 },
  backButtonText: { fontSize: 16, color: COLORS.secondary, fontWeight: '600' },
  optionsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  button: { backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 25, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  disabledButton: { backgroundColor: '#A9CCE3' },
  buttonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  feedbackContainer: { padding: 15, borderRadius: 10, marginVertical: 15 },
  feedbackText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  ruleBox: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  ruleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.headerText,
  },
  practiceBox: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 15,
  },
  questionText: {
    fontSize: 18,
    color: COLORS.lightText,
    textAlign: 'center',
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: 15,
  },
});
