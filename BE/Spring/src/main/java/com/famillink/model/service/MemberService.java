package com.famillink.model.service;


import com.famillink.model.domain.param.MovieSenderDTO;
import com.famillink.model.domain.user.Member;
import net.bytebuddy.description.NamedElement;

import java.util.Map;
import java.util.Optional;

public interface MemberService {
    Member signup(String name,String nickname,Long tt) throws Exception;

    Map<String, Object> login(Long uid) throws Exception;


    String refreshToken(Long uid, String token) throws Exception;

    Boolean findTogether(MovieSenderDTO sender) throws Exception;

    Long findByUserName(String name) throws Exception;

    Optional<Member> findMemberByUserUid(Long uid) throws Exception;

    Optional<Member> findUserByNametoAll(Map<String,Object> map);

    void deleteMember(Long uid) throws Exception;

}
