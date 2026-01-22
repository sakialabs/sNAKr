import { View, StyleSheet } from 'react-native';
import { Fasoolya } from '@/components';

export default function ReceiptsScreen() {
  return (
    <View style={styles.container}>
      <Fasoolya 
        size="lg" 
        message="Upload your receipts and I'll help you update your inventory automatically!"
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
