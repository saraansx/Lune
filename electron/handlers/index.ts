import { registerDatabaseHandlers } from './database.js';
import { registerStreamingHandlers } from './streaming.js';
import { registerSpotifyHandlers } from './spotify.js';
import { registerSettingsHandlers } from './settings.js';
import { registerRPCHandlers } from './rpc.js';
import { registerLoggingHandlers } from './logging.js';

export function registerAllHandlers() {
    registerDatabaseHandlers();
    registerStreamingHandlers();
    registerSpotifyHandlers();
    registerSettingsHandlers();
    registerRPCHandlers();
    registerLoggingHandlers();
}
