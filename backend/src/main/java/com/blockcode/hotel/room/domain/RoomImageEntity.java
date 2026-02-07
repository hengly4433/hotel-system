package com.blockcode.hotel.room.domain;

import com.blockcode.hotel.common.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "room_images")
public class RoomImageEntity extends AuditableEntity {
    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "room_id", nullable = false)
    private UUID roomId;

    @Column(name = "url", nullable = false)
    private String url;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public void setRoomId(UUID roomId) {
        this.roomId = roomId;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }
}
