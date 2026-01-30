package com.yourorg.hotel.guest.application;

import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.guest.api.dto.GuestRequest;
import com.yourorg.hotel.guest.api.dto.GuestResponse;
import com.yourorg.hotel.guest.domain.GuestEntity;
import com.yourorg.hotel.guest.domain.LoyaltyTier;
import com.yourorg.hotel.guest.domain.PersonEntity;
import com.yourorg.hotel.guest.infra.GuestRepository;
import com.yourorg.hotel.guest.infra.PersonRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class GuestService {
  private final GuestRepository guestRepository;
  private final PersonRepository personRepository;

  public GuestService(GuestRepository guestRepository, PersonRepository personRepository) {
    this.guestRepository = guestRepository;
    this.personRepository = personRepository;
  }

  public GuestResponse create(GuestRequest request) {
    PersonEntity person = new PersonEntity();
    applyPerson(person, request);
    personRepository.save(person);

    GuestEntity guest = new GuestEntity();
    guest.setPersonId(person.getId());
    guest.setLoyaltyTier(request.loyaltyTier() == null ? LoyaltyTier.NONE : request.loyaltyTier());
    guest.setNotes(request.notes());
    guestRepository.save(guest);

    return toResponse(guest, person);
  }

  @Transactional(readOnly = true)
  public List<GuestResponse> list() {
    List<GuestEntity> guests = guestRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc();
    List<UUID> personIds = guests.stream().map(GuestEntity::getPersonId).toList();
    Map<UUID, PersonEntity> personMap = new HashMap<>();
    if (!personIds.isEmpty()) {
      personRepository.findAllByIdInAndDeletedAtIsNull(personIds)
          .forEach(person -> personMap.put(person.getId(), person));
    }

    return guests.stream()
        .map(guest -> toResponse(guest, personMap.get(guest.getPersonId())))
        .filter(response -> response != null)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<GuestResponse> search(String query) {
    if (query == null || query.isBlank()) {
      return List.of();
    }

    List<PersonEntity> people = personRepository.searchPeople(query);
    if (people.isEmpty()) {
      return List.of();
    }

    List<UUID> personIds = people.stream().map(PersonEntity::getId).toList();
    List<GuestEntity> guests = guestRepository.findAllByPersonIdInAndDeletedAtIsNull(personIds);

    Map<UUID, PersonEntity> personMap = new HashMap<>();
    for (PersonEntity person : people) {
      personMap.put(person.getId(), person);
    }

    return guests.stream()
        .map(guest -> toResponse(guest, personMap.get(guest.getPersonId())))
        .filter(response -> response != null)
        .toList();
  }

  @Transactional(readOnly = true)
  public GuestResponse get(UUID id) {
    GuestEntity guest = guestRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Guest not found", HttpStatus.NOT_FOUND));
    PersonEntity person = personRepository.findByIdAndDeletedAtIsNull(guest.getPersonId())
        .orElseThrow(() -> new AppException("PERSON_NOT_FOUND", "Person not found", HttpStatus.NOT_FOUND));
    return toResponse(guest, person);
  }

  public GuestResponse update(UUID id, GuestRequest request) {
    GuestEntity guest = guestRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Guest not found", HttpStatus.NOT_FOUND));
    PersonEntity person = personRepository.findByIdAndDeletedAtIsNull(guest.getPersonId())
        .orElseThrow(() -> new AppException("PERSON_NOT_FOUND", "Person not found", HttpStatus.NOT_FOUND));

    applyPerson(person, request);
    personRepository.save(person);

    guest.setLoyaltyTier(request.loyaltyTier() == null ? LoyaltyTier.NONE : request.loyaltyTier());
    guest.setNotes(request.notes());
    guestRepository.save(guest);

    return toResponse(guest, person);
  }

  public void softDelete(UUID id) {
    GuestEntity guest = guestRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Guest not found", HttpStatus.NOT_FOUND));
    PersonEntity person = personRepository.findByIdAndDeletedAtIsNull(guest.getPersonId())
        .orElseThrow(() -> new AppException("PERSON_NOT_FOUND", "Person not found", HttpStatus.NOT_FOUND));

    Instant now = Instant.now();
    guest.setDeletedAt(now);
    person.setDeletedAt(now);
    guestRepository.save(guest);
    personRepository.save(person);
  }

  private void applyPerson(PersonEntity person, GuestRequest request) {
    person.setFirstName(request.firstName());
    person.setLastName(request.lastName());
    person.setDob(request.dob());
    person.setPhone(request.phone());
    person.setEmail(request.email());
    person.setAddressLine1(request.addressLine1());
    person.setAddressLine2(request.addressLine2());
    person.setCity(request.city());
    person.setState(request.state());
    person.setPostalCode(request.postalCode());
    person.setCountry(request.country());
  }

  private GuestResponse toResponse(GuestEntity guest, PersonEntity person) {
    if (guest == null || person == null) {
      return null;
    }
    return new GuestResponse(
        guest.getId(),
        guest.getPersonId(),
        person.getFirstName(),
        person.getLastName(),
        person.getDob(),
        person.getPhone(),
        person.getEmail(),
        person.getAddressLine1(),
        person.getAddressLine2(),
        person.getCity(),
        person.getState(),
        person.getPostalCode(),
        person.getCountry(),
        guest.getLoyaltyTier(),
        guest.getNotes()
    );
  }
}
