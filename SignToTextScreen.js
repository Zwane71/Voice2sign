import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

const SignToTextScreen = () => {
  const [text, setText] = useState('Text translation will appear here');
  const cameraRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [model, setModel] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [cameraType, setCameraType] = useState(
    Camera.Constants ? Camera.Constants.Type.back : null
  );

  const navigation = useNavigation();
  const { height, width } = Dimensions.get('window');

  const responsiveFontSize = (size) => (size / 375) * width;
  const responsiveHeight = (size) => (size / 812) * height;

  useEffect(() => {
    const initializeModel = async () => {
      try {
        // Load model (adjust to your specific function)
        const loadedModel = await loadedModel();
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading model:', error);
        Alert.alert('Error', 'An error occurred while loading the model.');
      }
    };

    const requestPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to use this feature.'
        );
      }
    };

    initializeModel();
    requestPermissions();
  }, []);

  useEffect(() => {
    if (Camera.Constants) {
      setCameraType(Camera.Constants.Type.back);
    }
  }, [Camera.Constants]);

  const handleRecord = async () => {
    if (cameraRef.current) {
      try {
        if (recording) {
          await cameraRef.current.stopRecording();
          setRecording(false);
          if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
          }
        } else {
          setRecording(true);
          await cameraRef.current.recordAsync();
          const id = setInterval(processFrames, 1000);
          setIntervalId(id);
        }
      } catch (error) {
        console.error('Error handling record:', error);
        Alert.alert('Error', 'An error occurred while handling the recording.');
      }
    }
  };

  const processFrames = async () => {
    if (cameraRef.current && recording && model) {
      try {
        const { uri } = await cameraRef.current.takePictureAsync({
          base64: true,
        });
        const translatedText = await translateSignLanguage(uri);
        setText(translatedText);
      } catch (error) {
        console.error('Error processing frames:', error);
      }
    }
  };

  const translateSignLanguage = async (uri) => {
    if (!model) {
      console.error('Model is not loaded.');
      return 'Model not loaded';
    }
    try {
      const result = await predict(model, uri);
      return result.translatedText || 'No translation available';
    } catch (error) {
      console.error('Error translating sign language:', error);
      return 'Error translating text';
    }
  };

  if (hasPermission === null) {
    return (
      <Text style={styles.requestText}>Requesting camera permission...</Text>
    );
  }

  if (hasPermission === false) {
    return (
      <Text style={styles.requestText}>
        Camera permission is not granted. Cannot proceed.
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Sign to voice/text</Text>

      <View style={styles.square}>
        {cameraType && (
          <Camera ref={cameraRef} style={styles.camera} type={cameraType} />
        )}
        <View style={styles.recordButton}>
          <TouchableOpacity onPress={handleRecord}>
            <MaterialCommunityIcons
              name={recording ? 'stop-circle-outline' : 'circle-outline'}
              size={50}
              color={recording ? '#FF0000' : '#008000'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.square2}>
        <Text style={styles.text}>{text}</Text>
      </View>

      <View style={styles.container2}>
        <View
          style={[styles.iconContainer, { marginTop: responsiveHeight(40) }]}>
          <TouchableOpacity onPress={() => console.log('Home Icon Clicked')}>
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
    paddingTop: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 80,
    textAlign: 'center',
  },
  requestText: {
    marginTop: 500,
    color: 'white',
    textAlign: 'center',
  },
  square: {
    width: '90%',
    height: 200,
    backgroundColor: 'grey',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    borderRadius: 10,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
  },
  recordButton: {
    marginTop: 20,
  },
  text: {
    color: 'white',
    textAlign: 'center',
    padding: 12,
    fontSize: 24,
  },
  square2: {
    width: '90%',
    height: 300,
    backgroundColor: '#2F4D3F',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 10,
  },
  container2: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 50,
  },
});

export default SignToTextScreen;
