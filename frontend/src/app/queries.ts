import { gql } from "@apollo/client";

export const GET_NOODLES = gql`
  query GetNoodles($where: InstantNoodleWhereInput) {
    instantNoodles(where: $where) {
      id
      name
      spicinessLevel
      originCountry
      reviewsCount
      imageURL
    }
  }
`;

export const UPDATE_NOODLE_REVIEWS = gql`
  mutation UpdateNoodleReviews($id: ID!, $reviewsCount: Int!) {
    updateInstantNoodle(
      where: { id: $id }
      data: { reviewsCount: $reviewsCount }
    ) {
      id
      reviewsCount
      lastReviewedAt
    }
  }
`;
