import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../services/network_service.dart';
import '../theme.dart';
import 'login_screen.dart';
import 'onboarding_screen.dart';
import 'student/student_dashboard.dart';
import 'teacher/teacher_dashboard.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;
  String _statusText = "Tizim tayyorlanmoqda...";

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _scaleAnimation = CurvedAnimation(parent: _animController, curve: Curves.easeOutBack);
    _fadeAnimation = CurvedAnimation(parent: _animController, curve: Curves.easeIn);
    _animController.forward();

    _initializeApp();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _initializeApp() async {
    // 1. Splash ko'rinishi uchun minimal 1.2 soniya pauza
    await Future.delayed(const Duration(milliseconds: 1200));

    if (!mounted) return;
    setState(() => _statusText = "Internet aloqasi tekshirilmoqda...");

    // 2. Internet borligini tekshirish (majburiy onlayn shart)
    bool isOnline = await NetworkService.hasInternet();
    while (!isOnline && mounted) {
      if (!mounted) return;
      final retry = await NetworkService.showOfflineDialog(context);
      if (!mounted) return;
      if (retry) {
        isOnline = await NetworkService.hasInternet();
      } else {
        await Future.delayed(const Duration(seconds: 2));
        if (!mounted) return;
        isOnline = await NetworkService.hasInternet();
      }
    }

    if (!mounted) return;
    setState(() => _statusText = "Sozlamalar yuklanmoqda...");

    // 3. Onboarding holatini tekshirish (Bir martalik o'tish)
    final prefs = await SharedPreferences.getInstance();
    final bool onboardingDone = prefs.getBool('onboarding_completed') ?? false;

    await Future.delayed(const Duration(milliseconds: 400));

    if (!mounted) return;

    if (!onboardingDone) {
      // Birinchi marta kirganda Onboarding sahifasiga yo'naltirish
      _navigate(const OnboardingScreen());
    } else {
      // Agar token va foydalanuvchi mavjud bo'lsa, to'g'ridan-to'g'ri dashboardga
      if (ApiService.accessToken != null && ApiService.currentUser != null) {
        final role = ApiService.currentUser!['role'];
        if (role == 'TEACHER') {
          _navigate(const TeacherDashboard());
        } else {
          _navigate(const StudentDashboard());
        }
      } else {
        _navigate(const LoginScreen());
      }
    }
  }

  void _navigate(Widget screen) {
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 700),
        pageBuilder: (context, anim, secAnim) => screen,
        transitionsBuilder: (context, animation, secAnim, child) {
          return FadeTransition(opacity: animation, child: child);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Background soft gradient
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppTheme.primaryLight.withValues(alpha: 0.5),
                    Colors.white,
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ),

          // Central Logo & Branding
          Center(
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: ScaleAnimation(
                scale: _scaleAnimation,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Official Smart School Logo Badge
                    Container(
                      width: 110,
                      height: 110,
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(32),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primary.withValues(alpha: 0.35),
                            blurRadius: 30,
                            offset: const Offset(0, 12),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.school_rounded,
                          size: 60,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Brand Title
                    const Text(
                      "Smart School",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.textDark,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Brand Subtitle
                    const Text(
                      "Raqamli Ta'lim & Biometrik Davomat",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.primary,
                        letterSpacing: 0.2,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom loading & version indicator
          Positioned(
            left: 24,
            right: 24,
            bottom: 40,
            child: Column(
              children: [
                SizedBox(
                  width: 140,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: const LinearProgressIndicator(
                      minHeight: 4,
                      backgroundColor: AppTheme.primaryLight,
                      valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primary),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  _statusText,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppTheme.textMuted,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    "v1.0.0 Online Cloud",
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class ScaleAnimation extends StatelessWidget {
  final Animation<double> scale;
  final Widget child;

  const ScaleAnimation({super.key, required this.scale, required this.child});

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(scale: scale, child: child);
  }
}
