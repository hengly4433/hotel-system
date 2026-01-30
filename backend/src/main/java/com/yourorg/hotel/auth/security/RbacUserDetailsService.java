package com.yourorg.hotel.auth.security;

import com.yourorg.hotel.rbac.domain.RbacUserEntity;
import com.yourorg.hotel.rbac.domain.UserStatus;
import com.yourorg.hotel.rbac.infra.RbacUserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RbacUserDetailsService implements UserDetailsService {

    private final RbacUserRepository userRepository;

    public RbacUserDetailsService(RbacUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        RbacUserEntity user = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        // For now, we are just authenticating.
        // TODO: Load actual authorities/roles from RbacUserRoleRepository if needed for
        // endpoint security.
        // Ideally, we'd query RbacUserRoleRepository -> Role -> Permissions.
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
