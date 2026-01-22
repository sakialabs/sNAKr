import { View, Text, StyleSheet } from 'react-native';
import { Fasoolya } from '@/components';

export default function InventoryScreen() {
  return (
    <View style={styles.container}>
      <Fasoolya 
        size="lg" 
        message="Your household items will appear here. Upload a receipt or add items manually to get started!"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
