import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_SORARE_API || 'https://api.sorare.com/graphql/players';

export const sorareClient = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
});
