import { HTTP_METHODS } from '../enums/httpMethods';

const BASE_URL = import.meta.env.VITE_JUDGE0_BASE_URL;

// fetching all languages
export const getLanguagesApi = () => ({
  url: BASE_URL ? `${BASE_URL}/languages` : null,
  method: HTTP_METHODS.GET,
});

// submitting code
export const codeSubmissionApi = (code, languageId) => ({
  url: BASE_URL ? `${BASE_URL}/submissions/?base64_encoded=false&wait=false` : null,
  method: HTTP_METHODS.POST,
  data: {
    source_code: code,
    language_id: languageId,
    stdin: '',
  },
});

// polling submission status
export const pollSubmitStatusApi = (token) => ({
  url: BASE_URL ? `${BASE_URL}/submissions/${token}?base64_encoded=false` : null,
  method: HTTP_METHODS.GET,
});
