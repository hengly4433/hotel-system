package com.yourorg.hotel.employee.application;

import com.yourorg.hotel.common.exception.AppException;
import com.yourorg.hotel.employee.api.dto.EmployeeRequest;
import com.yourorg.hotel.employee.api.dto.EmployeeResponse;
import com.yourorg.hotel.employee.domain.EmployeeEntity;
import com.yourorg.hotel.employee.domain.EmploymentStatus;
import com.yourorg.hotel.employee.infra.EmployeeRepository;
import com.yourorg.hotel.guest.domain.PersonEntity;
import com.yourorg.hotel.guest.infra.PersonRepository;
import com.yourorg.hotel.property.infra.PropertyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
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
public class EmployeeService {
  private final EmployeeRepository employeeRepository;
  private final PersonRepository personRepository;
  private final PropertyRepository propertyRepository;
  private final ObjectMapper objectMapper;

  public EmployeeService(
      EmployeeRepository employeeRepository,
      PersonRepository personRepository,
      PropertyRepository propertyRepository,
      ObjectMapper objectMapper
  ) {
    this.employeeRepository = employeeRepository;
    this.personRepository = personRepository;
    this.propertyRepository = propertyRepository;
    this.objectMapper = objectMapper;
  }

  public EmployeeResponse create(EmployeeRequest request) {
    validateProperty(request.propertyId());

    PersonEntity person = new PersonEntity();
    applyPerson(person, request);
    personRepository.save(person);

    EmployeeEntity employee = new EmployeeEntity();
    employee.setPropertyId(request.propertyId());
    employee.setPersonId(person.getId());
    employee.setJobTitle(request.jobTitle());
    employee.setDepartment(request.department());
    employee.setHireDate(request.hireDate());
    employee.setHourlyRate(request.hourlyRate());
    employee.setSkills(normalizeSkills(request.skills()));
    employee.setPhotoUrl(request.photoUrl());
    employee.setEmploymentStatus(request.employmentStatus() == null
        ? EmploymentStatus.ACTIVE
        : request.employmentStatus());

    employeeRepository.save(employee);
    return toResponse(employee, person);
  }

  @Transactional(readOnly = true)
  public List<EmployeeResponse> list(UUID propertyId) {
    List<EmployeeEntity> employees = propertyId == null
        ? employeeRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc()
        : employeeRepository.findAllByPropertyIdAndDeletedAtIsNullOrderByCreatedAtDesc(propertyId);

    List<UUID> personIds = employees.stream().map(EmployeeEntity::getPersonId).toList();
    Map<UUID, PersonEntity> personMap = new HashMap<>();
    if (!personIds.isEmpty()) {
      personRepository.findAllByIdInAndDeletedAtIsNull(personIds)
          .forEach(person -> personMap.put(person.getId(), person));
    }

    return employees.stream()
        .map(employee -> toResponse(employee, personMap.get(employee.getPersonId())))
        .filter(response -> response != null)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<EmployeeResponse> search(String query) {
    if (query == null || query.isBlank()) {
      return List.of();
    }

    List<PersonEntity> people = personRepository.searchPeople(query);
    if (people.isEmpty()) {
      return List.of();
    }

    List<UUID> personIds = people.stream().map(PersonEntity::getId).toList();
    List<EmployeeEntity> employees = employeeRepository.findAllByPersonIdInAndDeletedAtIsNull(personIds);

    Map<UUID, PersonEntity> personMap = new HashMap<>();
    for (PersonEntity person : people) {
      personMap.put(person.getId(), person);
    }

    return employees.stream()
        .map(employee -> toResponse(employee, personMap.get(employee.getPersonId())))
        .filter(response -> response != null)
        .toList();
  }

  @Transactional(readOnly = true)
  public EmployeeResponse get(UUID id) {
    EmployeeEntity employee = employeeRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Employee not found", HttpStatus.NOT_FOUND));
    PersonEntity person = personRepository.findByIdAndDeletedAtIsNull(employee.getPersonId())
        .orElseThrow(() -> new AppException("PERSON_NOT_FOUND", "Person not found", HttpStatus.NOT_FOUND));
    return toResponse(employee, person);
  }

  public EmployeeResponse update(UUID id, EmployeeRequest request) {
    EmployeeEntity employee = employeeRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Employee not found", HttpStatus.NOT_FOUND));
    PersonEntity person = personRepository.findByIdAndDeletedAtIsNull(employee.getPersonId())
        .orElseThrow(() -> new AppException("PERSON_NOT_FOUND", "Person not found", HttpStatus.NOT_FOUND));

    validateProperty(request.propertyId());

    applyPerson(person, request);
    personRepository.save(person);

    employee.setPropertyId(request.propertyId());
    employee.setJobTitle(request.jobTitle());
    employee.setDepartment(request.department());
    employee.setHireDate(request.hireDate());
    employee.setHourlyRate(request.hourlyRate());
    employee.setSkills(normalizeSkills(request.skills()));
    employee.setPhotoUrl(request.photoUrl());
    employee.setEmploymentStatus(request.employmentStatus() == null
        ? EmploymentStatus.ACTIVE
        : request.employmentStatus());

    employeeRepository.save(employee);
    return toResponse(employee, person);
  }

  public void softDelete(UUID id) {
    EmployeeEntity employee = employeeRepository.findByIdAndDeletedAtIsNull(id)
        .orElseThrow(() -> new AppException("NOT_FOUND", "Employee not found", HttpStatus.NOT_FOUND));
    PersonEntity person = personRepository.findByIdAndDeletedAtIsNull(employee.getPersonId())
        .orElseThrow(() -> new AppException("PERSON_NOT_FOUND", "Person not found", HttpStatus.NOT_FOUND));

    Instant now = Instant.now();
    employee.setDeletedAt(now);
    person.setDeletedAt(now);
    employeeRepository.save(employee);
    personRepository.save(person);
  }

  private void validateProperty(UUID propertyId) {
    if (propertyRepository.findByIdAndDeletedAtIsNull(propertyId).isEmpty()) {
      throw new AppException("PROPERTY_NOT_FOUND", "Property not found", HttpStatus.BAD_REQUEST);
    }
  }

  private void applyPerson(PersonEntity person, EmployeeRequest request) {
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

  private EmployeeResponse toResponse(EmployeeEntity employee, PersonEntity person) {
    if (employee == null || person == null) {
      return null;
    }
    return new EmployeeResponse(
        employee.getId(),
        employee.getPersonId(),
        employee.getPropertyId(),
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
        employee.getJobTitle(),
        employee.getDepartment(),
        employee.getHireDate(),
        employee.getHourlyRate(),
        employee.getSkills(),
        employee.getPhotoUrl(),
        employee.getEmploymentStatus()
    );
  }

  private String normalizeSkills(String skills) {
    if (skills == null || skills.isBlank()) {
      return null;
    }
    try {
      objectMapper.readTree(skills);
      return skills;
    } catch (Exception ex) {
      throw new AppException("INVALID_SKILLS", "Skills must be valid JSON", HttpStatus.BAD_REQUEST);
    }
  }
}
