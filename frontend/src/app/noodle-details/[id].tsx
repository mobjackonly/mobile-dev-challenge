import { Stack, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { gql, useQuery, useMutation } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UPDATE_NOODLE_REVIEWS } from "../queries";

const GET_NOODLE_DETAILS = gql`
  query GetNoodleDetails($id: ID!) {
    instantNoodle(where: { id: $id }) {
      id
      name
      brand
      spicinessLevel
      originCountry
      rating
      imageURL
      reviewsCount
      category {
        name
      }
    }
  }
`;

export default function NoodlesDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isFavourite, setIsFavourite] = useState(false);
  
  const { loading, error, data, refetch } = useQuery(GET_NOODLE_DETAILS, {
    variables: { id },
    skip: !id,
  });

  const [updateReviews] = useMutation(UPDATE_NOODLE_REVIEWS);
  // Check if this noodle is in favourites
  useEffect(() => {
    const checkFavouriteStatus = async () => {
      if (!id) return;
      
      try {
        const stored = await AsyncStorage.getItem('favourites');
        const favourites = stored ? JSON.parse(stored) : [];
        setIsFavourite(favourites.includes(id));
      } catch (error) {
        console.error("Error checking favourite status:", error);
      }
    };

    checkFavouriteStatus();
  }, [id]);

  const handleLeaveReview = async () => {
    if (!data?.instantNoodle) return;

    const currentReviews = data.instantNoodle.reviewsCount || 0;
    const newReviewsCount = currentReviews + 1;

    try {
      await updateReviews({
        variables: {
          id: data.instantNoodle.id,
          reviewsCount: newReviewsCount,
        },
      });
      
      // Refetch to get updated data
      await refetch();
      
      Alert.alert("Review Added", `Thank you for your review! Total reviews: ${newReviewsCount}`);
    } catch (error) {
      Alert.alert("Error", "Failed to add review. Please try again.");
      console.error("Review update error:", error);
    }
  };  const handleAddToFavourite = async () => {
    if (!data?.instantNoodle) return;
    
    try {
      const stored = await AsyncStorage.getItem('favourites');
      const favourites = stored ? JSON.parse(stored) : [];
      const noodleId = data.instantNoodle.id;
      
      if (favourites.includes(noodleId)) {
        // Remove from favourites
        const updatedFavourites = favourites.filter((fav: string) => fav !== noodleId);
        await AsyncStorage.setItem('favourites', JSON.stringify(updatedFavourites));
        setIsFavourite(false);
        Alert.alert("Removed from Favourites", "This noodle has been removed from your favourites!");
      } else {
        // Add to favourites
        const updatedFavourites = [...favourites, noodleId];
        await AsyncStorage.setItem('favourites', JSON.stringify(updatedFavourites));
        setIsFavourite(true);
        Alert.alert("Added to Favourites", "This noodle has been added to your favourites!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update favourites. Please try again.");
      console.error("Favourites error:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !data?.instantNoodle) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load noodle details.</Text>
      </View>
    );
  }

  const noodle = data.instantNoodle;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: noodle.name }} />

      {noodle.imageURL && (
        <Image
          source={{ uri: noodle.imageURL }}
          style={styles.image}
          resizeMode="cover"
        />
      )}      <Text style={styles.title}>{noodle.name}</Text>
      <Text style={styles.subtitle}>Brand: {noodle.brand}</Text>

      <View style={styles.tags}>
        <Text style={styles.tag}>🌍 {noodle.originCountry}</Text>
        <Text style={styles.tag}>🔥{"🔥".repeat(noodle.spicinessLevel)}</Text>
        <Text style={styles.tag}>⭐ {noodle.rating}/10</Text>
        <Text style={styles.tag}>📦 {noodle.category?.name}</Text>
        <Text style={styles.tag}>💬 {noodle.reviewsCount} reviews</Text>
      </View>

      {/* Task 2 & 3: Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.button, styles.reviewButton]} 
          onPress={handleLeaveReview}
        >
          <Text style={styles.buttonText}>📝 Leave Review</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, isFavourite ? styles.removeButton : styles.favouriteButton]} 
          onPress={handleAddToFavourite}
        >
          <Text style={styles.buttonText}>
            {isFavourite ? "💔 Remove from Favourites" : "❤️ Add to Favourites"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },  reviewButton: {
    backgroundColor: "#007AFF",
  },
  favouriteButton: {
    backgroundColor: "#FF3B30",
  },
  removeButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});