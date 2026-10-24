import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:google_fonts/google_fonts.dart';
import 'services/earthlink_api_service.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Dark Status Bar and Navigation Bar
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF06030C),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  final apiService = EarthlinkApiService();
  await apiService.init();

  runApp(EarthlinkVipApp(apiService: apiService));
}

class EarthlinkVipApp extends StatefulWidget {
  final EarthlinkApiService apiService;

  const EarthlinkVipApp({super.key, required this.apiService});

  @override
  State<EarthlinkVipApp> createState() => _EarthlinkVipAppState();
}

class _EarthlinkVipAppState extends State<EarthlinkVipApp> {
  bool _isLoggedIn = true;

  @override
  void initState() {
    super.initState();
    _isLoggedIn = widget.apiService.authToken != null;
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Earthlink VIP',
      debugShowCheckedModeBanner: false,

      // Arabic RTL Configuration
      locale: const Locale('ar', 'IQ'),
      supportedLocales: const [
        Locale('ar', 'IQ'),
        Locale('en', 'US'),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],

      // Luxury Dark AMOLED Theme
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF06030C),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF9333EA),
          secondary: Color(0xFF38BDF8),
          surface: Color(0xFF0F172A),
        ),
        textTheme: GoogleFonts.cairoTextTheme(ThemeData.dark().textTheme),
      ),

      home: _isLoggedIn
          ? HomeScreen(
              apiService: widget.apiService,
              onLogout: () async {
                await widget.apiService.logout();
                setState(() => _isLoggedIn = false);
              },
            )
          : LoginScreen(
              apiService: widget.apiService,
              onLoginSuccess: () {
                setState(() => _isLoggedIn = true);
              },
            ),
    );
  }
}
