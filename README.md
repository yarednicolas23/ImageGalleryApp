# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.




🔍 Diagnóstico actual:
Se ha identificado que el error que se dispara en estos casos es un error 440, que internamente corresponde a expiredSession.

Se concluye que la sesión asociada al usuario ha expirado en algún punto del proceso de reautenticación automática vía PWLS.

Se ha probado invocar de forma explícita el método interno renewSessionId() para restaurar la sesión.



Resultado:
La sesión parece renovarse correctamente, pero los módulos mencionados siguen retornando error, lo cual indica que la sesión renovada no se está propagando correctamente o no es reconocida por todos los servicios/módulos afectados.

🧭 Próximos pasos en la solución:
Validación del flujo de propagación del renewSessionId():

Verificar si efectivamente se actualiza el token/sessionId en todos los contextos (local, storage seguro, headers de red).

Asegurar que el nuevo sessionId sea referenciado correctamente por los módulos MBaaS y otros servicios afectados.

Revisión de logs centralizados y trazabilidad distribuida:

Correlacionar la sesión antes y después del renewSessionId() para identificar inconsistencias en headers o sesiones paralelas.

Revisar si los servicios afectados están validando tokens que ya no están vigentes.

Validaciones de entorno (staging o QA):

Reproducir el flujo completo en entorno de pruebas, confirmando estado de sesión en cada paso.

Incluir escenarios con más de un cambio de usuario consecutivo.

Coordinación con equipos de MBaaS y servicios de backend:

Escalar el incidente con evidencia de logs donde el sessionId válido no es reconocido.

Solicitar revisión del manejo de sesiones en cada módulo impactado.

Plan de contingencia (en evaluación):

Considerar invalidar la sesión al hacer “Cambiar usuario” para forzar un flujo limpio.

Alternativa temporal: mostrar mensaje claro al usuario y bloquear el flujo si se detecta un sessionId expirado.

📌 Estado actual:
🔄 Diagnóstico parcial completo. Se ha identificado la causa probable del error como una sesión expirada y se está aplicando renovación de sesión.

🚧 Solución en progreso. Persisten errores en módulos críticos, por lo cual seguimos validando la correcta propagación del sessionId y el comportamiento de los servicios backend involucrados.
