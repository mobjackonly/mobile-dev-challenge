import { graphql, list } from '@keystone-6/core';
import {
  text,
  integer,
  select,
  relationship,
  timestamp,
  virtual,
} from '@keystone-6/core/fields';
import { allowAll } from '@keystone-6/core/access';

export const lists = {
  InstantNoodle: list({
    access: allowAll,
    hooks: {
      resolveInput: async ({ operation, resolvedData, item }) => {
        // Update lastReviewedAt when reviewsCount increases
        if (operation === 'update' && resolvedData.reviewsCount !== undefined) {
          const currentReviewsCount = item?.reviewsCount || 0;
          const newReviewsCount = resolvedData.reviewsCount;
          
          if (newReviewsCount > currentReviewsCount) {
            resolvedData.lastReviewedAt = new Date();
          }
        }
        
        return resolvedData;
      },
      validateInput: async ({ operation, resolvedData, item, addValidationError }) => {
        // Prevent decreasing reviewsCount
        if (operation === 'update' && resolvedData.reviewsCount !== undefined) {
          const currentReviewsCount = item?.reviewsCount || 0;
          const newReviewsCount = resolvedData.reviewsCount;
          
          if (newReviewsCount < currentReviewsCount) {
            addValidationError('reviewsCount cannot be decreased');
          }
        }
      },
    },
    fields: {
      name: text({
        validation: { isRequired: true },
      }),
      brand: text({
        validation: { isRequired: true },
      }),      spicinessLevel: integer({
        validation: {
          isRequired: true,
          min: 1,
          max: 5,
        },
        defaultValue: 3,
        ui: { description: 'Scale of 1 (mild) to 5 (🔥)' },
      }),
      spicinessDescription: virtual({
        field: graphql.field({
          type: graphql.String,
          resolve(item: any) {
            const level = item.spicinessLevel;
            if (level >= 1 && level <= 2) {
              return 'Mild';
            } else if (level >= 3 && level <= 4) {
              return 'Medium';
            } else if (level === 5) {
              return 'Hot';
            }
            return 'Unknown';
          },
        }),
      }),
      originCountry: select({
        type: 'enum',
        options: [
          { label: 'South Korea', value: 'south_korea' },
          { label: 'Indonesia', value: 'indonesia' },
          { label: 'Malaysia', value: 'malaysia' },
          { label: 'Thailand', value: 'thailand' },
          { label: 'Japan', value: 'japan' },
          { label: 'Singapore', value: 'singapore' },
          { label: 'Vietnam', value: 'vietnam' },
          { label: 'China', value: 'china' },
          { label: 'Taiwan', value: 'taiwan' },
          { label: 'Philippines', value: 'philippines' },
        ],
        validation: { isRequired: true },
      }),      rating: integer({
        validation: {
          isRequired: true,
          min: 1,
          max: 10,
        },
        defaultValue: 5,
        ui: { description: 'Your personal rating (1–10)' },
      }),      reviewsCount: integer({
        validation: {
          isRequired: true,
          min: 0,
        },
        defaultValue: 0,
        ui: { description: 'Number of reviews for this noodle' },
      }),
      lastReviewedAt: timestamp({
        ui: { description: 'Last time this noodle was reviewed' },
      }),
      imageURL: text({
        validation: { isRequired: false },
        ui: { description: 'URL to the noodle image' },
      }),
      category: relationship({
        ref: 'Category.noodles',
        many: false,
        ui: { displayMode: 'select' },
      }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
      }),
    },
  }),

  Category: list({
    access: allowAll,
    fields: {
      name: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
      }),
      noodles: relationship({ ref: 'InstantNoodle.category', many: true }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
      }),
    },
  }),
};
