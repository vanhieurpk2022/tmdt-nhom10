package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.service.EmailSevice;
import lombok.AllArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class EmailServieImp implements EmailSevice {
    private final JavaMailSender emailSender;
}
