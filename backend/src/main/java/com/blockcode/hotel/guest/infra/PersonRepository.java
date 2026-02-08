package com.blockcode.hotel.guest.infra;

import com.blockcode.hotel.guest.domain.PersonEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PersonRepository extends JpaRepository<PersonEntity, UUID> {
  Optional<PersonEntity> findByIdAndDeletedAtIsNull(UUID id);

  Optional<PersonEntity> findByEmailIgnoreCaseAndDeletedAtIsNull(String email);

  List<PersonEntity> findAllByIdInAndDeletedAtIsNull(Collection<UUID> ids);

  @Query("""
      select p from PersonEntity p
      where p.deletedAt is null
        and (
          lower(p.firstName) like lower(concat('%', :q, '%'))
          or lower(p.lastName) like lower(concat('%', :q, '%'))
          or lower(p.email) like lower(concat('%', :q, '%'))
          or lower(p.phone) like lower(concat('%', :q, '%'))
        )
      """)
  List<PersonEntity> searchPeople(@Param("q") String query);
}
