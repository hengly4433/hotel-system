package com.yourorg.hotel.rbac.api.dto;

import java.util.List;
import java.util.UUID;

public record UserRolesReplaceRequest(List<UUID> roleIds) {
}
