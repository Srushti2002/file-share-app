import express from 'express';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.js';
import FileModel from '../models/File.js';
// S3 removed: links and downloads served locally

const router = express.Router();
const uploadDir = path.join(process.cwd(), 'uploads');

async function ensureCanAccess(file, userId) {
  const isOwner = file.owner.toString() === userId;
  const isShared = file.sharedWith.some((u) => u.toString() === userId);
  return isOwner || isShared;
}

router.get('/:token/download', requireAuth, async (req, res) => {
  const file = await FileModel.findOne({ shareToken: req.params.token });
  if (!file) return res.status(404).json({ message: 'Invalid link' });
  const ok = await ensureCanAccess(file, req.user.id);
  if (!ok) return res.status(403).json({ message: 'Forbidden' });
  // Presigned S3 redirects removed; stream local file below
  const fullPath = path.join(uploadDir, file.storedName);
  if (!fs.existsSync(fullPath)) return res.status(410).json({ message: 'File missing' });
  res.setHeader('Content-Type', file.mimetype);
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
  fs.createReadStream(fullPath).pipe(res);
});

router.post('/:id/share/link', requireAuth, async (req, res) => {
  const file = await FileModel.findById(req.params.id);
  if (!file) return res.status(404).json({ message: 'Not found' });
  if (file.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Only owner can share' });

  // On-demand S3 upload removed

  if (!file.shareToken) file.shareToken = (await import('nanoid')).nanoid(12);
  await file.save();
  const base = (process.env.API_BASE_URL || '').replace(/\/$/, '');
  const urlPath = `/share/${file.shareToken}`;
  const fullUrl = base ? `${base}/api${urlPath}` : urlPath;
  res.json({ token: file.shareToken, urlPath, url: fullUrl });
});

export default router;
