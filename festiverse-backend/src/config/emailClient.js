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
const { Resend } = require('resend');

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const EMAIL_USER = process.env.EMAIL_USER;

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'no-reply@udaangecsamastipur.in';


// ── Startup validation ─────────────────────────────────────────────────
const gmailVars = { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, EMAIL_USER };
const missingGmail = Object.entries(gmailVars).filter(([, v]) => !v).map(([k]) => k);

if (RESEND_API_KEY) {
  console.log('✅ Resend API configured (Primary)');
  console.log(`   Sender: ${RESEND_FROM_EMAIL}`);
} else {
  console.warn('⚠️ Resend API NOT configured! Primary email service will be unavailable.');
  console.warn('   Add RESEND_API_KEY to your .env file.');
}

if (missingGmail.length === 0) {
  console.log('✅ Gmail REST API configured (Secondary/Fallback)');
  console.log(`   Sender: ${EMAIL_USER}`);
} else {
  console.error('❌ Gmail REST API NOT configured! Fallback service unavailable. Missing env vars:');
  missingGmail.forEach(k => console.error(`   → ${k} is not set`));
}


// ── Gmail OAuth2 client ────────────────────────────────────────────────
let _oauth2Client = null;

function getOAuth2Client() {
  if (!_oauth2Client) {
    if (missingGmail.length > 0) {
      throw new Error(
        `❌ Cannot send email via Gmail — missing env vars: ${missingGmail.join(', ')}`
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

// ── Resend client ─────────────────────────────────────────────────────
let _resend = null;
function getResendClient() {
  if (!_resend && RESEND_API_KEY) {
    _resend = new Resend(RESEND_API_KEY);
    console.log('📧 Resend client initialized');
  }
  return _resend;
}

// ── Send email via Gmail REST API ──────────────────────────────────────
async function sendEmailViaGmail(to, subject, htmlBody) {
  console.log(`📧 [Gmail API] Attempting fallback to: ${to}`);

  const oauth2Client = getOAuth2Client();
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;

  const rawEmail = [
    `From: "Festiverse'26" <${EMAIL_USER}>`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    htmlBody,
  ].join('\r\n');

  const encodedMessage = Buffer.from(rawEmail)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });
  console.log(`✅ [Gmail API] Email sent successfully! ID: ${result.data.id}`);
  return result.data;
}

// ── Main Send Email with Failover ──────────────────────────────────────
async function sendEmail(to, subject, htmlBody) {
  // 1. Try Resend (Primary)
  if (RESEND_API_KEY) {
    try {
      console.log(`📧 [Resend] Sending to: ${to} | Subject: "${subject.substring(0, 50)}..."`);
      const resend = getResendClient();
      const { data, error } = await resend.emails.send({
        from: `Festiverse'26 <${RESEND_FROM_EMAIL}>`,
        to,
        subject,
        html: htmlBody,
      });

      if (error) {
        console.error(`❌ [Resend] Error: ${error.message}`);
        throw error;
      }

      console.log(`✅ [Resend] Email sent successfully! ID: ${data.id}`);
      return data;
    } catch (err) {
      console.warn(`⚠️ [Resend] Failed. Falling back to Gmail...`);
    }
  } else {
    console.log(`ℹ️ [Resend] Not configured. Using Gmail directly.`);
  }

  // 2. Try Gmail (Fallback)
  try {
    return await sendEmailViaGmail(to, subject, htmlBody);
  } catch (err) {
    console.error(`❌ [Email Service] ALL SERVICES FAILED.`);
    // Re-throw the original Gmail error for debugging
    throw err;
  }
}


// ══════════════════════════════════════════════════════════════════════
//  DESIGN SYSTEM — Minimalist Editorial
//  Palette : Warm parchment canvas · Deep ink · Single saffron accent
//  Fonts   : Cormorant Garamond (display) + Outfit (body/UI)
// ══════════════════════════════════════════════════════════════════════

const T = {
  bg: '#F7F5F2',   // warm parchment background
  surface: '#FFFFFF',   // card surface
  ink: '#141210',   // primary text / headlines
  inkMid: '#3D3A37',   // body text
  inkMute: '#9A958F',   // captions / labels
  inkFaint: '#D4CFC9',   // borders / dividers
  saffron: '#C9820A',   // accent — actions, numbers, highlights
  saffronBg: '#FDF5E6',   // tinted saffron background
  white: '#FFFFFF',
};

// Google Fonts — degrades gracefully in clients that block external CSS
const FONTS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Outfit:wght@300;400;500;600&display=swap');
  </style>`;

// ── Shared email shell ─────────────────────────────────────────────────
function shell(inner) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>Festiverse '26</title>
${FONTS}
</head>
<body style="margin:0;padding:0;background:${T.bg};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${T.bg};">
  <tr>
    <td align="center" style="padding:48px 16px;">
      <table width="540" cellpadding="0" cellspacing="0" border="0"
        style="max-width:540px;width:100%;background:${T.surface};border-radius:2px;border:1px solid ${T.inkFaint};">

        <!-- ── HEADER ─────────────────────────────────────────── -->
        <tr>
          <td>
            <div style="height:3px;background:${T.saffron};"></div>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:36px 48px 28px;">
                  <p style="margin:0 0 10px;color:${T.inkMute};font-size:10px;
                    font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:500;
                    letter-spacing:4px;text-transform:uppercase;text-align:center;">
                    UDAAN &nbsp;·&nbsp; GEC Samastipur
                  </p>
                  <h1 style="margin:0;text-align:center;color:${T.ink};font-size:36px;
                    font-family:'Cormorant Garamond','Georgia','Times New Roman',serif;
                    font-weight:600;letter-spacing:8px;text-transform:uppercase;line-height:1;">
                    Festiverse
                  </h1>
                  <p style="margin:8px 0 0;text-align:center;color:${T.saffron};font-size:11px;
                    font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:500;letter-spacing:6px;">
                    ' 2 6
                  </p>
                </td>
              </tr>
            </table>
            <div style="height:1px;background:${T.inkFaint};margin:0 48px;"></div>
          </td>
        </tr>

        <!-- ── INNER CONTENT ──────────────────────────────────── -->
        ${inner}

        <!-- ── FOOTER ─────────────────────────────────────────── -->
        <tr>
          <td>
            <div style="height:1px;background:${T.inkFaint};margin:0 48px;"></div>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:22px 48px;">
                  <p style="margin:0;text-align:center;color:${T.inkMute};font-size:10px;
                    font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:400;
                    letter-spacing:1px;line-height:1.9;">
                    Festiverse '26 &nbsp;·&nbsp; Government Engineering College, Samastipur<br>
                    <span style="color:${T.inkFaint};">© 2026 UDAAN Cultural Club</span>
                  </p>
                </td>
              </tr>
            </table>
            <div style="height:3px;background:${T.saffron};"></div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ── OTP Email ──────────────────────────────────────────────────────────
async function sendOTPEmail(toEmail, otp) {
  const digits = String(otp).split('');

  const body = `
    <!-- Label -->
    <tr>
      <td style="padding:40px 48px 8px;">
        <p style="margin:0;color:${T.inkMute};font-size:10px;
          font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:500;
          letter-spacing:4px;text-transform:uppercase;text-align:center;">
          Verification Code
        </p>
      </td>
    </tr>

    <!-- Heading -->
    <tr>
      <td style="padding:0 48px 32px;">
        <h2 style="margin:0;text-align:center;color:${T.ink};font-size:24px;
          font-family:'Cormorant Garamond','Georgia','Times New Roman',serif;
          font-weight:400;font-style:italic;line-height:1.5;">
          Enter this code to confirm<br>your identity
        </h2>
      </td>
    </tr>

    <!-- OTP digit boxes -->
    <tr>
      <td style="padding:0 48px 32px;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr>
            ${digits.map(d => `
            <td style="padding:0 5px;">
              <div style="width:54px;height:66px;line-height:66px;
                background:${T.bg};border:1px solid ${T.inkFaint};
                border-bottom:2px solid ${T.saffron};border-radius:2px;
                color:${T.ink};font-size:28px;font-weight:600;
                font-family:'Cormorant Garamond','Georgia','Times New Roman',serif;
                text-align:center;">${d}</div>
            </td>`).join('')}
          </tr>
        </table>
      </td>
    </tr>

    <!-- Validity badge -->
    <tr>
      <td style="padding:0 48px 32px;text-align:center;">
        <span style="display:inline-block;padding:9px 22px;background:${T.saffronBg};
          border-radius:2px;color:${T.saffron};font-size:11px;
          font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:500;
          letter-spacing:2px;text-transform:uppercase;">
          Valid for 5 minutes
        </span>
      </td>
    </tr>

    <!-- Disclaimer -->
    <tr>
      <td style="padding:0 48px 40px;">
        <p style="margin:0;text-align:center;color:${T.inkMute};font-size:12px;
          font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:300;line-height:1.7;">
          If you didn't request this, you can safely ignore this email.<br>Your account remains secure.
        </p>
      </td>
    </tr>`;

  await sendEmail(
    toEmail,
    `Your Verification Code: ${otp} — Festiverse'26`,
    shell(body)
  );
}

// ── Confirmation Email ─────────────────────────────────────────────────
async function sendConfirmationEmail(toEmail, name, festiverse_id) {
  const steps = [
    { n: '01', title: 'Explore Events', desc: 'Browse the full programme of technical and cultural competitions.' },
    { n: '02', title: 'Build Your Team', desc: 'Assemble your ensemble for collaborative events and group challenges.' },
    { n: '03', title: 'Follow the Board', desc: 'Stay updated on schedules, rulebooks, and live announcements.' },
  ];

  const body = `
    <!-- Greeting -->
    <tr>
      <td style="padding:40px 48px 8px;">
        <p style="margin:0 0 6px;color:${T.inkMute};font-size:10px;
          font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:500;
          letter-spacing:4px;text-transform:uppercase;">
          Registration Confirmed
        </p>
        <h2 style="margin:0 0 16px;color:${T.ink};font-size:30px;
          font-family:'Cormorant Garamond','Georgia','Times New Roman',serif;
          font-weight:600;line-height:1.2;">
          Welcome,&nbsp;<em style="color:${T.saffron};font-style:italic;">${name}.</em>
        </h2>
        <p style="margin:0;color:${T.inkMid};font-size:14px;
          font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:300;line-height:1.8;">
          Your registration for Festiverse '26 has been received and confirmed.
          Your seat is reserved at GEC Samastipur's grandest celebration of talent,
          creativity, and competition.
        </p>
      </td>
    </tr>

    <!-- Festiverse ID Block -->
    <tr>
      <td style="padding:28px 48px 0;">
        <table cellpadding="0" cellspacing="0" border="0"
          style="width:100%;background:${T.saffronBg};border-radius:2px;border:1px solid rgba(201,130,10,0.2);border-left:3px solid ${T.saffron};">
          <tr>
            <td style="padding:20px 24px;">
              <p style="margin:0 0 4px;color:${T.saffron};font-size:10px;font-weight:600;
                font-family:'Outfit',Helvetica,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;">
                YOUR FESTIVERSE ID
              </p>
              <p style="margin:0 0 6px;color:${T.ink};font-size:22px;
                font-family:'Cormorant Garamond','Georgia','Times New Roman',serif;font-weight:700;letter-spacing:1px;">
                ${festiverse_id}
              </p>
              <p style="margin:0;color:${T.inkMid};font-size:12px;font-weight:400;
                font-family:'Outfit',Helvetica,Arial,sans-serif;line-height:1.5;">
                Share this unique ID with your team leaders to be added to team events.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Rule -->
    <tr>
      <td style="padding:28px 48px 0;">
        <div style="height:1px;background:${T.inkFaint};"></div>
      </td>
    </tr>

    <!-- What's Next label -->
    <tr>
      <td style="padding:28px 48px 16px;">
        <p style="margin:0;color:${T.inkMute};font-size:10px;
          font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:500;
          letter-spacing:4px;text-transform:uppercase;">
          What's Next
        </p>
      </td>
    </tr>

    <!-- Steps -->
    ${steps.map((s, i) => `
    <tr>
      <td style="padding:0 48px ${i < steps.length - 1 ? '16px' : '28px'};">
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          <tr>
            <td style="width:32px;vertical-align:top;padding-top:2px;">
              <span style="color:${T.saffron};font-size:11px;font-weight:600;
                font-family:'Outfit',Helvetica,Arial,sans-serif;letter-spacing:1px;">${s.n}</span>
            </td>
            <td style="vertical-align:top;border-left:1px solid ${T.inkFaint};padding-left:18px;">
              <p style="margin:0 0 3px;color:${T.ink};font-size:14px;font-weight:500;
                font-family:'Outfit',Helvetica,Arial,sans-serif;">${s.title}</p>
              <p style="margin:0;color:${T.inkMute};font-size:13px;font-weight:300;
                font-family:'Outfit',Helvetica,Arial,sans-serif;line-height:1.65;">${s.desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('')}

    <!-- Rule -->
    <tr>
      <td style="padding:4px 48px 0;">
        <div style="height:1px;background:${T.inkFaint};"></div>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding:28px 48px 40px;">
        <a href="#"
          style="display:inline-block;padding:13px 36px;background:${T.ink};
            color:${T.white};font-size:11px;font-weight:500;border-radius:2px;
            font-family:'Outfit',Helvetica,Arial,sans-serif;
            letter-spacing:3px;text-transform:uppercase;text-decoration:none;">
          Enter the Festival &rarr;
        </a>
        <p style="margin:16px 0 0;color:${T.inkMute};font-size:12px;font-weight:300;
          font-family:'Outfit',Helvetica,Arial,sans-serif;">
          Not your account? Simply disregard this email.
        </p>
      </td>
    </tr>`;

  await sendEmail(
    toEmail,
    `You're Confirmed, ${name} — Festiverse'26`,
    shell(body)
  );
}

// ── Event Registration Email ───────────────────────────────────────────
// Sent when a user successfully registers for a specific competition/event.
// Params:
//   toEmail  — recipient address
//   name     — participant name
//   event    — { title, category, date, venue, teamSize, registrationId }
async function sendEventRegistrationEmail(toEmail, name, event) {
  const meta = [
    { label: 'Category', value: event.category },
    { label: 'Date & Time', value: event.date },
    { label: 'Venue', value: event.venue },
    { label: 'Team Size', value: event.teamSize },
    { label: 'Registration ID', value: event.registrationId },
  ];

  const body = `
    <!-- Heading -->
    <tr>
      <td style="padding:40px 48px 0;">
        <p style="margin:0 0 6px;color:${T.inkMute};font-size:10px;
          font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:500;
          letter-spacing:4px;text-transform:uppercase;">
          Event Registration
        </p>
        <h2 style="margin:0 0 14px;color:${T.ink};font-size:28px;
          font-family:'Cormorant Garamond','Georgia','Times New Roman',serif;
          font-weight:600;line-height:1.25;">
          You're in,&nbsp;<em style="color:${T.saffron};font-style:italic;">${name}.</em>
        </h2>
        <p style="margin:0;color:${T.inkMid};font-size:14px;
          font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:300;line-height:1.8;">
          Your spot at <strong style="font-weight:500;color:${T.ink};">${event.title}</strong>
          has been secured. Find your event details below.
        </p>
      </td>
    </tr>

    <!-- Rule -->
    <tr><td style="padding:24px 48px 0;"><div style="height:1px;background:${T.inkFaint};"></div></td></tr>

    <!-- Event title block -->
    <tr>
      <td style="padding:24px 48px 0;">
        <table cellpadding="0" cellspacing="0" border="0"
          style="width:100%;background:${T.bg};border-radius:2px;border:1px solid ${T.inkFaint};border-left:3px solid ${T.saffron};">
          <tr>
            <td style="padding:18px 24px;">
              <p style="margin:0 0 4px;color:${T.inkMute};font-size:10px;
                font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:500;letter-spacing:3px;text-transform:uppercase;">
                Event
              </p>
              <p style="margin:0;color:${T.ink};font-size:20px;
                font-family:'Cormorant Garamond','Georgia','Times New Roman',serif;
                font-weight:600;line-height:1.2;">
                ${event.title}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Meta table -->
    <tr>
      <td style="padding:16px 48px 0;">
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          ${meta.map((m, i) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid ${T.inkFaint};">
              <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                <tr>
                  <td style="width:140px;color:${T.inkMute};font-size:11px;font-weight:500;
                    font-family:'Outfit',Helvetica,Arial,sans-serif;letter-spacing:1px;">
                    ${m.label}
                  </td>
                  <td style="color:${T.ink};font-size:13px;font-weight:400;
                    font-family:'Outfit',Helvetica,Arial,sans-serif;
                    ${m.label === 'Registration ID' ? `color:${T.saffron};font-weight:600;letter-spacing:1px;` : ''}">
                    ${m.value}
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
      <td style="padding:28px 48px 40px;">
        <a href="#"
          style="display:inline-block;padding:13px 36px;background:${T.ink};
            color:${T.white};font-size:11px;font-weight:500;border-radius:2px;
            font-family:'Outfit',Helvetica,Arial,sans-serif;
            letter-spacing:3px;text-transform:uppercase;text-decoration:none;">
          View My Events &rarr;
        </a>
      </td>
    </tr>`;

  await sendEmail(
    toEmail,
    `Registered for ${event.title} — Festiverse'26`,
    shell(body)
  );
}

// ── Team Invitation Email ──────────────────────────────────────────────
// Sent when a team leader invites someone to join their team for an event.
// Params:
//   toEmail     — recipient address
//   inviteeName — name of the person being invited
//   invite      — { fromName, teamName, eventTitle, message, acceptUrl, expiresIn }
async function sendTeamInviteEmail(toEmail, inviteeName, invite) {
  const body = `
    <!-- Heading -->
    <tr>
      <td style="padding:40px 48px 0;">
        <p style="margin:0 0 6px;color:${T.inkMute};font-size:10px;
          font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:500;
          letter-spacing:4px;text-transform:uppercase;">
          Team Invitation
        </p>
        <h2 style="margin:0 0 14px;color:${T.ink};font-size:28px;
          font-family:'Cormorant Garamond','Georgia','Times New Roman',serif;
          font-weight:600;line-height:1.25;">
          You've been invited,<br>
          <em style="color:${T.saffron};font-style:italic;">${inviteeName}.</em>
        </h2>
        <p style="margin:0;color:${T.inkMid};font-size:14px;
          font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:300;line-height:1.8;">
          <strong style="font-weight:500;color:${T.ink};">${invite.fromName}</strong>
          has invited you to join their team for
          <strong style="font-weight:500;color:${T.ink};">${invite.eventTitle}</strong>.
        </p>
      </td>
    </tr>

    <!-- Rule -->
    <tr><td style="padding:24px 48px 0;"><div style="height:1px;background:${T.inkFaint};"></div></td></tr>

    <!-- Team card -->
    <tr>
      <td style="padding:24px 48px 0;">
        <table cellpadding="0" cellspacing="0" border="0"
          style="width:100%;background:${T.bg};border-radius:2px;border:1px solid ${T.inkFaint};">
          <tr>
            <td style="padding:20px 24px;">
              <p style="margin:0 0 3px;color:${T.inkMute};font-size:10px;font-weight:500;
                font-family:'Outfit',Helvetica,Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;">
                Team Name
              </p>
              <p style="margin:0 0 14px;color:${T.ink};font-size:22px;
                font-family:'Cormorant Garamond','Georgia','Times New Roman',serif;font-weight:600;">
                ${invite.teamName}
              </p>
              <p style="margin:0 0 3px;color:${T.inkMute};font-size:10px;font-weight:500;
                font-family:'Outfit',Helvetica,Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;">
                Competing In
              </p>
              <p style="margin:0;color:${T.inkMid};font-size:13px;font-weight:400;
                font-family:'Outfit',Helvetica,Arial,sans-serif;">
                ${invite.eventTitle}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Personal message (optional) -->
    ${invite.message ? `
    <tr>
      <td style="padding:16px 48px 0;">
        <table cellpadding="0" cellspacing="0" border="0"
          style="width:100%;border-left:3px solid ${T.saffron};background:${T.saffronBg};border-radius:2px;">
          <tr>
            <td style="padding:14px 20px;">
              <p style="margin:0 0 4px;color:${T.saffron};font-size:10px;font-weight:500;
                font-family:'Outfit',Helvetica,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;">
                Message from ${invite.fromName}
              </p>
              <p style="margin:0;color:${T.inkMid};font-size:13px;font-weight:300;
                font-family:'Cormorant Garamond','Georgia','Times New Roman',serif;
                font-style:italic;line-height:1.7;">
                &ldquo;${invite.message}&rdquo;
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : ''}

    <!-- Expiry note -->
    <tr>
      <td style="padding:16px 48px 0;text-align:left;">
        <span style="color:${T.inkMute};font-size:11px;font-weight:300;
          font-family:'Outfit',Helvetica,Arial,sans-serif;">
          This invitation expires in
          <strong style="color:${T.ink};font-weight:500;">${invite.expiresIn || '24 hours'}</strong>.
        </span>
      </td>
    </tr>

    <!-- CTAs -->
    <tr>
      <td style="padding:24px 48px 40px;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-right:12px;">
              <a href="${invite.acceptUrl || '#'}"
                style="display:inline-block;padding:13px 30px;background:${T.ink};
                  color:${T.white};font-size:11px;font-weight:500;border-radius:2px;
                  font-family:'Outfit',Helvetica,Arial,sans-serif;
                  letter-spacing:3px;text-transform:uppercase;text-decoration:none;">
                Accept Invite
              </a>
            </td>
            <td>
              <a href="#"
                style="display:inline-block;padding:12px 30px;background:transparent;
                  color:${T.inkMid};font-size:11px;font-weight:400;border-radius:2px;
                  font-family:'Outfit',Helvetica,Arial,sans-serif;letter-spacing:3px;
                  text-transform:uppercase;text-decoration:none;border:1px solid ${T.inkFaint};">
                Decline
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  await sendEmail(
    toEmail,
    `${invite.fromName} invited you to join ${invite.teamName} — Festiverse'26`,
    shell(body)
  );
}

// ── Result / Certificate Email ─────────────────────────────────────────
// Sent after event results are declared — works for winners and participants.
// Params:
//   toEmail  — recipient address
//   name     — participant name
//   result   — { eventTitle, position, rank, score, certificateUrl, message }
//              position: 'winner' | 'runner-up' | 'participant'
async function sendResultEmail(toEmail, name, result) {
  const isWinner = result.position === 'winner';
  const isRunnerUp = result.position === 'runner-up';
  const isParticipant = result.position === 'participant';

  const badgeMap = {
    'winner': { label: '1st Place', color: T.saffron, bg: T.saffronBg },
    'runner-up': { label: '2nd Place', color: '#6B7280', bg: '#F3F4F6' },
    'participant': { label: 'Participant', color: T.inkMute, bg: T.bg },
  };
  const badge = badgeMap[result.position] || badgeMap['participant'];

  const headline = isWinner
    ? `Congratulations,<br><em style="color:${T.saffron};font-style:italic;">${name}.</em>`
    : isRunnerUp
      ? `Well played,<br><em style="color:${T.ink};font-style:italic;">${name}.</em>`
      : `Thank you,<br><em style="color:${T.ink};font-style:italic;">${name}.</em>`;

  const subtext = isWinner
    ? `You've claimed the top position at <strong style="font-weight:500;color:${T.ink};">${result.eventTitle}</strong>. A remarkable performance.`
    : isRunnerUp
      ? `A strong showing at <strong style="font-weight:500;color:${T.ink};">${result.eventTitle}</strong>. You made it count.`
      : `Your participation at <strong style="font-weight:500;color:${T.ink};">${result.eventTitle}</strong> is appreciated. Every stage performance matters.`;

  const body = `
    <!-- Heading -->
    <tr>
      <td style="padding:40px 48px 0;">
        <p style="margin:0 0 6px;color:${T.inkMute};font-size:10px;
          font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:500;
          letter-spacing:4px;text-transform:uppercase;">
          Results Declared
        </p>
        <h2 style="margin:0 0 14px;color:${T.ink};font-size:28px;
          font-family:'Cormorant Garamond','Georgia','Times New Roman',serif;
          font-weight:600;line-height:1.3;">
          ${headline}
        </h2>
        <p style="margin:0;color:${T.inkMid};font-size:14px;
          font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:300;line-height:1.8;">
          ${subtext}
        </p>
      </td>
    </tr>

    <!-- Rule -->
    <tr><td style="padding:24px 48px 0;"><div style="height:1px;background:${T.inkFaint};"></div></td></tr>

    <!-- Result card -->
    <tr>
      <td style="padding:24px 48px 0;">
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          <tr>
            <!-- Event & badge -->
            <td style="vertical-align:top;padding-right:16px;">
              <table cellpadding="0" cellspacing="0" border="0"
                style="width:100%;background:${T.bg};border-radius:2px;border:1px solid ${T.inkFaint};">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 3px;color:${T.inkMute};font-size:10px;font-weight:500;
                      font-family:'Outfit',Helvetica,Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;">
                      Event
                    </p>
                    <p style="margin:0 0 18px;color:${T.ink};font-size:18px;
                      font-family:'Cormorant Garamond','Georgia','Times New Roman',serif;font-weight:600;">
                      ${result.eventTitle}
                    </p>
                    <!-- Badge -->
                    <span style="display:inline-block;padding:7px 16px;
                      background:${badge.bg};border-radius:2px;
                      color:${badge.color};font-size:10px;font-weight:600;
                      font-family:'Outfit',Helvetica,Arial,sans-serif;
                      letter-spacing:3px;text-transform:uppercase;">
                      ${badge.label}
                    </span>
                    ${result.score ? `
                    <p style="margin:14px 0 0;color:${T.inkMute};font-size:11px;font-weight:400;
                      font-family:'Outfit',Helvetica,Arial,sans-serif;letter-spacing:1px;">
                      Score: <span style="color:${T.ink};font-weight:500;">${result.score}</span>
                    </p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Personal message from organiser (optional) -->
    ${result.message ? `
    <tr>
      <td style="padding:16px 48px 0;">
        <p style="margin:0;color:${T.inkMid};font-size:14px;
          font-family:'Cormorant Garamond','Georgia','Times New Roman',serif;
          font-style:italic;line-height:1.8;border-left:3px solid ${T.inkFaint};padding-left:18px;">
          &ldquo;${result.message}&rdquo;
        </p>
      </td>
    </tr>` : ''}

    <!-- Certificate CTA -->
    <tr>
      <td style="padding:28px 48px 40px;">
        <a href="${result.certificateUrl || '#'}"
          style="display:inline-block;padding:13px 36px;background:${T.ink};
            color:${T.white};font-size:11px;font-weight:500;border-radius:2px;
            font-family:'Outfit',Helvetica,Arial,sans-serif;
            letter-spacing:3px;text-transform:uppercase;text-decoration:none;">
          Download Certificate &rarr;
        </a>
        <p style="margin:14px 0 0;color:${T.inkMute};font-size:12px;font-weight:300;
          font-family:'Outfit',Helvetica,Arial,sans-serif;line-height:1.7;">
          Your certificate of ${isWinner ? 'achievement' : 'participation'} is ready for download.
          Keep it as a memento of Festiverse&nbsp;'26.
        </p>
      </td>
    </tr>`;

  const subjectMap = {
    'winner': `You Won — ${result.eventTitle} | Festiverse'26`,
    'runner-up': `Runner-Up — ${result.eventTitle} | Festiverse'26`,
    'participant': `Your Certificate — ${result.eventTitle} | Festiverse'26`,
  };

  await sendEmail(
    toEmail,
    subjectMap[result.position] || subjectMap['participant'],
    shell(body)
  );
}


// ── Contact Confirmation ─────────────────────────────────────────────
//   toEmail — recipient address
//   name    — name of the user
async function sendContactConfirmationEmail(toEmail, name) {
  const body = `
    <!-- Heading -->
    <tr>
      <td style="padding:40px 48px 0;">
        <p style="margin:0 0 6px;color:${T.inkMute};font-size:10px;
          font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:500;
          letter-spacing:4px;text-transform:uppercase;">
          Inquiry Received
        </p>
        <h2 style="margin:0 0 14px;color:${T.ink};font-size:28px;
          font-family:'Cormorant Garamond','Georgia','Times New Roman',serif;
          font-weight:600;line-height:1.25;">
          Thank you for reaching out,<br>
          <em style="color:${T.saffron};font-style:italic;">${name}.</em>
        </h2>
        <p style="margin:0;color:${T.inkMid};font-size:14px;
          font-family:'Outfit',Helvetica,Arial,sans-serif;font-weight:300;line-height:1.8;">
          We've received your message regarding Festiverse '26. Our team is currently reviewing 
          your inquiry and will get back to you at this email address within 24-48 hours.
        </p>
      </td>
    </tr>

    <!-- Rule -->
    <tr><td style="padding:24px 48px 0;"><div style="height:1px;background:${T.inkFaint};"></div></td></tr>

    <!-- Next steps -->
    <tr>
      <td style="padding:24px 48px 0;">
        <p style="margin:0 0 16px;color:${T.inkMute};font-size:10px;font-weight:600;
          font-family:'Outfit',Helvetica,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;">
          While You Wait
        </p>
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          <tr>
            <td style="padding-bottom:12px;">
              <p style="margin:0;color:${T.inkMid};font-size:13px;font-family:'Outfit',Arial,sans-serif;">
                <strong style="color:${T.ink};">Explore Events:</strong> Check out the latest competitions and workshops on our dashboard.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:12px;">
              <p style="margin:0;color:${T.inkMid};font-size:13px;font-family:'Outfit',Arial,sans-serif;">
                <strong style="color:${T.ink};">Join the Buzz:</strong> Follow us on Instagram for behind-the-scenes updates.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Bottom Padding -->
    <tr><td style="padding-bottom:48px;"></td></tr>
  `;

  return await sendEmail(
    toEmail,
    `Message Received — Festiverse '26`,
    shell(body)
  );
}

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendConfirmationEmail,
  sendEventRegistrationEmail,
  sendTeamInviteEmail,
  sendResultEmail,
  sendContactConfirmationEmail,
};