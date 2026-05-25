import i18next from 'i18next'

import { acquireFaviconRef, releaseFaviconRef } from '@/shared/media'
import { useShortcutStore } from '@/shared/shortcut'

export async function removeShortcut(
  index: number,
  store: ReturnType<typeof useShortcutStore>,
  refresh: () => Promise<void>,
) {
  const { url, title, favicon, pinned } = store.items[index]!
  store.items.splice(index, 1)
  await store.save()
  releaseFaviconRef(url)
  await refresh()
  ElMessage.success({
    message: h('p', null, [
      h(
        'span',
        { style: { color: 'var(--el-color-success)' } },
        i18next.t('newtab:shortcut.deleteMessage'),
      ),
      h(
        'span',
        {
          style: { marginLeft: '20px', color: 'var(--el-color-primary)', cursor: 'pointer' },
          onClick: async () => {
            store.items.splice(index, 0, {
              url,
              title,
              favicon,
              pinned,
            })
            acquireFaviconRef(url)
            await store.save()
            await refresh()
          },
        },
        i18next.t('newtab:common.undo'),
      ),
    ]),
  })
}

export async function pinShortcut(
  store: ReturnType<typeof useShortcutStore>,
  refresh: () => Promise<void>,
  url: string,
  title: string,
  favicon?: string,
) {
  const existing = store.items.find((item) => item.url === url)
  if (existing) {
    existing.pinned = true
    await store.save()
    await refresh()
    return
  }

  store.items.push({
    url,
    title,
    favicon,
    pinned: true,
  })
  acquireFaviconRef(url)
  await store.save()
  await refresh()
}

export async function setShortcutPinned(
  index: number,
  pinned: boolean,
  store: ReturnType<typeof useShortcutStore>,
  refresh: () => Promise<void>,
) {
  const shortcut = store.items[index]
  if (!shortcut) return
  shortcut.pinned = pinned
  await store.save()
  await refresh()
}
