package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.config.AppException;
import com.nhom10.tmdt.enums.ErrorCode;
import com.nhom10.tmdt.enums.UserStatus;
import com.nhom10.tmdt.model.User;
import com.nhom10.tmdt.repo.UserRepository;
import com.nhom10.tmdt.service.EmailSevice;
import lombok.AllArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class EmailServieImp implements EmailSevice {
    private final JavaMailSender emailSender;



}
