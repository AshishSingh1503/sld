// You can run this full code snippet in an Expo project.
// Make sure to install the required dependencies:
// npx expo install typescript @types/react react-native-screens react-native-safe-area-context @react-navigation/native @react-navigation/stack react-native-gesture-handler react-native-reanimated react-native-svg
// After installing, create a tsconfig.json file. You can do this by running `npx expo start` and following the prompts.

import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import { Svg, Circle, Rect, Line, Polygon } from 'react-native-svg';

// --- Type Definitions ---

type RootStackParamList = {
  Dashboard: undefined;
  Geometry: undefined;
  SpatialVocabulary: undefined;
  SolidsAroundUs: undefined;
};

type DashboardScreenProps = StackScreenProps<RootStackParamList, 'Dashboard'>;
type GeometryScreenProps = StackScreenProps<RootStackParamList, 'Geometry'>;
type SpatialVocabularyScreenProps = StackScreenProps<RootStackParamList, 'SpatialVocabulary'>;
type SolidsAroundUsScreenProps = StackScreenProps<RootStackParamList, 'SolidsAroundUs'>;


// --- Constants ---
const COLORS = {
  primary: '#4A90E2', // A friendly, calming blue
  secondary: '#50E3C2', // A bright, encouraging teal/mint
  background: '#F5FCFF',
  card: '#FFFFFF',
  text: '#333333',
  lightText: '#777777',
  correct: '#7ED321', // Green for correct answers
  incorrect: '#D0021B', // Red for incorrect answers
  white: '#FFFFFF',
};

const SPATIAL_CONCEPTS = [
  { id: 'on', label: 'On', instruction: 'Place the ball ON the box.' },
  { id: 'under', label: 'Under', instruction: 'Place the ball UNDER the box.' },
  { id: 'inside', label: 'Inside', instruction: 'Place the ball INSIDE the box.' },
  { id: 'outside', label: 'Outside', instruction: 'Place the ball OUTSIDE the box.' },
  { id: 'above', label: 'Above', instruction: 'Place the ball ABOVE the box.' },
  { id: 'below', label: 'Below', instruction: 'Place the ball BELOW the box.' },
  { id: 'near', label: 'Near', instruction: 'Place the ball NEAR the box.' },
  { id: 'far', label: 'Far', instruction: 'Place the ball FAR from the box.' },
];

const SOLID_OBJECTS = [
    { id: 'ball', name: 'Ball', rolls: true, slides: false, Component: () => <Circle cx="50" cy="50" r="45" fill={COLORS.secondary} /> },
    { id: 'box', name: 'Box', rolls: false, slides: true, Component: () => <Rect x="10" y="10" width="80" height="80" rx="5" fill={COLORS.secondary} /> },
    { id: 'cone', name: 'Cone', rolls: true, slides: true, Component: () => <Polygon points="50,10 90,90 10,90" fill={COLORS.secondary} /> },
    { id: 'pipe', name: 'Cylinder', rolls: true, slides: true, Component: () => <Rect x="20" y="10" width="60" height="80" rx="30" fill={COLORS.secondary} /> },
];


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// --- Reusable Components ---

interface AppButtonProps {
  title: string;
  onPress: () => void;
  style?: object;
  textStyle?: object;
}

const AppButton: React.FC<AppButtonProps> = ({ title, onPress, style, textStyle }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
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
    <View style={styles.cardIconContainer}>
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
  <View style={[styles.feedbackContainer, { backgroundColor: type === 'correct' ? COLORS.correct : COLORS.incorrect }]}>
    <Text style={styles.feedbackText}>{message}</Text>
  </View>
);

// --- Screens ---

// 1. Dashboard Screen
const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MathLeap</Text>
        <Text style={styles.headerSubtitle}>Let's learn and play!</Text>
      </View>
      <ModuleCard
        title="Geometry"
        icon="📐"
        description="Shapes and where things go."
        onPress={() => navigation.navigate('Geometry')}
      />
      <ModuleCard
        title="Numbers"
        icon="🔢"
        description="Counting and simple math."
        onPress={() => { /* navigation.navigate('Numbers') */ }}
      />
      <ModuleCard
        title="Money"
        icon="💰"
        description="Learn about coins and notes."
        onPress={() => { /* navigation.navigate('Money') */ }}
      />
      <ModuleCard
        title="Measurement"
        icon="📏"
        description="Long, short, heavy, and light."
        onPress={() => { /* navigation.navigate('Measurement') */ }}
      />
    </ScrollView>
  </SafeAreaView>
);

// 2. Geometry Hub Screen
const GeometryScreen: React.FC<GeometryScreenProps> = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Geometry 📐</Text>
    </View>
    <ScrollView contentContainerStyle={styles.scrollContent}>
       <ModuleCard
        title="Spatial Vocabulary"
        icon="🗺️"
        description="Top, Bottom, On, Under..."
        onPress={() => navigation.navigate('SpatialVocabulary')}
      />
       <ModuleCard
        title="Solids Around Us"
        icon="⚽📦"
        description="Rolling and sliding shapes."
        onPress={() => navigation.navigate('SolidsAroundUs')}
      />
    </ScrollView>
  </SafeAreaView>
);

// 3. Spatial Vocabulary Learning Module
const SpatialVocabularyScreen: React.FC<SpatialVocabularyScreenProps> = () => {
  const [conceptIndex, setConceptIndex] = useState(0);
  const [feedback, setFeedback] = useState<{message: string; type: 'correct' | 'incorrect'} | null>(null);
  const pan = useRef(new Animated.ValueXY()).current as any;
  
  const currentConcept = SPATIAL_CONCEPTS[conceptIndex];

  const handleNextConcept = () => {
    setFeedback(null);
    setConceptIndex((prevIndex) => (prevIndex + 1) % SPATIAL_CONCEPTS.length);
    pan.setValue({ x: 0, y: 0 }); // Reset ball position
  };
  
  const checkPosition = (x: number, y: number) => {
    const boxX = screenWidth / 2 - 75;
    const boxY = screenHeight / 2 - 25;
    const boxWidth = 150;
    const boxHeight = 100;
    let isCorrect = false;

    switch (currentConcept.id) {
      case 'on': isCorrect = x > boxX && x < boxX + boxWidth && y > boxY - 50 && y < boxY; break;
      case 'under': isCorrect = x > boxX && x < boxX + boxWidth && y > boxY + boxHeight && y < boxY + boxHeight + 50; break;
      case 'inside': isCorrect = x > boxX + 10 && x < boxX + boxWidth - 10 && y > boxY + 10 && y < boxY + boxHeight -10; break;
      case 'outside': isCorrect = !(x > boxX && x < boxX + boxWidth && y > boxY && y < boxY + boxHeight); break;
      case 'above': isCorrect = y < boxY - 50; break;
      case 'below': isCorrect = y > boxY + boxHeight + 50; break;
      case 'near': isCorrect = Math.abs(x - (boxX + boxWidth/2)) < 150 && Math.abs(y - (boxY + boxHeight/2)) < 150; break;
      case 'far': isCorrect = Math.abs(x - (boxX + boxWidth/2)) > 200 || Math.abs(y - (boxY + boxHeight/2)) > 200; break;
    }

    if (isCorrect) {
      setFeedback({ type: 'correct', message: 'Great job!' });
      setTimeout(handleNextConcept, 1500);
    } else {
      setFeedback({ type: 'incorrect', message: 'Try again!' });
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => pan.setOffset({ x: pan.x._value, y: pan.y._value }),
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        pan.flattenOffset();
        checkPosition(gesture.moveX, gesture.moveY);
      },
    })
  ).current;

  const boxX = screenWidth / 2 - 75;
  const boxY = screenHeight / 2 - 25;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.activityHeader}><Text style={styles.instructionText}>{currentConcept.instruction}</Text></View>
      <View style={styles.canvas}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Rect x={boxX} y={boxY} width={150} height={100} stroke={COLORS.primary} strokeWidth="4" fill={currentConcept.id === 'inside' ? 'rgba(74, 144, 226, 0.1)' : COLORS.card} rx="10"/>
           {currentConcept.id === 'inside' && <Line x1={boxX} y1={boxY} x2={boxX+150} y2={boxY} stroke={COLORS.primary} strokeWidth="4" />}
        </Svg>
        <Animated.View style={{ transform: [{ translateX: pan.x }, { translateY: pan.y }], position: 'absolute', top: screenHeight * 0.2, left: screenWidth / 2 - 25 }} {...panResponder.panHandlers}>
          <View style={styles.ball} />
        </Animated.View>
      </View>
      {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
      <View style={styles.footerControls}><AppButton title="Next Concept" onPress={handleNextConcept} /></View>
    </SafeAreaView>
  );
};

// 4. Solids Around Us Learning Module
const SolidsAroundUsScreen: React.FC<SolidsAroundUsScreenProps> = () => {
    const [objectIndex, setObjectIndex] = useState(0);
    const [feedback, setFeedback] = useState<{message: string; type: 'correct' | 'incorrect'} | null>(null);
    const animationValue = useRef(new Animated.Value(0)).current;

    const currentObject = SOLID_OBJECTS[objectIndex];

    const handleNextObject = () => {
        setFeedback(null);
        animationValue.setValue(0);
        setObjectIndex(prev => (prev + 1) % SOLID_OBJECTS.length);
    };

    const checkAnswer = (property: 'rolls' | 'slides' | 'both') => {
        const { rolls, slides } = currentObject;
        let isCorrect = false;
        if (property === 'rolls') isCorrect = rolls && !slides;
        else if (property === 'slides') isCorrect = slides && !rolls;
        else if (property === 'both') isCorrect = rolls && slides;

        if (isCorrect) {
            setFeedback({ type: 'correct', message: 'That\'s right!' });
            triggerAnimation();
            setTimeout(handleNextObject, 2500);
        } else {
            setFeedback({ type: 'incorrect', message: 'Not quite, try again!' });
            setTimeout(() => setFeedback(null), 1500);
        }
    };

    const triggerAnimation = () => {
        Animated.timing(animationValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    };

    const animatedStyle = {
        transform: [
            {
                translateX: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, currentObject.slides ? screenWidth - 150 : 0],
                }),
            },
            {
                rotate: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', currentObject.rolls ? '360deg' : '0deg'],
                }),
            },
        ],
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.activityHeader}>
                <Text style={styles.instructionText}>Does this object roll or slide?</Text>
            </View>

            <View style={styles.solidCanvas}>
                <Animated.View style={[styles.solidObjectContainer, animatedStyle]}>
                    <Svg height="100" width="100" viewBox="0 0 100 100">
                        <currentObject.Component />
                    </Svg>
                </Animated.View>
                <Text style={styles.solidObjectName}>{currentObject.name}</Text>
            </View>

            {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}

            <View style={styles.solidFooter}>
                <AppButton title="Rolls 🔄" onPress={() => checkAnswer('rolls')} style={{backgroundColor: '#E67E22'}}/>
                <AppButton title="Slides ⛷️" onPress={() => checkAnswer('slides')} style={{backgroundColor: '#3498DB'}}/>
                <AppButton title="Both" onPress={() => checkAnswer('both')} style={{backgroundColor: '#9B59B6'}}/>
            </View>
        </SafeAreaView>
    );
};


// --- App Navigation ---
const Stack = createStackNavigator<RootStackParamList>();

export { SolidsAroundUsScreen };

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.background } }}>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Geometry" component={GeometryScreen} />
        <Stack.Screen name="SpatialVocabulary" component={SpatialVocabularyScreen} />
        <Stack.Screen name="SolidsAroundUs" component={SolidsAroundUsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 18,
    color: COLORS.lightText,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  cardIcon: {
    fontSize: 30,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityHeader: {
    padding: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  instructionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  canvas: {
    flex: 1,
  },
  ball: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  footerControls: {
    padding: 20,
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    zIndex: 10,
  },
  feedbackText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Solids Around Us Screen Styles
  solidCanvas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  solidObjectContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  solidObjectName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  solidFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingBottom: 30,
  },
});
