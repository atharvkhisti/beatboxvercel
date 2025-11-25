"use client";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SwiperSlide } from "swiper/react";
import { BsPlayFill } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";
import SwiperLayout from "@/components/Homepage/Swiper";
import SongCard from "@/components/Homepage/SongCard";
import SongListSkeleton from "@/components/SongListSkeleton";
import {
  playPause,
  setActiveSong,
  setFullScreen,
} from "@/redux/features/playerSlice";
import { setProgress } from "@/redux/features/loadingBarSlice";
import { getSearchedData, getSongData } from "@/services/dataAPI";

const SearchPage = ({ params }) => {
  const dispatch = useDispatch();
  const searchQuery = params?.query ?? "";
  const [searchedData, setSearchedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentSongs } = useSelector((state) => state.player);
  const decodedQuery = useMemo(() => {
    try {
      return decodeURIComponent(searchQuery);
    } catch {
      return searchQuery;
    }
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!searchQuery) {
        if (isMounted) {
          setSearchedData(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      dispatch(setProgress(70));
      try {
        const response = await getSearchedData(searchQuery);
        if (isMounted) {
          setSearchedData(response);
        }
      } catch {
        if (isMounted) {
          setSearchedData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
        dispatch(setProgress(100));
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [dispatch, searchQuery]);

  const handlePlayClick = async (song) => {
    if (song?.type === "song") {
      const Data = await getSongData(song?.id);
      const songData = await Data?.[0];
      dispatch(
        setActiveSong({
          song: songData,
          data: currentSongs?.find((s) => s?.id === songData?.id)
            ? currentSongs
            : [...currentSongs, songData],
          i: currentSongs?.find((s) => s?.id === songData?.id)
            ? currentSongs?.findIndex((s) => s?.id === songData?.id)
            : currentSongs?.length,
        })
      );
      dispatch(setFullScreen(true));
      dispatch(playPause(true));
    }
  };

  return (
    <div>
      <div className="w-11/12 m-auto mt-16">
        <div className="mt-10 text-gray-200">
          <h1 className="text-3xl font-bold">
            Search results for &ldquo;{decodedQuery}&rdquo;
          </h1>
          <div className="mt-10 text-gray-200">
            <h2 className="text-lg lg:text-4xl font-semibold">Songs</h2>
            {loading ? (
              <SongListSkeleton />
            ) : searchedData?.songs?.results?.length > 0 ? (
              <div className="mt-5">
                {searchedData?.songs?.results?.map((song, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      handlePlayClick(song);
                    }}
                    className="flex items-center  mt-5 cursor-pointer group border-b-[1px] border-gray-400 justify-between"
                  >
                    <div className="flex items-center gap-5">
                      <div className=" relative">
                        <Image
                          src={
                            song?.image?.[2]?.url ||
                            song?.image?.[2]?.link ||
                            song?.image?.[1]?.url ||
                            song?.image?.[1]?.link ||
                            "/icon-192x192.png"
                          }
                          alt={song?.title || "song artwork"}
                          width={50}
                          height={50}
                          className="mb-3 object-cover"
                        />
                        <BsPlayFill
                          size={25}
                          className=" group-hover:block hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-200"
                        />
                      </div>
                      <div className="w-32 lg:w-80">
                        <p className="text-sm lg:text-lg font-semibold truncate">
                          {song?.title
                            ?.replace("&#039;", "'")
                            ?.replace("&amp;", "&")}
                        </p>
                      </div>
                    </div>
                    <div className="hidden lg:block max-w-56">
                      {song?.primaryArtists && (
                        <p className="text-gray-400 truncate">
                          By: {song?.primaryArtists}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-gray-400">No songs found.</p>
            )}
          </div>

          <div className="mt-10 text-gray-200">
            <SwiperLayout title={"Albums"}>
              {!loading &&
                searchedData?.albums?.results?.length > 0 &&
                searchedData?.albums?.results?.map((song) => (
                  <SwiperSlide key={song?.id}>
                    <SongCard song={song} />
                  </SwiperSlide>
                ))}
            </SwiperLayout>
          </div>
          <div className="mt-10 text-gray-200">
            <SwiperLayout title={"Artists"}>
              {!loading &&
                searchedData?.artists?.results?.length > 0 &&
                searchedData?.artists?.results?.map((artist) => (
                  <SwiperSlide key={artist?.id}>
                    <Link href={`/artist/${artist?.id}`}>
                      <div className=" flex flex-col justify-center items-center">
                        <Image
                          src={artist?.image?.[2]?.url}
                          alt={artist?.name}
                          width={200}
                          height={200}
                          className="rounded-full"
                        />
                        <p className="lg:text-base lg:w-44 w-24 text-center text-xs font-semibold mt-3 truncate">
                          {artist?.title?.replace("&amp;", "&")}
                        </p>
                        <div>
                          {artist?.description && (
                            <p className="text-gray-400 truncate text-[8px] lg:text-xs">
                              {artist?.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
            </SwiperLayout>
          </div>
          <div className="mt-10 text-gray-200">
            <SwiperLayout title={"Playlists"}>
              {!loading &&
                searchedData?.playlists?.results?.length > 0 &&
                searchedData?.playlists?.results?.map((song) => (
                  <SwiperSlide key={song?.id}>
                    <SongCard song={song} />
                  </SwiperSlide>
                ))}
            </SwiperLayout>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
