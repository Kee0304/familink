package com.famillink.controller;

import com.famillink.model.service.TestService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@RestController
@Api("Test Controller")
@RequiredArgsConstructor
public class TestController {
    private final Logger logger = LoggerFactory.getLogger(TestController.class);

    @Autowired
    private TestService testService;

    @ApiOperation(value = "테스트", notes = "테스트 컨트롤러입니다.")
    @GetMapping("/test")
    public ResponseEntity<?> test(
            final Authentication authentication) {

        return new ResponseEntity<Object>("dd", HttpStatus.OK);
    }

    @ApiOperation(value = "파일 업로드", notes = "파일을 업로드합니다.")
    @PostMapping("/upload")
    public ResponseEntity<?> fileUpload(final Authentication authentication,
                                        @RequestPart(value = "imgUrlBase", required = true) MultipartFile imgUrlBase) throws Exception {
        logger.debug("MultipartFile.isEmpty : {}", imgUrlBase.isEmpty());
        testService.store(imgUrlBase);
        return null;
    }

    @ApiOperation(value = "파일 다운로드")
    @GetMapping("/download")
    public ResponseEntity<?> fileDownload(final Authentication authentication,
                                          @RequestParam(value = "filename") String filename){

        Resource file = testService.loadAsResource(filename);
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + file.getFilename() + "\"").body(file);
    }
}