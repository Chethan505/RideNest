package com.vehiclerental.backend.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        long startTime = System.currentTimeMillis();

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            String method = request.getMethod();
            String requestURI = request.getRequestURI();
            int status = response.getStatus();
            String clientIp = request.getRemoteAddr();

            if (!requestURI.startsWith("/actuator/health") && !requestURI.equals("/favicon.ico")) {
                if (status >= 400 && status < 500) {
                    logger.warn("Request [{}] {} from {} resulted in {} ({}ms)", method, requestURI, clientIp, status, duration);
                } else if (status >= 500) {
                    logger.error("Request [{}] {} from {} resulted in {} ({}ms)", method, requestURI, clientIp, status, duration);
                } else {
                    logger.info("Request [{}] {} from {} resulted in {} ({}ms)", method, requestURI, clientIp, status, duration);
                }
            }
        }
    }
}
