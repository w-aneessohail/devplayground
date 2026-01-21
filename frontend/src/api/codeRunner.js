import { HTTP_METHODS } from '../enums/httpMethods';

const BASE_URL = import.meta.env.VITE_JUDGE0_BASE_URL || 'https://ce.judge0.com';

export const getSubmitConfig = (code, languageId) => ({
  url: `${BASE_URL}/submissions/?base64_encoded=false&wait=false`,
  method: HTTP_METHODS.POST,
  data: {
    source_code: code,
    language_id: languageId,
    stdin: '',
  },
});

export const getPollConfig = (token) => ({
  url: `${BASE_URL}/submissions/${token}?base64_encoded=false`,
  method: HTTP_METHODS.GET,
});