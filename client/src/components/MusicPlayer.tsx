// @ts-nocheck
import React, { useEffect, useState, useContext } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

// 657027,514687,517374,713402,564670,513919,630641,678922,522044,551208,281080,551909,633430,634266,638790,642636,551076,562756,565809,636061,559011,472517,69346,423301,679509,513312,591934,341851,638352,563573,727969,195132,638434,564717,553459,518924,682756,195105,464620,592094,722471,424688,586398,359676,463667,558434,586539,587616,628284,469263,630865,418913,342065,360476,270232,466890,121423,728089,431805

let playlist = [657027, 514687, 517374, 713402, 564670, 513919, 630641, 678922, 522044, 551208, 281080, 551909, 633430, 634266, 638790, 642636, 551076, 562756, 565809, 636061, 559011, 472517, 69346, 423301, 679509, 513312, 591934, 341851, 638352, 563573, 727969, 195132, 638434, 564717, 553459, 518924, 682756, 195105, 464620, 592094, 722471, 424688, 586398, 359676, 463667, 558434, 586539, 587616, 628284, 469263, 630865, 418913, 342065, 360476, 270232, 466890, 121423, 728089, 431805]

export const MusicPlayer = () => {
  const [current, setCurrent] = useState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentId, setCurrentId] = useState(playlist[0]);

  useEffect(() => {

    async function getUri() {
      await fetch('https://unstable-do-not-use-in-production-api.teztok.com/v1/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
                query MyQuery($token_id: String!) {
                  tokens(where: {fa2_address: {_eq: "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton"}, token_id: {_eq: $token_id}}) {
                    fa2_address
                    token_id
                    name
                    artifact_uri
                  }
                }
                `,
          variables: { "token_id": currentId.toString() },
        }
        ),
      })
        .then((res) => res.json())
        .then((result) => {
          console.log(result)
          if (result && result.data) {
            setCurrent(result.data.tokens[0].artifact_uri.replace('ipfs://', 'https://ipfs.io/ipfs/'))
          }
        });


    }
    getUri()

  }, [currentId]);

  function onPrev() {
    console.log("on prev")

    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setCurrentId(playlist[currentIndex - 1])
    } else {
      setCurrentIndex(playlist.length - 1)
      setCurrentId(playlist[playlist.length - 1])
    }
  }

  function onNext() {
    console.log("on next")
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setCurrentId(playlist[currentIndex + 1])
    } else {
      setCurrentIndex(0)
      setCurrentId(playlist[0])
    }
  }

  return (
    <div>
      <AudioPlayer
        autoPlay
        src={current}
        onPlay={e => console.log("onPlay")}
        style={{ width: "100%" }}
        showJumpControls={false}
        showSkipControls={true}
        onClickPrevious={() => { onPrev() }}
        onClickNext={() => { onNext() }}
        onEnded={() => { onNext() }}
      // other props here
      />
    </div>
  );
}

