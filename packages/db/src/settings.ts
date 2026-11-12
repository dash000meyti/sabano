import type { Locale } from '@sabano/i18n';

export type Localized = Partial<Record<Locale, string>>;

export type ContactSettings = {
  email: string;
  phones: string[];
  postalCode: string;
  address: Localized;
  hours: Localized;
  /** WGS84 coordinates of the office (optional; enables the map pin) */
  lat?: number;
  lng?: number;
};

export type SocialSettings = {
  linkedin?: string;
  telegram?: string;
  bale?: string;
  aparat?: string;
  whatsapp?: string;
  instagram?: string;
  x?: string;
};

export type OrgSettings = {
  legalName: Localized;
  foundingYear?: string;
  registrationNumber?: string;
  nationalId?: string;
};

export type StatItem = { value: string; label: Localized };

export type SettingsMap = {
  contact: ContactSettings;
  social: SocialSettings;
  org: OrgSettings;
  stats: StatItem[];
};

export type SettingsKey = keyof SettingsMap;

export const defaultSettings: SettingsMap = {
  contact: {
    email: 'info@sabano.ir',
    phones: ['021-88517259', '021-88517403', '021-88755672', '021-88517315'],
    postalCode: '1586868113',
    address: {
      fa: 'تهران، عباس‌آباد–اندیشه، خیابان شهید جواد افراز، خیابان هشتم، پلاک ۹، طبقه ۱، واحد A',
      en: 'Unit A, Floor 1, No. 9, 8th St., Shahid Javad Afraz St., Andisheh, Abbasabad, Tehran, Iran',
      zh: '伊朗德黑兰阿巴斯阿巴德、安迪舍，沙希德·贾瓦德·阿夫拉兹街第8街9号1层A单元',
      ru: 'Иран, Тегеран, Аббасабад, Андеше, улица Шахида Джавада Афраза, 8-я улица, дом 9, 1-й этаж, офис A',
      es: 'Unidad A, planta 1, n.º 9, calle 8, calle Shahid Javad Afraz, Andisheh, Abbasabad, Teherán, Irán',
    },
    // Working hours and map coordinates are left empty until the fund confirms them.
    hours: {},
  },
  social: {
    linkedin: 'https://www.linkedin.com/company/sabano-fund/',
  },
  org: {
    legalName: {
      fa: 'صندوق پژوهش و فناوری غیردولتی صبانو',
      en: 'Sabano Non-Governmental Research and Technology Fund',
      zh: 'Sabano 非政府研究与技术基金',
      ru: 'Негосударственный фонд исследований и технологий Sabano',
      es: 'Fondo no gubernamental de investigación y tecnología Sabano',
    },
  },
  stats: [],
};
