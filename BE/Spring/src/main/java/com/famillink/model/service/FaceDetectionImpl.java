package com.famillink.model.service;

import java.io.*;
import java.io.InputStream;
import java.net.HttpURLConnection;

import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.famillink.model.domain.user.Account;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class FaceDetectionImpl implements FaceDetection {
    @Value("${famillink.flask.domain}")
    private String flask_ip;
    public String getMemberUidByFace(List<List<List<Integer>>> params, Authentication authentication) throws Exception {
        Account account = (Account) authentication.getPrincipal();
        //쭉 변환 하는 과정입니다
        Map<String, Object> map = new HashMap<>();
        map.put("img", params);
        map.put("uid", account.getUid().toString());


        //dict형태로 상대방에게 전달하여 flask 서버에서 판단 가능하게 해줍니다
        JSONObject resultObj = new JSONObject(map);


        //post보내는 부분
         String host_url = "http://" + flask_ip + ":5000";
 //       String host_url = "http://localhost:5000";
        HttpURLConnection conn = null;
        URL url = new URL(host_url);

        conn = (HttpURLConnection) url.openConnection();

        conn.setRequestMethod("POST");//POST GET
        conn.setRequestProperty("Accept-Charset", "UTF-8");
        conn.setRequestProperty("Content-Type", "application/json");

        //POST방식으로 스트링을 통한 JSON 전송
        conn.setDoOutput(true);
        BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(conn.getOutputStream()));

        bw.write(resultObj.toString());


        bw.flush();
        bw.close();


        InputStream inputStream = conn.getInputStream();
        Reader reader = new InputStreamReader(inputStream);

        StringBuilder result = new StringBuilder();

        for (int data = reader.read(); data != -1; data = reader.read()) {
            result.append((char) data);
        }

        String resultName = result.toString().replace(",", "").replace("\"", "");


        return resultName;
    }
}
