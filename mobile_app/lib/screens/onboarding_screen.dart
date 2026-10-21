import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/network_service.dart';
import '../theme.dart';
import 'login_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  bool _cameraGranted = false;
  bool _notificationGranted = false;
  bool _isOnline = true;

  @override
  void initState() {
    super.initState();
    _checkInitialPermissions();
  }

  Future<void> _checkInitialPermissions() async {
    final cam = await Permission.camera.status;
    final notif = await Permission.notification.status;
    final online = await NetworkService.hasInternet();
    if (mounted) {
      setState(() {
        _cameraGranted = cam.isGranted;
        _notificationGranted = notif.isGranted;
        _isOnline = online;
      });
    }
  }

  Future<void> _requestCameraPermission() async {
    HapticFeedback.lightImpact();
    final status = await Permission.camera.request();
    if (mounted) {
      setState(() => _cameraGranted = status.isGranted);
      if (!status.isGranted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text("Face ID va skaner uchun kamera ruxsati zarur."),
            backgroundColor: Colors.orange.shade800,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  Future<void> _requestNotificationPermission() async {
    HapticFeedback.lightImpact();
    final status = await Permission.notification.request();
    if (mounted) {
      setState(() => _notificationGranted = status.isGranted);
    }
  }

  Future<void> _completeOnboarding() async {
    HapticFeedback.mediumImpact();
    // Tarmoq holatini tekshirish
    final online = await NetworkService.hasInternet();
    if (!online && mounted) {
      final retry = await NetworkService.showOfflineDialog(context);
      if (!retry) return;
    }

    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('onboarding_completed', true);

    if (mounted) {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          transitionDuration: const Duration(milliseconds: 600),
          pageBuilder: (context, anim, secAnim) => const LoginScreen(),
          transitionsBuilder: (context, animation, secAnim, child) {
            return FadeTransition(opacity: animation, child: child);
          },
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar: Logo & Skip button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.school_rounded, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        "Smart School",
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.textDark,
                          letterSpacing: -0.3,
                        ),
                      ),
                    ],
                  ),
                  if (_currentPage < 2)
                    TextButton(
                      onPressed: _completeOnboarding,
                      style: TextButton.styleFrom(
                        foregroundColor: AppTheme.textMuted,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      ),
                      child: const Text(
                        "O'tkazib yuborish",
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                    )
                  else
                    const SizedBox(width: 48),
                ],
              ),
            ),

            // PageView
            Expanded(
              child: PageView(
                controller: _pageController,
                onPageChanged: (index) {
                  setState(() => _currentPage = index);
                  _checkInitialPermissions();
                },
                children: [
                  _buildPage(
                    badge: "1-BOSQICH",
                    badgeColor: AppTheme.primary,
                    icon: Icons.face_retouching_natural_rounded,
                    iconGradient: AppTheme.primaryGradient,
                    title: "Biometrik Face ID &\nAqlli Davomat",
                    description:
                        "Smart School orqali yuzni tanish (Face ID), Hikvision terminallari va dinamik QR-kodlar yordamida darslarga kirish-chiqish 100% aniqlikda nazorat qilinadi.",
                    permissionTitle: "Kamera ruxsati",
                    permissionDesc: "Face ID verifikatsiyasi va QR-kodlarni tezkor skanerlash uchun talab etiladi.",
                    isGranted: _cameraGranted,
                    onGrantPressed: _requestCameraPermission,
                    buttonText: _cameraGranted ? "Ruxsat berilgan ✅" : "Kamera ruxsatini berish 📷",
                  ),
                  _buildPage(
                    badge: "2-BOSQICH",
                    badgeColor: const Color(0xFFFF9F43),
                    icon: Icons.notifications_active_rounded,
                    iconGradient: const LinearGradient(
                      colors: [Color(0xFFFF9F43), Color(0xFFFF6584)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    title: "Tezkor Xabardorlik &\nOta-onalar Nazorati",
                    description:
                        "Dars jadvali, olingan baholar, turniketdan o'tish vaqti va darsdagi o'zgarishlar bo'yicha o'quvchi hamda ota-onaga bir zumda push va SMS xabarlar jo'natiladi.",
                    permissionTitle: "Bildirishnomalar ruxsati",
                    permissionDesc: "Darslar boshlanishi va muhim yangiliklarni o'tkazib yubormaslik uchun kerak.",
                    isGranted: _notificationGranted,
                    onGrantPressed: _requestNotificationPermission,
                    buttonText: _notificationGranted ? "Bildirishnomalar yoqilgan ✅" : "Bildirishnomalarga ruxsat 🔔",
                  ),
                  _buildPage(
                    badge: "3-BOSQICH",
                    badgeColor: const Color(0xFF10AC84),
                    icon: Icons.cloud_done_rounded,
                    iconGradient: const LinearGradient(
                      colors: [Color(0xFF10AC84), Color(0xFF2E86DE)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    title: "Doimiy Onlayn &\nXavfsiz Sinxronizatsiya",
                    description:
                        "Ilova faqat onlayn rejimda ishlaydi — ma'lumotlar soxtalashtirilishining oldini olish uchun Hikvision qurilmalari va markaziy server bilan to'g'ridan-to'g'ri bog'langan.",
                    permissionTitle: "Internet aloqasi talabi",
                    permissionDesc: "Face ID va davomat uchun uzluksiz tarmoq aloqasi bo'lishi shart.",
                    isGranted: _isOnline,
                    onGrantPressed: () async {
                      final has = await NetworkService.hasInternet();
                      setState(() => _isOnline = has);
                      if (!has && context.mounted) {
                        NetworkService.showOfflineDialog(context);
                      }
                    },
                    buttonText: _isOnline ? "Internet tarmog'i faol ✅" : "Tarmoqni tekshirish 🔄",
                  ),
                ],
              ),
            ),

            // Bottom Navigation Area
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              child: Column(
                children: [
                  // Dot Indicators
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(3, (index) {
                      final active = index == _currentPage;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: active ? 28 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: active ? AppTheme.primary : Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 24),

                  // Action Button
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 0,
                      ),
                      onPressed: () {
                        if (_currentPage < 2) {
                          _pageController.nextPage(
                            duration: const Duration(milliseconds: 350),
                            curve: Curves.easeInOut,
                          );
                        } else {
                          _completeOnboarding();
                        }
                      },
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            _currentPage < 2 ? "Keyingisi" : "Tizimga kirish",
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(width: 8),
                          Icon(
                            _currentPage < 2 ? Icons.arrow_forward_rounded : Icons.check_circle_rounded,
                            size: 20,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPage({
    required String badge,
    required Color badgeColor,
    required IconData icon,
    required LinearGradient iconGradient,
    required String title,
    required String description,
    required String permissionTitle,
    required String permissionDesc,
    required bool isGranted,
    required VoidCallback onGrantPressed,
    required String buttonText,
  }) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 10),
          // Step badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: badgeColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              badge,
              style: TextStyle(
                color: badgeColor,
                fontWeight: FontWeight.bold,
                fontSize: 12,
                letterSpacing: 0.5,
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Main Illustration Icon Card
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              gradient: iconGradient,
              borderRadius: BorderRadius.circular(32),
              boxShadow: [
                BoxShadow(
                  color: badgeColor.withValues(alpha: 0.3),
                  blurRadius: 28,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Icon(icon, size: 60, color: Colors.white),
          ),
          const SizedBox(height: 26),

          // Title
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              color: AppTheme.textDark,
              height: 1.25,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 14),

          // Description
          Text(
            description,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF6B7280),
              height: 1.5,
              fontWeight: FontWeight.w400,
            ),
          ),
          const SizedBox(height: 24),

          // Permission Action Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.background,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isGranted ? AppTheme.success.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.05),
              ),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isGranted ? AppTheme.success.withValues(alpha: 0.15) : AppTheme.primaryLight,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        isGranted ? Icons.check_circle_rounded : Icons.lock_open_rounded,
                        size: 20,
                        color: isGranted ? AppTheme.success : AppTheme.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            permissionTitle,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textDark,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            permissionDesc,
                            style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: isGranted ? AppTheme.success : AppTheme.primary,
                      backgroundColor: isGranted ? Colors.white : AppTheme.primaryLight,
                      side: BorderSide(
                        color: isGranted ? AppTheme.success.withValues(alpha: 0.5) : AppTheme.primary,
                      ),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    onPressed: isGranted ? null : onGrantPressed,
                    child: Text(
                      buttonText,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
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
