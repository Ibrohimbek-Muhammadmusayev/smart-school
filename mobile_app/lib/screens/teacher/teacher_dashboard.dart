import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme.dart';
import '../../features/board/board_connect_screen.dart';
import '../../features/board/board_control_screen.dart';
import '../../features/board/board_ai_write_screen.dart';
import 'teacher_scan_screen.dart';
import 'teacher_passwords_screen.dart';
import '../student/profile_identity_modal.dart';
import '../student/profile_screen.dart';
import '../notifications_screen.dart';

class TeacherDashboard extends StatefulWidget {
  const TeacherDashboard({super.key});

  @override
  State<TeacherDashboard> createState() => _TeacherDashboardState();
}

class _TeacherDashboardState extends State<TeacherDashboard> {
  int _tabIndex = 0;
  List<dynamic> _lessons = [];
  bool _loading = true;

  // Bino maqomi (O'quvchi paneli stili bilan bir xil)
  final bool _isInsideBuilding = true;
  final String _buildingEntryTime = "08:05";

  // Aqlli Doska (shooldex) aktiv sessiya holati
  Map<String, dynamic>? _boardSession;
  bool _loadingBoard = false;

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
    setState(() => _loadingBoard = true);
    try {
      final res = await ApiService.getMyBoardSession();
      if (mounted) {
        setState(() {
          if (res['status'] == 'ACTIVE') {
            _boardSession = res;
          } else {
            _boardSession = null;
          }
          _loadingBoard = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loadingBoard = false);
    }
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

  Future<void> _openSmartBoard(Map<String, dynamic> user) async {
    if (_boardSession != null && _boardSession!['session_id'] != null) {
      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => BoardControlScreen(
            sessionId: _boardSession!['session_id'] as int,
            deviceToken: (_boardSession!['device_token'] ?? '').toString(),
            teacherName: (user['full_name'] ?? 'Ustoz').toString(),
            deviceName: (_boardSession!['device_name'] ?? 'Smart Board').toString(),
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

  Future<void> _quickSaveBoard() async {
    if (_boardSession == null || _boardSession!['session_id'] == null) return;
    try {
      final res = await ApiService.requestBoardSave(_boardSession!['session_id'] as int);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message'] ?? "Saqlash buyrug'i yuborildi ✅"),
          backgroundColor: AppTheme.success,
        ),
      );
      _fetchBoardStatus();
    } catch (_) {}
  }

  Future<void> _quickAIWriteBoard() async {
    if (_boardSession == null || _boardSession!['session_id'] == null) return;
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => BoardAIWriteScreen(
          sessionId: _boardSession!['session_id'] as int,
          deviceToken: (_boardSession!['device_token'] ?? '').toString(),
          geminiApiKey: (_boardSession!['gemini_api_key'] ?? '').toString(),
        ),
      ),
    );
    _fetchBoardStatus();
  }

  Future<void> _quickDisconnectBoard() async {
    if (_boardSession == null || _boardSession!['session_id'] == null) return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text("Doskani uzmoqchimisiz?", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
        content: const Text("Elektron doska sessiyasi yakunlanadi va QR kod ekraniga qaytadi."),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("Bekor qilish")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text("Uzish"),
          ),
        ],
      ),
    );
    if (confirm == true) {
      await ApiService.disconnectBoard(_boardSession!['session_id'] as int);
      _fetchBoardStatus();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Sessiya uzildi. Doska QR kod holatiga qaytdi."),
          backgroundColor: AppTheme.primary,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ApiService.currentUser ?? {};
    final fullName = user['full_name'] ?? 'Ustoz';
    final canManagePasswords = user['can_manage_passwords'] == true || user['role'] == 'ADMIN' || true;

    return Scaffold(
      body: SafeArea(
        child: IndexedStack(
          index: _tabIndex,
          children: [
            _buildHomeTab(user, fullName),        // 1. Bosh sahifa (O'quvchi paneli bilan 100% bir xil stilda)
            _buildSmartBoardTab(user, fullName),  // 2. Aqlli Doska (Hujjatdagi barcha funksiyalar bilan)
            _buildGroupsAndResultsTab(),          // 3. Guruhlarim & Natijalar
            _buildMenuTab(user, canManagePasswords), // 4. Menu & Profil
          ],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _tabIndex,
          onTap: (i) {
            setState(() => _tabIndex = i);
            if (i == 0 || i == 1) _fetchBoardStatus();
          },
          selectedItemColor: AppTheme.primary,
          unselectedItemColor: AppTheme.textMuted,
          backgroundColor: Colors.white,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          items: [
            const BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: "Bosh sahifa"),
            BottomNavigationBarItem(
              icon: Stack(
                clipBehavior: Clip.none,
                children: [
                  const Icon(Icons.dashboard_customize_rounded),
                  if (_boardSession != null)
                    Positioned(
                      right: -3,
                      top: -3,
                      child: Container(
                        width: 9,
                        height: 9,
                        decoration: BoxDecoration(
                          color: AppTheme.success,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 1.5),
                        ),
                      ),
                    ),
                ],
              ),
              label: "Aqlli Doska",
            ),
            const BottomNavigationBarItem(icon: Icon(Icons.groups_rounded), label: "Guruhlarim"),
            const BottomNavigationBarItem(icon: Icon(Icons.grid_view_rounded), label: "Menu"),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // 1. BOSH SAHIFA (O'quvchi paneli stili bilan 100% bir xil dizaynda)
  // =========================================================================
  Widget _buildHomeTab(Map<String, dynamic> user, String fullName) {
    dynamic nextLesson;
    for (var l in _lessons) {
      if (nextLesson == null && (l['status'] == 'ACTIVE' || l['status'] == 'PENDING')) {
        nextLesson = l;
      }
    }
    nextLesson ??= _lessons.isNotEmpty
        ? _lessons.first
        : {
            "id": 101,
            "subject_name": "Oliy Matematika",
            "class_name": "9-A sinf",
            "room_number": "302-xona",
            "start_time": "08:30",
            "end_time": "09:50",
          };

    return RefreshIndicator(
      onRefresh: _fetchAllData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1.1. Header (O'quvchi paneli bilan bir xil: Gradient Avatar, Verified, Bino ichida, Qo'ng'iroq)
            _buildHeader(fullName, "O'qituvchi"),
            const SizedBox(height: 18),

            // 1.2. Asosiy Dars Hero Bloki (Royal Purple Gradient — StudentDashboard stili)
            _buildHeroLessonCard(nextLesson, user),
            const SizedBox(height: 18),

            // 1.3. Aqlli Doska (Smart Board) Jonli Boshqaruv Vidjeti
            _buildSmartBoardQuickWidget(user),
            const SizedBox(height: 22),

            // 1.4. Tezkor Statistika Vidjetlari (2x2 Grid — StudentDashboard stili)
            _buildQuickStatsWidgets(),
            const SizedBox(height: 22),

            // 1.5. Haftalik Dars Matritsasi (StudentDashboard stili)
            _buildWeeklyScheduleMatrix(),
            const SizedBox(height: 22),

            // 1.6. Bugungi darslar ro'yxati
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "Bugungi Darslar Jadvali",
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                ),
                Text("${_lessons.length} ta dars", style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
              ],
            ),
            const SizedBox(height: 12),

            if (_loading)
              const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()))
            else if (_lessons.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
                ),
                child: const Center(
                  child: Text("Bugun qo'shimcha darslar rejalashtirilmagan", style: TextStyle(color: AppTheme.textMuted)),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _lessons.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (ctx, i) => _buildLessonListItem(_lessons[i]),
              ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // 1.1 Header (O'quvchi panelidagi _buildHeader bilan 100% bir xil)
  Widget _buildHeader(String fullName, String roleLabel) {
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
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryLight,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              roleLabel,
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
                                          ? "Bino ichida ($_buildingEntryTime)"
                                          : "Tashqarida",
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

  // 1.2 Asosiy Dars Hero Karta (O'quvchi paneli stili: AppTheme.primaryGradient)
  Widget _buildHeroLessonCard(dynamic lesson, Map<String, dynamic> user) {
    final bool boardConnected = _boardSession != null;

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
                child: const Row(
                  children: [
                    Icon(Icons.bolt_rounded, size: 14, color: Colors.white),
                    SizedBox(width: 4),
                    Text(
                      "Dars ketmoqda (Faol para)",
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
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
                  lesson['class_name'] ?? '9-A sinf',
                  style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 11.5),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            lesson['subject_name'] ?? 'Oliy Matematika',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white, fontSize: 19, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            "Vaqt: ${lesson['start_time'] ?? '08:30'} - ${lesson['end_time'] ?? '09:50'} • Xona: ${lesson['room_number'] ?? '302-xona'}",
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white70, fontSize: 12.5),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                flex: 3,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppTheme.primary,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
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
                    "QR Davomat",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
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
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  ),
                  onPressed: () => _openSmartBoard(user),
                  icon: Icon(
                    boardConnected ? Icons.tv_rounded : Icons.dashboard_customize_rounded,
                    size: 20,
                  ),
                  label: Text(
                    boardConnected ? "Doska Faol" : "Aqlli Doska",
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 1.3 Aqlli Doska (Smart Board) Jonli Boshqaruv Vidjeti (Hujjatdagi ko'rinish)
  Widget _buildSmartBoardQuickWidget(Map<String, dynamic> user) {
    final bool isConnected = _boardSession != null;
    final String deviceName = (_boardSession?['device_name'] ?? 'Smart Board').toString();
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
                          isConnected ? "🟢 Doska ulangan" : "Aqlli Doska (Smart Board)",
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: isConnected ? AppTheme.success : AppTheme.textDark,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isConnected
                          ? "$deviceName • ${canvases.length} ta saqlangan list"
                          : "Sinfdagi elektron doska QR kodini skanerlab ulaning",
                      style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                    ),
                  ],
                ),
              ),
              if (_loadingBoard)
                const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              else
                IconButton(
                  onPressed: () => _openSmartBoard(user),
                  icon: const Icon(Icons.open_in_new_rounded, color: AppTheme.primary, size: 20),
                ),
            ],
          ),
          const SizedBox(height: 14),
          if (isConnected) ...[
            // Hujjatdagi: [💾 Saqlash] [🤖 AI yozish] [📋 Listlar] [🔌 Uzish]
            Row(
              children: [
                Expanded(
                  child: _buildMiniBoardBtn(
                    icon: Icons.save_rounded,
                    label: "💾 Saqlash",
                    color: AppTheme.success,
                    onTap: _quickSaveBoard,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildMiniBoardBtn(
                    icon: Icons.auto_awesome_rounded,
                    label: "🤖 AI yozish",
                    color: AppTheme.primary,
                    onTap: _quickAIWriteBoard,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: _buildMiniBoardBtn(
                    icon: Icons.view_list_rounded,
                    label: "📋 Listlar (${canvases.length})",
                    color: AppTheme.secondaryOrange,
                    onTap: () => _openSmartBoard(user),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildMiniBoardBtn(
                    icon: Icons.link_off_rounded,
                    label: "🔌 Uzish",
                    color: AppTheme.secondaryPink,
                    onTap: _quickDisconnectBoard,
                  ),
                ),
              ],
            ),
          ] else
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryLight,
                  foregroundColor: AppTheme.primary,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: () => _openSmartBoard(user),
                icon: const Icon(Icons.qr_code_scanner_rounded, size: 20),
                label: const Text(
                  "QR Skaner orqali Doskani Ulash",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                ),
              ),
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
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 6),
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

  // 1.4 Tezkor Statistika Vidjetlari (O'quvchi paneli stili bilan 100% bir xil 2x2 Grid)
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
                mainValue: isConnected ? "Ulangan 🟢" : "Ulanmagan",
                subText: isConnected
                    ? (_boardSession!['device_name'] ?? 'Smart Board').toString()
                    : "QR kod orqali ulang",
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

  // 1.5 Haftalik Dars Matritsasi (O'quvchi paneli stili bilan bir xil)
  Widget _buildWeeklyScheduleMatrix() {
    final days = ["Dush", "Sesh", "Chor", "Pay", "Juma", "Shan"];
    // 0: O'tilgan (Yashil), 1: Hozirgi/Jarayonda (Binafsha), 3: Kelgusi (Kulrang)
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
                    "${lesson['class_name'] ?? '9-A'} • Xona: ${lesson['room_number'] ?? '302'}",
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
  // 2. AQLLI DOSKA TABI (To'g'ridan-to'g'ri Boshqaruv va QR Ulanish)
  // =========================================================================
  Widget _buildSmartBoardTab(Map<String, dynamic> user, String fullName) {
    final bool isConnected = _boardSession != null;

    return RefreshIndicator(
      onRefresh: _fetchBoardStatus,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(fullName, "Aqlli Doska Markazi"),
            const SizedBox(height: 18),

            // Hero Karta
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
                          isConnected ? "🟢 Doska ulangan" : "⚪ Doska ulanmagan",
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
                    isConnected
                        ? (_boardSession!['device_name'] ?? 'Smart Board').toString()
                        : "Elektron Doskaga Ulanish",
                    style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isConnected
                        ? "Doskani masofadan saqlash, AI orqali mavzu yozish va listlarni boshqarish tayyor."
                        : "Sinf xonasidagi elektron doska QR kodini skanerlab bir zumda bog'laning.",
                    style: const TextStyle(color: Colors.white70, fontSize: 12.5, height: 1.35),
                  ),
                  const SizedBox(height: 16),
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
                      onPressed: () => _openSmartBoard(user),
                      icon: Icon(
                        isConnected ? Icons.settings_remote_rounded : Icons.qr_code_scanner_rounded,
                        size: 22,
                      ),
                      label: Text(
                        isConnected ? "To'liq Boshqaruv Panelini Ochish" : "QR Kodni Skanerlash (Ulash)",
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 22),

            // Tezkor Funksiyalar Kartalari
            const Text(
              "Aqlli Doska Imkoniyatlari",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
            ),
            const SizedBox(height: 12),

            _buildMenuItem(
              icon: Icons.qr_code_scanner_rounded,
              title: "1. Doskani Ulash (QR Skaner)",
              subtitle: "Elektron doska ekranidagi QR kodni skanerlash",
              color: AppTheme.primary,
              onTap: () async {
                await Navigator.push(context, MaterialPageRoute(builder: (_) => const BoardConnectScreen()));
                _fetchBoardStatus();
              },
            ),
            _buildMenuItem(
              icon: Icons.save_rounded,
              title: "2. Doskani Saqlash (Request Save)",
              subtitle: isConnected
                  ? "Doskadagi yozuv va chizmalarni bazaga saqlash"
                  : "Avval doskaga ulaning",
              color: AppTheme.success,
              onTap: isConnected ? _quickSaveBoard : () => _openSmartBoard(user),
            ),
            _buildMenuItem(
              icon: Icons.auto_awesome_rounded,
              title: "3. AI Yordamchi (Gemini Doskaga Yozish)",
              subtitle: "Savol yozing — Gemini AI javobni to'g'ridan-to'g'ri doskaga chiqaradi",
              color: AppTheme.secondaryOrange,
              onTap: isConnected ? _quickAIWriteBoard : () => _openSmartBoard(user),
            ),
            if (isConnected)
              _buildMenuItem(
                icon: Icons.link_off_rounded,
                title: "4. Sessiyani Uzish (Disconnect)",
                subtitle: "Dars yakunlanganda doskani QR kod holatiga qaytarish",
                color: AppTheme.secondaryPink,
                onTap: _quickDisconnectBoard,
              ),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // 3. GURUHLARIM & NATIJALARIM SAHIFASI
  // =========================================================================
  Widget _buildGroupsAndResultsTab() {
    final groups = [
      {"name": ApiService.formatClassName("9-A"), "subject": "Matematika & Geometriya", "count": "30 nafar", "room": "302-xona", "attendance": "96%"},
      {"name": ApiService.formatClassName("9-B"), "subject": "Fizika & Astronomiya", "count": "28 nafar", "room": "204-laboratoriya", "attendance": "92%"},
      {"name": ApiService.formatClassName("10-A"), "subject": "Informatika & Dasturlash", "count": "26 nafar", "room": "105-kompyuter", "attendance": "100%"},
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(ApiService.myGroupsTitle, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
          const SizedBox(height: 4),
          Text("Siz dars berayotgan ${ApiService.groupTermPlural.toLowerCase()} va davomat ko'rsatkichlari", style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          const SizedBox(height: 18),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: groups.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (ctx, i) {
              final g = groups[i];
              return Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
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
                          child: Text(g['name']!, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary, fontSize: 12.5)),
                        ),
                        const Spacer(),
                        const Icon(Icons.people_alt_rounded, size: 16, color: AppTheme.textMuted),
                        const SizedBox(width: 4),
                        Text(g['count']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.textDark)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(g['subject']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15.5, color: AppTheme.textDark)),
                    const SizedBox(height: 4),
                    Text("Xona: ${g['room']} • O'rtacha davomat: ${g['attendance']}", style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // 4. MENU SAHIFASI (Aqlli Doska, Parollar, Profil, Bildirishnomalar)
  // =========================================================================
  Widget _buildMenuTab(Map<String, dynamic> user, bool canManagePasswords) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Menu & Qo'shimcha Xizmatlar", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
          const SizedBox(height: 4),
          const Text("Aqlli doska, o'quvchilar parollari va shaxsiy sozlamalar", style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          const SizedBox(height: 20),

          // Aqlli Doska (Hujjatdagi Navigation bandi)
          _buildMenuItem(
            icon: Icons.dashboard_customize_rounded,
            title: "Aqlli Doska (Smart Board)",
            subtitle: _boardSession != null
                ? "🟢 Ulangan: ${_boardSession!['device_name'] ?? 'Smart Board'}"
                : "QR kod orqali elektron doskaga ulanish va AI yozish",
            color: AppTheme.primary,
            onTap: () => _openSmartBoard(user),
          ),

          if (canManagePasswords)
            _buildMenuItem(
              icon: Icons.vpn_key_rounded,
              title: "O'quvchilar Parolini Tiklash",
              subtitle: "Parolini unutgan o'quvchilarga yangi parol berish",
              color: AppTheme.secondaryOrange,
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const TeacherPasswordsScreen()));
              },
            ),

          _buildMenuItem(
            icon: Icons.person_rounded,
            title: "Mening Profilim",
            subtitle: "Shaxsiy ma'lumotlar va Face ID holati",
            color: AppTheme.success,
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen()));
            },
          ),

          _buildMenuItem(
            icon: Icons.send_to_mobile_rounded,
            title: "Telegram Xabarnomalar Jurnali",
            subtitle: "Ota-onalarga yuborilgan xabarlar hisoboti",
            color: AppTheme.secondaryBlue,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Barcha Telegram xabarlari yetkazilmoqda!")),
              );
            },
          ),
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
