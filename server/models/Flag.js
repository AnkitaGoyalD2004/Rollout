import mongoose from 'mongoose';

    const flagSchema = new mongoose.Schema(
      {
        key: {
          type: String,
          required: [true, 'Flag key is required'],
          unique: true,
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
          enum: ['development', 'staging', 'production'],
          default: 'production',
        },
      },
      {
        timestamps: true, // Automatically adds createdAt and updatedAt
      }
    );

    const Flag = mongoose.model('Flag', flagSchema);

    export default Flag;