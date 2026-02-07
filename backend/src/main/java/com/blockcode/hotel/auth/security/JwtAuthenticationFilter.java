package com.blockcode.hotel.auth.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private final JwtService jwtService;

  public JwtAuthenticationFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain
  ) throws ServletException, IOException {
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (header == null || !header.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    String token = header.substring(7);
    try {
      Claims claims = jwtService.parseClaims(token);
      String subject = claims.getSubject();

      if (subject != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        Object rawAuthorities = claims.get("authorities");
        if (rawAuthorities instanceof List<?> list) {
          for (Object item : list) {
            if (item != null) {
              authorities.add(new SimpleGrantedAuthority(item.toString()));
            }
          }
        }

        UsernamePasswordAuthenticationToken auth =
            new UsernamePasswordAuthenticationToken(subject, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);
      }
    } catch (Exception ignored) {
      // Invalid token; continue without authentication
    }

    filterChain.doFilter(request, response);
  }
}
