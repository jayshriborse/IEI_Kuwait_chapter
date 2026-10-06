const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sealPath = path.join(__dirname, '..', 'IEI-Mobile', 'assets', 'images', 'iei-seal.png');
let sealBase64 = '';
if (fs.existsSync(sealPath)) {
  sealBase64 = 'data:image/png;base64,' + fs.readFileSync(sealPath).toString('base64');
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>IEI Kuwait - Google Authentication Root Cause & Solution Guide</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Cinzel:wght@600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  @page {
    size: A4;
    margin: 18mm 18mm 18mm 18mm;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1A1F2C;
    background: #FFFFFF;
    line-height: 1.55;
    font-size: 10.5pt;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid #8A6E4B;
    padding-bottom: 14px;
    margin-bottom: 22px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .logo {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }

  .title-group h1 {
    font-family: 'Cinzel', serif;
    font-size: 15pt;
    color: #0A1D37;
    letter-spacing: 0.5px;
    font-weight: 700;
  }

  .title-group p {
    font-size: 8.5pt;
    color: #8A6E4B;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
  }

  .badge-doc {
    background: #0A1D37;
    color: #FFFFFF;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 8pt;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-align: right;
  }

  .badge-doc span {
    display: block;
    color: #D4AF37;
    font-size: 7pt;
    text-transform: uppercase;
  }

  .section-title {
    font-size: 12.5pt;
    font-weight: 700;
    color: #0A1D37;
    border-left: 4px solid #8A6E4B;
    padding-left: 10px;
    margin-top: 20px;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  p {
    margin-bottom: 10px;
    color: #333F48;
  }

  .callout-box {
    background: #FDF9F3;
    border: 1px solid #EBDBC8;
    border-left: 4px solid #C59B27;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 14px;
  }

  .callout-box strong {
    color: #7A5310;
    display: block;
    margin-bottom: 4px;
    font-size: 10pt;
  }

  .error-box {
    background: #FDF3F3;
    border: 1px solid #F5C6C6;
    border-left: 4px solid #D93838;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 14px;
  }

  .error-box strong {
    color: #9E1C1C;
    display: block;
    margin-bottom: 4px;
    font-size: 10pt;
  }

  .success-box {
    background: #F2F9F4;
    border: 1px solid #C3E6CB;
    border-left: 4px solid #28A745;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 14px;
  }

  .success-box strong {
    color: #1E6631;
    display: block;
    margin-bottom: 4px;
    font-size: 10pt;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 16px 0;
    font-size: 9.5pt;
  }

  table th {
    background: #0A1D37;
    color: #FFFFFF;
    text-align: left;
    padding: 8px 12px;
    font-weight: 600;
  }

  table td {
    padding: 8px 12px;
    border-bottom: 1px solid #E4E8EE;
    color: #2D3748;
  }

  table tr:nth-child(even) td {
    background: #F8FAFC;
  }

  .code-block {
    background: #1E293B;
    color: #F1F5F9;
    padding: 10px 14px;
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.5pt;
    margin-bottom: 12px;
    white-space: pre-wrap;
    line-height: 1.45;
  }

  .steps-list {
    margin-left: 20px;
    margin-bottom: 14px;
  }

  .steps-list li {
    margin-bottom: 8px;
    color: #333F48;
  }

  .steps-list strong {
    color: #0A1D37;
  }

  .tag {
    display: inline-block;
    padding: 2px 7px;
    font-size: 8pt;
    font-weight: 600;
    border-radius: 4px;
  }

  .tag-green { background: #E2F7E7; color: #1E7E34; }
  .tag-gold { background: #FEF3D6; color: #8C6207; }
  .tag-red { background: #FDE8E8; color: #C5221F; }

  .page-break {
    page-break-before: always;
  }

  .footer {
    border-top: 1px solid #D8C7B0;
    padding-top: 10px;
    margin-top: 24px;
    font-size: 8pt;
    color: #8C7866;
    display: flex;
    justify-content: space-between;
  }
</style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="header-left">
      ${sealBase64 ? `<img src="${sealBase64}" class="logo" alt="IEI Seal">` : ''}
      <div class="title-group">
        <h1>The Institution of Engineers (India)</h1>
        <p>Kuwait Chapter &bull; Technical Architecture Report</p>
      </div>
    </div>
    <div class="badge-doc">
      <span>TECHNICAL BRIEF</span>
      Google Auth Resolution
    </div>
  </div>

  <h2 style="font-size: 14pt; color: #0A1D37; margin-bottom: 6px;">Google Authentication Error: Root Cause & Solution Guide</h2>
  <p style="font-size: 9.5pt; color: #64748B; margin-bottom: 18px;">Target System: IEI Mobile Application (React Native / Expo SDK 57 & NestJS Backend) &bull; Date: October 2026</p>

  <!-- SECTION 1 -->
  <div class="section-title">1. Executive Summary</div>
  <p>
    When tapping <strong>"Continue with Google"</strong> in the IEI Kuwait Mobile Application running on an Android device via Expo Go, a browser window opened to <code>accounts.google.com</code> displaying:
  </p>
  <div class="error-box">
    <strong>Google Error Encountered:</strong>
    <em>"404. That's an error. The requested URL was not found on this server. That's all we know."</em>
  </div>
  <p>
    This technical document explains the exact root cause behind this behavior and outlines two distinct solutions: an <strong>immediate zero-setup testing path</strong> for application demonstrations, and the <strong>step-by-step production configuration</strong> for Google Cloud Console.
  </p>

  <!-- SECTION 2 -->
  <div class="section-title">2. Root Cause Analysis (Deep-Dive)</div>
  <p>
    Google’s OAuth 2.0 authorization server (<code>accounts.google.com/o/oauth2/v2/auth</code>) validates incoming authorization requests against strict security guidelines. Two fatal conditions occurred simultaneously:
  </p>

  <table style="margin-top: 6px;">
    <thead>
      <tr>
        <th style="width: 25%;">OAuth Parameter</th>
        <th style="width: 35%;">Value Sent by Mobile App</th>
        <th style="width: 40%;">Google Server Response</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>client_id</strong></td>
        <td><code>1082348721389-dev.apps.googleusercontent.com</code> (Placeholder)</td>
        <td><span class="tag tag-red">invalid_client</span> The OAuth client was not found in Google Cloud.</td>
      </tr>
      <tr>
        <td><strong>redirect_uri</strong></td>
        <td><code>exp://192.168.x.x:8081</code> (Expo Go scheme)</td>
        <td><span class="tag tag-red">invalid_request</span> Non-compliant custom scheme; violates Google OAuth 2.0 security policy.</td>
      </tr>
    </tbody>
  </table>

  <div class="callout-box">
    <strong>Why Did Google Show a "404 Not Found" Instead of a Helpful Screen?</strong>
    When Google detects security and protocol violations from an external mobile agent, it issues an HTTP 302 redirecting to its internal error URL (<code>https://accounts.google.com/signin/oauth/error?authError=...</code>). Because this private URL is invoked inside an isolated mobile Chrome Custom Tab with no active session or authorization context, Google fails to resolve the session state and returns its standard generic fallback: <strong>404. That’s an error.</strong>
  </div>

  <!-- SECTION 3 -->
  <div class="section-title">3. Solution A: Immediate Demo Testing (No Setup Required)</div>
  <p>
    If you need to test the application, navigate screens, or perform live client demonstrations immediately without waiting for Google Cloud Console provisioning:
  </p>
  
  <div class="success-box">
    <strong>Direct Database Authentication Path:</strong>
    Tap <strong>"Login with Email / Mobile"</strong> located right below the OR divider on the login screen. You can log in using any of the pre-reconciled live demo members in your PostgreSQL database.
  </div>

  <table>
    <thead>
      <tr>
        <th>Member ID</th>
        <th>Mobile Number</th>
        <th>Designation / Post</th>
        <th>Permissions &amp; Access</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>IEI9002</strong></td>
        <td><code>00000002</code></td>
        <td>General Secretary</td>
        <td><span class="tag tag-gold">ADMIN</span> Event check-in scanning, member reviews</td>
      </tr>
      <tr>
        <td><strong>IEI9003</strong></td>
        <td><code>00000003</code></td>
        <td>Chapter Chairman</td>
        <td><span class="tag tag-gold">ADMIN</span> Complete executive view, governance</td>
      </tr>
      <tr>
        <td><strong>IEI9004</strong></td>
        <td><code>00000004</code></td>
        <td>EC Volunteer</td>
        <td><span class="tag tag-green">VOLUNTEER</span> Event Door Check-in &amp; scanning</td>
      </tr>
      <tr>
        <td><strong>IEI9201</strong></td>
        <td><code>00009201</code></td>
        <td>Active Member Alpha</td>
        <td><span class="tag tag-green">MEMBER</span> Digital ID card, profile, declarations</td>
      </tr>
      <tr>
        <td><strong>IEI9202</strong></td>
        <td><code>00009202</code></td>
        <td>Active Member Beta</td>
        <td><span class="tag tag-green">MEMBER</span> Digital ID card, profile, declarations</td>
      </tr>
    </tbody>
  </table>

  <!-- PAGE BREAK -->
  <div class="page-break"></div>

  <!-- HEADER PAGE 2 -->
  <div class="header">
    <div class="header-left">
      ${sealBase64 ? `<img src="${sealBase64}" class="logo" alt="IEI Seal">` : ''}
      <div class="title-group">
        <h1>The Institution of Engineers (India)</h1>
        <p>Kuwait Chapter &bull; Technical Architecture Report</p>
      </div>
    </div>
    <div class="badge-doc">
      <span>PRODUCTION GUIDE</span>
      Google Cloud Setup
    </div>
  </div>

  <!-- SECTION 4 -->
  <div class="section-title">4. Solution B: Production Google Cloud Configuration</div>
  <p>
    To enable native Google Sign-In with real Google accounts, follow this 4-step configuration in the Google Cloud Console:
  </p>

  <ol class="steps-list">
    <li>
      <strong>Create / Select Project in Google Cloud Console:</strong><br>
      Visit <a href="https://console.cloud.google.com/">console.cloud.google.com</a>, create a project named <code>IEI-Kuwait-App</code>, and navigate to <strong>APIs &amp; Services &gt; OAuth consent screen</strong>. Select <em>External</em>, enter App Name (<code>IEI Kuwait</code>), Support Email, and Developer Contact.
    </li>
    <li>
      <strong>Create Android OAuth 2.0 Client ID:</strong><br>
      Go to <strong>APIs &amp; Services &gt; Credentials &gt; Create Credentials &gt; OAuth client ID</strong>:
      <ul style="margin-left: 20px; margin-top: 4px;">
        <li>Application type: <strong>Android</strong></li>
        <li>Package name: <code>org.iei.kuwait</code> (matches <code>app.json</code>)</li>
        <li>SHA-1 certificate fingerprint: Obtain by running <code>npx expo credentials:manager</code> or extracting from your Android debug/release keystore.</li>
      </ul>
    </li>
    <li>
      <strong>Create Web Application Client ID (For Expo Go &amp; Server Verification):</strong><br>
      Create a second credential with Application type: <strong>Web application</strong>:
      <ul style="margin-left: 20px; margin-top: 4px;">
        <li>Name: <code>IEI Mobile Web Client</code></li>
        <li>Authorized JavaScript origins: <code>https://auth.expo.io</code></li>
        <li>Authorized redirect URIs: <code>https://auth.expo.io/@anonymous/IEI-Mobile</code> and <code>ieimobile://oauthredirect</code></li>
      </ul>
    </li>
    <li>
      <strong>Configure Environment Variables in Mobile App:</strong><br>
      Paste the generated Client IDs into <code style="color: #0A1D37; font-weight: 600;">IEI-Mobile/.env</code>:
    </li>
  </ol>

  <div class="code-block"># IEI-Mobile/.env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="[YOUR_CLIENT_ID].apps.googleusercontent.com"
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID="[YOUR_ANDROID_CLIENT_ID].apps.googleusercontent.com"
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID="[YOUR_IOS_CLIENT_ID].apps.googleusercontent.com"</div>

  <!-- SECTION 5 -->
  <div class="section-title">5. Backend Cryptographic Verification Architecture</div>
  <p>
    Once the user selects their account in the official Google prompt, the client sends the cryptographic <code>idToken</code> to the IEI Backend endpoint <code>POST /auth/google</code>. The backend verifies the identity token securely:
  </p>

  <div class="code-block">Mobile App (Continue with Google)
      &darr; (Client ID + redirectUri)
Google OAuth Server (User Authenticates)
      &darr; (Cryptographic Google ID Token returned)
IEI Backend: POST /auth/google
      &darr;
Google Tokeninfo API (Verify Signature, aud, exp, sub)
      &darr;
Match or Create AuthIdentity (provider: GOOGLE, providerUserId: sub)
      &darr;
Issue 7-Day Signed IEI JWT Session
      &darr;
Mobile App Stores Session &amp; Redirects to Member Dashboard</div>

  <!-- SECTION 6 -->
  <div class="section-title">6. Code Safeguards Implemented</div>
  <p>
    To prevent any user from ever seeing Google's raw 404 screen again, the following safeguards are in place:
  </p>
  <ul class="steps-list">
    <li><strong>Client ID Guard:</strong> If no valid Google Client ID is configured in the environment, the app stops the browser from opening and displays a clear message directly on the login screen.</li>
    <li><strong>Compliant Redirect URI:</strong> <code>makeRedirectUri({ scheme: 'ieimobile', path: 'oauthredirect' })</code> is registered to prevent transmission of non-compliant <code>exp://</code> URIs.</li>
    <li><strong>Zero Breaking Changes:</strong> All existing design tokens, fonts, logos, guest browsing, and membership application links remain intact.</li>
  </ul>

  <!-- FOOTER -->
  <div class="footer">
    <span>The Institution of Engineers (India) &bull; Kuwait Chapter</span>
    <span>Confidential &bull; Engineering Information System</span>
  </div>

</body>
</html>`;

async function main() {
  const outHtmlPath = path.join(__dirname, 'Google-Auth-Solution-Guide.html');
  const outPdfPath = path.join(__dirname, 'Google-Auth-Solution-Guide.pdf');

  fs.writeFileSync(outHtmlPath, htmlContent, 'utf8');
  console.log('Generated HTML at:', outHtmlPath);

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const browserPath = fs.existsSync(edgePath) ? edgePath : chromePath;

  if (fs.existsSync(browserPath)) {
    console.log(`Generating PDF via ${path.basename(browserPath)} headless...`);
    const cmd = `"${browserPath}" --headless --disable-gpu --print-to-pdf="${outPdfPath}" --print-to-pdf-no-header "${outHtmlPath}"`;
    execSync(cmd, { stdio: 'inherit' });
    console.log('PDF generated successfully at:', outPdfPath);
  } else {
    console.error('No headless browser found to convert HTML to PDF.');
  }
}

main().catch(console.error);
