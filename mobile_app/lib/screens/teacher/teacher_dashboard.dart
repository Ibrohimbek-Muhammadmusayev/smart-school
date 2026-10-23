import 'dart:async';
import 'package:flutter/services.dart';
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme.dart';
import '../../features/board/board_connect_screen.dart';
import '../../features/board/board_control_screen.dart';
import 'teacher_lesson_room_screen.dart';
import 'teacher_passwords_screen.dart';
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
  Map<String, dynamic>? _dashboardData;
  List<dynamic> _lessons = [];
  Map<String, dynamic> _stats = {};
  List<dynamic> _weeklyGrid = [];
  List<dynamic> _weeklySchedules = [];
  List<dynamic> _myGroups = [];
  bool _loading = true;

  // Haftalik dars jadvali uchun tanlangan kun (1: Dushanba ... 6: Shanba)
  int _selectedScheduleDay = (DateTime.now().weekday <= 6) ? DateTime.now().weekday : 1;

  // Bino maqomi (Turniket / Geofence)
  bool _isInsideBuilding = true;
  String _buildingEntryTime = "08:05";


  // Real-time timers
  Timer? _clockTicker;
  Timer? _backgroundSyncTimer;

  // Aqlli Doska (shooldex) aktiv sessiya holati
  Map<String, dynamic>? _boardSession;
  int _currentSlide = 1;

  @override
  void initState() {
    super.initState();
    final initialDay = (DateTime.now().weekday <= 6) ? DateTime.now().weekday : 1;
    _selectedScheduleDay = initialDay;

    _fetchDashboardSummary();
    _fetchBoardStatus();

    // Har 1 soniyada dars va taymerlarni yangilash
    _clockTicker = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) setState(() {});
    });

    // Har 20 soniyada serverdan real ma'lumotlarni sinxronlash
    _backgroundSyncTimer = Timer.periodic(const Duration(seconds: 20), (timer) {
      if (mounted) {
        _fetchDashboardSummary(silent: true);
        _fetchBoardStatus();
      }
    });
  }

  @override
  void dispose() {
    _clockTicker?.cancel();
    _backgroundSyncTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchDashboardSummary({bool silent = false}) async {
    if (!silent) setState(() => _loading = true);
    try {
      final summary = await ApiService.getTeacherDashboardSummary();
      if (summary != null && mounted) {
        setState(() {
          _dashboardData = summary;
          _lessons = summary['today_lessons'] ?? [];
          _stats = summary['stats'] ?? {};
          _weeklyGrid = summary['weekly_grid'] ?? [];
          _weeklySchedules = summary['weekly_schedules'] ?? [];
          _myGroups = summary['my_groups'] ?? [];

          if (summary['today_iso_weekday'] != null) {
            final tw = summary['today_iso_weekday'] as int;
            if (tw <= 6) {
              _selectedScheduleDay = tw;
            }
          }

          if (_stats['turnstile_entry'] != null && _stats['turnstile_entry'] != '--:--') {
            _buildingEntryTime = _stats['turnstile_entry'];
          }
          if (_stats['is_inside_building'] != null) {
            _isInsideBuilding = _stats['is_inside_building'] == true;
          }

          // Real-time profil ma'lumotlarini sinxronlash
          if (summary['teacher'] != null) {
            ApiService.currentUser ??= {};
            final tInfo = summary['teacher'] as Map<String, dynamic>;
            tInfo.forEach((k, v) {
              if (v != null) ApiService.currentUser![k] = v;
            });
          }
        });
      } else {
        final list = await ApiService.getTodayLessons();
        if (mounted) setState(() => _lessons = list);
      }
    } catch (_) {
    } finally {
      if (mounted && !silent) setState(() => _loading = false);
    }
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

  // Pull-to-refresh
  Future<void> _handleUserPullToRefresh() async {
    await _fetchDashboardSummary(silent: true);
    await _fetchBoardStatus();
    HapticFeedback.lightImpact();

    if (mounted) {
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
              SizedBox(width: 10),
              Text(
                "O'qituvchi jadvali va davomat yangilandi ✅",
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              ),
            ],
          ),
          backgroundColor: AppTheme.primary,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 2),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        ),
      );
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
      _fetchBoardStatus();
    } else {
      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => const BoardConnectScreen(),
        ),
      );
      _fetchBoardStatus();
    }
  }

  void _showPinConnectDialog() {
    final pinController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        title: const Text("Doska PIN-kodini kiriting"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              "Aqlli doska ekranidagi 6 xonali PIN-kodni kiriting:",
              style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: pinController,
              keyboardType: TextInputType.number,
              maxLength: 6,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 8),
              decoration: InputDecoration(
                counterText: "",
                hintText: "123456",
                filled: true,
                fillColor: const Color(0xFFF1F5F9),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Bekor qilish")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
            onPressed: () async {
              final pin = pinController.text.trim();
              if (pin.length >= 4) {
                Navigator.pop(ctx);
                final res = await ApiService.connectToBoard(pin);
                if (res['session_id'] != null) {
                  _fetchBoardStatus();
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text("Doskaga ulandi: ${res['device_name'] ?? 'IdrokBoard'} ✅"), backgroundColor: AppTheme.success),
                    );
                  }
                } else {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(res['detail'] ?? "PIN-kod noto'g'ri"), backgroundColor: Colors.red),
                    );
                  }
                }
              }
            },
            child: const Text("Ulanish"),
          ),
        ],
      ),
    );
  }

  void _sendBoardSlide(int delta) {
    setState(() {
      _currentSlide = (_currentSlide + delta).clamp(1, 99);
    });
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text("Slayd $_currentSlide ga o'tildi ➔"),
        duration: const Duration(seconds: 1),
        backgroundColor: AppTheme.primary,
      ),
    );
  }

  void _clearBoardConfirm() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text("Doskani tozalash 🧹"),
        content: const Text("Elektron doska ekranidagi barcha chizilgan elementlar o'chirilsinmi?"),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Yo'q")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Doska tozalandi 🧹"), backgroundColor: Colors.redAccent),
              );
            },
            child: const Text("Tozalash"),
          ),
        ],
      ),
    );
  }

  void _showSendTextDialog() {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        title: const Text("Doskaga Matn Uzatish 📤"),
        content: TextField(
          controller: ctrl,
          maxLines: 4,
          decoration: InputDecoration(
            hintText: "Mavzu rejasi, qoida yoki topshiriq...",
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Bekor qilish")),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Matn doska ekraniga yuborildi 📤"), backgroundColor: AppTheme.success),
              );
            },
            icon: const Icon(Icons.send_rounded, size: 16),
            label: const Text("Yuborish"),
          ),
        ],
      ),
    );
  }

  void _showAiTopicSummaryDialog() {
    final ctrl = TextEditingController(text: _lessons.isNotEmpty ? (_lessons.first['topic'] ?? '') : '');
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        title: const Text("Mavzu Konspekti (AI) 📝"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Google Gemini AI mavzuni qisqa reja va muhim qoidalar ko'rinishida doskaga chiqaradi.",
              style: TextStyle(color: AppTheme.textMuted, fontSize: 12.5),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: ctrl,
              decoration: InputDecoration(
                labelText: "Mavzu",
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Bekor qilish")),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("AI reja doskaga joylashtirildi 🤖"), backgroundColor: AppTheme.success),
              );
            },
            icon: const Icon(Icons.auto_awesome_rounded, size: 16),
            label: const Text("Doskaga Chiqarish"),
          ),
        ],
      ),
    );
  }

  void _showAiQuickTestDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        title: const Text("Tezkor Test Savollari (AI) 🎯"),
        content: const Text(
          "Dars mavzusi bo'yicha 3 ta interaktiv test savoli doska ekraniga chiqariladi va o'quvchilar javob bera oladi.",
          style: TextStyle(fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Bekor qilish")),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.secondaryOrange),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("3 ta test savoli doskaga chiqarildi 🎯"), backgroundColor: AppTheme.secondaryOrange),
              );
            },
            icon: const Icon(Icons.quiz_rounded, size: 16),
            label: const Text("Savollarni Chiqarish"),
          ),
        ],
      ),
    );
  }

  void _confirmLogout() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text("Tizimdan chiqish"),
        content: const Text("Haqiqatan ham hisobingizdan chiqmoqchimisiz?"),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Yo'q")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () {
              Navigator.pop(ctx);
              ApiService.logout();
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                (route) => false,
              );
            },
            child: const Text("Chiqish"),
          ),
        ],
      ),
    );
  }

  // Sinf jurnali modalini ochish (Haqiqiy o'quvchilar ro'yxati bilan)
  void _openClassJournalModal(Map<String, dynamic> group) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _ClassJournalBottomSheet(group: group),
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
            _buildHomeTab(user, fullName),       // 0. Bosh sahifa (Dashboard)
            _buildIdrokBoardTab(user, fullName), // 1. IdrokBoard (Masofaviy Pult)
            _buildGroupsAndResultsTab(),         // 2. Guruhlarim & Natijalar (Real Jurnal)
            _buildMenuTab(user),                 // 3. Menu & Profil Sozlamalari
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
          onTap: (index) {
            setState(() => _tabIndex = index);
            if (index == 0 || index == 1) _fetchBoardStatus();
            if (index == 0 || index == 2) _fetchDashboardSummary(silent: true);
          },
          selectedItemColor: AppTheme.primary,
          unselectedItemColor: AppTheme.textMuted,
          backgroundColor: Colors.white,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          selectedFontSize: 11.5,
          unselectedFontSize: 11,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold),
          items: [
            const BottomNavigationBarItem(
              icon: Icon(Icons.home_rounded),
              label: "Bosh sahifa",
            ),
            BottomNavigationBarItem(
              icon: Stack(
                clipBehavior: Clip.none,
                children: [
                  const Icon(Icons.tv_rounded),
                  if (_boardSession != null)
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
              label: "IdrokBoard",
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.groups_rounded),
              label: ApiService.myGroupsTitle,
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.grid_view_rounded),
              label: "Menu",
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
      onRefresh: _handleUserPullToRefresh,
      color: AppTheme.primary,
      backgroundColor: Colors.white,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1.1. Status & Joylashuv Kartasi (Header Widget)
            _buildHeader(fullName, "O'qituvchi", teacherId: teacherId),
            const SizedBox(height: 16),


            // 1.2. Darslar Dinamik Bloki
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
              const SizedBox(height: 20),

              // "Bugungi qolgan darslar" ro'yxati
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Bugungi Darslar Jadvali",
                    style: TextStyle(fontSize: 16.5, fontWeight: FontWeight.bold, color: AppTheme.textDark),
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
              // ⚪ [HOLAT B: Darslar yo‘q bo‘lganda]
              _buildEmptyStateCard(),
              const SizedBox(height: 20),
            ],

            // 1.3. IdrokBoard Jonli Boshqaruv Vidjeti
            _buildIdrokBoardQuickWidget(user),
            const SizedBox(height: 22),

            // 1.4. Tezkor Statistika Vidjetlari (Turniket, darslar, davomat)
            _buildQuickStatsWidgets(),
            const SizedBox(height: 22),

            // 1.5. Haftalik Dars Matritsasi
            _buildWeeklyScheduleMatrix(),
            const SizedBox(height: 22),

            // 1.6. Haftalik Dars Jadvali & Kunlar Tanlagichi
            _buildWeeklyScheduleViewer(),
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
                        color: AppTheme.primary.withOpacity(0.3),
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
                          Flexible(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                              decoration: BoxDecoration(
                                color: _isInsideBuilding
                                    ? AppTheme.success.withOpacity(0.12)
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


  // 1.2 ⚪ [Bo'sh holat kartasi]
  Widget _buildEmptyStateCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.black.withOpacity(0.05)),
      ),
      child: const Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text("☕", style: TextStyle(fontSize: 34)),
          SizedBox(height: 12),
          Text(
            "Hozircha darslar yo'q",
            style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppTheme.textDark),
          ),
          SizedBox(height: 6),
          Text(
            "Bugun boshqa dars rejalashtirilmagan yoki barcha darslar muvaffaqiyatli yakunlangan",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12.5, color: AppTheme.textMuted),
          ),
        ],
      ),
    );
  }

  // 1.2 🟢 [Joriy / Navbatdagi Dars Asosiy Kartasi]
  Widget _buildHeroLessonCard(dynamic lesson, Map<String, dynamic> user) {
    final bool boardConnected = _boardSession != null;
    final bool isCurrent = lesson['status'] == 'ACTIVE';
    final int lessonId = lesson['id'] ?? 101;
    final total = lesson['total_students'] ?? 30;
    final present = lesson['present_count'] ?? 0;

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withOpacity(0.35),
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
                  color: Colors.white.withOpacity(0.25),
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
                      isCurrent ? "Hozir o'tilmoqda 🟢" : "Navbatdagi dars ⏳",
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
                  "${lesson['class_name'] ?? '9-A sinf'} • ${lesson['room_number'] ?? '204-xona'}",
                  style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 11.5),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            "${lesson['subject_name'] ?? 'Fan'}: ${lesson['topic'] ?? lesson['theme'] ?? 'Dars mavzusi'}",
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Text(
                "${lesson['order'] ?? 1}-para • ${lesson['start_time']} - ${lesson['end_time']}",
                style: const TextStyle(color: Colors.white70, fontSize: 12.5),
              ),
              const SizedBox(width: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  "Davomat: $present/$total",
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
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
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  ),
                  onPressed: () async {
                    await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => TeacherLessonRoomScreen(lessonId: lessonId),
                      ),
                    );
                    _fetchDashboardSummary(silent: true);
                  },
                  icon: const Icon(Icons.meeting_room_rounded, size: 20),
                  label: const Text(
                    "Dars Xonasi & Davomat ➔",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5),
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
                        : Colors.white.withOpacity(0.22),
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
                    boardConnected ? "Doska Faol" : "IdrokBoard",
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 1.3 IdrokBoard Tezkor Vidjeti
  Widget _buildIdrokBoardQuickWidget(Map<String, dynamic> user) {
    final bool isConnected = _boardSession != null;
    final String deviceName = (_boardSession?['device_name'] ?? 'IdrokBoard Doskasi').toString();

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isConnected ? AppTheme.success.withOpacity(0.35) : Colors.black.withOpacity(0.04),
          width: isConnected ? 1.5 : 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: isConnected ? AppTheme.success.withOpacity(0.12) : AppTheme.primaryLight,
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
                          isConnected ? "Ulangan: $deviceName 🟢" : "IdrokBoard Ulanmagan ⚪",
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: isConnected ? AppTheme.success : AppTheme.textDark,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isConnected
                          ? "$deviceName • Masofadan boshqarish tayyor"
                          : "Doskadagi QR kodni skanerlang yoki PIN-kod kiriting",
                      style: const TextStyle(fontSize: 11.5, color: AppTheme.textMuted),
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
          const SizedBox(height: 12),
          if (isConnected)
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
            )
          else
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
                    label: const Text("QR Skanerlash", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
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
                    label: const Text("PIN Kiritish", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
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
      color: color.withOpacity(0.1),
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
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: color),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // 1.4 Tezkor Statistika Vidjetlari (Turniket, darslar, davomat)
  Widget _buildQuickStatsWidgets() {
    final bool isConnected = _boardSession != null;
    final String entryTime = _stats['turnstile_entry'] ?? '08:05';
    final String exitTime = _stats['turnstile_exit'] ?? '--:--';
    final String attRate = _stats['overall_attendance_rate'] ?? (_dashboardData?['attendance_rate']?.toString()) ?? '96%';
    final int todayLessonsCount = _stats['today_lessons_count'] ?? _lessons.length;
    final int completedLessons = _stats['today_completed_lessons'] ?? 0;

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
                mainValue: "$entryTime ➔ $exitTime",
                subText: "Kirish: $entryTime (Asosiy)",
                icon: Icons.door_front_door_rounded,
                accentColor: AppTheme.primary,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildStatCard(
                title: "Bugungi darslar",
                mainValue: "$completedLessons / $todayLessonsCount para",
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
                subText: isConnected ? (_boardSession!['device_name'] ?? '204-xona').toString() : "QR / PIN orqali ulang",
                icon: Icons.tv_rounded,
                accentColor: AppTheme.secondaryBlue,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildStatCard(
                title: "Sinflar davomati",
                mainValue: attRate,
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
        border: Border.all(color: Colors.black.withOpacity(0.04)),
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
    final gridData = _weeklyGrid.isNotEmpty
        ? _weeklyGrid
        : [
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
        border: Border.all(color: Colors.black.withOpacity(0.04)),
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
              final row = dayIdx < gridData.length ? (gridData[dayIdx] as List<dynamic>) : [3, 3, 3];
              return Column(
                children: [
                  Text(
                    days[dayIdx],
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: (dayIdx + 1) == DateTime.now().weekday ? AppTheme.primary : AppTheme.textMuted,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...List.generate(row.length, (pairIdx) {
                    final status = row[pairIdx];
                    Color blockColor;
                    if (status == 0) {
                      blockColor = AppTheme.success;
                    } else if (status == 1) {
                      blockColor = AppTheme.primary;
                    } else if (status == 2) {
                      blockColor = Colors.orange;
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

  // 1.6 Haftalik Dars Jadvali Viewer (Dushanba - Shanba tanlagichi bilan)
  Widget _buildWeeklyScheduleViewer() {
    final days = [
      {"num": 1, "name": "Dushanba", "short": "Dush"},
      {"num": 2, "name": "Seshanba", "short": "Sesh"},
      {"num": 3, "name": "Chorshanba", "short": "Chor"},
      {"num": 4, "name": "Payshanba", "short": "Pay"},
      {"num": 5, "name": "Juma", "short": "Juma"},
      {"num": 6, "name": "Shanba", "short": "Shan"},
    ];

    // Tanlangan kundagi darslar
    List<dynamic> selectedDayLessons = [];
    for (var ws in _weeklySchedules) {
      if (ws['day_of_week'] == _selectedScheduleDay) {
        selectedDayLessons = ws['lessons'] ?? [];
        break;
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              "Haftalik Dars Jadvali",
              style: TextStyle(fontSize: 16.5, fontWeight: FontWeight.bold, color: AppTheme.textDark),
            ),
            Text(
              "${days.firstWhere((d) => d['num'] == _selectedScheduleDay)['name']}",
              style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary, fontSize: 13),
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Kunlar selectori (Dush - Shanba)
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: days.map((d) {
            final isSel = d['num'] == _selectedScheduleDay;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 2),
                child: InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: () => setState(() => _selectedScheduleDay = d['num'] as int),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: isSel ? AppTheme.primary : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: isSel ? AppTheme.primary : Colors.black.withOpacity(0.04)),
                    ),
                    child: Center(
                      child: Text(
                        d['short'] as String,
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.bold,
                          color: isSel ? Colors.white : AppTheme.textDark,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 12),

        // Tanlangan kundagi darslar ro'yxati
        if (selectedDayLessons.isNotEmpty)
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: selectedDayLessons.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (ctx, i) {
              final sc = selectedDayLessons[i];
              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: Colors.black.withOpacity(0.04)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: AppTheme.primaryLight,
                      child: Text(
                        "${sc['order'] ?? sc['lesson_order'] ?? (i + 1)}",
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primary),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            sc['subject_name'] ?? 'Fan',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            "${sc['class_name'] ?? ''} • Xona: ${sc['room_number'] ?? sc['room'] ?? '101-xona'}",
                            style: const TextStyle(color: AppTheme.textMuted, fontSize: 11.5),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      sc['time'] ?? "${sc['start_time']} - ${sc['end_time']}",
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primary),
                    ),
                  ],
                ),
              );
            },
          )
        else
          Container(
            padding: const EdgeInsets.symmetric(vertical: 20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Center(
              child: Text(
                "Bu kunda darslar rejalashtirilmagan",
                style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildLessonListItem(dynamic lesson) {
    final int lessonId = lesson['id'] ?? 101;
    final int total = lesson['total_students'] ?? 30;
    final int present = lesson['present_count'] ?? 0;

    return InkWell(
      borderRadius: BorderRadius.circular(20),
      onTap: () async {
        await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => TeacherLessonRoomScreen(lessonId: lessonId),
          ),
        );
        _fetchDashboardSummary(silent: true);
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.black.withOpacity(0.04)),
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
                    "${lesson['class_name'] ?? '9-A'} • Xona: ${lesson['room_number'] ?? '204-xona'} • Davomat: $present/$total",
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 11.5),
                  ),
                ],
              ),
            ),
            Text(
              "${lesson['start_time']} - ${lesson['end_time']}",
              style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppTheme.primary),
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // 2. 🖥️ IDROKBOARD (Masofaviy Pult Tabi)
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

            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(color: AppTheme.primary.withOpacity(0.35), blurRadius: 20, offset: const Offset(0, 8)),
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
                          color: Colors.white.withOpacity(0.22),
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
                            label: const Text("QR Skanerlash", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white.withOpacity(0.22),
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                            ),
                            onPressed: _showPinConnectDialog,
                            icon: const Icon(Icons.pin_rounded, size: 20),
                            label: const Text("6 xonali PIN", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
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
                        label: const Text("To'liq Boshqaruv Panelini Ochish ➔", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 22),

            // Slaydlar / Sahifalar navigatsiyasi
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: Colors.black.withOpacity(0.04)),
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
                    title: "Doskani tozalash 🧹",
                    subtitle: "Barchasini o'chirish",
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

            // AI Yordamchi
            const Text(
              "🤖 AI Yordamchi (O'qituvchi assistenti)",
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
            border: Border.all(color: Colors.black.withOpacity(0.04)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
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
  // 3. 👥 GURUHLARIM & NATIJALAR (GroupsScreen — Real Baza Jurnali)
  // =========================================================================
  Widget _buildGroupsAndResultsTab() {
    return RefreshIndicator(
      onRefresh: () => _fetchDashboardSummary(silent: true),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
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

            if (_myGroups.isNotEmpty)
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _myGroups.length,
                separatorBuilder: (_, index) => const SizedBox(height: 12),
                itemBuilder: (ctx, i) {
                  final g = _myGroups[i];
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
                          border: Border.all(color: Colors.black.withOpacity(0.04)),
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
                                    g['name'] ?? '',
                                    style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary, fontSize: 12.5),
                                  ),
                                ),
                                if (g['is_advisor'] == true) ...[
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppTheme.success.withOpacity(0.12),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Text(
                                      "Sinf rahbari 🎓",
                                      style: TextStyle(color: AppTheme.success, fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ],
                                const Spacer(),
                                const Icon(Icons.people_alt_rounded, size: 16, color: AppTheme.textMuted),
                                const SizedBox(width: 4),
                                Text(
                                  "${g['students_count'] ?? g['count'] ?? 0} o'quvchi",
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.textDark),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              g['subject'] ?? 'Umumiy Fan',
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
              )
            else
              Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
                child: const Center(
                  child: Text(
                    "Biriktirilgan sinflar mavjud emas",
                    style: TextStyle(color: AppTheme.textMuted),
                  ),
                ),
              ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // 4. ⚙️ MENU & PROFIL (ProfileSettingsScreen)
  // =========================================================================
  Widget _buildMenuTab(Map<String, dynamic> user) {
    final teacherId = (user['teacher_id'] ?? user['username'] ?? '20101').toString();
    final fullName = (user['full_name'] ?? 'Ustoz').toString();
    final subject = (user['teacher_subject'] ?? user['subject_name'] ?? 'Matematika & IT').toString();

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Menu & Profil Sozlamalari", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
          const SizedBox(height: 4),
          const Text("Shaxsiy hisob va tizim sozlamalari", style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          const SizedBox(height: 18),

          // Shaxsiy Ma'lumotlar Kartasi
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primary.withOpacity(0.3),
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
                          color: Colors.white.withOpacity(0.22),
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

          // Parollar va hisoblar
          const Text(
            "Boshqaruv & Xavfsizlik",
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textDark),
          ),
          const SizedBox(height: 10),
          _buildMenuItem(
            icon: Icons.lock_reset_rounded,
            title: "O'quvchilar Parollarini Boshqarish",
            subtitle: "Unutilgan parollarni tiklash va yangi parol berish",
            color: AppTheme.primary,
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const Scaffold(
                body: SafeArea(child: TeacherPasswordsScreen()),
              )));
            },
          ),
          _buildMenuItem(
            icon: Icons.notifications_active_rounded,
            title: "Bildirishnomalar Markazi",
            subtitle: "Maktab ma'muriyati e'lonlari va jadval xabarlari",
            color: AppTheme.secondaryBlue,
            onTap: _openNotifications,
          ),
          _buildMenuItem(
            icon: Icons.person_outline_rounded,
            title: "Mening Profilim",
            subtitle: "Face ID va shaxsiy ma'lumotlarni tahrirlash",
            color: AppTheme.success,
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen()));
            },
          ),
          const SizedBox(height: 10),

          // Tizimdan Chiqish
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
              border: Border.all(color: Colors.black.withOpacity(0.04)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
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

// ===========================================================================
// SINF JURNALI BOTTOM SHEET (Real Baza bilan ulangan)
// ===========================================================================
class _ClassJournalBottomSheet extends StatefulWidget {
  final Map<String, dynamic> group;

  const _ClassJournalBottomSheet({required this.group});

  @override
  State<_ClassJournalBottomSheet> createState() => _ClassJournalBottomSheetState();
}

class _ClassJournalBottomSheetState extends State<_ClassJournalBottomSheet> {
  bool _loading = true;
  List<dynamic> _students = [];
  String _searchQuery = "";

  @override
  void initState() {
    super.initState();
    _fetchJournal();
  }

  Future<void> _fetchJournal() async {
    final classId = widget.group['id'] as int?;
    final res = await ApiService.getTeacherClassJournal(classId: classId);
    if (mounted) {
      setState(() {
        _students = res?['students'] ?? [];
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _students.where((s) {
      if (_searchQuery.isEmpty) return true;
      final name = (s['name'] ?? '').toString().toLowerCase();
      final id = (s['student_id'] ?? '').toString().toLowerCase();
      final q = _searchQuery.toLowerCase();
      return name.contains(q) || id.contains(q);
    }).toList();

    return Container(
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
              decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(10)),
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
                      "${widget.group['name']} Jurnali",
                      style: const TextStyle(fontSize: 19, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      "${widget.group['subject'] ?? 'Fan'} • ${widget.group['students_count'] ?? _students.length} o'quvchi",
                      style: const TextStyle(fontSize: 12.5, color: AppTheme.textMuted),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppTheme.success.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  "Davomat: ${widget.group['attendance'] ?? '96%'}",
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5, color: AppTheme.success),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Qidiruv maydoni
          TextField(
            onChanged: (val) => setState(() => _searchQuery = val),
            decoration: InputDecoration(
              hintText: "O'quvchini qidirish...",
              prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.textMuted),
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              contentPadding: const EdgeInsets.symmetric(vertical: 0),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.grey.shade200)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.grey.shade200)),
            ),
          ),
          const SizedBox(height: 12),

          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : filtered.isEmpty
                    ? const Center(child: Text("O'quvchilar topilmadi", style: TextStyle(color: AppTheme.textMuted)))
                    : ListView.separated(
                        itemCount: filtered.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (context, i) {
                          final s = filtered[i];
                          final statusType = s['status_type'];
                          Color badgeColor = AppTheme.success;
                          if (statusType == 'late') badgeColor = Colors.orange;
                          if (statusType == 'absent') badgeColor = Colors.redAccent;
                          if (statusType == 'pending') badgeColor = Colors.grey;

                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.black.withOpacity(0.04)),
                            ),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 18,
                                  backgroundColor: AppTheme.primaryLight,
                                  child: Text(
                                    (s['name'] ?? 'O').toString().substring(0, 1),
                                    style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        s['name'] ?? '',
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
                                              "ID: ${s['student_id'] ?? s['id']}",
                                              style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Colors.grey.shade700),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            "Oylik: ${s['attendance_rate'] ?? '96%'} • O'rtacha: ${s['average_grade'] ?? '5.0'}",
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
                                    color: badgeColor.withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    s['today_status'] ?? 'Kutilmoqda ⏳',
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
    );
  }
}
