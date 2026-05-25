import { useTranslation } from 'i18next-vue'

import { browser } from '#imports'

import { useShortcutStore } from '@/shared/shortcut'

import { pinShortcut, removeShortcut, setShortcutPinned } from '../utils/shortcut'
import { blockSite } from '../utils/topSites'

export type CtxShortcutItem = {
  url: string
  title: string
  favicon?: string
  isPinned: boolean
  isStored: boolean
  originalIndex: number
}

export function useShortcutContextMenu(options: {
  refreshFn: () => Promise<void>
  onOpenEditDialog?: (index: number) => void
}) {
  const { t } = useTranslation()
  const shortcutStore = useShortcutStore()
  const { refreshFn, onOpenEditDialog } = options

  const ctxPosition = ref<DOMRect>(DOMRect.fromRect({ x: 0, y: 0 }))
  const ctxTriggerRef = ref({ getBoundingClientRect: () => ctxPosition.value })
  const ctxItem = ref<CtxShortcutItem | null>(null)

  const setCtxContext = (
    event: MouseEvent | PointerEvent | TouchEvent,
    item: CtxShortcutItem,
  ): void => {
    ctxItem.value = item
    let clientX = 0
    let clientY = 0
    if ('clientX' in event) {
      clientX = event.clientX
      clientY = event.clientY
    } else if ('touches' in event && event.touches[0]) {
      clientX = event.touches[0].clientX
      clientY = event.touches[0].clientY
    }
    ctxPosition.value = DOMRect.fromRect({ x: clientX, y: clientY })
  }

  const ctxOpenInNewTab = (): void => {
    if (ctxItem.value) window.open(ctxItem.value.url, '_blank')
  }

  const ctxOpenInNewWindow = (): void => {
    if (ctxItem.value) browser.windows.create({ url: ctxItem.value.url })
  }

  const ctxCopyLink = (): void => {
    if (ctxItem.value) navigator.clipboard.writeText(ctxItem.value.url)
  }

  const ctxCreateBookmark = async (): Promise<void> => {
    if (!ctxItem.value) return
    const { url, title } = ctxItem.value
    const res = await browser.bookmarks.search({ url })
    if (res.length !== 0) {
      ElMessage.info(t('shortcut.bookmark.existing'))
      return
    }
    browser.bookmarks.create({ title, url }, (created) => {
      if (!created.parentId) return
      chrome.bookmarks.get(created.parentId, (nodes) => {
        const folderTitle = nodes?.[0]?.title ?? null
        ElMessage.success(t('shortcut.bookmark.success', { folder: folderTitle }))
      })
    })
  }

  const ctxUnpin = async (): Promise<void> => {
    if (!ctxItem.value?.isPinned || !ctxItem.value.isStored) return
    await setShortcutPinned(ctxItem.value.originalIndex, false, shortcutStore, refreshFn)
  }

  const ctxPin = async (): Promise<void> => {
    if (!ctxItem.value || ctxItem.value.isPinned) return
    if (ctxItem.value.isStored) {
      await setShortcutPinned(ctxItem.value.originalIndex, true, shortcutStore, refreshFn)
    } else {
      await pinShortcut(
        shortcutStore,
        refreshFn,
        ctxItem.value.url,
        ctxItem.value.title,
        ctxItem.value.favicon,
      )
    }
  }

  const ctxBlockSite = async (): Promise<void> => {
    if (!ctxItem.value || ctxItem.value.isPinned || ctxItem.value.isStored) return
    await blockSite(ctxItem.value.url, refreshFn)
    refreshFn()
  }

  const ctxEdit = (): void => {
    if (!ctxItem.value?.isStored) return
    onOpenEditDialog?.(ctxItem.value.originalIndex)
  }

  const ctxDelete = async (): Promise<void> => {
    if (!ctxItem.value?.isStored) return
    await removeShortcut(ctxItem.value.originalIndex, shortcutStore, refreshFn)
  }

  return {
    ctxTriggerRef,
    ctxItem,
    setCtxContext,
    ctxOpenInNewTab,
    ctxOpenInNewWindow,
    ctxCopyLink,
    ctxCreateBookmark,
    ctxUnpin,
    ctxPin,
    ctxBlockSite,
    ctxEdit,
    ctxDelete,
  }
}
