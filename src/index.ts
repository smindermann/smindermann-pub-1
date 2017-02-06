import { app, BrowserWindow, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

let client = require('electron-connect').client;
let log = require('electron-log');

const DEFAULT_SETTINGS = {
};
const MAX_LOG_SIZE = 5 * 1024 * 1024;

class Application {

  private arguments: {[k: string]: string | boolean} = {};
  /*
   * Keep a global reference of the window object, if you don't, the window will
   * be closed automatically when the JavaScript object is garbage collected.
   */
  private win: any;
  private settings: any;

  constructor(argv: string[]) {
    this.parseArgs(argv);
  }

  public start() {
    this.setupLog(() => {
      // We need to when for log setup to complete to do others operations. If not, their logs may be ignored.
      this.readSettings();
    });

    // Ensure there is only one instance of the application running.
    const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      if (this.win) {
        if (this.win.isMinimized()) {
          this.win.restore();
        }
        this.win.focus();
      }
    });

    if (shouldQuit) {
      app.quit();
    }

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', () => {
      this.createWindow()
    });

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
      // On OS X it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (this.win === null) {
        this.createWindow();
      }
    });

    ipcMain.on('log', (event: any, args: any[]) => {
      let level = args.shift();
      let text = args.map((value) => typeof value === 'object' ? JSON.stringify(value) : value).join(' ');
      log.log(level, text);
    });
  }

  private parseArgs(argv: string[]) {
    for (let arg of argv) {
      let tokens = arg.split('=');
      this.arguments[tokens[0]] = tokens[1] ? tokens[1] : true;
    }
  }

  /**
   * By default, the application only logs info and above messages in file. This behavior
   * can be changed by creating the file '<user_data>/log.json' (i.e.
   * /home/user/.config/<app_name>/log.json).
   * Example (for more details on the syntax, see https://www.npmjs.com/package/electron-log):
   * <pre><code>
   * {
   *   "console": {
   *     "level": "debug"
   *   },
   *   "file": {
   *     "level": "warn"
   *   }
   * }
   * </code></pre>
   */
  private setupLog(done: () => void) {
    // Default log config
    let defaultConsole = log.transports.console;
    log.transports.console = false;

    let logFile = path.join(app.getPath('userData'), `${app.getName()}.log`);
    log.transports.file.level = 'info';
    log.transports.file.file = logFile;
    log.transports.file.maxSize = MAX_LOG_SIZE;
    // This should be the only call to console.log
    console.log(`Logs written into ${logFile}`);

    // Override configuration from file
    let logConfigFile = path.join(app.getPath('userData'), 'log.json');
    fs.readFile(logConfigFile, null, (err: NodeJS.ErrnoException, data: Buffer) => {
      if (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      } else {
        let logConfig = JSON.parse(data.toString());
        if (logConfig.console) {
          log.transports.console = defaultConsole;
          Object.assign(log.transports.console, logConfig.console);
        }
        if (logConfig.file) {
          Object.assign(log.transports.file, logConfig.file);
        }
      }

      // Call the done callback to indicate the operation if complete
      done();
    });
  }

  private createWindow(): void {
    let img: string;
    if (process.platform === 'win32') {
      img = require('./assets/images/angular.ico');
    } else {
      img = require('./assets/images/angular.png');
    }
    let icon = path.resolve(__dirname, img);

    // Create the browser window.
    this.win = new BrowserWindow({
      width: 1024, height: 768,
      minWidth: 800, minHeight: 600,
      icon: icon
    });

    // and load the index.html of the app.
    this.win.loadURL(`file://${__dirname}/index.html`);

    // Emitted when the window is closed.
    this.win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      this.win = null;
    });

    if (process.env.ENV !== 'production') {
      // Use electron-connect to reload page when source changes
      client.create(this.win, {
        logLevel: 0,
      });
    }
  }

  private readSettings(): void {
    let settingsFile = path.join(app.getPath('userData'), `${app.getName()}.json`);
    fs.readFile(settingsFile, null, (err: NodeJS.ErrnoException, data: Buffer) => {
      if (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
        log.info('Settings file does not exist. It will be created.');
        this.settings = DEFAULT_SETTINGS;
      } else {
        this.settings = JSON.parse(data.toString());
        log.info('Settings loaded.');
      }

      fs.writeFileSync(settingsFile, JSON.stringify(this.settings));
    });
  }
}

new Application(process.argv).start();
