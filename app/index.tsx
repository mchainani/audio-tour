import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Badge, Eyebrow } from '@/components/ui';
import { tours } from '@/features/tours/catalog';
import { colors, typography } from '@/theme';

export default function LibraryScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 760;

  return (
    <Screen>
      <View style={[styles.hero, wide && styles.heroWide]}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>LOOK AROUND. LISTEN CLOSER.</Text>
          <Text role="heading" aria-level={1} style={[styles.heroTitle, wide && styles.heroTitleWide]}>
            Good stories.{ '\n' }Great walks.
          </Text>
          <Text style={styles.heroDescription}>
            A personal library of places and the stories behind them. Choose a tour and take it one chapter at a time.
          </Text>
          <View style={styles.heroCaption}>
            <Ionicons name="headset-outline" size={16} color={colors.mint} />
            <Text style={styles.heroCaptionText}>A little more to every place.</Text>
          </View>
        </View>
        {wide && (
          <View style={styles.heroArt} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={styles.outerRing} />
            <View style={styles.innerRing} />
            <View style={styles.headphoneDisc}>
              <Ionicons name="headset-outline" size={76} color={colors.cream} />
            </View>
            <View style={styles.locationTag}>
              <Ionicons name="location-outline" size={14} color={colors.green} />
              <Text style={styles.locationTagText}>Let curiosity lead.</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.sectionHeading}>
        <View style={styles.sectionCopy}>
          <Text role="heading" aria-level={2} style={styles.sectionTitle}>Your tours</Text>
          <Text style={styles.sectionDescription}>Start with a little inspiration.</Text>
        </View>
        <Badge>{tours.length} {tours.length === 1 ? 'tour' : 'tours'}</Badge>
      </View>

      <View style={[styles.libraryGrid, wide && styles.libraryGridWide]}>
        <View style={styles.tourColumn}>
          {tours.length === 0 && <Text style={styles.nextDescription}>Your library is ready for its first tour.</Text>}
          {tours.map((tour) => (
            <Link key={tour.id} href={{ pathname: '/tours/[tourId]', params: { tourId: tour.id } }} asChild>
              <Pressable accessibilityLabel={`Explore ${tour.title}`} style={styles.tourCard}>
                <View style={styles.cardTop}>
                  <View style={styles.tourIcon}>
                    <Ionicons name="headset-outline" size={30} color={colors.green} />
                  </View>
                  <Badge>WITH AUDIO</Badge>
                </View>
                <Eyebrow>{tour.chapters[0].location.name}</Eyebrow>
                <Text role="heading" aria-level={3} style={styles.tourTitle}>{tour.title}</Text>
                <Text style={styles.tourDescription}>{tour.intro}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.chapterCount}>{tour.chapters.length} {tour.chapters.length === 1 ? 'chapter' : 'chapters'} · {tour.language}</Text>
                  <View style={styles.exploreLink}>
                    <Text style={styles.exploreText}>Explore tour</Text>
                    <Ionicons name="arrow-forward" size={17} color={colors.green} />
                  </View>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
        <View style={[styles.nextCard, wide && styles.nextCardWide]}>
          <View style={styles.nextIcon}>
            <Ionicons name="folder-open-outline" size={24} color={colors.green} />
          </View>
          <Text style={styles.nextTitle}>Make room for more.</Text>
          <Text style={styles.nextDescription}>
            Soon, bring your own tours in a ZIP file with chapters, transcripts, and audio.
          </Text>
          <View style={styles.nextFooter}>
            <Ionicons name="time-outline" size={14} color={colors.muted} />
            <Text style={styles.nextFooterText}>Tour import comes next</Text>
          </View>
        </View>
      </View>

      <View style={styles.previewNote}>
        <Ionicons name="information-circle-outline" size={18} color={colors.muted} />
        <Text style={styles.previewNoteText}>
          Explore the tours with synthesized demo narration and full transcripts. Live maps and tour imports come next.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.green, borderRadius: 22, padding: 28, overflow: 'hidden' },
  heroWide: { flexDirection: 'row', padding: 42, minHeight: 320 },
  heroCopy: { flex: 1, gap: 20 },
  heroEyebrow: { color: colors.mint, fontSize: 10, fontWeight: '600', letterSpacing: 2 },
  heroTitle: { color: colors.cream, fontFamily: typography.heading, fontSize: 43, lineHeight: 49, letterSpacing: -1.6 },
  heroTitleWide: { fontSize: 55, lineHeight: 59 },
  heroDescription: { color: '#D9E3D7', fontSize: 14, lineHeight: 23, maxWidth: 420 },
  heroCaption: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroCaptionText: { color: colors.mint, fontSize: 11 },
  heroArt: { width: 290, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  outerRing: { position: 'absolute', width: 290, height: 290, borderRadius: 145, borderWidth: 1, borderColor: '#52715B' },
  innerRing: { position: 'absolute', width: 222, height: 222, borderRadius: 111, borderWidth: 1, borderColor: '#52715B' },
  headphoneDisc: { width: 154, height: 154, borderRadius: 77, backgroundColor: '#3B624B', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '-12deg' }] },
  locationTag: { position: 'absolute', bottom: 12, right: -5, backgroundColor: colors.cream, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6, transform: [{ rotate: '-5deg' }] },
  locationTagText: { color: colors.green, fontSize: 11, fontWeight: '500' },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14 },
  sectionCopy: { flex: 1, gap: 7 },
  sectionTitle: { fontFamily: typography.heading, fontSize: 28, color: colors.ink, letterSpacing: -0.5 },
  sectionDescription: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  libraryGrid: { gap: 20 },
  libraryGridWide: { flexDirection: 'row', alignItems: 'stretch' },
  tourColumn: { flex: 1, gap: 20 },
  tourCard: { backgroundColor: colors.surface, padding: 26, borderRadius: 18, borderWidth: 1, borderColor: colors.border, gap: 15, flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
  tourIcon: { width: 64, height: 64, borderRadius: 19, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  tourTitle: { fontFamily: typography.heading, fontSize: 29, lineHeight: 36, letterSpacing: -0.6, color: colors.ink },
  tourDescription: { fontSize: 14, lineHeight: 23, color: colors.muted, maxWidth: 550 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 20, marginTop: 8 },
  chapterCount: { fontSize: 12, color: colors.muted },
  exploreLink: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  exploreText: { color: colors.green, fontWeight: '600', fontSize: 13 },
  nextCard: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#C9D3C3', padding: 26, borderRadius: 18, gap: 17, justifyContent: 'center' },
  nextCardWide: { width: 300 },
  nextIcon: { width: 48, height: 48, backgroundColor: colors.sage, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  nextTitle: { color: colors.ink, fontFamily: typography.heading, fontSize: 24, lineHeight: 30 },
  nextDescription: { fontSize: 13, color: colors.muted, lineHeight: 22 },
  nextFooter: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8 },
  nextFooterText: { fontSize: 11, color: colors.muted },
  previewNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  previewNoteText: { flex: 1, fontSize: 12, lineHeight: 19, color: colors.muted },
});
