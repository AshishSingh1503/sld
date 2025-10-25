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
import { Svg, Circle, Rect, Polygon, Ellipse, Path } from 'react-native-svg';

// --- Local navigation props ---
type ShapesHubProps = {
  onStartLearn2D: () => void;
  onStartTest2D: () => void;
  onStartLearn3D: () => void;
  onStartTest3D: () => void;
};

type ScreenProps = {
    onBack?: () => void;
};

// --- Constants ---
const COLORS = {
  primary: '#9B59B6', // A nice purple for shapes
  secondary: '#3498DB',
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
    <View style={[styles.cardIconContainer, {backgroundColor: 'rgba(155, 89, 182, 0.1)'}]}>
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

// --- Shape Components ---
const ShapeDisplay: React.FC<{ shape: string; color: string; size?: number }> = ({ shape, color, size = 100 }) => {
    switch (shape) {
        case 'circle': return <Svg height={size} width={size}><Circle cx={size/2} cy={size/2} r={size/2 * 0.9} fill={color} /></Svg>;
        case 'square': return <Svg height={size} width={size}><Rect x={size*0.05} y={size*0.05} width={size*0.9} height={size*0.9} rx="5" fill={color} /></Svg>;
        case 'rectangle': return <Svg height={size} width={size*1.5}><Rect x={size*0.05} y={size*0.05} width={size*1.4} height={size*0.9} rx="5" fill={color} /></Svg>;
        case 'triangle': return <Svg height={size} width={size}><Polygon points={`${size/2},${size*0.1} ${size*0.9},${size*0.9} ${size*0.1},${size*0.9}`} fill={color} /></Svg>;
        default: return null;
    }
};

const ThreeDShapeDisplay: React.FC<{ shape: string; size?: number }> = ({ shape, size = 120 }) => {
    switch(shape) {
        case 'cuboid': return <Text style={{fontSize: size}}>📦</Text>;
        case 'cylinder': return <Text style={{fontSize: size}}>🥫</Text>;
        case 'cone': return <Text style={{fontSize: size}}>🍦</Text>;
        case 'sphere': return <Text style={{fontSize: size}}>⚽</Text>;
        default: return null;
    }
};


// --- Shapes Module Screens ---

// 1. Shapes Hub Screen
const ShapesHubScreen: React.FC<ShapesHubProps> = ({ onStartLearn2D, onStartTest2D, onStartLearn3D, onStartTest3D }) => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Fun with Shapes 🎨</Text></View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
          <ModuleCard title="Learn 2D Shapes" icon="📖" description="Meet circles, squares, and more." onPress={onStartLearn2D} />
          <ModuleCard title="Test 2D Shapes" icon="✏️" description="How well do you know 2D shapes?" onPress={onStartTest2D} />
          <ModuleCard title="Learn 3D Shapes" icon="🧊" description="Explore cuboids, spheres, and cones." onPress={onStartLearn3D} />
          <ModuleCard title="Test 3D Shapes" icon="🤔" description="Can you name the 3D shapes?" onPress={onStartTest3D} />
      </ScrollView>
    </SafeAreaView>
);

// 2. Learn 2D Shapes Screen
const Learn2DShapesScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const shapes = [
        { name: 'circle', color: COLORS.shape_yellow },
        { name: 'square', color: COLORS.shape_red },
        { name: 'rectangle', color: COLORS.shape_blue },
        { name: 'triangle', color: COLORS.shape_green },
    ];
    const [index, setIndex] = useState(0);

    const next = () => setIndex(prev => (prev + 1) % shapes.length);
    const prev = () => setIndex(prev => (prev - 1 + shapes.length) % shapes.length);
    
    const currentShape = shapes[index];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>}
                <Text style={styles.instructionText}>This is a {currentShape.name}</Text>
            </View>
            <View style={styles.shapeCanvas}>
                <ShapeDisplay shape={currentShape.name} color={currentShape.color} size={200} />
            </View>
            <View style={styles.optionsFooter}>
                <AppButton title="⬅️ Prev" onPress={prev} />
                <AppButton title="Next ➡️" onPress={next} />
            </View>
        </SafeAreaView>
    );
};

// 3. Test 2D Shapes Screen
const Test2DShapesScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const shapes = [
        { name: 'circle', color: COLORS.shape_yellow },
        { name: 'square', color: COLORS.shape_red },
        { name: 'rectangle', color: COLORS.shape_blue },
        { name: 'triangle', color: COLORS.shape_green },
    ];
    const [problem, setProblem] = useState(shapes[0]);
    const [options, setOptions] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<{message: string; type: 'correct' | 'incorrect'} | null>(null);

    const generateNewQuestion = () => {
        const newProblem = shapes[Math.floor(Math.random() * shapes.length)];
        setProblem(newProblem);

        const otherOptions = shapes.filter(s => s.name !== newProblem.name).map(s => s.name);
        const shuffledOptions = [...otherOptions].sort(() => 0.5 - Math.random());
        setOptions([newProblem.name, ...shuffledOptions.slice(0, 2)].sort(() => 0.5 - Math.random()));
    };

    useEffect(generateNewQuestion, []);

    const handleAnswer = (selectedShape: string) => {
        if (selectedShape === problem.name) {
            setFeedback({ type: 'correct', message: 'Correct!' });
            setTimeout(() => { setFeedback(null); generateNewQuestion(); }, 1500);
        } else {
            setFeedback({ type: 'incorrect', message: 'Not quite!' });
            setTimeout(() => setFeedback(null), 1500);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>}
                <Text style={styles.instructionText}>What shape is this?</Text>
            </View>
            <View style={styles.shapeCanvas}>
                <ShapeDisplay shape={problem.name} color={problem.color} size={200} />
            </View>
            {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
            <View style={styles.optionsFooter}>
                {options.map(name => (
                    <AppButton key={name} title={name.charAt(0).toUpperCase() + name.slice(1)} onPress={() => handleAnswer(name)} disabled={!!feedback} />
                ))}
            </View>
        </SafeAreaView>
    );
};

// 4. Learn 3D Shapes Screen
const Learn3DShapesScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const shapes = ['cuboid', 'cylinder', 'cone', 'sphere'];
    const [index, setIndex] = useState(0);
    
    const next = () => setIndex(prev => (prev + 1) % shapes.length);
    const prev = () => setIndex(prev => (prev - 1 + shapes.length) % shapes.length);
    
    const currentShape = shapes[index];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>}
                <Text style={styles.instructionText}>This is a {currentShape}</Text>
            </View>
            <View style={styles.shapeCanvas}>
                <ThreeDShapeDisplay shape={currentShape} size={200} />
            </View>
            <View style={styles.optionsFooter}>
                <AppButton title="⬅️ Prev" onPress={prev} />
                <AppButton title="Next ➡️" onPress={next} />
            </View>
        </SafeAreaView>
    );
};

// 5. Test 3D Shapes Screen
const Test3DShapesScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const shapes = ['cuboid', 'cylinder', 'cone', 'sphere'];
    const [problemShape, setProblemShape] = useState(shapes[0]);
    const [options, setOptions] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<{message: string; type: 'correct' | 'incorrect'} | null>(null);

    const generateNewQuestion = () => {
        const newProblemShape = shapes[Math.floor(Math.random() * shapes.length)];
        setProblemShape(newProblemShape);

        const otherOptions = shapes.filter(s => s !== newProblemShape);
        const shuffledOptions = [...otherOptions].sort(() => 0.5 - Math.random());
        setOptions([newProblemShape, ...shuffledOptions.slice(0, 2)].sort(() => 0.5 - Math.random()));
    };

    useEffect(generateNewQuestion, []);

    const handleAnswer = (selectedShape: string) => {
        if (selectedShape === problemShape) {
            setFeedback({ type: 'correct', message: 'That\'s it!' });
            setTimeout(() => { setFeedback(null); generateNewQuestion(); }, 1500);
        } else {
            setFeedback({ type: 'incorrect', message: 'Try again!' });
            setTimeout(() => setFeedback(null), 1500);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>}
                <Text style={styles.instructionText}>What is this 3D shape called?</Text>
            </View>
            <View style={styles.shapeCanvas}>
                <ThreeDShapeDisplay shape={problemShape} size={150} />
            </View>
            {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
            <View style={styles.optionsFooter}>
                {options.map(name => (
                    <AppButton key={name} title={name.charAt(0).toUpperCase() + name.slice(1)} onPress={() => handleAnswer(name)} disabled={!!feedback} />
                ))}
            </View>
        </SafeAreaView>
    );
};


// --- Module Root ---
const ShapesModule: React.FC = () => {
  const [screen, setScreen] = useState<'main' | 'learn2d' | 'test2d' | 'learn3d' | 'test3d'>('main');

  if (screen === 'learn2d') return <Learn2DShapesScreen onBack={() => setScreen('main')} />;
  if (screen === 'test2d') return <Test2DShapesScreen onBack={() => setScreen('main')} />;
  if (screen === 'learn3d') return <Learn3DShapesScreen onBack={() => setScreen('main')} />;
  if (screen === 'test3d') return <Test3DShapesScreen onBack={() => setScreen('main')} />;

  return (
    <ShapesHubScreen
      onStartLearn2D={() => setScreen('learn2d')}
      onStartTest2D={() => setScreen('test2d')}
      onStartLearn3D={() => setScreen('learn3d')}
      onStartTest3D={() => setScreen('test3d')}
    />
  );
};

export default ShapesModule;

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
  disabledButton: { backgroundColor: '#C3B1D1' },
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
  shapeCanvas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shapeButton: {
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }
});
