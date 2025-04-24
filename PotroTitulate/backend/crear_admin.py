import os
import django
import re
import getpass  # Para manejar contraseñas de forma segura

# Configuración inicial de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from api.models import Administrativos

def validar_email(email):
    """Valida el formato de email con expresión regular robusta"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validar_password(password):
    """Valida los requisitos de seguridad de la contraseña"""
    if len(password) < 8:
        return False, "La contraseña debe tener al menos 8 caracteres"
    if not re.search(r'[A-Z]', password):
        return False, "Debe contener al menos una letra mayúscula"
    if not re.search(r'[0-9]', password):
        return False, "Debe contener al menos un número"
    if not re.search(r'[^A-Za-z0-9]', password):
        return False, "Debe contener al menos un carácter especial"
    return True, ""

def mostrar_requisitos_password():
    """Muestra los requisitos de contraseña"""
    print("\n🔐 Requisitos de contraseña:")
    print("- Mínimo 8 caracteres")
    print("- Al menos 1 letra mayúscula")
    print("- Al menos 1 número")
    print("- Al menos 1 carácter especial (!@#$%^&*)")

def obtener_input(mensaje, obligatorio=True, validar_func=None, es_password=False):
    """Obtiene input validado del usuario"""
    while True:
        try:
            if es_password:
                valor = getpass.getpass(mensaje + ": ")
            else:
                valor = input(mensaje + ": ").strip()
            
            if obligatorio and not valor:
                print("⚠️ Este campo es obligatorio.")
                continue
                
            if validar_func:
                if callable(validar_func):
                    if es_password:
                        valido, mensaje_error = validar_func(valor)
                        if not valido:
                            print(f"⚠️ {mensaje_error}")
                            mostrar_requisitos_password()
                            continue
                    else:
                        if not validar_func(valor):
                            print("⚠️ Valor no válido.")
                            continue
                else:
                    raise ValueError("Función de validación no válida")
            
            return valor
        except KeyboardInterrupt:
            print("\nOperación cancelada por el usuario.")
            exit(0)
        except Exception as e:
            print(f"Error: {str(e)}")

def crear_admin():
    """Crea un nuevo usuario administrativo"""
    print("\n" + "="*50)
    print("🔧 CREACIÓN DE USUARIO ADMINISTRATIVO".center(50))
    print("="*50 + "\n")

    # Obtener datos del usuario
    username = obtener_input(
        "📧 Nombre de usuario (correo electrónico)",
        validar_func=validar_email
    )
    
    # Verificar si el usuario ya existe
    if User.objects.filter(username=username).exists():
        print("\n⚠️ Ya existe un usuario con ese nombre de usuario.\n")
        return

    email = obtener_input(
        "📨 Correo electrónico",
        validar_func=validar_email
    )
    
    print("\n" + "-"*50)
    mostrar_requisitos_password()
    print("-"*50 + "\n")
    
    password = obtener_input(
        "🔒 Contraseña",
        es_password=True,
        validar_func=validar_password
    )
    
    confirm_password = obtener_input(
        "🔒 Confirmar contraseña",
        es_password=True
    )
    
    if password != confirm_password:
        print("\n⚠️ Las contraseñas no coinciden.\n")
        return

    first_name = obtener_input("👤 Nombre")
    last_name = obtener_input("👤 Apellido")
    nombre_admin = obtener_input("🏢 Nombre completo administrativo")

    # Mostrar resumen
    print("\n" + "="*50)
    print("📋 RESUMEN DE DATOS".center(50))
    print("="*50)
    print(f"👤 Usuario: {username}")
    print(f"📧 Email: {email}")
    print(f"👨 Nombre: {first_name} {last_name}")
    print(f"🏢 Nombre administrativo: {nombre_admin}")
    print("="*50 + "\n")

    # Confirmación final
    confirmacion = input("¿Confirmar la creación de este administrador? (s/n): ").strip().lower()
    if confirmacion != 's':
        print("\n❌ Operación cancelada.\n")
        return

    try:
        # Crear usuario Django
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
            is_active=True
        )

        # Crear perfil administrativo
        Administrativos.objects.create(
            nombre=nombre_admin,
            correo_electronico=email,
            user=user
        )

        print("\n✅ Administrador creado exitosamente!")
        print(f"🔑 Usuario: {username}")
        print(f"🔒 Contraseña: {'*' * len(password)}")
        print("\n⚠️ Guarda estas credenciales en un lugar seguro.\n")

    except Exception as e:
        print(f"\n❌ Error al crear administrador: {str(e)}\n")
        # Intentar limpiar en caso de error
        if 'user' in locals() and user.pk:
            user.delete()

if __name__ == '__main__':
    try:
        crear_admin()
    except KeyboardInterrupt:
        print("\nOperación cancelada por el usuario.")
    except Exception as e:
        print(f"\n❌ Error inesperado: {str(e)}\n")