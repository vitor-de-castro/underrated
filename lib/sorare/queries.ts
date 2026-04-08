export const GET_PLAYERS = `
  query GetPlayers($first: Int!) {
    football {
      players(first: $first) {
        nodes {
          slug
          displayName
          position
          age
          avatarUrl
          club {
            name
            pictureUrl
            domesticLeague {
              slug
              displayName
            }
          }
          cards(first: 1, rarities: [limited, rare, super_rare, unique]) {
            nodes {
              slug
              rarity
              serialNumber
              latestEnglishAuction {
                currentPrice
                open
              }
            }
          }
        }
      }
    }
  }
`;
