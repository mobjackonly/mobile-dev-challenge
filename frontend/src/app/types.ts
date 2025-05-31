export type Noodle = {
  id: string;
  name: string;
  brand: string;
  originCountry: string;
  spicinessLevel: number;
  rating: number;
  reviewsCount: number;
  category?: {
    name: string;
  };
  imageURL: string;
};

export type CountryFilter = 
  | 'south_korea'
  | 'indonesia' 
  | 'malaysia'
  | 'thailand'
  | 'japan'
  | 'singapore'
  | 'vietnam'
  | 'china'
  | 'taiwan'
  | 'philippines';

export type SpicinessFilter = 1 | 2 | 3 | 4 | 5;

export type Filters = {
  spicinessLevel?: SpicinessFilter;
  originCountry?: CountryFilter;
};
