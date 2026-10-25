const { app, BrowserWindow, Notification } = require('./Electron');
const { Client } = require('./RPC');
const path = require('path');
const { components } = require('electron');

app.setAppUserModelId('DiscordNetflix');

const icon = path.join(__dirname, '../assets/icon.png');
const clientId = '868487355114323968';

let mainWindow;
const rpc = new Client({ transport: 'ipc', clientId });

// Crucial switches for Windows & Linux to prevent sandbox permission errors (0x5 Accès refusé)
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Support optional hardware acceleration bypass for conflicting GPU drivers
if (process.argv.includes('--disable-gpu') || process.argv.includes('--disable-hardware-acceleration') || process.env.DISCORD_NETFLIX_DISABLE_GPU === '1') {
  app.disableHardwareAcceleration();
}

rpc.on('ready', () => {
  mainWindow.checkNetflix();
  // Poll every 5 seconds for responsive timestamp synchronization and state updates
  setInterval(mainWindow.checkNetflix.bind(mainWindow), 5E3);
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    rpc,
    icon
  });

  app.whenReady().then(() => {
    app.emit('rpc');
  });

  mainWindow.maximize();
  mainWindow.loadURL('https://netflix.com/browse');
});

app.whenReady();

app.on('window-all-closed', () => {
  app.quit();
});

app.on('rpc', () => {
  rpc.start().then(() => {
  }).catch(e => {
    let notification = new Notification({
      title: 'Could not connect to Discord',
      body: 'Click here to try again',
      icon
    });
    notification.show();
    notification.on('click', () => app.emit('rpc'));
  });
});
