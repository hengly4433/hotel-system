Continue from the previous prompt: 002_Initialize_Project_2.md


# Below is a complete, production-ready blueprint for this new stack, aligned with your required RBAC model:

- RBAC hierarchy: Users → Roles → Menus/Sub-menus → Permissions
- Menu visibility rule: show a Menu only if user has access to at least one Sub-menu under it.

# Target Architecture

## High-level system diagram

- Admin Panel (Next.js) → calls → Spring Boot API
- Storefront (Next.js) → calls → Spring Boot API
- Spring Boot API → PostgreSQL
- Optional: Redis (sessions, rate limits, OTP), S3-compatible storage, message queue later

### Boundary rules (enterprise-grade):

- Next.js apps are pure clients (UI + SSR/ISR), no core business logic
- Spring Boot holds all domain logic, validation, transactions, RBAC enforcement, auditing

## Monorepo Layout (recommended)

```text
hotel-system/
  backend/                    # Spring Boot (Gradle)
    src/main/java/...         # Domain, application, infra
    src/main/resources/
    build.gradle
  apps/
    admin/                    # Next.js admin
    storefront/               # Next.js website
  db/
    migrations/               # Flyway or Liquibase scripts
    seeds/
  shared/
    openapi/                  # OpenAPI contract (generated client optional)
    types/                    # shared TS types (optional)
```

### Opinion: Use Flyway for DB migrations (simple, deterministic) and generate OpenAPI from Spring Boot for client typing.

## Backend: Spring Boot Enterprise Architecture

### Layering (clean + scalable)

#### Use a 4-layer structure:

1. API layer
   - Controllers (REST)
   - Request/Response DTOs
   - Validation annotations

2. Application layer
   - Use cases (services)
   - Transaction orchestration
   - Authorization checks
   - Audit logging triggers

3. Domain layer
   - Entities + domain rules
   - Domain services (pricing logic, availability logic)
   - Domain events (optional)

4. Infrastructure layer
   - JPA repositories
   - External integrations (payment gateways, email)
   - Security implementation (JWT filters, RBAC provider)

### Backend package structure

```text
backend/src/main/java/com/yourorg/hotel/
  HotelApplication.java

  common/
    config/                   # Jackson, CORS, OpenAPI, etc.
    exception/                # GlobalExceptionHandler, AppException
    audit/                    # AuditService, AuditEntityListener
    security/                 # JWT, RBAC, annotations
    util/

  rbac/
    api/                      # RBAC controllers
    application/              # RBAC services (use cases)
    domain/                   # Entities: User, Role, Menu, Submenu, Permission
    infra/                    # JPA repos, query specs

  hotel/
    api/
    application/
    domain/
    infra/

  reservation/
    api/
    application/
    domain/
    infra/

  finance/
    api/
    application/
    domain/
    infra/
```

## RBAC Model (Your exact requirement)

### Entities (conceptual)

#### Required objects

- User
- Role
- Menu
- SubMenu (belongs to Menu)
- Permission (resource + action)

#### Required link tables

- user_roles
- role_permissions
- role_submenus

#### UI navigation rule

- a Menu appears only if user has at least one SubMenu granted (via role_submenus)
- a SubMenu appears if granted
- Permissions enforce APIs independently (role_permissions)

##### This split is important:

- SubMenus control UI exposure
- Permissions control API authority (security)

## Recommended permission naming (enterprise standard)

### Use resource/action keys like:

- reservation.CREATE
- reservation.READ
- reservation.CHECKIN
- reservation.CHECKOUT
- room.UPDATE_STATUS
- rbac.ADMIN

### You can store as:

- resource = "reservation"
- action = "CREATE"
- (optional) scope = PROPERTY / ALL / OWN

## Authentication + Authorization (Spring Boot)

### Recommended approach

- JWT access token (short TTL)
- Refresh token (optional; stored server-side or rotated)
- Password hashing: BCrypt
- Optional MFA later

### Enforcement strategy

#### Use method-level security:

- @PreAuthorize("hasAuthority('reservation.CREATE')")

#### Load authorities from DB:

- roles → permissions

#### Also load navigation grants:

- roles → submenus → menus

### Navigation endpoint (for Admin UI)

- GET /me/navigation

#### returns:

```json
[
  {
    "menuKey": "reservations",
    "label": "Reservations",
    "submenus": [
      {"key":"reservations.list","label":"Reservation List","route":"/admin/reservations"}
    ]
  }
]

```

## Database (PostgreSQL) for RBAC (DDL outline)

### Tables (minimum)

- rbac_users
- rbac_roles
- rbac_menus
- rbac_submenus
- rbac_permissions
- rbac_user_roles
- rbac_role_permissions
- rbac_role_submenus

### Critical indexes

- unique active email: email where deleted_at is null
- rbac_user_roles(user_id)
- rbac_role_permissions(role_id)
- rbac_role_submenus(role_id)
- rbac_submenus(menu_id)

## Next.js Admin Panel (Enterprise UI)

### Admin features (RBAC module)

You previously asked for: RBAC UI full CRUD + role permission picker ✅

So admin needs:

#### Pages

1. Users CRUD
2. Roles CRUD
3. Menus CRUD
4. Submenus CRUD
5. Permissions CRUD
6. Role Permission Picker (checkbox tree / grouped by resource)
7. Role Submenu Picker (menu tree)

#### UI behavior

- Left sidebar is generated from /me/navigation
- If no submenu under a menu → menu hidden automatically

## Storefront (Next.js)

### Core pages

- Home, Rooms listing, Room details
- Availability Search
- Booking flow (hold → confirm → payment)
- Manage reservation

### Important rule

#### Storefront should not need RBAC menus, but it still uses:

- guest auth (optional)
- booking permissions are public endpoints (but protected with rate limiting, captcha later)

## Hotel System Domain Modules (Backend)

### Your Spring Boot service should be modularized like:

1. RBAC & Auth
2. Property / Hotel Setup
3. Rooms & Room Types
4. Pricing (rate plan, nightly prices, taxes/fees)
5. Reservations (inventory-safe, no double booking)
6. Check-in/out
7. Folio & Payments
8. Housekeeping
9. Maintenance
10. Audit Logs
11. Reports

## What I recommend as your build order (fastest to production)

1. RBAC + Auth (backend + admin UI)
2. Rooms + Room Types
3. Pricing (rate plans + nightly prices)
4. Reservation + availability (inventory-safe)
5. Check-in/out
6. Folio + payments
7. Housekeeping + maintenance
8. Reports

## Next deliverable (I will generate now in the next message)

Since you already want enterprise structure, the best next step is:

### ✅ Generate the full RBAC module for Spring Boot + PostgreSQL:

- Entities (JPA)
- Repositories
- DTOs + Mappers
- Services (Use cases)
- Controllers
- Security (JWT + permission check)
- Navigation endpoint (/me/navigation)
- Audit logging hooks
- Flyway migrations for RBAC schema + seed

…and then after that:

### ✅ Admin UI RBAC CRUD + Role Permission Picker + Role Submenu Picker (Next.js)

#### JWT stateless and a clean enterprise split:

- Next.js: admin + storefront (UI only)
- Spring Boot + Gradle: backend service (all business logic + RBAC + audit + security)
- PostgreSQL: database
- RBAC: Users → Roles → Menus/Sub-menus → Permissions (menu visible if any submenu granted)

## Backend Project Structure (Enterprise)

```text
backend/
  src/main/java/com/yourorg/hotel/
    HotelApplication.java

    common/
      config/
      exception/
      security/
      audit/
      util/

    rbac/
      api/
      application/
      domain/
      infra/

  src/main/resources/
    application.yml
    db/migration/
      V1__rbac_core.sql
      V2__rbac_seed.sql
```

## Gradle (Kotlin DSL) — Spring Boot + Security + JPA + Flyway

### Use Gradle 8.14+.

#### backend/build.gradle.kts

```kotlin
plugins {
  java
  id("org.springframework.boot") version "3.5.10"
  id("io.spring.dependency-management") version "1.1.7"
}

group = "com.yourorg"
version = "0.1.0"

java {
  toolchain { languageVersion.set(JavaLanguageVersion.of(21)) }
}

repositories { mavenCentral() }

dependencies {
  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("org.springframework.boot:spring-boot-starter-validation")
  implementation("org.springframework.boot:spring-boot-starter-security")
  implementation("org.springframework.boot:spring-boot-starter-data-jpa")
  implementation("org.springframework.boot:spring-boot-starter-actuator")

  // JWT resource server (Nimbus) — no external JWT lib required
  implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")

  // Flyway
  implementation("org.flywaydb:flyway-core:11.17.2")

  // PostgreSQL driver
  runtimeOnly("org.postgresql:postgresql")

  // OpenAPI (use 2.8.x line for Boot 3.x)
  implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.15")

  // Mapping
  implementation("org.mapstruct:mapstruct:1.6.3")
  annotationProcessor("org.mapstruct:mapstruct-processor:1.6.3")

  // Lombok (optional but practical)
  compileOnly("org.projectlombok:lombok")
  annotationProcessor("org.projectlombok:lombok")

  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testImplementation("org.springframework.security:spring-security-test")
}

tasks.withType<Test> { useJUnitPlatform() }

```

#### Sources: Boot 3.5.10 release notice, Gradle plugin requirement, Flyway, Springdoc versions, MapStruct docs

## Application Config (JWT + DB + Flyway)

### backend/src/main/resources/application.yml

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/hotel_db
    username: hotel
    password: hotel
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: true
    open-in-view: false
  flyway:
    enabled: true
    locations: classpath:db/migration

app:
  security:
    jwt:
      issuer: "hotel-backend"
      # 256-bit+ secret for HS256. Use base64 in real env.
      secret: "CHANGE_ME_TO_A_LONG_RANDOM_SECRET_32+_CHARS_MIN"
      access-ttl-minutes: 30

logging:
  level:
    org.springframework.security: INFO

```

## Database Migrations (RBAC Core + Seed)

### V1 — RBAC Core DDL

#### db/migration/V1__rbac_core.sql

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- ========= Enums =========
DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('ACTIVE','SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ========= Base tables =========

CREATE TABLE IF NOT EXISTS rbac_users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   uuid NULL, -- can be linked to hotel/property module later

  email         citext NOT NULL,
  password_hash text NOT NULL,
  status        user_status NOT NULL DEFAULT 'ACTIVE',

  last_login_at timestamptz NULL,

  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_rbac_users_email_active
ON rbac_users(email) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS rbac_roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NULL,
  name        text NOT NULL,

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_rbac_roles_name_property_active
ON rbac_roles(property_id, name) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS rbac_menus (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text NOT NULL,
  label      text NOT NULL,
  sort_order int  NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_rbac_menus_key_active
ON rbac_menus(key) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS rbac_submenus (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id    uuid NOT NULL REFERENCES rbac_menus(id) ON DELETE CASCADE,
  key        text NOT NULL,
  label      text NOT NULL,
  route      text NOT NULL,
  sort_order int  NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_rbac_submenus_menu_key_active
ON rbac_submenus(menu_id, key) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_rbac_submenus_menu_id
ON rbac_submenus(menu_id);

CREATE TABLE IF NOT EXISTS rbac_permissions (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource  text NOT NULL,   -- e.g. reservation
  action    text NOT NULL,   -- e.g. CREATE, CHECKIN
  scope     text NULL,       -- optional: OWN/PROPERTY/ALL

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_rbac_permissions_unique_active
ON rbac_permissions(resource, action, COALESCE(scope,'')) WHERE deleted_at IS NULL;

-- ========= Link tables =========

CREATE TABLE IF NOT EXISTS rbac_user_roles (
  user_id uuid NOT NULL REFERENCES rbac_users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES rbac_roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS rbac_role_permissions (
  role_id uuid NOT NULL REFERENCES rbac_roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES rbac_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- UI navigation grants
CREATE TABLE IF NOT EXISTS rbac_role_submenus (
  role_id uuid NOT NULL REFERENCES rbac_roles(id) ON DELETE CASCADE,
  submenu_id uuid NOT NULL REFERENCES rbac_submenus(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, submenu_id)
);

-- ========= Audit logs =========
CREATE TABLE IF NOT EXISTS audit_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   uuid NULL,
  actor_user_id uuid NULL REFERENCES rbac_users(id),

  entity_type   text NOT NULL,
  entity_id     uuid NULL,
  action        text NOT NULL,

  before        jsonb NULL,
  after         jsonb NULL,

  request_id    text NULL,
  ip            text NULL,
  user_agent    text NULL,

  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity
ON audit_logs(entity_type, entity_id, created_at DESC);
```

### V2 — Seed Menus/Submenus/Permissions + Admin Role/User

#### db/migration/V2__rbac_seed.sql

- Replace ADMIN_BCRYPT_HASH with a real bcrypt hash.

```sql
-- Menus
INSERT INTO rbac_menus(key,label,sort_order) VALUES
('dashboard','Dashboard',1),
('reservations','Reservations',2),
('rooms','Rooms',3),
('finance','Finance',4),
('settings','Settings',99)
ON CONFLICT DO NOTHING;

-- Submenus
INSERT INTO rbac_submenus(menu_id,key,label,route,sort_order)
SELECT m.id, s.key, s.label, s.route, s.sort_order
FROM rbac_menus m
JOIN (VALUES
 ('settings','settings.rbac','RBAC','/admin/settings/rbac',1),
 ('reservations','reservations.list','Reservation List','/admin/reservations',1),
 ('reservations','reservations.create','Create Reservation','/admin/reservations/new',2),
 ('rooms','rooms.board','Room Board','/admin/rooms/board',1),
 ('finance','finance.folios','Folios & Payments','/admin/finance/folios',1)
) AS s(menu_key,key,label,route,sort_order)
ON s.menu_key = m.key
ON CONFLICT DO NOTHING;

-- Permissions
INSERT INTO rbac_permissions(resource,action,scope) VALUES
('rbac','ADMIN','PROPERTY'),
('reservation','CREATE','PROPERTY'),
('reservation','READ','PROPERTY'),
('reservation','UPDATE','PROPERTY'),
('room','READ','PROPERTY'),
('folio','READ','PROPERTY'),
('payment','CAPTURE','PROPERTY')
ON CONFLICT DO NOTHING;

-- Admin role
INSERT INTO rbac_roles(property_id,name)
VALUES (NULL,'ADMIN')
ON CONFLICT DO NOTHING;

-- Admin user
INSERT INTO rbac_users(email,password_hash,status)
VALUES ('admin@hotel.local','ADMIN_BCRYPT_HASH','ACTIVE')
ON CONFLICT DO NOTHING;

-- Assign ADMIN role to admin user
INSERT INTO rbac_user_roles(user_id, role_id)
SELECT u.id, r.id
FROM rbac_users u, rbac_roles r
WHERE u.email = 'admin@hotel.local' AND r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

-- Grant ADMIN role all permissions
INSERT INTO rbac_role_permissions(role_id, permission_id)
SELECT r.id, p.id
FROM rbac_roles r, rbac_permissions p
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

-- Grant ADMIN role all submenus
INSERT INTO rbac_role_submenus(role_id, submenu_id)
SELECT r.id, s.id
FROM rbac_roles r, rbac_submenus s
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

```

## Spring Security (JWT Stateless) — Production Pattern

### We will use Spring Security OAuth2 Resource Server with Nimbus:

- Login endpoint issues JWT
- All other endpoints validate JWT (stateless)
- Authorities come from JWT claims (auth array)

### JWT Settings + Token Service

#### common/security/JwtProperties.java

```java
package com.yourorg.hotel.common.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.jwt")
public record JwtProperties(
    String issuer,
    String secret,
    long accessTtlMinutes
) {}

```

#### common/security/JwtTokenService.java

```java
package com.yourorg.hotel.common.security;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.*;

import javax.crypto.spec.SecretKeySpec;

public class JwtTokenService {

  private final JwtEncoder encoder;
  private final JwtProperties props;

  public JwtTokenService(JwtEncoder encoder, JwtProperties props) {
    this.encoder = encoder;
    this.props = props;
  }

  public String issueAccessToken(String userId, String email, String propertyId,
                                 Collection<? extends GrantedAuthority> authorities) {

    Instant now = Instant.now();
    Instant exp = now.plus(props.accessTtlMinutes(), ChronoUnit.MINUTES);

    var claims = JwtClaimsSet.builder()
        .issuer(props.issuer())
        .issuedAt(now)
        .expiresAt(exp)
        .subject(userId)
        .claim("email", email)
        .claim("propertyId", propertyId)
        .claim("auth", authorities.stream().map(GrantedAuthority::getAuthority).toList())
        .build();

    return encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
  }

  public static SecretKeySpec hmacKey(String secret) {
    return new SecretKeySpec(secret.getBytes(), "HmacSHA256");
  }
}
```

### Security Configuration

#### common/security/SecurityConfig.java

```java
package com.yourorg.hotel.common.security;

import java.util.Collection;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.*;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
@EnableConfigurationProperties(JwtProperties.class)
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(auth -> auth
        .requestMatchers("/api/v1/auth/**", "/actuator/health", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
        .anyRequest().authenticated()
      )
      .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter())));

    return http.build();
  }

  @Bean
  AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
    return cfg.getAuthenticationManager();
  }

  @Bean
  JwtDecoder jwtDecoder(JwtProperties props) {
    var key = JwtTokenService.hmacKey(props.secret());
    return NimbusJwtDecoder.withSecretKey(key).build();
  }

  @Bean
  JwtEncoder jwtEncoder(JwtProperties props) {
    var key = JwtTokenService.hmacKey(props.secret());
    return new NimbusJwtEncoder(new ImmutableSecret<>(key));
  }

  @Bean
  JwtTokenService jwtTokenService(JwtEncoder encoder, JwtProperties props) {
    return new JwtTokenService(encoder, props);
  }

  private JwtAuthenticationConverter jwtAuthConverter() {
    var converter = new JwtGrantedAuthoritiesConverter();
    converter.setAuthoritiesClaimName("auth");
    converter.setAuthorityPrefix(""); // keep exactly "reservation.CREATE"
    var jwtConverter = new JwtAuthenticationConverter();
    jwtConverter.setJwtGrantedAuthoritiesConverter(converter);
    return jwtConverter;
  }
}
```

## RBAC Domain (Entities)

### Base entity (audit fields)

#### common/audit/BaseEntity.java

```java
package com.yourorg.hotel.common.audit;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@MappedSuperclass
public abstract class BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  @Column(nullable = false)
  private Instant updatedAt = Instant.now();

  private Instant deletedAt;

  @PreUpdate
  void onUpdate() {
    this.updatedAt = Instant.now();
  }
}

```

### Entities (RBAC)

#### rbac/domain/UserEntity.java

```java
package com.yourorg.hotel.rbac.domain;

import com.yourorg.hotel.common.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Getter @Setter
@Entity @Table(name = "rbac_users")
public class UserEntity extends BaseEntity {

  @Column(nullable = true)
  private java.util.UUID propertyId;

  @Column(nullable = false)
  private String email;

  @Column(nullable = false)
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private UserStatus status = UserStatus.ACTIVE;

  private Instant lastLoginAt;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "rbac_user_roles",
      joinColumns = @JoinColumn(name = "user_id"),
      inverseJoinColumns = @JoinColumn(name = "role_id")
  )
  private Set<RoleEntity> roles = new HashSet<>();
}

```

#### rbac/domain/UserStatus.java

```java
package com.yourorg.hotel.rbac.domain;

public enum UserStatus { ACTIVE, SUSPENDED }

```

#### rbac/domain/RoleEntity.java

```java
package com.yourorg.hotel.rbac.domain;

import com.yourorg.hotel.common.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter @Setter
@Entity @Table(name = "rbac_roles")
public class RoleEntity extends BaseEntity {

  @Column(nullable = true)
  private UUID propertyId;

  @Column(nullable = false)
  private String name;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "rbac_role_permissions",
      joinColumns = @JoinColumn(name = "role_id"),
      inverseJoinColumns = @JoinColumn(name = "permission_id")
  )
  private Set<PermissionEntity> permissions = new HashSet<>();

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "rbac_role_submenus",
      joinColumns = @JoinColumn(name = "role_id"),
      inverseJoinColumns = @JoinColumn(name = "submenu_id")
  )
  private Set<SubmenuEntity> submenus = new HashSet<>();
}
```

#### rbac/domain/MenuEntity.java

```java
package com.yourorg.hotel.rbac.domain;

import com.yourorg.hotel.common.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter @Setter
@Entity @Table(name = "rbac_menus")
public class MenuEntity extends BaseEntity {

  @Column(nullable = false)
  private String key;

  @Column(nullable = false)
  private String label;

  @Column(nullable = false)
  private int sortOrder = 0;

  @OneToMany(mappedBy = "menu", fetch = FetchType.LAZY)
  @OrderBy("sortOrder ASC")
  private Set<SubmenuEntity> submenus = new LinkedHashSet<>();
}
```

#### rbac/domain/SubmenuEntity.java

```java
package com.yourorg.hotel.rbac.domain;

import com.yourorg.hotel.common.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity @Table(name = "rbac_submenus")
public class SubmenuEntity extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "menu_id", nullable = false)
  private MenuEntity menu;

  @Column(nullable = false)
  private String key;

  @Column(nullable = false)
  private String label;

  @Column(nullable = false)
  private String route;

  @Column(nullable = false)
  private int sortOrder = 0;
}
```

#### rbac/domain/PermissionEntity.java

```java
package com.yourorg.hotel.rbac.domain;

import com.yourorg.hotel.common.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity @Table(name = "rbac_permissions")
public class PermissionEntity extends BaseEntity {

  @Column(nullable = false)
  private String resource;

  @Column(nullable = false)
  private String action;

  @Column(nullable = true)
  private String scope; // optional

  public String key() {
    return resource + "." + action;
  }
}
```

## Repositories (Infra)

### rbac/infra/UserRepository.java

```java
package com.yourorg.hotel.rbac.infra;

import com.yourorg.hotel.rbac.domain.UserEntity;
import org.springframework.data.jpa.repository.*;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {

  @EntityGraph(attributePaths = {"roles", "roles.permissions", "roles.submenus", "roles.submenus.menu"})
  Optional<UserEntity> findByEmailIgnoreCaseAndDeletedAtIsNull(String email);

  Optional<UserEntity> findByIdAndDeletedAtIsNull(UUID id);
}

```

### rbac/infra/MenuRepository.java

```java
package com.yourorg.hotel.rbac.infra;

import com.yourorg.hotel.rbac.domain.MenuEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MenuRepository extends JpaRepository<MenuEntity, UUID> {}

```

- (Repeat for Role, Permission, Submenu as needed.)

## Authentication (Login Endpoint) + UserDetailsService

### UserDetailsService loads permissions → authorities

#### common/security/DbUserDetailsService.java

```java
package com.yourorg.hotel.common.security;

import com.yourorg.hotel.rbac.domain.UserEntity;
import com.yourorg.hotel.rbac.domain.UserStatus;
import com.yourorg.hotel.rbac.infra.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class DbUserDetailsService implements UserDetailsService {

  private final UserRepository users;

  public DbUserDetailsService(UserRepository users) {
    this.users = users;
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    UserEntity user = users.findByEmailIgnoreCaseAndDeletedAtIsNull(username)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    if (user.getStatus() != UserStatus.ACTIVE) {
      throw new UsernameNotFoundException("User inactive");
    }

    var authorities = user.getRoles().stream()
        .flatMap(r -> r.getPermissions().stream())
        .map(p -> new SimpleGrantedAuthority(p.key()))
        .collect(Collectors.toSet());

    return org.springframework.security.core.userdetails.User
        .withUsername(user.getEmail())
        .password(user.getPasswordHash())
        .authorities(authorities)
        .accountLocked(false)
        .disabled(false)
        .build();
  }
}
```

### Auth Controller (issues JWT)

#### DTOs

```java
package com.yourorg.hotel.rbac.api.dto;

import jakarta.validation.constraints.*;

public record LoginRequest(
    @Email @NotBlank String email,
    @NotBlank @Size(min = 8) String password
) {}

public record LoginResponse(
    String accessToken,
    String tokenType,
    long expiresInSeconds
) {}

```

#### rbac/api/AuthController.java

```java
package com.yourorg.hotel.rbac.api;

import com.yourorg.hotel.common.security.JwtProperties;
import com.yourorg.hotel.common.security.JwtTokenService;
import com.yourorg.hotel.rbac.api.dto.LoginRequest;
import com.yourorg.hotel.rbac.api.dto.LoginResponse;
import com.yourorg.hotel.rbac.infra.UserRepository;

import jakarta.validation.Valid;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

  private final AuthenticationManager authManager;
  private final JwtTokenService jwtTokenService;
  private final JwtProperties props;
  private final UserRepository userRepo;

  public AuthController(AuthenticationManager authManager, JwtTokenService jwtTokenService,
                        JwtProperties props, UserRepository userRepo) {
    this.authManager = authManager;
    this.jwtTokenService = jwtTokenService;
    this.props = props;
    this.userRepo = userRepo;
  }

  @PostMapping("/login")
  public LoginResponse login(@Valid @RequestBody LoginRequest req) {
    Authentication auth = authManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.email(), req.password())
    );

    UserDetails principal = (UserDetails) auth.getPrincipal();

    var user = userRepo.findByEmailIgnoreCaseAndDeletedAtIsNull(req.email()).orElseThrow();
    String userId = user.getId().toString();
    String propertyId = user.getPropertyId() == null ? null : user.getPropertyId().toString();

    String token = jwtTokenService.issueAccessToken(
        userId,
        user.getEmail(),
        propertyId,
        principal.getAuthorities()
    );

    long expiresSec = props.accessTtlMinutes() * 60;

    return new LoginResponse(token, "Bearer", expiresSec);
  }
}
```

## RBAC Enforcement (API Security)

### Now you can secure endpoints like:

```java
@PreAuthorize("hasAuthority('rbac.ADMIN')")
@GetMapping("/api/v1/rbac/users")
public List<UserDto> listUsers() { ... }

```

- Because the JWT contains auth: ["rbac.ADMIN", "reservation.CREATE", ...].

#### ✅ Enterprise note: Keep access token TTL short (e.g., 15–30 minutes). If you want revocation/rotation, we add refresh tokens + token_version later.

## Navigation Endpoint (Menus visible if any Submenu granted)

### rbac/api/MeController.java

```java
package com.yourorg.hotel.rbac.api;

import com.yourorg.hotel.rbac.infra.UserRepository;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/me")
public class MeController {

  private final UserRepository users;

  public MeController(UserRepository users) {
    this.users = users;
  }

  @GetMapping("/navigation")
  public List<MenuNavDto> navigation(Authentication auth) {
    // auth.getName() = email (from UserDetails)
    var user = users.findByEmailIgnoreCaseAndDeletedAtIsNull(auth.getName()).orElseThrow();

    // Collect submenus from roles (granted UI access)
    Map<UUID, MenuNavDto> menuMap = new HashMap<>();

    user.getRoles().forEach(role -> role.getSubmenus().forEach(sub -> {
      var menu = sub.getMenu();
      var menuDto = menuMap.computeIfAbsent(menu.getId(),
          k -> new MenuNavDto(menu.getKey(), menu.getLabel(), menu.getSortOrder(), new ArrayList<>()));

      menuDto.submenus().add(new SubmenuNavDto(sub.getKey(), sub.getLabel(), sub.getRoute(), sub.getSortOrder()));
    }));

    // Convert to list, sort menus and submenus
    var list = new ArrayList<>(menuMap.values());
    list.sort(Comparator.comparingInt(MenuNavDto::sortOrder));

    list.forEach(m -> m.submenus().sort(Comparator.comparingInt(SubmenuNavDto::sortOrder)));

    return list;
  }

  public record MenuNavDto(String key, String label, int sortOrder, List<SubmenuNavDto> submenus) {}
  public record SubmenuNavDto(String key, String label, String route, int sortOrder) {}
}
```

- ✅ This exactly satisfies:
- Menu shows only if user has ≥1 submenu under it.

## Audit Logging (Production Pattern)

### You can do audit in a strict, explicit manner (recommended): services call AuditService.

#### common/audit/AuditService.java

```java
package com.yourorg.hotel.common.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuditService {

  private final AuditLogRepository repo;
  private final ObjectMapper om;

  public AuditService(AuditLogRepository repo, ObjectMapper om) {
    this.repo = repo;
    this.om = om;
  }

  public void log(UUID actorUserId, UUID propertyId, String entityType, UUID entityId,
                  String action, Object before, Object after,
                  String requestId, String ip, String userAgent) {

    var e = new AuditLogEntity();
    e.setActorUserId(actorUserId);
    e.setPropertyId(propertyId);
    e.setEntityType(entityType);
    e.setEntityId(entityId);
    e.setAction(action);
    e.setBeforeJson(before == null ? null : om.valueToTree(before));
    e.setAfterJson(after == null ? null : om.valueToTree(after));
    e.setRequestId(requestId);
    e.setIp(ip);
    e.setUserAgent(userAgent);

    repo.save(e);
  }
}
```
- (If you want, I’ll generate AuditLogEntity + Repository too — straightforward from the table.)

## Next.js Integration (Admin + Storefront)

### Admin login flow

1. POST /api/v1/auth/login with email/password
2. Store token securely:
   - Best: store in HttpOnly cookie set by backend (recommended)
   - Simple: store in memory + refresh (requires refresh tokens)

3. Every API call includes: Authorization: Bearer <token>
4. Load navigation: GET /api/v1/me/navigation and render sidebar

### Storefront

- For guests, you may keep public endpoints without JWT (booking search/quote/hold) but apply rate limiting later.
- For “Manage booking”, you can use OTP or guest JWT later.


