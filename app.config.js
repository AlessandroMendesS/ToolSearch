module.exports = {
    name: 'ToolSearch',
    version: '1.0.0',
    android: {
        package: 'com.alessandro.toolsearch',
        permissions: [
            'READ_EXTERNAL_STORAGE',
            'WRITE_EXTERNAL_STORAGE',
            'READ_MEDIA_IMAGES'
        ]
    },
    plugins: [
        'expo-localization',
        [
            'expo-media-library',
            {
                photosPermission: 'O aplicativo precisa de permissão para salvar QR Codes na galeria.',
                savePhotosPermission: 'Permite que o aplicativo salve QR Codes na galeria.',
                isAccessMediaLocationEnabled: false
            }
        ]
    ],
    extra: {
        supabaseUrl: 'https://gugursnnzngieaztnzjg.supabase.co',
        supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Z3Vyc25uem5naWVhenRuempnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDY5NDgsImV4cCI6MjA2MjM4Mjk0OH0.ftKm50NNuKeWeDfer4zsTcqw5sIXkepzB4OA_dsL-J0',
        eas: {
            projectId: "afceccf9-c4b6-4abd-9c83-47f789c349a9"
        }
    },
}; 