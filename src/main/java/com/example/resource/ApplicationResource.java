package com.example.resource;

import com.example.entity.Application;
import jakarta.annotation.security.PermitAll;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/applications")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class ApplicationResource {

    @GET
    @PermitAll
    public List<Application> listAll() {
        return Application.listAll();
    }

    @GET
    @Path("/{id}")
    @PermitAll
    public Response getById(@PathParam("id") Long id) {
        Application app = Application.findById(id);
        if (app == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(app).build();
    }

    @POST
    @Transactional
    @PermitAll
    public Response create(Application app) {
        app.persist();
        return Response.status(Response.Status.CREATED).entity(app).build();
    }
}