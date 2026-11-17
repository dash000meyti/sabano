import type { AreaKey, ServiceSlug } from '@/lib/site';
import {
  ArticleIcon,
  BookOpenTextIcon,
  BrainIcon,
  BriefcaseIcon,
  ChartLineUpIcon,
  ChatsCircleIcon,
  ClipboardTextIcon,
  ClockIcon,
  CloudArrowUpIcon,
  CoinsIcon,
  CreditCardIcon,
  CrownIcon,
  EnvelopeSimpleIcon,
  FileMagnifyingGlassIcon,
  GlobeHemisphereEastIcon,
  HandCoinsIcon,
  HandshakeIcon,
  HeadsetIcon,
  IdentificationBadgeIcon,
  InfinityIcon,
  LightbulbIcon,
  ListChecksIcon,
  MapPinIcon,
  PaperPlaneTiltIcon,
  PlantIcon,
  QuestionIcon,
  RocketLaunchIcon,
  RssIcon,
  ScalesIcon,
  SealCheckIcon,
  ShieldCheckIcon,
  StrategyIcon,
  TargetIcon,
  UsersThreeIcon,
  VaultIcon,
} from './icons';
import type { AnimatedIconSpec, IconAnim } from './ui/AnimatedIcon';

export const serviceIcons: Record<ServiceSlug, typeof ShieldCheckIcon> = {
  guarantee: ShieldCheckIcon,
  credit: CreditCardIcon,
  investment: ChartLineUpIcon,
  'fund-agency': VaultIcon,
  consulting: ChatsCircleIcon,
};
/** Motion that matches each service icon */
export const serviceAnims: Record<ServiceSlug, IconAnim> = {
  guarantee: 'beat',
  credit: 'flip',
  investment: 'pop',
  'fund-agency': 'nod',
  consulting: 'tilt',
};

export const areaIcons: Record<AreaKey, typeof BrainIcon> = {
  ai: BrainIcon,
  fintech: CoinsIcon,
  digital: CloudArrowUpIcon,
  future: RocketLaunchIcon,
};
export const areaAnims: Record<AreaKey, IconAnim> = {
  ai: 'pop',
  fintech: 'flip',
  digital: 'float',
  future: 'rise',
};

export const pillarIcons = [RocketLaunchIcon, HandCoinsIcon, GlobeHemisphereEastIcon, PlantIcon];
export const pillarAnims: IconAnim[] = ['rise', 'float', 'spin', 'grow'];

export const valueIcons = [TargetIcon, UsersThreeIcon, InfinityIcon];
export const valueAnims: IconAnim[] = ['pop', 'nod', 'flip'];

/** Investment criteria: real problem, clear model, strong team, growth capacity, digital-economy fit */
export const criteriaIcons: AnimatedIconSpec[] = [
  { icon: TargetIcon, anim: 'pop' },
  { icon: StrategyIcon, anim: 'tilt' },
  { icon: UsersThreeIcon, anim: 'nod' },
  { icon: ChartLineUpIcon, anim: 'grow' },
  { icon: GlobeHemisphereEastIcon, anim: 'spin' },
];

/** Funding process: prepare → submit → initial review → expert evaluation → result */
export const processStepIcons: AnimatedIconSpec[] = [
  { icon: ClipboardTextIcon, anim: 'nod' },
  { icon: PaperPlaneTiltIcon, anim: 'glide' },
  { icon: FileMagnifyingGlassIcon, anim: 'seek' },
  { icon: ScalesIcon, anim: 'swing' },
  { icon: SealCheckIcon, anim: 'beat' },
];
/** Icons for a step list: the 4-step service path starts at "submit". */
export const stepIconsFor = (count: number) => processStepIcons.slice(Math.max(0, processStepIcons.length - count));

/** News categories */
export const categoryVisuals: Record<'news' | 'insight' | 'guide', AnimatedIconSpec> = {
  news: { icon: ArticleIcon, anim: 'tilt' },
  insight: { icon: LightbulbIcon, anim: 'swing' },
  guide: { icon: BookOpenTextIcon, anim: 'flip' },
};

/** Page-hero icon constellations */
export const heroVisuals = {
  services: {
    center: { icon: HandCoinsIcon, anim: 'float' },
    items: (Object.keys(serviceIcons) as ServiceSlug[]).map((s) => ({ icon: serviceIcons[s], anim: serviceAnims[s] })),
  },
  process: { center: { icon: RocketLaunchIcon, anim: 'rise' }, items: processStepIcons },
  portfolio: {
    center: { icon: BriefcaseIcon, anim: 'drop' },
    items: [
      { icon: BrainIcon, anim: 'pop' },
      { icon: ChartLineUpIcon, anim: 'pop' },
      { icon: CoinsIcon, anim: 'flip' },
      { icon: HandshakeIcon, anim: 'nod' },
      { icon: CloudArrowUpIcon, anim: 'float' },
      { icon: TargetIcon, anim: 'pop' },
    ],
  },
  leadership: {
    center: { icon: CrownIcon, anim: 'float' },
    items: [
      { icon: StrategyIcon, anim: 'tilt' },
      { icon: IdentificationBadgeIcon, anim: 'swing' },
      { icon: TargetIcon, anim: 'pop' },
      { icon: UsersThreeIcon, anim: 'nod' },
      { icon: SealCheckIcon, anim: 'beat' },
    ],
  },
  news: {
    center: { icon: ArticleIcon, anim: 'tilt' },
    items: [
      { icon: LightbulbIcon, anim: 'swing' },
      { icon: ChartLineUpIcon, anim: 'pop' },
      { icon: BookOpenTextIcon, anim: 'flip' },
      { icon: RssIcon, anim: 'beat' },
      { icon: BrainIcon, anim: 'pop' },
    ],
  },
  faq: {
    center: { icon: QuestionIcon, anim: 'swing' },
    items: [
      { icon: ChatsCircleIcon, anim: 'tilt' },
      { icon: LightbulbIcon, anim: 'swing' },
      { icon: BookOpenTextIcon, anim: 'flip' },
      { icon: ShieldCheckIcon, anim: 'beat' },
      { icon: ListChecksIcon, anim: 'nod' },
    ],
  },
  contact: {
    center: { icon: HeadsetIcon, anim: 'tilt' },
    items: [
      { icon: EnvelopeSimpleIcon, anim: 'float' },
      { icon: MapPinIcon, anim: 'drop' },
      { icon: ClockIcon, anim: 'spin' },
      { icon: PaperPlaneTiltIcon, anim: 'glide' },
      { icon: ChatsCircleIcon, anim: 'tilt' },
    ],
  },
} satisfies Record<string, { center: AnimatedIconSpec; items: AnimatedIconSpec[] }>;
