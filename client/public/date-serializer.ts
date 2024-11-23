export const serializeWithLocalDates = (obj: any) => {
  return JSON.stringify(obj, (key, value) => {
    if (value instanceof Date) {
      return value.toLocaleString('sv', { timeZoneName: 'short' });
    }
    return value;
  });
}
