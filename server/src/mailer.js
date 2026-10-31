import nodemailer from 'nodemailer';
import { config } from './config.js';

let transport = null;
const m = config.mail;
if (m.host && m.user && m.pass) {
  transport = nodemailer.createTransport({
    host: m.host, port: m.port, secure: m.secure, auth: { user: m.user, pass: m.pass },
  });
} else {
  console.warn('[mail] SMTP belum dikonfigurasi. Pesan kontak hanya disimpan di database.');
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function sendContactMail({ name, email, subject, message }) {
  if (!transport) return 'skipped';
  try {
    await transport.sendMail({
      from: `"Task Today" <${m.from}>`,
      to: m.to,
      replyTo: `"${name.replace(/["\r\n]/g, '')}" <${email}>`,
      subject: `[Task Today] ${subject || 'Pesan baru dari formulir kontak'}`.replace(/[\r\n]/g, ' '),
      text: `Dari: ${name} <${email}>\n\n${message}`,
      html: `<p><b>Dari:</b> ${esc(name)} &lt;${esc(email)}&gt;</p><p style="white-space:pre-wrap">${esc(message)}</p>`,
    });
    return 'sent';
  } catch (err) {
    console.error('[mail] gagal kirim:', err.message);
    return 'failed';
  }
}
