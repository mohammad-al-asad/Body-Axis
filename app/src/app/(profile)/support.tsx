import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';

// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const SUBSCRIPTION_FAQS: FAQItem[] = [
  {
    id: 'sub_1',
    question: 'How does the 7-day free trial work?',
    answer: 'You will receive full access to all premium features, routines, and progress trackers for 7 days. If you do not cancel before the trial period concludes, your account will be charged for the yearly plan.',
  },
  {
    id: 'sub_2',
    question: 'How do I cancel my active subscription?',
    answer: 'You can manage or cancel your active subscription directly inside the Subscription Management card in your profile, or through your device\'s App Store or Google Play Store subscription dashboard.',
  },
  {
    id: 'sub_3',
    question: 'Can I get a refund if I cancel early?',
    answer: 'Refund policies are managed entirely by the respective store platforms (Apple App Store / Google Play Store). Please contact their billing support teams to request a refund.',
  },
];

const APP_FAQS: FAQItem[] = [
  {
    id: 'app_1',
    question: 'What is alignment calibration?',
    answer: 'Alignment calibration uses interactive assessments to identify posture shifts and joint asymmetries. This builds a customized baseline to tailor the correct therapeutic exercise phases for you.',
  },
  {
    id: 'app_2',
    question: 'How often should I perform the routines?',
    answer: 'We recommend performing your customized active routines 3 to 4 times a week. Regular engagement is key to restoring posture balance and reducing compensation patterns.',
  },
  {
    id: 'app_3',
    question: 'Does the app support offline mode?',
    answer: 'Yes! Once your personalized routines are synchronized to your local profile, you can view the video steps, alignment guidelines, and session timers without an active internet connection.',
  },
];

export default function SupportScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  // List of currently expanded FAQ item IDs
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  // Issue submission states
  const [issueCategory, setIssueCategory] = useState<'Billing' | 'Bug' | 'Feature' | 'Other'>('Billing');
  const [issueText, setIssueText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter((item) => item !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  const renderFAQList = (faqs: FAQItem[]) => {
    return faqs.map((faq) => {
      const isExpanded = expandedIds.includes(faq.id);
      return (
        <View key={faq.id} style={styles.faqCard}>
          <TouchableOpacity
            style={styles.faqHeader}
            activeOpacity={0.7}
            onPress={() => toggleExpand(faq.id)}
          >
            <Text style={styles.questionText}>{faq.question}</Text>
            <View style={[styles.arrowWrapper, isExpanded && styles.arrowWrapperActive]}>
              <Feather
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={isExpanded ? theme.quaternary || theme.secondary : theme.textSecondary}
              />
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.faqAnswerContainer}>
              <Text style={styles.answerText}>{faq.answer}</Text>
            </View>
          )}
        </View>
      );
    });
  };

  const handleSubmitIssue = () => {
    if (!issueText.trim()) {
      Alert.alert('Empty Description', 'Please provide details about the issue you are experiencing.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIssueText('');
      Alert.alert(
        'Issue Submitted',
        'Thank you! Your report has been submitted. Our support team will review it and follow up via email.'
      );
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header onBackPress={() => router.back()} showNotification={false} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Support & FAQ</Text>
          <Text style={styles.subtitle}>Find answers to commonly asked questions</Text>

          {/* Submit Issue Section */}
          <Text style={[styles.categoryTitle, { marginTop: 14 }]}>SUBMIT AN ISSUE</Text>
          <View style={styles.card}>
            <Text style={styles.formLabel}>Select Category</Text>
            <View style={styles.categoryRow}>
              {(['Billing', 'Bug', 'Feature', 'Other'] as const).map((cat) => {
                const isSelected = issueCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryTag,
                      isSelected && styles.categoryTagActive
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setIssueCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryTagText,
                        isSelected && styles.categoryTagTextActive
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Describe your issue or feedback in detail..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              value={issueText}
              onChangeText={setIssueText}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.submitButton}
              activeOpacity={0.8}
              onPress={handleSubmitIssue}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Issue'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Subscription Section */}
          <Text style={[styles.categoryTitle, { marginTop: 14 }]}>SUBSCRIPTION FAQ</Text>
          <View style={styles.faqListContainer}>{renderFAQList(SUBSCRIPTION_FAQS)}</View>

          {/* App Section */}
          <Text style={[styles.categoryTitle, { marginTop: 14 }]}>APP FAQ</Text>
          <View style={styles.faqListContainer}>{renderFAQList(APP_FAQS)}</View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.text,
      marginTop: 12,
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 24,
    },
    categoryTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.quaternary || theme.secondary,
      letterSpacing: 1.0,
      marginBottom: 12,
    },
    faqListContainer: {
      marginBottom: 16,
    },
    faqCard: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 16,
      marginBottom: 12,
      overflow: 'hidden',
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    faqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 18,
    },
    questionText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      flex: 1,
      paddingRight: 16,
      lineHeight: 20,
    },
    arrowWrapper: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    arrowWrapperActive: {
      backgroundColor: 'rgba(98, 250, 227, 0.05)',
      borderColor: 'rgba(98, 250, 227, 0.15)',
    },
    faqAnswerContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
      paddingTop: 16,
    },
    answerText: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    card: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    formLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.textSecondary,
      marginBottom: 8,
    },
    categoryRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    categoryTag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.inputBorder,
    },
    categoryTagActive: {
      backgroundColor: 'rgba(98, 250, 227, 0.08)',
      borderColor: theme.quaternary || theme.secondary,
    },
    categoryTagText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    categoryTagTextActive: {
      color: theme.quaternary || theme.secondary,
      fontWeight: '700',
    },
    textInput: {
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 12,
      padding: 12,
      color: theme.text,
      fontSize: 14,
      height: 100,
      marginBottom: 16,
    },
    submitButton: {
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
  });
