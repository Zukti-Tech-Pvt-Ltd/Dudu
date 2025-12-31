import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from './src/helper/authContext';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppInner } from './route';

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppInner />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
