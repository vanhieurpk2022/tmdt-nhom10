package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.security.Endpoints;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailServieImp implements EmailSevice {

    private final JavaMailSender emailSender;
    @Value("${spring.mail.username}")
    private String mailFrom;

    @Override
    public void sendMessage(String from, String to, String subject, String text) {
        MimeMessage message = emailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message,true);
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text,true);
        }catch (MessagingException e){
            throw new RuntimeException(e);
        }
        emailSender.send(message);
    }

    @Override
    public void sendActiveAccount(String to, String code) {
        String html = """
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Xác thực tài khoản</title>
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            font-family: Arial, sans-serif;
        ">

            <div style="
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                padding: 40px;
                border-radius: 10px;
            ">

                <h2 style="text-align: center;">
                    Xác thực tài khoản
                </h2>

                <p>
                    Cảm ơn bạn đã đăng ký tài khoản Oilia.
                </p>

                <p>
                    Vui lòng bấm vào nút bên dưới để xác thực tài khoản:
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="%s"
                       style="
                           display: inline-block;
                           padding: 12px 24px;
                           background-color: #2563eb;
                           color: #ffffff;
                           text-decoration: none;
                           border-radius: 6px;
                           font-weight: bold;
                       ">
                        Xác thực tài khoản
                    </a>
                </div>

                <p>
                    Hoặc sử dụng mã xác thực:
                </p>

                <div style="
                    text-align: center;
                    margin: 20px 0;
                    padding: 15px;
                    background-color: #f3f4f6;
                    border-radius: 6px;
                ">
                    <span style="
                        font-size: 20px;
                        font-weight: bold;
                        letter-spacing: 2px;
                    ">
                        %s
                    </span>
                </div>

                <p>
                    Mã xác thực và đường dẫn có hiệu lực trong
                    <strong>5 phút</strong>.
                </p>

                <p style="font-size: 13px; color: #777;">
                    Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email.
                </p>

            </div>

        </body>
        </html>
        """.formatted(Endpoints.HOST+"/verify-email?email="+to+"&code="+code, code);
        sendMessage(mailFrom,to,"Xác thực tài khoản - Oilia",html);
    }

    @Override
    public String generateCode() {
        return new Random().ints(6,1,10)
                .mapToObj(String::valueOf)
                .collect(Collectors.joining());
    }
}
