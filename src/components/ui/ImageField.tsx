import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, X } from 'lucide-react-native';
import type { LocalFile, PickedImage } from '../../api/upload';
import { t, useT } from '../../i18n';
import { toast } from '../../store/toast';
import { colors, radius, spacing } from '../../theme';
import { AppText } from './AppText';

const MAX_BYTES = 5 * 1024 * 1024;

function toLocalFile(asset: ImagePicker.ImagePickerAsset, index: number): LocalFile {
  const type = asset.mimeType ?? 'image/jpeg';
  const ext = type.split('/')[1] ?? 'jpg';
  return { uri: asset.uri, type, name: asset.fileName ?? `image-${Date.now()}-${index}.${ext}` };
}

/** Opens the photo library. Only images (backend multer rejects anything else), ≤ 5 MB like the web app. */
async function pickImages(limit: number, crop: boolean): Promise<LocalFile[]> {
  // The system photo picker needs no library permission; only a hard denial blocks it.
  const perm = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (perm.status === 'denied' && !perm.canAskAgain) {
    toast.error(t('Mobile.photoPermission'));
    return [];
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: crop && limit === 1,
    aspect: crop ? [1, 1] : undefined,
    quality: 0.85,
    allowsMultipleSelection: limit > 1,
    selectionLimit: limit
  });
  if (result.canceled || !result.assets) return [];
  const accepted = result.assets.filter((a) => !a.fileSize || a.fileSize <= MAX_BYTES);
  if (accepted.length < result.assets.length) toast.error(t('Ui.imagesOnly', { n: 5 }));
  return accepted.map(toLocalFile);
}

const preview = (img: PickedImage) => img.file?.uri ?? img.url ?? '';

interface BaseProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export function SingleImageField({ label, required, error, hint, value, onChange, square = true }: BaseProps & { value: PickedImage | null; onChange: (v: PickedImage | null) => void; square?: boolean }) {
  const t = useT('Ui');
  const choose = async () => {
    const [file] = await pickImages(1, square);
    if (file) onChange({ file });
  };
  return (
    <View style={styles.wrapper}>
      <FieldLabel label={label} required={required} />
      {value ? (
        <View style={styles.tile}>
          <Image source={{ uri: preview(value) }} style={styles.image} contentFit="cover" />
          <Pressable onPress={choose} style={styles.changeBtn} accessibilityRole="button" accessibilityLabel={t('changeImage')}>
            <AppText variant="caption" color={colors.white}>
              {t('changeImage')}
            </AppText>
          </Pressable>
          {!required && <RemoveBadge onPress={() => onChange(null)} label={t('remove')} />}
        </View>
      ) : (
        <AddTile label={t('uploadImage')} onPress={choose} />
      )}
      <FieldMessage error={error} hint={hint} />
    </View>
  );
}

export function MultiImageField({ label, error, hint, value, onChange, max = 5 }: BaseProps & { value: PickedImage[]; onChange: (v: PickedImage[]) => void; max?: number }) {
  const t = useT('Ui');
  const add = async () => {
    const files = await pickImages(max - value.length, false);
    if (files.length) onChange([...value, ...files.map((file) => ({ file }))].slice(0, max));
  };
  return (
    <View style={styles.wrapper}>
      <FieldLabel label={`${label} (${value.length}/${max})`} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {value.map((img, i) => (
          <View key={`${preview(img)}-${i}`} style={styles.tile}>
            <Image source={{ uri: preview(img) }} style={styles.image} contentFit="cover" />
            <RemoveBadge onPress={() => onChange(value.filter((_, j) => j !== i))} label={t('imageN', { n: i + 1 })} />
          </View>
        ))}
        {value.length < max && <AddTile label={t('addImage')} onPress={add} />}
      </ScrollView>
      <FieldMessage error={error} hint={hint} />
    </View>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <AppText variant="label">
      {label}
      {required && <AppText color={colors.danger}> *</AppText>}
    </AppText>
  );
}

function FieldMessage({ error, hint }: { error?: string; hint?: string }) {
  if (error)
    return (
      <AppText variant="caption" color={colors.danger}>
        {error}
      </AppText>
    );
  return hint ? <AppText variant="caption">{hint}</AppText> : null;
}

function AddTile({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.tile, styles.addTile, pressed && { opacity: 0.7 }]}>
      <ImagePlus size={26} color={colors.primary} />
      <AppText variant="caption" color={colors.primary}>
        {label}
      </AppText>
    </Pressable>
  );
}

function RemoveBadge({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel={label} style={styles.remove}>
      <X size={14} color={colors.white} />
    </Pressable>
  );
}

const SIZE = 104;
const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  row: { gap: spacing.sm },
  tile: { width: SIZE, height: SIZE, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.cream },
  image: { width: '100%', height: '100%' },
  addTile: { alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.pinkDark },
  changeBtn: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingVertical: 4, alignItems: 'center', backgroundColor: 'rgba(10,46,82,0.6)' },
  remove: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(10,46,82,0.75)', alignItems: 'center', justifyContent: 'center' }
});
