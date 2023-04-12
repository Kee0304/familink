import React, { Component } from "react";
import { useNavigate } from "react-router-dom";


const AuthLayout = ({ authenticated, component:Component}) => {
    const navigate = useNavigate();
    console.log(authenticated)

    return(
        authenticated? Component : navigate('/login')
    )
}
export default AuthLayout
