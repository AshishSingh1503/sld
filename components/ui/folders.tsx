import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
WebBrowser.maybeCompleteAuthSession();
import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Google from 'expo-google-app-auth';

export type Folder = {
  id: number;
  name: string;
  color: string;
  lastModified: string;
  icon: string;
  notes: { id: number; name: string; color: string; content: string }[];
  files?: { uri: string; name: string; type: 'image' | 'pdf' }[];
  driveId?: string; // Google Drive folder ID
  lastSynced?: string;
};

interface NotebookFoldersProps {
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  onOpenFolder?: (folder: Folder) => void;
  onCreateNote?: () => void;
}

// Google Drive Service Class
class GoogleDriveService {
  private accessToken: string = '';
  private userEmail: string = ''; // This can be useful for creating unique root folders

  setAccessToken(token: string, email: string) {
    this.accessToken = token;
    this.userEmail = email;
  }

  getUserEmail() {
    return this.userEmail;
  }

  async createFolder(name: string, parentId?: string): Promise<string> {
    const metadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId && { parents: [parentId] })
    };

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to create folder');
    }
    
    return result.id;
  }

  async createTextFile(content: string, fileName: string, parentId?: string): Promise<string> {
    const metadata = {
      name: fileName,
      ...(parentId && { parents: [parentId] })
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    const body = 
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/plain\r\n\r\n' +
      content +
      close_delim;

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body: body,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to create file');
    }
    
    return result.id;
  }

  async uploadFile(fileUri: string, fileName: string, parentId?: string): Promise<string> {
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const metadata = {
      name: fileName,
      ...(parentId && { parents: [parentId] })
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    const body = 
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/octet-stream\r\n' +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      fileContent +
      close_delim;

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body: body,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to upload file');
    }
    
    return result.id;
  }

  async getRootFolderId(): Promise<string> {
    const folderName = `NotebookApp_${this.userEmail.replace('@', '_').replace(/\./g, '_')}`;
    
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    const searchResult = await searchResponse.json();
    
    if (searchResult.files && searchResult.files.length > 0) {
      return searchResult.files[0].id;
    }

    return await this.createFolder(folderName);
  }
}

const NotebookFolders = ({ folders, setFolders, onOpenFolder, onCreateNote }: NotebookFoldersProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');

  const [editFolderModal, setEditFolderModal] = useState<{ open: boolean, folder: Folder | null }>({ open: false, folder: null });
  const [editFolderName, setEditFolderName] = useState('');

  const [folderMenu, setFolderMenu] = useState<{ open: boolean, folder: Folder | null }>({ open: false, folder: null });

  // Google Drive states
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [driveService] = useState(new GoogleDriveService());
  const [userInfo, setUserInfo] = useState<{ email: string; name: string } | null>(null);

  const folderColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#FFB6C1', '#98FB98',
    '#F0E68C', '#87CEEB', '#DEB887', '#F5DEB3'
  ];

  const folderIcons = [
    'folder-outline', 'today-outline', 'book-outline', 'medical-outline', 'trending-up-outline',
    'chatbubble-outline', 'mic-outline', 'school-outline', 'heart-outline',
    'star-outline', 'briefcase-outline', 'home-outline'
  ];

  // Discovery document for Google OAuth
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  };

  // Explicitly define client IDs for clarity and platform-specific handling
  const webClientId = Constants.expoConfig?.extra?.googleWebClientId;
  const androidClientId = Constants.expoConfig?.extra?.googleAndroidClientId;
  const iosClientId = Constants.expoConfig?.extra?.googleWebClientId; // iOS often uses the Web Client ID

  const [request, response, promptAsync] = useAuthRequest(
      {
        // When using the Expo Auth Proxy, we must use the Web Client ID for all platforms.
        clientId: webClientId,
        scopes: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/drive.file'],
        // Let makeRedirectUri determine the best redirect URI based on environment.
        // This will generate exp://... for Expo Go and com.anonymous.digitalinkrecognitionapp://... for standalone.
        // For standalone apps, `useProxy: true` is essential. It uses Expo's auth proxy
        // to securely handle the redirect and avoids custom scheme issues with Google's OAuth.
        // The generated URI will be like `https://auth.expo.io/@your-username/your-app-slug`.
        redirectUri: makeRedirectUri({
          native: `https://auth.expo.io/@${Constants.expoConfig?.owner}/${Constants.expoConfig?.slug}`,
        }),
  
        // Add PKCE for enhanced security
        usePKCE: true,
      },
      discovery
    );

  useEffect(() => {
    checkSignInStatus();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
    
      const redirectUri = makeRedirectUri({
        native: `https://auth.expo.io/@${Constants.expoConfig?.owner}/${Constants.expoConfig?.slug}`,
      });

      
      const params = new URLSearchParams();
      params.append('code', code);
      params.append('client_id', request?.clientId ?? '');
      params.append('redirect_uri', redirectUri);
      params.append('grant_type', 'authorization_code');
      params.append('code_verifier', request?.codeVerifier || '');

      // Exchange the authorization code for an access token
      fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })
      .then(res => res.json())
      .then(tokenResponse => {
        if (tokenResponse.access_token) {
          handleAuthSuccess(tokenResponse.access_token);
        } else {
          throw new Error('Failed to retrieve access token.');
        }
      }).catch(error => Alert.alert('Sign In Error', error.message || 'Failed to exchange authorization code.'));
    } else if (response?.type === 'error') {
      Alert.alert('Sign In Error', response.error?.message || 'Failed to sign in with Google Drive');
    }
  }, [response]);

  const checkSignInStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('google_access_token');
      const storedUserInfo = await AsyncStorage.getItem('user_info');
      
      if (storedToken && storedUserInfo) {
        const userInfo = JSON.parse(storedUserInfo);
        driveService.setAccessToken(storedToken, userInfo.email);
        setIsSignedIn(true);
        setUserInfo(userInfo);
      }
    } catch (error) {
      console.error('Error checking sign-in status:', error);
    }
  };

  const handleAuthSuccess = async (accessToken: string) => {
    try {
      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const user = await userResponse.json();
      
      const userInfo = {
        email: user.email,
        name: user.name,
        photo: user.picture
      };
      
      await AsyncStorage.setItem('google_access_token', accessToken);
      await AsyncStorage.setItem('user_info', JSON.stringify(userInfo));
      
      driveService.setAccessToken(accessToken, user.email);
      setIsSignedIn(true);
      setUserInfo(userInfo);
      
      Alert.alert(
        'Connected!', 
        `Signed in as ${user.name}\nYour notebooks will be synced to your Google Drive.`
      );
    } catch (error) {
      console.error('Error getting user info:', error);
      Alert.alert('Sign In Error', 'Failed to get user information');
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (!Constants.expoConfig?.extra?.googleWebClientId) {
        Alert.alert('Configuration Error', 'Google Client ID not found. Please check your app.json configuration.');
        return;
      }

      console.log('Starting Google Sign In...');
      const actualRedirectUri = makeRedirectUri({
        native: `https://auth.expo.io/@${Constants.expoConfig?.owner}/${Constants.expoConfig?.slug}`,
      });
      const actualWebClientId = Constants.expoConfig?.extra?.googleWebClientId;
      const actualAndroidClientId = Constants.expoConfig?.extra?.googleAndroidClientId;
      console.log('--- Google Sign-In Debug Info ---');
      console.log('Redirect URI being used:', actualRedirectUri);
      console.log('Client ID (Web/iOS):', actualWebClientId);
      console.log('Client ID (Android):', actualAndroidClientId);
      const result = await promptAsync();
      console.log('Sign in result:', result);
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Sign In Error', 'Failed to sign in with Google Drive');
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove(['google_access_token', 'user_info']);
      setIsSignedIn(false);
      setUserInfo(null);
      Alert.alert('Signed Out', 'Google Drive sync disabled');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const syncToGoogleDrive = async () => {
    if (!isSignedIn || !userInfo) {
      Alert.alert('Not Connected', 'Please connect to Google Drive first');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      const rootFolderId = await driveService.getRootFolderId();
      let syncedCount = 0;

      for (const folder of folders) {
        if (folder.name === 'Recent Notes') continue;

        let folderDriveId = folder.driveId;
        
        if (!folderDriveId) {
          folderDriveId = await driveService.createFolder(folder.name, rootFolderId);
          syncedCount++;
        }

        // Update folder with Drive ID and sync timestamp
        setFolders(prevFolders => 
          prevFolders.map(f => 
            f.id === folder.id 
              ? { ...f, driveId: folderDriveId, lastSynced: new Date().toLocaleString() }
              : f
          )
        );

        // Sync notes as text files
        if (folder.notes && folder.notes.length > 0) {
          for (let i = 0; i < folder.notes.length; i++) {
            const note = folder.notes[i];
            const fileName = `Note_${i + 1}_${Date.now()}.txt`;
            await driveService.createTextFile(note.content, fileName, folderDriveId);
            syncedCount++;
          }
        }

        // Sync folder-level files
        if (folder.files && folder.files.length > 0) {
          for (const file of folder.files) {
            await driveService.uploadFile(file.uri, file.name, folderDriveId);
            syncedCount++;
          }
        }
      }

      setSyncStatus('success');
      Alert.alert(
        'Sync Complete!', 
        `${syncedCount} items synced to your Google Drive (${userInfo.email})`
      );
      
      setTimeout(() => setSyncStatus('idle'), 3000);
      
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      Alert.alert('Sync Error', 'Failed to sync to Google Drive. Please try again.');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const createFolder = async () => {
    if (newFolderName.trim()) {
      const newFolder: Folder = {
        id: Date.now(),
        name: newFolderName,
        color: selectedColor,
        lastModified: 'Just now',
        icon: 'folder-outline',
        notes: [],
      };
      
      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setShowCreateModal(false);

      // Auto-sync if connected to Google Drive
      if (isSignedIn) {
        setTimeout(() => {
          syncToGoogleDrive();
        }, 500);
      }
    }
  };

  const deleteFolder = (folderId: number) => {
    Alert.alert(
      'Delete Folder',
      'Are you sure you want to delete this folder?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setFolders(folders => folders.filter(f => f.id !== folderId))
        }
      ]
    );
  };

  const handleEditFolder = (folder: Folder) => {
    setEditFolderName(folder.name);
    setEditFolderModal({ open: true, folder });
  };

  const handleSaveEditFolder = () => {
    if (editFolderModal.folder && editFolderName.trim()) {
      setFolders(folders => folders.map(f => f.id === editFolderModal.folder!.id ? { ...f, name: editFolderName } : f));
      setEditFolderModal({ open: false, folder: null });
      
      // Auto-sync if connected
      if (isSignedIn) {
        setTimeout(() => {
          syncToGoogleDrive();
        }, 500);
      }
    }
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <ActivityIndicator size="small" color="#FFF" />;
      case 'success':
        return <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />;
      case 'error':
        return <Ionicons name="warning" size={20} color="#FF3B30" />;
      default:
        return <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />;
    }
  };

  // Sort folders so 'Recent Notes' is always first
  const sortedFolders = [
    ...folders.filter(f => f.name === 'Recent Notes'),
    ...folders.filter(f => f.name !== 'Recent Notes')
  ];

  const FolderCard = ({ folder }: { folder: Folder }) => (
    <TouchableOpacity 
      style={[styles.folderCard, { backgroundColor: folder.color, borderLeftWidth: 0 }]}
      activeOpacity={0.7}
      onPress={() => onOpenFolder && onOpenFolder(folder)}
    >
      <View style={styles.folderHeader}>
        <View style={styles.folderIconNameRow}>
          <View style={[styles.folderIcon, { backgroundColor: '#FFF' }]}> 
            <Ionicons name={folder.icon as any} size={35} color={folder.color} />
          </View>
          <View style={styles.folderNameContainer}>
            <Text style={styles.folderName} numberOfLines={1}>{folder.name}</Text>
            {folder.lastSynced && (
              <View style={styles.syncIndicator}>
                <Ionicons name="cloud-done" size={12} color="#4CAF50" />
                <Text style={styles.syncText}>Synced</Text>
              </View>
            )}
          </View>
        </View>
        {/* Only show menu for non-Recent Notes folders */}
        {folder.name !== 'Recent Notes' && (
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={(e) => {
              e.stopPropagation();
              setFolderMenu({ open: true, folder });
            }}
          >
            <Ionicons name="ellipsis-vertical" size={26} color="#000000" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.folderContent}>
        <View style={styles.folderMeta}>
          <Text style={styles.lastModified}>{folder.lastModified}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Google Drive integration */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Notebooks</Text>
          {userInfo && (
            <Text style={styles.userEmail}>{userInfo.email}</Text>
          )}
        </View>
        <View style={styles.headerButtons}>
          {/* Google Drive Sign In/Out Button */}
          <TouchableOpacity 
            style={[styles.driveButton, isSignedIn ? styles.signedInButton : styles.signOutButton]}
            onPress={isSignedIn ? signOut : signInWithGoogle}
          >
            <Ionicons 
              name="logo-google" 
              size={16} 
              color={isSignedIn ? "#4CAF50" : "#FFF"} 
            />
          </TouchableOpacity>
          
          {/* Sync Button */}
          <TouchableOpacity 
            style={[styles.syncButton, !isSignedIn && styles.disabledButton]}
            onPress={syncToGoogleDrive}
            disabled={!isSignedIn || isSyncing}
          >
            {getSyncStatusIcon()}
          </TouchableOpacity>
          
          {/* Add Folder Button */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Google Drive Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Ionicons 
            name={isSignedIn ? "cloud-done" : "cloud-offline"} 
            size={16} 
            color={isSignedIn ? "#4CAF50" : "#999"} 
          />
          <Text style={[styles.statusText, { color: isSignedIn ? "#4CAF50" : "#999" }]}>
            {isSignedIn ? `Connected to Google Drive` : "Not connected to Google Drive"}
          </Text>
        </View>
        {isSyncing && (
          <View style={styles.statusItem}>
            <ActivityIndicator size="small" color="#FEAB2F" />
            <Text style={styles.statusText}>Syncing...</Text>
          </View>
        )}
      </View>
      
      {/* Folders Grid */}
      <ScrollView 
        style={styles.foldersContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.foldersGrid}
      >
        {sortedFolders.map((folder) => (
          <FolderCard key={folder.id} folder={folder} />
        ))}
      </ScrollView>

      {/* Create Folder Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Folder</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Folder name"
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus={true}
            />

            <Text style={styles.sectionTitle}>Choose Color:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.colorPicker}
              contentContainerStyle={styles.colorPickerContent}
            >
              {folderColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewFolderName('');
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.modalButton, styles.modalConfirmButton]} onPress={createFolder}>
                <Text style={styles.modalConfirmButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Folder Modal */}
      {editFolderModal.open && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Folder</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Folder name"
                value={editFolderName}
                onChangeText={setEditFolderName}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setEditFolderModal({ open: false, folder: null })}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.modalConfirmButton]} onPress={handleSaveEditFolder}>
                  <Text style={styles.modalConfirmButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Folder Menu Modal */}
      {folderMenu.open && folderMenu.folder && folderMenu.folder.name !== 'Recent Notes' && (
        <Modal visible transparent animationType="fade">
          <TouchableOpacity 
            style={styles.contextMenuOverlay} 
            onPress={() => setFolderMenu({ open: false, folder: null })}
            activeOpacity={1}
          >
            <View style={styles.contextMenuContainer}>
              <TouchableOpacity 
                style={styles.contextMenuItem} 
                onPress={() => { 
                  setFolderMenu({ open: false, folder: null }); 
                  if (folderMenu.folder) handleEditFolder(folderMenu.folder); 
                }}
              >
                <Ionicons name="create-outline" size={18} color="#007AFF" style={styles.contextMenuIcon} />
                <Text style={styles.contextMenuText}>Edit</Text>
              </TouchableOpacity>
              <View style={styles.contextMenuDivider} />
              <TouchableOpacity 
                style={styles.contextMenuItem} 
                onPress={() => { 
                  setFolderMenu({ open: false, folder: null }); 
                  if (folderMenu.folder) deleteFolder(folderMenu.folder.id); 
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#FF3B30" style={styles.contextMenuIcon} />
                <Text style={[styles.contextMenuText, { color: '#FF3B30' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 25,
    backgroundColor: '#FEAB2F',
    borderRadius: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  driveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  signedInButton: {
    backgroundColor: '#FFF',
    borderColor: '#4CAF50',
  },
  signOutButton: {
    backgroundColor: '#DB4437',
    borderColor: '#DB4437',
  },
  syncButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBar: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  foldersContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  foldersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  folderCard: {
    width: '48%',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  folderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  folderIconNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  folderIcon: {
    width: 56,
    height: 56,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderNameContainer: {
    flex: 1,
  },
  menuButton: {
    padding: 4,
  },
  folderContent: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  syncText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '500',
  },
  folderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastModified: {
    fontSize: 11,
    color: '#999',
  },
  createNoteButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 30,
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createNoteButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
  },
  colorPicker: {
    marginBottom: 20,
  },
  colorPickerContent: {
    paddingVertical: 5,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalCancelButton: {
    backgroundColor: '#F0F0F0',
  },
  modalConfirmButton: {
    backgroundColor: '#4CAF50',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  modalConfirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  contextMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenuContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 8,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  contextMenuIcon: {
    marginRight: 12,
  },
  contextMenuText: {
    fontSize: 16,
    color: '#333',
  },
  contextMenuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
});

export default NotebookFolders;