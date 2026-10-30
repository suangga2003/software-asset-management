FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

RUN apt-get update && apt-get install -y maven

COPY . .
# Added -DskipTests to prevent tests from trying to connect to a database during build
RUN mvn package -Dquarkus.package.type=fast-jar -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /work/
COPY --from=build /app/target/quarkus-app/lib/ /work/lib/
COPY --from=build /app/target/quarkus-app/*.jar /work/
COPY --from=build /app/target/quarkus-app/app/ /work/app/
COPY --from=build /app/target/quarkus-app/quarkus/ /work/quarkus/

EXPOSE 8080
USER 185

ENTRYPOINT ["java", "-jar", "/work/quarkus-run.jar"]