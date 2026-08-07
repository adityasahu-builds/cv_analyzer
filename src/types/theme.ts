export type ThemeMode = 'dark' | 'light' | 'system';

export interface ThemeConfig {
  defaultTheme: ThemeMode;
  attribute: string;
  enableSystem: boolean;
}
