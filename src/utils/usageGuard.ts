interface UsageGuardContext {
  requireLogin: boolean;
  canUse: boolean;
  navigate: (path: string) => void;
  currentPath: string;
  focusUsage?: () => void;
}

export async function ensureCanCalculate(ctx: UsageGuardContext): Promise<boolean> {
  const { requireLogin, canUse } = ctx;
  
  if (requireLogin) {
    ctx.navigate(`/login?next=${encodeURIComponent(ctx.currentPath)}`);
    return false;
  }
  
  if (!canUse) {
    ctx.focusUsage && ctx.focusUsage();
    return false;
  }
  
  return true;
}