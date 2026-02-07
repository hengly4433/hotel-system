package com.blockcode.hotel.auth.security;

import com.blockcode.hotel.auth.domain.UserEntity;
import com.blockcode.hotel.auth.domain.UserStatus;
import com.blockcode.hotel.auth.infra.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DomainUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public DomainUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        // For now, we are just authenticating.
        // TODO: Load actual authorities/roles from UserRoleRepository if needed for
        // endpoint security.
        // Ideally, we'd query UserRoleRepository -> Role -> Permissions.
        // But for login success, a valid User with password is key.

        boolean enabled = user.getStatus() == UserStatus.ACTIVE;

        return User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .disabled(!enabled)
                .accountExpired(false)
                .credentialsExpired(false)
                .accountLocked(false)
                .authorities("ROLE_USER") // Default authority for now
                .build();
    }
}
