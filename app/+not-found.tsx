import { Screen } from '@/components/screen';
import { MissingContent } from '@/components/ui';

export default function NotFoundScreen() {
  return (
    <Screen>
      <MissingContent title="A little off the path." href="/" label="Back to your tours" />
    </Screen>
  );
}
