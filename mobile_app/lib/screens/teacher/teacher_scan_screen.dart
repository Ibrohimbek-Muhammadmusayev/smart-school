import 'package:flutter/material.dart';
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
  bool _loading = true;
  Map<String, dynamic>? _summary;
  final _manualTokenController = TextEditingController();
  String? _lastScannedMessage;

  @override
  void initState() {
    super.initState();
    _fetchSummary();
  }

  void _fetchSummary() async {
    try {
      final res = await ApiService.getTeacherLiveLesson(widget.lessonId);
      setState(() {
        _summary = res;
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _scanCode(String token) async {
    if (token.isEmpty) return;
    try {
      final res = await ApiService.scanAttendance(lessonId: widget.lessonId, qrToken: token);
      if (res['status'] == 'success') {
        setState(() {
          _lastScannedMessage = res['message'];
        });
        _manualTokenController.clear();
        _fetchSummary();

        // Audio bip simulyatsiyasi va xabar
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.check_circle, color: Colors.white),
                  const SizedBox(width: 8),
                  Expanded(child: Text(res['message'] ?? 'Davomat qayd etildi!')),
                ],
              ),
              backgroundColor: AppTheme.success,
              duration: const Duration(seconds: 3),
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
    } catch (e) {
      //
    }
  }

  void _markManually(int studentId, String name) async {
    try {
      final res = await ApiService.scanAttendance(lessonId: widget.lessonId, studentId: studentId);
      if (res['status'] == 'success') {
        _fetchSummary();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("$name qo'lda belgilandi ✅"), backgroundColor: AppTheme.success),
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
        title: Text("${lesson['subject_name']} (${lesson['class_name']})", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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
            // Yuqori panel: Dars hisoblagichi (Jami, Keldi, Kelmadi)
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10)],
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
            const SizedBox(height: 20),

            // Tezkor Uzluksiz Kamera Skaneri bloki
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1E2022),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.videocam_rounded, color: Colors.white, size: 20),
                      SizedBox(width: 8),
                      Text("Kamera Davomat Skaneri", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Kamera oynasi simulyatsiyasi (Web va mobil uchun)
                  Container(
                    height: 160,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.black45,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.primary, width: 2),
                    ),
                    child: const Stack(
                      alignment: Alignment.center,
                      children: [
                        Icon(Icons.qr_code_scanner, color: AppTheme.primary, size: 70),
                        Positioned(
                          bottom: 12,
                          child: Text(
                            "O'quvchi QR kodini kameraga tuting",
                            style: TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                        )
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // QR token qo'lda kiritish yoki tezkor test skaner
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _manualTokenController,
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          decoration: InputDecoration(
                            hintText: "Skaner kodi yoki token...",
                            hintStyle: const TextStyle(color: Colors.white54, fontSize: 12),
                            filled: true,
                            fillColor: Colors.white.withOpacity(0.08),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          backgroundColor: AppTheme.primary,
                        ),
                        onPressed: () => _scanCode(_manualTokenController.text.trim()),
                        child: const Text("Qabul qilish"),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Pastki tasdiq kartasi (Pop-up yoki Oxirgi skanerlangan o'quvchi)
            if (_lastScannedMessage != null)
              Container(
                margin: const EdgeInsets.only(bottom: 18),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.green.shade300),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_rounded, color: Colors.green, size: 24),
                    const SizedBox(width: 10),
                    Expanded(child: Text(_lastScannedMessage!, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green))),
                  ],
                ),
              ),

            // O'quvchilar ro'yxati va qo'lda belgilash
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
                          isPresent ? Icons.check : Icons.person_outline,
                          size: 18,
                          color: isPresent ? AppTheme.primary : AppTheme.textMuted,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(s['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            Text(s['passport_series'] ?? '', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                          ],
                        ),
                      ),
                      if (isPresent)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8)),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.qr_code_2_rounded, size: 14, color: Colors.green),
                              SizedBox(width: 4),
                              Text("QR bilan keldi ✅", style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12)),
                            ],
                          ),
                        )
                      else
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(8)),
                          child: const Text("Kelmadi (Kutilmoqda)", style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 24),

            // 🔥 [DAVOMATNI YAKUNLASH VA DARSNI BOSHLASH] TUGMASI
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
                    content: Text("Davomat yakunlandi! Dars jarayoni va materiallari barcha o'quvchilarga ochildi ✅"),
                    backgroundColor: AppTheme.success,
                  ),
                );
                // Dars boshlandi -> Baholash sahifasiga o'tish
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => TeacherGradeScreen(lessonId: widget.lessonId)),
                );
              },
              icon: const Icon(Icons.check_circle_outline_rounded, size: 22),
              label: const Text("Davomatni Yakunlash & Darsni Boshlash ➔", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
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
