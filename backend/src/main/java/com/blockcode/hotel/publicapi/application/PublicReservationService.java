package com.blockcode.hotel.publicapi.application;

import com.blockcode.hotel.common.exception.AppException;
import com.blockcode.hotel.customer.domain.CustomerEntity;
import com.blockcode.hotel.customer.infra.CustomerRepository;
import com.blockcode.hotel.guest.domain.GuestEntity;
import com.blockcode.hotel.guest.domain.PersonEntity;
import com.blockcode.hotel.guest.infra.GuestRepository;
import com.blockcode.hotel.guest.infra.PersonRepository;
import com.blockcode.hotel.publicapi.api.dto.PublicReservationRequest;
import com.blockcode.hotel.reservation.api.dto.ReservationCreateRequest;
import com.blockcode.hotel.reservation.api.dto.ReservationResponse;
import com.blockcode.hotel.reservation.api.dto.ReservationRoomRequest;
import com.blockcode.hotel.reservation.application.ReservationService;
import com.blockcode.hotel.reservation.domain.ChannelType;
import com.blockcode.hotel.reservation.domain.ReservationEntity;
import com.blockcode.hotel.reservation.domain.ReservationStatus;
import com.blockcode.hotel.reservation.infra.ReservationRepository;
import com.blockcode.hotel.room.domain.RoomTypeEntity;
import com.blockcode.hotel.room.infra.RoomTypeRepository;
import com.blockcode.hotel.pricing.domain.RatePlanEntity;
import com.blockcode.hotel.pricing.infra.RatePlanRepository;
import com.blockcode.hotel.property.infra.PropertyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PublicReservationService {
  private final ReservationService reservationService;
  private final ReservationRepository reservationRepository;
  private final CustomerRepository customerRepository;
  private final GuestRepository guestRepository;
  private final PersonRepository personRepository;
  private final PropertyRepository propertyRepository;
  private final RoomTypeRepository roomTypeRepository;
  private final RatePlanRepository ratePlanRepository;

  public PublicReservationService(
      ReservationService reservationService,
      ReservationRepository reservationRepository,
      CustomerRepository customerRepository,
      GuestRepository guestRepository,
      PersonRepository personRepository,
      PropertyRepository propertyRepository,
      RoomTypeRepository roomTypeRepository,
      RatePlanRepository ratePlanRepository
  ) {
    this.reservationService = reservationService;
    this.reservationRepository = reservationRepository;
    this.customerRepository = customerRepository;
    this.guestRepository = guestRepository;
    this.personRepository = personRepository;
    this.propertyRepository = propertyRepository;
    this.roomTypeRepository = roomTypeRepository;
    this.ratePlanRepository = ratePlanRepository;
  }

  public ReservationResponse create(PublicReservationRequest request) {
    validateSelection(request);

    CustomerEntity customer = requireCustomer();
    PersonEntity person = personRepository.findByIdAndDeletedAtIsNull(customer.getPersonId())
        .orElseThrow(() -> new AppException("NOT_FOUND", "Customer profile not found", HttpStatus.NOT_FOUND));

    if (request.guest() != null) {
      String email = request.guest().email();
      if (email != null && person.getEmail() != null && !person.getEmail().equalsIgnoreCase(email)) {
        throw new AppException("EMAIL_MISMATCH", "Guest email must match your account", HttpStatus.BAD_REQUEST);
      }
      person.setFirstName(request.guest().firstName());
      person.setLastName(request.guest().lastName());
      person.setEmail(person.getEmail() == null ? email : person.getEmail());
      person.setPhone(request.guest().phone());
      personRepository.save(person);
    }

    GuestEntity guest = guestRepository.findByPersonIdAndDeletedAtIsNull(person.getId())
        .orElseGet(() -> {
          GuestEntity entity = new GuestEntity();
          entity.setPersonId(person.getId());
          return entity;
        });
    guestRepository.save(guest);

    if (!guest.getId().equals(customer.getGuestId())) {
      customer.setGuestId(guest.getId());
      customerRepository.save(customer);
    }

    int guestsInRoom = Math.max(1, (request.adults() == null ? 1 : request.adults())
        + (request.children() == null ? 0 : request.children()));

    ReservationRoomRequest roomRequest = new ReservationRoomRequest(
        request.roomTypeId(),
        null,
        request.ratePlanId(),
        guestsInRoom,
        null
    );

    ReservationCreateRequest createRequest = new ReservationCreateRequest(
        request.propertyId(),
        guest.getId(),
        null,
        ReservationStatus.CONFIRMED,
        ChannelType.DIRECT,
        request.checkInDate(),
        request.checkOutDate(),
        request.adults(),
        request.children(),
        request.specialRequests(),
        List.of(roomRequest)
    );

    return reservationService.create(createRequest);
  }

  @Transactional(readOnly = true)
  public ReservationResponse getByCode(String code, String email) {
    ReservationEntity reservation = reservationRepository.findByCodeAndDeletedAtIsNull(code)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Reservation not found", HttpStatus.NOT_FOUND));
    ensureGuestEmail(reservation.getPrimaryGuestId(), email);
    return reservationService.get(reservation.getId());
  }

  @Transactional(readOnly = true)
  public List<ReservationResponse> listMine() {
    CustomerEntity customer = requireCustomer();
    UUID guestId = customer.getGuestId();
    if (guestId == null) {
      GuestEntity guest = guestRepository.findByPersonIdAndDeletedAtIsNull(customer.getPersonId()).orElse(null);
      if (guest == null) {
        return List.of();
      }
      guestId = guest.getId();
    }
    return reservationService.listByPrimaryGuestId(guestId);
  }

  public ReservationResponse cancelByCode(String code, String email) {
    ReservationEntity reservation = reservationRepository.findByCodeAndDeletedAtIsNull(code)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Reservation not found", HttpStatus.NOT_FOUND));
    ensureGuestEmail(reservation.getPrimaryGuestId(), email);
    return reservationService.cancel(reservation.getId());
  }

  private void ensureGuestEmail(UUID guestId, String email) {
    if (email == null || email.isBlank()) {
      throw new AppException("EMAIL_REQUIRED", "Email is required", HttpStatus.BAD_REQUEST);
    }
    var guest = guestRepository.findByIdAndDeletedAtIsNull(guestId)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Guest not found", HttpStatus.NOT_FOUND));
    var person = personRepository.findByIdAndDeletedAtIsNull(guest.getPersonId())
        .orElseThrow(() -> new AppException("NOT_FOUND", "Guest not found", HttpStatus.NOT_FOUND));

    if (person.getEmail() == null || !person.getEmail().equalsIgnoreCase(email)) {
      throw new AppException("NOT_FOUND", "Reservation not found", HttpStatus.NOT_FOUND);
    }
  }

  private void validateSelection(PublicReservationRequest request) {
    if (propertyRepository.findByIdAndDeletedAtIsNull(request.propertyId()).isEmpty()) {
      throw new AppException("PROPERTY_NOT_FOUND", "Property not found", HttpStatus.BAD_REQUEST);
    }

    RoomTypeEntity roomType = roomTypeRepository.findByIdAndDeletedAtIsNull(request.roomTypeId())
        .orElseThrow(() -> new AppException("ROOM_TYPE_NOT_FOUND", "Room type not found", HttpStatus.BAD_REQUEST));

    RatePlanEntity ratePlan = ratePlanRepository.findByIdAndDeletedAtIsNull(request.ratePlanId())
        .orElseThrow(() -> new AppException("RATE_PLAN_NOT_FOUND", "Rate plan not found", HttpStatus.BAD_REQUEST));

    if (!roomType.getPropertyId().equals(request.propertyId())) {
      throw new AppException("PROPERTY_MISMATCH", "Room type does not belong to property", HttpStatus.BAD_REQUEST);
    }

    if (!ratePlan.getPropertyId().equals(request.propertyId())) {
      throw new AppException("PROPERTY_MISMATCH", "Rate plan does not belong to property", HttpStatus.BAD_REQUEST);
    }
  }

  private CustomerEntity requireCustomer() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || authentication.getAuthorities().stream()
        .noneMatch(auth -> "customer.BOOK".equals(auth.getAuthority()))) {
      throw new AppException("AUTH_REQUIRED", "Please sign in to book", HttpStatus.UNAUTHORIZED);
    }
    UUID customerId;
    try {
      customerId = UUID.fromString(authentication.getName());
    } catch (Exception ex) {
      throw new AppException("AUTH_REQUIRED", "Please sign in to book", HttpStatus.UNAUTHORIZED);
    }
    return customerRepository.findByIdAndDeletedAtIsNull(customerId)
        .orElseThrow(() -> new AppException("AUTH_REQUIRED", "Please sign in to book", HttpStatus.UNAUTHORIZED));
  }
}
