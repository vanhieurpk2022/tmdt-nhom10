package com.nhom10.tmdt.service.payment;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class VnPayQueryLimiter {
    static final long INTERVAL_SECONDS = 305;

    private final Clock clock;
    private final Map<String, Instant> lastQueries = new HashMap<>();

    public synchronized boolean claim(String reference) {
        Instant now = clock.instant();
        lastQueries.entrySet().removeIf(entry -> !entry.getValue().plusSeconds(INTERVAL_SECONDS).isAfter(now));
        if (lastQueries.size() >= 1024 || lastQueries.containsKey(reference)) return false;
        lastQueries.put(reference, now);
        return true;
    }
}
