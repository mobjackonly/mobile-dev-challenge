import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Pressable,
  ImageBackground,
} from "react-native";
import { useQuery } from "@apollo/client";
import { GET_NOODLES } from "../queries";
import { FilterControls } from "../components/FilterControls";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { Filters } from "../types";
import { useFilters } from "../contexts/FilterContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FavouritesScreen() {
  const { filters, setFilters } = useFilters();
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();  // Load favorites from AsyncStorage every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadFavourites = async () => {
        try {
          setLoading(true);
          const stored = await AsyncStorage.getItem('favourites');
          const favourites = stored ? JSON.parse(stored) : [];
          setFavouriteIds(favourites);
        } catch (error) {
          console.error("Error loading favourites:", error);
        } finally {
          setLoading(false);
        }
      };

      loadFavourites();
    }, [])
  );

  // Build GraphQL where clause that includes favorites filter AND user filters
  const buildWhereClause = (filters: Filters, favouriteIds: string[]) => {
    const where: any = {};
    
    // First filter by favorite IDs
    if (favouriteIds.length > 0) {
      where.id = { in: favouriteIds };
    } else {
      // If no favorites, return empty result
      where.id = { in: ["__NO_MATCHES__"] };
    }
    
    // Then apply user filters
    if (filters.spicinessLevel !== undefined) {
      where.spicinessLevel = { equals: filters.spicinessLevel };
    }
    
    if (filters.originCountry) {
      where.originCountry = { equals: filters.originCountry };
    }
    
    return where;
  };
  const { loading: queryLoading, error, data } = useQuery<{
    instantNoodles: { id: string; name: string; spicinessLevel: number; originCountry: string; reviewsCount: number; imageURL: string }[];
  }>(GET_NOODLES, {
    variables: { where: buildWhereClause(filters, favouriteIds) },
    skip: loading, // Skip until we've loaded favorites from storage
  });  // Function to remove from favorites
  const removeFromFavourites = async (noodleId: string) => {
    try {
      const updatedFavourites = favouriteIds.filter(id => id !== noodleId);
      await AsyncStorage.setItem('favourites', JSON.stringify(updatedFavourites));
      setFavouriteIds(updatedFavourites);
      Alert.alert("Removed from Favourites", "This noodle has been removed from your favourites!");
    } catch (error) {
      Alert.alert("Error", "Failed to remove from favourites. Please try again.");
      console.error("Remove favourite error:", error);
    }
  };  // Custom NoodleItem for favorites that includes remove button
  const FavouriteNoodleItem = ({ id, name, spicinessLevel, originCountry, reviewsCount, imageURL }: any) => (
    <View style={styles.favouriteItem}>
      <Pressable
        style={styles.noodleContent}
        onPress={() => router.push(`/noodle-details/${id}?name=${name}`)}
      >
        {imageURL && (
          <ImageBackground
            source={{ uri: imageURL }}
            style={styles.noodleImage}
            resizeMode="cover"
          >
            <View style={styles.imageOverlay}>
              <Text style={styles.spicinessText}>
                {"🔥".repeat(spicinessLevel || 1)}
              </Text>
            </View>
          </ImageBackground>
        )}
        
        <View style={styles.noodleInfo}>
          <Text style={styles.noodleName} numberOfLines={2}>{name}</Text>
          <View style={styles.noodleDetails}>
            <Text style={styles.noodleCountry}>🌍 {originCountry}</Text>
            <Text style={styles.noodleReviews}>💬 {reviewsCount || 0} reviews</Text>
          </View>
        </View>
      </Pressable>
      
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeFromFavourites(id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (queryLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>Error: {error.message}</Text>
      </View>
    );
  }  return (
    <>      <Stack.Screen 
        options={{
          headerTitle: "My Favourites",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/')}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>← Back</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <FilterControls filters={filters} onFiltersChange={setFilters} />
        
        {favouriteIds.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No favourites yet!</Text>
            <Text style={styles.emptySubtext}>Add noodles to your favourites from the details page.</Text>
          </View>
        ) : data?.instantNoodles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No favourites match your filters</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters to see more results.</Text>
          </View>
        ) : (
          <FlatList
            data={data?.instantNoodles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <FavouriteNoodleItem {...item} />}
            numColumns={1}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  error: { 
    color: "red", 
    padding: 16,
    textAlign: 'center',
  },
  listContent: { 
    padding: 16 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },  favouriteItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noodleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  noodleImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spicinessText: {
    fontSize: 16,
    color: 'white',
  },
  noodleInfo: {
    flex: 1,
    justifyContent: 'center',
  },  noodleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  noodleDetails: {
    flexDirection: 'column',
    gap: 4,
  },
  noodleCountry: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  noodleReviews: {
    fontSize: 12,
    color: '#999',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  headerButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
