import type { Locale } from './index';
import type fa from '../messages/fa.json';

export type Messages = typeof fa;

/** Loads the message catalogue for a locale (each locale is its own chunk). */
export async function loadMessages(locale: Locale): Promise<Messages> {
  switch (locale) {
    case 'en':
      return (await import('../messages/en.json')).default as Messages;
    case 'zh':
      return (await import('../messages/zh.json')).default as Messages;
    case 'ru':
      return (await import('../messages/ru.json')).default as Messages;
    case 'es':
      return (await import('../messages/es.json')).default as Messages;
    default:
      return (await import('../messages/fa.json')).default as Messages;
  }
}
