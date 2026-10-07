import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme.dart';

class TeacherPasswordsScreen extends StatefulWidget {
  const TeacherPasswordsScreen({super.key});

  @override
  State<TeacherPasswordsScreen> createState() => _TeacherPasswordsScreenState();
}

class _TeacherPasswordsScreenState extends State<TeacherPasswordsScreen> {
  List<dynamic> _students = [];
  bool _loading = true;
  final Set<int> _visiblePasswords = {};

  @override
  void initState() {
    super.initState();
    _fetchStudents();
  }

  void _fetchStudents() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getStudentsPasswords();
      setState(() => _students = list);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _resetPassword(int studentId, String name) async {
    try {
      final res = await ApiService.resetStudentPassword(studentId);
      final newPass = res['new_password'];
      if (!mounted) return;
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text("Yangi Parol Berildi ✅"),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("O'quvchi: $name"),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppTheme.accentLight, borderRadius: BorderRadius.circular(12)),
                child: Text("Yangi parol: $newPass", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.accent)),
              ),
              const SizedBox(height: 8),
              const Text("O'quvchiga ushbu parolni taqdim eting.", style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Tushunarli")),
          ],
        ),
      );
      _fetchStudents();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("O'quvchilar Hisoblari & Parollar", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
          const SizedBox(height: 4),
          const Text("Parolni unutgan o'quvchilarga yangi parol berish (Admin-Ustoz)", style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          const SizedBox(height: 20),

          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : ListView.separated(
                    itemCount: _students.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (ctx, i) {
                      final s = _students[i];
                      final id = s['id'] as int;
                      final isVisible = _visiblePasswords.contains(id);

                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8)],
                        ),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 20,
                                  backgroundColor: AppTheme.primaryLight,
                                  child: const Icon(Icons.person, color: AppTheme.primary, size: 20),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(s['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                      Text("${s['class_name']} | Pasport: ${s['passport_series']}", style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(color: const Color(0xFFF9F9FB), borderRadius: BorderRadius.circular(12)),
                              child: Row(
                                children: [
                                  const Icon(Icons.lock_outline, size: 16, color: AppTheme.textMuted),
                                  const SizedBox(width: 8),
                                  Text(
                                    isVisible ? (s['initial_password'] ?? '-') : "••••••••",
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                  ),
                                  const Spacer(),
                                  IconButton(
                                    icon: Icon(isVisible ? Icons.visibility_off : Icons.visibility, size: 18, color: AppTheme.textMuted),
                                    onPressed: () {
                                      setState(() {
                                        if (isVisible) {
                                          _visiblePasswords.remove(id);
                                        } else {
                                          _visiblePasswords.add(id);
                                        }
                                      });
                                    },
                                  ),
                                  TextButton(
                                    onPressed: () => _resetPassword(id, s['name']),
                                    child: const Text("Yangi parol berish", style: TextStyle(fontSize: 12, color: AppTheme.primary, fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                            )
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
