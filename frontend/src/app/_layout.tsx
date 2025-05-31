import { ApolloProvider } from "@apollo/client";
import { Stack } from "expo-router";
import client from "@/api/client";
import { FilterProvider } from "./contexts/FilterContext";

export default function RootLayout() {
  return (
    <ApolloProvider client={client}>
      <FilterProvider>
        <Stack />
      </FilterProvider>
    </ApolloProvider>
  );
}
