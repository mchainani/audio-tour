import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, type Href } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/theme';

export function Eyebrow({ children }: PropsWithChildren) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function Badge({ children }: PropsWithChildren) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{children}</Text>
    </View>
  );
}

export function BackLink({ href, children }: PropsWithChildren<{ href: Href }>) {
  return (
    <Link href={href} style={styles.backLink}>
      <Ionicons name="arrow-back" size={15} />
      {'  '}{children}
    </Link>
  );
}

export function MissingContent({ title, href, label }: { title: string; href: Href; label: string }) {
  return (
    <View style={styles.missing}>
      <Ionicons name="compass-outline" size={42} color={colors.green} />
      <Text role="heading" aria-level={1} style={styles.missingTitle}>{title}</Text>
      <Text style={styles.missingText}>This stop isn’t in the preview library.</Text>
      <BackLink href={href}>{label}</BackLink>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: colors.muted },
  badge: { backgroundColor: colors.sage, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: '600', color: colors.green, letterSpacing: 0.3 },
  backLink: { color: colors.green, fontSize: 13, paddingVertical: 10, alignSelf: 'flex-start' },
  missing: { alignItems: 'center', gap: 18, paddingVertical: 64 },
  missingTitle: { fontFamily: typography.heading, fontSize: 32, color: colors.ink, textAlign: 'center' },
  missingText: { color: colors.muted, fontSize: 15, textAlign: 'center' },
});
