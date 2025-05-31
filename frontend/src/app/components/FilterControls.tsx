import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Filters, CountryFilter, SpicinessFilter } from '../types';

type Props = {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
};

const countryOptions: { label: string; value: CountryFilter }[] = [
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
];

const spicinessOptions: { label: string; value: SpicinessFilter }[] = [
  { label: '🔥 (1)', value: 1 },
  { label: '🔥🔥 (2)', value: 2 },
  { label: '🔥🔥🔥 (3)', value: 3 },
  { label: '🔥🔥🔥🔥 (4)', value: 4 },
  { label: '🔥🔥🔥🔥🔥 (5)', value: 5 },
];

export function FilterControls({ filters, onFiltersChange }: Props) {
  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.spicinessLevel !== undefined || filters.originCountry !== undefined;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filters</Text>
      
      <View style={styles.filterRow}>
        <View style={styles.filterSection}>
          <Text style={styles.label}>Spiciness Level:</Text>
          <View style={styles.pickerContainer}>            <Picker
              selectedValue={filters.spicinessLevel?.toString() || ''}
              onValueChange={(value) => {
                onFiltersChange({
                  ...filters,
                  spicinessLevel: value === '' ? undefined : parseInt(value) as SpicinessFilter
                });
              }}
              style={styles.picker}
            >
              <Picker.Item label="All Levels" value="" />
              {spicinessOptions.map((option) => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.label}>Origin Country:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={filters.originCountry || ''}
              onValueChange={(value) => {
                onFiltersChange({
                  ...filters,
                  originCountry: value === '' ? undefined : (value as CountryFilter)
                });
              }}
              style={styles.picker}
            >
              <Picker.Item label="All Countries" value="" />
              {countryOptions.map((option) => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {hasActiveFilters && (
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  filterSection: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: {
    height: 50,
  },
  clearButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 12,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
