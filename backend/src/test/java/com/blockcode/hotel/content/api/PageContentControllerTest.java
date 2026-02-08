package com.blockcode.hotel.content.api;

import com.blockcode.hotel.content.application.PageContentService;
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

@WebMvcTest(controllers = PageContentController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {}))
public class PageContentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PageContentService pageContentService;

    @MockBean
    private DomainUserDetailsService userDetailsService;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    public void getPublicPageContents_ShouldReturnOk() throws Exception {
        when(pageContentService.list()).thenReturn(List.of());

        mockMvc.perform(get("/api/public/page-contents"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" }, authorities = { "content.read" })
    public void getAdminPageContents_ShouldReturnOk() throws Exception {
        when(pageContentService.list()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/page-contents"))
                .andExpect(status().isOk());
    }
}
