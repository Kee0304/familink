import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactPlayer from "react-player";
import axios from "axios";


import { useNavigate } from "react-router-dom";
import { setSSEcondition, setVideos } from "../modules/valid";


const PlayVideo = () => {
    
    const navigate = useNavigate();
    const {videoList, memacctoken, me, ssecond} = useSelector(state => ({
        videoList : state.valid.videos,
        memacctoken: state.valid.memberAccessToken,
        me : state.valid.me,
        ssecond : state.valid.ssecondition
    }))

    const [nowplaying, setVideo] = useState(0)
    const [nowVideoList, setNowVideoList] = useState(videoList)

    const dispatch = useDispatch();
    const changeSSE = (bool) => dispatch(setSSEcondition(bool))
    const updateVideoList = (newList) => dispatch(setVideos(newList))


    useEffect(() => {
        axios({
            method:'GET',
            url:`비디오 url`,
            responseType:'blob',
            headers: {
                'Authorization': `Bearer ${memacctoken}`
            },
        })
        .then((res) => {
            const url = window.URL.createObjectURL(new Blob([res.data], { type: res.headers['content-type'] } ));
            setVideoData(url)
            axios({
              // PUT으로 요청 보내면 읽기 완료 처리
                method: "PUT",
                url: `비디오 url`,
                headers: {
                    'Authorization': `Bearer ${memacctoken}`
                }
            })
            .then((res) => {
                console.log(res)
            })
            .catch((err) => {
                console.log(err)
            })
        })
        .catch(e => {
            console.log(`error === ${e}`)
        })

    },[nowplaying])

    useEffect(() => {
        if (ssecond === true) {
            axios({
                method: "get",
                url: `비디오리스트 url`,
                headers: {
                  "Authorization": `Bearer ${memacctoken}`
                }
              })
              .then ((res) => {
                if (res.data["movie-list"]){
                  const objectList = res.data["movie-list"]
                  let emptyList = []
                  for (let movie of objectList) {
                     emptyList.push(movie["uid"])
                    }
                  updateVideoList(emptyList)
                  setNowVideoList(emptyList)
                }
                changeSSE(false)
              })
              .catch ((err) => {
                console.log("동영상이 없어")
                console.log(err)
              })
        }
    },[ssecond])

    const [videoData, setVideoData] = useState(null)


    const nextVideo = (nowVideoList, nowplaying) => {
        if (nowplaying === nowVideoList.length -1) {
            console.log("재생이 끝나서 2초 뒤에 메인 페이지로 넘어갑니다.")
            setTimeout(() => {
              navigate("/")
            }, 2000)
        } else {
            if (me) {
                setVideo(() => {
                    return nowplaying +1
              })
            } else {
                console.log("멤버 로그아웃. 2초 뒤 메인 페이지로 넘어갑니다.")
                setTimeout(() => {
                  navigate("/")
                }, 2000)
            }

        }
    }

    return (
        <div>
          <div className="playercontainer">
          <ReactPlayer
            url = {videoData}
            muted={false}
            playing={true}
            controls
            width="100%"
            height="auto"
            progressInterval={1000}
            onEnded = {(() => nextVideo(nowVideoList, nowplaying))}
          />
          </div>
        </div>
        
     );
}
 
export default React.memo(PlayVideo);
