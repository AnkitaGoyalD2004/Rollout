import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },
    flagKey: {
      type: String,
      required: true,
    },
    flagName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['CREATED', 'TOGGLED', 'UPDATED', 'DELETED'],
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    performedBy: {
      type: String,
      default: 'Admin User',
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
