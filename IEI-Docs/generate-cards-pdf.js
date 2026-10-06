const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const QRCode = require('C:/Users/DELL/.gemini/antigravity-ide/brain/a1ef1478-9573-4611-ac0c-82a3befb0304/scratch/node_modules/qrcode');

const sealPath = path.join(__dirname, 'IEI-Mobile', 'assets', 'images', 'iei-seal.png');
let sealBase64 = '';
if (fs.existsSync(sealPath)) {
  sealBase64 = 'data:image/png;base64,' + fs.readFileSync(sealPath).toString('base64');
}

const members = [
  {
    memberCode: 'IEI9001',
    fullName: 'Engr. Sudhir Shyam Menghani',
    grade: 'MIE',
    discipline: 'Electrical',
    mobile: '00000001',
    bloodGroup: 'B+',
    ieiIndiaNo: 'M-DEV-9001',
    memberSinceYear: 2012,
    position: 'CHAPTER TREASURER (2026–27)',
    isExecutive: true,
  },
  {
    memberCode: 'IEI0005',
    fullName: 'Eng. Karthikeyan Manickam',
    grade: 'MIE',
    discipline: 'Civil',
    mobile: '99840191',
    bloodGroup: 'O+',
    ieiIndiaNo: 'M-1483721',
    memberSinceYear: 2011,
    position: 'ACTIVE MEMBER',
    isExecutive: false,
  },
  {
    memberCode: 'IEI0010',
    fullName: 'Engr. Anu Kurian',
    grade: 'MIE',
    discipline: 'Electrical',
    mobile: '00000010',
    bloodGroup: 'A+',
    ieiIndiaNo: 'M-DEV-0010',
    memberSinceYear: 2015,
    position: 'ACTIVE MEMBER',
    isExecutive: false,
  },
  {
    memberCode: 'IEI0042',
    fullName: 'Engr. Upendra Kumar Behura',
    grade: 'FIE',
    discipline: 'Electrical',
    mobile: '98765432',
    bloodGroup: 'O+',
    ieiIndiaNo: 'F-1204856',
    memberSinceYear: 2008,
    position: 'EXECUTIVE COMMITTEE OFFICER',
    isExecutive: true,
  },
  {
    memberCode: 'IEI0015',
    fullName: 'Eng. Rajesh Sharma',
    grade: 'MIE',
    discipline: 'Mechanical',
    mobile: '99112233',
    bloodGroup: 'B+',
    ieiIndiaNo: 'M-DEV-0015',
    memberSinceYear: 2016,
    position: 'ACTIVE MEMBER',
    isExecutive: false,
  },
  {
    memberCode: 'IEI0022',
    fullName: 'Eng. Priya Sundaram',
    grade: 'MIE',
    discipline: 'Electronics & Comm',
    mobile: '99223344',
    bloodGroup: 'O+',
    ieiIndiaNo: 'M-DEV-0022',
    memberSinceYear: 2018,
    position: 'ACTIVE MEMBER',
    isExecutive: false,
  },
  {
    memberCode: 'IEI0034',
    fullName: 'Engr. Subbiah Somasundaram',
    grade: 'FIE',
    discipline: 'Civil',
    mobile: '99334455',
    bloodGroup: 'AB+',
    ieiIndiaNo: 'F-DEV-0034',
    memberSinceYear: 2005,
    position: 'LIFE MEMBER',
    isExecutive: false,
  },
  {
    memberCode: 'IEI9100',
    fullName: 'Demo Member Three',
    grade: 'AMIE',
    discipline: 'Mechanical',
    mobile: '00000100',
    bloodGroup: 'B+',
    ieiIndiaNo: 'M-DEV-9100',
    memberSinceYear: 2020,
    position: 'ACTIVE MEMBER',
    isExecutive: false,
  },
];

function getInitials(name) {
  const parts = name.replace(/^(Engr?\.|Dr\.)\s*/i, '').trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

async function main() {
  const cardsHtmlList = [];

  for (const m of members) {
    const initials = getInitials(m.fullName);
    
    // Generate real, standards-compliant, 100% scannable QR Code with full quiet zone
    const qrSvg = await QRCode.toString(m.memberCode, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 4,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    cardsHtmlList.push(`
      <div class="card-wrapper">
        <div class="card-container">
          <div class="card-top-bg"></div>

          <!-- Card Header -->
          <div class="card-header">
            <div class="inst-info">
              <div class="inst-name">THE INSTITUTION OF ENGINEERS (INDIA)</div>
              <div class="inst-sub">KUWAIT CHAPTER · ESTD. 1995</div>
              <div class="inst-tag">Under the patronship of Embassy of India, Kuwait</div>
            </div>
            <div class="seal-container">
              ${sealBase64 ? `<img src="${sealBase64}" class="seal-img" alt="IEI Seal" />` : '<div class="seal-fallback">IEI</div>'}
            </div>
          </div>

          <!-- Executive Ribbon -->
          ${m.isExecutive ? `<div class="role-ribbon">★ ${m.position} ★</div>` : ''}

          <!-- Member Primary Info -->
          <div class="member-primary">
            <div class="avatar">
              <span class="avatar-text">${initials}</span>
            </div>
            <div class="name-block">
              <div class="member-name">${m.fullName}</div>
              <div class="member-discipline">${m.discipline} Engineering</div>
              <div class="member-meta-line">Member since ${m.memberSinceYear} · Status: <span class="status-active">Active</span></div>
            </div>
          </div>

          <!-- Grade & Blood Group Badges -->
          <div class="grade-blood-row">
            <div class="badge-col">
              <span class="badge-label">MEMBERSHIP GRADE</span>
              <span class="badge-val grade-val">${m.grade}</span>
            </div>
            <div class="badge-col">
              <span class="badge-label">BLOOD GROUP</span>
              <span class="badge-val blood-val">${m.bloodGroup}</span>
            </div>
            <div class="badge-col">
              <span class="badge-label">REGISTERED MOBILE</span>
              <span class="badge-val mobile-val">${m.mobile}</span>
            </div>
          </div>

          <!-- Perforated Ticket Divider -->
          <div class="perforated-divider">
            <div class="notch notch-left"></div>
            <div class="dash-line"></div>
            <div class="notch notch-right"></div>
          </div>

          <!-- Bottom Validation & Real QR Section -->
          <div class="card-footer">
            <div class="qr-block">
              ${qrSvg}
            </div>
            <div class="ids-block">
              <div class="id-item">
                <span class="id-label">CHAPTER MEMBER ID</span>
                <span class="id-val">${m.memberCode}</span>
              </div>
              <div class="id-item" style="margin-top: 5px;">
                <span class="id-label">IEI INDIA REGISTRATION NO.</span>
                <span class="id-val secondary">${m.ieiIndiaNo}</span>
              </div>
            </div>
            <div class="watermark-sig">
              <div class="security-chip">AUTHORIZED PASS</div>
              <div class="validity">VALID: 2026–2027</div>
            </div>
          </div>
        </div>
      </div>
    `);
  }

  // 2 cards per page
  let pagesHtml = '';
  for (let i = 0; i < cardsHtmlList.length; i += 2) {
    pagesHtml += `
      <div class="page">
        <div class="page-header">
          <div class="page-title">THE INSTITUTION OF ENGINEERS (INDIA) — KUWAIT CHAPTER</div>
          <div class="page-sub">OFFICIAL MEMBERSHIP DIRECTORY & IDENTIFICATION CARDS · 2026–27</div>
        </div>
        <div class="cards-grid">
          ${cardsHtmlList[i]}
          ${cardsHtmlList[i + 1] ? cardsHtmlList[i + 1] : ''}
        </div>
        <div class="page-footer">
          <span>Official Kuwait Chapter Digital Member Identification · Scan QR for Entrance</span>
          <span>Page ${Math.floor(i / 2) + 1} of ${Math.ceil(cardsHtmlList.length / 2)}</span>
        </div>
      </div>
    `;
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>IEI Kuwait Chapter - Member Cards</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    background: #EFE8DC;
    font-family: 'Outfit', sans-serif;
    color: #201E1D;
  }

  @page {
    size: A4 portrait;
    margin: 8mm;
  }

  .page {
    width: 100%;
    min-height: 275mm;
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px 14px;
    background: #F5EAD8;
    border: 1px solid #D8C7B0;
    border-radius: 6px;
    margin-bottom: 20px;
  }

  .page:last-child {
    page-break-after: avoid;
  }

  .page-header {
    text-align: center;
    padding-bottom: 10px;
    border-bottom: 1.5px solid #D8C7B0;
  }

  .page-title {
    font-family: 'Cinzel', serif;
    font-size: 14pt;
    font-weight: 700;
    color: #402310;
    letter-spacing: 1px;
  }

  .page-sub {
    font-size: 8.5pt;
    color: #7A5B44;
    font-weight: 600;
    margin-top: 2px;
    letter-spacing: 0.5px;
  }

  .cards-grid {
    display: flex;
    flex-direction: column;
    gap: 18px;
    align-items: center;
    margin: 12px 0;
  }

  .card-wrapper {
    width: 100%;
    max-width: 530px;
    background: #FDFBF7;
    padding: 10px;
    border: 1px dashed #CBB89F;
    border-radius: 18px;
    position: relative;
  }

  .card-container {
    background: linear-gradient(135deg, #3B1F0D 0%, #291407 100%);
    color: #F9F4ED;
    border-radius: 16px;
    padding: 16px 18px 14px;
    box-shadow: 0 4px 12px rgba(40, 20, 10, 0.25);
    border: 1px solid rgba(220, 160, 110, 0.3);
    position: relative;
    overflow: hidden;
  }

  .card-top-bg {
    position: absolute;
    top: -50px;
    left: -50px;
    width: 170px;
    height: 170px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(198, 113, 57, 0.28) 0%, rgba(198, 113, 57, 0) 70%);
    pointer-events: none;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
    z-index: 1;
  }

  .inst-name {
    font-family: 'Cinzel', serif;
    font-size: 9.5pt;
    font-weight: 700;
    color: #F9F4ED;
    letter-spacing: 0.8px;
    line-height: 1.25;
  }

  .inst-sub {
    font-size: 7.5pt;
    font-weight: 700;
    color: #FFC6A5;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }

  .inst-tag {
    font-size: 6.5pt;
    color: #AFA295;
    margin-top: 1px;
    font-style: italic;
  }

  .seal-container {
    width: 44px;
    height: 44px;
    background: #FFF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    border: 1.5px solid #FFC6A5;
    flex-shrink: 0;
  }

  .seal-img {
    width: 38px;
    height: 38px;
    object-fit: contain;
  }

  .seal-fallback {
    color: #402310;
    font-weight: 800;
    font-size: 11pt;
  }

  .role-ribbon {
    margin-top: 8px;
    background: linear-gradient(90deg, #C67139 0%, #D48952 100%);
    color: #FFF;
    font-size: 7.5pt;
    font-weight: 800;
    letter-spacing: 1px;
    padding: 3px 10px;
    border-radius: 4px;
    display: inline-block;
    box-shadow: 0 2px 4px rgba(0,0,0,0.25);
  }

  .member-primary {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 10px;
    position: relative;
    z-index: 1;
  }

  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #502A12;
    border: 2px solid #FFC6A5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(0,0,0,0.35);
  }

  .avatar-text {
    font-size: 14pt;
    font-weight: 800;
    color: #FFC6A5;
    letter-spacing: -0.5px;
  }

  .member-name {
    font-size: 13.5pt;
    font-weight: 800;
    color: #FFF;
    line-height: 1.15;
    letter-spacing: -0.2px;
  }

  .member-discipline {
    font-size: 8.5pt;
    color: #FFC6A5;
    font-weight: 600;
    margin-top: 2px;
  }

  .member-meta-line {
    font-size: 7pt;
    color: #C0B4A6;
    margin-top: 2px;
  }

  .status-active {
    color: #A9D18E;
    font-weight: 700;
  }

  .grade-blood-row {
    display: flex;
    justify-content: space-between;
    background: rgba(0, 0, 0, 0.22);
    border-radius: 8px;
    padding: 6px 12px;
    margin-top: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .badge-col {
    display: flex;
    flex-direction: column;
  }

  .badge-label {
    font-size: 6pt;
    color: #A79B8F;
    font-weight: 700;
    letter-spacing: 0.6px;
  }

  .badge-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5pt;
    font-weight: 700;
    color: #FFF;
    margin-top: 1px;
  }

  .grade-val {
    color: #FFD4BC;
  }

  .blood-val {
    color: #FF9B9B;
  }

  .mobile-val {
    color: #E2DDD5;
    font-size: 8.5pt;
  }

  .perforated-divider {
    position: relative;
    margin: 10px -18px 8px;
    height: 14px;
    display: flex;
    align-items: center;
  }

  .notch {
    width: 14px;
    height: 14px;
    background: #FDFBF7;
    border-radius: 50%;
    position: absolute;
    box-shadow: inset 0 0 2px rgba(0,0,0,0.4);
  }

  .notch-left {
    left: -7px;
  }

  .notch-right {
    right: -7px;
  }

  .dash-line {
    width: 100%;
    height: 1px;
    border-top: 1.5px dashed rgba(255, 255, 255, 0.25);
    margin: 0 10px;
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  /* High contrast, scannable QR badge */
  .qr-block {
    flex-shrink: 0;
    background: #FFFFFF;
    padding: 4px;
    border-radius: 8px;
    border: 2px solid #FFC6A5;
    box-shadow: 0 3px 8px rgba(0,0,0,0.45);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .qr-block svg {
    width: 90px;
    height: 90px;
    display: block;
  }

  .ids-block {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .id-item {
    display: flex;
    flex-direction: column;
  }

  .id-label {
    font-size: 6pt;
    color: #9E9184;
    font-weight: 700;
    letter-spacing: 0.6px;
  }

  .id-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11pt;
    font-weight: 700;
    color: #FFF;
    letter-spacing: 0.5px;
  }

  .id-val.secondary {
    font-size: 9pt;
    color: #E0D4C5;
  }

  .watermark-sig {
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .security-chip {
    font-size: 6pt;
    font-weight: 800;
    letter-spacing: 0.8px;
    color: #C67139;
    background: rgba(198, 113, 57, 0.15);
    border: 1px solid rgba(198, 113, 57, 0.5);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .validity {
    font-family: 'JetBrains Mono', monospace;
    font-size: 6.5pt;
    color: #9C8E82;
    font-weight: 600;
  }

  .page-footer {
    display: flex;
    justify-content: space-between;
    font-size: 7pt;
    color: #8A7768;
    padding-top: 6px;
    border-top: 1px solid #D8C7B0;
  }
</style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;

  const outHtmlPath = path.join(__dirname, 'IEI-Members-Cards.html');
  const outPdfDocsPath = path.join(__dirname, 'IEI-Docs', 'IEI-Members-Cards.pdf');
  const outPdfRootPath = path.join(__dirname, 'IEI-Members-Cards.pdf');

  fs.writeFileSync(outHtmlPath, fullHtml, 'utf8');
  console.log('Generated HTML at:', outHtmlPath);

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  if (fs.existsSync(edgePath)) {
    console.log('Generating PDF via Microsoft Edge headless...');
    const cmd = `"${edgePath}" --headless --disable-gpu --print-to-pdf="${outPdfDocsPath}" --print-to-pdf-no-header "${outHtmlPath}"`;
    execSync(cmd, { stdio: 'inherit' });
    fs.copyFileSync(outPdfDocsPath, outPdfRootPath);
    console.log('PDF generated successfully at:', outPdfDocsPath);
    console.log('Copied PDF to root:', outPdfRootPath);
  } else {
    console.error('Edge executable not found at', edgePath);
  }
}

main().catch(console.error);
