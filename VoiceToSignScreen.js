import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Ionicons,
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const VoiceToSignScreen = () => {
  const navigation = useNavigation();

  const responsiveFontSize = (size) => (size / 375) * width; // Scale font size based on device width
  const responsiveHeight = (size) => (size / 812) * height; // Scale height based on device height

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text
        style={[
          styles.title,
          { fontSize: responsiveFontSize(24), marginTop: responsiveHeight(80) },
        ]}>
        Voice to sign
      </Text>

      <View
        style={[
          styles.square,
          { height: responsiveHeight(240), width: '90%' },
        ]}>
        <MaterialIcons
          name="multitrack-audio"
          size={responsiveFontSize(200)}
          color="white"
        />
      </View>

      <Text
        style={[
          styles.subtitle,
          {
            fontSize: responsiveFontSize(18),
            marginBottom: responsiveHeight(20),
          },
        ]}>
        Audio to sign language
      </Text>

      <View
        style={[
          styles.buttonContainer,
          {
            width: '85%',
            padding: responsiveHeight(12),
            marginBottom: responsiveHeight(20),
          },
        ]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('AudioRecordingScreen')}
          accessibilityLabel="Microphone Icon">
          <Ionicons
            name="mic-outline"
            size={responsiveFontSize(40)}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity>
        <FontAwesome
          name="american-sign-language-interpreting"
          size={responsiveFontSize(40)}
          color="white"
        />
        </TouchableOpacity>
      </View>

      <Text
        style={[
          styles.recordText,
          {
            fontSize: responsiveFontSize(20),
            marginVertical: responsiveHeight(18),
          },
        ]}>
        Start recording
      </Text>

      <TouchableOpacity
        style={[
          styles.recordButton,
          {
            width: '90%',
            paddingVertical: responsiveHeight(15),
            paddingHorizontal: responsiveHeight(25),
          },
        ]}
        onPress={() => navigation.navigate('AudioRecordingScreen')}
        accessibilityLabel="Record Button">
        <Ionicons
          name="power-outline"
          size={responsiveFontSize(40)}
          color="white"
        />
      </TouchableOpacity>

      <View style={styles.container2}>
        <View
          style={[styles.iconContainer, { marginTop: responsiveHeight(85) }]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('LandingPage')}
            accessibilityLabel="Home Icon">
            <Ionicons
              name="home-outline"
              size={responsiveFontSize(30)}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('AudioRecordingScreen')}
            accessibilityLabel="Home Icon">
            <MaterialCommunityIcons
              name="circle-outline"
              size={responsiveFontSize(30)}
              color="#008000"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('HistoryScreen')}
            accessibilityLabel="History Icon">
            <Ionicons
              name="time-outline"
              size={responsiveFontSize(30)}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
  square: {
    backgroundColor: '#2F4D3F',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    borderRadius: 10,
    padding: 6,
  },
  subtitle: {
    color: 'white',
    fontWeight: '900',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2F4D3F',
    borderRadius: 10,
  },
  recordButton: {
    backgroundColor: '#2F4D3F',
    borderRadius: 10,
    alignItems: 'center',
  },
  recordText: {
    color: 'white',
    fontWeight: '900',
  },
  container2: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 50,
  },
});

export default VoiceToSignScreen;
