export function getApiErrorMessage(error: unknown): string {
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object') {
    if ('message' in error && typeof (error as any).message === 'string') {
      return (error as any).message;
    }
  }

  if (typeof error !== 'object') {
    return 'Something went wrong. Please try again.';
  }

  const maybeError = error as {
    data?: { detail?: unknown; message?: unknown };
    error?: unknown;
  };

  const detail = maybeError.data?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const messages = detail
      .map((item) => {
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as { msg: unknown }).msg);
        }
        return null;
      })
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join('\n');
    }
  }

  if (typeof maybeError.data?.message === 'string') {
    return maybeError.data.message;
  }

  if (typeof maybeError.error === 'string') {
    return maybeError.error;
  }

  return 'Something went wrong. Please try again.';
}
