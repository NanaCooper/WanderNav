// app/dashcam.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, AppState } from 'react-native';
import { Camera, CameraType, FlashMode, VideoQuality } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
// import * as Location from 'expo-location'; // We'll add this later for GPS
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Make sure @expo/vector-icons is installed
import { Stack, useRouter } from 'expo-router';

// --- IMPORTANT: Adjust this path to your THEME file ---
// If your 'constants' folder is at the root of your project (alongside 'app'):
import { THEME, addAlpha } from '../constants/theme';
// If your 'constants' folder is elsewhere, adjust accordingly. E.g., if it's in 'app/constants':
// import { THEME, addAlpha } from './constants/theme';

// Simple Debounce function (or use one from lodash: `npm install lodash` then `import { debounce } from 'lodash'`)
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}


export default function DashcamScreen() {
  const router = useRouter();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean | null>(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>(CameraType.back);
  const [flashMode, setFlashMode] = useState<FlashMode>(FlashMode.off);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(cameraStatus.status === 'granted');

        const audioStatus = await Camera.requestMicrophonePermissionsAsync();
        setHasAudioPermission(audioStatus.status === 'granted');

        const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
        setHasMediaLibraryPermission(mediaLibraryStatus.status === 'granted');

        if (cameraStatus.status !== 'granted' || audioStatus.status !== 'granted' || mediaLibraryStatus.status !== 'granted') {
          Alert.alert(
            "Permissions Required",
            "Camera, microphone, and media library access are needed for the dashcam feature. Please enable them in your device settings if you want to use this feature.",
            [{ text: "OK", onPress: () => router.canGoBack() ? router.back() : router.replace('/') }]
          );
        }
      } catch (error) {
          console.error("Error requesting permissions:", error);
          Alert.alert("Permission Error", "Could not request necessary permissions.");
          if (router.canGoBack()) router.back(); else router.replace('/');
      }
    };
    requestPermissions();
  }, [router]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // console.log('App has come to the foreground!');
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // console.log('App has gone to the background!');
        if (isRecording && cameraRef.current) {
          // console.log('Stopping recording because app went to background.');
          cameraRef.current.stopRecording();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      // Ensure recording is stopped if component unmounts while recording
      if (isRecording && cameraRef.current) {
        cameraRef.current.stopRecording();
      }
    };
  }, [isRecording]);


  const handleRecordButtonPress = async () => {
    if (!cameraRef.current) {
      console.warn("Camera ref not available");
      return;
    }

    if (isRecording) {
      // console.log("Stopping recording via button press...");
      cameraRef.current.stopRecording(); // This will trigger the promise resolution/rejection of recordAsync
    } else {
      if (hasCameraPermission && hasAudioPermission && hasMediaLibraryPermission) {
        setIsRecording(true);
        setVideoUri(null);
        // console.log("Starting recording...");
        try {
          const options = {
            quality: VideoQuality["720p"], // Standard HD
            // maxDuration: 60, // Example: Max 1 minute recording
          };

          const data = await cameraRef.current.recordAsync(options);
          // console.log('Recording finished. Video URI:', data.uri);
          setVideoUri(data.uri); // Store URI

          Alert.alert(
            "Recording Complete",
            "Video captured. What would you like to do?",
            [
              {
                text: "Save to Gallery",
                onPress: async () => {
                  if (!data.uri) return;
                  try {
                    await MediaLibrary.saveToLibraryAsync(data.uri);
                    Alert.alert("Saved!", "Video saved to your device gallery.");
                  } catch (e) {
                    console.error("Error saving to gallery:", e);
                    Alert.alert("Save Error", "Could not save video to gallery.");
                  }
                },
              },
              {
                text: "Use for Hazard (Later)",
                onPress: () => {
                  console.log("Video URI for linking to hazard:", data.uri);
                  // In a future step, we'll pass this URI or store it in context
                  Alert.alert("Video Ready", "This video can now be linked to a hazard report (feature coming soon).");
                }
              },
              { text: "Dismiss", style: "cancel" },
            ],
            { cancelable: false }
          );

        } catch (error: any) {
          console.error('Failed to record video:', error);
          Alert.alert("Recording Error", `Could not complete recording: ${error.message || 'Unknown error'}`);
        } finally {
          setIsRecording(false); // Ensure recording state is reset
        }
      } else {
        Alert.alert(
            "Permissions Missing",
            "Cannot record without camera, microphone, and media library permissions. Please grant them in settings.",
            [{text: "OK"}]
        );
      }
    }
  };

  const debouncedHandleRecord = debounce(handleRecordButtonPress, 500);

  const toggleCameraType = () => {
    if (isRecording) return; // Don't allow toggle during recording
    setCameraType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  const toggleFlash = () => {
    if (isRecording) return; // Don't allow toggle during recording
    if (cameraType === CameraType.front && flashMode !== FlashMode.off) {
        setFlashMode(FlashMode.off);
        return;
    }
    setFlashMode(current => {
      if (current === FlashMode.off) return FlashMode.on;
      if (current === FlashMode.on) return FlashMode.auto;
      return FlashMode.off;
    });
  };

  const getFlashIconName = (): keyof typeof MaterialCommunityIcons.glyphMap => {
    if (flashMode === FlashMode.on) return "flash";
    if (flashMode === FlashMode.auto) return "flash-auto";
    return "flash-off";
  };


  if (hasCameraPermission === null || hasAudioPermission === null || hasMediaLibraryPermission === null) {
    return <View style={styles.centeredMessageContainer}><Text style={styles.messageText}>Requesting permissions...</Text></View>;
  }
  if (!hasCameraPermission || !hasAudioPermission || !hasMediaLibraryPermission) {
    // The useEffect for permissions already handles alerting and navigation.
    // This is a fallback or for initial render before useEffect runs.
    return (
      <View style={styles.centeredMessageContainer}>
        <MaterialCommunityIcons name="camera-off-outline" size={60} color={THEME.TEXT_TERTIARY} style={styles.messageIcon}/>
        <Text style={styles.messageTitle}>Permissions Required</Text>
        <Text style={styles.messageText}>
          Camera, microphone, and media library access are required for the dashcam.
          Please enable them in your device settings.
        </Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
            <Text style={styles.actionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Camera
        ref={ref => { cameraRef.current = ref; }}
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        videoStabilizationMode={Camera.Constants.VideoStabilization.auto}
        // audio={true} // Audio is enabled by default if microphone permission is granted
        // onMountError={(error) => { console.error("Camera mount error:", error); Alert.alert("Camera Error", "Could not initialize camera.")}}
      >
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.controlButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')} disabled={isRecording}>
            <Ionicons name="arrow-back" size={28} color={isRecording ? THEME.TEXT_TERTIARY : THEME.TEXT_ON_DARK_BACKGROUND} />
          </TouchableOpacity>
          {isRecording && (
            <View style={styles.recordingIndicatorContainer}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingIndicatorText}>REC</Text>
            </View>
          )}
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash} disabled={isRecording || cameraType === CameraType.front}>
             <MaterialCommunityIcons
                name={getFlashIconName()}
                size={24}
                color={(isRecording || cameraType === CameraType.front) ? THEME.TEXT_TERTIARY : THEME.TEXT_ON_DARK_BACKGROUND} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType} disabled={isRecording}>
            <Ionicons
                name="camera-reverse-outline"
                size={32}
                color={isRecording ? THEME.TEXT_TERTIARY : THEME.TEXT_ON_DARK_BACKGROUND} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.recordButtonOuter}
            onPress={debouncedHandleRecord}
            activeOpacity={0.7}
          >
            <View style={[styles.recordButtonInner, isRecording && styles.recordButtonInnerRecording]} />
          </TouchableOpacity>

          {/* Placeholder for gallery or settings - keeps spacing even */}
          <View style={{ width: (32 + 20), height: (32 + 20) }} />
        </View>
      </Camera>
    </View>
  );
}

// --- Styles ---
// Make sure your THEME object has these properties:
// THEME.BACKGROUND_PRIMARY, THEME.TEXT_TERTIARY, THEME.TEXT_PRIMARY, THEME.ACCENT_COLOR, THEME.TEXT_ON_ACCENT_COLOR,
// THEME.BACKGROUND_BLACK, THEME.TEXT_ON_DARK_BACKGROUND, THEME.ERROR_COLOR,
// THEME.BORDER_RADIUS_SMALL, THEME.BORDER_RADIUS_MEDIUM, THEME.BORDER_RADIUS_CIRCLE
// addAlpha function from your theme constants

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.BACKGROUND_BLACK || 'black', // Fallback
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: THEME.BACKGROUND_PRIMARY,
  },
  messageIcon: {
    marginBottom: 25,
    opacity: 0.8,
  },
  messageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
    color: THEME.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: THEME.ACCENT_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: THEME.BORDER_RADIUS_MEDIUM,
  },
  actionButtonText: {
    color: THEME.TEXT_ON_ACCENT_COLOR || 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 30, // Adjust for status bar / notches
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: addAlpha(THEME.BACKGROUND_BLACK || '#000000', 0.3),
  },
  recordingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: addAlpha(THEME.BACKGROUND_BLACK || '#000000', 0.5),
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.BORDER_RADIUS_SMALL,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.ERROR_COLOR || 'red',
    marginRight: 8,
  },
  recordingIndicatorText: {
    color: THEME.TEXT_ON_DARK_BACKGROUND || 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    paddingTop: 15,
    paddingHorizontal: 20,
    backgroundColor: addAlpha(THEME.BACKGROUND_BLACK || '#000000', 0.3),
  },
  controlButton: {
    padding: 10,
    borderRadius: THEME.BORDER_RADIUS_CIRCLE,
    // backgroundColor: addAlpha(THEME.BACKGROUND_BLACK || '#000000', 0.2), // Optional BG for buttons
  },
  recordButtonOuter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: addAlpha(THEME.TEXT_ON_DARK_BACKGROUND || '#FFFFFF', 0.2),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: THEME.TEXT_ON_DARK_BACKGROUND || 'white',
  },
  recordButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: THEME.ERROR_COLOR || 'red',
  },
  recordButtonInnerRecording: {
    width: 30, // Smaller square when recording
    height: 30,
    borderRadius: THEME.BORDER_RADIUS_SMALL || 6,
    backgroundColor: THEME.ERROR_COLOR || 'red',
  },
});