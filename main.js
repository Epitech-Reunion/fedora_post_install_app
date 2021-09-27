// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const { ipcMain } = require('electron')
const { execSync } = require("child_process")
const { get } = require('http')

function check_5ghz() {
  return execSync("iw list | grep -E '[0-9]+ MHz * ' | grep -v 'disabled' | awk '{print $2}'").toString()
}

function check_mem() {
  return execSync("free --mega  | grep -E '^Mem:' | awk '{print $2}'").toString()
}

function check_block() {
  return execSync("lsblk -oMOUNTPOINT,ROTA,KNAME,PKNAME -J").toString()
}


function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')


}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


const ipcCalls = [
  {channel: "get_5ghz", fn: check_5ghz},
  {channel: "get_mem", fn: check_mem},
  {channel: "get_block", fn: check_block}
]



ipcCalls.forEach(call => {
  ipcMain.on(call.channel, (evt, args) => {
    evt.reply(`${call.channel}_reply`, call.fn())
  })
})
