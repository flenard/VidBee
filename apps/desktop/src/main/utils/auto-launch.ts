import { app } from 'electron'
import log from 'electron-log/main'

const SUPPORTED_PLATFORMS = new Set(['darwin', 'win32'])

export function isAutoLaunchSupported(): boolean {
  return SUPPORTED_PLATFORMS.has(process.platform)
}

export function applyAutoLaunchSetting(enabled: boolean): void {
  if (!isAutoLaunchSupported()) {
    log.info('Auto launch is not supported on this platform, skipping setting update')
    return
  }

  const updateSetting = () => {
    try {
      // Electron 44 removed `openAsHidden` (macOS ignored it since macOS 13).
      app.setLoginItemSettings({ openAtLogin: enabled })
      log.info(`Auto launch ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      log.error('Failed to update login item settings:', error)
    }
  }

  if (app.isReady()) {
    updateSetting()
  } else {
    app.once('ready', updateSetting)
  }
}
