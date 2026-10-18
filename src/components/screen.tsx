import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme';

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Link href="/" accessibilityLabel="Audio Tour home" style={styles.brand}>
              <View style={styles.brandContents}>
                <View style={styles.brandIcon}>
                  <Ionicons name="headset-outline" size={21} color={colors.surface} />
                </View>
                <Text style={styles.brandName}>Audio Tour</Text>
              </View>
            </Link>
            <View style={styles.previewBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.previewText}>App preview</Text>
            </View>
          </View>
          <View style={styles.content}>{children}</View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>A little more to every place.</Text>
            <Text style={styles.footerVersion}>EARLY BUILD · 0.1</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  container: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: 24,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  brand: { borderRadius: 8 },
  brandContents: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: {
    backgroundColor: colors.green,
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 21, fontWeight: '700', letterSpacing: -0.7, color: colors.ink },
  previewBadge: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.orange },
  previewText: { fontSize: 12, color: colors.muted },
  content: { flex: 1, paddingVertical: 34, gap: 30 },
  footer: {
    paddingVertical: 23,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  footerText: { fontSize: 12, color: colors.muted },
  footerVersion: { fontSize: 10, letterSpacing: 1.3, color: colors.muted },
});
