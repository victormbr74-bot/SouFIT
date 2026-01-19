export type ThemeKey = 'blue' | 'purple' | 'red' | 'green';

export interface ThemeTokens {
  primary: string;
  accent: string;
  background: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  glow: string;
  success: string;
  warning: string;
  danger: string;
}

export interface ThemeDefinition {
  key: ThemeKey;
  label: string;
  skin: string;
  tokens: ThemeTokens;
}

const themeDefinitions: Record<ThemeKey, ThemeDefinition> = {
  blue: {
    key: 'blue',
    label: 'Azul', // Representa o tema padrão Solo Leveling
    skin: 'Fogo Azul',
    tokens: {
      primary: '#5EB1FF',
      accent: '#8CD5FF',
      background: '#030712',
      card: '#0D1423',
      border: '#192146',
      textPrimary: '#F7FAFF',
      textSecondary: '#9BB0DD',
      glow: '#65E5FF',
      success: '#3DD598',
      warning: '#F8C66B',
      danger: '#FF6B7C'
    }
  },
  purple: {
    key: 'purple',
    label: 'Roxo',
    skin: 'Chama Abissal',
    tokens: {
      primary: '#9E5CFF',
      accent: '#D194FF',
      background: '#0F041A',
      card: '#190A2B',
      border: '#2C1B3D',
      textPrimary: '#FFF5FF',
      textSecondary: '#B9A0CF',
      glow: '#F5B6FF',
      success: '#4ADE80',
      warning: '#FBBF24',
      danger: '#F87171'
    }
  },
  red: {
    key: 'red',
    label: 'Vermelho',
    skin: 'Fúria Carmesim',
    tokens: {
      primary: '#FF4E6D',
      accent: '#FF8AA1',
      background: '#1A0411',
      card: '#260818',
      border: '#3D0F1F',
      textPrimary: '#FFF5F5',
      textSecondary: '#F4BAC1',
      glow: '#FF9EAD',
      success: '#34D399',
      warning: '#FCD34D',
      danger: '#FB7185'
    }
  },
  green: {
    key: 'green',
    label: 'Verde',
    skin: 'Veneno Esmeralda',
    tokens: {
      primary: '#2BD98A',
      accent: '#6EF2B1',
      background: '#04190E',
      card: '#0A2416',
      border: '#1A3928',
      textPrimary: '#EBFFF7',
      textSecondary: '#9CDCC6',
      glow: '#4AF0BE',
      success: '#4ADE80',
      warning: '#FCD34D',
      danger: '#FB7185'
    }
  }
};

export const themeList = Object.values(themeDefinitions);
export default themeDefinitions;
