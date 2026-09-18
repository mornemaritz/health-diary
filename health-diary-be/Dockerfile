# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY src/HealthDiary.Api.csproj ./src/
RUN dotnet restore ./src/HealthDiary.Api.csproj

# Copy everything else and build
COPY . .
WORKDIR /src/src
RUN dotnet build HealthDiary.Api.csproj -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish HealthDiary.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

# Create a custom app user and group to avoid running as root
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Copy published app
COPY --from=publish --chown=appuser:appgroup /app/publish .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Set environment variables for ASP.NET Core
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "HealthDiary.Api.dll"]
