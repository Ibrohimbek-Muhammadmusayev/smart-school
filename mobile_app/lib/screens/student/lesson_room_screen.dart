import 'dart:async';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../services/api_service.dart';
import '../../theme.dart';

class LessonRoomScreen extends StatefulWidget {
  final int lessonId;

  const LessonRoomScreen({super.key, required this.lessonId});

  @override
  State<LessonRoomScreen> createState() => _LessonRoomScreenState();
}

class _LessonRoomScreenState extends State<LessonRoomScreen> {
  bool _loading = true;
  bool _isAttended = false;
  Map<String, dynamic>? _lesson;
  Map<String, dynamic>? _grade;

  // Dinamik QR holati
  String? _qrToken;
  int _secondsLeft = 15;
  Timer? _qrTimer;
  Timer? _refreshPollTimer;

  final _homeworkController = TextEditingController();
  bool _submittingHomework = false;
  String? _homeworkSuccessMessage;

  @override
  void initState() {
    super.initState();
    _loadLessonRoom();
  }

  @override
  void dispose() {
    _qrTimer?.cancel();
    _refreshPollTimer?.cancel();
    _homeworkController.dispose();
    super.dispose();
  }

  void _loadLessonRoom() async {
    try {
      final res = await ApiService.getLessonRoom(widget.lessonId);
      setState(() {
        _lesson = res['lesson'];
        _isAttended = res['is_attended'] ?? false;
        _grade = res['grade'];
        _loading = false;
      });

      if (!_isAttended) {
        _startDynamicQR();
        // Ustoz skaner qilganini tekshirish uchun foniy polling
        _refreshPollTimer?.cancel();
        _refreshPollTimer = Timer.periodic(const Duration(seconds: 4), (_) async {
          final check = await ApiService.getLessonRoom(widget.lessonId);
          if (check['is_attended'] == true && mounted) {
            _refreshPollTimer?.cancel();
            _qrTimer?.cancel();
            setState(() {
              _isAttended = true;
              _grade = check['grade'];
            });
          }
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _startDynamicQR() async {
    _fetchNewQRToken();
    _qrTimer?.cancel();
    _qrTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_secondsLeft > 1) {
        setState(() => _secondsLeft--);
      } else {
        _fetchNewQRToken();
      }
    });
  }

  void _fetchNewQRToken() async {
    try {
      final res = await ApiService.generateDynamicQR();
      if (mounted) {
        setState(() {
          _qrToken = res['qr_token'];
          _secondsLeft = (res['expires_in_seconds'] as num?)?.toInt() ?? 15;
        });
      }
    } catch (_) {}
  }

  void _submitHomework() async {
    if (_homeworkController.text.trim().isEmpty) return;
    setState(() => _submittingHomework = true);

    try {
      final res = await ApiService.submitHomework(widget.lessonId, _homeworkController.text.trim());
      setState(() {
        _homeworkSuccessMessage = res['message'] ?? "Vazifa yuborildi!";
        _homeworkController.clear();
      });
    } catch (_) {
      //
    } finally {
      if (mounted) setState(() => _submittingHomework = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final subjectName = _lesson?['subject_name'] ?? 'Dars';
    final topic = _lesson?['topic'] ?? 'Mavzu';

    return Scaffold(
      appBar: AppBar(
        title: Text(subjectName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppTheme.textDark,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _isAttended ? AppTheme.success.withOpacity(0.1) : Colors.orange.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _isAttended ? AppTheme.success.withOpacity(0.3) : Colors.orange.shade200,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    _isAttended ? Icons.check_circle_rounded : Icons.lock_clock_rounded,
                    color: _isAttended ? AppTheme.success : Colors.orange.shade800,
                    size: 28,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isAttended ? "Davomat tasdiqlandi ✅" : "Qulflangan rejim",
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: _isAttended ? AppTheme.success : Colors.orange.shade900,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _isAttended
                              ? "Barcha dars materiallari va topshiriqlar ochiq."
                              : "Ustozingizga QR kodni ko'rsating. Skanerdan so'ng dars ochiladi.",
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 1-HOLAT: QULFLANGAN REJIM (Dinamik QR-kod kartasi)
            if (!_isAttended) ...[
              _buildLockedQRSection(),
            ] else ...[
              // 2-HOLAT: OCHILGAN REJIM
              _buildUnlockedLessonSection(topic),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildLockedQRSection() {
    final passport = ApiService.currentUser?['passport_series'] ?? 'AA 1234567';

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 16, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        children: [
          const Text(
            "Dinamik Davomat QR Kodi",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textDark),
          ),
          const SizedBox(height: 4),
          const Text(
            "Xavfsizlik uchun har 20 soniyada avtomatik yangilanadi",
            textAlign: TextAlign.center,
            style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
          ),
          const SizedBox(height: 20),

          // QR Code Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.primaryLight, width: 3),
            ),
            child: _qrToken != null
                ? QrImageView(
                    data: _qrToken!,
                    version: QrVersions.auto,
                    size: 210.0,
                    eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: AppTheme.primary),
                    dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.circle, color: AppTheme.textDark),
                  )
                : const SizedBox(height: 210, width: 210, child: Center(child: CircularProgressIndicator())),
          ),
          const SizedBox(height: 16),

          // Timer progress bar
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.timer_outlined, size: 16, color: AppTheme.primary),
              const SizedBox(width: 6),
              Text(
                "Yangilanishiga: $_secondsLeft soniya",
                style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary, fontSize: 14),
              ),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: _secondsLeft / 20.0,
            backgroundColor: Colors.grey.shade200,
            color: AppTheme.primary,
            borderRadius: BorderRadius.circular(10),
            minHeight: 6,
          ),
          const SizedBox(height: 16),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF7F8FA),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              "Passport: $passport",
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textDark),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUnlockedLessonSection(String topic) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Baho bo'limi (Agar qo'yilgan bo'lsa)
        if (_grade != null)
          Container(
            margin: const EdgeInsets.only(bottom: 20),
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF6C5CE7), Color(0xFFA29BFE)]),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                  child: Center(
                    child: Text(
                      "${_grade!['score']}",
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF6C5CE7)),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Ustoz Bahosi qo'yildi", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: 2),
                      Text("Izoh: ${_grade!['comment'] ?? 'Faol ishtirok uchun'}", style: const TextStyle(color: Colors.white70, fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
          ),

        // Dars mavzusi va materiallari
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10)],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Dars Mavzusi:", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.textMuted)),
              const SizedBox(height: 4),
              Text(topic, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: AppTheme.textDark)),
              const SizedBox(height: 16),
              const Text("O'quv materiallari:", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 10),
              _buildMaterialItem(Icons.picture_as_pdf_rounded, "Mavzu taqdimoti (PDF Slaydlar)", "2.4 MB", Colors.red),
              const SizedBox(height: 8),
              _buildMaterialItem(Icons.menu_book_rounded, "Elektron darslik 4-bob", "1.1 MB", Colors.blue),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Uyga vazifa topshirish bloki
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10)],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.assignment_turned_in_rounded, color: AppTheme.primary, size: 22),
                  SizedBox(width: 8),
                  Text("Uyga vazifa topshirish", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                _lesson?['homework_description']?.isNotEmpty == true
                    ? _lesson!['homework_description']
                    : "Uyga berilgan mashqlarni bajaring va yechimini yuboring.",
                style: const TextStyle(fontSize: 13, color: AppTheme.textMuted),
              ),
              const SizedBox(height: 16),

              if (_homeworkSuccessMessage != null)
                Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(10)),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle, color: Colors.green, size: 18),
                      const SizedBox(width: 8),
                      Expanded(child: Text(_homeworkSuccessMessage!, style: const TextStyle(color: Colors.green, fontSize: 13))),
                    ],
                  ),
                ),

              TextField(
                controller: _homeworkController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: "Vazifa yechimi yoki izoh yozing...",
                  filled: true,
                  fillColor: const Color(0xFFF9F9FB),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey.shade200)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey.shade200)),
                ),
              ),
              const SizedBox(height: 14),

              ElevatedButton.icon(
                onPressed: _submittingHomework ? null : _submitHomework,
                icon: const Icon(Icons.send_rounded, size: 18),
                label: _submittingHomework ? const Text("Yuborilmoqda...") : const Text("Vazifani yuborish"),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMaterialItem(IconData icon, String title, String size, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF9F9FB),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                Text(size, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
              ],
            ),
          ),
          const Icon(Icons.download_rounded, color: AppTheme.primary, size: 22),
        ],
      ),
    );
  }
}

