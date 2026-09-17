import mongoose from 'mongoose';

    const flagSchema = new mongoose.Schema(
      {
        company: {
          type: String,
          required: [true, 'Company name is required'],
          trim: true,
        },
        key: {
          type: String,
          required: [true, 'Flag key is required'],
          trim: true,
          lowercase: true,
          // Ensures flag keys are clean: e.g. "new-checkout", "dark-mode"
          match: [/^[a-z0-9-_]+$/, 'Flag key can only contain lowercase letters, numbers, hyphens, and underscores'],
        },
        name: {
          type: String,
          required: [true, 'Flag name is required'],
          trim: true,
        },
        description: {
          type: String,
          default: '',
          trim: true,
        },
        isEnabled: {
          type: Boolean,
          default: false, // Default is OFF for safety
        },
        rolloutPercentage: {
          type: Number,
          default: 100, // If enabled, 100% of users see it by default
          min: 0,
          max: 100,
        },
        targetUsers: {
          type: [String], // Array of emails or user IDs for whitelist / beta testers
          default: [],
        },
        environment: {
          type: String,
          default: 'development',
        },
        evaluationCount: {
          type: Number,
          default: 0,
        },
        enabledCount: {
          type: Number,
          default: 0,
        },
      },
      {
        timestamps: true, // Automatically adds createdAt and updatedAt
      }
    );

    // Multi-tenant uniqueness: Company A and Company B can have the same flag key independently!
    flagSchema.index({ company: 1, key: 1 }, { unique: true });

    const Flag = mongoose.model('Flag', flagSchema);

    export default Flag;