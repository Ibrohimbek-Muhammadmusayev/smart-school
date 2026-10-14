import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme.dart';

class TeacherGradeScreen extends StatefulWidget {
  final int lessonId;

  const TeacherGradeScreen({super.key, required this.lessonId});

  @override
  State<TeacherGradeScreen> createState() => _TeacherGradeScreenState();
}

class _TeacherGradeScreenState extends State<TeacherGradeScreen> {
  bool _loading = true;
  List<dynamic> _attendedStudents = [];
  final Map<int, int> _scores = {};
  final Map<int, String> _gradeTypes = {};
  final Map<int, TextEditingController> _comments = {};
  final Set<int> _gradedStudentIds = {}; // Baholanganlar to'plami (100% tekshirish uchun)

  @override
  void initState() {
    super.initState();
    _fetchAttended();
  }

  void _fetchAttended() async {
    try {
      final res = await ApiService.getTeacherLiveLesson(widget.lessonId);
      final list = (res['students'] as List<dynamic>? ?? []).where((s) => s['is_present'] == true).toList();
      setState(() {
        _attendedStudents = list;
        for (var s in list) {
          _scores[s['id']] = 5;
          _gradeTypes[s['id']] = 'ACTIVITY';
          _comments[s['id']] = TextEditingController(text: "Darsda faol ishtirok etdi");
        }
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _saveGrade(int studentId, String name) async {
    try {
      final res = await ApiService.addGrade(
        lessonId: widget.lessonId,
        studentId: studentId,
        score: _scores[studentId] ?? 5,
        gradeType: _gradeTypes[studentId] ?? 'ACTIVITY',
        comment: _comments[studentId]?.text.trim() ?? '',
      );

      setState(() {
        _gradedStudentIds.add(studentId);
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res['message'] ?? "$name ga baho qo'yildi va Telegramga yuborildi!"),
            backgroundColor: AppTheme.success,
          ),
        );
      }
    } catch (_) {}
  }


  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text("Jonli Baholash Jurnali", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.white,
        foregroundColor: AppTheme.textDark,
        elevation: 0,
      ),
      body: _attendedStudents.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.people_outline_rounded, size: 64, color: Colors.grey.shade400),
                    const SizedBox(height: 12),
                    const Text(
                      "Davomatdan o'tgan o'quvchilar yo'q!\nAvval o'quvchilar QR kodini skanerlang.",
                      textAlign: TextAlign.center,
                      style: TextStyle(color: AppTheme.textMuted),
                    ),
                  ],
                ),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              itemCount: _attendedStudents.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (ctx, i) {
                final s = _attendedStudents[i];
                final id = s['id'] as int;
                final currentScore = _scores[id] ?? 5;
                final currentType = _gradeTypes[id] ?? 'ACTIVITY';

                return Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10)],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 20,
                            backgroundColor: AppTheme.primaryLight,
                            child: Text("${i + 1}", style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary)),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(s['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                Text(s['passport_series'] ?? '', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8)),
                            child: const Text("Keldi ✅", style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 11)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      // Baho tanlash
                      const Align(
                        alignment: Alignment.centerLeft,
                        child: Text("Baho tanlang:", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.textMuted)),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [1, 2, 3, 4, 5].map((val) {
                          final isSel = currentScore == val;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: InkWell(
                              onTap: () => setState(() => _scores[id] = val),
                              borderRadius: BorderRadius.circular(10),
                              child: Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: isSel ? AppTheme.primary : const Color(0xFFF1F3F6),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Center(
                                  child: Text(
                                    "$val",
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                      color: isSel ? Colors.white : AppTheme.textDark,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 12),

                      // Baho turi (Faollik / Uy ishi / Nazorat)
                      Row(
                        children: [
                          _buildTypeChip(id, 'ACTIVITY', 'Darsda faollik'),
                          const SizedBox(width: 6),
                          _buildTypeChip(id, 'HOMEWORK', 'Uy ishi'),
                          const SizedBox(width: 6),
                          _buildTypeChip(id, 'CONTROL', 'Nazorat'),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Ustoz izohi
                      TextField(
                        controller: _comments[id],
                        decoration: InputDecoration(
                          hintText: "Qisqa izoh (ixtiyoriy)...",
                          filled: true,
                          fillColor: const Color(0xFFF9F9FB),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
                        ),
                      ),
                      const SizedBox(height: 12),

                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _gradedStudentIds.contains(id) ? AppTheme.success : AppTheme.primary,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          onPressed: () => _saveGrade(id, s['name']),
                          icon: Icon(_gradedStudentIds.contains(id) ? Icons.check_circle_rounded : Icons.send_rounded, size: 16),
                          label: Text(_gradedStudentIds.contains(id) ? "Baho saqlangan (Yangilash)" : "Bahoni saqlash va Telegramga yuborish"),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, -4))
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Baholash jarayoni (100% shart):", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.textMuted)),
                Text("${_gradedStudentIds.length} / ${_attendedStudents.length} ta baholandi", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primary)),
              ],
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: _gradedStudentIds.length == _attendedStudents.length && _attendedStudents.isNotEmpty
                      ? AppTheme.success
                      : Colors.grey.shade400,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                onPressed: () async {
                  if (_gradedStudentIds.length < _attendedStudents.length) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text("Dars yakunlanmadi! Davomatda bor barcha (${_attendedStudents.length} nafar) o'quvchilar 100% baholanishi shart. Hali ${_attendedStudents.length - _gradedStudentIds.length} nafari baholanmagan!"),
                        backgroundColor: Colors.red,
                        duration: const Duration(seconds: 4),
                      ),
                    );
                    return;
                  }

                  final res = await ApiService.completeLesson(widget.lessonId);
                  if (!context.mounted) return;
                  if (res['status'] == 'success') {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(res['message'] ?? "Dars yakunlandi! ✅"), backgroundColor: AppTheme.success),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(res['detail'] ?? "Xatolik!"), backgroundColor: Colors.red),
                    );
                  }
                },
                child: Text(
                  _gradedStudentIds.length == _attendedStudents.length && _attendedStudents.isNotEmpty
                      ? "Darsni yakunlash va Baholarni tasdiqlash ✅"
                      : "Davomatdagilar 100% baholangach dars yakunlanadi (${_gradedStudentIds.length}/${_attendedStudents.length})",
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }


  Widget _buildTypeChip(int studentId, String type, String label) {
    final isSel = (_gradeTypes[studentId] ?? 'ACTIVITY') == type;
    return InkWell(
      onTap: () => setState(() => _gradeTypes[studentId] = type),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSel ? AppTheme.accent : const Color(0xFFF1F3F6),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSel ? Colors.white : AppTheme.textMuted,
          ),
        ),
      ),
    );
  }
}
