export const ASTROMETRY_PORT = 443;
export const ASTROMETRY_HOST = 'nova.astrometry.net';
export const ASTROMETRY_LOGIN_URL = '/api/login';
export const ASTROMETRY_UPLOAD_URL = '/api/upload';

export const ASTROMETRY_SUBISSIONS_URL = (subissionId) => `/api/submissions/${subissionId}`;
export const ASTROMETRY_JOBS_URL = (jobId) => `/api/jobs/${jobId}`;

export const DEFAULT_ASTROMETRY_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en-AU;q=0.9,en;q=0.8'
};
