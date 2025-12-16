import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { requireAuth } from '../middleware/auth.js';
import FileModel from '../models/File.js';
import User from '../models/User.js';
import { isAllowedMimetype, maxFileSizeBytes } from '../utils/validateFile.js';
// S3 removed: all storage is local-only now

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

function sanitize(name) {
  return name.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${nanoid(8)}-${sanitize(file.originalname)}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: maxFileSizeBytes(), files: 10 },
  fileFilter: (req, file, cb) => {
    if (isAllowedMimetype(file.mimetype)) return cb(null, true);
    cb(new Error('Invalid file type'));
  }
});

router.post('/upload', requireAuth, (req, res) => {
  upload.array('files', 10)(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload error' });
    try {
      const saved = await Promise.all(
        (req.files || []).map((f) =>
          FileModel.create({
            owner: req.user.id,
            originalName: f.originalname,
            storedName: f.filename,
            mimetype: f.mimetype,
            size: f.size
          })
        )
      );

      // S3 mirror upload removed
      res.status(201).json(saved.map((doc) => ({
        id: doc._id,
        originalName: doc.originalName,
        mimetype: doc.mimetype,
        size: doc.size,
        uploadedAt: doc.uploadedAt
      })));
    } catch (e) {
      res.status(500).json({ message: 'Failed to save files' });
    }
  });
});

router.get('/', requireAuth, async (req, res) => {
  const myFiles = await FileModel.find({ owner: req.user.id }).sort({ uploadedAt: -1 });
  const sharedWithMe = await FileModel.find({ sharedWith: req.user.id }).sort({ uploadedAt: -1 });
  res.json({ myFiles, sharedWithMe });
});

async function ensureCanAccess(file, userId) {
  const isOwner = file.owner.toString() === userId;
  const isShared = file.sharedWith.some((u) => u.toString() === userId);
  return isOwner || isShared;
}

router.get('/:id/download', requireAuth, async (req, res) => {
  const file = await FileModel.findById(req.params.id);
  if (!file) return res.status(404).json({ message: 'Not found' });
  const ok = await ensureCanAccess(file, req.user.id);
  if (!ok) return res.status(403).json({ message: 'Forbidden' });
  const fullPath = path.join(uploadDir, file.storedName);
  if (!fs.existsSync(fullPath)) return res.status(410).json({ message: 'File missing' });
  res.setHeader('Content-Type', file.mimetype);
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
  fs.createReadStream(fullPath).pipe(res);
});

router.post('/:id/share/users', requireAuth, async (req, res) => {
  const { emails } = req.body;
  if (!Array.isArray(emails) || emails.length === 0) return res.status(400).json({ message: 'Emails required' });
  const file = await FileModel.findById(req.params.id);
  if (!file) return res.status(404).json({ message: 'Not found' });
  if (file.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Only owner can share' });

  const users = await User.find({ email: { $in: emails.map((e) => e.toLowerCase()) } }).select('_id email');
  const ids = users.map((u) => u._id.toString());
  const merged = new Set([...(file.sharedWith || []).map(String), ...ids]);
  file.sharedWith = Array.from(merged);
  await file.save();
  res.json({ sharedWith: users });
});

router.post('/:id/share/link', requireAuth, async (req, res) => {
  const file = await FileModel.findById(req.params.id);
  if (!file) return res.status(404).json({ message: 'Not found' });
  if (file.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Only owner can share' });
  if (!file.shareToken) file.shareToken = nanoid(12);
  await file.save();
  res.json({ token: file.shareToken, urlPath: `/share/${file.shareToken}` });
});

export default router;
