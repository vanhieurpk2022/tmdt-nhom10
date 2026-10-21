package com.nhom10.tmdt.config;

import org.springframework.context.annotation.*;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.time.Clock;

@Configuration
@EnableScheduling
public class PaymentConfiguration {
    @Bean
    public Clock paymentClock() { return Clock.systemUTC(); }
}
