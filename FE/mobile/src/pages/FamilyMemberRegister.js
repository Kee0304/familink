import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import './FamilyMemberRegister.css' 

const FamilyMemberRegister = () => {

  const [membername, setMemberName] = useState();
  const [nickname, setNickname] = useState();
  const [image, setImage] = useState('')
  const [imageurl, setImageURL] = useState("")

  const imageInput = useRef();
  const onCickImageUpload = () => {
    imageInput.current.click();
  };

  const handleName = (event) => {
    event.preventDefault();
    setMemberName(event.target.value);
  }

  const handleNickname = (event) => {
    event.preventDefault();
    setNickname(event.target.value);
  }
                 
  function handleImage(e) {
    setImage(e.target.files[0])
    
  }
  function handleApi() {
    const formData = new FormData()
    formData.append('image', image )
    axios.post('멤버 추가 url', formData).then((res) => {
    })
  }

  function deleteFileImage() {
    setImage("")
  };
  
  useEffect(() => {
    if (image) {
      const imageURL = URL.createObjectURL(image)
      setImageURL(imageURL)
    }
  },[image])


  return (
    <div className="member-registration">
      <form className="card"> 
      <h2>가족 멤버 등록</h2>
      {image ? (
       <label htmlFor="photo-upload" className="custom-file-upload" onClick={onCickImageUpload}>
       <div className="img-wrap img-upload">
       <img alt="not found" id="photo-upload" width={"250px"} src={imageurl} />
       <input type="file" id="photo-upload" ref={imageInput} onChange={handleImage} />
       <br />
       <button onClick={deleteFileImage}>Remove</button>
       </div>
     </label>
        ):(
      <label htmlFor="photo-upload" className="custom-file-upload" onClick={onCickImageUpload}>
        <div className="img-wrap img-upload">
          <img src="https://via.placeholder.com/250x250" id="photo-upload" alt="" width={"250px"} />
        </div>
        <input type="file" id="photo-upload" ref={imageInput} onChange={handleImage} />
      </label>
        )}
      <div className="field">
      <input
          id="membername" 
          type="text"
          name="membername"
          placeholder="이름"
          value={membername}
          onChange={handleName}
        />
        </div>
      <div className="field">
        <input
          id="nickname"
          placeholder="별명"
          name="nickname"
          value={nickname}
          onChange={handleNickname}
        />
      </div>
      <button onClick={handleApi} className="save">Submit</button>
      </form>

    </div>
  );
};
export default FamilyMemberRegister
