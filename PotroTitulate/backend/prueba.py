from locust import HttpUser, task, between

class UsuarioSimulado(HttpUser):
    wait_time = between(1, 3)  # Espera entre peticiones

    @task
    def pagina_principal(self):
        self.client.get("/")

    @task
    def login(self):
        self.client.post("/login/", {
            "username": "prueba",
            "password": "123456"
        })
