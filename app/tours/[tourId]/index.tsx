import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { BackLink, Badge, Eyebrow, MissingContent } from '@/components/ui';
import { previewTours } from '@/features/tours/preview-tours';
import { colors, typography } from '@/theme';

export default function TourScreen() {
  const { tourId } = useLocalSearchParams<{ tourId: string }>();
  const tour = previewTours.find((entry) => entry.id === tourId);

  if (!tour) {
    return <Screen><MissingContent title="Tour not found" href="/" label="Back to your tours" /></Screen>;
  }

  return (
    <Screen>
      <BackLink href="/">Your tours</BackLink>
      <View style={styles.introduction}>
        <Badge>PREVIEW TOUR</Badge>
        <Text role="heading" aria-level={1} style={styles.title}>{tour.title}</Text>
        <Text style={styles.intro}>{tour.intro}</Text>
        <Text style={styles.metadata}>{tour.chapters.length} chapters · {tour.language}{tour.author ? ` · By ${tour.author}` : ''}</Text>
      </View>
      <View style={styles.sectionHeading}>
        <Text role="heading" aria-level={2} style={styles.sectionTitle}>One stop at a time.</Text>
        <Eyebrow>THE CHAPTERS</Eyebrow>
      </View>
      <View style={styles.chapters}>
        {tour.chapters.map((chapter, index) => (
          <Link key={chapter.id} href={{ pathname: '/tours/[tourId]/chapters/[chapterId]', params: { tourId: tour.id, chapterId: chapter.id } }} asChild>
            <Pressable accessibilityLabel={`Chapter ${index + 1}: ${chapter.title}`} style={styles.chapter}>
              <Text style={styles.chapterNumber}>{String(index + 1).padStart(2, '0')}</Text>
              <View style={styles.chapterText}>
                <Text style={styles.chapterTitle}>{chapter.title}</Text>
                <View style={styles.location}>
                  <Ionicons name="location-outline" size={13} color={colors.muted} />
                  <Text style={styles.locationText}>{chapter.location.name}</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={18} color={colors.green} />
            </Pressable>
          </Link>
        ))}
      </View>
      <Text style={styles.note}>This tour previews the app’s structure. Narration, live maps, and tour imports will be connected in the next stage.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  introduction: { gap: 20, maxWidth: 760 },
  title: { fontFamily: typography.heading, fontSize: 43, lineHeight: 49, letterSpacing: -1.2, color: colors.ink },
  intro: { fontSize: 16, lineHeight: 27, color: colors.muted, maxWidth: 700 },
  metadata: { fontSize: 12, color: colors.muted, lineHeight: 20 },
  sectionHeading: { gap: 10, marginTop: 12 },
  sectionTitle: { fontFamily: typography.heading, color: colors.ink, fontSize: 28 },
  chapters: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.surface },
  chapter: { flexDirection: 'row', alignItems: 'center', padding: 24, gap: 18, borderBottomWidth: 1, borderBottomColor: colors.border, minHeight: 100 },
  chapterNumber: { fontFamily: typography.heading, fontSize: 25, color: '#85947F' },
  chapterText: { flex: 1, gap: 10 },
  chapterTitle: { fontSize: 16, lineHeight: 24, fontWeight: '600', color: colors.ink },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, lineHeight: 18, color: colors.muted, flexShrink: 1 },
  note: { fontSize: 12, lineHeight: 20, color: colors.muted, maxWidth: 720 },
});
