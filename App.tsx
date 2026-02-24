import React, { useState } from 'react';
import { StyleSheet, View, Text, StatusBar, SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ContinuousBoard } from './src/components/continuous-board';
import { GridConfig } from './src/types/domain';

// Example Application Data
const generateMockData = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `item-${i}`,
    label: `Widget ${i + 1}`,
    color: `hsl(${(i * 36) % 360}, 70%, 80%)`,
  }));
};

const MOCK_DATA = generateMockData(20);

// Example Layout Constraints
const BOARD_CONFIG: GridConfig = {
  surfaceWidth: 400, // Typically Window.width
  columnWidth: 100,
  rowHeight: 120,
  columnsPerPage: 3,
  rowsPerPage: 4,
  padding: 16,
  gapX: 16,
  gapY: 16,
};

export default function App() {
  const [data, setData] = useState(MOCK_DATA);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>AI-First Sortable Board</Text>
          <Text style={styles.subtitle}>Native 60FPS Drag & Drop</Text>
        </View>

        <View style={styles.boardWrapper}>
          <ContinuousBoard
            data={data}
            config={BOARD_CONFIG}
            horizontal={true}
            onOrderChanged={(newKeys) => {
              console.log('New Absolute Order:', newKeys);
              // Natively synced, React reorder is optional but good for persistence
            }}
            renderItem={(item) => (
              <View style={[styles.card, { backgroundColor: item.color as string }]}>
                <Text style={styles.cardText}>{item.label}</Text>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Tailwind gray-100
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  boardWrapper: {
    flex: 1,
    alignItems: 'center', // Center the board horizontally if smaller than window
    paddingTop: 20,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
