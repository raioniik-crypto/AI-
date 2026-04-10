'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoadingIndicator(): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 text-sm text-slate-600"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      AI が解析中です…
    </motion.div>
  );
}
