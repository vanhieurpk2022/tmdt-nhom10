package com.nhom10.tmdt.service.imp;

public interface EmailSevice {

    void sendMessage(String from,String to, String subject, String text);
    void sendActiveAccount(String to, String code);
    String generateCode();
    String generateToken();

}
