export function protectFunctionExecution(callback: () => void) {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    callback();
  }
}