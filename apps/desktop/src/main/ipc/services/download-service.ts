import { IpcMethod, IpcService } from 'electron-ipc-decorator'
import type {
  DownloadItem,
  DownloadOptions,
  PlaylistDownloadOptions,
  PlaylistDownloadResult,
  PlaylistInfo,
  VideoInfo,
  VideoInfoCommandResult
} from '../../../shared/types'
import { downloadEngine } from '../../lib/download-facade'

class DownloadService extends IpcService {
  static readonly groupName = 'download'

  @IpcMethod()
  async getVideoInfo(url: string): Promise<VideoInfo> {
    return downloadEngine.getVideoInfo(url)
  }

  @IpcMethod()
  async getVideoInfoWithCommand(url: string): Promise<VideoInfoCommandResult> {
    return downloadEngine.getVideoInfoWithCommand(url)
  }

  @IpcMethod()
  async getPlaylistInfo(url: string): Promise<PlaylistInfo> {
    return downloadEngine.getPlaylistInfo(url)
  }

  @IpcMethod()
  startDownload(id: string, options: DownloadOptions): boolean {
    return downloadEngine.startDownload(id, options)
  }

  @IpcMethod()
  cancelDownload(id: string): boolean {
    return downloadEngine.cancelDownload(id)
  }

  @IpcMethod()
  getQueueStatus() {
    return downloadEngine.getQueueStatus()
  }

  @IpcMethod()
  getActiveDownloads(): DownloadItem[] {
    return downloadEngine.getActiveDownloads()
  }

  @IpcMethod()
  updateDownloadInfo(id: string, updates: Partial<DownloadItem>): void {
    downloadEngine.updateDownloadInfo(id, updates)
  }

  @IpcMethod()
  async startPlaylistDownload(options: PlaylistDownloadOptions): Promise<PlaylistDownloadResult> {
    return downloadEngine.startPlaylistDownload(options)
  }
}

export { DownloadService }
