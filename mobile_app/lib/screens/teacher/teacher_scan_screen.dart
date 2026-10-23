import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../services/api_service.dart';
import '../../theme.dart';
import 'teacher_grade_screen.dart';

class TeacherScanScreen extends StatefulWidget {
  final int lessonId;

  const TeacherScanScreen({super.key, required this.lessonId});

  @override
  State<TeacherScanScreen> createState() => _TeacherScanScreenState();
}

class _TeacherScanScreenState extends State<TeacherScanScreen> {
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
  );
  final TextEditingController _manualTokenController = TextEditingController();

  bool _loading = true;
  bool _isProcessing = false;
  Map<String, dynamic>? _summary;
  String? _lastScannedMessage;
  final Set<String> _recentlyScannedTokens = {};

  @override
  void initState() {
    super.initState();
    _fetchSummary();
  }

  @override
  void dispose() {
    _scannerController.dispose();
    _manualTokenController.dispose();
    super.dispose();
  }

  void _fetchSummary() async {
    try {
      final res = await ApiService.getTeacherLiveLesson(widget.lessonId);
      if (mounted) {
        setState(() {
          _summary = res;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _onDetect(BarcodeCapture capture) {
    if (_isProcessing) return;
    final barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      final code = barcode.rawValue?.trim();
      if (code != null && code.isNotEmpty) {
        if (_recentlyScannedTokens.contains(code)) continue;
        _recentlyScannedTokens.add(code);
        Timer(const Duration(seconds: 3), () {
          if (mounted) _recentlyScannedTokens.remove(code);
        });
        _scanCode(code);
        break;
      }
    }
  }

  Future<void> _scanCode(String token) async {
    if (token.isEmpty) return;
    setState(() => _isProcessing = true);
    try {
      final res = await ApiService.scanAttendance(lessonId: widget.lessonId, qrToken: token);
      if (res['status'] == 'success') {
        HapticFeedback.mediumImpact();
        if (mounted) {
          setState(() {
            _lastScannedMessage = res['message'];
          });
          _manualTokenController.clear();
          _fetchSummary();

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.check_circle_rounded, color: Colors.white),
                  const SizedBox(width: 8),
                  Expanded(child: Text(res['message'] ?? 'Davomat qayd etildi!')),
                ],
              ),
              backgroundColor: AppTheme.success,
              duration: const Duration(seconds: 2),
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(res['detail'] ?? "Xatolik!"), backgroundColor: Colors.red),
          );
        }
      }
    } catch (_) {
      //
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  Future<void> _markManually(int studentId, String name) async {
    try {
      final res = await ApiService.scanAttendance(lessonId: widget.lessonId, studentId: studentId);
      if (res['status'] == 'success') {
        HapticFeedback.lightImpact();
        _fetchSummary();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("$name qo'lda keldi deb belgilandi ✅"), backgroundColor: AppTheme.success),
          );
        }
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final total = _summary?['total_students'] ?? 0;
    final present = _summary?['present_count'] ?? 0;
    final absent = _summary?['absent_count'] ?? 0;
    final students = (_summary?['students'] as List<dynamic>?) ?? [];
    final lesson = _summary?['lesson'] ?? {};

    return Scaffold(
      appBar: AppBar(
        title: Text(
          "${lesson['subject_name'] ?? 'Fan'} (${lesson['class_name'] ?? ''})",
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        backgroundColor: Colors.white,
        foregroundColor: AppTheme.textDark,
        elevation: 0,
        actions: [
          IconButton(onPressed: _fetchSummary, icon: const Icon(Icons.refresh_rounded)),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Yuqori panel: Dars hisoblagichi (Jami, Keldi, Kelmadi)
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildCounterItem("Jami", "$total", Colors.blue),
                  Container(height: 36, width: 1, color: Colors.grey.shade200),
                  _buildCounterItem("Keldi", "$present", AppTheme.success),
                  Container(height: 36, width: 1, color: Colors.grey.shade200),
                  _buildCounterItem("Kelmadi", "$absent", Colors.redAccent),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // 2. Kamera QR Davomat Skaneri (MobileScanner)
            Container(
              height: 270,
              decoration: BoxDecoration(
                color: const Color(0xFF1E2022),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppTheme.primary, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withValues(alpha: 0.15),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  MobileScanner(
                    controller: _scannerController,
                    onDetect: _onDetect,
                  ),
                  // Ramka
                  Container(
                    width: 190,
                    height: 190,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.85), width: 2.5),
                    ),
                  ),
                  // Chiroq va Kamera almashtirish tugmalari
                  Positioned(
                    top: 10,
                    right: 10,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(30),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.flash_on_rounded, color: Colors.white, size: 20),
                            onPressed: () => _scannerController.toggleTorch(),
                          ),
                          IconButton(
                            icon: const Icon(Icons.flip_camera_ios_rounded, color: Colors.white, size: 20),
                            onPressed: () => _scannerController.switchCamera(),
                          ),
                        ],
                      ),
                    ),
                  ),
                  // Pastki yordam yozuvi
                  Positioned(
                    bottom: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.65),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.qr_code_scanner_rounded, color: Colors.white70, size: 14),
                          SizedBox(width: 6),
                          Text(
                            "O'quvchi QR kodini kameraga tuting",
                            style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // 3. Qo'lda kod kiritish (Zaxira usul)
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _manualTokenController,
                    style: const TextStyle(fontSize: 13),
                    decoration: InputDecoration(
                      hintText: "Skaner kodi yoki token...",
                      hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    backgroundColor: AppTheme.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () => _scanCode(_manualTokenController.text.trim()),
                  child: const Text("Kiritish", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // 4. Oxirgi skanerlangan xabar
            if (_lastScannedMessage != null)
              Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.green.shade300),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_rounded, color: Colors.green, size: 22),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _lastScannedMessage!,
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green, fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),

            // 5. Sinf o'quvchilari ro'yxati va qo'lda belgilash
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Sinf o'quvchilari", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
                Text("$total ta o'quvchi", style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
              ],
            ),
            const SizedBox(height: 10),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: students.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (ctx, i) {
                final s = students[i];
                final isPresent = s['is_present'] == true;
                final studentId = s['id'] as int? ?? 0;
                final studentName = (s['name'] ?? '').toString();

                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: isPresent ? Colors.green.shade200 : Colors.grey.shade200),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: isPresent ? AppTheme.primaryLight : Colors.grey.shade100,
                        child: Icon(
                          isPresent ? Icons.check_rounded : Icons.person_outline_rounded,
                          size: 18,
                          color: isPresent ? AppTheme.primary : AppTheme.textMuted,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(studentName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            Text(s['passport_series'] ?? '', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                          ],
                        ),
                      ),
                      if (isPresent)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8)),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.check_circle_rounded, size: 14, color: Colors.green),
                              SizedBox(width: 4),
                              Text("Keldi ✅", style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12)),
                            ],
                          ),
                        )
                      else
                        InkWell(
                          onTap: () => _markManually(studentId, studentName),
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.red.shade50,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.red.shade200),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.touch_app_rounded, size: 13, color: Colors.redAccent),
                                SizedBox(width: 4),
                                Text("Qo'lda belgilash", style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 24),

            // 6. Davomatni yakunlash va darsni boshlash tugmasi
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: () async {
                await ApiService.finishAttendance(widget.lessonId);
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text("Davomat yakunlandi! Dars jarayoni boshlandi ✅"),
                    backgroundColor: AppTheme.success,
                  ),
                );
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => TeacherGradeScreen(lessonId: widget.lessonId)),
                );
              },
              icon: const Icon(Icons.check_circle_outline_rounded, size: 22, color: Colors.white),
              label: const Text(
                "Davomatni Yakunlash & Darsni Boshlash ➔",
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildCounterItem(String title, String count, Color color) {
    return Column(
      children: [
        Text(count, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color)),
        const SizedBox(height: 2),
        Text(title, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
      ],
    );
  }
}
