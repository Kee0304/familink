import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { familyMemberProfile, familyMemberName } from "../modules/token";
// import Me from "/images/댜운로드.jpg";

const StyledImg = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 100%;
  margin-bottom: 1.5rem;
`;

const StyledDiv = styled.div`
height: 200px;
width: 200px;
padding: 15px;
margin: auto;
border-radius: 25px;
display: flex;
justify-content: center;
flex-direction: column;
align-items: center;
box-shadow: 10px 8px 15px 0px  #ffd8a8;
background: #fff;
cursor: pointer;
/* background-image: url('https://github.com/OlgaKoplik/CodePen/blob/master/leaf2.png?raw=true'), url('https://github.com/OlgaKoplik/CodePen/blob/master/leaf.png?raw=true'); */
// background-repeat: no-repeat, no-repeat;
// background-position: 120% -5%, 200% -40%;
// background-size: 40%, 80%;
// animation: open .5s;

&:hover {
  background-color: #ffd8a8;
  box-shadow: 10px 8px 15px 0px  #white;
  transition: .5s;
}`

const StyledFM = styled.div`

  display:flex;
  justify-content: center;
  align-items: center;
  margin-top: 10rem`
  


const FamilyMember = () => {
  const [profile, setProfile] = useState({});
  const [photoUrls, setPhotoUrls] = useState({});
  const [families, setFamilies] = useState({});
  const [fmname, setFmname] = useState();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const result = [];



  useEffect(() => {
    if (families && fmname) {
      axios.post(`멤버로그인 url`, {
        name:fmname.replace(/"/gi, ''),
        user_uid: families
      })
      .then((res) => {
        console.log(res)
        if(res) {
          localStorage.setItem('fmname', JSON.stringify(fmname))
          localStorage.setItem('fmurl', JSON.stringify(photoUrls[fmname]))
          // dispatch(familyMemberName(fmname))
          // dispatch(familyMemberProfile(photoUrls[fmname]))
          localStorage.setItem('fmccesstoken', JSON.stringify(res.data['access-token']))
          navigate('/')
        }
      }).catch((err) => {
        console.log(err)
      })
    }

  },[families, fmname])

  const token = localStorage.getItem("faccesstoken").replace(/"/gi, "");
  // const name = "토르"
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "멤버 리스트 url",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProfile(res.data.list);
        localStorage.setItem("profile", JSON.stringify(res.data.list));
      } catch (err) {
        console.log(err);
      }
    };
    if (localStorage.getItem("profile")) {
      setProfile(JSON.parse(localStorage.getItem("profile")));
    } else {
      fetchData();
    }
  }, []);
  const requests = Object.values(profile).map(({ name }) => {
    if (!photoUrls[name]) {
      axios
        .get(`멤버 프로필 사진`, {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const url = window.URL.createObjectURL(
            new Blob([res.data], { type: res.headers["content-type"] })
          );
          setPhotoUrls((prevUrls) => ({ ...prevUrls, [name]: url }));
        })
        .catch((err) => {
          // console.log(err)
          if(err.request.status === 400) {
            setPhotoUrls((prevUrls) => ({ ...prevUrls, [name]: "images/다운로드.jpg"}))
          }
        });
    }
  });

  const handleProfile = (event, name) => {
    event.preventDefault();
    setFamilies(localStorage.getItem('fauid').replace(/"/gi, ''));
    setFmname(name);
  };

  const handleClick = () => {
    navigate("/FamilyMemberRegister")
  }

  return (
    <>
    <h1>프로필 선택</h1>
    <StyledFM>
      {Object.values(profile).map(( ele ) => {
        if (photoUrls[ele.name]) {
          return (
            <StyledDiv key={ele.name} onClick={(event) => handleProfile(event, ele.name, ele.uid)}>
              <StyledImg
                src={photoUrls[ele.name]}
                alt={ele.name}
              />
              <p>{ele.name}</p>
            </StyledDiv>
          );
        }
        return null;
      })}
    </StyledFM>
    <Button onClick={handleClick}>가족 추가</Button>
    </>
  );
};

export default FamilyMember;
