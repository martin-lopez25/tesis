from django.urls import path

from .views import (
    energia_final,
    fision_simulation_page,
    health_check,
    monte_carlo,
    monte_carlo_fission,
    principal_page,
    radioactive_decay,
    radioactive_decay_chain_export,
    radioactive_decay_chain_image,
    scattering_elastic,
)

urlpatterns = [
    path("principal/", principal_page, name="principal_page"),
    path("health/", health_check, name="health_check"),
    path("energia-final/", energia_final, name="energia_final"),
    path("monte-carlo/", monte_carlo, name="monte_carlo"),
    path("simulations/monte-carlo-fission/", monte_carlo_fission, name="monte_carlo_fission"),
    path("simulations/scattering-elastic/", scattering_elastic, name="scattering_elastic"),
    path("simulations/radioactive-decay/", radioactive_decay, name="radioactive_decay"),
    path("simulations/radioactive-decay-chain-export/", radioactive_decay_chain_export, name="radioactive_decay_chain_export"),
    path("simulations/radioactive-decay-chain-image/", radioactive_decay_chain_image, name="radioactive_decay_chain_image"),
    path("fision/", fision_simulation_page, name="fision_simulation"),
]
