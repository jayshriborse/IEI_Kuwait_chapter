import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { colors, fonts } from '@/theme';
import { ChevronBackIcon } from '@/components/icons/chevron-back-icon';
import {
  initOrGetDraftApplication,
  uploadApplicationDocument,
  deleteApplicationDocument,
  submitApplicationWithDocuments,
  RequiredDocumentType,
} from '@/data/membership-documents';

const DISCIPLINES = [
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Electronics & Telecom',
  'Computer Science & IT',
  'Environmental Engineering',
  'Instrumentation & Control',
  'Petroleum / Oil & Gas',
];

interface DocumentBoxConfig {
  type: RequiredDocumentType;
  title: string;
  defaultSub: string;
}

const DOCUMENT_CONFIGS: DocumentBoxConfig[] = [
  {
    type: 'DEGREE_CERTIFICATE',
    title: 'Degree Certificate',
    defaultSub: 'Accredited B.E. / B.Tech / Equivalent',
  },
  {
    type: 'PASSPORT_COPY',
    title: 'Passport Copy',
    defaultSub: 'Valid passport with residence visa',
  },
  {
    type: 'CIVIL_ID',
    title: 'Civil ID Copy',
    defaultSub: 'Kuwait Civil ID (front & back)',
  },
  {
    type: 'PHOTOGRAPH',
    title: 'Passport Size Photograph',
    defaultSub: 'White background photograph',
  },
];

interface DocState {
  status: 'NOT_UPLOADED' | 'UPLOADING' | 'UPLOADED' | 'FAILED';
  fileName?: string;
  fileSize?: number;
  error?: string;
}

export default function ApplyMembershipScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [applicantName, setApplicantName] = useState('');
  const [applicantMobile, setApplicantMobile] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [discipline, setDiscipline] = useState('Civil Engineering');
  const [employer, setEmployer] = useState('');
  const [designation, setDesignation] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [qualification, setQualification] = useState('');
  const [referredBy, setReferredBy] = useState('');

  // Draft session info
  const [applicationId, setApplicationId] = useState<string>('');
  const [applicantToken, setApplicantToken] = useState<string>('');

  // 4 Document States — defaults to NOT_UPLOADED (no tick until real upload)
  const [docs, setDocs] = useState<Record<RequiredDocumentType, DocState>>({
    DEGREE_CERTIFICATE: { status: 'NOT_UPLOADED' },
    PASSPORT_COPY: { status: 'NOT_UPLOADED' },
    CIVIL_ID: { status: 'NOT_UPLOADED' },
    PHOTOGRAPH: { status: 'NOT_UPLOADED' },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Initialize or restore active application draft from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadActiveDraft() {
      try {
        const session = await initOrGetDraftApplication();
        if (session && isMounted) {
          setApplicationId(session.applicationId);
          setApplicantToken(session.applicantToken);

          if (session.documents && session.documents.length > 0) {
            setDocs((prev) => {
              const updated = { ...prev };
              session.documents.forEach((d) => {
                if (updated[d.documentType]) {
                  updated[d.documentType] = {
                    status: 'UPLOADED',
                    fileName: d.originalFileName,
                    fileSize: d.fileSize,
                  };
                }
              });
              return updated;
            });
          }
        }
      } catch (err) {
        console.warn('Failed to initialize draft session:', err);
      }
    }
    loadActiveDraft();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /**
   * Performs the upload of picked file to backend
   */
  const processUpload = async (
    docType: RequiredDocumentType,
    fileUri: string,
    fileName: string,
    mimeType?: string,
  ) => {
    let currentAppId = applicationId;
    let currentToken = applicantToken;

    if (!currentAppId) {
      const draft = await initOrGetDraftApplication({
        fullName: applicantName,
        mobile: applicantMobile,
        email: applicantEmail,
      });
      if (draft) {
        currentAppId = draft.applicationId;
        currentToken = draft.applicantToken;
        setApplicationId(draft.applicationId);
        setApplicantToken(draft.applicantToken);
      }
    }

    if (!currentAppId) {
      Alert.alert('Upload Error', 'Could not establish an application draft session. Please check your network.');
      return;
    }

    // Set uploading state
    setDocs((prev) => ({
      ...prev,
      [docType]: { status: 'UPLOADING' },
    }));

    try {
      const res = await uploadApplicationDocument({
        applicationId: currentAppId,
        applicantToken: currentToken,
        documentType: docType,
        fileUri,
        fileName,
        mimeType,
      });

      if (res.success && res.document) {
        setDocs((prev) => ({
          ...prev,
          [docType]: {
            status: 'UPLOADED',
            fileName: res.document?.originalFileName || fileName,
            fileSize: res.document?.fileSize,
          },
        }));
      } else {
        setDocs((prev) => ({
          ...prev,
          [docType]: {
            status: 'FAILED',
            error: res.error || 'Upload failed',
          },
        }));
        Alert.alert('Upload Failed', res.error || 'Could not upload document. Please try again.');
      }
    } catch (err: any) {
      setDocs((prev) => ({
        ...prev,
        [docType]: {
          status: 'FAILED',
          error: err.message || 'Upload failed',
        },
      }));
      Alert.alert('Error', err.message || 'Network error during upload.');
    }
  };

  /**
   * Opens file picker, gallery, or camera based on document type
   */
  const handleSelectDocument = (docType: RequiredDocumentType, docTitle: string) => {
    // Double-tap protection
    if (docs[docType].status === 'UPLOADING') return;

    if (docType === 'PHOTOGRAPH') {
      Alert.alert('Passport Size Photograph', 'Select an image for your chapter membership card', [
        {
          text: 'Take Photo with Camera',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Needed', 'Camera access is required to take a photograph.');
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                quality: 0.85,
                allowsEditing: true,
                aspect: [1, 1],
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const fileName = asset.fileName || `photo_${Date.now()}.jpg`;
                processUpload(docType, asset.uri, fileName, asset.mimeType || 'image/jpeg');
              }
            } catch (err) {
              console.warn('Camera error:', err);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Needed', 'Gallery access is required to choose a photograph.');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.85,
                allowsEditing: true,
                aspect: [1, 1],
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const fileName = asset.fileName || `photo_${Date.now()}.jpg`;
                processUpload(docType, asset.uri, fileName, asset.mimeType || 'image/jpeg');
              }
            } catch (err) {
              console.warn('Gallery error:', err);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      // Document types (Degree, Passport, Civil ID): can be PDF or Image
      Alert.alert(docTitle, 'Select how you want to upload this document', [
        {
          text: 'Upload PDF / Document',
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const fileName = asset.name || `${docType.toLowerCase()}_file.pdf`;
                processUpload(docType, asset.uri, fileName, asset.mimeType || 'application/pdf');
              }
            } catch (err) {
              console.warn('Document picker error:', err);
            }
          },
        },
        {
          text: 'Choose Photo from Gallery',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Needed', 'Gallery access is required to choose a photo.');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.85,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const fileName = asset.fileName || `${docType.toLowerCase()}_image.jpg`;
                processUpload(docType, asset.uri, fileName, asset.mimeType || 'image/jpeg');
              }
            } catch (err) {
              console.warn('Gallery error:', err);
            }
          },
        },
        {
          text: 'Take Photo with Camera',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Needed', 'Camera access is required to take a photo.');
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                quality: 0.85,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const fileName = asset.fileName || `${docType.toLowerCase()}_camera.jpg`;
                processUpload(docType, asset.uri, fileName, asset.mimeType || 'image/jpeg');
              }
            } catch (err) {
              console.warn('Camera error:', err);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  /**
   * Removes an uploaded document after confirmation
   */
  const handleRemoveDocument = (docType: RequiredDocumentType, docTitle: string) => {
    Alert.alert('Remove Document', `Are you sure you want to remove the uploaded ${docTitle}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          if (applicationId) {
            await deleteApplicationDocument({
              applicationId,
              applicantToken,
              documentType: docType,
            });
          }
          setDocs((prev) => ({
            ...prev,
            [docType]: { status: 'NOT_UPLOADED' },
          }));
        },
      },
    ]);
  };

  /**
   * Submits application — backend enforces all 4 documents exist
   */
  const handleSubmit = async () => {
    if (!applicantName.trim()) {
      Alert.alert('Missing Field', 'Please enter your Full Name.');
      return;
    }
    if (!applicantMobile.trim()) {
      Alert.alert('Missing Field', 'Please enter your Mobile Number.');
      return;
    }
    if (!applicantEmail.trim() || !applicantEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid Email Address.');
      return;
    }
    if (!employer.trim()) {
      Alert.alert('Missing Field', 'Please enter your Employer / Company.');
      return;
    }
    if (!designation.trim()) {
      Alert.alert('Missing Field', 'Please enter your Designation / Job Title.');
      return;
    }
    if (!qualification.trim()) {
      Alert.alert('Missing Field', 'Please enter your Engineering Qualification.');
      return;
    }

    // Verify all 4 documents are uploaded
    const missingDocs = DOCUMENT_CONFIGS.filter((cfg) => docs[cfg.type].status !== 'UPLOADED');
    if (missingDocs.length > 0) {
      const missingList = missingDocs.map((m, i) => `${i + 1}. ${m.title}`);
      Alert.alert(
        'Mandatory Documents Required',
        `Please upload all 4 required documents before submitting your application:\n\n${missingList.join('\n')}`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const expNum = parseInt(experienceYears, 10);
      const res = await submitApplicationWithDocuments({
        applicationId,
        applicantToken,
        applicantName: applicantName.trim(),
        applicantMobile: applicantMobile.trim(),
        applicantEmail: applicantEmail.trim(),
        discipline,
        employer: employer.trim(),
        designation: designation.trim(),
        experienceYears: isNaN(expNum) ? 0 : expNum,
        qualification: qualification.trim(),
        referredBy: referredBy.trim() || undefined,
      });

      if (res.success && res.data) {
        setSubmittedRef(res.data.applicationId || 'APP-' + Math.floor(10000 + Math.random() * 90000));
      } else {
        Alert.alert('Submission Issue', res.error || 'Could not submit application. Please check your network.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedRef) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}>
        <StatusBar style="dark" />
        <View style={styles.successCard}>
          <View style={styles.successIconCircle}>
            <Text style={styles.successCheckmark}>✓</Text>
          </View>
          <Text style={styles.successKicker}>APPLICATION RECEIVED</Text>
          <Text style={styles.successTitle}>Application Submitted</Text>
          <Text style={styles.successRef}>Ref: {submittedRef}</Text>
          <Text style={styles.successBody}>
            Your membership application and all 4 mandatory documents have been registered with the IEI Kuwait Chapter. The Honorary Secretary and Scrutiny Committee will review your engineering credentials.
          </Text>

          <View style={styles.nextStepsCard}>
            <Text style={styles.nextStepsTitle}>WHAT HAPPENS NEXT</Text>
            <Text style={styles.nextStepsItem}>1. Document Scrutiny by Chapter Executive Committee</Text>
            <Text style={styles.nextStepsItem}>2. Forwarding to IEI Headquarters, Kolkata for Election</Text>
            <Text style={styles.nextStepsItem}>3. Grant of Corporate Member Grade (FIE / MIE / AMIE)</Text>
          </View>

          <TouchableOpacity
            style={styles.doneButton}
            activeOpacity={0.85}
            onPress={() => router.replace('/guest')}>
            <Text style={styles.doneButtonText}>Back to Guest Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.mainWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top, 16) + 8, paddingBottom: 110 },
          ]}
          showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}>
              <ChevronBackIcon size={20} color="#C67139" />
            </TouchableOpacity>

            <View style={styles.headerTextCol}>
              <Text style={styles.headerKicker}>IEI KUWAIT CHAPTER</Text>
              <Text style={styles.headerTitle}>Apply for Membership</Text>
            </View>
          </View>

          <Text style={styles.introSubtitle}>
            Corporate membership is open to all qualified engineers residing and practicing in Kuwait.
          </Text>

          {/* Form Sections */}
          <View style={styles.formGroup}>
            <Text style={styles.sectionHeading}>APPLICANT CONTACT</Text>

            <Text style={styles.fieldLabel}>Full Name (as per Passport / Degree)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Eng. Prakash Nair"
              placeholderTextColor="#A89F91"
              value={applicantName}
              onChangeText={setApplicantName}
            />

            <Text style={styles.fieldLabel}>Mobile Number (Kuwait)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 96598765432"
              placeholderTextColor="#A89F91"
              keyboardType="phone-pad"
              value={applicantMobile}
              onChangeText={setApplicantMobile}
            />

            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. prakash.nair@example.com"
              placeholderTextColor="#A89F91"
              keyboardType="email-address"
              autoCapitalize="none"
              value={applicantEmail}
              onChangeText={setApplicantEmail}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.sectionHeading}>PROFESSIONAL DETAILS</Text>

            <Text style={styles.fieldLabel}>Discipline</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {DISCIPLINES.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.discChip, discipline === d && styles.discChipActive]}
                  onPress={() => setDiscipline(d)}>
                  <Text style={[styles.discChipText, discipline === d && styles.discChipTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Employer / Company in Kuwait</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. HEISCO / KOC / KEO / KNPC"
              placeholderTextColor="#A89F91"
              value={employer}
              onChangeText={setEmployer}
            />

            <Text style={styles.fieldLabel}>Designation / Role</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Senior Mechanical Engineer"
              placeholderTextColor="#A89F91"
              value={designation}
              onChangeText={setDesignation}
            />

            <Text style={styles.fieldLabel}>Experience (Years)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 7"
              placeholderTextColor="#A89F91"
              keyboardType="numeric"
              value={experienceYears}
              onChangeText={setExperienceYears}
            />

            <Text style={styles.fieldLabel}>Degree Qualification & Year</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. B.E. Mechanical Engineering, 2018"
              placeholderTextColor="#A89F91"
              value={qualification}
              onChangeText={setQualification}
            />

            <Text style={styles.fieldLabel}>Referred by (Proposing IEI Member - Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Engr. Tijo Thomas"
              placeholderTextColor="#A89F91"
              value={referredBy}
              onChangeText={setReferredBy}
            />
          </View>

          {/* Real Functional Document Upload Section (Preserving the 4 exact boxes) */}
          <View style={styles.formGroup}>
            <Text style={styles.sectionHeading}>MANDATORY DOCUMENTS</Text>
            <Text style={styles.docsHint}>
              Tap each document box to upload the verified credential. All 4 documents are required:
            </Text>

            {DOCUMENT_CONFIGS.map((config) => {
              const docState = docs[config.type];
              const isUploaded = docState.status === 'UPLOADED';
              const isUploading = docState.status === 'UPLOADING';
              const isFailed = docState.status === 'FAILED';

              return (
                <TouchableOpacity
                  key={config.type}
                  style={styles.docCheckRow}
                  activeOpacity={0.78}
                  disabled={isUploading}
                  onPress={() => handleSelectDocument(config.type, config.title)}>
                  {/* Indicator Box: ○ (Unuploaded), ⟳ (Uploading), ✓ (Uploaded), ! (Failed) */}
                  <View
                    style={[
                      styles.checkbox,
                      isUploaded && styles.checkboxChecked,
                      isFailed && styles.checkboxFailed,
                      isUploading && styles.checkboxUploading,
                    ]}>
                    {isUploading ? (
                      <ActivityIndicator size="small" color="#C67139" />
                    ) : isUploaded ? (
                      <Text style={styles.checkmarkText}>✓</Text>
                    ) : isFailed ? (
                      <Text style={styles.failedText}>!</Text>
                    ) : (
                      <View style={styles.emptyCircle} />
                    )}
                  </View>

                  {/* Document Box Details */}
                  <View style={styles.docTextCol}>
                    <View style={styles.docHeaderRow}>
                      <Text style={styles.docCheckTitle}>{config.title}</Text>
                      {isUploaded && (
                        <View style={styles.docActionsRow}>
                          <TouchableOpacity
                            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                            onPress={() => handleSelectDocument(config.type, config.title)}>
                            <Text style={styles.docActionReplace}>Replace</Text>
                          </TouchableOpacity>
                          <Text style={styles.docActionDot}>·</Text>
                          <TouchableOpacity
                            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                            onPress={() => handleRemoveDocument(config.type, config.title)}>
                            <Text style={styles.docActionRemove}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    {/* Subtitle / File Name / Upload Status */}
                    {isUploaded ? (
                      <Text style={styles.docCheckSubUploaded} numberOfLines={1}>
                        ✓ {docState.fileName || 'Uploaded'} {docState.fileSize ? `(${formatFileSize(docState.fileSize)})` : ''}
                      </Text>
                    ) : isUploading ? (
                      <Text style={styles.docCheckSubUploading}>
                        Uploading to secure chapter storage...
                      </Text>
                    ) : isFailed ? (
                      <Text style={styles.docCheckSubFailed}>
                        {docState.error || 'Upload failed — Tap to retry'}
                      </Text>
                    ) : (
                      <Text style={styles.docCheckSub}>
                        {config.defaultSub} · <Text style={styles.tapToUploadText}>Tap to upload</Text>
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Dues Note */}
          <View style={styles.feeNotice}>
            <Text style={styles.feeNoticeTitle}>ANNUAL CHAPTER SUBSCRIPTION</Text>
            <Text style={styles.feeNoticeBody}>
              Annual subscription of KD 20 is payable upon approval of credentials by the Executive Committee.
            </Text>
          </View>
        </ScrollView>

        {/* Fixed Submit Button */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.88}
            disabled={isSubmitting}
            onPress={handleSubmit}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Application</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EAD8',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF4EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E8DCCB',
  },
  headerTextCol: {
    flex: 1,
  },
  headerKicker: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: '#C67139',
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: '#201E1D',
  },
  introSubtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: '#605C55',
    lineHeight: 18,
    marginBottom: 20,
  },
  formGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8DCCB',
  },
  sectionHeading: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.1,
    color: '#8D7B68',
    marginBottom: 14,
  },
  fieldLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12.5,
    color: '#201E1D',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FAF4EB',
    borderWidth: 1,
    borderColor: '#E8DCCB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    color: '#201E1D',
  },
  chipScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  discChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#FAF4EB',
    borderWidth: 1,
    borderColor: '#E8DCCB',
    marginRight: 8,
  },
  discChipActive: {
    backgroundColor: '#C67139',
    borderColor: '#C67139',
  },
  discChipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: '#605C55',
  },
  discChipTextActive: {
    color: '#FFFFFF',
    fontFamily: fonts.sansBold,
  },
  docsHint: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#605C55',
    marginBottom: 12,
  },
  docCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EAD8',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D4C8B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#FAF4EB',
  },
  checkboxChecked: {
    backgroundColor: '#C67139',
    borderColor: '#C67139',
  },
  checkboxUploading: {
    backgroundColor: '#FAF4EB',
    borderColor: '#C67139',
  },
  checkboxFailed: {
    backgroundColor: '#FDECEB',
    borderColor: '#D9534F',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  failedText: {
    color: '#D9534F',
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  docTextCol: {
    flex: 1,
  },
  docHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  docCheckTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: '#201E1D',
  },
  docActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docActionReplace: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    color: '#C67139',
  },
  docActionDot: {
    color: '#A89F91',
    fontSize: 12,
  },
  docActionRemove: {
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    color: '#8D7B68',
  },
  docCheckSub: {
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    color: '#8D7B68',
  },
  tapToUploadText: {
    color: '#C67139',
    fontFamily: fonts.sansSemiBold,
  },
  docCheckSubUploaded: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11.5,
    color: '#3B6828',
  },
  docCheckSubUploading: {
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    color: '#C67139',
  },
  docCheckSubFailed: {
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    color: '#D9534F',
  },
  feeNotice: {
    backgroundColor: '#FAF4EB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8DCCB',
    marginBottom: 20,
  },
  feeNoticeTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1,
    color: '#C67139',
    marginBottom: 4,
  },
  feeNoticeBody: {
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    color: '#605C55',
    lineHeight: 17,
  },
  bottomBar: {
    backgroundColor: '#F5EAD8',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8DCCB',
  },
  submitButton: {
    backgroundColor: '#C67139',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8DCCB',
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successCheckmark: {
    fontSize: 28,
    color: '#3B6828',
    fontWeight: 'bold',
  },
  successKicker: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#3B6828',
    marginBottom: 4,
  },
  successTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: '#201E1D',
    marginBottom: 6,
  },
  successRef: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: '#C67139',
    marginBottom: 12,
  },
  successBody: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: '#605C55',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  nextStepsCard: {
    width: '100%',
    backgroundColor: '#FAF4EB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8DCCB',
  },
  nextStepsTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 1,
    color: '#8D7B68',
    marginBottom: 8,
  },
  nextStepsItem: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: '#605C55',
    lineHeight: 18,
    marginBottom: 4,
  },
  doneButton: {
    width: '100%',
    backgroundColor: '#C67139',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  doneButtonText: {
    fontFamily: fonts.sansBold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
});
