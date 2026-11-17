export type NavIconName =
  | 'shield'
  | 'credit'
  | 'chart'
  | 'vault'
  | 'chats'
  | 'brain'
  | 'coins'
  | 'cloud'
  | 'rocket'
  | 'compass'
  | 'briefcase'
  | 'buildings'
  | 'users'
  | 'news'
  | 'question'
  | 'handshake'
  | 'phone';

export type NavLink = {
  href: string;
  label: string;
  desc?: string;
  icon?: NavIconName;
};

export type NavGroup = {
  key: string;
  label: string;
  href?: string;
  items?: NavLink[];
  /** Wide mega-menu layout with a featured card */
  mega?: boolean;
  featured?: { title: string; text: string; href: string; cta: string };
};

export type HeaderLabels = {
  openMenu: string;
  closeMenu: string;
  menu: string;
  search: string;
  language: string;
  cta: string;
  home: string;
  brandName: string;
  brandSub: string;
  skip: string;
  theme: string;
};
