import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import {
  MaterialCommunityIcons,
  AntDesign,
  Ionicons,
} from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

const HistoryScreen = ({ route, navigation }) => {
  const [recordingUri, setRecordingUri] = useState(null);
  const [recordingName, setRecordingName] = useState('');
  const [recordingDate, setRecordingDate] = useState('');
  const [recordingTime, setRecordingTime] = useState('');
  const [transcriptionText, setTranscriptionText] = useState('');
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordingsArray, setRecordingsArray] = useState([]);

  const responsiveFontSize = (size) => (size / 375) * width;
  const responsiveHeight = (size) => (size / 812) * height;

  useEffect(() => {
    const loadLastRecording = async () => {
      const savedRecordings = await AsyncStorage.getItem('recordings');
      const recordings = savedRecordings ? JSON.parse(savedRecordings) : [];
      setRecordingsArray(recordings);

      if (route.params) {
        const { recordingUri, recordingName, recordingDate, recordingTime } =
          route.params;
        setRecordingUri(recordingUri);
        setRecordingName(recordingName);
        setRecordingDate(recordingDate);
        setRecordingTime(recordingTime);
        setCurrentIndex(
          recordings.findIndex((rec) => rec.uri === recordingUri)
        );
      } else if (recordings.length > 0) {
        const lastRecording = recordings[recordings.length - 1];
        setRecordingUri(lastRecording.uri);
        setRecordingName(lastRecording.name);
        setRecordingDate(lastRecording.date);
        setRecordingTime(lastRecording.time);
        setCurrentIndex(recordings.length - 1);
      }
    };

    loadLastRecording();
  }, [route.params]);

  const playPauseAudio = async () => {
    if (!sound) {
      try {
        const { sound: playbackObject } = await Audio.Sound.createAsync(
          { uri: recordingUri },
          { shouldPlay: true }
        );
        setSound(playbackObject);
        playbackObject.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        setIsPlaying(true);
      } catch (error) {
        console.error('Error loading sound:', error);
      }
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  const shareRecording = async () => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing is not available on this platform');
        return;
      }
      await Sharing.shareAsync(recordingUri);
    } catch (error) {
      console.error('Error sharing recording:', error);
      Alert.alert('Error', 'Failed to share the recording.');
    }
  };

  const deleteRecording = async () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedRecordings = recordingsArray.filter(
                (recording) => recording.uri !== recordingUri
              );

              await AsyncStorage.setItem(
                'recordings',
                JSON.stringify(updatedRecordings)
              );

              Alert.alert(
                'Recording deleted',
                'The recording has been successfully deleted.'
              );
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting recording:', error);
            }
          },
        },
      ]
    );
  };

  const saveRecording = async () => {
    try {
      const uriParts = recordingUri.split('/');
      const fileName = uriParts[uriParts.length - 1];
      const newPath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: recordingUri, to: newPath });
      Alert.alert('Success', 'Recording saved to local storage.');
    } catch (error) {
      console.error('Error saving recording:', error);
      Alert.alert('Error', 'Failed to save the recording.');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevRecording = recordingsArray[currentIndex - 1];
      setRecordingUri(prevRecording.uri);
      setRecordingName(prevRecording.name);
      setRecordingDate(prevRecording.date);
      setRecordingTime(prevRecording.time);
      setCurrentIndex(currentIndex - 1);
    } else {
      Alert.alert('Recording Not Available', 'This is your first recording. ');
    }
  };

  const handleNext = () => {
    if (currentIndex < recordingsArray.length - 1) {
      const nextRecording = recordingsArray[currentIndex + 1];
      setRecordingUri(nextRecording.uri);
      setRecordingName(nextRecording.name);
      setRecordingDate(nextRecording.date);
      setRecordingTime(nextRecording.time);
      setCurrentIndex(currentIndex + 1);
    } else {
      Alert.alert('Recording Not Available', 'This is your latest recording. ');
    }
  };

  if (!recordingUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No recording available</Text>

        <View>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.navigate('AudioRecordingScreen')}
            accessibilityLabel="Make A Recording">
            <Text style={styles.goBackButtonText}>Make a Recording</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.navigate('LandingPage')}
            accessibilityLabel="Go Back Home">
            <Text style={styles.goBackButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{recordingName}</Text>
      <Text style={styles.dateText}>
        {recordingDate} - {recordingTime}
      </Text>

      <View style={styles.audioContainer}>
        <MaterialCommunityIcons name="video" size={100} color="white" />
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={handlePrevious} style={styles.actionButton}>
          <MaterialCommunityIcons
            name="skip-previous-circle"
            size={40}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={playPauseAudio} style={styles.actionButton}>
          <MaterialCommunityIcons
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={40}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} style={styles.actionButton}>
          <MaterialCommunityIcons
            name="skip-next-circle"
            size={40}
            color="white"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={saveRecording} style={styles.actionButton}>
          <AntDesign name="download" size={24} color="white" />
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={deleteRecording} style={styles.actionButton}>
          <MaterialCommunityIcons
            name="delete-outline"
            size={24}
            color="white"
          />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={shareRecording} style={styles.actionButton}>
          <AntDesign name="sharealt" size={24} color="white" />
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transcriptionContainer}>
        <Text style={styles.transcriptionText}>
          {transcriptionText || 'Transcription Loading...'}
        </Text>
      </View>

      <View style={styles.container2}>
        <View
          style={[styles.iconContainer, { marginTop: responsiveHeight(40) }]}>
          <TouchableOpacity onPress={() => navigation.navigate('LandingPage')}>
            <Ionicons
              name="home-outline"
              size={responsiveFontSize(30)}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('AudioRecordingScreen')}
            accessibilityLabel="Record Icon">
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
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
  },
  dateText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  audioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    marginLeft: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    marginLeft: 20,
  },
  actionButton: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  buttonText: {
    color: 'white',
    marginTop: 5,
  },
  transcriptionContainer: {
    marginTop: 20,
    backgroundColor: '#2F4D3F',
    borderRadius: 10,
    width: '88%',
    height: '20%',
    padding: 20,
  },
  transcriptionText: {
    color: 'white',
    fontSize: 16,
  },
  goBackButtonText: {
    color: 'white',
  },
  goBackButton: {
    alignItems: 'center',
    backgroundColor: '#2F4D3F',
    padding: 13,
    borderRadius: 10,
    margin: 12,
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

export default HistoryScreen;
