import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingPage from './LandingPage';
import VoiceToSignScreen from './VoiceToSignScreen';
import SignToTextScreen from './SignToTextScreen';
import AudioRecordingScreen from './AudioRecordingScreen';
import HistoryScreen from './HistoryScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LandingPage"
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LandingPage" component={LandingPage} />
        <Stack.Screen name="VoiceToSignScreen" component={VoiceToSignScreen} />
        <Stack.Screen name="SignToTextScreen" component={SignToTextScreen} />
        <Stack.Screen
          name="AudioRecordingScreen"
          component={AudioRecordingScreen}
        />
        <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
