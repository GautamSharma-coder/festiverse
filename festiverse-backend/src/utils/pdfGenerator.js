const PDFDocument = require('pdfkit');
const path = require('path');

/**
 * Generates a Festiverse '26 Certificate as a PDF buffer.
 * @param {Object} data { name, eventName, type, date, rank }
 * @returns {Promise<Buffer>}
 */
async function generateCertificate(data) {
   return new Promise((resolve, reject) => {
      const { name, eventName, type = 'Participation', date = "March 2026", rank } = data;

      // Create a landscape A4 document (841.89 x 595.28 pts)
      const doc = new PDFDocument({
         size: 'A4',
         layout: 'landscape',
         margin: 0
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ── IMAGE TEMPLATE ────────────────────────────────────────────────
      const templatePath = path.join(__dirname, '../../public/certificate.png');

      try {
         // Draw the background template to fill the page
         doc.image(templatePath, 0, 0, {
            width: doc.page.width,
            height: doc.page.height
         });
      } catch (err) {
         console.error('TEMPLATE LOAD ERROR:', err);
         // Fallback to basic design if image fails
         doc.rect(0, 0, doc.page.width, doc.page.height).fill('#F7F5F2');
      }

      // ── OVERLAY TEXT ──────────────────────────────────────────────────
      // Note: Coordinates are estimated based on the visual layout of certificate.png

      const centerX = doc.page.width / 2;

      // 1. Overlay achievement type if it's NOT participation
      if (rank || type === 'Achievement') {
         // Overlay a white box to cover "OF PARTICIPATION"
         doc.rect(centerX - 150, 255, 300, 25).fill('#FFF');
         doc.fillColor('#A67C52') // Matches the gold/brown tone
            .font('Helvetica-Bold')
            .fontSize(14)
            .text(rank ? `OF ACHIEVEMENT (${rank.toUpperCase()})` : 'OF ACHIEVEMENT', 0, 260, { align: 'center', characterSpacing: 2 });
      }

      // 2. Recipient Name
      doc.fillColor('#433E3B') // Deep charcoal
         .font('Times-BoldItalic')
         .fontSize(44)
         .text(name, 0, 365, { align: 'center' });

      // 3. Event Name
      // We need to wrap this or fit it in the sentence
      doc.fillColor('#555')
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('For participating in', 0, 485, { align: 'center' });

      doc.moveDown(0.5);
      doc.fillColor('#433E3B')
         .font('Times-Bold')
         .fontSize(18)
         .text(eventName.toUpperCase(), { align: 'center', characterSpacing: 1 });

      // 4. Date (Small at the bottom)
      doc.fillColor('#999')
         .font('Helvetica')
         .fontSize(9)
         .text(`Issued during Festiverse '26 — ${date}`, 0, 560, { align: 'center' });

      doc.end();
   });
}

module.exports = { generateCertificate };
