import express from 'express';
import authMiddleware from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';
import Flag from '../models/Flag.js';
import { evaluateFlag } from '../utils/evaluator.js';

const router = express.Router();

// 1. GET ALL FLAGS (Strictly scoped to authenticated user's company workspace)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { env } = req.query;
    // Security guarantee: User can ONLY see their own company's flags
    const filter = { company: req.user.company };
    if (env && env !== 'all') {
      filter.environment = env;
    }
    const flags = await Flag.find(filter).sort({ createdAt: -1 });
    res.json(flags);
  } catch (error) {
    console.error('❌ MongoDB Fetch Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 2. GET AUDIT LOGS (Strictly scoped to authenticated user's company workspace)
router.get('/audit-logs', authMiddleware, async (req, res) => {
  try {
    const filter = { company: req.user.company };
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    console.error('❌ Audit Logs Fetch Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 3. CREATE A NEW FLAG (Strictly assigned to authenticated user's company workspace)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { key, name, description, isEnabled, rolloutPercentage, targetUsers, environment } = req.body;
    const company = req.user.company;

    const existingFlag = await Flag.findOne({ key, company });
    if (existingFlag) {
      return res.status(400).json({ error: `Flag with key "${key}" already exists in your workspace (${company})` });
    }

    const flag = new Flag({
      company,
      key,
      name,
      description,
      isEnabled: isEnabled || false,
      rolloutPercentage: rolloutPercentage !== undefined ? rolloutPercentage : 100,
      targetUsers: targetUsers || [],
      environment: environment || 'development',
    });

    await flag.save();

    // Record Audit Log with user identity
    try {
      await AuditLog.create({
        company: flag.company,
        flagKey: flag.key,
        flagName: flag.name,
        action: 'CREATED',
        details: `Created flag in ${flag.company} with ${flag.rolloutPercentage}% rollout (${flag.isEnabled ? 'LIVE' : 'OFF'}) in ${flag.environment}`,
        newValue: { isEnabled: flag.isEnabled, rolloutPercentage: flag.rolloutPercentage, environment: flag.environment, company: flag.company },
        performedBy: req.user.name || req.user.email,
      });
    } catch (logErr) {
      console.error('AuditLog write error:', logErr.message);
    }

    res.status(201).json(flag);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 4. TOGGLE FLAG ON/OFF (Protected: only flags belonging to user's company can be toggled)
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const flag = await Flag.findById(req.params.id);
    if (!flag) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    if (flag.company !== req.user.company) {
      return res.status(403).json({ error: 'Access denied: You do not have permission to modify flags in this workspace.' });
    }

    const oldStatus = flag.isEnabled;
    flag.isEnabled = !flag.isEnabled;
    await flag.save();

    // Record Audit Log
    try {
      await AuditLog.create({
        company: flag.company,
        flagKey: flag.key,
        flagName: flag.name,
        action: 'TOGGLED',
        details: `Switched from ${oldStatus ? 'LIVE' : 'OFF'} to ${flag.isEnabled ? 'LIVE' : 'OFF'}`,
        previousValue: oldStatus,
        newValue: flag.isEnabled,
        performedBy: req.user.name || req.user.email,
      });
    } catch (logErr) {
      console.error('AuditLog write error:', logErr.message);
    }

    res.json(flag);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 5. UPDATE FLAG (Protected: only flags belonging to user's company can be updated)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, isEnabled, rolloutPercentage, targetUsers, environment } = req.body;

    const existingFlag = await Flag.findById(req.params.id);
    if (!existingFlag) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    if (existingFlag.company !== req.user.company) {
      return res.status(403).json({ error: 'Access denied: You do not have permission to modify flags in this workspace.' });
    }

    const oldRollout = existingFlag.rolloutPercentage;
    const flag = await Flag.findByIdAndUpdate(
      req.params.id,
      { name, description, isEnabled, rolloutPercentage, targetUsers, environment },
      { new: true, runValidators: true }
    );

    // Record Audit Log
    try {
      await AuditLog.create({
        company: flag.company,
        flagKey: flag.key,
        flagName: flag.name,
        action: 'UPDATED',
        details: `Updated rollout from ${oldRollout}% to ${rolloutPercentage}% (${flag.targetUsers?.length || 0} whitelisted)`,
        previousValue: { rolloutPercentage: oldRollout },
        newValue: { rolloutPercentage: flag.rolloutPercentage, targetUsers: flag.targetUsers, company: flag.company },
        performedBy: req.user.name || req.user.email,
      });
    } catch (logErr) {
      console.error('AuditLog write error:', logErr.message);
    }

    res.json(flag);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 6. DELETE FLAG (Protected: only flags belonging to user's company can be deleted)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const flag = await Flag.findById(req.params.id);
    if (!flag) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    if (flag.company !== req.user.company) {
      return res.status(403).json({ error: 'Access denied: You do not have permission to delete flags in this workspace.' });
    }

    await Flag.findByIdAndDelete(req.params.id);

    // Record Audit Log
    try {
      await AuditLog.create({
        company: flag.company,
        flagKey: flag.key,
        flagName: flag.name,
        action: 'DELETED',
        details: `Deleted flag "${flag.name}" (${flag.key}) in ${flag.company}`,
        performedBy: req.user.name || req.user.email,
      });
    } catch (logErr) {
      console.error('AuditLog write error:', logErr.message);
    }

    res.json({ message: 'Flag deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. EVALUATE SINGLE FLAG (Called by client apps to check a feature for specific company)
router.get('/evaluate/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { userId, env, company } = req.query;

    const queryFilter = { key };
    if (env && env !== 'all') {
      queryFilter.environment = env;
    }
    if (company && company !== 'all') {
      queryFilter.company = company;
    }

    const flag = await Flag.findOne(queryFilter);
    if (!flag) {
      return res.status(404).json({ 
        error: `Flag "${key}" not found${company ? ` in company "${company}"` : ''} (env: "${env || 'any'}")`, 
        enabled: false 
      });
    }

    const evaluation = evaluateFlag(flag, userId);

    // 📈 Asynchronously record evaluation traffic metrics
    Flag.findByIdAndUpdate(flag._id, {
      $inc: {
        evaluationCount: 1,
        enabledCount: evaluation.enabled ? 1 : 0,
      },
    }).catch((err) => console.error('Traffic increment error:', err.message));

    res.json({
      company: flag.company,
      flagKey: key,
      environment: flag.environment,
      userId: userId || null,
      enabled: evaluation.enabled,
      reason: evaluation.reason,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
