export interface EarthlinkField<T = string | null> {
  editable: boolean;
  visible: boolean;
  tags?: string;
  displayName?: string;
  filedType?: string;
  value: T;
}

export interface EarthlinkRawResponse {
  accountImagePath?: EarthlinkField<string>;
  serviceStatusColor?: EarthlinkField<string>;
  accountPrice?: EarthlinkField<string>;
  accountStatus?: EarthlinkField<string>;
  accountName?: EarthlinkField<string>;
  fullName?: EarthlinkField<string>;
  userID?: EarthlinkField<string>;
  agentName?: EarthlinkField<string>;
  accountExpirationDate?: EarthlinkField<string>;
  activeDaysLeft?: EarthlinkField<string>;
  userIP?: EarthlinkField<string>;
  mobileNumber?: EarthlinkField<string>;
  address?: EarthlinkField<string | null>;
  email?: EarthlinkField<string | null>;
  city?: EarthlinkField<string | null>;
  _source?: string;
}

export interface SubscriberData {
  fullName: string;
  userID: string;
  accountName: string;
  accountPrice: string;
  accountStatus: string;
  activeDaysLeft: number;
  accountExpirationDate: string;
  agentName: string;
  userIP: string;
  mobileNumber: string;
  city: string;
  address: string;
  email: string;
  accountImagePath: string;
  serviceStatusColor: string;
  lastUpdated: string;
  isLiveConnection: boolean;
}

export type ThemeId =
  | 'theme-royal-purple'
  | 'theme-cyber-neon'
  | 'theme-obsidian-gold'
  | 'theme-emerald-cyber'
  | 'theme-sunset-amber'
  | 'theme-sapphire-indigo'
  | 'theme-ruby-crimson'
  | 'theme-pearl-light'
  | 'theme-miro-soft'
  | 'theme-clay-neon'
  | 'theme-glass-obsidian'
  | 'theme-neumorphic-luxury';

export interface ThemeConfig {
  id: ThemeId;
  nameAr: string;
  nameEn: string;
  previewGradient: string;
  accentColor: string;
  descriptionAr: string;
}

export type BackgroundPattern =
  | 'pattern-aurora'
  | 'pattern-nebula'
  | 'pattern-cyber-mesh'
  | 'pattern-obsidian-glow'
  | 'pattern-pure-glass'
  | 'pattern-clay-soft';

export interface AvatarOption {
  id: string;
  nameAr: string;
  url: string;
  type: 'image' | 'badge';
  badgeIcon?: string;
}

export interface FontOption {
  id: string;
  nameAr: string;
  fontFamily: string;
  sample: string;
}

export interface TypographySettings {
  clockFont: string;
  hintsFont: string;
  numbersFont: string;
  sectionTitlesFont: string;
  englishWordsFont: string;
}

export type AppTab = 'home' | 'data' | 'alerts' | 'ai' | 'settings' | 'contact';

export interface ManualAlertSchedule {
  isActive: boolean;
  dayOfMonth: number;
  monthName: string;
  hour: string;
  minute: string;
  period: 'AM' | 'PM';
  targetChannel: 'both' | 'discord' | 'telegram';
  formattedScheduleText: string;
  createdAt: string;
}
