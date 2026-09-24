import { IpcMethod, IpcService } from 'electron-ipc-decorator'
import type { DownloadHistoryItem } from '../../../shared/types'
import { historyManager } from '../../lib/history-manager'

class HistoryService extends IpcService {
  static readonly groupName = 'history'

  @IpcMethod()
  getHistory(): DownloadHistoryItem[] {
    return historyManager.getHistory()
  }

  @IpcMethod()
  getHistoryById(id: string): DownloadHistoryItem | undefined {
    return historyManager.getHistoryById(id)
  }

  @IpcMethod()
  addHistoryItem(item: DownloadHistoryItem): void {
    historyManager.addHistoryItem(item)
  }

  @IpcMethod()
  removeHistoryItem(id: string): boolean {
    return historyManager.removeHistoryItem(id)
  }

  @IpcMethod()
  removeHistoryItems(ids: string[]): number {
    return historyManager.removeHistoryItems(ids)
  }

  @IpcMethod()
  removeHistoryByPlaylistId(playlistId: string): number {
    return historyManager.removeHistoryByPlaylistId(playlistId)
  }

  @IpcMethod()
  clearHistory(): void {
    historyManager.clearHistory()
  }

  @IpcMethod()
  getHistoryCount(): {
    active: number
    completed: number
    error: number
    cancelled: number
    total: number
  } {
    return historyManager.getHistoryCount()
  }
}

export { HistoryService }
