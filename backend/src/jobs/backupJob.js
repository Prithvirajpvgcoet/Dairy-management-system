const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const BACKUP_DIR = path.join(__dirname, '../../../database/backups');
const RETENTION_DAYS = 14;

function runNightlyBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const user = process.env.DB_USER || 'root';
  const pass = process.env.DB_PASSWORD || '';
  const db = process.env.DB_NAME || 'dairy_db';

  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const targetFile = path.join(BACKUP_DIR, `backup_${dateStr}.sql`);
  const mysqldumpBin = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe';

  const passArg = pass ? `-p"${pass}"` : '';
  const cmd = `"${mysqldumpBin}" -u ${user} ${passArg} ${db} > "${targetFile}"`;

  console.log(`[Backup Job] Starting automated nightly backup to ${targetFile}...`);
  exec(cmd, { shell: 'cmd.exe' }, (err) => {
    if (err) {
      console.error('[Backup Job] Failed to create backup:', err.message);
      return;
    }
    console.log('[Backup Job] Nightly backup created successfully.');

    // Prune backups older than 14 days
    try {
      const now = Date.now();
      const maxAgeMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;
      const files = fs.readdirSync(BACKUP_DIR);
      files.forEach((file) => {
        if (file.startsWith('backup_') && file.endsWith('.sql')) {
          const filePath = path.join(BACKUP_DIR, file);
          const stats = fs.statSync(filePath);
          if (now - stats.mtimeMs > maxAgeMs) {
            fs.unlinkSync(filePath);
            console.log(`[Backup Job] Pruned old backup: ${file}`);
          }
        }
      });
    } catch (cleanErr) {
      console.warn('[Backup Job] Prune warning:', cleanErr.message);
    }
  });
}

module.exports = { runNightlyBackup };
