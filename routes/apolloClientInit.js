import { ApolloClient, InMemoryCache, gql }
    from "@apollo/client/core/core.cjs";

const baseServerURL = "http://localhost:4000";

const apolloClient = new ApolloClient({
    uri: `${baseServerURL}`,
    cache: new InMemoryCache(),
    defaultOptions: {
        query: {
            fetchPolicy: 'network-only',
        }
    }
});

export {apolloClient, gql}