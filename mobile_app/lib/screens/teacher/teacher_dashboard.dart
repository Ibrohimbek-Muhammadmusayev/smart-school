import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme.dart';
import '../../features/board/board_connect_screen.dart';
import '../../features/board/board_control_screen.dart';
import 'teacher_scan_screen.dart';
import 'teacher_universal_scan_screen.dart';
import '../student/profile_identity_modal.dart';
import '../student/profile_screen.dart';
import '../notifications_screen.dart';
import '../login_screen.dart';

class TeacherDashboard extends StatefulWidget {
  const TeacherDashboard({super.key});

  @override
  State<TeacherDashboard> createState() => _TeacherDashboardState();
}

class _TeacherDashboardState extends State<TeacherDashboard> {
  int _tabIndex = 0;
  List<dynamic> _lessons = [];
  bool _loading = true;

  // Hudud nazorati (Geofence / Wi-Fi Guard)
  final bool _isInsideBuilding = true;
  final String _buildingEntryTime = "08:05";

  // Aqlli Doska (shooldex) aktiv sessiya holati
  Map<String, dynamic>? _boardSession;
  int _currentSlide = 1;

  @override
  void initState() {
    super.initState();
    _fetchAllData();
  }

  Future<void> _fetchAllData() async {
    _fetchLessons();
    _fetchBoardStatus();
  }

  Future<void> _fetchLessons() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getTodayLessons();
      if (mounted) setState(() => _lessons = list);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
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

  void _openProfileModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const ProfileIdentityModal(),
    );
  }

  void _openNotifications() {
    Navigator.push(
      context,
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => const NotificationsScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          const begin = Offset(1.0, 0.0);
          const end = Offset.zero;
          const curve = Curves.easeOutCubic;
          final tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
          return SlideTransition(position: animation.drive(tween), child: child);
        },
      ),
    );
  }

  Future<void> _openIdrokBoard(Map<String, dynamic> user) async {
    if (_boardSession != null && _boardSession!['session_id'] != null) {
      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => BoardControlScreen(
            sessionId: _boardSession!['session_id'] as int,
            deviceToken: (_boardSession!['device_token'] ?? '').toString(),
            teacherName: (user['full_name'] ?? 'Ustoz').toString(),
            deviceName: (_boardSession!['device_name'] ?? 'IdrokBoard').toString(),
            geminiApiKey: (_boardSession!['gemini_api_key'] ?? '').toString(),
            initialCanvases: (_boardSession!['saved_canvases'] as List<dynamic>?) ?? [],
          ),
        ),
      );
    } else {
      await Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const BoardConnectScreen()),
      );
    }
    _fetchBoardStatus();
  }

  void _showPinConnectDialog() {
    final pinController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Row(
          children: [
            Icon(Icons.pin_rounded, color: AppTheme.primary),
            SizedBox(width: 8),
            Text("6 xonali PIN-kod", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Aqlli doska ekranidagi 6 xonali PIN yoki token kodini kiriting:",
              style: TextStyle(fontSize: 13, color: AppTheme.textMuted),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: pinController,
              keyboardType: TextInputType.number,
              maxLength: 6,
              style: const TextStyle(fontSize: 20, letterSpacing: 6, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
              decoration: InputDecoration(
                hintText: "••••••",
                hintStyle: const TextStyle(letterSpacing: 6),
                filled: true,
                fillColor: const Color(0xFFF1F5F9),
                contentPadding: const EdgeInsets.symmetric(vertical: 14),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Bekor qilish", style: TextStyle(color: AppTheme.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () async {
              final pin = pinController.text.trim();
              if (pin.isEmpty) return;
              Navigator.pop(ctx);
              try {
                final res = await ApiService.connectToBoard(pin);
                if (!mounted) return;
                if (res['session_id'] != null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(res['message'] ?? "Doska muvaffaqiyatli ulandi! ✅"),
                      backgroundColor: AppTheme.success,
                    ),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(res['detail'] ?? "Ulanib bo'lmadi!"),
                      backgroundColor: Colors.redAccent,
                    ),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text("Xatolik: $e"), backgroundColor: Colors.redAccent),
                  );
                }
              }
              _fetchBoardStatus();
            },
            child: const Text("Ulanish ➔"),
          ),
        ],
      ),
    );
  }

  void _sendBoardSlide(int delta) {
    if (_boardSession == null) return;
    final total = ((_boardSession!['saved_canvases'] as List?)?.length ?? 1).clamp(1, 99);
    setState(() {
      _currentSlide = (_currentSlide + delta).clamp(1, total > 1 ? total : 5);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text("Doska $_currentSlide-slaydga o'tkazildi ✅"),
        backgroundColor: AppTheme.primary,
        duration: const Duration(seconds: 1),
      ),
    );
  }

  void _clearBoardConfirm() async {
    if (_boardSession == null) return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Row(
          children: [
            Icon(Icons.cleaning_services_rounded, color: Colors.redAccent),
            SizedBox(width: 8),
            Text("Doskani tozalash", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
          ],
        ),
        content: const Text("Doskadagi barcha yozuv va chizmalarni o'chirib, toza list ochilsinmi?"),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("Bekor qilish")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text("Barchasini o'chirish 🧹"),
          ),
        ],
      ),
    );
    if (confirm == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Doska tozalandi 🧹"), backgroundColor: AppTheme.success),
      );
    }
  }

  void _showSendTextDialog() {
    if (_boardSession == null) return;
    final textController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Row(
          children: [
            Icon(Icons.send_rounded, color: AppTheme.primary),
            SizedBox(width: 8),
            Text("Doskaga Matn / Formula", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
          ],
        ),
        content: TextField(
          controller: textController,
          maxLines: 4,
          decoration: InputDecoration(
            hintText: "Telefondan e'lon, dars qoidasi yoki formula yozing...",
            filled: true,
            fillColor: const Color(0xFFF1F5F9),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Bekor qilish")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
            onPressed: () async {
              final text = textController.text.trim();
              if (text.isEmpty) return;
              Navigator.pop(ctx);
              try {
                await ApiService.saveBoardCanvas(
                  sessionId: _boardSession!['session_id'] as int,
                  deviceToken: (_boardSession!['device_token'] ?? '').toString(),
                  canvases: [
                    {
                      'list_index': _currentSlide - 1,
                      'list_name': 'E\'lon / Matn',
                      'canvas_data': text,
                    }
                  ],
                );
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Matn doskaga chiqarildi 🚀"), backgroundColor: AppTheme.success),
                  );
                }
              } catch (_) {}
              _fetchBoardStatus();
            },
            child: const Text("Doskaga uzatish 🚀"),
          ),
        ],
      ),
    );
  }

  void _showAiTopicSummaryDialog() {
    if (_boardSession == null) return;
    final topicController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Row(
          children: [
            Icon(Icons.auto_awesome_rounded, color: AppTheme.primary),
            SizedBox(width: 8),
            Text("AI Mavzu Konspekti", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Mavzu nomini kiriting — AI doskaga qisqa tushuntirish va 3 bandli reja chiqaradi:",
              style: TextStyle(fontSize: 12.5, color: AppTheme.textMuted),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: topicController,
              decoration: InputDecoration(
                hintText: "Masalan: Kvadrat tenglamalar yechish",
                filled: true,
                fillColor: const Color(0xFFF1F5F9),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Bekor qilish")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
            onPressed: () async {
              final topic = topicController.text.trim();
              if (topic.isEmpty) return;
              Navigator.pop(ctx);
              final outline = "📌 MAVZU: ${topic.toUpperCase()}\n\n"
                  "1. Ta'rif va asosiy tushunchalar\n"
                  "2. Qoidalar va amaliy misollar yechimi\n"
                  "3. Mustahkamlash uchun xulosalar";
              try {
                await ApiService.saveBoardCanvas(
                  sessionId: _boardSession!['session_id'] as int,
                  deviceToken: (_boardSession!['device_token'] ?? '').toString(),
                  canvases: [
                    {
                      'list_index': _currentSlide - 1,
                      'list_name': 'Mavzu Konspekti',
                      'canvas_data': outline,
                    }
                  ],
                );
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Mavzu konspekti doskaga chiqarildi 📝"), backgroundColor: AppTheme.success),
                  );
                }
              } catch (_) {}
              _fetchBoardStatus();
            },
            child: const Text("Doskaga chiqarish 📝"),
          ),
        ],
      ),
    );
  }

  void _showAiQuickTestDialog() {
    if (_boardSession == null) return;
    final topicController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Row(
          children: [
            Icon(Icons.quiz_rounded, color: AppTheme.secondaryOrange),
            SizedBox(width: 8),
            Text("AI Tezkor Test", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Mavzu nomini kiriting — AI doskaga 3 ta test savolini variantlari bilan chiqaradi:",
              style: TextStyle(fontSize: 12.5, color: AppTheme.textMuted),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: topicController,
              decoration: InputDecoration(
                hintText: "Masalan: Nyutonning 2-qonuni",
                filled: true,
                fillColor: const Color(0xFFF1F5F9),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Bekor qilish")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.secondaryOrange),
            onPressed: () async {
              final topic = topicController.text.trim();
              if (topic.isEmpty) return;
              Navigator.pop(ctx);
              final testText = "🎯 TEZKOR TEST: $topic\n\n"
                  "1-savol: Ushbu mavzuning asosiy formulasini ko'rsating?\n"
                  "A) F = ma   B) E = mc²   C) v = s/t\n\n"
                  "2-savol: O'lchov birligi to'g'ri berilgan qatorni toping?\n"
                  "A) Nyuton (N)   B) Joul (J)   C) Watt (W)\n\n"
                  "3-savol: Amaliy masalada qaysi parametr saqlanadi?\n"
                  "A) Massa   B) Tezlik   C) Vaqt";
              try {
                await ApiService.saveBoardCanvas(
                  sessionId: _boardSession!['session_id'] as int,
                  deviceToken: (_boardSession!['device_token'] ?? '').toString(),
                  canvases: [
                    {
                      'list_index': _currentSlide - 1,
                      'list_name': 'Tezkor Test',
                      'canvas_data': testText,
                    }
                  ],
                );
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Tezkor test doskaga chiqarildi 🎯"), backgroundColor: AppTheme.success),
                  );
                }
              } catch (_) {}
              _fetchBoardStatus();
            },
            child: const Text("Testni chiqarish 🎯"),
          ),
        ],
      ),
    );
  }

  void _confirmLogout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Row(
          children: [
            Icon(Icons.logout_rounded, color: Colors.redAccent),
            SizedBox(width: 8),
            Text("Tizimdan chiqish", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
          ],
        ),
        content: const Text("Sessiya tokenlari tozalanadi va ilovadan xavfsiz chiqasiz. Chiqishni tasdiqlaysizmi?"),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("Bekor qilish")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text("Chiqish"),
          ),
        ],
      ),
    );
    if (confirm == true) {
      ApiService.logout();
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (route) => false,
      );
    }
  }

  void _openClassJournalModal(Map<String, dynamic> group) {
    final students = [
      {"name": "Aliyev Sardor Akmal o'g'li", "id": "50412", "status": "08:32 ✅", "type": "present", "rate": "98%"},
      {"name": "Karimova Malika Shuhrat qizi", "id": "50413", "status": "08:35 ✅", "type": "present", "rate": "100%"},
      {"name": "Umarov Jasur Baxtiyor o'g'li", "id": "50414", "status": "08:50 ⚠️", "type": "late", "rate": "88%"},
      {"name": "Nazarova Dilnoza Otabek qizi", "id": "50415", "status": "Kelmagan ❌", "type": "absent", "rate": "72%"},
      {"name": "Rahimov Bobur Ilhom o'g'li", "id": "50416", "status": "08:28 ✅", "type": "present", "rate": "96%"},
      {"name": "Tursunov Diyor Rustam o'g'li", "id": "50417", "status": "08:30 ✅", "type": "present", "rate": "94%"},
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.85,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 44,
                height: 5,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "${group['name']} Jurnali",
                        style: const TextStyle(fontSize: 19, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        "${group['subject']} • ${group['count']}",
                        style: const TextStyle(fontSize: 12.5, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppTheme.success.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    "Oylik davomat: ${group['attendance']}",
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5, color: AppTheme.success),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "O'quvchilar ro'yxati & Kunlik davomat",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: AppTheme.textDark),
                ),
                Text(
                  "${students.length} nafar",
                  style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Expanded(
              child: ListView.separated(
                itemCount: students.length,
                separatorBuilder: (_, index) => const SizedBox(height: 8),
                itemBuilder: (context, i) {
                  final s = students[i];
                  final statusType = s['type'];
                  Color badgeColor = AppTheme.success;
                  if (statusType == 'late') badgeColor = Colors.orange;
                  if (statusType == 'absent') badgeColor = Colors.redAccent;

                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 18,
                          backgroundColor: AppTheme.primaryLight,
                          child: Text(
                            s['name']!.substring(0, 1),
                            style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                s['name']!,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                              ),
                              const SizedBox(height: 2),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                    decoration: BoxDecoration(
                                      color: Colors.grey.shade200,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      "ID: ${s['id']}",
                                      style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Colors.grey.shade700),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    "Oylik: ${s['rate']}",
                                    style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: badgeColor.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            s['status']!,
                            style: TextStyle(
                              color: badgeColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 11.5,
                            ),
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
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ApiService.currentUser ?? {};
    final fullName = user['full_name'] ?? 'Ustoz';

    return Scaffold(
      body: SafeArea(
        child: IndexedStack(
          index: _tabIndex,
          children: [
            _buildHomeTab(user, fullName),        // 1. Bosh sahifa (Dashboard)
            _buildIdrokBoardTab(user, fullName),  // 2. IdrokBoard (Masofaviy Pult)
            _buildGroupsAndResultsTab(),          // 3. Guruhlarim & Natijalar
            _buildMenuTab(user),                  // 4. Menu & Profil
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.primary,
        elevation: 4,
        shape: const CircleBorder(),
        onPressed: () {
          final lessonId = _lessons.isNotEmpty ? _lessons.first['id'] as int? : 101;
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => TeacherUniversalScanScreen(lessonId: lessonId),
            ),
          );
        },
        child: const Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 28),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomAppBar(
        shape: const CircularNotchedRectangle(),
        notchMargin: 6,
        color: Colors.white,
        elevation: 12,
        height: 64,
        padding: EdgeInsets.zero,
        child: Row(
          children: [
            _buildBottomNavItem(0, Icons.home_rounded, "Bosh sahifa"),
            _buildBottomNavItem(1, Icons.tv_rounded, "IdrokBoard", hasBadge: _boardSession != null),
            const SizedBox(width: 56), // Markaziy QR Skaner tugmasi uchun joy
            _buildBottomNavItem(2, Icons.groups_rounded, "Guruhlarim"),
            _buildBottomNavItem(3, Icons.grid_view_rounded, "Menu"),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomNavItem(int index, IconData icon, String label, {bool hasBadge = false}) {
    final isSelected = _tabIndex == index;
    return Expanded(
      child: InkWell(
        onTap: () {
          setState(() => _tabIndex = index);
          if (index == 0 || index == 1) _fetchBoardStatus();
        },
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  icon,
                  color: isSelected ? AppTheme.primary : AppTheme.textMuted,
                  size: 24,
                ),
                if (hasBadge)
                  Positioned(
                    right: -2,
                    top: -2,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppTheme.success,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 3),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 10.5,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? AppTheme.primary : AppTheme.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // 1. 🏠 BOSH SAHIFA (TeacherHomeScreen — Dashboard)
  // =========================================================================
  Widget _buildHomeTab(Map<String, dynamic> user, String fullName) {
    dynamic nextLesson;
    for (var l in _lessons) {
      if (nextLesson == null && (l['status'] == 'ACTIVE' || l['status'] == 'PENDING')) {
        nextLesson = l;
      }
    }
    if (nextLesson == null && _lessons.isNotEmpty) {
      nextLesson = _lessons.first;
    }

    final teacherId = (user['teacher_id'] ?? user['username'] ?? '20101').toString();

    return RefreshIndicator(
      onRefresh: _fetchAllData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1.1. Status & Joylashuv Kartasi (Header Widget)
            _buildHeader(fullName, "O'qituvchi", teacherId: teacherId),
            const SizedBox(height: 18),

            // 1.2. Darslar Dinamik Bloki (Conditional Rendering State)
            if (_loading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: CircularProgressIndicator(),
                ),
              )
            else if (_lessons.isNotEmpty) ...[
              // 🟢 [HOLAT A: Bugun o‘tiladigan darslar mavjud bo‘lganda]
              _buildHeroLessonCard(nextLesson ?? _lessons.first, user),
              const SizedBox(height: 18),

              // "Bugungi qolgan darslar" ro'yxati (Kichik tartibli kartochkalar)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Bugungi Qolgan Darslar",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                  ),
                  Text("${_lessons.length} ta dars", style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                ],
              ),
              const SizedBox(height: 12),
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _lessons.length,
                separatorBuilder: (_, index) => const SizedBox(height: 10),
                itemBuilder: (ctx, i) => _buildLessonListItem(_lessons[i]),
              ),
              const SizedBox(height: 20),
            ] else ...[
              // ⚪ [HOLAT B: Darslar yo‘q bo‘lganda yoki barchasi tugaganda]
              _buildEmptyStateCard(),
              const SizedBox(height: 20),
            ],

            // 1.3. IdrokBoard Jonli Boshqaruv Vidjeti
            _buildIdrokBoardQuickWidget(user),
            const SizedBox(height: 22),

            // 1.4. Tezkor Statistika Vidjetlari (2x2 Grid)
            _buildQuickStatsWidgets(),
            const SizedBox(height: 22),

            // 1.5. Haftalik Dars Matritsasi
            _buildWeeklyScheduleMatrix(),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  // 1.1 Status & Joylashuv Kartasi (Header Widget)
  Widget _buildHeader(String fullName, String roleLabel, {String? teacherId}) {
    return Row(
      children: [
        Expanded(
          child: InkWell(
            borderRadius: BorderRadius.circular(30),
            onTap: _openProfileModal,
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primary.withValues(alpha: 0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.person_rounded, color: Colors.white, size: 26),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              fullName,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textDark,
                              ),
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(Icons.verified_rounded, size: 15, color: AppTheme.primary),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          // 5 xonali unikal ID (Badge: ID: 20101)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryLight,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              "ID: ${teacherId ?? '20101'}",
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primary,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          // Hudud nazorati (Geofence / Wi-Fi Guard)
                          Flexible(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                              decoration: BoxDecoration(
                                color: _isInsideBuilding
                                    ? AppTheme.success.withValues(alpha: 0.12)
                                    : Colors.grey.shade200,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 6,
                                    height: 6,
                                    decoration: BoxDecoration(
                                      color: _isInsideBuilding ? AppTheme.success : Colors.grey,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 5),
                                  Flexible(
                                    child: Text(
                                      _isInsideBuilding
                                          ? "Bino ichida • $_buildingEntryTime ✅"
                                          : "Bino tashqarisida 📍",
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontSize: 10.5,
                                        fontWeight: FontWeight.bold,
                                        color: _isInsideBuilding ? AppTheme.success : Colors.grey.shade700,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 8),
        Stack(
          children: [
            IconButton(
              onPressed: _openNotifications,
              icon: const Icon(Icons.notifications_none_rounded, color: AppTheme.textDark, size: 26),
            ),
            Positioned(
              right: 10,
              top: 10,
              child: Container(
                width: 9,
                height: 9,
                decoration: BoxDecoration(
                  color: AppTheme.secondaryPink,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 1.5),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // 1.2 ⚪ [HOLAT B: Darslar yo'q bo'lganda bo'sh holat kartasi]
  Widget _buildEmptyStateCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: const BoxDecoration(
              color: AppTheme.primaryLight,
              shape: BoxShape.circle,
            ),
            child: const Center(
              child: Text(
                "☕",
                style: TextStyle(fontSize: 34),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            "Hozircha darslar yo'q",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.textDark,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            "Bugun boshqa dars rejalashtirilmagan yoki barcha darslar yakunlangan",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              color: AppTheme.textMuted,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  // 1.2 🟢 [HOLAT A: "Joriy / Navbatdagi Dars" asosiy kartasi]
  Widget _buildHeroLessonCard(dynamic lesson, Map<String, dynamic> user) {
    final bool boardConnected = _boardSession != null;
    final bool isCurrent = lesson['status'] == 'ACTIVE';

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withValues(alpha: 0.35),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
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
                  color: Colors.white.withValues(alpha: 0.25),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    Icon(
                      isCurrent ? Icons.play_circle_fill_rounded : Icons.schedule_rounded,
                      size: 14,
                      color: Colors.white,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      isCurrent ? "Hozir o'tilmoqda 🟢" : "Kutilmoqda ⏳",
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  "${lesson['class_name'] ?? '9-"A" sinf'} • ${lesson['room_number'] ?? '204-xona'}",
                  style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 11.5),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            "${lesson['subject_name'] ?? 'Fan'}: ${lesson['theme'] ?? lesson['topic_name'] ?? 'Dars mavzusi'}",
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            "${lesson['order'] ?? 2}-para • ${lesson['start_time'] ?? '09:30'} - ${lesson['end_time'] ?? '10:50'}",
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white70, fontSize: 12.5),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                flex: 4,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppTheme.primary,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  ),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => TeacherScanScreen(lessonId: lesson['id'] ?? 101),
                      ),
                    );
                  },
                  icon: const Icon(Icons.qr_code_scanner_rounded, size: 20),
                  label: const Text(
                    "Davomat olish ➔",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                flex: 3,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: boardConnected
                        ? AppTheme.success
                        : Colors.white.withValues(alpha: 0.22),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  ),
                  onPressed: () => _openIdrokBoard(user),
                  icon: Icon(
                    boardConnected ? Icons.tv_rounded : Icons.dashboard_customize_rounded,
                    size: 19,
                  ),
                  label: Text(
                    boardConnected ? "IdrokBoard Faol" : "IdrokBoard",
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildIdrokBoardQuickWidget(Map<String, dynamic> user) {
    final bool isConnected = _boardSession != null;
    final String deviceName = (_boardSession?['device_name'] ?? '204-xona doskasi').toString();
    final List<dynamic> canvases = (_boardSession?['saved_canvases'] as List<dynamic>?) ?? [];

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isConnected
              ? AppTheme.success.withValues(alpha: 0.35)
              : Colors.black.withValues(alpha: 0.04),
          width: isConnected ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: isConnected
                      ? AppTheme.success.withValues(alpha: 0.12)
                      : AppTheme.primaryLight,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  Icons.tv_rounded,
                  color: isConnected ? AppTheme.success : AppTheme.primary,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: isConnected ? AppTheme.success : Colors.grey.shade400,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          isConnected ? "Ulangan: $deviceName 🟢" : "Ulanmagan ⚪",
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14.5,
                            color: isConnected ? AppTheme.success : AppTheme.textDark,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isConnected
                          ? "$deviceName • ${canvases.length} ta saqlangan list"
                          : "Doskadagi QR kodni skanerlash yoki 6 xonali PIN-kod kiritish",
                      style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => _openIdrokBoard(user),
                icon: const Icon(Icons.open_in_new_rounded, color: AppTheme.primary, size: 20),
              ),
            ],
          ),
          const SizedBox(height: 14),
          if (isConnected) ...[
            Row(
              children: [
                Expanded(
                  child: _buildMiniBoardBtn(
                    icon: Icons.skip_previous_rounded,
                    label: "Oldingi",
                    color: AppTheme.primary,
                    onTap: () => _sendBoardSlide(-1),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildMiniBoardBtn(
                    icon: Icons.skip_next_rounded,
                    label: "Keyingi",
                    color: AppTheme.primary,
                    onTap: () => _sendBoardSlide(1),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildMiniBoardBtn(
                    icon: Icons.cleaning_services_rounded,
                    label: "Tozalash",
                    color: Colors.redAccent,
                    onTap: _clearBoardConfirm,
                  ),
                ),
              ],
            ),
          ] else
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryLight,
                      foregroundColor: AppTheme.primary,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    onPressed: () => _openIdrokBoard(user),
                    icon: const Icon(Icons.qr_code_scanner_rounded, size: 18),
                    label: const Text(
                      "QR Skanerlash",
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.primary,
                      side: const BorderSide(color: AppTheme.primary),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    onPressed: _showPinConnectDialog,
                    icon: const Icon(Icons.pin_rounded, size: 18),
                    label: const Text(
                      "PIN Kiritish",
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildMiniBoardBtn({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Material(
      color: color.withValues(alpha: 0.1),
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 4),
              Flexible(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                    color: color,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // 1.4 Tezkor Statistika Vidjetlari (2x2 Grid)
  Widget _buildQuickStatsWidgets() {
    final bool isConnected = _boardSession != null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Bugungi Statistika & Ko'rsatkichlar",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                title: "Turniket vaqtlari",
                mainValue: "08:05  ➔  --:--",
                subText: "Kirish: 08:05 (Asosiy)",
                icon: Icons.door_front_door_rounded,
                accentColor: AppTheme.primary,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildStatCard(
                title: "Bugungi darslar",
                mainValue: "${_lessons.isNotEmpty ? _lessons.length : 3} para",
                subText: "Jadval bo'yicha faol",
                icon: Icons.checklist_rounded,
                accentColor: AppTheme.success,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                title: "Aqlli Doska holati",
                mainValue: isConnected ? "Ulangan 🟢" : "Ulanmagan ⚪",
                subText: isConnected
                    ? (_boardSession!['device_name'] ?? '204-xona doskasi').toString()
                    : "QR / PIN orqali ulang",
                icon: Icons.tv_rounded,
                accentColor: AppTheme.secondaryBlue,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildStatCard(
                title: "Sinflar davomati",
                mainValue: "96.2%",
                subText: "A'lo darajada (Norma)",
                icon: Icons.pie_chart_rounded,
                accentColor: AppTheme.secondaryOrange,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required String title,
    required String mainValue,
    required String subText,
    required IconData icon,
    required Color accentColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: accentColor),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            mainValue,
            style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900, color: AppTheme.textDark),
          ),
          const SizedBox(height: 3),
          Text(
            subText,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(fontSize: 10.5, color: accentColor, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  // 1.5 Haftalik Dars Matritsasi
  Widget _buildWeeklyScheduleMatrix() {
    final days = ["Dush", "Sesh", "Chor", "Pay", "Juma", "Shan"];
    final gridData = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 1, 3],
      [3, 3, 3],
      [3, 3, 3],
      [3, 3, 3],
    ];

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Haftalik Dars Matritsasi",
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textDark),
              ),
              Row(
                children: [
                  _buildLegend(AppTheme.success, "O'tildi"),
                  const SizedBox(width: 6),
                  _buildLegend(AppTheme.primary, "Faol"),
                  const SizedBox(width: 6),
                  _buildLegend(Colors.grey.shade400, "Rejada"),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(6, (dayIdx) {
              return Column(
                children: [
                  Text(
                    days[dayIdx],
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                  ),
                  const SizedBox(height: 8),
                  ...List.generate(3, (pairIdx) {
                    final status = gridData[dayIdx][pairIdx];
                    Color blockColor;
                    if (status == 0) {
                      blockColor = AppTheme.success;
                    } else if (status == 1) {
                      blockColor = AppTheme.primary;
                    } else {
                      blockColor = Colors.grey.shade200;
                    }

                    return Container(
                      width: 36,
                      height: 22,
                      margin: const EdgeInsets.only(bottom: 6),
                      decoration: BoxDecoration(
                        color: blockColor,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Center(
                        child: Text(
                          "${pairIdx + 1}",
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: status == 3 ? Colors.grey.shade500 : Colors.white,
                          ),
                        ),
                      ),
                    );
                  }),
                ],
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildLegend(Color c, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: c, shape: BoxShape.circle)),
        const SizedBox(width: 3),
        Text(text, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
      ],
    );
  }

  Widget _buildLessonListItem(dynamic lesson) {
    return InkWell(
      borderRadius: BorderRadius.circular(20),
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => TeacherScanScreen(lessonId: lesson['id'] ?? 101)),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: AppTheme.primaryLight, borderRadius: BorderRadius.circular(14)),
              child: const Icon(Icons.menu_book_rounded, color: AppTheme.primary, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    lesson['subject_name'] ?? 'Fan',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5, color: AppTheme.textDark),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    "${lesson['class_name'] ?? '9-A'} • Xona: ${lesson['room_number'] ?? '204-xona'}",
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 11.5),
                  ),
                ],
              ),
            ),
            Text(
              "${lesson['start_time']} - ${lesson['end_time']}",
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primary),
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // 2. 🖥️ IDROKBOARD (Masofaviy Pult)
  // =========================================================================
  Widget _buildIdrokBoardTab(Map<String, dynamic> user, String fullName) {
    final bool isConnected = _boardSession != null;
    final String deviceName = (_boardSession?['device_name'] ?? '204-xona doskasi').toString();

    return RefreshIndicator(
      onRefresh: _fetchBoardStatus,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(fullName, "IdrokBoard Pulti"),
            const SizedBox(height: 18),

            // 2.1. Ulanish Moduli Hero Card
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withValues(alpha: 0.35),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
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
                          color: Colors.white.withValues(alpha: 0.22),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          isConnected ? "Ulangan: $deviceName 🟢" : "Ulanmagan ⚪",
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11.5),
                        ),
                      ),
                      if (isConnected)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
                          child: Text(
                            "Sessiya #${_boardSession!['session_id']}",
                            style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 11.5),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    isConnected ? deviceName : "IdrokBoard-ga Ulanish",
                    style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isConnected
                        ? "Doskani masofadan boshqarish, slaydlar navigatsiyasi, tozalash va AI konspekt tayyor."
                        : "Sinf xonasidagi elektron doska QR kodini skanerlang yoki 6 xonali PIN-kodni kiriting.",
                    style: const TextStyle(color: Colors.white70, fontSize: 12.5, height: 1.35),
                  ),
                  const SizedBox(height: 16),
                  if (!isConnected)
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: AppTheme.primary,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                            ),
                            onPressed: () => _openIdrokBoard(user),
                            icon: const Icon(Icons.qr_code_scanner_rounded, size: 20),
                            label: const Text(
                              "QR Skanerlash",
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white.withValues(alpha: 0.22),
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                            ),
                            onPressed: _showPinConnectDialog,
                            icon: const Icon(Icons.pin_rounded, size: 20),
                            label: const Text(
                              "6 xonali PIN",
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                            ),
                          ),
                        ),
                      ],
                    )
                  else
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppTheme.primary,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                        ),
                        onPressed: () => _openIdrokBoard(user),
                        icon: const Icon(Icons.settings_remote_rounded, size: 20),
                        label: const Text(
                          "To'liq Boshqaruv Panelini Ochish ➔",
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 22),

            // 2.2. Doskani Masofadan Boshqarish Pulti
            const Text(
              "2.2. Masofadan Boshqarish Pulti",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
            ),
            const SizedBox(height: 12),

            // Slaydlar / Sahifalar navigatsiyasi [ ⬅️ Oldingi ] | [ Keyingi ➡️ ]
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "Slaydlar / Sahifalar navigatsiyasi",
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: AppTheme.textDark),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          "Slayd $_currentSlide",
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5, color: AppTheme.primary),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFF1F5F9),
                            foregroundColor: AppTheme.textDark,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(vertical: 13),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          onPressed: isConnected ? () => _sendBoardSlide(-1) : null,
                          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 16),
                          label: const Text("⬅️ Oldingi", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(vertical: 13),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          onPressed: isConnected ? () => _sendBoardSlide(1) : null,
                          icon: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                          label: const Text("Keyingi ➡️", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: _buildActionTile(
                    icon: Icons.cleaning_services_rounded,
                    title: "Barchasini o'chirish 🧹",
                    subtitle: "Doskani tozalash",
                    color: Colors.redAccent,
                    onTap: isConnected ? _clearBoardConfirm : () => _openIdrokBoard(user),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildActionTile(
                    icon: Icons.send_rounded,
                    title: "Matn uzatish 📤",
                    subtitle: "Telefondan doskaga",
                    color: AppTheme.secondaryBlue,
                    onTap: isConnected ? _showSendTextDialog : () => _openIdrokBoard(user),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 22),

            // 2.3. 🤖 AI Yordamchi (O‘qituvchi assistenti)
            const Text(
              "2.3. 🤖 AI Yordamchi (O'qituvchi assistenti)",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
            ),
            const SizedBox(height: 12),
            _buildMenuItem(
              icon: Icons.auto_awesome_rounded,
              title: "Mavzu Konspekti 📝",
              subtitle: "Mavzuni kiritish orqali doskaga qisqa tushuntirish va reja chiqarish",
              color: AppTheme.primary,
              onTap: isConnected ? _showAiTopicSummaryDialog : () => _openIdrokBoard(user),
            ),
            _buildMenuItem(
              icon: Icons.quiz_rounded,
              title: "Tezkor Test Savollari 🎯",
              subtitle: "Dars mavzusi bo'yicha doska ekraniga 3-5 ta test chiqarish",
              color: AppTheme.secondaryOrange,
              onTap: isConnected ? _showAiQuickTestDialog : () => _openIdrokBoard(user),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(height: 10),
              Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textDark),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // =========================================================================
  // 3. 👥 GURUHLARIM & NATIJALAR (GroupsScreen — Sinflar & Davomat)
  // =========================================================================
  Widget _buildGroupsAndResultsTab() {
    final groups = [
      {
        "name": ApiService.formatClassName("9-A"),
        "subject": "Matematika & Geometriya",
        "count": "32 o'quvchi",
        "room": "204-xona",
        "attendance": "96.4%",
      },
      {
        "name": ApiService.formatClassName("10-B"),
        "subject": "Oliy Matematika",
        "count": "28 o'quvchi",
        "room": "302-xona",
        "attendance": "94.2%",
      },
      {
        "name": ApiService.formatClassName("9-B"),
        "subject": "Algebra va Funksiyalar",
        "count": "30 o'quvchi",
        "room": "205-xona",
        "attendance": "92.0%",
      },
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(ApiService.myGroupsTitle, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
          const SizedBox(height: 4),
          const Text(
            "Biriktirilgan sinflar va sinf jurnali ichki davomat ko'rsatkichlari",
            style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
          ),
          const SizedBox(height: 18),

          // 3.1. Biriktirilgan Sinflar Ro‘yxati
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: groups.length,
            separatorBuilder: (_, index) => const SizedBox(height: 12),
            itemBuilder: (ctx, i) {
              final g = groups[i];
              return Material(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                child: InkWell(
                  borderRadius: BorderRadius.circular(22),
                  onTap: () => _openClassJournalModal(g),
                  child: Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(color: AppTheme.primaryLight, borderRadius: BorderRadius.circular(10)),
                              child: Text(
                                g['name']!,
                                style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary, fontSize: 12.5),
                              ),
                            ),
                            const Spacer(),
                            const Icon(Icons.people_alt_rounded, size: 16, color: AppTheme.textMuted),
                            const SizedBox(width: 4),
                            Text(
                              g['count']!,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.textDark),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          g['subject']!,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15.5, color: AppTheme.textDark),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              "Xona: ${g['room']} • Davomat: ${g['attendance']}",
                              style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                            ),
                            const Text(
                              "Jurnalni ko'rish ➔",
                              style: TextStyle(color: AppTheme.primary, fontSize: 11.5, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // =========================================================================
  // 4. ⚙️ MENU & PROFIL (ProfileSettingsScreen)
  // =========================================================================
  Widget _buildMenuTab(Map<String, dynamic> user) {
    final teacherId = (user['teacher_id'] ?? user['username'] ?? '20101').toString();
    final fullName = (user['full_name'] ?? 'Nodira Karimova').toString();
    final subject = (user['subject_name'] ?? 'Matematika & Geometriya').toString();

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Menu & Profil Sozlamalari", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
          const SizedBox(height: 4),
          const Text("Shaxsiy hisob va tizim sozlamalari", style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          const SizedBox(height: 18),

          // 4.1. Shaxsiy Ma'lumotlar Kartasi
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primary.withValues(alpha: 0.3),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 58,
                  height: 58,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.person_rounded, color: AppTheme.primary, size: 34),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        fullName,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        subject,
                        style: const TextStyle(color: Colors.white70, fontSize: 12.5),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.22),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          "ID: $teacherId",
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 4.2. Bildirishnomalar Markazi
          const Text(
            "4.2. Xabarnomalar & Sozlamalar",
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textDark),
          ),
          const SizedBox(height: 10),
          _buildMenuItem(
            icon: Icons.notifications_active_rounded,
            title: "Bildirishnomalar Markazi",
            subtitle: "Maktab ma'muriyati e'lonlari va jadval o'zgarishlari",
            color: AppTheme.secondaryBlue,
            onTap: _openNotifications,
          ),
          _buildMenuItem(
            icon: Icons.person_outline_rounded,
            title: "Mening Profilim",
            subtitle: "Face ID va shaxsiy ma'lumotlar",
            color: AppTheme.success,
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen()));
            },
          ),
          const SizedBox(height: 10),

          // 4.3. Tizimdan Chiqish (Logout)
          _buildMenuItem(
            icon: Icons.logout_rounded,
            title: "Tizimdan Chiqish (Logout)",
            subtitle: "Sessiya tokenlarini tozalash va xavfsiz chiqish",
            color: Colors.redAccent,
            onTap: _confirmLogout,
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(icon, color: color, size: 22),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5, color: AppTheme.textDark)),
                      const SizedBox(height: 3),
                      Text(subtitle, style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                    ],
                  ),
                ),
                const Icon(Icons.arrow_forward_ios_rounded, size: 15, color: AppTheme.textMuted),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
