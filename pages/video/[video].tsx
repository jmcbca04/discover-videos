import { useState, useEffect } from 'react';

import { useRouter } from 'next/router';
import Modal from 'react-modal';
import styles from '../../styles/Video.module.css';

import NavBar from '../../components/nav/navbar';
import clsx from "classnames";

import { getYoutubeVideoById } from "../../lib/videos";

import Like from "../../components/icons/like-icon";
import DisLike from "../../components/icons/dislike-icon";

Modal.setAppElement("#__next");

export async function getStaticProps(context: { params: { videoId: string } }) {

  const videoId = context.params.videoId;

  const video = await getYoutubeVideoById(videoId);

  return {
    props: {
      video,
    },
    revalidate: 10, // in seconds
  };
}

export async function getStaticPaths() {
  const listOfVideos = ["mYfJxlgR2jw", "4zH5iYM4wJo", "KCPEHsAViiQ"];
  const paths = listOfVideos.map((video) => ({
    params: { video },
  }));

  return { paths, fallback: "blocking" };
}

interface VideoProps {
  video: {
    title: string;
    publishtTime: string;
    description: string;
    channelTitle: string;
    statisctics: {
      viewCount: number;
    };
  };
}

const Video = ({ video }: VideoProps) => {
  const router = useRouter();
  console.log({ router })

  const videoId = router.query.videoId;

  const [toggleLike, setToggleLike] = useState(false);
  const [toggleDisLike, setToggleDisLike] = useState(false);

  const { 
    title, 
    publishtTime, 
    description, 
    channelTitle, 
    statisctics: { viewCount } = { viewCount: 0 },
   } = video;

   useEffect(async () => {
    const response = await fetch (`/api/stats?videoId=${videoId}`, {
      method: "GET",
      body: JSON.stringify({
        videoId,
      }),
      });
    const data = await response.json();

    console.log({ data });
    if (data.length > 0) {
      const { favourited } = data[0];
      setToggleLike(favourited === 1);
      setToggleDisLike(favourited === 0);
    }
    const { favourited } = data;
   }, []);

   const runRatingService = async (favourited) => {
    return await fetch ("/api/stats", {
      method: "POST",
      body: JSON.stringify({
        videoId,
        favourited,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
   };

   const handleToggleDislike = async() => {
      console.log('handleToggleDislike');
      setToggleDisLike(!toggleDisLike);
      setToggleLike(toggleDisLike);

      const favourited = val ? 1 : 0;
      const response = await runRatingService(favourited);
      console.log("data", await response.json());
   };

    const handleToggleLike = async () => {
      console.log('handleToggleLike');
      const val = !toggleLike;
      setToggleLike(val);
      setToggleDisLike(toggleLike);

      const response = await fetch("/api/stats", {
        method: "POST",
        body: JSON.stringify({
          videoId,
          favourited: val ? 1 : 0,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("data", await response.json());
    };

  // Define textColor here
  const textColor = styles.textColor;

  return (
    <div className={styles.container}>

      <NavBar />
      <Modal
        isOpen={true}
        contentLabel="Watch the video"
        onRequestClose={() => router.back()}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <iframe
          id="ytplayer"
          className={styles.videoPlayer}
          width="100%"
          height="360"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&origin=http://example.com&controls=0&rel=1`}
          frameBorder="0"
        ></iframe>

      <div className={styles.likeDislikeBtnWrapper}>
        <div className={styles.likeBtnWrapper}>
          <button onClick={handleToggleLike}>
            <div className={styles.btnWrapper}>    
              <Like selected={toggleLike} />
            </div>
          </button>
        </div>
        <button onClick={handleToggleDislike} >
          <div className={styles.btnWrapper}>
            <DisLike selected={toggleDisLike} />
          </div>
        </button>
      </div>
        <div className={styles.modalBody}>
          <div className={styles.modalBodyContent}>
            <div className={styles.col1}>
              <p className={styles.publishtTime}>
              {publishtTime}</p>
              <p className={styles.title}>{title}</p>
              <p className={styles.description}>
              {description}</p>
            </div>
            <div className={styles.col2}>
            <p className={clsx(styles.subText, styles.subTextWrapper)}>
              <span className={textColor}>Cast:</span>  
              <span className={styles.channelTitle}>
                {channelTitle}
              </span>
            </p>  
            <p className={clsx(styles.subText, styles.subTextWrapper)}>
              <span className={textColor}>View Count:</span>  
              <span className={styles.channelTitle}>
                {viewCount}
              </span>
            </p>
            </div>
          </div>
        </div>
      </Modal>  
    </div>
  );
}

export default Video;
