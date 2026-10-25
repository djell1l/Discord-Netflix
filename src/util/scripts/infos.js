module.exports = function () {
  const pathname = document.location.pathname;
  const href = document.location.href;
  let avatar = '';
  let userName = '';

  // Try to get Netflix user profile avatar and name
  if (typeof netflix !== 'undefined') {
    try {
      const { userGuid, name } = netflix.reactContext.models.userInfo.data;
      avatar = netflix.falcorCache.profiles[userGuid].summary.value.avatarName.split('R|').pop().split('|')[0];
      userName = name;
    } catch (_) {}
  }

  // 1. Detect if watching a video (watch URL or active video player)
  const watchMatch = href.match(/\/watch\/(\d+)/);
  const videoEl = document.querySelector('video');
  const isWatchPage = !!watchMatch;
  const isVideoPlaying = videoEl && (!videoEl.paused || videoEl.currentTime > 0);

  if (isWatchPage || (isVideoPlaying && !pathname.includes('/browse'))) {
    try {
      const videoId = watchMatch ? watchMatch[1] : (videoEl?.dataset?.videoid || document.querySelector('[data-videoid]')?.dataset?.videoid || '');

      let duration = videoEl ? videoEl.duration : 0;
      let currentTime = videoEl ? videoEl.currentTime : 0;
      let paused = videoEl ? videoEl.paused : false;

      // Fallback to Netflix internal player API if HTML5 video is missing duration
      if (!duration && typeof netflix !== 'undefined') {
        try {
          const vp = netflix.appContext?.state?.playerApp?.getAPI?.().videoPlayer;
          const sIds = vp?.getAllPlayerSessionIds?.();
          if (sIds && sIds.length > 0) {
            const player = vp.getVideoPlayerBySessionId(sIds[0]);
            if (player) {
              currentTime = player.getCurrentTime() / 1000;
              duration = player.getDuration() / 1000;
              paused = player.isPaused();
            }
          }
        } catch (_) {}
      }

      let seriesTitle = '';
      let episodeNumber = '';
      let episodeTitle = '';

      // Method A: Check local cache or trigger async fetch for Netflix member API
      window.__nfMetaCache = window.__nfMetaCache || {};
      if (videoId) {
        if (!window.__nfMetaCache[videoId] && !window.__nfMetaLoading) {
          window.__nfMetaLoading = true;
          fetch('/nq/website/memberapi/release/metadata?movieid=' + videoId)
            .then(r => r.json())
            .then(data => {
              window.__nfMetaCache[videoId] = data;
              window.__nfMetaLoading = false;
            })
            .catch(() => { window.__nfMetaLoading = false; });
        }

        const cached = window.__nfMetaCache[videoId];
        if (cached && cached.video) {
          seriesTitle = cached.video.title || '';
          if (cached.video.type === 'show') {
            const curEp = cached.video.currentEpisode;
            for (const s of cached.video.seasons || []) {
              const ep = (s.episodes || []).find(e => e.episodeId === curEp);
              if (ep) {
                episodeNumber = 'S' + s.seq + ':E' + ep.seq;
                episodeTitle = ep.title || '';
                break;
              }
            }
          } else {
            episodeTitle = cached.video.year ? '' + cached.video.year : '';
          }
        }
      }

      // Method B: DOM controls (visible when hovering)
      if (!seriesTitle) {
        const titleContainer = document.querySelector('[data-uia="video-title"], .video-title, .watch-video--title-container');
        if (titleContainer) {
          const spans = Array.from(titleContainer.querySelectorAll('span'));
          const h4s = Array.from(titleContainer.querySelectorAll('h4'));

          if (spans.length >= 3) {
            seriesTitle = h4s[0]?.textContent?.trim() || '';
            episodeNumber = spans[0]?.textContent?.trim() || '';
            episodeTitle = spans[1]?.textContent?.trim() || '';
          } else if (spans.length === 2) {
            episodeNumber = spans[0]?.textContent?.trim() || '';
            episodeTitle = spans[1]?.textContent?.trim() || '';
            seriesTitle = h4s[0]?.textContent?.trim() || '';
          } else {
            episodeTitle = titleContainer.textContent?.trim() || '';
          }
        }
      }

      // Method C: Netflix falcorCache
      if (!seriesTitle && videoId && typeof netflix !== 'undefined') {
        try {
          const v = netflix.falcorCache?.videos?.[videoId];
          if (v) {
            seriesTitle = v.title?.value || v.summary?.value?.title || '';
          }
        } catch (_) {}
      }

      // Method D: Clean document.title
      if (!seriesTitle) {
        const cleanDocTitle = (document.title || '')
          .replace(/^Netflix\s*-\s*/i, '')
          .replace(/\s*-\s*Netflix$/i, '')
          .trim();
        if (cleanDocTitle && cleanDocTitle !== 'Netflix' && cleanDocTitle !== 'Accueil') {
          seriesTitle = cleanDocTitle;
        }
      }

      if (!seriesTitle) {
        seriesTitle = 'Netflix';
      }

      const fullState = (episodeNumber && episodeTitle)
        ? `${episodeNumber}: ${episodeTitle}`
        : (episodeTitle || episodeNumber || '');

      return {
        name: 'Watching',
        title: seriesTitle,
        state: fullState,
        duration: duration || 0,
        currentTime: currentTime || 0,
        paused: !!paused,
        avatar,
        userName,
        buttons: videoId ? [{
          label: 'Watch on Netflix',
          url: `https://www.netflix.com/watch/${videoId}`
        }] : [],
      };
    } catch (e) {
      console.error('[Netflix RPC] Error in watch detection:', e);
    }
  }

  // 2. Title page
  if (pathname.includes('/title')) {
    const title =
      document.querySelector('h1.title-title')?.textContent?.trim() ||
      document.querySelector('.title-info h3')?.textContent?.trim() ||
      document.title.replace(' - Netflix', '').trim();

    const subtitle = document.querySelector('.episodeTitle')?.textContent?.trim() || '';

    return {
      name: 'Checking a title',
      title,
      state: subtitle,
      avatar,
      userName,
      buttons: [],
    };
  }

  // 3. Browsing catalog
  if (pathname.includes('/browse')) {
    const searchMatch = href.match(/[?&]q=([^&]+)/);
    const state = searchMatch ? `Searching for ${decodeURIComponent(searchMatch[1])}` : 'In the Catalogs';

    return {
      name: 'Browsing',
      title: 'Browsing',
      state,
      avatar,
      userName,
    };
  }

  return {
    name: 'Browsing',
    title: 'Browsing Netflix',
    state: 'Online',
    avatar,
    userName,
  };
};
