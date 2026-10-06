import 'dotenv/config';
import fs from 'fs';
import path from 'path';

async function testDocUploadFlow() {
  console.log('--- Testing Membership Application Document Upload Flow ---');
  const baseUrl = process.env.TEST_API_URL || 'http://localhost:3000';

  // 1. Check if backend is alive
  try {
    const health = await fetch(`${baseUrl}/membership/information`);
    if (!health.ok) {
      throw new Error(`Health check failed with ${health.status}`);
    }
    console.log('✓ Backend is up and running');
  } catch (err: any) {
    console.error('Backend connection failed:', err.message);
    process.exit(1);
  }

  // 2. Create or initialize a draft application
  console.log('\n1. Creating draft application...');
  const draftRes = await fetch(`${baseUrl}/membership/applications/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test Engineer',
      mobile: '96599887766',
      email: 'test.engineer@iei-kuwait.org',
    }),
  });

  const draftData = await draftRes.json();
  console.log('Draft response:', draftData);
  if (!draftData.applicationId || !draftData.applicantToken) {
    throw new Error('Failed to create draft application');
  }
  const { applicationId, applicantToken } = draftData;
  console.log(`✓ Draft created successfully: ID=${applicationId}, Token=${applicantToken}`);

  // 3. Test Invalid File Upload (non-supported mime / executable)
  console.log('\n2. Testing invalid file type rejection (.exe/bat)...');
  const fakeExeForm = new FormData();
  fakeExeForm.append('documentType', 'DEGREE_CERTIFICATE');
  fakeExeForm.append('applicantToken', applicantToken);
  fakeExeForm.append(
    'file',
    new Blob(['echo malicious script'], { type: 'application/x-msdownload' }),
    'test.exe',
  );

  const exeRes = await fetch(`${baseUrl}/membership/applications/${applicationId}/documents`, {
    method: 'POST',
    body: fakeExeForm,
  });
  console.log('Exe upload response status:', exeRes.status);
  const exeData = await exeRes.json();
  if (exeRes.status === 400) {
    console.log('✓ Successfully rejected invalid executable file:', exeData.message);
  } else {
    throw new Error(`Expected 400 Bad Request but got ${exeRes.status}`);
  }

  // 4. Test Photograph document type rejected when uploading a PDF
  console.log('\n3. Testing PHOTOGRAPH rejecting PDF format...');
  const fakePhotoPdfForm = new FormData();
  fakePhotoPdfForm.append('documentType', 'PHOTOGRAPH');
  fakePhotoPdfForm.append('applicantToken', applicantToken);
  fakePhotoPdfForm.append(
    'file',
    new Blob(['%PDF-1.4 fake pdf'], { type: 'application/pdf' }),
    'photo.pdf',
  );

  const photoPdfRes = await fetch(`${baseUrl}/membership/applications/${applicationId}/documents`, {
    method: 'POST',
    body: fakePhotoPdfForm,
  });
  console.log('Photo PDF response status:', photoPdfRes.status);
  const photoPdfData = await photoPdfRes.json();
  if (photoPdfRes.status === 400) {
    console.log('✓ Successfully rejected PDF for PHOTOGRAPH:', photoPdfData.message);
  } else {
    throw new Error(`Expected 400 for PDF photo but got ${photoPdfRes.status}`);
  }

  // 5. Test Unauthorized Application Access (wrong applicant token)
  console.log('\n4. Testing application ownership security (wrong token)...');
  const wrongTokenForm = new FormData();
  wrongTokenForm.append('documentType', 'DEGREE_CERTIFICATE');
  wrongTokenForm.append('applicantToken', 'invalid-token-12345');
  wrongTokenForm.append(
    'file',
    new Blob(['%PDF-1.4 degree'], { type: 'application/pdf' }),
    'degree.pdf',
  );

  const wrongRes = await fetch(`${baseUrl}/membership/applications/${applicationId}/documents`, {
    method: 'POST',
    body: wrongTokenForm,
  });
  console.log('Wrong token response status:', wrongRes.status);
  if (wrongRes.status === 403 || wrongRes.status === 401) {
    console.log('✓ Successfully rejected upload with wrong token');
  } else {
    throw new Error(`Expected 403/401 but got ${wrongRes.status}`);
  }

  // 6. Test Valid Upload: Degree Certificate (PDF)
  console.log('\n5. Uploading 1/4: DEGREE_CERTIFICATE (PDF)...');
  const degreeForm = new FormData();
  degreeForm.append('documentType', 'DEGREE_CERTIFICATE');
  degreeForm.append('applicantToken', applicantToken);
  degreeForm.append(
    'file',
    new Blob(['%PDF-1.4 Accredited BE Degree Certificate mock file'], { type: 'application/pdf' }),
    'degree_be_mechanical.pdf',
  );

  const degreeRes = await fetch(`${baseUrl}/membership/applications/${applicationId}/documents`, {
    method: 'POST',
    body: degreeForm,
  });
  const degreeData = await degreeRes.json();
  if (!degreeRes.ok) throw new Error(`Degree upload failed: ${JSON.stringify(degreeData)}`);
  console.log('✓ DEGREE_CERTIFICATE uploaded:', degreeData.document.originalFileName);

  // 7. Test Duplicate / Replace Upload: Uploading a new Degree Certificate replaces the old one
  console.log('\n6. Testing duplicate upload replacement for DEGREE_CERTIFICATE...');
  const replaceDegreeForm = new FormData();
  replaceDegreeForm.append('documentType', 'DEGREE_CERTIFICATE');
  replaceDegreeForm.append('applicantToken', applicantToken);
  replaceDegreeForm.append(
    'file',
    new Blob(['%PDF-1.4 Accredited ME Degree Certificate replaced'], { type: 'application/pdf' }),
    'degree_me_mechanical_updated.pdf',
  );

  const repRes = await fetch(`${baseUrl}/membership/applications/${applicationId}/documents`, {
    method: 'POST',
    body: replaceDegreeForm,
  });
  const repData = await repRes.json();
  if (!repRes.ok) throw new Error(`Degree replacement failed: ${JSON.stringify(repData)}`);
  console.log('✓ DEGREE_CERTIFICATE replaced cleanly with:', repData.document.originalFileName);

  // 8. Upload 2/4: PASSPORT_COPY (PDF)
  console.log('\n7. Uploading 2/4: PASSPORT_COPY (PDF)...');
  const passportForm = new FormData();
  passportForm.append('documentType', 'PASSPORT_COPY');
  passportForm.append('applicantToken', applicantToken);
  passportForm.append(
    'file',
    new Blob(['%PDF-1.4 Valid Passport with Kuwait Residence Visa'], { type: 'application/pdf' }),
    'passport_residence.pdf',
  );
  const passportRes = await fetch(`${baseUrl}/membership/applications/${applicationId}/documents`, {
    method: 'POST',
    body: passportForm,
  });
  const passportData = await passportRes.json();
  if (!passportRes.ok) throw new Error(`Passport upload failed: ${JSON.stringify(passportData)}`);
  console.log('✓ PASSPORT_COPY uploaded:', passportData.document.originalFileName);

  // 9. Upload 3/4: CIVIL_ID (JPG)
  console.log('\n8. Uploading 3/4: CIVIL_ID (JPG image)...');
  const civilIdForm = new FormData();
  civilIdForm.append('documentType', 'CIVIL_ID');
  civilIdForm.append('applicantToken', applicantToken);
  civilIdForm.append(
    'file',
    new Blob(['fake-jpeg-binary-civil-id-front-back'], { type: 'image/jpeg' }),
    'civil_id_front_back.jpg',
  );
  const civilIdRes = await fetch(`${baseUrl}/membership/applications/${applicationId}/documents`, {
    method: 'POST',
    body: civilIdForm,
  });
  const civilIdData = await civilIdRes.json();
  if (!civilIdRes.ok) throw new Error(`Civil ID upload failed: ${JSON.stringify(civilIdData)}`);
  console.log('✓ CIVIL_ID uploaded:', civilIdData.document.originalFileName);

  // 10. Attempt premature application submission with only 3/4 documents
  console.log('\n9. Testing submission rejection when missing 4th document (PHOTOGRAPH)...');
  const prematureSubmitRes = await fetch(`${baseUrl}/membership/application`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicationId,
      applicantToken,
      applicantName: 'Test Engineer',
      applicantMobile: '96599887766',
      applicantEmail: 'test.engineer@iei-kuwait.org',
      discipline: 'Mechanical Engineering',
      employer: 'KOC Kuwait',
      designation: 'Senior Mechanical Engineer',
      experienceYears: 7,
      qualification: 'B.E. Mechanical Engineering, 2017',
    }),
  });
  const prematureData = await prematureSubmitRes.json();
  console.log('Premature submit status:', prematureSubmitRes.status, prematureData.message);
  if (prematureSubmitRes.status === 400 && String(prematureData.message).includes('Passport Size Photograph')) {
    console.log('✓ Successfully blocked premature submission due to missing photograph!');
  } else {
    throw new Error(`Expected 400 rejection for missing document, got: ${prematureSubmitRes.status}`);
  }

  // 11. Upload 4/4: PHOTOGRAPH (PNG)
  console.log('\n10. Uploading 4/4: PHOTOGRAPH (PNG image)...');
  const photoForm = new FormData();
  photoForm.append('documentType', 'PHOTOGRAPH');
  photoForm.append('applicantToken', applicantToken);
  photoForm.append(
    'file',
    new Blob(['fake-png-binary-headshot'], { type: 'image/png' }),
    'white_background_photo.png',
  );
  const photoRes = await fetch(`${baseUrl}/membership/applications/${applicationId}/documents`, {
    method: 'POST',
    body: photoForm,
  });
  const photoData = await photoRes.json();
  if (!photoRes.ok) throw new Error(`Photograph upload failed: ${JSON.stringify(photoData)}`);
  console.log('✓ PHOTOGRAPH uploaded:', photoData.document.originalFileName);

  // 12. Retrieve uploaded documents list
  console.log('\n11. Verifying GET application documents returns all 4...');
  const getDocsRes = await fetch(`${baseUrl}/membership/applications/${applicationId}/documents`, {
    headers: { 'x-applicant-token': applicantToken },
  });
  const docsData = await getDocsRes.json();
  console.log(`Retrieved ${docsData.documents.length} documents:`, docsData.documents.map((d: any) => `${d.documentType}: ${d.originalFileName}`));
  if (docsData.documents.length !== 4) {
    throw new Error(`Expected 4 documents but found ${docsData.documents.length}`);
  }
  console.log('✓ All 4 documents confirmed in database!');

  // 13. Test Document Download endpoint
  console.log('\n12. Testing secure document download endpoint...');
  const firstDoc = docsData.documents[0];
  const downloadRes = await fetch(`${baseUrl}/membership/applications/${applicationId}/documents/${firstDoc.id}/file`, {
    headers: { 'x-applicant-token': applicantToken },
  });
  console.log('Download status:', downloadRes.status, 'Content-Type:', downloadRes.headers.get('content-type'));
  if (!downloadRes.ok) {
    throw new Error(`Failed to download document: ${downloadRes.status}`);
  }
  console.log('✓ Secure file download verified!');

  // 14. Final submission with all 4 documents
  console.log('\n13. Submitting completed application with all 4 documents...');
  const finalSubmitRes = await fetch(`${baseUrl}/membership/application`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicationId,
      applicantToken,
      applicantName: 'Test Engineer',
      applicantMobile: '96599887766',
      applicantEmail: 'test.engineer@iei-kuwait.org',
      discipline: 'Mechanical Engineering',
      employer: 'KOC Kuwait',
      designation: 'Senior Mechanical Engineer',
      experienceYears: 7,
      qualification: 'B.E. Mechanical Engineering, 2017',
    }),
  });
  const finalSubmitData = await finalSubmitRes.json();
  if (!finalSubmitRes.ok) {
    throw new Error(`Final submit failed: ${JSON.stringify(finalSubmitData)}`);
  }
  console.log('✓ Application submitted successfully!');
  console.log('Final Result:', finalSubmitData);

  console.log('\n======================================================');
  console.log('ALL MEMBERSHIP DOCUMENT UPLOAD TESTS PASSED WITH 100% SUCCESS!');
  console.log('======================================================');
}

testDocUploadFlow().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
