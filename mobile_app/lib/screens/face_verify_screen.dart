import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import '../services/api_service.dart';
import '../theme.dart';
import 'student/student_dashboard.dart';
import 'teacher/teacher_dashboard.dart';

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
  late AnimationController _animController;
  CameraController? _cameraController;
  bool _isCameraInitialized = false;
  String? _cameraError;

  int _attempts = 3;
  bool _scanning = false;
  String _statusText = "Yuzingizni kameraga to'g'ri tuting...\nOval ramka ichiga joylashtiring";
  bool _verified = false;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _initCamera();
  }

  Future<void> _initCamera() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        setState(() {
          _cameraError = "Kamera topilmadi";
        });
        return;
      }

      // Old kamera (Front camera) ni qidiramiz
      CameraDescription selectedCamera = cameras.first;
      for (final cam in cameras) {
        if (cam.lensDirection == CameraLensDirection.front) {
          selectedCamera = cam;
          break;
        }
      }

      _cameraController = CameraController(
        selectedCamera,
        ResolutionPreset.medium,
        enableAudio: false,
      );

      await _cameraController!.initialize();
      if (!mounted) return;
      setState(() {
        _isCameraInitialized = true;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _cameraError = "Kameraga ulanishda xatolik: $e";
      });
    }
  }

  @override
  void dispose() {
    _animController.dispose();
    _cameraController?.dispose();
    super.dispose();
  }

  Future<void> _captureAndVerify({bool simulateWrongFace = false}) async {
    if (_scanning || _attempts <= 0) return;

    setState(() {
      _scanning = true;
      _statusText = "Surat olinmoqda va tekshirilmoqda...\nBazadagi 3x4 rasm bilan solishtirilmoqda";
    });

    String? base64Image;

    try {
      if (simulateWrongFace) {
        base64Image = "wrong_face_data_test_security";
      } else if (_cameraController != null && _cameraController!.value.isInitialized) {
        final XFile file = await _cameraController!.takePicture();
        final bytes = await file.readAsBytes();
        base64Image = base64Encode(bytes);
      }
    } catch (e) {
      // Agar rasm olishda xatolik bo'lsa
      debugPrint("Kameradan surat olishda xatolik: $e");
    }

    try {
      final res = await ApiService.verifyFaceId(
        widget.userId,
        !simulateWrongFace,
        faceImageB64: base64Image,
      );

      if (res['access'] != null) {
        setState(() {
          _verified = true;
          _statusText = "Face ID muvaffaqiyatli tasdiqlandi! ✅\nXavfsiz sessiya yaratildi";
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
        _handleFailure(res['detail']);
      }
    } catch (e) {
      _handleFailure(null);
    }
  }

  void _handleFailure(String? message) {
    setState(() {
      _scanning = false;
      _attempts -= 1;
      if (_attempts > 0) {
        _statusText = message ?? "Yuz mos kelmadi! Begona shaxs aniqlandi ($_attempts ta urinish qoldi)";
      } else {
        _statusText = "⛔ Xavfsizlik: Barcha urinishlar tugadi. Kabinetga kirish bloklandi!";
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
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            children: [
              Text(
                widget.fullName,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textDark),
              ),
              const SizedBox(height: 6),
              const Text(
                "Haqiqiy kamera orqali 3x4 rasm bilan solishtirish",
                style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
              ),
              const Spacer(),

              // Oval Camera Frame
              Center(
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Outer Glow & Oval Border
                    Container(
                      width: 250,
                      height: 330,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(130),
                        border: Border.all(
                          color: _verified
                              ? AppTheme.success
                              : (_scanning ? AppTheme.primary : Colors.grey.shade300),
                          width: 4,
                        ),
                        color: Colors.black,
                        boxShadow: [
                          BoxShadow(
                            color: (_verified ? AppTheme.success : AppTheme.primary).withOpacity(0.15),
                            blurRadius: 24,
                            spreadRadius: 6,
                          )
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(126),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            // Haqiqiy Jonli Kamera Tasviri
                            if (_isCameraInitialized && _cameraController != null)
                              FittedBox(
                                fit: BoxFit.cover,
                                child: SizedBox(
                                  width: _cameraController!.value.previewSize?.height ?? 300,
                                  height: _cameraController!.value.previewSize?.width ?? 400,
                                  child: CameraPreview(_cameraController!),
                                ),
                              )
                            else if (_cameraError != null)
                              Center(
                                child: Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Text(
                                    _cameraError!,
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                                  ),
                                ),
                              )
                            else
                              const Center(
                                child: CircularProgressIndicator(color: AppTheme.primary),
                              ),

                            // Scanning laser line
                            if (_scanning && !_verified)
                              AnimatedBuilder(
                                animation: _animController,
                                builder: (context, child) {
                                  return Positioned(
                                    top: 40 + (_animController.value * 240),
                                    left: 20,
                                    right: 20,
                                    child: Container(
                                      height: 3,
                                      decoration: BoxDecoration(
                                        color: AppTheme.primary,
                                        boxShadow: [
                                          BoxShadow(
                                            color: AppTheme.primary.withOpacity(0.9),
                                            blurRadius: 8,
                                            spreadRadius: 2,
                                          )
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),

                            // Muvaffaqiyatli tasdiqlanganda
                            if (_verified)
                              Container(
                                color: Colors.black45,
                                child: const Center(
                                  child: Icon(Icons.check_circle_rounded, size: 88, color: AppTheme.success),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
              Text(
                _statusText,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: _verified ? AppTheme.success : AppTheme.textDark,
                  height: 1.4,
                ),
              ),
              const Spacer(),

              if (!_verified) ...[
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.camera_alt_rounded, size: 20),
                    onPressed: _attempts > 0 && !_scanning ? () => _captureAndVerify(simulateWrongFace: false) : null,
                    label: _scanning
                        ? const Text("Solishtirilmoqda...")
                        : const Text("Face ID orqali tasdiqlash"),
                  ),
                ),
                const SizedBox(height: 10),
                // Xavfsizlik testi (Begona yuzni sinab ko'rish)
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red.shade700,
                      side: BorderSide(color: Colors.red.shade300),
                    ),
                    icon: const Icon(Icons.security_rounded, size: 18),
                    onPressed: _attempts > 0 && !_scanning ? () => _captureAndVerify(simulateWrongFace: true) : null,
                    label: const Text("Begona yuzni sinash (Xavfsizlik tekshiruvi)"),
                  ),
                ),
              ],
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
