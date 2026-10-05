import { Linking } from 'react-native';

export const BRAND_EMAIL = 'royalcareuae@hotmail.com';

/** Opens the device's mail app pre-filled (same `mailto:` approach as the web forms). Resolves false if no mail app exists. */
export async function sendToEmail({ subject, fields }: { subject: string; fields: Record<string, string> }): Promise<boolean> {
  const body = Object.entries(fields)
    .filter(([, v]) => v.trim() !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  try {
    await Linking.openURL(`mailto:${BRAND_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    return true;
  } catch {
    return false;
  }
}
