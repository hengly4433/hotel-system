package com.blockcode.hotel.blog.api;

import com.blockcode.hotel.blog.application.BlogService;
import com.blockcode.hotel.auth.security.DomainUserDetailsService;
import com.blockcode.hotel.auth.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = BlogController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {}))
public class BlogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BlogService blogService;

    @MockBean
    private DomainUserDetailsService userDetailsService;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    public void getPublicBlogs_ShouldReturnOk() throws Exception {
        when(blogService.listPublic()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/public/blogs"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin", authorities = { "blog.read", "ROLE_ADMIN" })
    public void getAdminBlogs_ShouldReturnOk() throws Exception {
        when(blogService.listAdmin()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/blogs"))
                .andExpect(status().isOk());
    }
}
