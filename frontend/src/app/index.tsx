import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useQuery } from "@apollo/client";
import { GET_NOODLES } from "./queries";
import { NoodleItem } from "./components/NoodleItem";
import { FilterControls } from "./components/FilterControls";
import { Stack, useRouter } from "expo-router";
import { Filters } from "./types";
import { useFilters } from "./contexts/FilterContext";

export default function NoodleListScreen() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();

  // Build GraphQL where clause from filters
  const buildWhereClause = (filters: Filters) => {
    const where: any = {};
    
    if (filters.spicinessLevel !== undefined) {
      where.spicinessLevel = { equals: filters.spicinessLevel };
    }
    
    if (filters.originCountry) {
      where.originCountry = { equals: filters.originCountry };
    }
    
    return Object.keys(where).length > 0 ? where : undefined;
  };

  const { loading, error, data } = useQuery<{
    instantNoodles: { id: string; name: string; spicinessLevel: number; originCountry: string; reviewsCount: number; imageURL: string }[];
  }>(GET_NOODLES, {
    variables: { where: buildWhereClause(filters) },
  });
  if (loading) return <ActivityIndicator style={styles.loader} size="large" />;
  if (error) return <Text style={styles.error}>Error: {error.message}</Text>;

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: "Instant Noodles",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/favourites')}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>♥ Favourites</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <FilterControls filters={filters} onFiltersChange={setFilters} />
        <FlatList
          data={data?.instantNoodles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NoodleItem {...item} />}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          directionalLockEnabled
          contentContainerStyle={styles.listContent}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "red", padding: 16 },
  listContent: { padding: 16 },
  headerButton: {
    marginRight: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
