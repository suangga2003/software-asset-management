package com.example.resource;

import com.example.entity.UserAccount;
import io.quarkus.elytron.security.common.BcryptUtil;
import jakarta.annotation.security.PermitAll;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class AuthResource {

    public static class LoginRequest {
        public String username;
        public String password;
    }

    @POST
    @Path("/login")
    @PermitAll
    public Response login(LoginRequest request) {
        seedDefaultUsers();

        UserAccount user = UserAccount.findByUsername(request.username);

        // Verify BCrypt hashed password
        if (user != null && BcryptUtil.matches(request.password, user.password)) {
            return Response.ok(Map.of(
                    "username", user.username,
                    "fullName", user.fullName,
                    "role", user.role
            )).build();
        }
        return Response.status(Response.Status.UNAUTHORIZED)
                .entity("Invalid username or password").build();
    }

    @Transactional
    public void seedDefaultUsers() {
        if (UserAccount.count() == 0) {
            UserAccount architect = new UserAccount();
            architect.username = "architect";
            architect.password = BcryptUtil.bcryptHash("architect123"); // BCrypt Hashed
            architect.role = "IT-Architect";
            architect.fullName = "Arief Suangga (Lead Architect)";
            architect.persist();

            UserAccount viewer = new UserAccount();
            viewer.username = "viewer";
            viewer.password = BcryptUtil.bcryptHash("viewer123");       // BCrypt Hashed
            viewer.role = "Viewer";
            viewer.fullName = "Enterprise Operations Viewer";
            viewer.persist();
        }
    }
}