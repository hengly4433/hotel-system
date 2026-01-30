package com.yourorg.hotel.customer.application;

import com.yourorg.hotel.auth.security.JwtService;
import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.customer.api.dto.CustomerAuthResponse;
import com.yourorg.hotel.customer.api.dto.CustomerGoogleAuthRequest;
import com.yourorg.hotel.customer.api.dto.CustomerLoginRequest;
import com.yourorg.hotel.customer.api.dto.CustomerProfileResponse;
import com.yourorg.hotel.customer.api.dto.CustomerRegisterRequest;
import com.yourorg.hotel.customer.domain.CustomerAuthProvider;
import com.yourorg.hotel.customer.domain.CustomerEntity;
import com.yourorg.hotel.customer.domain.CustomerStatus;
import com.yourorg.hotel.customer.infra.CustomerRepository;
import com.yourorg.hotel.guest.domain.GuestEntity;
import com.yourorg.hotel.guest.domain.PersonEntity;
import com.yourorg.hotel.guest.infra.GuestRepository;
import com.yourorg.hotel.guest.infra.PersonRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CustomerAuthService {
  private static final List<String> CUSTOMER_AUTHORITIES = List.of("customer.BOOK");

  private final CustomerRepository customerRepository;
  private final PersonRepository personRepository;
  private final GuestRepository guestRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final GoogleIdentityService googleIdentityService;

  public CustomerAuthService(
      CustomerRepository customerRepository,
      PersonRepository personRepository,
      GuestRepository guestRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      GoogleIdentityService googleIdentityService
  ) {
    this.customerRepository = customerRepository;
    this.personRepository = personRepository;
    this.guestRepository = guestRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.googleIdentityService = googleIdentityService;
  }

  public CustomerAuthResponse register(CustomerRegisterRequest request) {
    if (customerRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(request.email()).isPresent()) {
      throw new AppException("EMAIL_TAKEN", "Email already registered", HttpStatus.BAD_REQUEST);
    }

    PersonEntity person = personRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(request.email())
        .orElseGet(PersonEntity::new);
    person.setFirstName(request.firstName());
    person.setLastName(request.lastName());
    person.setEmail(request.email());
    person.setPhone(request.phone());
    personRepository.save(person);

    GuestEntity guest = guestRepository.findByPersonIdAndDeletedAtIsNull(person.getId())
        .orElseGet(() -> {
          GuestEntity entity = new GuestEntity();
          entity.setPersonId(person.getId());
          return entity;
        });
    guestRepository.save(guest);

    CustomerEntity customer = new CustomerEntity();
    customer.setPersonId(person.getId());
    customer.setGuestId(guest.getId());
    customer.setEmail(request.email());
    customer.setPasswordHash(passwordEncoder.encode(request.password()));
    customer.setAuthProvider(CustomerAuthProvider.LOCAL);
    customer.setProviderSubject(null);
    customer.setStatus(CustomerStatus.ACTIVE);
    customerRepository.save(customer);

    return buildAuthResponse(customer, person);
  }

  public CustomerAuthResponse login(CustomerLoginRequest request) {
    CustomerEntity customer = customerRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(request.email())
        .orElseThrow(() -> new AppException("INVALID_CREDENTIALS", "Invalid credentials", HttpStatus.UNAUTHORIZED));

    if (customer.getStatus() != CustomerStatus.ACTIVE) {
      throw new AppException("ACCOUNT_SUSPENDED", "Account is suspended", HttpStatus.FORBIDDEN);
    }

    if (customer.getPasswordHash() == null || customer.getPasswordHash().isBlank()) {
      throw new AppException("OAUTH_ONLY", "Use Google sign-in for this account", HttpStatus.UNAUTHORIZED);
    }

    if (!passwordEncoder.matches(request.password(), customer.getPasswordHash())) {
      throw new AppException("INVALID_CREDENTIALS", "Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    customer.setLastLoginAt(Instant.now());
    customerRepository.save(customer);

    PersonEntity person = personRepository.findByIdAndDeletedAtIsNull(customer.getPersonId())
        .orElseThrow(() -> new AppException("NOT_FOUND", "Customer profile not found", HttpStatus.NOT_FOUND));

    return buildAuthResponse(customer, person);
  }

  public CustomerAuthResponse loginWithGoogle(CustomerGoogleAuthRequest request) {
    GoogleIdentityPayload payload = googleIdentityService.verify(request.idToken());

    CustomerEntity customer = customerRepository.findByProviderSubjectAndDeletedAtIsNull(payload.subject())
        .orElseGet(() -> customerRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(payload.email())
            .orElse(null));

    if (customer == null) {
      customer = registerWithGoogle(payload);
    } else {
      if (customer.getStatus() != CustomerStatus.ACTIVE) {
        throw new AppException("ACCOUNT_SUSPENDED", "Account is suspended", HttpStatus.FORBIDDEN);
      }

      if (customer.getAuthProvider() != CustomerAuthProvider.GOOGLE) {
        customer.setAuthProvider(CustomerAuthProvider.GOOGLE);
      }

      if (customer.getProviderSubject() != null && !customer.getProviderSubject().equals(payload.subject())) {
        throw new AppException("GOOGLE_SUBJECT_MISMATCH", "Google account mismatch", HttpStatus.UNAUTHORIZED);
      }

      customer.setProviderSubject(payload.subject());
      customer.setEmail(payload.email());
    }

    customer.setLastLoginAt(Instant.now());
    customerRepository.save(customer);

    PersonEntity person = personRepository.findByIdAndDeletedAtIsNull(customer.getPersonId())
        .orElseThrow(() -> new AppException("NOT_FOUND", "Customer profile not found", HttpStatus.NOT_FOUND));
    applyGoogleProfile(person, payload);
    personRepository.save(person);

    return buildAuthResponse(customer, person);
  }

  @Transactional(readOnly = true)
  public CustomerProfileResponse me(UUID customerId) {
    CustomerEntity customer = customerRepository.findByIdAndDeletedAtIsNull(customerId)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Customer not found", HttpStatus.NOT_FOUND));
    PersonEntity person = personRepository.findByIdAndDeletedAtIsNull(customer.getPersonId())
        .orElseThrow(() -> new AppException("NOT_FOUND", "Customer profile not found", HttpStatus.NOT_FOUND));
    return toProfile(customer, person);
  }

  private CustomerAuthResponse buildAuthResponse(CustomerEntity customer, PersonEntity person) {
    String token = jwtService.generateToken(customer.getId(), customer.getEmail(), CUSTOMER_AUTHORITIES);
    return new CustomerAuthResponse(
        token,
        "Bearer",
        jwtService.getAccessTokenTtlSeconds(),
        toProfile(customer, person)
    );
  }

  private CustomerProfileResponse toProfile(CustomerEntity customer, PersonEntity person) {
    return new CustomerProfileResponse(
        customer.getId(),
        person.getFirstName(),
        person.getLastName(),
        person.getEmail(),
        person.getPhone()
    );
  }

  private CustomerEntity registerWithGoogle(GoogleIdentityPayload payload) {
    NameParts names = resolveNames(payload);

    PersonEntity person = personRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(payload.email())
        .orElseGet(PersonEntity::new);
    if (isBlank(person.getFirstName())) {
      person.setFirstName(names.firstName());
    }
    if (isBlank(person.getLastName())) {
      person.setLastName(names.lastName());
    }
    person.setEmail(payload.email());
    personRepository.save(person);

    GuestEntity guest = guestRepository.findByPersonIdAndDeletedAtIsNull(person.getId())
        .orElseGet(() -> {
          GuestEntity entity = new GuestEntity();
          entity.setPersonId(person.getId());
          return entity;
        });
    guestRepository.save(guest);

    CustomerEntity customer = new CustomerEntity();
    customer.setPersonId(person.getId());
    customer.setGuestId(guest.getId());
    customer.setEmail(payload.email());
    customer.setPasswordHash(null);
    customer.setAuthProvider(CustomerAuthProvider.GOOGLE);
    customer.setProviderSubject(payload.subject());
    customer.setStatus(CustomerStatus.ACTIVE);
    return customerRepository.save(customer);
  }

  private void applyGoogleProfile(PersonEntity person, GoogleIdentityPayload payload) {
    NameParts names = resolveNames(payload);
    if (isBlank(person.getFirstName())) {
      person.setFirstName(names.firstName());
    }
    if (isBlank(person.getLastName())) {
      person.setLastName(names.lastName());
    }
    if (payload.email() != null && (person.getEmail() == null
        || !person.getEmail().equalsIgnoreCase(payload.email()))) {
      person.setEmail(payload.email());
    }
  }

  private NameParts resolveNames(GoogleIdentityPayload payload) {
    String givenName = payload.givenName();
    String familyName = payload.familyName();

    if (isBlank(givenName) || isBlank(familyName)) {
      String fullName = payload.fullName();
      if (!isBlank(fullName)) {
        String[] parts = fullName.trim().split("\\s+");
        if (isBlank(givenName) && parts.length > 0) {
          givenName = parts[0];
        }
        if (isBlank(familyName)) {
          familyName = parts.length > 1 ? parts[parts.length - 1] : "Guest";
        }
      }
    }

    if (isBlank(givenName)) {
      givenName = fallbackFromEmail(payload.email());
    }
    if (isBlank(familyName)) {
      familyName = "Guest";
    }

    return new NameParts(givenName, familyName);
  }

  private static boolean isBlank(String value) {
    return value == null || value.trim().isEmpty();
  }

  private static String fallbackFromEmail(String email) {
    if (email == null || email.isBlank()) {
      return "Guest";
    }
    int at = email.indexOf("@");
    String local = at > 0 ? email.substring(0, at) : email;
    return local.isBlank() ? "Guest" : local;
  }

  private record NameParts(String firstName, String lastName) {
  }
}
