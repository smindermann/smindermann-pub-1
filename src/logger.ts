
import { ipcRenderer } from 'electron';

type Level = 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly';

export class Logger {

  static error(msg: string, ...optionalParams: any[]) {
    Logger.log('error', msg, ...optionalParams);
  }

  static warn(msg: string, ...optionalParams: any[]) {
    Logger.log('warn', msg, ...optionalParams);
  }

  static info(msg: string, ...optionalParams: any[]) {
    Logger.log('info', msg, ...optionalParams);
  }

  static verbose(msg: string, ...optionalParams: any[]) {
    Logger.log('verbose', msg, ...optionalParams);
  }

  static debug(msg: string, ...optionalParams: any[]) {
    Logger.log('debug', msg, ...optionalParams);
  }

  static trace(msg: string, ...optionalParams: any[]) {
    Logger.log('silly', msg, ...optionalParams);
  }

  private static log(level: Level, msg: string, ...optionalParams: any[]) {
    ipcRenderer.send('log', [level, msg, ...optionalParams]);
  }
}
