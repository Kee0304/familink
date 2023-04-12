import { useDispatch, useSelector } from "react-redux";
import React, {useState, useEffect} from "react";
import {EventSourcePolyfill} from 'event-source-polyfill';
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { setVideos } from "../modules/valid";



function SEE() {
  const location = useLocation();
  const Navigate = useNavigate();
  const BASE_URL = "SSE 주소"
  const {memactoken, me} = useSelector(state => ({
    me : state.valid.me,
    memactoken : state.valid.memberAccessToken
  }))

  const dispatch = useDispatch();
  const setVideoList = (videoList) => dispatch(setVideos(videoList))
  const changeSSECondition = (bool) => dispatch(changeSSECondition(bool))

  const handleConnect = () => {
    
    const sse = new EventSourcePolyfill(`${BASE_URL}/subscribe`,
        {
            headers: {
                "Authorization": `Bearer ${memactoken}`
            }
        });

    sse.addEventListener('send', () => {
      if (location.pathname !== "/playvideo") {
        axios({
          method: "get",
          url: `http://i8a208.p.ssafy.io:3000/movie/video-list`,
          headers: {
            "Authorization": `Bearer ${memactoken}`
          }
        })
        .then ((res) => {
          if (res.data["movie-list"]){
            const objectList = res.data["movie-list"]
            let emptyList = []
            for (let movie of objectList) {
               emptyList.push(movie["uid"])
              }
            setVideoList(emptyList)
            console.log("영상이 도착했습니다. 재생 화면으로 넘어갑니다.")
            setTimeout(() => {
              Navigate("/playvideo")
            },2000)
          }
  
        })
        .catch ((err) => {
          console.log("동영상이 없어")
          console.log(err)
        })
      } else {
        changeSSECondition(true)
      }

    });
  }
  useEffect(() => {
    if (memactoken) {
      setInterval(() => {
        handleConnect()
        console.log("재연결")
      }, 46000)
    handleConnect()
    }
  },[memactoken])


}

export default React.memo(SEE);
