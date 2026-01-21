const BASE_URL = import.meta.env.VITE_JUDGE0_BASE_URL;

// Request config for submitting code
export const getSubmitConfig = (code, languageId) => ({
  url: `${BASE_URL}/?base64_encoded=false&wait=false`,
  method: 'POST',
  body: {
    source_code: code,
    language_id: languageId,
    stdin: '',
  },
});

// Request config for polling submission status
export const getPollConfig = (token) => ({
  url: `${BASE_URL}/${token}?base64_encoded=false`,
  method: 'GET',
});