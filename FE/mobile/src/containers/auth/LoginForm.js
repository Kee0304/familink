import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeField, initializeForm, login, familyLogout } from "../../modules/auth";
import AuthForm from "../../components/auth/AuthForm";
import { check } from "../../modules/user";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { familyToken, familyUid } from "../../modules/token";

// import { SET_TOKEN } from "../../store/Auth";
// import { setRefreshToken } from "../../storage/Cookie";
// import { loginUser } from "../../lib/api/users";

const LoginForm = ({ history }) => {

  
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { form, auth, authError, user,  faccesstoken, fauid } = useSelector(({ auth, user, token }) => ({
    form: auth.login,
    auth: auth.auth,
    authError: auth.authError,
    user: user.user,
    faccesstoken: token.familyaccesstoken,
    fauid: token.familyuid,
  }));
  
  //인풋 변경 이벤트 핸들러
  const onChange = (e) => {
    const { value, name } = e.target;
    dispatch(
      changeField({
        form: "login",
        key: name,
        value,
      })
      );
    };
    
    
    
    //폼 등록 이벤트 핸들러
    
    const onSubmit = (e) => {
      e.preventDefault();
      const { email, pw } = form;
      dispatch(login({ email, pw }));
      
      if (
        [
          email,
        pw,
      ].includes("")
      ) {
        setError("빈 칸을 모두 입력하세요.");
      }
      
      //axios 요청
      axios.post('가족계정 로그인 url', {
        email: email,
        pw: pw,
      }).then((res) => {
        console.log(res)
        dispatch(familyToken(res.data['access-token']))
        dispatch(familyUid(res.data['uid']))
        localStorage.setItem('faccesstoken', JSON.stringify(res.data['access-token']))
        localStorage.setItem('fauid', JSON.stringify(res.data['uid']))
        if(res.data['result']) {
        navigate('/FamilyMember')
      }
    }).catch((err) => {
      console.log(err)
    })
  };

  useEffect(() => {
    console.log(faccesstoken)

  },[faccesstoken])
  
  //컴포넌트가 처음 랜더링될 때 form 을 초기화
  
  useEffect(() => {
    dispatch(initializeForm("login"));
  }, [dispatch]);


  return (
    <AuthForm
      type="login"
      form={form}
      onChange={onChange}
      onSubmit={onSubmit}
      error={error}
    />
  );
};

export default LoginForm;
