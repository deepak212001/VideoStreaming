import { useState, useRef, useEffect } from 'react'
import './VideoPlayer.css'

function VideoPlayer({ video }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volume, setVolume] = useState(1)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [showVolumeOverlay, setShowVolumeOverlay] = useState(false)
  const [volumeOverlayValue, setVolumeOverlayValue] = useState(100)
  const [showSeekOverlay, setShowSeekOverlay] = useState(null) // 'forward' | 'backward' | null
  const [seekOverlayValue, setSeekOverlayValue] = useState(0) // seconds (positive = forward, negative = backward)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [settingsView, setSettingsView] = useState('main') // 'main' | 'playback' | 'quality'
  const [playbackRate, setPlaybackRate] = useState(1)
  const [quality, setQuality] = useState('auto') // 'auto' | '1080p' | '720p' | '480p' | '360p'
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const progressRef = useRef(null)
  const clickTimeoutRef = useRef(null)
  const volumeTimeoutRef = useRef(null)
  const overlayLastShowAtRef = useRef(0)
  const seekAccumulateRef = useRef({ direction: null, value: 0, at: 0 })
  const qualityChangeTimeRef = useRef(null)
  const SEEK_RESET_MS = 1500
  const OVERLAY_HIDE_DELAY_MS = 2200

  const baseVideoUrl = typeof video?.videoFile === 'string' ? video.videoFile : video?.videoFile?.url

  const getVideoUrlWithQuality = (url, qual) => {
    if (!url) return url
    if (qual === 'auto') return url
    const widths = { '1080p': 1920, '720p': 1280, '480p': 854, '360p': 640 }
    const w = widths[qual]
    if (!w) return url
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      const insert = `w_${w},q_auto,f_auto/`
      return url.replace(/\/upload\//, `/upload/${insert}`)
    }
    return url
  }

  const videoUrl = getVideoUrlWithQuality(baseVideoUrl, quality)

  useEffect(() => {
    if (videoRef.current && volume >= 0 && volume <= 1) {
      videoRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.volume = volume
    }
  }, [videoUrl])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return
    const enterFs = container.requestFullscreen || container.webkitRequestFullscreen || container.mozRequestFullScreen || container.msRequestFullscreen
    const exitFs = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      enterFs?.call(container)?.catch(console.warn)
    } else {
      exitFs?.call(document)?.catch(console.warn)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handleContainerClick = (e) => {
    if (!videoUrl) return
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
      toggleFullscreen()
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null
        togglePlay()
      }, 250)
    }
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(() => {})
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      videoRef.current.volume = volume
    }
  }

  const handleCanPlay = () => {
    if (videoRef.current && videoUrl) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl || qualityChangeTimeRef.current == null) return

    const seekTo = qualityChangeTimeRef.current
    const doSeek = () => {
      qualityChangeTimeRef.current = null
      video.currentTime = seekTo
      setCurrentTime(seekTo)
    }

    if (video.readyState >= 2) {
      doSeek()
      return
    }
    video.addEventListener('loadeddata', doSeek, { once: true })
    return () => video.removeEventListener('loadeddata', doSeek)
  }, [videoUrl])

  useEffect(() => {
    return () => {
      videoRef.current?.pause()
    }
  }, [])

  const handleProgressClick = (e) => {
    e.stopPropagation()
    if (!videoRef.current || !progressRef.current) return
    const dur = videoRef.current.duration
    if (!dur || isNaN(dur) || dur <= 0) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const seekTime = percent * dur
    videoRef.current.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const showOverlay = (type, value) => {
    overlayLastShowAtRef.current = Date.now()
    if (type === 'volume') {
      setVolumeOverlayValue(value != null ? value : Math.round(volume * 100))
      setShowVolumeOverlay(true)
      setShowSeekOverlay(null)
    } else {
      setSeekOverlayValue(value)
      setShowSeekOverlay(type)
      setShowVolumeOverlay(false)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const isVisible = showVolumeOverlay || showSeekOverlay
      const elapsed = Date.now() - overlayLastShowAtRef.current
      if (isVisible && elapsed >= OVERLAY_HIDE_DELAY_MS) {
        setShowVolumeOverlay(false)
        setShowSeekOverlay(null)
      }
    }, 150)
    return () => clearInterval(interval)
  }, [showVolumeOverlay, showSeekOverlay])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!videoRef.current || !videoUrl) return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (videoRef.current.paused) videoRef.current.play().catch(() => {})
          else videoRef.current.pause()
          break
        case 'ArrowRight': {
          e.preventDefault()
          const now = Date.now()
          const acc = seekAccumulateRef.current
          const add = 10
          const cumulative = (acc.direction === 'forward' && now - acc.at < SEEK_RESET_MS) ? acc.value + add : add
          seekAccumulateRef.current = { direction: 'forward', value: cumulative, at: now }
          videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + add)
          showOverlay('forward', cumulative)
          break
        }
        case 'ArrowLeft': {
          e.preventDefault()
          const now = Date.now()
          const acc = seekAccumulateRef.current
          const add = 5
          const cumulative = (acc.direction === 'backward' && now - acc.at < SEEK_RESET_MS) ? acc.value + add : add
          seekAccumulateRef.current = { direction: 'backward', value: cumulative, at: now }
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - add)
          showOverlay('backward', cumulative)
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          const nextUp = Math.min(1, Math.round((volume + 0.1) * 10) / 10)
          setVolume(nextUp)
          showOverlay('volume', Math.round(nextUp * 100))
          break
        }
        case 'ArrowDown': {
          e.preventDefault()
          const nextDown = Math.max(0, Math.round((volume - 0.1) * 10) / 10)
          setVolume(nextDown)
          showOverlay('volume', Math.round(nextDown * 100))
          break
        }
        default:
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [videoUrl, volume])

  const formatTime = (sec) => {
    if (sec == null || isNaN(sec)) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const displayDuration = typeof video?.duration === 'number' ? formatTime(video.duration) : (video?.duration || formatTime(duration))

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (videoRef.current) videoRef.current.volume = val
    showOverlay('volume', Math.round(val * 100))
  }

  const handleVolumeMouseEnter = () => {
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current)
    setShowVolumeSlider(true)
  }

  const handleVolumeMouseLeave = () => {
    volumeTimeoutRef.current = setTimeout(() => setShowVolumeSlider(false), 500)
  }

  const toggleSettingsMenu = (e) => {
    e.stopPropagation()
    setShowSettingsMenu((v) => !v)
    if (!showSettingsMenu) setSettingsView('main')
  }

  const closeSettingsMenu = () => {
    setShowSettingsMenu(false)
    setSettingsView('main')
  }

  const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
  const QUALITY_OPTIONS = [
    { id: 'auto', label: 'Auto' },
    { id: '1080p', label: '1080p' },
    { id: '720p', label: '720p' },
    { id: '480p', label: '480p' },
    { id: '360p', label: '360p' },
  ]

  useEffect(() => {
    if (!showSettingsMenu) return
    const handleClickOutside = () => closeSettingsMenu()
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showSettingsMenu])

  return (
    <div className="video-player">
      <div
        ref={containerRef}
        className="video-player-container"
        onClick={videoUrl ? handleContainerClick : undefined}
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={video?.thumbnail}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onCanPlay={handleCanPlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            playsInline
            className="video-player-video"
          />
        ) : video?.thumbnail ? (
          <img src={video.thumbnail} alt={video?.title || ""} className="video-player-poster" />
        ) : (
          <div className="video-player-placeholder" role="status" aria-label="Loading video">
            {!video ? "Loading…" : "Video unavailable"}
          </div>
        )}
        {videoUrl && !isPlaying && (
          <button className="video-player-play-overlay" aria-label="Play">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        )}

        {videoUrl && showVolumeOverlay && (
          <div className="video-player-overlay video-player-volume-overlay">
            <div className="video-player-volume-overlay-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
            </div>
            <div className="video-player-volume-overlay-text">{volumeOverlayValue}%</div>
          </div>
        )}

        {videoUrl && showSeekOverlay === 'forward' && (
          <div className="video-player-overlay video-player-seek-overlay video-player-seek-right">
            <span className="video-player-seek-text">+ {seekOverlayValue}</span>
            <svg viewBox="0 0 24 24" fill="currentColor" className="video-player-seek-chevron">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </div>
        )}

        {videoUrl && showSeekOverlay === 'backward' && (
          <div className="video-player-overlay video-player-seek-overlay video-player-seek-left">
            <svg viewBox="0 0 24 24" fill="currentColor" className="video-player-seek-chevron video-player-seek-chevron-left">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
            <span className="video-player-seek-text">- {seekOverlayValue}</span>
          </div>
        )}

        <div className="video-player-controls" onClick={(e) => e.stopPropagation()}>
          <div
            ref={progressRef}
            className="video-player-progress"
            onClick={handleProgressClick}
          >
            <div
              className="video-player-progress-bar"
              style={{
                width: duration && !isNaN(duration) && duration > 0
                  ? `${Math.min(100, (currentTime / duration) * 100)}%`
                  : '0%',
              }}
            />
          </div>
          <div className="video-player-controls-row">
            <div className="video-player-controls-left">
              <button className="video-player-btn" aria-label={isPlaying ? 'Pause' : 'Play'} onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                <svg viewBox="0 0 24 24" fill="currentColor">{isPlaying ? <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/> : <path d="M8 5v14l11-7z"/>}</svg>
              </button>
              <div
                className="video-player-volume-wrap"
                onMouseEnter={handleVolumeMouseEnter}
                onMouseLeave={handleVolumeMouseLeave}
              >
                <button className="video-player-btn" aria-label="Volume" onClick={(e) => e.stopPropagation()}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    {volume === 0 ? (
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    ) : volume < 0.5 ? (
                      <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
                    ) : (
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                    )}
                  </svg>
                </button>
                {showVolumeSlider && (
                  <div className="video-player-volume-slider" onClick={(e) => e.stopPropagation()}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="video-player-volume-icon">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                    </svg>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="video-player-volume-input"
                    />
                  </div>
                )}
              </div>
              <span className="video-player-time">{formatTime(currentTime)} / {displayDuration}</span>
            </div>
            <div className="video-player-controls-right">
              <div className="video-player-settings-wrap">
                <button
                  className={`video-player-btn ${showSettingsMenu ? 'video-player-btn-active' : ''}`}
                  aria-label="Settings"
                  onClick={toggleSettingsMenu}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                  </svg>
                </button>
                {showSettingsMenu && (
                  <div className="video-player-settings-menu" onClick={(e) => e.stopPropagation()}>
                    {settingsView === 'main' && (
                      <>
                        <button className="video-player-settings-item" onClick={() => setSettingsView('playback')}>
                          <svg viewBox="0 0 24 24" fill="currentColor" className="video-player-settings-icon">
                            <path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a10 10 0 0 0 17.03-10.43z"/>
                          </svg>
                          <span className="video-player-settings-label">Playback speed</span>
                          <span className="video-player-settings-right">
                            <span className="video-player-settings-value">{playbackRate === 1 ? 'Normal' : `${playbackRate}x`}</span>
                            <svg viewBox="0 0 24 24" fill="currentColor" className="video-player-settings-chevron">
                              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                            </svg>
                          </span>
                        </button>
                        <button className="video-player-settings-item" onClick={() => setSettingsView('quality')}>
                          <svg viewBox="0 0 24 24" fill="currentColor" className="video-player-settings-icon">
                            <path d="M3 5v2h2V5H3zm4 0v2h14V5H7zm-4 6v2h2v-2H3zm4 0v2h14v-2H7zm-4 6v2h2v-2H3zm4 0v2h14v-2H7z"/>
                          </svg>
                          <span className="video-player-settings-label">Quality</span>
                          <span className="video-player-settings-right">
                            <span className="video-player-settings-value">
                              {quality === 'auto' ? 'Auto' : quality}
                              {quality === 'auto' && ' (1080p HD)'}
                            </span>
                            <svg viewBox="0 0 24 24" fill="currentColor" className="video-player-settings-chevron">
                              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                            </svg>
                          </span>
                        </button>
                      </>
                    )}
                    {settingsView === 'playback' && (
                      <>
                        <button className="video-player-settings-item video-player-settings-back" onClick={() => setSettingsView('main')}>
                          <svg viewBox="0 0 24 24" fill="currentColor" className="video-player-settings-icon">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                          </svg>
                          <span>Playback speed</span>
                        </button>
                        {PLAYBACK_SPEEDS.map((speed) => (
                          <button
                            key={speed}
                            className={`video-player-settings-item ${playbackRate === speed ? 'video-player-settings-item-active' : ''}`}
                            onClick={() => { setPlaybackRate(speed); setSettingsView('main'); }}
                          >
                            <span>{speed === 1 ? 'Normal' : speed + 'x'}</span>
                            {playbackRate === speed && (
                              <svg viewBox="0 0 24 24" fill="currentColor" className="video-player-settings-check">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            )}
                          </button>
                        ))}
                      </>
                    )}
                    {settingsView === 'quality' && (
                      <>
                        <button className="video-player-settings-item video-player-settings-back" onClick={() => setSettingsView('main')}>
                          <svg viewBox="0 0 24 24" fill="currentColor" className="video-player-settings-icon">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                          </svg>
                          <span>Quality</span>
                        </button>
                        {QUALITY_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            className={`video-player-settings-item ${quality === opt.id ? 'video-player-settings-item-active' : ''}`}
                            onClick={() => {
                              if (videoRef.current) qualityChangeTimeRef.current = videoRef.current.currentTime
                              setQuality(opt.id)
                              setSettingsView('main')
                            }}
                          >
                            <span>{opt.label}</span>
                            {quality === opt.id && (
                              <svg viewBox="0 0 24 24" fill="currentColor" className="video-player-settings-check">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            )}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
              <button
                className="video-player-btn"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  {isFullscreen ? (
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                  ) : (
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
