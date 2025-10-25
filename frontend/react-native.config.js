module.exports = {
  dependencies: {
    '@react-native-voice/voice': {
      platforms: {
        android: {
          sourceDir: '../node_modules/@react-native-voice/voice/android',
          packageImportPath: 'import io.invertase.react.native.voice.VoicePackage;',
        },
      },
    },
  },
};