import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logFilePath = path.join(__dirname, 'logs', 'FixBug.txt');

function ensureLogDirectory() {
    const logDir = path.dirname(logFilePath);
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
}

/**
 * @param {string} message - رسالة الخطأ أو التصحيح
 * @param {string} level - مستوى الرسالة (INFO, ERROR, WARNING)
 */
export function logFixBug(message, level = 'INFO') {
    try {
        ensureLogDirectory();
        
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}\n`;
        
        fs.appendFile(logFilePath, logEntry, (err) => {
            if (err) {
                console.error('Error writing to fix bug file:', err);
            }
        });
    } catch (error) {
        console.error('Failed to log message:', error);
    }
}

/**
 * تسجيل رسائل عامة (مرادف لـ logFixBug للتوافق)
 * @param {string} message - الرسالة المراد تسجيلها
 */
export function logMessage(message) {
    logFixBug(message, 'INFO');
}

/**
 * تسجيل خطأ حاد
 * @param {string} message - رسالة الخطأ
 */
export function logError(message) {
    logFixBug(message, 'ERROR');
}

/**
 * تسجيل تحذير
 * @param {string} message - رسالة التحذير
 */
export function logWarning(message) {
    logFixBug(message, 'WARNING');
}

/**
 * @returns {string} محتوى ملف السجل
 */
export function readLogFile() {
    try {
        if (fs.existsSync(logFilePath)) {
            return fs.readFileSync(logFilePath, 'utf8');
        }
        return 'No log file found.';
    } catch (error) {
        console.error('Error reading log file:', error);
        return 'Error reading log file.';
    }
}

/**
 * @returns {boolean}
 */
export function clearLogFile() {
    try {
        if (fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, '');
        }
        return true;
    } catch (error) {
        console.error('Error clearing log file:', error);
        return false;
    }
}

export default {
    logFixBug,
    logMessage,
    logError,
    logWarning,
    readLogFile,
    clearLogFile
};