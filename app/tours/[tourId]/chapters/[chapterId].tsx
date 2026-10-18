import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Screen } from '@/components/screen';
import { BackLink, Eyebrow, MissingContent } from '@/components/ui';
import { ChapterPlayer } from '@/features/audio/chapter-player';
import { loadTourAudio, tours } from '@/features/tours/catalog';
import { colors, typography } from '@/theme';

export default function ChapterScreen() {
  const { tourId, chapterId } = useLocalSearchParams<{ tourId: string; chapterId: string }>();
  const { width } = useWindowDimensions();
  const tour = tours.find((entry) => entry.id === tourId);
  const chapterIndex = tour?.chapters.findIndex((entry) => entry.id === chapterId) ?? -1;
  const chapter = tour?.chapters[chapterIndex];

  if (!tour || !chapter) {
    return <Screen><MissingContent title="Chapter not found" href="/" label="Back to your tours" /></Screen>;
  }

  const previous = tour.chapters[chapterIndex - 1];
  const next = tour.chapters[chapterIndex + 1];

  return (
    <Screen>
      <BackLink href={{ pathname: '/tours/[tourId]', params: { tourId: tour.id } }}>Tour overview</BackLink>
      <View style={styles.introduction}>
        <Eyebrow>CHAPTER {String(chapterIndex + 1).padStart(2, '0')} OF {String(tour.chapters.length).padStart(2, '0')}</Eyebrow>
        <Text role="heading" aria-level={1} style={styles.title}>{chapter.title}</Text>
        <View style={styles.locationLine}>
          <Ionicons name="location-outline" size={16} color={colors.muted} />
          <Text style={styles.locationText}>{chapter.location.name}</Text>
        </View>
      </View>

      <ChapterPlayer
        key={`${tour.id}/${chapter.id}`}
        loadSource={() => loadTourAudio(tour.id, chapter.audio)}
        title={chapter.title}
        tourTitle={tour.title}
      />

      <View style={[styles.columns, width >= 800 && styles.columnsWide]}>
        <View style={styles.transcript}>
          <Text role="heading" aria-level={2} style={styles.sectionTitle}>The transcript</Text>
          {chapter.transcript.split('\n\n').map((paragraph, index) => (
            <Text key={index} selectable style={styles.paragraph}>{paragraph}</Text>
          ))}
        </View>
        <View style={[styles.locationPanel, width >= 800 && styles.locationPanelWide]}>
          <Eyebrow>THIS STOP</Eyebrow>
          <View style={styles.mapPlaceholder}>
            <View style={styles.mapPin}>
              <Ionicons name="location-outline" size={34} color={colors.green} />
            </View>
            <Text style={styles.mapLabel}>A place for the map.</Text>
            <Text style={styles.mapDescription}>Live maps are coming next.</Text>
          </View>
          <Text style={styles.stopName}>{chapter.location.name}</Text>
          <Text selectable style={styles.coordinates}>{chapter.location.latitude.toFixed(4)}, {chapter.location.longitude.toFixed(4)}</Text>
        </View>
      </View>

      <View style={styles.chapterNavigation}>
        {previous ? (
          <Link href={{ pathname: '/tours/[tourId]/chapters/[chapterId]', params: { tourId: tour.id, chapterId: previous.id } }} replace asChild>
            <Pressable style={styles.navButton}>
              <Ionicons name="arrow-back" size={17} color={colors.green} />
              <Text style={styles.navText}>Previous chapter</Text>
            </Pressable>
          </Link>
        ) : <View />}
        {next ? (
          <Link href={{ pathname: '/tours/[tourId]/chapters/[chapterId]', params: { tourId: tour.id, chapterId: next.id } }} replace asChild>
            <Pressable style={StyleSheet.flatten([styles.navButton, styles.navButtonPrimary])}>
              <Text style={styles.navTextPrimary}>Next chapter</Text>
              <Ionicons name="arrow-forward" size={17} color={colors.surface} />
            </Pressable>
          </Link>
        ) : (
          <Link href={{ pathname: '/tours/[tourId]', params: { tourId: tour.id } }} style={styles.finishLink}>Back to tour overview →</Link>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  introduction: { gap: 17, maxWidth: 850 },
  title: { fontFamily: typography.heading, fontSize: 41, lineHeight: 48, letterSpacing: -1.2, color: colors.ink },
  locationLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { color: colors.muted, fontSize: 13, lineHeight: 20, flexShrink: 1 },
  columns: { gap: 30, marginTop: 8 },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start', gap: 48 },
  transcript: { flex: 1, gap: 22 },
  sectionTitle: { fontFamily: typography.heading, color: colors.ink, fontSize: 27 },
  paragraph: { fontSize: 16, lineHeight: 29, color: '#465A4C' },
  locationPanel: { backgroundColor: '#EFF1E9', borderRadius: 17, padding: 24, gap: 13 },
  locationPanelWide: { width: 290 },
  mapPlaceholder: { alignItems: 'center', paddingVertical: 28, gap: 12 },
  mapPin: { width: 74, height: 74, backgroundColor: '#E0E6D6', borderRadius: 37, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  mapLabel: { fontFamily: typography.heading, fontSize: 22, color: colors.ink },
  mapDescription: { fontSize: 12, color: colors.muted },
  stopName: { fontWeight: '600', fontSize: 13, color: colors.ink },
  coordinates: { fontSize: 12, color: colors.muted, letterSpacing: 0.2 },
  chapterNavigation: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', gap: 14, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 24 },
  navButton: { flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingVertical: 14, paddingHorizontal: 17, minHeight: 48 },
  navButtonPrimary: { backgroundColor: colors.green, borderColor: colors.green },
  navText: { color: colors.green, fontSize: 12, fontWeight: '600' },
  navTextPrimary: { color: colors.surface, fontSize: 12, fontWeight: '600' },
  finishLink: { fontSize: 13, color: colors.green, paddingVertical: 14 },
});
