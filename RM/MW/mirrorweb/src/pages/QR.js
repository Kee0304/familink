import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';


function QR() {
    const qrMounted = useRef(false)

    const Navigate = useNavigate()

    const { familyaccesstoken } = useSelector(state => ({
        familyaccesstoken : state.valid.familyAccessToken
    }))

    useEffect(() => {
        if (!qrMounted.current) {
            qrMounted.current = true
        } else {
            Navigate("/")
        }
    },[familyaccesstoken])
    
    return (
        <div>
            QR코드로 로그인하여주세요
        </div>
    );
}

export default QR;
