 import express from 'express';
import Flag from '../models/Flag.js';
import { evaluateFlag } from '../utils/evaluator.js';
    
    const router = express.Router();
    
   // 1. GET ALL FLAGS (For Dashboard)
    router.get('/', async (req, res) => {
      console.log('📡 Fetching all flags from MongoDB...');
      try {
        const flags = await Flag.find().sort({ createdAt: -1 });
        console.log(`✅ Successfully fetched ${flags.length} flags`);
        res.json(flags);
      } catch (error) {
        console.error('❌ MongoDB Fetch Error:', error.message);
        res.status(500).json({ 
          error: error.message, 
          details: 'Error querying MongoDB collection' 
        });
      }
    });

    
    // 2. CREATE A NEW FLAG
    router.post('/', async (req, res) => {
      try {
        const { key, name, description, isEnabled, rolloutPercentage, targetUsers, environment } = req.body;
    
        const existingFlag = await Flag.findOne({ key });
        if (existingFlag) {
          return res.status(400).json({ error: `Flag with key "${key}" already exists` });
        }
    
        const flag = new Flag({
          key,
          name,
          description,
          isEnabled: isEnabled || false,
          rolloutPercentage: rolloutPercentage !== undefined ? rolloutPercentage : 100,
          targetUsers: targetUsers || [],
          environment: environment || 'production',
        });
    
        await flag.save();
        res.status(201).json(flag);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
    
    // 3. TOGGLE FLAG ON/OFF (Quick toggle from UI switch)
    router.patch('/:id/toggle', async (req, res) => {
      try {
        const flag = await Flag.findById(req.params.id);
        if (!flag) {
          return res.status(404).json({ error: 'Flag not found' });
        }
    
        flag.isEnabled = !flag.isEnabled;
        await flag.save();
        res.json(flag);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
    
    // 4. UPDATE FLAG (Edit percentage, whitelist, name, etc.)
    router.put('/:id', async (req, res) => {
      try {
        const { name, description, isEnabled, rolloutPercentage, targetUsers, environment } = req.body;
        const flag = await Flag.findByIdAndUpdate(
          req.params.id,
          { name, description, isEnabled, rolloutPercentage, targetUsers, environment },
          { new: true, runValidators: true }
        );
        if (!flag) {
          return res.status(404).json({ error: 'Flag not found' });
        }
        res.json(flag);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // 5. DELETE FLAG
    router.delete('/:id', async (req, res) => {
      try {
        const flag = await Flag.findByIdAndDelete(req.params.id);
        if (!flag) {
          return res.status(404).json({ error: 'Flag not found' });
        }
        res.json({ message: 'Flag deleted successfully', id: req.params.id });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 6. EVALUATE SINGLE FLAG (Called by other apps/websites to check a feature)
    // Example: GET /api/flags/evaluate/dark-mode?userId=user123
    router.get('/evaluate/:key', async (req, res) => {
      try {
        const { key } = req.params;
        const { userId } = req.query;

        const flag = await Flag.findOne({ key });
        if (!flag) {
          return res.status(404).json({ error: `Flag "${key}" not found`, enabled: false });
        }

        const evaluation = evaluateFlag(flag, userId);
        res.json({
          flagKey: key,
          userId: userId || null,
          enabled: evaluation.enabled,
          reason: evaluation.reason,
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    export default router;
