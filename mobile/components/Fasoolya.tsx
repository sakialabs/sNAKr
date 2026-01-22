import { View, Text, Image, StyleSheet } from 'react-native';

interface FasoolyaProps {
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
}

const sizeMap = {
  sm: 80,
  md: 120,
  lg: 160,
  xl: 240,
};

export function Fasoolya({ animated = false, size = 'md', message }: FasoolyaProps) {
  const dimension = sizeMap[size];
  const source = animated
    ? require('@/assets/fasoolya_animated.png')
    : require('@/assets/fasoolya.png');

  return (
    <View style={styles.container}>
      <Image
        source={source}
        style={{ width: dimension, height: dimension }}
        resizeMode="contain"
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  message: {
    textAlign: 'center',
    color: '#757575',
    fontSize: 16,
    maxWidth: 320,
  },
});
