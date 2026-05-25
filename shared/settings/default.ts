import { BgType, ClockWeight, DrawerDirection, SortMode } from '@/shared/enums'

import { type CURRENT_CONFIG_SCHEMA, CURRENT_CONFIG_VERSION } from './current'

export const defaultSettings = {
  theme: {
    primaryColor: '#f59db1',
    colorfulMode: true,
    monetColor: false,
    idleHide: false,
  },

  clock: {
    enabled: true,

    colorfulNum: true,
    newStyle: false,
    hour12: true,

    meridiem: {
      show: true,
      followSize: false,
    },

    showDate: true,
    showLunar: false,
    showSeconds: true,

    size: 69,
    weight: {
      time: ClockWeight.Black,
      date: ClockWeight.Medium,
    },

    style: {
      shadow: true,
      blink: true,

      invertColor: {
        light: false,
        night: false,
      },
    },
  },
  search: {
    enabled: true,

    size: 93,

    expandAlways: false,
    showIconAlways: false,

    suggestionAPI: 'bing',
    engine: 'google',

    openInNewTab: true,
    recordHistory: true,

    style: {
      shadow: true,
      border: false,
    },

    placeholder: '',
  },
  background: {
    bgType: BgType.Online,

    vignette: true,
    parallax: false,

    blur: 3,

    mask: {
      enabled: true,
      light: 'rgba(8, 12, 24, 0.34)',
      night: 'rgba(8, 12, 24, 0.34)',
    },

    pauseOnBlur: false,
    fastAnimation: false,

    local: {
      id: '',
      url: '',
      mediaType: undefined,
    },
    localDark: {
      id: '',
      url: '',
      mediaType: undefined,
    },
    bing: {
      id: 'c860845a-2815-4683-9989-d0ac63fa9872',
      url: '',
      updateDate: '202605130700',
    },
    online: {
      url: '/aemeath/wallpapers/default-config.png',
      cache: {
        enabled: false,
        duration: 1, // 默认缓存1小时
        noExpires: false,
      },
    },
  },

  shortcut: {
    enabled: true,

    topSites: false,
    pinnedIcon: true,
    openInNewTab: false,
    paging: true,
    showOnSearchFocus: false,

    iconSize: 50,
    iconRatio: 0.5,

    style: {
      shadow: true,
      border: false,
    },

    layout: {
      rows: 2,
      columns: 5,
    },

    marginTop: 31,
    spacing: {
      itemGapX: 5,
      itemGapY: 20,
      iconTitleGap: 7,
    },

    title: {
      show: true,
      extraWidth: 35,
      whiteInLightMode: true,
    },
  },

  dock: {
    enabled: true,

    topSites: false,
    showOnSearchFocus: true,
    openInNewTab: false,

    limitCount: false,
    maxCount: 10,

    gap: 5,
    iconSize: 44,
    iconRatio: 0.7,

    launchpad: {
      enabled: false,
      topSites: true,
      openInNewTab: false,
    },
  },

  sync: {
    enabled: true,
  },

  yiyan: {
    enabled: true,
    alwaysShow: true,

    provider: 'jinrishici',

    style: {
      shadow: true,
      invertColor: {
        light: false,
        night: false,
      },
    },
  },

  aemeath: {
    dailyBoard: {
      enabled: true,
    },
    music: {
      enabled: true,
      playlistUrl: 'https://api.injahow.cn/meting/?server=netease&type=playlist&id=17680845297',
    },
    pet: {
      enabled: true,
      motion: true,
    },
    effects: {
      meteors: true,
      clickHearts: false,
    },
  },
  perf: {
    bgSwitchAnim: true,
    dockScale: true,
    bookmark: {
      transparent: true,
      blur: true,
    },
    dialog: {
      transparent: true,
      blur: true,
      animation: true,
    },
    focus: {
      scale: true,
      blur: true,
    },
    shortcut: {
      transparent: true,
      blur: true,
    },
    searchBar: {
      transparent: true,
      blur: true,
      launchAnim: true,
    },
    yiyan: {
      transparent: true,
      blur: true,
      ripple: true,
    },
    actionBtns: {
      blur: true,
      transparent: true,
    },
  },

  bookmark: {
    direction: DrawerDirection.rtl,
    rightClickToOpen: true,
    showBtn: true,
    defaultSortMode: SortMode.Original,
  },

  hideMajorChangelog: true,
  readChangeLog: false,
  faviconCacheEnabled: true,

  pluginVersion: '1.0.0-aemeath.0',
  version: CURRENT_CONFIG_VERSION,
} satisfies CURRENT_CONFIG_SCHEMA
