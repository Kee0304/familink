import React, {useEffect, useRef, useState} from 'react';
import mqtt from "precompiled-mqtt";
import axios from "axios"
import { setMyname, setInfo, setMe, setMemberAccessToken, setMemberRefreshToken, setToMember, setValid, setVideos, startRecording, stopRecording, setFamilyAccessToken, setTodos } from '../modules/valid';
import {useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from 'react-router-dom';


function MQTT() {
  // redux에서 state 불러오기
  const { familyAccessToken, memberAccessToken, me, caption00, myname, weather, schedules,validation, toMember , recording, storedVideos, memInfo } = useSelector(state => ({
    familyAccessToken: state.valid.familyAccessToken,
    memberAccessToken: state.valid.memberAccessToken,
    me : state.valid.me,
    validation : state.valid.validation,
    toMember : state.valid.toMember,
    recording : state.valid.isRecording,
    storedVideos : state.valid.videos,
    memInfo : state.valid.memberInfo,
    caption00 : state.valid.caption,
    myname : state.valid.myname,
    weather : state.valid.weather,
    schedules : state.valid.schedules
  }))
  // redux에서 action 가져오기
  const dispatch = useDispatch();
  const changeStoreValid = () => dispatch(setValid())
  const changeStoreMeberInfo = (info) => dispatch(setInfo(info))
  const setVideoList = (videoList) => dispatch(setVideos(videoList))
  const saveMe = (me) => dispatch(setMe(me)) 
  const saveMemberToken = (membertoken) => dispatch(setMemberAccessToken(membertoken))
  const saveMemberRefreshToken = (memreftoken) => dispatch(setMemberRefreshToken(memreftoken))
  const saveToMember = (tomember) => dispatch(setToMember(tomember))
  const saveFAToken = fatoken => dispatch(setFamilyAccessToken(fatoken))
  const saveMyname = name => dispatch(setMyname(name))


  const Navigate = useNavigate()
  const location = useLocation();


  // 사용할 변수 정의
  const [userList, setList] = useState([null,null,null,null,null])
  const [isConnect, setConnect] = useState(false) 
  const [soundData, setSoundData] = useState("")

  const recordMounted = useRef(false);
  const memberMounted = useRef(false);
  const familyMounted = useRef(false);




  // 마운트 될 때 한 번 구독한다.
  useEffect(() => {
    const URL = "ws://localhost:9001";
    const client = mqtt.connect(URL);
    client.on('connect', () => {
      console.log("첫 연결")
      setConnect(true)
    })
    client.subscribe(["/local/face/result/", "/local/qrtoken/", "/local/sound/"], function (err) { 
      console.log("토픽 구독")
      if (err) {
        console.log(err)
      }
    })
    client.on("close", () => {
      console.log("연결 끊김")
      setConnect(false)
    })
    client.on("error", () => {
      console.log("에러")
    })
    client.on('message', function (topic, message) {
      // 토픽이 안면 인식 토픽이라면
      if (topic === "/local/face/result/") {
        // 녹화중이 아닐 때에는 계속 사람을 인식한다.
        let userData = JSON.parse(message)
        setList(oldArray => {
          return [...oldArray.slice(1,5), userData]
        })
          // 리스트 길이를 5로 유지하면서 계속 담는다.
  
        } else if (topic === "/local/qrtoken/") {
        client.publish("/local/qr/","0")
        let msg = JSON.parse(message)
        
        // 어카운트 요청 보내기
        axios({
          method:"get",
          url:"가족계정",
          headers:{
            "Authorization": `Bearer ${msg}`
          }
        })
        .then((res) => {
          if (res.data["result"]===true) {
            saveFAToken(msg)
          }
        })
        .catch(() => {
          client.publish("/local/qr/","1")
        })
      } else if (topic === "/local/sound/") {
        setSoundData(JSON.parse(message)["text"])
      }
    })
  }, [])
  
  useEffect(() => {
    const URL = "ws://localhost:9001";
    const client = mqtt.connect(URL);
    if (isConnect === false) {
      client.on('connect', () => {
        console.log("재연결")
        setConnect(true)
      })
      client.subscribe(["/local/face/result/", "/local/qrtoken/", "/local/sound/"], function (err) { 
        console.log("토픽 구독")
        if (err) {
          console.log(err)
        }
      })
      client.on("close", () => {
        console.log("연결 다시 끊김")
        setConnect(false)
      })
    }
  },[isConnect])

  useEffect(() => {
    if (memInfo){
      // null이 있을 때에는 동작 안 함
      if (userList.filter(el => el === null).length<=0) {
        // 길이 5의 배열에서 4개 이상이 0번과 같으면
        if (userList.filter(el => el.name===userList[0].name).length>=4) {
          // 만약 0번이 NONE이 아니면
          if (userList[0].name !== "NONE") {
            // 0번 멤버가 내가 아니라면(로그인 시도하는 사람이 현재 로그인 된 사람이 아니면)
            if (me !== memInfo[userList[0].name]) {
              // 멤버 로그인
              const cognizedUID = memInfo[userList[0].name]
              axios({
                method:"post",
                url:"멤버 로그인 url",
                headers:{
                  "Authorization": `Bearer ${familyAccessToken}`
                },
                data: {
                  "json":userList[0].image,
                  "uid": cognizedUID
                }
              })
              .then ((res) => {
                // 나의 uid, 토큰을 저장
                console.log(res)
                saveMe(res.data["uid"])
                saveMemberToken(res.data["access-token"])
                saveMemberRefreshToken(res.data["refresh-token"])
                saveMyname(userList[0].name)
                console.log(`${userList[0].name} 로그인`)
              })
              .catch((err) => {
                console.log(err)
              })
            }
            // 만약 0번이 NONE이고 NONE 4번 이상이면
          } else {
            // 로그인 상태이면 로그아웃
            if (me) {
              saveMe(null)
              saveMemberToken(null)
              saveMemberRefreshToken(null)
              saveMyname(null)
              changeStoreValid(false)
              console.log("로그아웃")
              Navigate("/")
            }
          }
        // 길이 4의 배열에서 0번만 다를 때 = 4개는 똑같음
        } else if (userList.filter(el => el.name===userList[0].name).length === 1)  {
          // 만약 1번이 NONE이 아니면(NONE이 아닌 게 4개)
            // 1번과 같은 놈이 4개 이상이면
            if (userList.filter(el => el.name===userList[1].name).length >=4) {
              if (userList[1].name !== "NONE") {
                // 로그인 시도하려는 사람이 내가 아니면
                if (me !== memInfo[userList[1].name]) {
                  // 멤버 로그인
                  const cognizedUID = memInfo[userList[1].name]
                  axios({
                    method:"post",
                    url:"멤버 로그인 url",
                    headers:{
                      "Authorization": `Bearer ${familyAccessToken}`
                    },
                    data: {
                      "json":userList[1].image,
                      "uid": cognizedUID
                    }
                  })
                  .then ((res) => {
                    console.log(res)
                    saveMe(res.data["uid"])
                    saveMemberToken(res.data["access-token"])
                    saveMemberRefreshToken(res.data["refresh-token"])
                    saveMyname(userList[1].name)
                    console.log(`${userList[1].name} 로그인`)
                  })
                  .catch((err) => {
                    console.log(err)
                  })
                }
              } else {
                if (me) {
                  saveMe(null)
                  saveMemberToken(null)
                  saveMemberRefreshToken(null)
                  saveMyname(null)
                  changeStoreValid(false)
                  console.log("로그아웃")
                  Navigate("/")
              }
            }
          } 
        }
      }
    }
    
  },[userList, memInfo])
  

  // 멤버 토큰이 저장되었을 때 비디오 리스트 요청
  useEffect(() => {
    if (!memberMounted.current){
      memberMounted.current=true
    } else {
      if (me) {
        axios({
          method: "get",
          url: `비디오 리스트 url`,
          headers: {
            "Authorization": `Bearer ${memberAccessToken}`
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
            // 영상 재생 페이지 이외에서 다른 사람으로 로그인 되면
            if (location.pathname !=="/playvideo"){
              Navigate("/playvideo")
              // 영상 재생 페이지에서 다른 사람으로 로그인 되면
            } else {
              //
              Navigate("/")
              setTimeout(() => {
                Navigate("/playvideo")
              },500)
              
            }
          }
  
        })
        .catch ((err) => {
          console.log("동영상이 없어")
          console.log(err)
        })
      }
    }
  }, [memberAccessToken])

  // 녹화 상태가 변경될 때 브로커로 메세지 보냄
  useEffect(() => {
    const URL = "ws://localhost:9001";
    const client = mqtt.connect(URL);
    if (!recordMounted) {
      recordMounted.current = true
    } else {
      if (recording === false) {
        // 녹화가 끝났으면 녹화가 끝났다는 메세지를 보냄
        client.publish("/local/record/", "0")
        client.publish("/local/tts/", "녹화가 종료되었습니다. 메인 페이지로 돌아갑니다." )
        client.subscribe("/local/face/result/")
      } else {
        // 녹화가 시작되었으면 데이터와 신호를 쏴줌
        const publishData = {
          "from" : me,
          "to" : toMember,
          "token" : memberAccessToken,
        }
        const jsonData = JSON.stringify(publishData)
        if (publishData["to"]) {
          client.publish("/local/tts/", "녹화가 시작됩니다." )
          console.log("녹화가 시작됩니다.")
          setTimeout(() => {
            client.publish("/local/token/", jsonData)
            client.publish("/local/record/", "1")
            client.unsubscribe("/local/face/result/")
            saveToMember(null)
          },1000)
        } else {
          console.log("받으실 분이 없어요")
        }
      }
    }
    },[recording])

  // 가족 계정이 로그인 되었을 때 멤버 리스트 요청 보내기
  useEffect(() => {
    if (!familyMounted.current) {
      familyMounted.current=true
    } else {
      axios({
        method: "get",
        url: `멤버 리스트 url`,
        headers: {
          "Authorization": `Bearer ${familyAccessToken}`
        }
      })
      .then ((res) => {
        if (res.data.result === true){
          const emptyObject = {}
            for (let member of res.data.list) {
              emptyObject[member.name] = member.uid
            }
          changeStoreMeberInfo(emptyObject)
        }
      })
      .catch ((err) => {
        console.log(err)
      })
    }
  },[familyAccessToken])


  useEffect(()=> {
    if (soundData) {
      console.log(soundData)
      if (me) {
        if (location.pathname !== "/record") {
          if (soundData.includes("녹화") || soundData.includes("노콰")) {
            Navigate("/record")
            setSoundData("")
          }
        } else if (location.pathname === "/record") {
          if (toMember === null) {
            for (let mem in memInfo) {
              console.log(mem)
              if (soundData.includes(mem)) {
                saveToMember(memInfo[mem])
                setSoundData("")
                break
              }
            }
            }
          }
        }
      } 
    },[soundData])


  const mounted00 = useRef(false);

  useEffect(() => {
    const URL = "ws://localhost:9001";
    const client = mqtt.connect(URL);
    if (!mounted00.current) {
        mounted00.current = true;
        return;
      }
        if(!myname) return;
        if(!schedules) return;
        if(!weather) return;
        if(!memberAccessToken) return;
        // if(!myname) return;
        client.publish("/local/tts/", JSON.stringify({msg:`안녕하세요 ${myname}님`}) )
        let idx =0;
        const textScript = [];
        textScript.push(`오늘의 날씨는 ${weather}입니다`)
        client.publish("/local/tts/", JSON.stringify({msg:textScript[idx++]}) )
        let today = new Date();
        let month = today.getMonth() +1;
        let date = today.getDate();
        if(month<10) {
          today = `0${month}월 ${date}일`
        }
        else{
          today = `${month}월 ${date}일`
        };
        let flag = 0;
        schedules.map(schedule => {
          if(schedule.parseDate === today) {
            flag=1;
            textScript.push(`오늘은 ${schedule.content.slice(0,2)}님의 ${schedule.content.slice(3,)}입니다`)
            client.publish("/local/tts/", JSON.stringify({msg:textScript[idx++]}) )
          }
        })
        if(!flag) textScript.push(`오늘도 좋은 하루 보내세요`)
        else textScript.push('메시지를 보내시겠습니까?')
        client.publish("/local/tts/", JSON.stringify({msg:textScript[idx++]}) )
    // },[weather, schedules, myname])
    },[weather, schedules, memberAccessToken, myname])

}

export default MQTT;
