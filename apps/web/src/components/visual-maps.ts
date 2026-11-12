import type { AreaKey, ServiceSlug } from '@/lib/site';
import {
  BrainIcon,
  ChartLineUpIcon,
  ChatsCircleIcon,
  CloudArrowUpIcon,
  CoinsIcon,
  CreditCardIcon,
  GlobeHemisphereEastIcon,
  HandCoinsIcon,
  InfinityIcon,
  PlantIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  TargetIcon,
  UsersThreeIcon,
  VaultIcon,
} from './icons';

export const serviceIcons: Record<ServiceSlug, typeof ShieldCheckIcon> = {
  guarantee: ShieldCheckIcon,
  credit: CreditCardIcon,
  investment: ChartLineUpIcon,
  'fund-agency': VaultIcon,
  consulting: ChatsCircleIcon,
};

export const areaIcons: Record<AreaKey, typeof BrainIcon> = {
  ai: BrainIcon,
  fintech: CoinsIcon,
  digital: CloudArrowUpIcon,
  future: RocketLaunchIcon,
};

export const pillarIcons = [RocketLaunchIcon, HandCoinsIcon, GlobeHemisphereEastIcon, PlantIcon];
export const valueIcons = [TargetIcon, UsersThreeIcon, InfinityIcon];
