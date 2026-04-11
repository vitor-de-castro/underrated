// GraphQL Response Structure
export interface SorareResponse {
  football: {
    players: {
      edges: Array<{
        node: SorarePlayer;
      }>;
    };
  };
}

export interface SorarePlayer {
  slug: string;
  displayName: string;
  position: string;
  age: number;
  avatarUrl?: string;
  club: {
    name: string;
    pictureUrl?: string;
    domesticLeague?: {
      slug: string;
      displayName: string;
    };
  };
  cards: {
    nodes: SorareCard[];
  };
}

// Rest of your existing interfaces...

export interface SorareCard {
  slug: string;
  rarity: 'limited' | 'rare' | 'super_rare' | 'unique';
  serialNumber: number;
  season: string;
  latestEnglishAuction?: {
    currentPrice: string;
    open: boolean;
  };
}

export interface PlayerWithStats extends SorarePlayer {
  stats?: {
    goals: number;
    assists: number;
    minutesPlayed: number;
    gamesPlayed: number;
  };
  valueScore: number;
}
