package com.example.resource;

import com.example.entity.Application;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/apps")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class AppResource {

    @GET
    public List<Application> getAllApps() {
        return Application.listAll();
    }

    @POST
    @Transactional
    public Response createApp(Application app) {
        app.persist();
        return Response.status(Response.Status.CREATED).entity(app).build();
    }
}