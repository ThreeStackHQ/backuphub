"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBackupFailureAlert = sendBackupFailureAlert;
const resend_1 = require("resend");
function getResend() {
    const key = process.env.RESEND_API_KEY;
    if (!key)
        throw new Error('Missing RESEND_API_KEY');
    return new resend_1.Resend(key);
}
function getFromEmail() {
    return process.env.RESEND_FROM_EMAIL ?? 'alerts@backuphub.threestack.io';
}
async function sendBackupFailureAlert(data, toEmail) {
    if (!toEmail) {
        // TODO: look up workspace owner email from DB
        console.warn('[Alerts] No recipient email, skipping alert');
        return;
    }
    const resend = getResend();
    const { databaseName, databaseType, jobId, errorMessage } = data;
    const dashboardUrl = process.env.NEXTAUTH_URL ?? 'https://backuphub.threestack.io';
    await resend.emails.send({
        from: getFromEmail(),
        to: toEmail,
        subject: `⚠️ Backup failed: ${databaseName}`,
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Backup Failed</h2>
        <p>A backup job for your database <strong>${databaseName}</strong> (${databaseType}) has failed.</p>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <strong>Error:</strong>
          <pre style="margin: 8px 0 0; font-size: 13px; overflow-x: auto;">${errorMessage}</pre>
        </div>
        
        <p><strong>Job ID:</strong> <code>${jobId}</code></p>
        
        <p>
          <a href="${dashboardUrl}/dashboard" 
             style="background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">
            View Dashboard
          </a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="color: #6b7280; font-size: 13px;">
          BackupHub — Managed database backups<br>
          <a href="${dashboardUrl}" style="color: #2563eb;">backuphub.threestack.io</a>
        </p>
      </div>
    `,
    });
}
//# sourceMappingURL=alerts.js.map