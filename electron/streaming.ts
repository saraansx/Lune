import { app } from 'electron';
import path from 'path';
import { YtDlpAudio } from '../Plugin/yt-dlp-audio.js';

export const ytDlp = new YtDlpAudio();
export const activeSearches = new Map<string, { controller: AbortController; promise: Promise<string> }>();
export const activeDownloads = new Map<string, AbortController>();

const ytCookiesPath = path.join(app.getPath('userData'), 'yt-cookies.txt');
ytDlp.setCookiesPath(ytCookiesPath);
