import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Svg, Circle, Rect, Polygon } from 'react-native-svg';

// --- Local navigation props ---
type PatternsHubProps = {
  onStartExtendShape: () => void;
  onStartExtendNumber: () => void;
  onStartSplitNumber: () => void;
  onStartStamp: () => void;
};

type ScreenProps = {
    onBack?: () => void;
};

// --- Constants ---
const COLORS = {
  primary: '#1ABC9C', // A nice teal for patterns
  secondary: '#16A085',
  background: '#F5FCFF',
  card: '#FFFFFF',
  text: '#333333',
  lightText: '#777777',
  correct: '#2ECC71',
  incorrect: '#E74C3C',
  white: '#FFFFFF',
  shape_red: '#E74C3C',
  shape_blue: '#3498DB',
  shape_green: '#2ECC71',
  shape_yellow: '#F1C40F',
};

// --- Reusable Components ---

interface AppButtonProps {
  title: string;
  onPress: () => void;
  style?: object;
  textStyle?: object;
  disabled?: boolean;
}

const AppButton: React.FC<AppButtonProps> = ({ title, onPress, style, textStyle, disabled }) => (
  <TouchableOpacity style={[styles.button, style, disabled && styles.disabledButton]} onPress={onPress} disabled={disabled}>
    <Text style={[styles.buttonText, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

interface ModuleCardProps {
    title: string;
    icon: string;
    onPress: () => void;
    description: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, icon, onPress, description }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={[styles.cardIconContainer, {backgroundColor: 'rgba(22, 160, 133, 0.1)'}]}>
      <Text style={styles.cardIcon}>{icon}</Text>
    </View>
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  </TouchableOpacity>
);

interface FeedbackIndicatorProps {
    message: string;
    type: 'correct' | 'incorrect';
}

const FeedbackIndicator: React.FC<FeedbackIndicatorProps> = ({ message, type }) => (
  <Animated.View style={[styles.feedbackContainer, { backgroundColor: type === 'correct' ? COLORS.correct : COLORS.incorrect }]}>
    <Text style={styles.feedbackText}>{message}</Text>
  </Animated.View>
);

// --- Shape & Stamp Components ---
const StampDisplay: React.FC<{ stamp: string; size?: number }> = ({ stamp, size = 50 }) => {
    const renderStamp = () => {
        switch (stamp) {
            case 'circle': return <Svg height={size} width={size}><Circle cx={size/2} cy={size/2} r={size/2 * 0.8} fill={COLORS.shape_blue} /></Svg>;
            case 'square': return <Svg height={size} width={size}><Rect x={size*0.1} y={size*0.1} width={size*0.8} height={size*0.8} rx="3" fill={COLORS.shape_red} /></Svg>;
            case 'triangle': return <Svg height={size} width={size}><Polygon points={`${size/2},${size*0.1} ${size*0.9},${size*0.9} ${size*0.1},${size*0.9}`} fill={COLORS.shape_green} /></Svg>;
            case 'leaf': return <Text style={{fontSize: size * 0.8}}>🍁</Text>;
            case 'thumb': return <Text style={{fontSize: size * 0.8}}>👍</Text>;
            default: return <Text style={{fontSize: size * 0.8}}>{stamp}</Text>;
        }
    };
    return <View style={{width: size, height: size, justifyContent: 'center', alignItems: 'center'}}>{renderStamp()}</View>
};


// --- Patterns Module Screens ---

// 1. Patterns Hub Screen
const PatternsHubScreen: React.FC<PatternsHubProps> = ({ onStartExtendShape, onStartExtendNumber, onStartSplitNumber, onStartStamp }) => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Fun with Patterns ✨</Text></View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
          <ModuleCard title="Shape Patterns" icon="💠" description="What comes next in the sequence?" onPress={onStartExtendShape} />
          <ModuleCard title="Number Patterns" icon="🔢" description="Find the next number in the pattern." onPress={onStartExtendNumber} />
          <ModuleCard title="Splitting Numbers" icon="➕" description="Find patterns in number pairs." onPress={onStartSplitNumber} />
          <ModuleCard title="Pattern Maker" icon="🎨" description="Create your own cool patterns!" onPress={onStartStamp} />
      </ScrollView>
    </SafeAreaView>
);

// 2. Extend Shape Pattern Screen
const ExtendShapePatternScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const [pattern, setPattern] = useState<string[]>([]);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [options, setOptions] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<{message: string; type: 'correct' | 'incorrect'} | null>(null);
    const allShapes = ['circle', 'square', 'triangle'];

    const generateNewQuestion = () => {
        const patternType = Math.floor(Math.random() * 2); // 0: ABAB, 1: AABB
        const shape1 = allShapes[Math.floor(Math.random() * allShapes.length)];
        let shape2 = allShapes[Math.floor(Math.random() * allShapes.length)];
        while (shape1 === shape2) {
            shape2 = allShapes[Math.floor(Math.random() * allShapes.length)];
        }
        
        let newPattern: string[] = [];
        let newCorrectAnswer = '';

        if (patternType === 0) { // ABAB
            newPattern = [shape1, shape2, shape1, shape2];
            newCorrectAnswer = shape1;
        } else { // AABB
            newPattern = [shape1, shape1, shape2, shape2];
            newCorrectAnswer = shape1;
        }
        
        setPattern(newPattern);
        setCorrectAnswer(newCorrectAnswer);
        setOptions([newCorrectAnswer, ...allShapes.filter(s => s !== newCorrectAnswer)].sort(() => 0.5 - Math.random()));
    };

    useEffect(generateNewQuestion, []);

    const handleAnswer = (selectedShape: string) => {
        if (selectedShape === correctAnswer) {
            setFeedback({ type: 'correct', message: 'You got it!' });
            setTimeout(() => { setFeedback(null); generateNewQuestion(); }, 1500);
        } else {
            setFeedback({ type: 'incorrect', message: 'Not quite, try again!' });
            setTimeout(() => setFeedback(null), 1500);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>}
                <Text style={styles.instructionText}>What shape comes next?</Text>
            </View>
            <View style={styles.patternCanvas}>
                {pattern.map((shape, i) => <StampDisplay key={i} stamp={shape} size={60} />)}
                <Text style={styles.questionMark}>?</Text>
            </View>
            {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
            <View style={styles.optionsFooter}>
                {options.map(shape => (
                    <TouchableOpacity key={shape} style={styles.shapeButton} onPress={() => handleAnswer(shape)} disabled={!!feedback}>
                        <StampDisplay stamp={shape} size={70} />
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};

// 3. Extend Number Pattern Screen
const ExtendNumberPatternScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const [pattern, setPattern] = useState<number[]>([]);
    const [correctAnswer, setCorrectAnswer] = useState(0);
    const [options, setOptions] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<{message: string; type: 'correct' | 'incorrect'} | null>(null);

    const generateNewQuestion = () => {
        const start = Math.floor(Math.random() * 10) + 1;
        const step = [2, 3, 5, 10][Math.floor(Math.random() * 4)];
        const newPattern = [start, start + step, start + 2 * step, start + 3 * step];
        const newCorrectAnswer = start + 4 * step;

        setPattern(newPattern);
        setCorrectAnswer(newCorrectAnswer);

        const otherOptions: number[] = [];
        while(otherOptions.length < 2) {
            const randomOption = newCorrectAnswer + (Math.floor(Math.random() * 6) - 3);
            if(randomOption !== newCorrectAnswer && !otherOptions.includes(randomOption) && randomOption > 0) {
                otherOptions.push(randomOption);
            }
        }
        setOptions([newCorrectAnswer, ...otherOptions].sort(() => 0.5 - Math.random()));
    };

    useEffect(generateNewQuestion, []);

    const handleAnswer = (selectedNumber: number) => {
        if (selectedNumber === correctAnswer) {
            setFeedback({ type: 'correct', message: 'Correct!' });
            setTimeout(() => { setFeedback(null); generateNewQuestion(); }, 1500);
        } else {
            setFeedback({ type: 'incorrect', message: 'Keep trying!' });
            setTimeout(() => setFeedback(null), 1500);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>}
                <Text style={styles.instructionText}>What number comes next?</Text>
            </View>
            <View style={styles.patternCanvas}>
                {pattern.map((num, i) => <Text key={i} style={styles.numberText}>{num}</Text>)}
                <Text style={styles.questionMark}>?</Text>
            </View>
            {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
            <View style={styles.optionsFooter}>
                {options.map(num => (
                    <AppButton key={num} title={String(num)} onPress={() => handleAnswer(num)} disabled={!!feedback} style={styles.numberButton} />
                ))}
            </View>
        </SafeAreaView>
    );
};

// 4. Pattern Stamping Screen
const StampPatternScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const stamps = ['circle', 'square', 'triangle', 'leaf', 'thumb'];
    const [selectedStamp, setSelectedStamp] = useState(stamps[0]);
    const [pattern, setPattern] = useState<string[]>([]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>}
                <Text style={styles.instructionText}>Create Your Own Pattern!</Text>
            </View>
            
            <View style={styles.stampPalette}>
                {stamps.map(stamp => (
                    <TouchableOpacity key={stamp} onPress={() => setSelectedStamp(stamp)} style={[styles.shapeButton, selectedStamp === stamp && styles.selectedStamp]}>
                        <StampDisplay stamp={stamp} size={50} />
                    </TouchableOpacity>
                ))}
            </View>
            
            <TouchableOpacity style={styles.stampingCanvas} onPress={() => setPattern(prev => [...prev, selectedStamp])}>
                {pattern.map((stamp, i) => <StampDisplay key={i} stamp={stamp} size={40} />)}
            </TouchableOpacity>

            <View style={styles.checkFooter}>
                <AppButton title="Clear Pattern" onPress={() => setPattern([])} />
            </View>
        </SafeAreaView>
    );
};

// 5. Split Number Pattern Screen
const SplitNumberPatternScreen: React.FC<ScreenProps> = ({ onBack }) => {
    // This screen is more for observation, so we'll keep it simple.
    const target = 10;
    const splits = [
        {a: 9, b: 1},
        {a: 8, b: 2},
        {a: 7, b: 3},
        {a: 6, b: 4},
        {a: 5, b: 5},
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>}
                <Text style={styles.instructionText}>Patterns in Number Pairs</Text>
            </View>
            <View style={styles.splitCanvas}>
                <Text style={styles.splitTitle}>All these pairs make {target}!</Text>
                {splits.map((split, i) => (
                    <Text key={i} style={styles.splitText}>{split.a} + {split.b} = {target}</Text>
                ))}
                <Text style={styles.splitObservation}>Notice a pattern? As one number goes down, the other goes up!</Text>
            </View>
        </SafeAreaView>
    );
};


// --- Module Root ---
const PatternsModule: React.FC = () => {
  const [screen, setScreen] = useState<'main' | 'extendShape' | 'extendNumber' | 'splitNumber' | 'stamp'>('main');

  if (screen === 'extendShape') return <ExtendShapePatternScreen onBack={() => setScreen('main')} />;
  if (screen === 'extendNumber') return <ExtendNumberPatternScreen onBack={() => setScreen('main')} />;
  if (screen === 'splitNumber') return <SplitNumberPatternScreen onBack={() => setScreen('main')} />;
  if (screen === 'stamp') return <StampPatternScreen onBack={() => setScreen('main')} />;

  return (
    <PatternsHubScreen
      onStartExtendShape={() => setScreen('extendShape')}
      onStartExtendNumber={() => setScreen('extendNumber')}
      onStartSplitNumber={() => setScreen('splitNumber')}
      onStartStamp={() => setScreen('stamp')}
    />
  );
};

export default PatternsModule;

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20 },
  header: { 
      paddingVertical: 20, 
      paddingHorizontal: 20, 
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  cardIconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  cardIcon: { fontSize: 30 },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  cardDescription: { fontSize: 14, color: COLORS.lightText, marginTop: 4 },
  button: { backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3, marginHorizontal: 5 },
  disabledButton: { backgroundColor: '#B2DFDB' },
  buttonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  instructionText: { flex: 1, fontSize: 22, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
  feedbackContainer: { position: 'absolute', bottom: 120, left: 20, right: 20, padding: 20, borderRadius: 15, alignItems: 'center', zIndex: 10 },
  feedbackText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  optionsFooter: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 20,
      paddingBottom: 40,
      backgroundColor: COLORS.card,
      borderTopWidth: 1,
      borderColor: '#eee',
  },
  backButton: {
      position: 'absolute',
      left: 20,
      top: 20,
      padding: 8,
      zIndex: 1,
  },
  backButtonText: {
      color: COLORS.primary,
      fontWeight: '600',
      fontSize: 16,
  },
  patternCanvas: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  questionMark: {
    fontSize: 50,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 10,
  },
  shapeButton: {
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  numberText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginHorizontal: 10,
  },
  numberButton: {
    minWidth: 80,
  },
  stampPalette: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  selectedStamp: {
    borderColor: COLORS.primary,
    transform: [{scale: 1.1}],
  },
  stampingCanvas: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    padding: 10,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  checkFooter: {
    padding: 20,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  splitCanvas: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  splitTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
  splitText: {
    fontSize: 28,
    color: COLORS.text,
    marginVertical: 8,
  },
  splitObservation: {
    fontSize: 18,
    color: COLORS.secondary,
    marginTop: 30,
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
