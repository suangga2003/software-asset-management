package com.example.resource;

import com.example.entity.ArchitectureComponent;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/architecture")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class ArchitectureResource {

    @GET
    @PermitAll
    public List<ArchitectureComponent> getBlueprint() {
        // Accessible by all roles (High-level or detailed view)
        return ArchitectureComponent.listAll();
    }

    @POST
    @RolesAllowed("IT-Architect")
    @Transactional
    public Response createComponent(ArchitectureComponent component) {
        // Enforce blueprint validation rules
        if ("CORE_BANKING".equals(component.componentType) && !"Restricted".equalsIgnoreCase(component.networkAccess)) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Core Banking system cannot be accessed directly and must route through Middleware.").build();
        }

        component.persist();
        return Response.status(Response.Status.CREATED).entity(component).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("IT-Architect")
    @Transactional
    public Response updateComponent(@PathParam("id") Long id, ArchitectureComponent updatedComponent) {
        ArchitectureComponent component = ArchitectureComponent.findById(id);
        if (component == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        component.componentName = updatedComponent.componentName;
        component.componentType = updatedComponent.componentType;
        component.networkAccess = updatedComponent.networkAccess;
        component.description = updatedComponent.description;
        component.active = updatedComponent.active;

        return Response.ok(component).build();
    }
}