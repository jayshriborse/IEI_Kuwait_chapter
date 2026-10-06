import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';

import { colors, fonts } from '@/theme';
import { ChevronBackIcon } from '@/components/icons/chevron-back-icon';
import { PhotoFrameIcon } from '@/components/icons/photo-frame-icon';

export default function AlbumDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [openingPhoto, setOpeningPhoto] = useState<string | null>(null);
  const [gridPhotos, setGridPhotos] = useState<{ [key: number]: string }>({});

  const handlePickPhoto = (slotIndex?: number) => {
    Alert.alert(
      'Upload Photograph',
      'Choose an option to add photos to this album',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert(
                  'Permission needed',
                  'Camera permission is required to take photographs.'
                );
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                quality: 0.85,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                if (slotIndex === undefined) {
                  setOpeningPhoto(uri);
                } else {
                  setGridPhotos((prev) => ({ ...prev, [slotIndex]: uri }));
                }
              }
            } catch (err) {
              console.error('Camera error:', err);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert(
                  'Permission needed',
                  'Photo library permission is required to select photographs.'
                );
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.85,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                if (slotIndex === undefined) {
                  setOpeningPhoto(uri);
                } else {
                  setGridPhotos((prev) => ({ ...prev, [slotIndex]: uri }));
                }
              }
            } catch (err) {
              console.error('Gallery picker error:', err);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Main Wrapper */}
      <View style={styles.mainWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 14 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {/* Header Row with Back Button */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <ChevronBackIcon size={16} color={colors.primaryTerracotta} />
            </TouchableOpacity>

            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitle}>
                58th Engineers' Day Celebration
              </Text>
              <Text style={styles.headerSubtitle}>
                17 Nov 2025 · Park Inn, Mahboula
              </Text>
            </View>
          </View>

          {/* Opening Photograph Large Dropzone */}
          <TouchableOpacity
            style={[styles.openingDropzone, openingPhoto ? styles.openingDropzoneFilled : null]}
            activeOpacity={0.8}
            onPress={() => handlePickPhoto(undefined)}>
            {openingPhoto ? (
              <Image source={{ uri: openingPhoto }} style={styles.openingImage} />
            ) : (
              <>
                <PhotoFrameIcon size={34} color="#8A8075" />
                <Text style={styles.openingDropzoneTitle}>
                  Drop the opening photograph
                </Text>
                <Text style={styles.openingDropzoneLink}>
                  or <Text style={styles.underlineText}>browse files</Text>
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Tags & Count Row */}
          <View style={styles.metaRow}>
            <View style={styles.engineersPill}>
              <Text style={styles.engineersPillText}>Engineers' Day</Text>
            </View>
            <Text style={styles.photoCountText}>
              Nine of the album's photographs
            </Text>
          </View>

          {/* 3x3 Photo Upload Grid */}
          <View style={styles.photoGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.gridItemBox, gridPhotos[item] ? styles.gridItemBoxFilled : null]}
                activeOpacity={0.8}
                onPress={() => handlePickPhoto(item)}>
                {gridPhotos[item] ? (
                  <Image source={{ uri: gridPhotos[item] }} style={styles.gridImage} />
                ) : (
                  <>
                    <PhotoFrameIcon size={22} color="#8A8075" />
                    <Text style={styles.gridItemTitle}>Add</Text>
                    <Text style={styles.gridItemLink}>
                      or <Text style={styles.underlineText}>browse files</Text>
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.addPhotosButton}
              activeOpacity={0.88}
              onPress={() => handlePickPhoto(1)}>
              <Text style={styles.addPhotosButtonText}>Add photographs</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} activeOpacity={0.75}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBgLight,
  },
  mainWrapper: {
    flex: 1,
    backgroundColor: colors.screenBgLight,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.screenBgLight,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  backButton: {
    paddingRight: 14,
    paddingTop: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.displayBlack,
    fontSize: 17.5,
    color: colors.textDark,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#675F53',
    marginTop: 3,
  },
  openingDropzone: {
    backgroundColor: colors.eventCardBg,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#C0B6A5',
    borderStyle: 'dashed',
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    overflow: 'hidden',
  },
  openingDropzoneFilled: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderStyle: 'solid',
    height: 180,
  },
  openingImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  openingDropzoneTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: '#473F35',
    marginTop: 8,
    textAlign: 'center',
  },
  openingDropzoneLink: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    color: '#675F53',
    marginTop: 2,
  },
  underlineText: {
    textDecorationLine: 'underline',
    fontFamily: fonts.sansMedium,
    color: '#473F35',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  engineersPill: {
    backgroundColor: '#E1EECC',
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  engineersPillText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    color: '#505A3E',
  },
  photoCountText: {
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    color: '#675F53',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginBottom: 20,
  },
  gridItemBox: {
    width: '31.2%',
    height: 96,
    backgroundColor: colors.eventCardBg,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#C0B6A5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  gridItemBoxFilled: {
    paddingHorizontal: 0,
    borderStyle: 'solid',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  gridItemTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    color: '#473F35',
    marginTop: 3,
  },
  gridItemLink: {
    fontFamily: fonts.sansRegular,
    fontSize: 9.5,
    color: '#675F53',
    marginTop: 1,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  addPhotosButton: {
    flex: 1,
    backgroundColor: colors.primaryTerracotta,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotosButtonText: {
    fontFamily: fonts.displayBlack,
    fontSize: 14,
    color: colors.buttonTextLight,
    letterSpacing: -0.2,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: '#D4C8B8',
    backgroundColor: 'transparent',
    height: 48,
    paddingHorizontal: 22,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  shareButtonText: {
    fontFamily: fonts.displayBlack,
    fontSize: 14,
    color: colors.textDark,
  },
});
