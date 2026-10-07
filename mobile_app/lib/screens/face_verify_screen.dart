import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme.dart';
import 'student/student_dashboard.dart';
import 'teacher/teacher_dashboard.dart';

class FaceVerifyScreen extends StatefulWidget {
  final int userId;
  final String fullName;
  final String role;

  const FaceVerifyScreen({
    super.key,
    required this.userId,
    required this.fullName,
    required this.role,
  });

  @override
  State<FaceVerifyScreen> createState() => _FaceVerifyScreenState();
}

class _FaceVerifyScreenState extends State<FaceVerifyScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  int _attempts = 3;
  bool _scanning = false;
  String _statusText = "Yuzingizni to'g'ri tuting...\nOval ramka ichiga joylashtiring";
  bool _verified = false;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _startVerification() async {
    setState(() {
      _scanning = true;
      _statusText = "Liveness tekshiruvi: Ko'zingizni pirpirating va jilmaying...";
    });

    await Future.delayed(const Duration(seconds: 2));

    try {
      final res = await ApiService.verifyFaceId(widget.userId, true);
      if (res['access'] != null) {
        setState(() {
          _verified = true;
          _statusText = "Yuz mos keldi! ✅\n10 kunlik xavfsiz sessiya yaratildi";
        });

        await Future.delayed(const Duration(milliseconds: 1200));
        if (!mounted) return;

        if (widget.role == 'TEACHER') {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (_) => const TeacherDashboard()),
            (route) => false,
          );
        } else {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (_) => const StudentDashboard()),
            (route) => false,
          );
        }
      } else {
        _handleFailure();
      }
    } catch (e) {
      _handleFailure();
    }
  }

  void _handleFailure() {
    setState(() {
      _scanning = false;
      _attempts -= 1;
      if (_attempts > 0) {
        _statusText = "Yuz mos kelmadi, qayta urining! ($_attempts ta urinish qoldi)";
      } else {
        _statusText = "Urinishlar tugadi. Administratorga murojaat qiling.";
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Biometrik tasdiqlash", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            children: [
              Text(
                widget.fullName,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textDark),
              ),
              const SizedBox(height: 6),
              const Text(
                "3x4 etalon rasm va jonli liveness solishtiruvi",
                style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
              ),
              const Spacer(),

              // Oval Camera Frame
              Center(
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Outer Glow
                    Container(
                      width: 240,
                      height: 310,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(130),
                        border: Border.all(
                          color: _verified
                              ? AppTheme.success
                              : (_scanning ? AppTheme.primary : Colors.grey.shade300),
                          width: 4,
                        ),
                        color: Colors.white,
                        boxShadow: [
                          BoxShadow(
                            color: (_verified ? AppTheme.success : AppTheme.primary).withOpacity(0.12),
                            blurRadius: 24,
                            spreadRadius: 6,
                          )
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(130),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            // Camera preview mock (Face outline)
                            Center(
                              child: Icon(
                                Icons.face_rounded,
                                size: 140,
                                color: _verified ? AppTheme.success.withOpacity(0.4) : Colors.grey.shade300,
                              ),
                            ),
                            // Scanning laser line
                            if (_scanning && !_verified)
                              AnimatedBuilder(
                                animation: _animController,
                                builder: (context, child) {
                                  return Positioned(
                                    top: 40 + (_animController.value * 220),
                                    left: 20,
                                    right: 20,
                                    child: Container(
                                      height: 3,
                                      decoration: BoxDecoration(
                                        color: AppTheme.primary,
                                        boxShadow: [
                                          BoxShadow(
                                            color: AppTheme.primary.withOpacity(0.8),
                                            blurRadius: 8,
                                            spreadRadius: 2,
                                          )
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                            if (_verified)
                              const Center(
                                child: Icon(Icons.check_circle_rounded, size: 84, color: AppTheme.success),
                              )
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 30),
              Text(
                _statusText,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: _verified ? AppTheme.success : AppTheme.textDark,
                  height: 1.4,
                ),
              ),
              const Spacer(),

              if (!_verified)
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _attempts > 0 && !_scanning ? _startVerification : null,
                    child: _scanning
                        ? const Text("Tekshirilmoqda...")
                        : const Text("Face ID skanerni boshlash"),
                  ),
                ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
