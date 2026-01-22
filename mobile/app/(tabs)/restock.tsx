import { View, StyleSheet } from 'react-native';
import { Fasoolya } from '@/components';

export default function RestockScreen() {
  return (
    <View style={styles.container}>
      <Fasoolya 
        size="lg" 
        message="Looking steady. No surprises today. Your restock list will appear here when items are running low."
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
