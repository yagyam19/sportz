import arcjet, { detectBot, shield, slidingWindow } from '@arcjet/node';

const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode = process.env.ARCJET_MODE === 'DRY_RUN' ? 'DRY_RUN' : 'LIVE';

if (!arcjetKey) {
  throw new Error('ARCJET_KEY enviornment variable Missing.');
}

export const httpArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        // shield which will have a mode: this protect us against most common attacts such as SQL Injection or XSS by analysing the structure of incoming requests.
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'],
        }),
        slidingWindow({ mode: arcjetMode, interval: '10s', max: 50 }),
      ],
    })
  : null;
export const wsArcjet = arcjet
  ? arcjet({
      key: arcjetKey,
      rules: [
        // shield which will have a mode: this protect us against most common attacts such as SQL Injection or XSS by analysing the structure of incoming requests.
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'],
        }),
        slidingWindow({ mode: arcjetMode, interval: '2s', max: 5 }),
      ],
    })
  : null;

export function securityMiddleware() {
  return async (req, res, next) => {
    try {
      const decision = await httpArcjet.protect(req);

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({ error: 'Too many requests.' });
        }
        return res.status(403).json({ error: 'Forbidden' });
      }

      return next();
    } catch (error) {
      console.error('Arcjet error:', error);
      return res.status(503).json({ error: 'Service Unavailable' });
    }
  };
}
