import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onPress?: () => void;
}

const sizeMap = {
  sm: { dimension: 32, fontSize: 18 },
  md: { dimension: 48, fontSize: 24 },
  lg: { dimension: 64, fontSize: 32 },
};

export function Logo({ size = 'md', showText = true, onPress }: LogoProps) {
  const router = useRouter();
  const { dimension, fontSize } = sizeMap[size];

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(tabs)');
    }
  };

  const content = (
    <View style={styles.container}>
      <Image
        source={require('@/assets/logo.png')}
        style={{ width: dimension, height: dimension }}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[styles.text, { fontSize }]}>sNAKr</Text>
      )}
    </View>
  );

  if (onPress !== undefined || !showText) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    fontWeight: 'bold',
    color: '#212121',
  },
});
