  import crypto from 'crypto';
    
    /**
     * Deterministic hash function: takes a string and returns a number between 0 and 99
     */
    function getBucket(userId, flagKey) {
      // Combine userId and flagKey so the same user gets different buckets for different flags
      const hash = crypto
        .createHash('md5')
        .update(`${userId}:${flagKey}`)
        .digest('hex');
    
      // Convert first 8 characters of hash to an integer and modulo 100
      const numericValue = parseInt(hash.substring(0, 8), 16);
      return numericValue % 100; // Returns 0 to 99
    }
    
    /**
     * Evaluates whether a flag should be enabled for a specific user
     */
    export function evaluateFlag(flag, userId) {
      // 1. If flag is completely disabled, return false
      if (!flag.isEnabled) {
        return { enabled: false, reason: 'FLAG_DISABLED' };
      }
    
      // 2. If user is in the specific target whitelist, return true
      if (userId && flag.targetUsers && flag.targetUsers.includes(userId)) {
        return { enabled: true, reason: 'TARGET_USER_MATCH' };
      }
    
      // 3. If rollout is 100%, everyone gets it
      if (flag.rolloutPercentage === 100) {
        return { enabled: true, reason: 'ROLLOUT_100' };
      }
    
      // 4. If rollout is 0%, nobody gets it
      if (flag.rolloutPercentage === 0) {
        return { enabled: false, reason: 'ROLLOUT_0' };
      }
    
      // 5. If no userId provided, fall back to default false for partial rollouts
      if (!userId) {
        return { enabled: false, reason: 'NO_USER_ID_PROVIDED' };
      }
    
      // 6. Percentage-based evaluation
      const bucket = getBucket(userId, flag.key);
      const isIncluded = bucket < flag.rolloutPercentage;
    
      return {
        enabled: isIncluded,
        reason: isIncluded ? `BUCKET_${bucket}_IN_PERCENTAGE_${flag.rolloutPercentage}` :
  `BUCKET_${bucket}_EXCLUDED`,
      };
    }
