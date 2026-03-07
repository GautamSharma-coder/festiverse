/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║  Email Client — Festiverse'26                                       ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║                                                                     ║
 * ║  PRIORITY 1: Resend HTTP API  (set RESEND_API_KEY env var)          ║
 * ║    → Works everywhere including Render free tier                    ║
 * ║    → Sign up free at https://resend.com                             ║
 * ║    → Get your API key at https://resend.com/api-keys                ║
 * ║                                                                     ║
 * ║  PRIORITY 2: Nodemailer SMTP  (set EMAIL_USER + EMAIL_APP_PASSWORD) ║
 * ║    → Only works locally or on paid hosting (SMTP ports open)        ║
 * ║    → ⚠️ WILL FAIL on Render free tier (ports 465/587 blocked)      ║
 * ║                                                                     ║
 * ║  REQUIRED ENV VARS (pick one set):                                  ║
 * ║    Option A: RESEND_API_KEY=re_xxxxxxxxx  (recommended)             ║
 * ║    Option B: EMAIL_USER=you@gmail.com                               ║
 * ║              EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx                  ║
 * ║                                                                     ║
 * ║  OPTIONAL:                                                          ║
 * ║    EMAIL_FROM=Your Name <you@yourdomain.com>                        ║
 * ║                                                                     ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Festiverse\'26 <onboarding@resend.dev>';

// Log which email provider will be used on startup
if (RESEND_API_KEY) {
  console.log('✅ Email provider: Resend HTTP API (RESEND_API_KEY is set)');
} else if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
  console.log('⚠️  Email provider: Nodemailer SMTP (fallback — will FAIL on Render free tier!)');
  console.log('   → To fix: set RESEND_API_KEY env var. Get one free at https://resend.com/api-keys');
} else {
  console.error('❌ EMAIL IS NOT CONFIGURED! No emails will be sent.');
  console.error('   → Option A (recommended): Set RESEND_API_KEY env var');
  console.error('     Sign up at https://resend.com → API Keys → Create API Key');
  console.error('   → Option B (local only):   Set EMAIL_USER + EMAIL_APP_PASSWORD env vars');
}

// ── Send email via Resend HTTP API ─────────────────────────────────────
async function sendViaResend(to, subject, html) {
  console.log(`📧 [Resend] Sending to: ${to} | Subject: "${subject.substring(0, 50)}..."`);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const status = res.status;

    // Developer-friendly error messages for common Resend errors
    if (status === 401) {
      throw new Error(
        `[Resend] ❌ INVALID API KEY (401 Unauthorized)\n` +
        `  → Your RESEND_API_KEY is wrong or expired.\n` +
        `  → Go to https://resend.com/api-keys and create a new one.\n` +
        `  → Make sure you copied the full key starting with "re_"`
      );
    }
    if (status === 403) {
      throw new Error(
        `[Resend] ❌ FORBIDDEN (403)\n` +
        `  → Your API key doesn't have permission to send emails.\n` +
        `  → If using a custom "from" address, verify your domain first at https://resend.com/domains\n` +
        `  → Or remove EMAIL_FROM env var to use the default "onboarding@resend.dev"`
      );
    }
    if (status === 422) {
      throw new Error(
        `[Resend] ❌ VALIDATION ERROR (422): ${err.message || JSON.stringify(err)}\n` +
        `  → Check that the "to" email address is valid: "${to}"\n` +
        `  → Check that EMAIL_FROM is properly formatted: "${EMAIL_FROM}"`
      );
    }
    if (status === 429) {
      throw new Error(
        `[Resend] ❌ RATE LIMIT HIT (429)\n` +
        `  → Free tier limit: 100 emails/day, 2 emails/second.\n` +
        `  → Wait a moment and try again, or upgrade at https://resend.com/pricing`
      );
    }

    throw new Error(
      `[Resend] ❌ API ERROR (${status}): ${err.message || JSON.stringify(err)}\n` +
      `  → Check Resend dashboard for details: https://resend.com/emails`
    );
  }

  const result = await res.json();
  console.log(`✅ [Resend] Email sent successfully! ID: ${result.id}`);
  return result;
}

// ── Send email via Nodemailer SMTP (local dev fallback) ────────────────
let _transporter = null;
async function sendViaSMTP(to, subject, html) {
  console.log(`📧 [SMTP] Sending to: ${to} | Subject: "${subject.substring(0, 50)}..."`);

  if (!_transporter) {
    const nodemailer = require('nodemailer');
    _transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
      family: 4,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    console.log('📧 [SMTP] Gmail transporter created');
  }

  try {
    const info = await _transporter.sendMail({
      from: `"Festiverse'26" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ [SMTP] Email sent successfully! MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    // Developer-friendly error messages for common SMTP errors
    if (err.code === 'ESOCKET' || err.code === 'ETIMEDOUT' || err.code === 'ENETUNREACH') {
      throw new Error(
        `[SMTP] ❌ CONNECTION FAILED: ${err.message}\n` +
        `  → 🚨 If on Render free tier: SMTP ports (465/587) are BLOCKED!\n` +
        `  → FIX: Switch to Resend HTTP API instead:\n` +
        `     1. Sign up free at https://resend.com\n` +
        `     2. Get API key at https://resend.com/api-keys\n` +
        `     3. Add RESEND_API_KEY=re_xxxxx to Render env vars\n` +
        `  → If running locally: check your internet connection`
      );
    }
    if (err.code === 'EAUTH' || err.responseCode === 535) {
      throw new Error(
        `[SMTP] ❌ AUTHENTICATION FAILED\n` +
        `  → EMAIL_USER: "${process.env.EMAIL_USER}" — is this correct?\n` +
        `  → EMAIL_APP_PASSWORD — is this a valid Gmail App Password?\n` +
        `  → Generate one at: https://myaccount.google.com/apppasswords\n` +
        `  → Make sure 2FA is enabled on your Google account first`
      );
    }

    throw new Error(`[SMTP] ❌ UNKNOWN ERROR: ${err.message} (code: ${err.code})`);
  }
}

// ── Unified send function ──────────────────────────────────────────────
async function sendEmail(to, subject, html) {
  if (RESEND_API_KEY) {
    return sendViaResend(to, subject, html);
  }
  if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
    return sendViaSMTP(to, subject, html);
  }
  throw new Error(
    `❌ NO EMAIL PROVIDER CONFIGURED!\n` +
    `  → Option A (recommended for Render): Set RESEND_API_KEY env var\n` +
    `     1. Sign up free at https://resend.com\n` +
    `     2. Create API key at https://resend.com/api-keys\n` +
    `     3. Add to Render: RESEND_API_KEY=re_xxxxxxxxx\n` +
    `  → Option B (local dev only): Set these env vars:\n` +
    `     EMAIL_USER=your@gmail.com\n` +
    `     EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx`
  );
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
        <!-- Gold top rule -->
        <div style="height:1px;background:linear-gradient(90deg,transparent,${C.gold},transparent);"></div>
        <div style="height:3px;background:${C.crimson};"></div>

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:${C.ink};padding:36px 40px 30px;">

              <!-- Eyebrow -->
              <p style="margin:0 0 14px;color:${C.goldDim};font-size:9px;font-family:Georgia,serif;letter-spacing:5px;text-transform:uppercase;text-align:center;">— UDAAN Cultural Club &nbsp;·&nbsp; GEC Samastipur —</p>

              <!-- Masthead -->
              <h1 style="margin:0;text-align:center;color:${C.cream};font-size:34px;font-family:Georgia,'Times New Roman',serif;font-weight:700;letter-spacing:6px;text-transform:uppercase;line-height:1;">
                FESTIVERSE
              </h1>
              <p style="margin:4px 0 0;text-align:center;color:${C.crimson};font-size:13px;font-family:Georgia,serif;letter-spacing:8px;">&lsquo;26</p>

              <!-- Gold rule under masthead -->
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

        <!-- Body -->
        <tr>
          <td style="background:${C.ink};padding:40px 40px 12px;">
            <p style="margin:0 0 4px;color:${C.goldDim};font-size:9px;font-family:Georgia,serif;letter-spacing:5px;text-transform:uppercase;text-align:center;">Verification</p>
            <h2 style="margin:0 0 30px;color:${C.cream};font-size:20px;font-family:Georgia,'Times New Roman',serif;font-weight:400;text-align:center;line-height:1.5;font-style:italic;">
              Present this code to<br>confirm your identity
            </h2>
          </td>
        </tr>

        <!-- OTP stage -->
        <tr>
          <td style="padding:0 40px 12px;">
            <table cellpadding="0" cellspacing="0" border="0" style="width:100%;background:${C.paperAlt};border:1px solid ${C.rule};border-top:3px solid ${C.crimson};border-radius:2px;">
              <tr>
                <td style="padding:32px 20px;text-align:center;">

                  <!-- Corner ornaments via thin lines -->
                  <p style="margin:0 0 20px;color:${C.goldDim};font-size:10px;font-family:Georgia,serif;letter-spacing:4px;text-transform:uppercase;">Access Code</p>

                  <!-- Digit tiles -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
                    <tr>
                      ${digits.map(d => `
                      <td style="padding:0 4px;">
                        <span style="display:inline-block;width:58px;height:72px;line-height:72px;
                          background:${C.ink};
                          border:1px solid ${C.ruleLight};
                          border-bottom:2px solid ${C.crimson};
                          color:${C.cream};font-size:32px;font-weight:700;
                          font-family:Georgia,'Times New Roman',serif;
                          text-align:center;border-radius:2px;">${d}</span>
                      </td>`).join('')}
                    </tr>
                  </table>

                  <!-- Validity -->
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

        <!-- Notice -->
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

        <!-- Admission stamp section -->
        <tr>
          <td style="background:${C.ink};padding:36px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <!-- Left: thick crimson rule -->
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

        <!-- Horizontal rule -->
        <tr>
          <td style="padding:28px 40px 0;">
            <div style="height:1px;background:linear-gradient(90deg,transparent,${C.ruleLight},transparent);"></div>
          </td>
        </tr>

        <!-- Body prose -->
        <tr>
          <td style="padding:24px 40px 28px;">
            <p style="margin:0;color:#9a8e82;font-size:14px;font-family:Georgia,'Times New Roman',serif;line-height:1.85;font-style:italic;">
              &ldquo;The curtain rises. Your seat is reserved at the grandest celebration of talent, creativity, and competition that GEC Samastipur has ever staged. Make it count.&rdquo;
            </p>
          </td>
        </tr>

        ${ornaDivider()}

        <!-- Programme steps -->
        <tr>
          <td style="padding:28px 40px 8px;">
            <p style="margin:0 0 20px;color:${C.goldDim};font-size:9px;font-family:Georgia,serif;letter-spacing:5px;text-transform:uppercase;text-align:center;">Your Programme</p>
            <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
              ${steps.map((s, i) => `
              <tr>
                <td style="padding-bottom:${i < steps.length - 1 ? '16px' : '4px'};">
                  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;background:${C.paperAlt};border:1px solid ${C.rule};border-radius:2px;overflow:hidden;">
                    <tr>
                      <!-- Roman numeral column -->
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

        <!-- CTA -->
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