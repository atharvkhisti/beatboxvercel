"use client";
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useEffect } from "react";

const getAudioSrc = (song) => {
  if (!song) return "";

  if (Array.isArray(song.downloadUrl) && song.downloadUrl[4]?.url) {
    return song.downloadUrl[4].url;
  }

  if (Array.isArray(song.download_url) && song.download_url[4]?.url) {
    return song.download_url[4].url;
  }

  if (typeof song.url === "string") {
    return song.url;
  }

  if (Array.isArray(song.url) && song.url[0]) {
    return song.url[0];
  }

  return "";
};

const getArtworkSrc = (song) => {
  if (!song) return "/beatbox-logo.svg";

  const images = song.image || song.images;
  if (Array.isArray(images)) {
    const preferredIndexes = [2, 1, 0];
    for (const index of preferredIndexes) {
      if (images[index]?.url) return images[index].url;
      if (images[index]?.link) return images[index].link;
    }
  }

  if (typeof images === "string") return images;

  if (song.thumbnail) return song.thumbnail;

  return "/beatbox-logo.svg";
};

const Player = ({
  activeSong,
  isPlaying,
  volume,
  seekTime,
  onEnded,
  onTimeUpdate,
  onLoadedData,
  repeat,
  handlePlayPause,
  handlePrevSong,
  handleNextSong,
  setSeekTime,
  appTime,
}) => {
  const ref = useRef(null);
  // eslint-disable-next-line no-unused-expressions
  if (ref.current) {
    if (isPlaying) {
      ref.current.play();
    } else {
      ref.current.pause();
    }
  }

  // media session metadata:
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const mediaMetaData = activeSong?.name
      ? {
          title: activeSong?.name,
          artist: activeSong?.primaryArtists || activeSong?.primary_artists,
          album: activeSong?.album?.name || activeSong?.album || "AutoMix",
          artwork: [
            {
              src: getArtworkSrc(activeSong),
              sizes: "500x500",
              type: "image/png",
            },
          ],
        }
      : {};

    navigator.mediaSession.metadata = new window.MediaMetadata(mediaMetaData);

    navigator.mediaSession.setActionHandler("play", handlePlayPause);
    navigator.mediaSession.setActionHandler("pause", handlePlayPause);
    navigator.mediaSession.setActionHandler("previoustrack", handlePrevSong);
    navigator.mediaSession.setActionHandler("nexttrack", handleNextSong);
    navigator.mediaSession.setActionHandler("seekbackward", () => {
      setSeekTime(Math.max(appTime - 5, 0));
    });
    navigator.mediaSession.setActionHandler("seekforward", () => {
      setSeekTime(appTime + 5);
    });

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("seekbackward", null);
      navigator.mediaSession.setActionHandler("seekforward", null);
    };
  }, [
    activeSong,
    handlePlayPause,
    handlePrevSong,
    handleNextSong,
    setSeekTime,
    appTime,
  ]);

  useEffect(() => {
    ref.current.volume = volume;
  }, [volume]);
  // updates audio element only on seekTime change (and not on each rerender):
  useEffect(() => {
    ref.current.currentTime = seekTime;
  }, [seekTime]);

  return (
    <>
      <audio
        src={getAudioSrc(activeSong)}
        ref={ref}
        loop={repeat}
        onEnded={onEnded}
        onTimeUpdate={onTimeUpdate}
        onLoadedData={onLoadedData}
      />
    </>
  );
};

export default Player;
