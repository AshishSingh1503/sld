import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';

// Import Class 1 games
import { SpatialVocabularyScreen } from './class1/main';
import { SolidsAroundUsScreen } from './class1/solidaroundus';
import MoneyScreen, { MoneyLearnScreen, MoneyTestScreen } from './class1/money';
import MeasurementScreen from './class1/measurement';
import NumbersModule from './class1/number';

// Import Class 2 games

import NumbersModuleClass2 from './class2/number';
import arithmetic from './class2/arithmetic';
import MulDiv from './class2/muldiv';
import Pattern from './class2/pattern';
import Shape from './class2/shape';



// Import Class 3 games
import { default as Multiplication } from './class3/Multiplication';
import { default as Division } from './class3/division';
import { default as Fraction } from './class3/fraction';
import { default as Measurement } from './class3/Measurement';
import { default as Placevalue } from './class3/Placevalue'; 

// Import Class 4 games
import { default as Decimal } from './class4/decimal';

// Import Class 5 games
import { default as PercentageGame } from './class5/percentage';
import { default as DataHandling } from './class5/datahandle';
import { default as Arithmetic2 } from './class5/arithmetic2';
import { default as Fraction2 } from './class5/fraction';

const { width, height } = Dimensions.get('window');

interface GamesSectionProps {
  onBack: () => void;
  navigation: any;
}

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  component: React.ComponentType<any>;
}

const GamesSection: React.FC<GamesSectionProps> = ({ onBack, navigation }) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserClass();
  }, []);

  const fetchUserClass = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userClass = user.user_metadata?.class || 1;
        setSelectedClass(userClass);
      }
    } catch (error) {
      console.error('Error fetching user class:', error);
    } finally {
      setLoading(false);
    }
  };

  const class1Games: Game[] = [
    {
      id: 'numbers',
      title: 'Numbers',
      description: 'Counting and number skills',
      icon: '🔢',
      color: '#1abc9c',
      component: NumbersModule,
    },
    {
      id: 'spatial-vocabulary',
      title: 'Spatial Vocabulary',
      description: 'Learn about positions and spatial relationships',
      icon: '🗺️',
      color: '#667eea',
      component: SpatialVocabularyScreen,
    },
    {
      id: 'solids-around-us',
      title: 'Solids Around Us',
      description: 'Learn about rolling and sliding shapes',
      icon: '⚽📦',
      color: '#50E3C2',
      component: SolidsAroundUsScreen,
    },
    {
      id: 'money',
      title: 'Money Games',
      description: 'Learn about Indian currency',
      icon: '💰',
      color: '#FFD700',
      component: MoneyScreen,
    },
    {
      id: 'measurement',
      title: 'Measurement',
      description: 'Learn about length, weight, and capacity',
      icon: '📏',
      color: '#4CAF50',
      component: MeasurementScreen,
    },
  ];

  const class2Games: Game[] = [
    {
      id: 'numbers-class-2',
      title: 'Numbers (Class 2)',
      description: 'Counting, ordering, and skip counting',
      icon: '🔢',
      color: '#0ea5e9',
      component: NumbersModuleClass2,
    },
    {
      id: 'arithmetic',
      title: 'arithmetic ',
      description: ' addition, subtraction',
      icon: '🔢',
      color: '#0ea5e9',
      component: arithmetic,
    },
    {
      id: 'muldiv',
      title: 'muldiv',
      description: 'multiplication, division',
      icon: '🔢',
      color: '#0ea5e9',
      component: MulDiv,
    },  
    {
      id: 'shape',
      title: 'shape',
      description: 'shape',
      icon: '🔢',
      color: '#0ea5e9',
      component: Shape,
    },
      {
        id: 'pattern',
        title: 'pattern',
        description: 'pattern',
        icon: '🔢',
        color: '#0ea5e9',
        component: Pattern,
      },
      
  ];

  const class3Games: Game[] = [
    {
      id: 'multiplication',
      title: 'Multiplication Tables',
      description: 'Learn and practice multiplication tables 1-10',
      icon: '✖️',
      color: '#8b5cf6',
      component: Multiplication,
    },
    {
      id: 'division',
      title: 'Division Dash',
      description: 'Learn and practice division tables 2-10',
      icon: '➗',
      color: '#ef4444',
      component: Division,
    },
    {
      id: 'fraction',
      title: 'Fraction Frenzy',
      description: 'Learn and practice fractions',
      icon: '🔢',
      color: '#667eea',
      component: Fraction,
    },
    {
      id: 'measurement',
      title: 'Measurement Mastery',
      description: 'Learn and practice measurements',
      icon: '📏',
      color: '#667eea',
      component: Measurement,
    },
    {
      id: 'placevalue',
      title: 'Place Value Mastery',
      description: 'Learn and practice place value',
      icon: '🔢',
      color: '#667eea',
      component: Placevalue,
    },
  ];

  const class4Games: Game[] = [
    {
      id: 'decimal',
      title: 'Decimal Mastery',
      description: 'Learn and practice decimals',
      icon: '🔢',
      color: '#667eea',
      component: Decimal,
    },
  ];

  const class5Games: Game[] = [
    {
      id: 'percentage',
      title: 'Percentage Power',
      description: 'Master percentages, fractions, and decimals',
      icon: '📊',
      color: '#004D40',
      component: PercentageGame,
    },
    {
      id: 'shape',
      title: 'Shape',
      description: 'Learn and practice shapes',
      icon: '🔢',
      color: '#667eea',
      component: Shape,
    },
    {
      id: 'data-handling',
      title: 'Data Handling',
      description: 'Learn and practice data handling',
      icon: '🔢',
      color: '#667eea',
      component: DataHandling,
    },
    {
      id: 'arithmetic',
      title: 'Arithmetic',
      description: 'Learn and practice arithmetic',
      icon: '🔢',
      color: '#667eea',
      component: Arithmetic2,
    },
    {
      id: 'fraction',
      title: 'Fraction',
      description: 'Learn and practice fractions',
      icon: '🔢',
      color: '#667eea',
      component: Fraction2,
    },
  ];

  const getGamesForClass = (classNum: number): Game[] => {
    switch (classNum) {
      case 1:
        return class1Games;
      case 2:
        return class2Games;
      case 3:
        return class3Games;
      case 4:
        return class4Games;
      case 5:
        return class5Games;
      default:
        return [];
    }
  };

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
  };

  const renderGame = () => {
    const games = getGamesForClass(selectedClass);
    const game = games.find(g => g.id === selectedGame);
    if (!game) return null;

    const GameComponent = game.component;
    return <GameComponent navigation={navigation} />;
  };

  const renderGameCard = (game: Game, index: number) => (
    <Animated.View
      key={game.id}
      style={[styles.gameCard, { width: width / 3.3 }]}
      entering={SlideInUp.delay(index * 100)}
    >
      <TouchableOpacity
        style={[styles.gameCardContent, { backgroundColor: game.color }]}
        onPress={() => handleGameSelect(game.id)}
        activeOpacity={0.8}
      >
        <View style={styles.gameIconContainer}>
          <Text style={styles.gameIcon}>{game.icon}</Text>
        </View>
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle} numberOfLines={1}>{game.title}</Text>
          <Text style={styles.gameDescription} numberOfLines={2}>{game.description}</Text>
          <View style={styles.playButton}>
            <Ionicons name="play-circle" size={24} color="white" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (selectedGame) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToMenu}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Math Games</Text>
          <View style={styles.headerSpacer} />
        </View>
        {renderGame()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Math Games</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading games...</Text>
          </View>
        ) : (
          <>
            {/* Games Grid */}
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.gamesContainer}>
                <Text style={styles.sectionTitle}>Class {selectedClass} Games</Text>
                <Text style={styles.sectionSubtitle}>
                  Fun and educational math games for learning
                </Text>

                <View style={styles.gamesGrid}>
                  {getGamesForClass(selectedClass).map((game, index) => renderGameCard(game, index))}
                </View>
              </View>
            </ScrollView>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#667eea',
  },

  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: '#667eea', // Temporarily using a solid color
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  classSelector: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  classSelectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  classButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  classButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  classButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  classButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  classButtonTextActive: {
    color: '#667eea',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 16,
  },
  gamesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 10,
  },
  gameCard: {
    marginBottom: 10,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    aspectRatio: 0.8,
  },
  gameCardContent: {
    flex: 1,
    padding: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    overflow: 'hidden',
  },
  gameIconContainer: {
    width: '100%',
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameIcon: {
    fontSize: 40,
    color: 'white',
  },
  gameInfo: {
    padding: 10,
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'space-between',
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  playButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 'auto',
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});

export default GamesSection; 