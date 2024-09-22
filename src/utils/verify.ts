export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidJSON = (json: string): boolean => {
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === 'object' && parsed !== null;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const isValidHTTPUrl = (url: string): boolean => {
  const urlRegex = /((https?:\/\/)|(\/)|(..\/))(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gm;
  return urlRegex.test(url);
};