// App.js — Root of the entire mobile app
import './src/utils/i18n'; // Load translations first
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import store, { authActions } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { useDispatch } from 'react-redux';

// This component restores login state on app start
function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      // Check if user was already logged in
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      if (token && user) {
        dispatch(authActions.setUser({ token, user: JSON.parse(user) }));
      }
    } catch (e) {
      console.log('Session restore error:', e);
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

// Wrap everything in the Redux Provider
export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}