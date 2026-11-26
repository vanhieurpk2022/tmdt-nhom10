package com.nhom10.tmdt.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(@Value("${jwt.secret}") String secret,
                      @Value("${jwt.expiration-ms}") long expirationMs){
        this.key = buildSigningKey(secret);
        this.expirationMs = expirationMs;
    }

    private SecretKey buildSigningKey(String secret) {
        try {
            return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        } catch (IllegalArgumentException exception) {
            return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        }
    }

    public String generateToken(String username, String avatar, String fullname, boolean verify, List<String> roles) {
        return generateToken(username, avatar, fullname, verify, roles, false);
    }

    public String generateToken(String username, String avatar, String fullname, boolean verify, List<String> roles, boolean rememberMe) {
        return generateToken(username, avatar, fullname, verify, roles, rememberMe, null);
    }

    public String generateToken(String username, String avatar, String fullname, boolean verify, List<String> roles, boolean rememberMe, String passwordHash) {
        return Jwts.builder().claims(Map.of("roles", roles, "email", username, "fullName", fullname == null ? "" : fullname,
                        "avatar", avatar == null ? "" : avatar, "verify", verify))
                .claim("credential", passwordHash == null ? null : fingerprint(passwordHash))
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + getExpirationSeconds(rememberMe) * 1000))
                .signWith(key)
                .compact();
    }
    public long getExpirationSeconds(boolean checkbox) {
        return checkbox ? 30L * 24 * 60 * 60 : expirationMs / 1000;

    }
    private Claims extractAllClaims(String token){
        return Jwts.parser().
                verifyWith(key).build().
                parseSignedClaims(token).
                getPayload();
    }

    public <T> T extractClaim(String token, Function<Claims,T> resolver){
        return resolver.apply(extractAllClaims(token));
    }

    public String extractUsername(String token){
        return extractClaim(token,Claims::getSubject);
    }
    private Date extractExpiration(String token){
        return extractClaim(token,Claims::getExpiration);
    }

    private boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());
    }

    public boolean validateToken(String token, UserDetails userDetails){
        String username = extractUsername(token);
        String credential = extractClaim(token, claims -> claims.get("credential", String.class));
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token) && credential != null
                && java.security.MessageDigest.isEqual(credential.getBytes(StandardCharsets.UTF_8), fingerprint(userDetails.getPassword()).getBytes(StandardCharsets.UTF_8));
    }

    private String fingerprint(String encodedPassword) {
        try {
            return java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256")
                    .digest(encodedPassword.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
    }
}
