import 'dart:math';
import 'dart:async';
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme.dart';
import 'teacher_scan_screen.dart';
import '../../features/board/board_control_screen.dart';
import '../../features/board/board_connect_screen.dart';

class TeacherLessonRoomScreen extends StatefulWidget {
  final int lessonId;

  const TeacherLessonRoomScreen({super.key, required this.lessonId});

  @override
  State<TeacherLessonRoomScreen> createState() => _TeacherLessonRoomScreenState();
}

class _TeacherLessonRoomScreenState extends State<TeacherLessonRoomScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _loading = true;
  Map<String, dynamic>? _summary;
  Map<String, dynamic>? _lesson;
  List<dynamic> _students = [];
  List<dynamic> _submissions = [];

  // Baholash holati
  final Map<int, int> _scores = {};
  final Map<int, String> _gradeTypes = {};
  final Map<int, TextEditingController> _comments = {};
  final Set<int> _savedGradeIds = {};

  // Qidiruv
  String _searchQuery = "";

  // Doska sessiyasi
  Map<String, dynamic>? _boardSession;
  Timer? _pollingTimer;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _fetchLessonDetails();
    _fetchBoardStatus();

    // Har 10 soniyada fon yangilanishi
    _pollingTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      if (mounted) _fetchLessonDetails(silent: true);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _pollingTimer?.cancel();
    for (var controller in _comments.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _fetchBoardStatus() async {
    try {
      final res = await ApiService.getMyBoardSession();
      if (mounted) {
        setState(() {
          if (res['status'] == 'ACTIVE') {
            _boardSession = res;
          } else {
            _boardSession = null;
          }
        });
      }
    } catch (_) {}
  }

  Future<void> _fetchLessonDetails({bool silent = false}) async {
    if (!silent) setState(() => _loading = true);
    try {
      final res = await ApiService.getTeacherLiveLesson(widget.lessonId);
      if (mounted) {
        setState(() {
          _summary = res;
          _lesson = res['lesson'];
          _students = res['students'] ?? [];
          _submissions = res['submissions'] ?? [];

          // Baholarni sinxronlash
          for (var s in _students) {
            final id = s['id'] as int;
            if (s['grade'] != null) {
              _scores[id] = s['grade']['score'] ?? 5;
              _gradeTypes[id] = s['grade']['grade_type'] ?? 'ACTIVITY';
              _comments[id] ??= TextEditingController(text: s['grade']['comment'] ?? '');
              _savedGradeIds.add(id);
            } else {
              _scores[id] ??= 5;
              _gradeTypes[id] ??= 'ACTIVITY';
              _comments[id] ??= TextEditingController(text: "Darsda faol ishtirok etdi");
            }
          }
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted && !silent) setState(() => _loading = false);
    }
  }

  // 1. Qo'lda davomatni o'zgartirish (Toggle)
  Future<void> _toggleStudentAttendance(int studentId, String name, bool currentPresent) async {
    try {
      final res = await ApiService.scanAttendance(
        lessonId: widget.lessonId,
        studentId: studentId,
      );
      if (res['status'] == 'success') {
        _fetchLessonDetails(silent: true);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text("$name davomati yangilandi ✅"),
              backgroundColor: AppTheme.success,
              duration: const Duration(seconds: 1),
            ),
          );
        }
      }
    } catch (_) {}
  }

  // 2. Barchaga 100% davomat belgilash
  Future<void> _markAllPresent() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text("Barcha o'quvchilarni belgilash"),
        content: const Text("Sinfdagi barcha o'quvchilarga 100% 'Keldi' maqomi berilsinmi?"),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("Bekor qilish")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.success),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text("Ha, barchasi keldi"),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final res = await ApiService.bulkMarkAttendance(lessonId: widget.lessonId, allPresent: true);
      _fetchLessonDetails(silent: true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res['message'] ?? "Barcha o'quvchilar davomatdan o'tkazildi ✅"),
            backgroundColor: AppTheme.success,
          ),
        );
      }
    } catch (_) {}
  }

  // 3. Davomatni yakunlash va darsni boshlash
  Future<void> _finishAttendance() async {
    try {
      await ApiService.finishAttendance(widget.lessonId);
      _fetchLessonDetails(silent: true);
      _tabController.animateTo(1); // Dars jarayoni tabiga o'tish
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Davomat yakunlandi! Dars jarayoni boshlandi ✅"),
            backgroundColor: AppTheme.success,
          ),
        );
      }
    } catch (_) {}
  }

  // 4. Bahoni saqlash va Telegramga yuborish
  Future<void> _saveGrade(int studentId, String name) async {
    try {
      final res = await ApiService.addGrade(
        lessonId: widget.lessonId,
        studentId: studentId,
        score: _scores[studentId] ?? 5,
        gradeType: _gradeTypes[studentId] ?? 'ACTIVITY',
        comment: _comments[studentId]?.text.trim() ?? '',
      );

      setState(() {
        _savedGradeIds.add(studentId);
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res['message'] ?? "$name ga baho qo'yildi va Telegramga yuborildi!"),
            backgroundColor: AppTheme.success,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (_) {}
  }

  // 5. Barchaga 5 (A'lo) qo'yish
  Future<void> _gradeAllExcelent() async {
    final attended = _students.where((s) => s['is_present'] == true).toList();
    for (var s in attended) {
      final id = s['id'] as int;
      _scores[id] = 5;
      _gradeTypes[id] = 'ACTIVITY';
      await _saveGrade(id, s['name']);
    }
  }

  // 6. Darsni yakunlash (100% tekshiruv bilan)
  Future<void> _completeLesson() async {
    final attended = _students.where((s) => s['is_present'] == true).toList();
    final ungraded = attended.where((s) => !_savedGradeIds.contains(s['id'])).toList();

    if (ungraded.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Dars yakunlanmadi! Davomatdagi barcha o'quvchilar baholanishi shart. Hali ${ungraded.length} nafari baholanmagan!"),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 4),
        ),
      );
      _tabController.animateTo(2); // Baholash tabiga yo'naltirish
      return;
    }

    try {
      final res = await ApiService.completeLesson(widget.lessonId);
      if (res['status'] == 'success') {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res['message'] ?? "Dars to'liq yakunlandi va arxivlandi! ✅"),
              backgroundColor: AppTheme.success,
            ),
          );
          Navigator.pop(context, true);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(res['detail'] ?? "Xatolik yuz berdi"), backgroundColor: Colors.red),
          );
        }
      }
    } catch (_) {}
  }

  // 7. Mavzuni tahrirlash dialogi
  void _showEditTopicDialog() {
    final ctrl = TextEditingController(text: _lesson?['topic'] ?? '');
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        title: const Text("Dars Mavzusini Tahrirlash"),
        content: TextField(
          controller: ctrl,
          decoration: InputDecoration(
            labelText: "Mavzu nomi",
            hintText: "Masalan: Nyutonning 2-qonuni",
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Bekor qilish")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
            onPressed: () async {
              final newTopic = ctrl.text.trim();
              if (newTopic.isNotEmpty) {
                await ApiService.updateLessonContent(lessonId: widget.lessonId, topic: newTopic);
                _fetchLessonDetails(silent: true);
              }
              if (ctx.mounted) Navigator.pop(ctx);
            },
            child: const Text("Saqlash"),
          ),
        ],
      ),
    );
  }

  // 8. Uyga vazifa berish dialogi
  void _showAssignHomeworkDialog() {
    final ctrl = TextEditingController(text: _lesson?['homework_description'] ?? '');
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        title: const Text("Uyga Vazifa Berish 📝"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Kiritilgan vazifa barcha sinf o'quvchilari va ota-onalar ilovasida darhol aks etadi.",
              style: TextStyle(fontSize: 12.5, color: AppTheme.textMuted),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: ctrl,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: "Darslik 145-bet, 1-4 mashqlar va testlarni yechish...",
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Bekor qilish")),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
            onPressed: () async {
              final hw = ctrl.text.trim();
              await ApiService.updateLessonContent(lessonId: widget.lessonId, homeworkDescription: hw);
              _fetchLessonDetails(silent: true);
              if (ctx.mounted) Navigator.pop(ctx);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text("Uyga vazifa o'quvchilarga yuborildi ✅"),
                    backgroundColor: AppTheme.success,
                  ),
                );
              }
            },
            icon: const Icon(Icons.send_rounded, size: 16),
            label: const Text("Yuborish"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text("Dars Xonasi"), elevation: 0),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final lessonName = _lesson?['subject_name'] ?? 'Dars';
    final className = _lesson?['class_name'] ?? '9-A';
    final room = _lesson?['room_number'] ?? '101-xona';
    final status = _lesson?['status'] ?? 'PENDING';
    final total = _summary?['total_students'] ?? _students.length;
    final present = _summary?['present_count'] ?? _students.where((s) => s['is_present'] == true).length;
    final absent = max(0, total - present);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: AppTheme.textDark,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "$lessonName • $className",
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            Text(
              "$room • ${_lesson?['start_time']} - ${_lesson?['end_time']}",
              style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
            ),
          ],
        ),
        actions: [
          // IdrokBoard status belgisi
          IconButton(
            tooltip: "IdrokBoard Pulti",
            icon: Icon(
              Icons.tv_rounded,
              color: _boardSession != null ? AppTheme.success : AppTheme.textMuted,
            ),
            onPressed: () {
              if (_boardSession != null) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => BoardControlScreen(
                      sessionId: _boardSession!['session_id'] as int,
                      deviceToken: (_boardSession!['device_token'] ?? '').toString(),
                      teacherName: ApiService.currentUser?['full_name'] ?? 'Ustoz',
                      deviceName: _boardSession!['device_name'] ?? 'Aqlli Doska',
                    ),
                  ),
                );
              } else {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const BoardConnectScreen(),
                  ),
                );
              }
            },
          ),
          IconButton(
            tooltip: "QR Skanerlash",
            icon: const Icon(Icons.qr_code_scanner_rounded, color: AppTheme.primary),
            onPressed: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => TeacherScanScreen(lessonId: widget.lessonId),
                ),
              );
              _fetchLessonDetails(silent: true);
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textMuted,
          indicatorColor: AppTheme.primary,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: [
            Tab(
              icon: const Icon(Icons.how_to_reg_rounded, size: 20),
              text: "Davomat ($present/$total)",
            ),
            const Tab(
              icon: Icon(Icons.menu_book_rounded, size: 20),
              text: "Dars & Vazifa",
            ),
            Tab(
              icon: const Icon(Icons.star_rounded, size: 20),
              text: "Baholash (${_savedGradeIds.length}/$present)",
            ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildAttendanceTab(total, present, absent, status),
          _buildLessonFlowTab(),
          _buildGradingTab(present),
        ],
      ),
    );
  }

  // =========================================================================
  // 1. 📋 DAVOMAT TABI
  // =========================================================================
  Widget _buildAttendanceTab(int total, int present, int absent, String status) {
    final filtered = _students.where((s) {
      if (_searchQuery.isEmpty) return true;
      final name = (s['name'] ?? '').toString().toLowerCase();
      final id = (s['student_id'] ?? '').toString().toLowerCase();
      final q = _searchQuery.toLowerCase();
      return name.contains(q) || id.contains(q);
    }).toList();

    return RefreshIndicator(
      onRefresh: () => _fetchLessonDetails(silent: true),
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        children: [
          // Hisoblagich paneli (Total, Present, Absent)
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildCounterItem("Jami", "$total", AppTheme.textDark),
                Container(width: 1, height: 36, color: Colors.grey.shade200),
                _buildCounterItem("Keldi", "$present", AppTheme.success),
                Container(width: 1, height: 36, color: Colors.grey.shade200),
                _buildCounterItem("Kelmadi", "$absent", Colors.redAccent),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Tezkor harakatlar tugmalari: [QR Skaner] va [Hamma keldi]
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () async {
                    await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => TeacherScanScreen(lessonId: widget.lessonId),
                      ),
                    );
                    _fetchLessonDetails(silent: true);
                  },
                  icon: const Icon(Icons.qr_code_scanner_rounded, size: 18),
                  label: const Text("Davomat Skaneri", style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.success,
                    side: const BorderSide(color: AppTheme.success),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: _markAllPresent,
                  icon: const Icon(Icons.done_all_rounded, size: 18),
                  label: const Text("Hamma keldi", style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Qidiruv maydoni
          TextField(
            onChanged: (val) => setState(() => _searchQuery = val),
            decoration: InputDecoration(
              hintText: "O'quvchini qidirish (ism yoki ID)...",
              prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.textMuted),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(vertical: 0),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.grey.shade200)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.grey.shade200)),
            ),
          ),
          const SizedBox(height: 14),

          // O'quvchilar ro'yxati
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: filtered.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (ctx, i) {
              final s = filtered[i];
              final isPresent = s['is_present'] == true;
              final id = s['id'] as int;

              return InkWell(
                borderRadius: BorderRadius.circular(18),
                onTap: () => _toggleStudentAttendance(id, s['name'], isPresent),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: isPresent ? Colors.green.shade200 : Colors.black.withOpacity(0.04),
                    ),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: isPresent ? AppTheme.primaryLight : Colors.grey.shade100,
                        child: Text(
                          (s['name'] ?? 'O').toString().substring(0, 1),
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: isPresent ? AppTheme.primary : AppTheme.textMuted,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              s['name'] ?? '',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              "ID: ${s['student_id'] ?? id} • ${s['passport_series'] ?? ''}",
                              style: const TextStyle(color: AppTheme.textMuted, fontSize: 11.5),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: isPresent ? Colors.green.shade50 : Colors.red.shade50,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isPresent ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                              size: 15,
                              color: isPresent ? Colors.green : Colors.redAccent,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              isPresent ? "Keldi" : "Kelmadi",
                              style: TextStyle(
                                color: isPresent ? Colors.green : Colors.redAccent,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 20),

          // Davomatni yakunlash tugmasi
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
            ),
            onPressed: _finishAttendance,
            icon: const Icon(Icons.arrow_forward_rounded, size: 20),
            label: const Text(
              "Davomatni Yakunlash & Darsni Boshlash ➔",
              style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  // =========================================================================
  // 2. 📖 DARS JARAYONI & UY VAZIFASI TABI
  // =========================================================================
  Widget _buildLessonFlowTab() {
    final topic = _lesson?['topic'] ?? "Dars mavzusi belgilanmagan";
    final homework = _lesson?['homework_description'] ?? "";

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      children: [
        // 2.1. Dars Mavzusi kartasi
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [BoxShadow(color: AppTheme.primary.withOpacity(0.3), blurRadius: 14)],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.22),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      "Dars Mavzusi 📚",
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ),
                  IconButton(
                    onPressed: _showEditTopicDialog,
                    icon: const Icon(Icons.edit_rounded, color: Colors.white, size: 20),
                    tooltip: "Tahrirlash",
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                topic,
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              Text(
                "Sinf: ${_lesson?['class_name']} • Xona: ${_lesson?['room_number']}",
                style: const TextStyle(color: Colors.white70, fontSize: 12.5),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        // 2.2. Uyga Vazifa kartasi
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: Colors.black.withOpacity(0.04)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Uyga Vazifa 📝",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                  ),
                  TextButton.icon(
                    onPressed: _showAssignHomeworkDialog,
                    icon: const Icon(Icons.edit_note_rounded, size: 18),
                    label: Text(homework.isEmpty ? "Vazifa Berish" : "O'zgartirish"),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                homework.isNotEmpty
                    ? homework
                    : "Hozircha ushbu darsga uy vazifasi berilmagan. Tugmani bosib vazifa kiriting.",
                style: TextStyle(
                  fontSize: 13.5,
                  color: homework.isNotEmpty ? AppTheme.textDark : AppTheme.textMuted,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        // 2.3. IdrokBoard Masofaviy Boshqaruvi
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: Colors.black.withOpacity(0.04)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.tv_rounded,
                    color: _boardSession != null ? AppTheme.success : AppTheme.primary,
                    size: 22,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _boardSession != null
                        ? "Ulangan doska: ${_boardSession!['device_name'] ?? 'Doska'} 🟢"
                        : "Aqlli Doska (IdrokBoard) ⚪",
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        if (_boardSession != null) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => BoardControlScreen(
                                sessionId: _boardSession!['session_id'] as int,
                                deviceToken: (_boardSession!['device_token'] ?? '').toString(),
                                teacherName: ApiService.currentUser?['full_name'] ?? 'Ustoz',
                              ),
                            ),
                          );
                        } else {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const BoardConnectScreen(),
                            ),
                          );
                        }
                      },
                      icon: const Icon(Icons.settings_remote_rounded, size: 18),
                      label: Text(_boardSession != null ? "Pultni Ochish" : "Doskaga Ulanish"),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        // 2.4. Topshirilgan Uy Vazifalari
        if (_submissions.isNotEmpty) ...[
          Text(
            "Topshirilgan Vazifalar (${_submissions.length} ta)",
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
          ),
          const SizedBox(height: 10),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _submissions.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (ctx, i) {
              final sub = _submissions[i];
              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.black.withOpacity(0.04)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          sub['student_name'] ?? "O'quvchi",
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                        ),
                        Text(
                          sub['submitted_at'] ?? '',
                          style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      sub['text_content'] ?? '',
                      style: const TextStyle(fontSize: 13, color: AppTheme.textDark),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
        const SizedBox(height: 20),
      ],
    );
  }

  // =========================================================================
  // 3. ⭐ JONLI BAHOLASH TABI
  // =========================================================================
  Widget _buildGradingTab(int presentCount) {
    final attendedStudents = _students.where((s) => s['is_present'] == true).toList();

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      children: [
        // Baholash ko'rsatkichi progress bari
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Baholash Jarayoni (100% shart):",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMuted),
                  ),
                  Text(
                    "${_savedGradeIds.length} / $presentCount ta baholandi",
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.primary),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: LinearProgressIndicator(
                  value: presentCount > 0 ? (_savedGradeIds.length / presentCount) : 0,
                  backgroundColor: Colors.grey.shade100,
                  color: _savedGradeIds.length >= presentCount && presentCount > 0 ? AppTheme.success : AppTheme.primary,
                  minHeight: 8,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.primary,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: _gradeAllExcelent,
                      icon: const Icon(Icons.star_rounded, size: 16),
                      label: const Text("Barchaga 5 (A'lo)"),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        if (attendedStudents.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Icon(Icons.people_outline_rounded, size: 54, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  const Text(
                    "Hozircha davomatdan o'tgan o'quvchilar yo'q!\nDavomat tabidan o'quvchilarni belgilang.",
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppTheme.textMuted),
                  ),
                ],
              ),
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: attendedStudents.length,
            separatorBuilder: (_, __) => const SizedBox(height: 14),
            itemBuilder: (ctx, i) {
              final s = attendedStudents[i];
              final id = s['id'] as int;
              final currentScore = _scores[id] ?? 5;
              final isSaved = _savedGradeIds.contains(id);

              return Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(
                    color: isSaved ? Colors.green.shade200 : Colors.black.withOpacity(0.04),
                  ),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8)],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 18,
                          backgroundColor: isSaved ? AppTheme.success.withOpacity(0.12) : AppTheme.primaryLight,
                          child: Text(
                            "${i + 1}",
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: isSaved ? AppTheme.success : AppTheme.primary,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(s['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5)),
                              Text("ID: ${s['student_id'] ?? id}", style: const TextStyle(color: AppTheme.textMuted, fontSize: 11.5)),
                            ],
                          ),
                        ),
                        if (isSaved)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8)),
                            child: const Text("Saqlandi ✅", style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 11)),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Baho tanlash (1 dan 5 gacha)
                    Row(
                      children: [1, 2, 3, 4, 5].map((val) {
                        final isSel = currentScore == val;
                        Color btnColor = AppTheme.primary;
                        if (val == 5) btnColor = AppTheme.success;
                        if (val <= 2) btnColor = Colors.redAccent;
                        if (val == 3) btnColor = Colors.orange;

                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: InkWell(
                            onTap: () => setState(() => _scores[id] = val),
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: isSel ? btnColor : const Color(0xFFF1F5F9),
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
                    const SizedBox(height: 10),

                    // Baho turi
                    Row(
                      children: [
                        _buildTypeChip(id, 'ACTIVITY', 'Faollik'),
                        const SizedBox(width: 6),
                        _buildTypeChip(id, 'HOMEWORK', 'Uy ishi'),
                        const SizedBox(width: 6),
                        _buildTypeChip(id, 'CONTROL', 'Nazorat'),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Izoh maydoni
                    TextField(
                      controller: _comments[id],
                      decoration: InputDecoration(
                        hintText: "Qisqa izoh...",
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Saqlash tugmasi
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isSaved ? AppTheme.success : AppTheme.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () => _saveGrade(id, s['name']),
                        icon: Icon(isSaved ? Icons.check_circle_rounded : Icons.send_rounded, size: 16),
                        label: Text(isSaved ? "Baho saqlangan (Yangilash)" : "Bahoni saqlash va Telegramga yuborish"),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        const SizedBox(height: 24),

        // Darsni yakunlash tugmasi
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: _savedGradeIds.length == attendedStudents.length && attendedStudents.isNotEmpty
                ? AppTheme.success
                : Colors.grey.shade400,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          ),
          onPressed: _completeLesson,
          child: Text(
            _savedGradeIds.length == attendedStudents.length && attendedStudents.isNotEmpty
                ? "Darsni Yakunlash va Baholarni Tasdiqlash ✅"
                : "Davomatdagilar 100% baholangach dars yakunlanadi (${_savedGradeIds.length}/${attendedStudents.length})",
            textAlign: TextAlign.center,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
          ),
        ),
        const SizedBox(height: 30),
      ],
    );
  }

  Widget _buildTypeChip(int studentId, String type, String label) {
    final isSel = (_gradeTypes[studentId] ?? 'ACTIVITY') == type;
    return InkWell(
      onTap: () => setState(() => _gradeTypes[studentId] = type),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSel ? AppTheme.accent : const Color(0xFFF1F5F9),
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
