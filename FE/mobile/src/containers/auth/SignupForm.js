import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeField, initializeForm, signup } from "../../modules/auth";
import AuthForm from "../../components/auth/AuthForm";
import { check } from "../../modules/user";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignupForm = ({ history }) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { form, auth, authError, user } = useSelector(({ auth, user }) => ({
    form: auth.signup,
    auth: auth.auth,
    authError: auth.authError,
    user: user.user,
  }));
  //인풋 변경 이벤트 핸들러
  const onChange = (e) => {
    const { value, name } = e.target;
    dispatch(
      changeField({
        form: "signup",
        key: name,
        value,
      })
    );
  };

  //폼 등록 이벤트 핸들러

  const onSubmit = (e) => {
    e.preventDefault();
    const {
      email,
      address,
      pw,
      pwConfirm,
      nickname,
      phone,
    } = form;

    //하나라도 비어있으면
    if (
      [
        email,
        address,
        pw,
        pwConfirm,
        nickname,
        phone,
      ].includes("")
    ) {
      setError("빈 칸을 모두 입력하세요.");
    }

    //비밀번호 불일치
    if (pw !== pwConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      dispatch(changeField({ form: "signup", key: "pw", value: "" }));
      dispatch(
        changeField({ form: "signup", key: "pwConfirm", value: "" })
      );
      return;
    }
    dispatch(signup({ email, pw, nickname, address, phone }));

    //axios 요청
    axios.post('가족 계정 회원가입 url', {
      email: email,
      pw: pw,
      nickname: nickname,
      phone: phone,
      address: address
    }).then((res) => {
      if(res.status === 200) {
        navigate('/SignUpSuccess')
      }
    }).catch((err) => {
      console.log(err)
    })
  }

  //컴포넌트가 처음 랜더링될 때 form 을 초기화
  useEffect(() => {
    dispatch(initializeForm("signup"));
  }, [dispatch]);

  return (
    <AuthForm
      type="signup"
      form={form}
      onChange={onChange}
      onSubmit={onSubmit}
      error={error}
    />
  );
};

export default SignupForm;
