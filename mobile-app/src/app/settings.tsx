import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { hasPremiumAccessForEmail, hasStripeConfig, stripeConfig } from '@/lib/stripe-config';

const membersSeed = [
  { id: 1, name: 'Amina', isOnline: true },
  { id: 2, name: 'Fabrice', isOnline: true },
  { id: 3, name: 'Nadia', isOnline: false, lastSeenMs: 45 * 1000 },
  { id: 4, name: 'Joseph', isOnline: false, lastSeenMs: 7 * 60 * 1000 },
  { id: 5, name: 'Lina', isOnline: false, lastSeenMs: 25 * 60 * 1000 },
];

function formatRelativeTime(ms: number) {
  const minutes = Math.max(0, Math.round(ms / 60000));
  if (minutes <= 0) return 'il y a quelques secondes';
  if (minutes === 1) return 'il y a 1 minute';
  return `il y a ${minutes} minutes`;
}

export default function SettingsScreen() {
  const theme = useTheme();
  const [now, setNow] = useState(Date.now());
  const currentUserEmail = process.env.EXPO_PUBLIC_SUPER_ADMIN_EMAIL || 'jacquesmasuruku2@gmail.com';
  const isSuperAdmin = hasPremiumAccessForEmail(currentUserEmail);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(interval);
  }, []);

  const members = useMemo(
    () =>
      membersSeed.map((member) => {
        const lastSeenMs = member.isOnline ? 0 : member.lastSeenMs ?? 0;

        return {
          ...member,
          statusText: member.isOnline ? 'En ligne' : formatRelativeTime(lastSeenMs),
          statusColor: member.isOnline ? '#22c55e' : '#f59e0b',
        };
      }),
    [now]
  );

  const openUpgrade = async () => {
    const url = stripeConfig.checkoutUrl || stripeConfig.portalUrl || 'https://example.com';

    if (!hasStripeConfig()) {
      Alert.alert(
        'Paiement Stripe',
        'Ajoute les variables EXPO_PUBLIC_STRIPE_* pour activer le bouton premium.'
      );
      return;
    }

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Impossible d’ouvrir le paiement', 'Le lien Stripe n’est pas disponible.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Paramètres</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Vue des membres actifs et accès premium
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Membres actifs
          </ThemedText>

          {members.map((member) => (
            <ThemedView key={member.id} style={styles.memberRow}>
              <ThemedView style={[styles.avatar, { backgroundColor: member.isOnline ? '#22c55e' : '#94a3b8' }]} />
              <ThemedView style={styles.memberInfo}>
                <ThemedText type="default">{member.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {member.statusText}
                </ThemedText>
              </ThemedView>
              <ThemedView
                style={[styles.statusDot, { backgroundColor: member.statusColor }]}
                accessibilityLabel={member.isOnline ? 'En ligne' : 'Hors ligne'}
              />
            </ThemedView>
          ))}
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Fonctionnalités complètes
          </ThemedText>

          <ThemedText type="small" themeColor="textSecondary" style={styles.featuresText}>
            Activez l’accès premium pour débloquer les fonctionnalités avancées de l’application.
          </ThemedText>

          {[
            'Accès complet à toutes les fonctionnalités',
            'Support premium et prioritaire',
            isSuperAdmin ? 'Accès premium activé par défaut pour le super admin' : 'Paiement Stripe prêt à brancher',
          ].map((item) => (
            <ThemedText key={item} type="small" style={styles.featureItem}>
              • {item}
            </ThemedText>
          ))}

          {!isSuperAdmin && (
            <Pressable
              onPress={openUpgrade}
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: pressed ? '#1d4ed8' : '#2563eb' },
              ]}>
              <ThemedText type="smallBold" style={styles.ctaText}>
                {hasStripeConfig() ? 'Activer le plan premium' : 'Configurer Stripe'}
              </ThemedText>
            </Pressable>
          )}

          {isSuperAdmin && (
            <ThemedView type="backgroundElement" style={styles.superAdminBadge}>
              <ThemedText type="smallBold" style={styles.superAdminText}>
                Premium activé pour le Super Admin
              </ThemedText>
            </ThemedView>
          )}

          <ThemedText type="small" themeColor="textSecondary" style={styles.envHint}>
            Variables attendues : EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY, EXPO_PUBLIC_STRIPE_PRICE_ID,
            EXPO_PUBLIC_STRIPE_CHECKOUT_URL, EXPO_PUBLIC_STRIPE_PORTAL_URL,
            EXPO_PUBLIC_SUPER_ADMIN_EMAILS
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.three,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    gap: Spacing.one,
    paddingTop: Spacing.one,
  },
  section: {
    borderRadius: 18,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sectionTitle: {
    marginBottom: Spacing.one,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  avatar: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  featuresText: {
    lineHeight: 22,
  },
  featureItem: {
    paddingVertical: 2,
  },
  cta: {
    marginTop: Spacing.two,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#ffffff',
  },
  envHint: {
    marginTop: Spacing.one,
    lineHeight: 18,
  },
  superAdminBadge: {
    marginTop: Spacing.one,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
  },
  superAdminText: {
    color: '#16a34a',
  },
});
