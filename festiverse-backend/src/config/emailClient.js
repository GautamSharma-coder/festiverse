/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║  Email Client — Festiverse'26  (Gmail REST API)                     ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║                                                                     ║
 * ║  Uses Gmail REST API over HTTPS (port 443) — works on Render free   ║
 * ║  tier where SMTP ports (465/587) are blocked.                       ║
 * ║                                                                     ║
 * ║  REQUIRED ENV VARS:                                                 ║
 * ║    GMAIL_CLIENT_ID      = from Google Cloud Console                 ║
 * ║    GMAIL_CLIENT_SECRET  = from Google Cloud Console                 ║
 * ║    GMAIL_REFRESH_TOKEN  = from OAuth2 Playground                    ║
 * ║    EMAIL_USER           = your Gmail address (sender)               ║
 * ║                                                                     ║
 * ║  SETUP GUIDE (one-time, ~5 minutes):                                ║
 * ║    1. Go to https://console.cloud.google.com                        ║
 * ║    2. Create a project → Enable "Gmail API"                         ║
 * ║    3. Credentials → Create OAuth 2.0 Client ID (Web application)   ║
 * ║       → Add redirect URI: https://developers.google.com/oauthplayground  ║
 * ║    4. Go to https://developers.google.com/oauthplayground           ║
 * ║       → Click ⚙️ gear → Check "Use your own OAuth credentials"     ║
 * ║       → Enter your Client ID & Secret                              ║
 * ║       → Select scope: https://mail.google.com/                     ║
 * ║       → Authorize → Exchange code → Copy the Refresh Token         ║
 * ║    5. Add all 4 env vars to Render dashboard                       ║
 * ║                                                                     ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

const { google } = require('googleapis');

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const EMAIL_USER = process.env.EMAIL_USER;

// ── Startup validation ─────────────────────────────────────────────────
const requiredVars = {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REFRESH_TOKEN,
  EMAIL_USER,
};
const missing = Object.entries(requiredVars).filter(([, v]) => !v).map(([k]) => k);

if (missing.length === 0) {
  console.log('✅ Gmail REST API configured — all env vars present');
  console.log(`   Sender: ${EMAIL_USER}`);
} else {
  console.error('❌ Gmail REST API NOT configured! Missing env vars:');
  missing.forEach(k => console.error(`   → ${k} is not set`));
  console.error('');
  console.error('   📖 SETUP GUIDE:');
  console.error('   1. Go to https://console.cloud.google.com');
  console.error('   2. Create project → Enable "Gmail API"');
  console.error('   3. Credentials → OAuth 2.0 Client ID (Web app)');
  console.error('      Add redirect URI: https://developers.google.com/oauthplayground');
  console.error('   4. Go to https://developers.google.com/oauthplayground');
  console.error('      → ⚙️ Use your own OAuth credentials → Enter Client ID & Secret');
  console.error('      → Select scope: https://mail.google.com/');
  console.error('      → Authorize → Exchange → Copy Refresh Token');
  console.error('   5. Set these env vars on Render:');
  console.error('      GMAIL_CLIENT_ID=xxxxx');
  console.error('      GMAIL_CLIENT_SECRET=xxxxx');
  console.error('      GMAIL_REFRESH_TOKEN=xxxxx');
  console.error('      EMAIL_USER=your@gmail.com');
}

// ── Gmail OAuth2 client ────────────────────────────────────────────────
let _oauth2Client = null;

function getOAuth2Client() {
  if (!_oauth2Client) {
    if (missing.length > 0) {
      throw new Error(
        `❌ Cannot send email — missing env vars: ${missing.join(', ')}\n` +
        `   See the setup guide in emailClient.js or check Render logs on startup.`
      );
    }
    _oauth2Client = new google.auth.OAuth2(
      GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );
    _oauth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });
    console.log('📧 Gmail OAuth2 client initialized');
  }
  return _oauth2Client;
}

// ── Send email via Gmail REST API ──────────────────────────────────────
async function sendEmail(to, subject, htmlBody) {
  console.log(`📧 [Gmail API] Sending to: ${to} | Subject: "${subject.substring(0, 50)}..."`);

  const oauth2Client = getOAuth2Client();

  // MIME-encode subject for non-ASCII chars (RFC 2047)
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;

  // Build RFC 2822 email message
  const rawEmail = [
    `From: "Festiverse'26" <${EMAIL_USER}>`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    htmlBody,
  ].join('\r\n');

  // Base64url encode
  const encodedMessage = Buffer.from(rawEmail)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });
    console.log(`✅ [Gmail API] Email sent successfully! ID: ${result.data.id}`);
    return result.data;
  } catch (err) {
    // Developer-friendly error messages
    const status = err?.response?.status || err?.code;
    const message = err?.response?.data?.error?.message || err.message;

    if (status === 401 || message?.includes('invalid_grant')) {
      throw new Error(
        `[Gmail API] ❌ AUTHENTICATION FAILED (${status})\n` +
        `  → Your GMAIL_REFRESH_TOKEN is expired or invalid.\n` +
        `  → Go to https://developers.google.com/oauthplayground\n` +
        `  → ⚙️ Use your own OAuth credentials → Re-authorize → Get new Refresh Token\n` +
        `  → Update GMAIL_REFRESH_TOKEN on Render`
      );
    }

    if (status === 403) {
      throw new Error(
        `[Gmail API] ❌ PERMISSION DENIED (403): ${message}\n` +
        `  → Make sure Gmail API is enabled in your Google Cloud project\n` +
        `  → Go to https://console.cloud.google.com/apis/library/gmail.googleapis.com\n` +
        `  → Also check that you authorized the scope: https://mail.google.com/`
      );
    }

    if (status === 429) {
      throw new Error(
        `[Gmail API] ❌ RATE LIMIT HIT (429)\n` +
        `  → Gmail API limit: ~100 emails/day for free accounts.\n` +
        `  → Wait and try again later.`
      );
    }

    if (err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
      throw new Error(
        `[Gmail API] ❌ NETWORK ERROR: ${err.message}\n` +
        `  → Cannot reach googleapis.com — check internet connection.\n` +
        `  → This should NOT happen on Render (HTTPS is not blocked).`
      );
    }

    throw new Error(
      `[Gmail API] ❌ UNEXPECTED ERROR: ${message}\n` +
      `  → Status: ${status}\n` +
      `  → Full error: ${JSON.stringify(err?.response?.data || err.message)}`
    );
  }
}

// ── Design tokens — Luxury Editorial ──────────────────────────────────
const C = {
  ink: '#0a0807',
  paper: '#110f0d',
  paperAlt: '#161210',
  rule: '#2a2320',
  ruleLight: '#3a3330',
  cream: '#e8e0d4',
  muted: '#7a6f65',
  dim: '#3d3530',
  crimson: '#c0392b',
  crimsonLt: '#e84040',
  gold: '#c9a84c',
  goldDim: '#8a7030',
};

// ── Ornamental divider ─────────────────────────────────────────────────
function ornaDivider(color = C.rule) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:0 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="border-top:1px solid ${color};"></td>
              <td style="width:8px;padding:0 8px;text-align:center;color:${color};font-size:10px;font-family:Georgia,serif;">◆</td>
              <td style="border-top:1px solid ${color};"></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

// ── Shared header ──────────────────────────────────────────────────────
function emailHeader() {
  return `
    <tr>
      <td>
        <div style="height:1px;background:linear-gradient(90deg,transparent,${C.gold},transparent);"></div>
        <div style="height:3px;background:${C.crimson};"></div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:${C.ink};padding:36px 40px 30px;">
              <p style="margin:0 0 14px;color:${C.goldDim};font-size:9px;font-family:Georgia,serif;letter-spacing:5px;text-transform:uppercase;text-align:center;">— UDAAN Cultural Club &nbsp;·&nbsp; GEC Samastipur —</p>
              <h1 style="margin:0;text-align:center;color:${C.cream};font-size:34px;font-family:Georgia,'Times New Roman',serif;font-weight:700;letter-spacing:6px;text-transform:uppercase;line-height:1;">
                FESTIVERSE
              </h1>
              <p style="margin:4px 0 0;text-align:center;color:${C.crimson};font-size:13px;font-family:Georgia,serif;letter-spacing:8px;">&lsquo;26</p>
              <div style="height:1px;background:linear-gradient(90deg,transparent,${C.goldDim},transparent);margin-top:20px;"></div>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

// ── Shared footer ──────────────────────────────────────────────────────
function emailFooter() {
  return `
    <tr>
      <td style="background:${C.ink};padding:0;">
        <div style="height:1px;background:linear-gradient(90deg,transparent,${C.goldDim},transparent);"></div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 4px;color:${C.goldDim};font-size:9px;font-family:Georgia,serif;letter-spacing:4px;text-transform:uppercase;">FESTIVERSE &lsquo;26</p>
                    <p style="margin:0;color:${C.dim};font-size:10px;font-family:Georgia,serif;letter-spacing:1px;">&copy; 2026 &nbsp;&middot;&nbsp; Government Engineering College, Samastipur</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <div style="height:3px;background:${C.crimson};"></div>
        <div style="height:1px;background:linear-gradient(90deg,transparent,${C.gold},transparent);"></div>
      </td>
    </tr>`;
}

// ── OTP Email ──────────────────────────────────────────────────────────
async function sendOTPEmail(toEmail, otp) {
  const digits = String(otp).split('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Your Festiverse OTP</title>
</head>
<body style="margin:0;padding:0;background:#060504;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#060504;">
  <tr>
    <td align="center" style="padding:48px 16px;">
      <table width="520" cellpadding="0" cellspacing="0" border="0"
        style="max-width:520px;width:100%;background:${C.ink};border-radius:4px;overflow:hidden;border:1px solid ${C.rule};">

        ${emailHeader()}

        <tr>
          <td style="background:${C.ink};padding:40px 40px 12px;">
            <p style="margin:0 0 4px;color:${C.goldDim};font-size:9px;font-family:Georgia,serif;letter-spacing:5px;text-transform:uppercase;text-align:center;">Verification</p>
            <h2 style="margin:0 0 30px;color:${C.cream};font-size:20px;font-family:Georgia,'Times New Roman',serif;font-weight:400;text-align:center;line-height:1.5;font-style:italic;">
              Present this code to<br>confirm your identity
            </h2>
          </td>
        </tr>

        <tr>
          <td style="padding:0 40px 12px;">
            <table cellpadding="0" cellspacing="0" border="0" style="width:100%;background:${C.paperAlt};border:1px solid ${C.rule};border-top:3px solid ${C.crimson};border-radius:2px;">
              <tr>
                <td style="padding:32px 20px;text-align:center;">
                  <p style="margin:0 0 20px;color:${C.goldDim};font-size:10px;font-family:Georgia,serif;letter-spacing:4px;text-transform:uppercase;">Access Code</p>
                  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
                    <tr>
                      ${digits.map(d => `
                      <td style="padding:0 4px;">
                        <span style="display:inline-block;width:58px;height:72px;line-height:72px;
                          background:${C.ink};border:1px solid ${C.ruleLight};border-bottom:2px solid ${C.crimson};
                          color:${C.cream};font-size:32px;font-weight:700;font-family:Georgia,'Times New Roman',serif;
                          text-align:center;border-radius:2px;">${d}</span>
                      </td>`).join('')}
                    </tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                    <tr>
                      <td style="border-top:1px solid ${C.rule};border-bottom:1px solid ${C.rule};padding:8px 20px;text-align:center;">
                        <span style="color:${C.muted};font-size:11px;font-family:Georgia,serif;font-style:italic;">Valid for &nbsp;</span>
                        <span style="color:${C.gold};font-size:11px;font-family:Georgia,serif;font-weight:700;">five minutes</span>
                        <span style="color:${C.muted};font-size:11px;font-family:Georgia,serif;font-style:italic;">&nbsp; from issue</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 40px 36px;">
            <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-left:3px solid ${C.goldDim};background:${C.paperAlt};border-radius:2px;">
              <tr>
                <td style="padding:14px 18px;">
                  <p style="margin:0;color:${C.muted};font-size:12px;font-family:Georgia,'Times New Roman',serif;font-style:italic;line-height:1.7;">
                    This code is issued once and rendered void upon use. Should you not have requested this, disregard this correspondence — your account remains undisturbed.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${ornaDivider()}
        ${emailFooter()}
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendEmail(toEmail, `Your Verification Code: ${otp} — Festiverse'26`, html);
}

// ── Confirmation Email ─────────────────────────────────────────────────
async function sendConfirmationEmail(toEmail, name) {
  const steps = [
    { num: 'I', title: 'Discover Events', desc: 'Browse the complete programme of technical and cultural competitions.' },
    { num: 'II', title: 'Form Your Ensemble', desc: 'Assemble a team for collaborative events and group challenges.' },
    { num: 'III', title: 'Follow the Board', desc: 'Monitor schedules, rulebooks, and live announcements.' },
  ];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Welcome to Festiverse'26</title>
</head>
<body style="margin:0;padding:0;background:#060504;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#060504;">
  <tr>
    <td align="center" style="padding:48px 16px;">
      <table width="520" cellpadding="0" cellspacing="0" border="0"
        style="max-width:520px;width:100%;background:${C.ink};border-radius:4px;overflow:hidden;border:1px solid ${C.rule};">

        ${emailHeader()}

        <tr>
          <td style="background:${C.ink};padding:36px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:4px;background:${C.crimson};border-radius:2px;"></td>
                <td style="padding-left:20px;">
                  <p style="margin:0 0 6px;color:${C.goldDim};font-size:9px;font-family:Georgia,serif;letter-spacing:5px;text-transform:uppercase;">Official Confirmation</p>
                  <h2 style="margin:0 0 10px;color:${C.cream};font-size:26px;font-family:Georgia,'Times New Roman',serif;font-weight:700;line-height:1.2;">
                    Welcome,<br><em style="color:${C.gold};">${name}.</em>
                  </h2>
                  <p style="margin:0;color:${C.muted};font-size:12px;font-family:Georgia,serif;font-style:italic;line-height:1.6;">
                    Your registration for Festiverse&rsquo;26 has been received and confirmed.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 40px 0;">
            <div style="height:1px;background:linear-gradient(90deg,transparent,${C.ruleLight},transparent);"></div>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 40px 28px;">
            <p style="margin:0;color:#9a8e82;font-size:14px;font-family:Georgia,'Times New Roman',serif;line-height:1.85;font-style:italic;">
              &ldquo;The curtain rises. Your seat is reserved at the grandest celebration of talent, creativity, and competition that GEC Samastipur has ever staged. Make it count.&rdquo;
            </p>
          </td>
        </tr>

        ${ornaDivider()}

        <tr>
          <td style="padding:28px 40px 8px;">
            <p style="margin:0 0 20px;color:${C.goldDim};font-size:9px;font-family:Georgia,serif;letter-spacing:5px;text-transform:uppercase;text-align:center;">Your Programme</p>
            <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
              ${steps.map((s, i) => `
              <tr>
                <td style="padding-bottom:${i < steps.length - 1 ? '16px' : '4px'};">
                  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;background:${C.paperAlt};border:1px solid ${C.rule};border-radius:2px;overflow:hidden;">
                    <tr>
                      <td style="width:52px;background:${C.crimson};text-align:center;vertical-align:middle;padding:16px 0;">
                        <span style="color:rgba(255,255,255,0.9);font-size:13px;font-family:Georgia,serif;font-weight:700;">${s.num}</span>
                      </td>
                      <td style="padding:14px 18px;vertical-align:middle;">
                        <p style="margin:0 0 3px;color:${C.cream};font-size:13px;font-weight:700;font-family:Georgia,serif;">${s.title}</p>
                        <p style="margin:0;color:${C.muted};font-size:12px;font-family:Georgia,serif;font-style:italic;line-height:1.5;">${s.desc}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`).join('')}
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 40px 36px;text-align:center;">
            <a href="#" style="display:inline-block;padding:14px 48px;background:${C.crimson};color:#fff;font-size:11px;font-weight:700;font-family:Georgia,serif;letter-spacing:4px;text-transform:uppercase;text-decoration:none;border-radius:2px;border-bottom:2px solid #8a1a10;">
              Enter the Festival &rarr;
            </a>
            <p style="margin:20px 0 0;color:${C.dim};font-size:11px;font-family:Georgia,serif;font-style:italic;">
              Not your account? Simply disregard this correspondence.
            </p>
          </td>
        </tr>

        ${ornaDivider()}
        ${emailFooter()}
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  await sendEmail(toEmail, `Your Admission is Confirmed, ${name} — Festiverse'26`, html);
}

module.exports = { sendOTPEmail, sendConfirmationEmail };