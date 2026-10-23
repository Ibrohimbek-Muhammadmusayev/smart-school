import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import '../services/api_service.dart';
import '../theme.dart';
import 'student/student_dashboard.dart';
import 'teacher/teacher_dashboard.dart';
import 'checkpoint/guard_checkpoint_screen.dart';

class FaceVerifyScreen extends StatefulWidget {
  final int userId;
  final String fullName;
  final String role;
  final String? photoUrl;
  final bool hasRegisteredPhoto;

  const FaceVerifyScreen({
    super.key,
    required this.userId,
    required this.fullName,
    required this.role,
    this.photoUrl,
    this.hasRegisteredPhoto = false,
  });

  @override
  State<FaceVerifyScreen> createState() => _FaceVerifyScreenState();
}

class _FaceVerifyScreenState extends State<FaceVerifyScreen> with SingleTickerProviderStateMixin {
  CameraController? _cameraController;
  bool _isCameraInitialized = false;
  String? _cameraError;

  bool _isVerifying = false;
  bool _verified = false;
  String _hintText = "Yuzingizni doira ichiga tuting";
  Color _rimColor = Colors.white;

  Timer? _autoCheckTimer;

  @override
  void initState() {
    super.initState();
    _initCamera();
  }

  Future<void> _initCamera() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        if (!mounted) return;
        setState(() => _cameraError = "Kamera topilmadi");
        return;
      }

      CameraDescription frontCam = cameras.first;
      for (final cam in cameras) {
        if (cam.lensDirection == CameraLensDirection.front) {
          frontCam = cam;
          break;
        }
      }

      _cameraController = CameraController(
        frontCam,
        ResolutionPreset.medium,
        enableAudio: false,
      );

      await _cameraController!.initialize();
      if (!mounted) return;
      setState(() => _isCameraInitialized = true);

      // Kamera ochilgach foydalanuvchi yuzini to'g'rilab olishi uchun 1.2 soniyadan so'ng avtomatik tekshiruv boshlanadi
      _scheduleAutoCapture(1200);
    } catch (e) {
      if (!mounted) return;
      setState(() => _cameraError = "Kameraga ulanishda xatolik: $e");
    }
  }

  void _scheduleAutoCapture(int delayMs) {
    _autoCheckTimer?.cancel();
    _autoCheckTimer = Timer(Duration(milliseconds: delayMs), () {
      if (mounted && !_isVerifying && !_verified) {
        _verifyFace();
      }
    });
  }

  Future<void> _verifyFace() async {
    if (_isVerifying || _verified) return;

    setState(() {
      _isVerifying = true;
      _hintText = "Tekshirilmoqda...";
      _rimColor = AppTheme.primary;
    });

    String? base64Image;
    try {
      if (_cameraController != null && _cameraController!.value.isInitialized) {
        final XFile file = await _cameraController!.takePicture();
        final bytes = await file.readAsBytes();
        base64Image = base64Encode(bytes);
      }
    } catch (e) {
      debugPrint("Kameradan surat olish xatosi: $e");
    }

    if (base64Image == null || base64Image.isEmpty) {
      _onFailed("Kameradan tasvir olinmadi");
      return;
    }

    try {
      final res = await ApiService.verifyFaceId(
        widget.userId,
        true,
        faceImageB64: base64Image,
      );

      if (res['access'] != null) {
        if (!mounted) return;
        setState(() {
          _verified = true;
          _isVerifying = false;
          _hintText = "Tasdiqlandi!";
          _rimColor = AppTheme.success;
        });

        await Future.delayed(const Duration(milliseconds: 700));
        if (!mounted) return;

        if (widget.role == 'TEACHER') {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (_) => const TeacherDashboard()),
            (route) => false,
          );
        } else if (widget.role == 'GUARD') {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (_) => const GuardCheckpointScreen()),
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
        _onFailed(res['detail']);
      }
    } catch (e) {
      _onFailed(null);
    }
  }

  void _onFailed(String? message) {
    if (!mounted) return;
    bool shouldRetry = true;
    setState(() {
      _isVerifying = false;
      if (message != null && (message.contains("Begona") || message.contains("mos kelmadi"))) {
        _rimColor = Colors.red.shade600;
        _hintText = "Begona shaxs aniqlandi!";
      } else if (message != null && message.contains("biriktirilmagan")) {
        _rimColor = Colors.red.shade600;
        _hintText = "Yuz rasmi biriktirilmagan!";
        shouldRetry = false;
      } else if (message != null && message.contains("Bazadagi")) {
        _rimColor = Colors.red.shade600;
        _hintText = "Bazadagi rasmda yuz yo'q!";
        shouldRetry = false;
      } else if (message != null && (message.contains("aniqlanmadi") || message.contains("yuzi"))) {
        _rimColor = Colors.orange.shade600;
        _hintText = "Kamerada inson yuzi ko'rinmadi";
      } else if (message != null && message.contains("Yorug'lik")) {
        _rimColor = Colors.orange.shade600;
        _hintText = "Yorug'roq joyga o'ting";
      } else {
        _rimColor = Colors.orange.shade600;
        _hintText = message ?? "Yuzingizni doira ichida tuting";
      }
    });

    // Avtomatik yana tekshirish (2.2 soniyadan keyin)
    if (shouldRetry) {
      _scheduleAutoCapture(2200);
    }
  }

  @override
  void dispose() {
    _autoCheckTimer?.cancel();
    _cameraController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final double ovalWidth = 260;
    final double ovalHeight = 350;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. To'liq ekran jonli kamera
          if (_isCameraInitialized && _cameraController != null)
            Center(
              child: CameraPreview(_cameraController!),
            )
          else if (_cameraError != null)
            Center(
              child: Text(
                _cameraError!,
                style: const TextStyle(color: Colors.white70),
              ),
            )
          else
            const Center(
              child: CircularProgressIndicator(color: AppTheme.primary),
            ),

          // 2. Qora yarim-shaffof niqob (Faqat yuz tutish joyi ochiq)
          CustomPaint(
            size: size,
            painter: _FaceMaskPainter(
              ovalWidth: ovalWidth,
              ovalHeight: ovalHeight,
              borderColor: _rimColor,
              borderWidth: _isVerifying ? 4.0 : 3.0,
            ),
          ),

          // 3. Yuqori qism: Orqaga qaytish va Ism
          SafeArea(
            child: Align(
              alignment: Alignment.topCenter,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                    Expanded(
                      child: Text(
                        widget.fullName,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          shadows: [Shadow(color: Colors.black87, blurRadius: 8)],
                        ),
                      ),
                    ),
                    const SizedBox(width: 48), // Balans uchun
                  ],
                ),
              ),
            ),
          ),

          // 4. Pastki qism: Faqat bitta ixcham ko'rsatma (Yuzingizni tuting / Tekshirilmoqda)
          Positioned(
            bottom: 60,
            left: 24,
            right: 24,
            child: Center(
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.65),
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(
                    color: _rimColor.withValues(alpha: 0.8),
                    width: 1.5,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (_isVerifying)
                      const Padding(
                        padding: EdgeInsets.only(right: 10),
                        child: SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        ),
                      )
                    else if (_verified)
                      const Padding(
                        padding: EdgeInsets.only(right: 8),
                        child: Icon(Icons.check_circle_rounded, color: AppTheme.success, size: 20),
                      ),
                    Text(
                      _hintText,
                      style: TextStyle(
                        color: _verified ? AppTheme.success : Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Yuzni ushlash uchun professional Apple Face ID uslubidagi oval teshik va qoraytirilgan fon
class _FaceMaskPainter extends CustomPainter {
  final double ovalWidth;
  final double ovalHeight;
  final Color borderColor;
  final double borderWidth;

  _FaceMaskPainter({
    required this.ovalWidth,
    required this.ovalHeight,
    required this.borderColor,
    required this.borderWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2 - 20);
    final ovalRect = Rect.fromCenter(center: center, width: ovalWidth, height: ovalHeight);

    // Qora fon (yarim shaffof)
    final backgroundPath = Path()..addRect(Rect.fromLTWH(0, 0, size.width, size.height));
    final ovalPath = Path()..addRRect(RRect.fromRectAndRadius(ovalRect, Radius.circular(ovalWidth / 2)));

    // Oval qismini qirqib olish (kamera ochiq ko'rinishi uchun)
    final maskPath = Path.combine(PathOperation.difference, backgroundPath, ovalPath);

    final maskPaint = Paint()
      ..color = Colors.black.withValues(alpha: 0.60)
      ..style = PaintingStyle.fill;
    canvas.drawPath(maskPath, maskPaint);

    // Oval chetiga yuzni to'g'ri tutish ramkasi
    final borderPaint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = borderWidth;
    canvas.drawRRect(RRect.fromRectAndRadius(ovalRect, Radius.circular(ovalWidth / 2)), borderPaint);

    // To'rt burchakda yordamchi markazlash burchaklari (Guide brackets)
    final bracketPaint = Paint()
      ..color = borderColor.withValues(alpha: 0.9)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round;

    // Yuqori markaz
    canvas.drawLine(Offset(center.dx - 15, ovalRect.top + 6), Offset(center.dx + 15, ovalRect.top + 6), bracketPaint);
    // Pastki markaz
    canvas.drawLine(Offset(center.dx - 15, ovalRect.bottom - 6), Offset(center.dx + 15, ovalRect.bottom - 6), bracketPaint);
    // Chap markaz
    canvas.drawLine(Offset(ovalRect.left + 6, center.dy - 15), Offset(ovalRect.left + 6, center.dy + 15), bracketPaint);
    // O'ng markaz
    canvas.drawLine(Offset(ovalRect.right - 6, center.dy - 15), Offset(ovalRect.right - 6, center.dy + 15), bracketPaint);
  }

  @override
  bool shouldRepaint(covariant _FaceMaskPainter oldDelegate) {
    return oldDelegate.borderColor != borderColor || oldDelegate.borderWidth != borderWidth;
  }
}
