import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { ContinuousBoard } from '../../src/components/continuous-board';
import { GridConfig } from '../../src/types/domain';

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const RNGH = jest.requireActual('react-native-gesture-handler');
  return {
    ...RNGH,
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    Gesture: {
      Pan: () => ({
        manualActivation: jest.fn().mockReturnThis(),
        onTouchesMove: jest.fn().mockReturnThis(),
        onUpdate: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
      }),
      LongPress: () => ({
        minDuration: jest.fn().mockReturnThis(),
        onStart: jest.fn().mockReturnThis(),
      }),
      Simultaneous: jest.fn(),
    },
  };
});

describe('Components > ContinuousBoard', () => {
  const mockConfig: GridConfig = {
    surfaceWidth: 400,
    columnWidth: 100,
    rowHeight: 100,
    columnsPerPage: 3,
    rowsPerPage: 4,
    padding: 10,
    gapX: 10,
    gapY: 10,
  };

  const mockData = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ];

  it('renders the board and children correctly without crashing', () => {
    const { getByText } = render(
      <ContinuousBoard
        data={mockData}
        config={mockConfig}
        renderItem={(item) => <Text>{String(item.name)}</Text>}
      />
    );

    // Assert that the render prop executes successfully for all items
    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
    expect(getByText('Item 3')).toBeTruthy();
  });
});
