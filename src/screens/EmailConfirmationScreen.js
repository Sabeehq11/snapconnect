import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, theme } from '../utils/colors';

const EmailConfirmationScreen = ({ navigation, route }) => {
  const { email } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.gradients.hero}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a confirmation link to
            </Text>
            <Text style={styles.email}>{email}</Text>
          </View>

          {/* Info Card */}
          <View style={styles.infoContainer}>
            <LinearGradient
              colors={colors.gradients.card}
              style={styles.infoCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.infoTitle}>📧 Next Steps</Text>
              <Text style={styles.infoText}>
                1. Check your email inbox (and spam folder)
              </Text>
              <Text style={styles.infoText}>
                2. Click the confirmation link
              </Text>
              <Text style={styles.infoText}>
                3. Return here to sign in
              </Text>
            </LinearGradient>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Login')}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>
                  Already confirmed? Sign In
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.linkText}>
                Wrong email? <Text style={styles.linkTextAccent}>Try Again</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  backgroundGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  email: {
    fontSize: theme.typography.fontSizes.lg,
    color: colors.accent,
    fontWeight: theme.typography.fontWeights.semibold,
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: theme.spacing.xl,
  },
  infoCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  infoTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  infoText: {
    fontSize: theme.typography.fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: theme.spacing.sm,
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
  button: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  buttonGradient: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  linkText: {
    color: colors.textSecondary,
    fontSize: theme.typography.fontSizes.md,
  },
  linkTextAccent: {
    color: colors.accent,
    fontWeight: theme.typography.fontWeights.semibold,
  },
});

export default EmailConfirmationScreen; 