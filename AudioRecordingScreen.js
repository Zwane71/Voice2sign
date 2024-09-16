import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Animated,
  Easing,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import {
  MaterialCommunityIcons,
  AntDesign,
  Ionicons,
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const AudioRecordingScreen = () => {
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [recordingName, setRecordingName] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const waveformAnimations = useRef(
    Array.from({ length: 30 }, () => new Animated.Value(50))
  ).current;
  const [animationRunning, setAnimationRunning] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    let interval;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration((prevDuration) => prevDuration + 1);
        if (!animationRunning) {
          animateWaveform();
        }
      }, 1000);
    } else if ((!isRecording || isPaused) && duration !== 0) {
      clearInterval(interval);
      if (animationRunning) {
        stopWaveformAnimation();
      }
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused, animationRunning]);

  useEffect(() => {
    if (sound) {
      sound.setOnPlaybackStatusUpdate((status) => {
        setIsPaused(status.isPlaying ? false : true);
      });
    }
  }, [sound]);

  const animateWaveform = () => {
    const animations = waveformAnimations.map((animation) => {
      const randomDuration = Math.random() * 800 + 600;
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 80,
            duration: randomDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(animation, {
            toValue: 50,
            duration: randomDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      );
    });

    Animated.parallel(animations).start();
    setAnimationRunning(true);
  };

  const stopWaveformAnimation = () => {
    const animations = waveformAnimations.map((animation) =>
      Animated.timing(animation, {
        toValue: 50,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
    );

    Animated.parallel(animations).start(() => setAnimationRunning(false));
  };

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (granted) {
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
        setDuration(0);
        console.log('Recording started');
      } else {
        Alert.alert(
          'Permission Denied',
          'You need to grant audio recording permissions.'
        );
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const { sound } = await recording.createNewLoadedSoundAsync();
        setSound(sound);
        setIsRecording(false);
        setIsPaused(true);
        console.log('Recording stopped');
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const toggleRecording = () => {
    console.log('Toggling recording');
    if (isRecording) {
      stopRecording();
    } else {
      setIsPaused(false);
      startRecording();
    }
  };

  const togglePause = async () => {
    if (sound) {
      if (isPaused) {
        console.log('Playing sound');
        await sound.playAsync();
        setIsPaused(false);
      } else {
        console.log('Pausing sound');
        await sound.pauseAsync();
        setIsPaused(true);
      }
    }
  };

  const saveRecording = async () => {
    if (!recording) {
      Alert.alert(
        'No recording found',
        'Please record something before saving.'
      );
      return;
    }

    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const fileUri = recording.getURI();
      if (!fileUri) {
        Alert.alert('Error', 'No recording URI found.');
        return;
      }

      const fileName = `${recordingName || `recording_${Date.now()}`}.m4a`;
      const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.moveAsync({
        from: fileUri,
        to: destinationUri,
      });

      Alert.alert(
        'Recording saved',
        `Your recording has been saved successfully! \nLocation: ${destinationUri}`
      );
      console.log(`Recording saved to ${destinationUri}`);

      const recordingDetails = {
        uri: destinationUri,
        name: recordingName || fileName,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      };
      await saveRecordingToStorage(recordingDetails);

      setRecording(null);
      setIsRecording(false);
      setDuration(0);
      setIsPaused(true);

      setShowModal(false);
      setRecordingName('');

      navigation.navigate('HistoryScreen', {
        recordingUri: destinationUri,
        recordingName: recordingDetails.name,
        recordingDate: recordingDetails.date,
        recordingTime: recordingDetails.time,
      });
    } catch (error) {
      console.error('Failed to save recording:', error);
      Alert.alert('Error', 'Failed to save the recording.');
    }
  };

  const saveRecordingToStorage = async (recordingDetails) => {
    try {
      const savedRecordings = await AsyncStorage.getItem('recordings');
      const recordingsArray = savedRecordings
        ? JSON.parse(savedRecordings)
        : [];
      recordingsArray.push(recordingDetails);
      await AsyncStorage.setItem('recordings', JSON.stringify(recordingsArray));
    } catch (error) {
      console.error('Error saving recording:', error);
    }
  };

  const discardRecording = async () => {
    if (isRecording && recording) {
      try {
        await recording.stopAndUnloadAsync();
        console.log('Recording stopped and discarded');
      } catch (error) {
        console.error('Failed to stop recording:', error);
        Alert.alert('Error', 'Failed to stop recording.');
      }
      setRecording(null);
      setIsRecording(false);
      setDuration(0);
      setIsPaused(true);
    }

    stopWaveformAnimation();

    setRecording(null);
    setIsRecording(false);
    setDuration(0);
    setIsPaused(false);

    Alert.alert('Recording discarded', 'Your recording has been discarded.');
  };

  const formatDuration = (durationInSeconds) => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`;
  };

  const bars = waveformAnimations.map((animation, index) => (
    <Animated.View
      key={index}
      style={[styles.waveformBar, { height: animation }]}
    />
  ));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Record Conversation</Text>
      </View>
      <Text style={styles.duration}>{formatDuration(duration)}</Text>
      <TouchableOpacity style={styles.button} onPress={toggleRecording}>
        <MaterialCommunityIcons
          name={isRecording ? 'stop-circle' : 'record-rec'}
          size={50}
          color="red"
        />
      </TouchableOpacity>

      <View style={styles.waveformContainer}>{bars}</View>

      <TouchableOpacity
        style={styles.playPauseButton}
        onPress={togglePause}
        disabled={!sound}>
        <MaterialCommunityIcons
          style={styles.playIcon}
          name={isPaused ? 'play-circle-outline' : 'pause-circle-outline'}
          size={50}
          color="white"
        />
      </TouchableOpacity>

      <View style={styles.saveDiscardContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={saveRecording}>
          <AntDesign
            style={styles.saveIcon}
            name="download"
            size={24}
            color="white"
          />
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.discardButton}
          onPress={discardRecording}>
          <MaterialCommunityIcons
            style={styles.discardIcon}
            name="file-undo-outline"
            size={24}
            color="white"
          />
          <Text style={styles.buttonText}>Discard</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        animationType="slide"
        visible={showModal}
        onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Recording</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter recording name"
              placeholderTextColor="#ccc"
              value={recordingName}
              onChangeText={setRecordingName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowModal(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.iconContainer}>
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate('LandingPage')}
            accessibilityLabel="Home Icon">
            <Ionicons name="home-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity onPress={() => console.log('Record Icon Clicked')}>
            <MaterialCommunityIcons
              name="circle-outline"
              size={30}
              color="#008000"
            />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate('HistoryScreen')}
            accessibilityLabel="History Icon">
            <Ionicons name="time-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    marginTop: height * 0.05,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  duration: {
    color: 'white',
    fontSize: 24,
    marginVertical: 10,
  },
  button: {
    padding: 10,
    borderRadius: 50,
    marginVertical: 20,
  },
  waveformContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '30%',
    height: height * 0.2,
    marginVertical: 20,
  },
  waveformBar: {
    width: 2,
    backgroundColor: '#fff',
  },
  playPauseButton: {
    paddingVertical: 20,
  },
  saveDiscardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
  },
  discardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#2F4D3F',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white',
  },
  input: {
    width: '100%',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#2F4D3F',
    marginHorizontal: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

export default AudioRecordingScreen;
