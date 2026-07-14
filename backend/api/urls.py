from django.urls import path

from .views import (
    energia_final,
    fision_simulation_page,
    health_check,
    monte_carlo,
    monte_carlo_fission,
    principal_page,
    scattering_elastic,
)

urlpatterns = [
    path("principal/", principal_page, name="principal_page"),
    path("health/", health_check, name="health_check"),
    path("energia-final/", energia_final, name="energia_final"),
    path("monte-carlo/", monte_carlo, name="monte_carlo"),
    path("simulations/monte-carlo-fission/", monte_carlo_fission, name="monte_carlo_fission"),
    path("simulations/scattering-elastic/", scattering_elastic, name="scattering_elastic"),
    path("fision/", fision_simulation_page, name="fision_simulation"),
]
