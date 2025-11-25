"use client";
import { homePageData, getAutoMix } from "@/services/dataAPI";
import { useEffect, useState } from "react";
import { SwiperSlide } from "swiper/react";
import SongCard from "./SongCard";
import { useDispatch, useSelector } from "react-redux";
import SwiperLayout from "./Swiper";
import { setProgress } from "@/redux/features/loadingBarSlice";
import SongCardSkeleton from "./SongCardSkeleton";
import { GiMusicalNotes } from 'react-icons/gi'
import SongBar from "./SongBar";
import OnlineStatus from "./OnlineStatus";
import ListenAgain from "./ListenAgain";
import { setActiveSong, playPause } from "@/redux/features/playerSlice";
import { toast } from "react-hot-toast";


const Home = () => {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);
  const [autoMixLoading, setAutoMixLoading] = useState(false);
  const dispatch = useDispatch();
  const { activeSong, isPlaying, } = useSelector((state) => state.player);
  const { languages } = useSelector((state) => state.languages);

  // salutation
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  let salutation = '';
  if (currentHour >= 5 && currentHour < 12) {
    salutation = 'Good morning';
  } else if (currentHour >= 12 && currentHour < 18) {
    salutation = 'Good afternoon';
  } else {
    salutation = 'Good evening';
  }



  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      dispatch(setProgress(70));
      try {
        const res = await homePageData(languages);
        if (isMounted) {
          setData(res);
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
  }, [dispatch, languages]);

  const handleStartAutoMix = async () => {
    try {
      setAutoMixLoading(true);
      // Simple default: focus + study. You can later expose UI selectors.
      const res = await getAutoMix("focus", "study");
      if (!res?.success || !res?.data?.tracks?.length) {
        toast.error("Could not generate AutoMix. Try again later.");
        setAutoMixLoading(false);
        return;
      }

      const tracks = res.data.tracks;
      // Set first track as active and the whole list as current queue
      dispatch(
        setActiveSong({
          song: tracks[0],
          data: tracks,
          i: 0,
        })
      );
      dispatch(playPause(true));
      toast.success("BeatBox AutoMix started!");
    } catch (error) {
      toast.error("Error starting AutoMix");
    } finally {
      setAutoMixLoading(false);
    }
  };



  return (
    <div>
      <OnlineStatus />
      <h1 className='text-4xl font-bold mx-2 m-9 text-white flex gap-2'>
        <span>&ldquo;{salutation}</span>
        <GiMusicalNotes />
        <span>&rdquo;</span>
      </h1>

      {/* BeatBox AutoMix CTA */}
      <div className="mx-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-gray-200 text-base sm:text-lg">
          Let BeatBox create a focused mix for you.
        </p>
        <button
          onClick={handleStartAutoMix}
          disabled={autoMixLoading}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-700 text-black font-semibold px-4 py-2 rounded-md shadow-md text-sm sm:text-base"
        >
          {autoMixLoading ? "Starting AutoMix..." : "Start AutoMix"}
        </button>
      </div>

      <ListenAgain />

      {/* trending */}
      <SwiperLayout title={"Trending"} >
        {
          loading ? (
            <SongCardSkeleton />
          ) : (
            <>
              {data?.trending?.songs?.map(
                (song) =>
                (
                  <SwiperSlide key={song?.id}>
                    <SongCard song={song} activeSong={activeSong} isPlaying={isPlaying} />
                  </SwiperSlide>
                )
              )}

              {data?.trending?.albums?.map(
                (song) =>
                (
                  <SwiperSlide key={song?.id}>
                    <SongCard song={song} activeSong={activeSong} isPlaying={isPlaying} />
                  </SwiperSlide>
                )
              )}
            </>
          )
        }
      </SwiperLayout>

      {/* top charts */}
      <div className="my-4 lg:mt-14">
        <h2 className=" text-white mt-4 text-2xl lg:text-3xl font-semibold mb-4 ">Top Charts</h2>
        <div className="grid lg:grid-cols-2 gap-x-10 max-h-96 lg:max-h-full lg:overflow-y-auto overflow-y-scroll">
          {
            loading ? (
              <div className=" w-[90vw] overflow-x-hidden">
                <SongCardSkeleton />
              </div>
            ) : (
              data?.charts?.slice(0, 10)?.map(
                (playlist, index) =>
                (
                  <SongBar key={playlist?.id} playlist={playlist} i={index} />
                ))
            )
          }
        </div>
      </div>

      {/* New Releases */}
      <SwiperLayout title={"New Releases"}>
        {
          loading ? (
            <SongCardSkeleton />
          ) : (
            data?.albums?.map(
              (song) =>
              (
                <SwiperSlide key={song?.id}>
                  <SongCard song={song} activeSong={activeSong} isPlaying={isPlaying} />
                </SwiperSlide>
              )
            )
          )
        }
      </SwiperLayout>

      {/* featured playlists */}
      <SwiperLayout title={"Featured Playlists"}>
        {
          loading ? (
            <SongCardSkeleton />
          ) : (
            data?.playlists?.map(
              (song) =>
              (
                <SwiperSlide key={song?.id}>
                  <SongCard key={song?.id} song={song} activeSong={activeSong} isPlaying={isPlaying} />
                </SwiperSlide>
              )
            )
          )
        }
      </SwiperLayout>

    </div>
  );
};

export default Home;