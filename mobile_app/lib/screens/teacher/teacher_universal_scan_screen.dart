import 'dart:async';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../services/api_service.dart';
import '../../theme.dart';
import '../../features/board/board_control_screen.dart';

class TeacherUniversalScanScreen extends StatefulWidget {
  final int? lessonId;

  const TeacherUniversalScanScreen({super.key, this.lessonId});

  @override
  State<TeacherUniversalScanScreen> createState() => _TeacherUniversalScanScreenState();
}

class _TeacherUniversalScanScreenState extends State<TeacherUniversalScanScreen> {
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
  );
  final TextEditingController _manualInputController = TextEditingController();

  bool _isProcessing = false;
  bool _batchMode = true; // Ketma-ket uzluksiz skanerlash
  String? _statusBanner;
  Color _bannerColor = AppTheme.success;
  final List<Map<String, dynamic>> _scanHistory = [];
  final Set<String> _recentlyScannedTokens = {};

  @override
  void dispose() {
    _scannerController.dispose();
    _manualInputController.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    if (_isProcessing) return;
    final barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      final code = barcode.rawValue?.trim();
      if (code != null && code.isNotEmpty) {
        if (_recentlyScannedTokens.contains(code)) continue;
        _processScannedCode(code);
        break;
      }
    }
  }

  Future<void> _processScannedCode(String rawCode) async {
    setState(() {
      _isProcessing = true;
    });

    _recentlyScannedTokens.add(rawCode);
    // 3 soniyadan keyin qayta skanerlashga ruxsat
    Timer(const Duration(seconds: 3), () {
      if (mounted) _recentlyScannedTokens.remove(rawCode);
    });

    final nowStr = "${DateTime.now().hour.toString().padLeft(2, '0')}:${DateTime.now().minute.toString().padLeft(2, '0')}";

    // 1. Agar Aqlli Doska QR kodi bo'lsa (shooldex / device_token / token=...)
    final isBoardCode = rawCode.contains('device_token') ||
        rawCode.contains('shooldex') ||
        rawCode.contains('token=') ||
        rawCode.startsWith('BOARD:');

    if (isBoardCode) {
      try {
        final res = await ApiService.connectToBoard(rawCode);
        if (!mounted) return;

        if (res['session_id'] != null) {
          final deviceName = (res['device_name'] ?? 'Smart Board').toString();
          setState(() {
            _statusBanner = "🟢 Aqlli doska ulandi: $deviceName ($nowStr)";
            _bannerColor = AppTheme.success;
            _scanHistory.insert(0, {
              "type": "board",
              "title": deviceName,
              "detail": "Aqlli doska sessiyasi faollashtirildi",
              "time": "$nowStr ✅",
              "isSuccess": true,
            });
            _isProcessing = false;
          });

          if (!_batchMode) {
            // Batch mode bo'lmasa to'g'ridan-to'g'ri doska pultiga o'tadi
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (_) => BoardControlScreen(
                  sessionId: res['session_id'] as int,
                  deviceToken: (res['device_token'] ?? rawCode).toString(),
                  teacherName: (res['teacher_name'] ?? ApiService.currentUser?['full_name'] ?? 'Ustoz').toString(),
                  deviceName: deviceName,
                  geminiApiKey: (res['gemini_api_key'] ?? '').toString(),
                  initialCanvases: (res['saved_canvases'] as List<dynamic>?) ?? [],
                ),
              ),
            );
          }
          return;
        } else {
          setState(() {
            _statusBanner = "Doska ulanishida xatolik: ${res['detail'] ?? 'Noma\'lum xato'}";
            _bannerColor = Colors.redAccent;
            _isProcessing = false;
          });
          return;
        }
      } catch (e) {
        if (!mounted) return;
        setState(() {
          _statusBanner = "Doskaga ulanishda xatolik: $e";
          _bannerColor = Colors.redAccent;
          _isProcessing = false;
        });
        return;
      }
    }

    // 2. Agar O'quvchi QR kodi bo'lsa -> Davomatga yozadi
    try {
      final lessonId = widget.lessonId ?? 101;
      final res = await ApiService.scanAttendance(lessonId: lessonId, qrToken: rawCode);
      if (!mounted) return;

      if (res['status'] == 'success') {
        final studentName = res['student_name'] ?? res['name'] ?? 'O\'quvchi';
        setState(() {
          _statusBanner = "$studentName davomatga yozildi ($nowStr ✅)";
          _bannerColor = AppTheme.success;
          _scanHistory.insert(0, {
            "type": "student",
            "title": studentName,
            "detail": "Davomat belgilandi: $nowStr",
            "time": "$nowStr ✅",
            "isSuccess": true,
          });
          _isProcessing = false;
        });
      } else {
        setState(() {
          _statusBanner = res['detail'] ?? res['message'] ?? "Davomat qayd etilmadi";
          _bannerColor = Colors.orangeAccent;
          _scanHistory.insert(0, {
            "type": "student",
            "title": "Noma'lum o'quvchi",
            "detail": res['detail'] ?? "Qayd etilmadi",
            "time": nowStr,
            "isSuccess": false,
          });
          _isProcessing = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _statusBanner = "Skanerlash xatosi: $e";
        _bannerColor = Colors.redAccent;
        _isProcessing = false;
      });
    }
  }

  void _submitManual() {
    final text = _manualInputController.text.trim();
    if (text.isEmpty) return;
    _manualInputController.clear();
    _processScannedCode(text);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text(
          "Universal QR Skaner",
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: Colors.white),
        ),
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            tooltip: "Chiroqni yoqish / o'chirish",
            icon: const Icon(Icons.flash_on_rounded, color: Colors.white),
            onPressed: () => _scannerController.toggleTorch(),
          ),
          IconButton(
            tooltip: "Kamerani almashtirish",
            icon: const Icon(Icons.flip_camera_ios_rounded, color: Colors.white),
            onPressed: () => _scannerController.switchCamera(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Rejim tanlash (Batch / Ketma-ket)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: const Color(0xFF1E293B),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      _batchMode ? Icons.repeat_rounded : Icons.filter_1_rounded,
                      color: AppTheme.primary,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _batchMode ? "Ketma-ket (Batch) skanerlash rejimi" : "Yagona skanerlash",
                      style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                Switch.adaptive(
                  value: _batchMode,
                  activeTrackColor: AppTheme.primary,
                  onChanged: (val) => setState(() => _batchMode = val),
                ),
              ],
            ),
          ),

          // Kamera va nishon maydoni
          Expanded(
            flex: 5,
            child: Stack(
              alignment: Alignment.center,
              children: [
                MobileScanner(
                  controller: _scannerController,
                  onDetect: _onDetect,
                ),
                // Nishon ramkasi
                Container(
                  width: 250,
                  height: 250,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: AppTheme.primary, width: 3),
                  ),
                ),
                // Yo'riqnoma matni
                Positioned(
                  bottom: 16,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.65),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      "O'quvchi QR yoki Doska QR kodini tuting",
                      style: TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w500),
                    ),
                  ),
                ),
                if (_isProcessing)
                  Container(
                    color: Colors.black45,
                    child: const Center(
                      child: CircularProgressIndicator(color: Colors.white),
                    ),
                  ),
              ],
            ),
          ),

          // Holat xabarnomasi banneri
          if (_statusBanner != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: _bannerColor,
              child: Text(
                _statusBanner!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ),

          // Pastki qism: Qo'lda kiritish va skanerlanganlar tarixi
          Expanded(
            flex: 4,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Qo'lda kiritish qatori
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _manualInputController,
                          style: const TextStyle(fontSize: 13.5),
                          decoration: InputDecoration(
                            hintText: "O'quvchi ID yoki doska PIN...",
                            hintStyle: const TextStyle(fontSize: 12.5, color: AppTheme.textMuted),
                            filled: true,
                            fillColor: const Color(0xFFF1F5F9),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide.none,
                            ),
                          ),
                          onSubmitted: (_) => _submitManual(),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        onPressed: _submitManual,
                        child: const Text("Kiritish", style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "Skanerlash Jurnali (Jonli)",
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: AppTheme.textDark),
                      ),
                      Text(
                        "${_scanHistory.length} ta qayd",
                        style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  Expanded(
                    child: _scanHistory.isEmpty
                        ? const Center(
                            child: Text(
                              "Hozircha hech qanday kod skanerlanmadi",
                              style: TextStyle(color: AppTheme.textMuted, fontSize: 12.5),
                            ),
                          )
                        : ListView.separated(
                            itemCount: _scanHistory.length,
                            separatorBuilder: (_, index) => const SizedBox(height: 6),
                            itemBuilder: (ctx, i) {
                              final item = _scanHistory[i];
                              final isBoard = item['type'] == 'board';
                              final isSuccess = item['isSuccess'] == true;

                              return Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF8FAFC),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: isSuccess ? Colors.green.shade200 : Colors.red.shade200,
                                    width: 1,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      isBoard ? Icons.tv_rounded : Icons.person_rounded,
                                      size: 18,
                                      color: isBoard ? AppTheme.primary : AppTheme.success,
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            item['title'] ?? '',
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                          ),
                                          Text(
                                            item['detail'] ?? '',
                                            style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Text(
                                      item['time'] ?? '',
                                      style: TextStyle(
                                        fontSize: 11.5,
                                        fontWeight: FontWeight.bold,
                                        color: isSuccess ? Colors.green : Colors.red,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
