import { BrowserWindow } from 'electron'
import { IpcMethod, IpcService } from 'electron-ipc-decorator'

class WindowService extends IpcService {
  static readonly groupName = 'window'

  @IpcMethod()
  minimize(): void {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      window.minimize()
    }
  }

  @IpcMethod()
  maximize(): void {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize()
      } else {
        window.maximize()
      }
    }
  }

  @IpcMethod()
  close(): void {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      window.close()
    }
  }

  @IpcMethod()
  isMaximized(): boolean {
    const window = BrowserWindow.getFocusedWindow()
    return window ? window.isMaximized() : false
  }
}

export { WindowService }
