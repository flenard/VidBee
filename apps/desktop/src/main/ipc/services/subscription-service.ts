import path from 'node:path'
import { SUBSCRIPTION_DUPLICATE_FEED_ERROR } from '@vidbee/subscriptions-core'
import { IpcMethod, IpcService } from 'electron-ipc-decorator'
import type {
  SubscriptionResolvedFeed,
  SubscriptionRule,
  SubscriptionUpdatePayload
} from '../../../shared/types'
import { DEFAULT_SUBSCRIPTION_FILENAME_TEMPLATE } from '../../../shared/types'
import { sanitizeFilenameTemplate } from '../../download-engine/args-builder'
import {
  getDesktopSubscriptions,
  listDesktopSubscriptionsSnapshot,
  projectSubscriptionForRenderer,
  removeDesktopSubscription
} from '../../lib/subscriptions-host'
import { settingsManager } from '../../settings'

interface CreateSubscriptionOptions {
  url: string
  keywords?: string[]
  tags?: string[]
  onlyDownloadLatest?: boolean
  downloadDirectory?: string
  namingTemplate?: string
  enabled?: boolean
}

class SubscriptionService extends IpcService {
  static readonly groupName = 'subscriptions'

  @IpcMethod()
  async list(): Promise<SubscriptionRule[]> {
    return listDesktopSubscriptionsSnapshot()
  }

  @IpcMethod()
  resolve(url: string): SubscriptionResolvedFeed {
    return getDesktopSubscriptions().resolve({ rawUrl: url })
  }

  @IpcMethod()
  async create(options: CreateSubscriptionOptions): Promise<SubscriptionRule> {
    const resolved = getDesktopSubscriptions().resolve({ rawUrl: options.url })
    const settings = settingsManager.getAll()
    const defaultDownloadDirectory = path.join(settings.downloadPath, 'Subscriptions')
    try {
      const created = await getDesktopSubscriptions().add({
        sourceUrl: resolved.sourceUrl,
        feedUrl: resolved.feedUrl,
        platform: resolved.platform,
        keywords: options.keywords,
        tags: options.tags,
        onlyDownloadLatest:
          options.onlyDownloadLatest ?? settings.subscriptionOnlyLatestDefault ?? true,
        downloadDirectory: options.downloadDirectory || defaultDownloadDirectory,
        namingTemplate: sanitizeFilenameTemplate(
          options.namingTemplate || DEFAULT_SUBSCRIPTION_FILENAME_TEMPLATE
        ),
        enabled: options.enabled ?? true
      })
      // Kick off an initial refresh so users see the first batch of items
      // without waiting for the next periodic tick.
      void getDesktopSubscriptions()
        .refresh({ id: created.id })
        .catch(() => undefined)
      return projectSubscriptionForRenderer(created)
    } catch (error) {
      if (error instanceof Error && error.message === SUBSCRIPTION_DUPLICATE_FEED_ERROR) {
        throw new Error(SUBSCRIPTION_DUPLICATE_FEED_ERROR)
      }
      throw error
    }
  }

  @IpcMethod()
  async update(
    id: string,
    updates: SubscriptionUpdatePayload
  ): Promise<SubscriptionRule | undefined> {
    const normalized: SubscriptionUpdatePayload = { ...updates }
    if (typeof normalized.namingTemplate === 'string') {
      normalized.namingTemplate = sanitizeFilenameTemplate(normalized.namingTemplate)
    }
    try {
      const updated = await getDesktopSubscriptions().update({ id, ...normalized })
      return projectSubscriptionForRenderer(updated)
    } catch (error) {
      if (error instanceof Error && error.message === SUBSCRIPTION_DUPLICATE_FEED_ERROR) {
        throw new Error(SUBSCRIPTION_DUPLICATE_FEED_ERROR)
      }
      if (error instanceof Error && error.message.startsWith('Subscription not found')) {
        return undefined
      }
      throw error
    }
  }

  @IpcMethod()
  async remove(id: string): Promise<boolean> {
    await removeDesktopSubscription(id)
    return true
  }

  @IpcMethod()
  async refresh(id?: string): Promise<void> {
    if (id) {
      await getDesktopSubscriptions().refresh({ id })
    } else {
      await getDesktopSubscriptions().refreshAll()
    }
  }

  @IpcMethod()
  async queueItem(id: string, itemId: string): Promise<boolean> {
    const result = await getDesktopSubscriptions().itemsQueue({
      subscriptionId: id,
      itemId
    })
    return result.queued
  }
}

export { SubscriptionService }
