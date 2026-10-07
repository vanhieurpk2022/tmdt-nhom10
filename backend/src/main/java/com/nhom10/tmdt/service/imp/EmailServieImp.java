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

import java.util.UUID;

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

        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">

            <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff;
                        padding: 40px; border-radius: 10px;">

                <h2>Xác thực tài khoản</h2>

                <p>
                    Cảm ơn bạn đã đăng ký tài khoản.
                    Vui lòng bấm vào link bên dưới:
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 16px; font-weight: bold;">
                        %s
                    </span>
                </div>

                <p>
                    Đường dẫn có hiệu lực trong <strong>5 phút</strong>.
                </p>

            </div>

        </body>
        </html>
        """.formatted(Endpoints.HOST+"/verify-email?email="+to+"&code="+code);
        sendMessage(mailFrom,to,"Xác thực tài khoản - Oilia",html);
    }

    @Override
    public String generateCode() {
        return UUID.randomUUID().toString();
    }
}
