package com.yourorg.hotel.employee.infra;

import com.yourorg.hotel.employee.domain.EmployeeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<EmployeeEntity, UUID> {
  Optional<EmployeeEntity> findByIdAndDeletedAtIsNull(UUID id);

  List<EmployeeEntity> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

  List<EmployeeEntity> findAllByPropertyIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID propertyId);

  List<EmployeeEntity> findAllByPersonIdInAndDeletedAtIsNull(Collection<UUID> personIds);
}
