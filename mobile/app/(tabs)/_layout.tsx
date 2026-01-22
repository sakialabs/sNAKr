import { Tabs } from 'expo-router';
import { Logo } from '@/components';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitle: () => <Logo size="sm" showText={true} />,
        headerStyle: {
          backgroundColor: '#fff',
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Inventory',
          tabBarLabel: 'Inventory',
        }} 
      />
      <Tabs.Screen 
        name="restock" 
        options={{ 
          title: 'Restock',
          tabBarLabel: 'Restock',
        }} 
      />
      <Tabs.Screen 
        name="receipts" 
        options={{ 
          title: 'Receipts',
          tabBarLabel: 'Receipts',
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          tabBarLabel: 'Settings',
        }} 
      />
    </Tabs>
  );
}
