import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    shareToken: { type: String, index: true }
  },
  { timestamps: true }
);

export default mongoose.model('File', fileSchema);
