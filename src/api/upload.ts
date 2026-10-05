/** A local file picked on the device (expo-image-picker asset). */
export interface LocalFile {
  uri: string;
  name: string;
  type: string;
}

/** An image field value: an already uploaded URL, or a newly picked local file. */
export interface PickedImage {
  url?: string;
  file?: LocalFile;
}

export const pickedFromUrl = (url: string): PickedImage => ({ url });

type FieldValue = string | number | boolean | LocalFile | null | undefined;

const isLocalFile = (v: unknown): v is LocalFile => !!v && typeof v === 'object' && 'uri' in v;

/** React Native's FormData accepts `{ uri, name, type }` objects for file parts. */
export function appendFile(fd: FormData, field: string, file: LocalFile) {
  fd.append(field, file as unknown as Blob);
}

/**
 * Builds multipart/form-data the way the backend's multer + validators expect:
 * empty values are skipped, files are sent as file parts.
 */
export function toFormData(fields: Record<string, FieldValue>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') continue;
    if (isLocalFile(value)) appendFile(fd, key, value);
    else fd.append(key, String(value));
  }
  return fd;
}
