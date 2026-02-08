package com.blockcode.hotel.auth.api.dto;

import java.util.List;
import java.util.UUID;

public record RoleSubmenusReplaceRequest(List<UUID> submenuIds) {
}
