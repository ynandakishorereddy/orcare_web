import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const slides = [
  {
    emoji: '🦷',
    tag: 'Welcome',
    title: 'Your Oral Health\nCompanion',
    desc: 'Learn, track, and improve your dental hygiene with personalized AI-powered guidance.',
  },
  {
    emoji: '🤖',
    tag: 'AI Chatbot',
    title: 'Ask Anything,\nAnytime',
    desc: 'Get instant answers to any oral health question from our ORCare AI, powered by Google Gemini.',
  },
  {
    emoji: '📚',
    tag: 'Learning',
    title: 'Explore &\nLearn',
    desc: '6 categories with 24+ modules covering daily hygiene, diseases, nutrition, and more.',
  },
  {
    emoji: '🔔',
    tag: 'Reminders',
    title: 'Build Habits\nThat Last',
    desc: 'Set smart reminders for brushing, flossing, and mouthwash to keep your smile healthy.',
  },
  {
    emoji: '🔍',
    tag: 'Symptom Check',
    title: 'Detect Early,\nStay Safe',
    desc: 'Check symptoms, explore oral diseases, and know exactly when to visit your dentist.',
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [current, setCurrent] = useState(0);
  const { completeOnboarding } = useAuth();

  async function handleNext() {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      await completeOnboarding();
      // AppNavigator handles the shift to MainTabs
    }
  }

  async function handleSkip() {
    await completeOnboarding();
    // AppNavigator handles the shift to MainTabs
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      {/* Top */}
      <View style={styles.topRow}>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>{slides[current].tag}</Text>
        </View>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Illustration */}
      <View style={styles.illustrationArea}>
        <Text style={styles.slideEmoji}>{slides[current].emoji}</Text>
      </View>

      {/* Text */}
      <View style={styles.textArea}>
        <Text style={styles.slideTitle}>{slides[current].title}</Text>
        <Text style={styles.slideDesc}>{slides[current].desc}</Text>
      </View>

      {/* Bottom */}
      <View style={styles.bottomArea}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === current && styles.dotActive]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>
            {current === slides.length - 1 ? "Let's Get Started!" : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 48,
    paddingHorizontal: 28,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  tagPill: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },

  illustrationArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  slideEmoji: {
    fontSize: 80,
  },

  textArea: {
    marginBottom: 32,
    gap: 12,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  slideDesc: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },

  bottomArea: {
    gap: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 28,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textPrimary,
  },

  nextBtn: {
    backgroundColor: Colors.textPrimary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.background,
  },
});

