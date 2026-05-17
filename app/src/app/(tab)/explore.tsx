import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

interface CategoryItem {
  id: string;
  title: string;
  image: string;
  count: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: '1',
    title: 'Spine & Neck Alignment',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=300&q=80',
    count: '12 Exercises',
  },
  {
    id: '2',
    title: 'Hip & Pelvic Mobility',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80',
    count: '16 Exercises',
  },
  {
    id: '3',
    title: 'Shoulder & Upper Back',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=300&q=80',
    count: '10 Exercises',
  },
  {
    id: '4',
    title: 'Knee & Ankle Strength',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=300&q=80',
    count: '14 Exercises',
  },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const renderCategoryCard = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardOverlay} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardCount}>{item.count}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore Mobility</Text>
          <Text style={styles.headerSubtitle}>Discover specialized exercises built for your joint axis</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#8A99AD" style={styles.searchIcon} />
          <TextInput
            placeholder="Search exercises, areas, or plans..."
            placeholderTextColor="#5C6E84"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Quick Filters */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Focus Regions</Text>
            <View style={styles.chipRow}>
              {['All', 'Spine', 'Hips', 'Shoulders', 'Lower Limbs'].map((label, idx) => (
                <TouchableOpacity
                  key={label}
                  style={[styles.chip, idx === 0 && styles.chipActive]}>
                  <Text style={[styles.chipText, idx === 0 && styles.chipTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Core Categories Grid */}
          <View style={styles.gridSection}>
            <Text style={styles.sectionTitle}>Axis Categories</Text>
            <FlatList
              data={CATEGORIES}
              renderItem={renderCategoryCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
            />
          </View>

          {/* Trending exercises banner */}
          <View style={styles.trendingCard}>
            <View style={styles.trendingLabelContainer}>
              <Feather name="trending-up" size={12} color="#00F2FE" />
              <Text style={styles.trendingLabel}>TRENDING ROUTINE</Text>
            </View>
            <Text style={styles.trendingTitle}>Full-Body Axis Integration</Text>
            <Text style={styles.trendingDesc}>A highly structured 25-minute flow designed to scan and align all major kinetic joints in a single continuous session.</Text>
            <TouchableOpacity style={styles.trendingButton}>
              <Text style={styles.trendingButtonText}>Start Session</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B14',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8A99AD',
    marginTop: 6,
    lineHeight: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#0C1524',
    borderWidth: 1,
    borderColor: '#1E2E44',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filterSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#0C1524',
    borderWidth: 1,
    borderColor: '#1E2E44',
  },
  chipActive: {
    backgroundColor: '#208AEF',
    borderColor: '#208AEF',
  },
  chipText: {
    fontSize: 12,
    color: '#8A99AD',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  gridSection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    aspectRatio: 0.9,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(32, 138, 239, 0.08)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 11, 20, 0.6)',
  },
  cardContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 4,
  },
  cardCount: {
    fontSize: 11,
    color: '#00F2FE',
    fontWeight: '600',
  },
  trendingCard: {
    marginHorizontal: 24,
    backgroundColor: '#0C1524',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(32, 138, 239, 0.08)',
  },
  trendingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  trendingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00F2FE',
    letterSpacing: 0.8,
  },
  trendingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  trendingDesc: {
    fontSize: 13,
    color: '#8A99AD',
    lineHeight: 18,
    marginBottom: 20,
  },
  trendingButton: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#2F80ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
