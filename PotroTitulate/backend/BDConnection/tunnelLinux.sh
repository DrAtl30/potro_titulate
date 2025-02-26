#!/bin/bash

ssh -i ./key-1.key -L 5433:localhost:5432 opc@129.153.221.86

# La línea "pause" no es necesaria en Linux.  El script se detendrá
# después de ejecutar el comando ssh. Si quieres que el script 
# continúe ejecutándose en segundo plano, puedes agregar un & al final
# del comando ssh.

# Ejemplo para ejecutar en segundo plano:
# ssh -i ./key-1.key -L 5433:localhost:5432 opc@129.153.221.86 &

# Si necesitas que el script espere a que termine el túnel SSH,
# puedes omitir el &.

# Si quieres que el script haga algo después de que se cierre la conexión SSH,
# puedes agregar comandos después de la línea ssh.
