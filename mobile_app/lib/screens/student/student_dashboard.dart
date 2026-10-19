import 'dart:async';
import 'package:flutter/services.dart';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../services/api_service.dart';
import '../../theme.dart';
import 'lesson_room_screen.dart';
import 'attendance_history_screen.dart';
import 'requests_center_screen.dart';
import 'profile_identity_modal.dart';
import 'profile_screen.dart';
import '../notifications_screen.dart';

class StudentDashboard extends StatefulWidget {
  const StudentDashboard({super.key});

  @override
  State<StudentDashboard> createState() => _StudentDashboardState();
}

class _StudentDashboardState extends State<StudentDashboard> {
  int _tabIndex = 0;
  Map<String, dynamic>? _dashboardData;
  List<dynamic> _lessons = [];
  Map<String, dynamic> _stats = {};
  List<dynamic> _weeklyGrid = [];
  bool _loading = true;
  int _selectedScheduleDay = (DateTime.now().weekday <= 6) ? DateTime.now().weekday : 1;
  late PageController _dayPageController;

  // Bino maqomi: true = "Bino ichida", false = "Tashqarida"
  bool _isInsideBuilding = true;
  String _buildingEntryTime = "08:05";

  // Agar null bo'lsa, dars jadvali va soat bo'yicha AVTOMATIK real-vaqt rejimida ishlaydi!
  // Agar 0, 1, 2, 3 bo'lsa, test sinovi override rejimida ishlaydi.
  int? _scenarioModeOverride;

  // Real-time timers
  Timer? _clockTicker;
  Timer? _backgroundSyncTimer;

  // Dinamik dars 45s QR token
  String _dynamicLessonQR = "LESSON_QR_INIT";
  int _qrTimerSeconds = 45;
  Timer? _qrTicker;
  bool _attendanceConfirmed = false;

  @override
  void initState() {
    super.initState();
    final initialDay = (DateTime.now().weekday <= 6) ? DateTime.now().weekday : 1;
    _selectedScheduleDay = initialDay;
    _dayPageController = PageController(initialPage: initialDay - 1);
    _fetchDashboardSummary();
    // Har 1 soniyada dars va tanaffus taymerlarini real vaqtda hisoblash
    _clockTicker = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) setState(() {});
    });
    // Har 20 soniyada fon rejimida serverdan ma'lumotlarni yangilash
    _backgroundSyncTimer = Timer.periodic(const Duration(seconds: 20), (timer) {
      if (mounted) _fetchDashboardSummary(silent: true);
    });
  }

  @override
  void dispose() {
    _dayPageController.dispose();
    _clockTicker?.cancel();
    _backgroundSyncTimer?.cancel();
    _qrTicker?.cancel();
    super.dispose();
  }

  Future<void> _fetchDashboardSummary({bool silent = false}) async {
    if (!silent) setState(() => _loading = true);
    try {
      final summary = await ApiService.getStudentDashboardSummary();
      if (summary != null) {
        setState(() {
          _dashboardData = summary;
          _lessons = summary['today_lessons'] ?? [];
          _stats = summary['stats'] ?? {};
          _weeklyGrid = summary['weekly_grid'] ?? [];
          if (summary['today_iso_weekday'] != null) {
            final tw = summary['today_iso_weekday'] as int;
            if (tw <= 6) {
              _selectedScheduleDay = tw;
            }
          }
          if (_stats['turnstile_entry'] != null && _stats['turnstile_entry'] != '--:--') {
            _buildingEntryTime = _stats['turnstile_entry'];
            _isInsideBuilding = (_stats['turnstile_exit'] == null || _stats['turnstile_exit'] == '--:--');
          }
          if (_lessons.any((l) => l['is_attended'] == true)) {
            _attendanceConfirmed = true;
          }

          // Real-time foydalanuvchi profilini sinxronlash
          if (summary['student'] != null) {
            ApiService.currentUser ??= {};
            final sInfo = summary['student'] as Map<String, dynamic>;
            if (sInfo['name'] != null) ApiService.currentUser!['full_name'] = sInfo['name'];
            if (sInfo['stars_count'] != null) ApiService.currentUser!['stars_count'] = sInfo['stars_count'];
            if (sInfo['student_id'] != null) ApiService.currentUser!['student_id'] = sInfo['student_id'];
          }
          if (summary['class_name'] != null && summary['class_name'].toString().isNotEmpty) {
            ApiService.currentUser ??= {};
            ApiService.currentUser!['class_name'] = summary['class_name'];
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

  // Sahifani tepadan pastga tortib yangilash (Pull-to-refresh)
  Future<void> _handleUserPullToRefresh() async {
    // 1. Agar sinov override qilingan bo'lsa, real-vaqt rejimiga qaytarish
    _scenarioModeOverride = null;

    // 2. Serverdan yangilash (silent: true - ichki animatsiya buzilmasligi uchun)
    await _fetchDashboardSummary(silent: true);

    // 3. Taktil sezish
    HapticFeedback.lightImpact();

    if (mounted) {
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: const [
              Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
              SizedBox(width: 10),
              Text(
                "Dars jadvali va davomat yangilandi ✅",
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

  int _parseTimeToMinutes(dynamic timeStr) {
    if (timeStr == null) return 0;
    final s = timeStr.toString().trim();
    final parts = s.split(':');
    if (parts.length >= 2) {
      final h = int.tryParse(parts[0]) ?? 0;
      final m = int.tryParse(parts[1]) ?? 0;
      return h * 60 + m;
    }
    return 0;
  }

  // Real-vaqt holatini aniqlash (0: A - Dars ketmoqda, 1: B - Tanaffus, 2: C - Tashqarida, 3: D - Darslar yakunlangan/Dam olish)
  int _computeCurrentScenario() {
    if (_scenarioModeOverride != null) {
      return _scenarioModeOverride!;
    }

    // 1. Agar talaba bino tashqarisida bo'lsa
    if (!_isInsideBuilding) {
      if (_lessons.isNotEmpty) {
        final now = DateTime.now();
        final nowMin = now.hour * 60 + now.minute;
        final firstStart = _parseTimeToMinutes(_lessons.first['start_time']);
        final lastEnd = _parseTimeToMinutes(_lessons.last['end_time']);
        if (nowMin >= firstStart - 30 && nowMin <= lastEnd) {
          return 2; // VARIANT C: O'quv hududiga kirmagan (Qulflangan)
        } else if (nowMin > lastEnd) {
          return 3; // VARIANT D: Darslar tugagan
        }
      }
      return 2; // Tashqarida
    }

    // 2. Agar bino ichida bo'lsa
    if (_lessons.isEmpty || (_dashboardData != null && _dashboardData!['is_weekend'] == true)) {
      return 3; // VARIANT D: Dam olish kuni yoki bugun dars yo'q
    }

    final now = DateTime.now();
    final nowMin = now.hour * 60 + now.minute;

    // 2.1 Hozir dars ketmoqdami?
    for (final l in _lessons) {
      final sMin = _parseTimeToMinutes(l['start_time']);
      final eMin = _parseTimeToMinutes(l['end_time']);
      if (nowMin >= sMin && nowMin < eMin) {
        return 0; // VARIANT A: Dars ketmoqda!
      }
    }

    // 2.2 Birinchi darsdan oldingi vaqtmi?
    final firstStart = _parseTimeToMinutes(_lessons.first['start_time']);
    if (nowMin < firstStart) {
      return 1; // VARIANT B: Dars boshlanishini kutish / Tanaffus
    }

    // 2.3 Paralar orasidagi tanaffusmi?
    for (int i = 0; i < _lessons.length - 1; i++) {
      final curEnd = _parseTimeToMinutes(_lessons[i]['end_time']);
      final nextStart = _parseTimeToMinutes(_lessons[i + 1]['start_time']);
      if (nowMin >= curEnd && nowMin < nextStart) {
        return 1; // VARIANT B: Tanaffus!
      }
    }

    // 2.4 Barcha darslar yakunlandimi?
    final lastEnd = _parseTimeToMinutes(_lessons.last['end_time']);
    if (nowMin >= lastEnd) {
      return 3; // VARIANT D: Barcha darslar tugagan
    }

    return 0;
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

  // 45s Dinamik Dars QR Modalini ochish
  void _openLessonQRModal(dynamic lesson) {
    _attendanceConfirmed = false;
    _qrTimerSeconds = 45;
    _dynamicLessonQR = "LESSON_${lesson['id'] ?? 101}_${DateTime.now().millisecondsSinceEpoch}";

    _qrTicker?.cancel();
    _qrTicker = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      setState(() {
        if (_qrTimerSeconds > 1) {
          _qrTimerSeconds--;
        } else {
          _qrTimerSeconds = 45;
          _dynamicLessonQR = "LESSON_${lesson['id'] ?? 101}_${DateTime.now().millisecondsSinceEpoch}";
        }
      });
    });

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 22),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 5,
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 18),
              Text(
                lesson['subject_name'] ?? 'Oliy Matematika',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.textDark),
              ),
              const SizedBox(height: 4),
              const Text("Ustoz skanerlashi uchun dinamik 45s dars kodi", style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
              const SizedBox(height: 20),

              if (!_attendanceConfirmed) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: AppTheme.primaryLight, width: 3),
                  ),
                  child: QrImageView(
                    data: _dynamicLessonQR,
                    version: QrVersions.auto,
                    size: 200.0,
                    eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: AppTheme.primary),
                    dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.circle, color: AppTheme.textDark),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.timer_outlined, size: 16, color: AppTheme.primary),
                    const SizedBox(width: 6),
                    Text("Yangilanishiga: $_qrTimerSeconds soniya", style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary, fontSize: 13)),
                  ],
                ),
                const SizedBox(height: 20),
                ElevatedButton.icon(
                  onPressed: () async {
                    setModalState(() => _attendanceConfirmed = true);
                    setState(() => _attendanceConfirmed = true);
                    final user = ApiService.currentUser;
                    if (user != null && lesson['id'] != null) {
                      try {
                        await ApiService.scanAttendance(
                          lessonId: lesson['id'],
                          studentId: user['id'],
                        );
                      } catch (_) {}
                      _fetchDashboardSummary(silent: true);
                    }
                  },
                  icon: const Icon(Icons.check_circle_outline, size: 18),
                  label: const Text("Ustoz skanerladi (Davomatni tasdiqlash)"),
                ),
              ] else ...[
                // Yashil tasdiqlangan chek
                Container(
                  width: 70,
                  height: 70,
                  decoration: BoxDecoration(color: AppTheme.success.withValues(alpha: 0.15), shape: BoxShape.circle),
                  child: const Icon(Icons.check_circle_rounded, color: AppTheme.success, size: 48),
                ),
                const SizedBox(height: 14),
                const Text(
                  "Davomat tasdiqlandi! ✅",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.success),
                ),
                const SizedBox(height: 4),
                const Text(
                  "Dars davomati bazada muvaffaqiyatli saqlandi",
                  style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: const Text("Yopish"),
                  ),
                ),
              ],
              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ApiService.currentUser ?? {};
    final fullName = user['full_name'] ?? "O'quvchi";
    final className = user['class_name'] ?? "9-A sinf";

    return Scaffold(
      body: SafeArea(
        child: IndexedStack(
          index: _tabIndex,
          children: [
            _buildHomeTab(fullName, className),
            const AttendanceHistoryScreen(),
            const RequestsCenterScreen(),
            const ProfileScreen(),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 16, offset: const Offset(0, -4)),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _tabIndex,
          onTap: (i) => setState(() => _tabIndex = i),
          selectedItemColor: AppTheme.primary,
          unselectedItemColor: AppTheme.textMuted,
          backgroundColor: Colors.white,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: "Bosh sahifa"),
            BottomNavigationBarItem(icon: Icon(Icons.calendar_month_rounded), label: "Davomat"),
            BottomNavigationBarItem(icon: Icon(Icons.description_rounded), label: "Arizalar"),
            BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: "Profil"),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // 1. /dashboard — BOSH SAHIFA
  // =========================================================================
  Widget _buildHomeTab(String fullName, String className) {
    return RefreshIndicator(
      color: AppTheme.primary,
      backgroundColor: Colors.white,
      displacement: 32,
      onRefresh: _handleUserPullToRefresh,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1.1. Header (Statik yuqori qism)
            _buildHeader(fullName, className),
            const SizedBox(height: 18),

            // Ssenariy almashtirish (Test uchun tezkor switcher)
            _buildScenarioSwitcher(),
            const SizedBox(height: 14),

            // 1.2. Dinamik Dars & Holat Bloki (VARIANT A, B, C, D)
            _buildDynamicLessonCard(),
            const SizedBox(height: 22),

            // 1.3. Tezkor Statistika Vidjetlari (Bugungi ko'rsatkichlar)
            _buildQuickStatsWidgets(),
            const SizedBox(height: 22),

            // 1.4. Haftalik Dars Matritsasi (Weekly Attendance Grid)
            _buildWeeklyAttendanceGrid(),
            const SizedBox(height: 22),

            // 1.5. Haftalik Dars Jadvali & Bugungi darslar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Dars Jadvali",
                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                    ),
                    Text(
                      _selectedScheduleDay == DateTime.now().weekday 
                          ? "Bugungi darslar va real davomat holati" 
                          : "Haftalik jadvaldan tanlangan kun",
                      style: const TextStyle(fontSize: 11.5, color: AppTheme.textMuted),
                    ),
                  ],
                ),
                InkWell(
                  onTap: () => setState(() => _tabIndex = 1),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryLight,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text("To'liq reja", style: TextStyle(color: AppTheme.primary, fontSize: 11.5, fontWeight: FontWeight.bold)),
                        SizedBox(width: 4),
                        Icon(Icons.arrow_forward_ios_rounded, size: 10, color: AppTheme.primary),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Haftaning kunlari tanlagichi (Karusel)
            _buildWeeklyDaySelector(),
            const SizedBox(height: 14),

            // Tanlangan kunning darslari ro'yxati
            _buildWeeklyScheduleCarousel(),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // 1.1 Header
  Widget _buildHeader(String fullName, String className) {
    return Row(
      children: [
        // Profil qisqartmasi (Avatar, F.I.Sh., Guruh) -> Bosilsa: Profil/QR Drawer ochiladi
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
                      BoxShadow(color: AppTheme.primary.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 3)),
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
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
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
                            decoration: BoxDecoration(color: AppTheme.primaryLight, borderRadius: BorderRadius.circular(6)),
                            child: Text(
                              className,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primary),
                            ),
                          ),
                          const SizedBox(width: 8),

                          // Bino maqomi (Yashil: Bino ichida, Kulrang: Tashqarida) -> Bosilsa holat almashadi
                          Flexible(
                            child: InkWell(
                              borderRadius: BorderRadius.circular(6),
                              onTap: () {
                                setState(() {
                                  _isInsideBuilding = !_isInsideBuilding;
                                  _scenarioModeOverride = null;
                                });
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(_isInsideBuilding 
                                        ? "Bino ichiga kirildi ✅ (Davomat ochildi)" 
                                        : "Bino tashqarisiga chiqildi 📍 (Dars qulflangan)"),
                                    duration: const Duration(seconds: 2),
                                    behavior: SnackBarBehavior.floating,
                                  ),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                decoration: BoxDecoration(
                                  color: _isInsideBuilding ? AppTheme.success.withValues(alpha: 0.12) : Colors.grey.shade200,
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
                                        _isInsideBuilding ? "Bino ichida ($_buildingEntryTime)" : "Tashqarida",
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

        // Bildirishnoma qo'ng'irog'i
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

  // Tezkor Ssenariy Switcher (Avtomatik real-vaqt yoki qo'lda test sinovi)
  Widget _buildScenarioSwitcher() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildScenarioBtn(null, "⚡ Real-Vaqt (Avtomatik)"),
          _buildScenarioBtn(0, "A: Dars ketmoqda"),
          _buildScenarioBtn(1, "B: Tanaffus"),
          _buildScenarioBtn(2, "C: Tashqarida"),
          _buildScenarioBtn(3, "D: Darslar tugagan"),
        ],
      ),
    );
  }

  Widget _buildScenarioBtn(int? index, String label) {
    final active = _scenarioModeOverride == index;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: () {
          setState(() {
            _scenarioModeOverride = index;
            if (index == 2) {
              _isInsideBuilding = false;
            } else if (index != null) {
              _isInsideBuilding = true;
            }
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: active ? AppTheme.primary : Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: active ? AppTheme.primary : Colors.black.withValues(alpha: 0.05)),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: active ? Colors.white : AppTheme.textDark,
            ),
          ),
        ),
      ),
    );
  }

  // 1.2 Dinamik Dars & Holat Bloki (VARIANT A, B, C, D)
  Widget _buildDynamicLessonCard() {
    final mode = _computeCurrentScenario();
    final now = DateTime.now();
    final nowMinutes = now.hour * 60 + now.minute;

    // VARIANT D: Dam olish kuni yoki bugungi barcha darslar yakunlangan
    if (mode == 3) {
      final isAllCompleted = _lessons.isNotEmpty && 
          nowMinutes >= _parseTimeToMinutes(_lessons.last['end_time']);

      final int attendedCount = _lessons.where((l) => l['is_attended'] == true).length;

      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
        ),
        child: Row(
          children: [
            Icon(
              isAllCompleted ? Icons.celebration_rounded : Icons.weekend_rounded, 
              color: AppTheme.secondaryOrange, 
              size: 28,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isAllCompleted ? "Bugungi barcha darslar yakunlandi 🎉" : "Bugun dam olish kuni 🎉", 
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    isAllCompleted 
                        ? "Bugungi barcha paralar yakuniga yetdi. Davomat: $attendedCount / ${_lessons.length} ta darsda qatnashdingiz."
                        : "Bugun darslar rejalashtirilmagan. Maroqli hordiq tilaymiz!", 
                    style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    // VARIANT C: Dars vaqti bo'ldi, lekin talaba tashqarida (Turniketdan o'tmagan)
    if (mode == 2) {
      return Container(
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          color: const Color(0xFFFFF0F0),
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: Colors.red.shade200),
          boxShadow: [
            BoxShadow(color: Colors.red.withValues(alpha: 0.08), blurRadius: 16, offset: const Offset(0, 6)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: Colors.red.shade100, shape: BoxShape.circle),
                  child: Icon(Icons.location_off_rounded, color: Colors.red.shade800, size: 22),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    "Siz hali o'quv hududiga kirmadingiz",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5, color: Colors.red.shade900),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              "Turniketdan o'tmagansiz. Xavfsizlik qoidalariga binoan tashqaridan turib darsga QR kod ochib bo'lmaydi.",
              style: TextStyle(fontSize: 12, color: Colors.red.shade800, height: 1.3),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.grey.shade300,
                      foregroundColor: Colors.grey.shade600,
                      elevation: 0,
                    ),
                    onPressed: null,
                    child: const Text("Darsga kirish (Qulflangan 🔒)", style: TextStyle(fontSize: 12.5)),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red.shade700,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  ),
                  onPressed: () => setState(() => _tabIndex = 2),
                  child: const Text("Ariza yozish", style: TextStyle(fontSize: 12.5)),
                ),
              ],
            ),
          ],
        ),
      );
    }

    // VARIANT B: Bino ichida, lekin tanaffus yoki 1-dars boshlanishiga qadar
    if (mode == 1) {
      dynamic nextLesson;
      int breakDuration = 10;
      bool isBeforeFirstLesson = false;

      if (_lessons.isNotEmpty && nowMinutes < _parseTimeToMinutes(_lessons.first['start_time'])) {
        nextLesson = _lessons.first;
        breakDuration = _parseTimeToMinutes(nextLesson['start_time']) - nowMinutes;
        isBeforeFirstLesson = true;
      } else {
        for (int i = 0; i < _lessons.length - 1; i++) {
          final curEnd = _parseTimeToMinutes(_lessons[i]['end_time']);
          final nextStart = _parseTimeToMinutes(_lessons[i + 1]['start_time']);
          if (nowMinutes >= curEnd && nowMinutes < nextStart) {
            nextLesson = _lessons[i + 1];
            breakDuration = nextStart - curEnd;
            break;
          }
        }
        nextLesson ??= _lessons.isNotEmpty ? _lessons.last : null;
      }

      final nextStartMin = _parseTimeToMinutes(nextLesson?['start_time'] ?? "09:00");
      final targetDT = DateTime(now.year, now.month, now.day, nextStartMin ~/ 60, nextStartMin % 60, 0);
      final remainingSec = targetDT.difference(now).inSeconds;
      final countdownStr = remainingSec > 0
          ? "${(remainingSec ~/ 60).toString().padLeft(2, '0')}:${(remainingSec % 60).toString().padLeft(2, '0')}"
          : "00:00";

      final isBigBreak = breakDuration >= 20;

      return Container(
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          gradient: isBeforeFirstLesson
              ? const LinearGradient(
                  colors: [Color(0xFF6C5CE7), Color(0xFF5845D8)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : const LinearGradient(
                  colors: [Color(0xFF48DBFB), Color(0xFF0ABDE3)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(
              color: (isBeforeFirstLesson ? const Color(0xFF6C5CE7) : const Color(0xFF48DBFB)).withValues(alpha: 0.35),
              blurRadius: 18,
              offset: const Offset(0, 6),
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
                  decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.25), borderRadius: BorderRadius.circular(10)),
                  child: Row(
                    children: [
                      Icon(isBeforeFirstLesson ? Icons.wb_sunny_rounded : Icons.coffee_rounded, size: 14, color: Colors.white),
                      const SizedBox(width: 4),
                      Text(
                        isBeforeFirstLesson ? "1-Dars kutilmoqda" : (isBigBreak ? "Katta Tanaffus ☕" : "Hozir Tanaffus"), 
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                Text(
                  isBeforeFirstLesson ? "Boshlanishiga: $countdownStr" : "Tanaffus tugashiga: $countdownStr", 
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              isBeforeFirstLesson 
                  ? "Bugungi 1-dars: ${nextLesson?['subject_name'] ?? 'Dars'}"
                  : "Keyingi dars: ${nextLesson?['subject_name'] ?? 'Keyingi dars'}",
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
            ),
            const SizedBox(height: 4),
            Text(
              "${nextLesson?['room'] ?? nextLesson?['room_number'] ?? '101-xona'} • Boshlanish vaqti: ${nextLesson?['start_time'] ?? ''} • Ustoz: ${nextLesson?['teacher_name'] ?? 'Ustoz'}",
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline_rounded, color: Colors.white, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      isBeforeFirstLesson 
                          ? "Qo'ng'iroq chalinishi bilan o'quv xonangizga kiring va ustozga davomat kodini taqdim eting."
                          : "Tanaffus tugashi bilan dars xonasiga boring va davomatdan o'ting.",
                      style: const TextStyle(color: Colors.white, fontSize: 11.5),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    // VARIANT A: Bino ichida + Dars vaqti (Dars ketmoqda)
    dynamic currentLesson;
    for (final l in _lessons) {
      final sMin = _parseTimeToMinutes(l['start_time']);
      final eMin = _parseTimeToMinutes(l['end_time']);
      if (nowMinutes >= sMin && nowMinutes < eMin) {
        currentLesson = l;
        break;
      }
    }
    currentLesson ??= _lessons.isNotEmpty ? _lessons.first : {
      "id": 101,
      "order": 1,
      "subject_name": "Algebra",
      "teacher_name": "Akmal Rahimov",
      "room": "3-xona",
      "start_time": "09:00",
      "end_time": "09:45",
      "is_attended": false,
    };

    final endMin = _parseTimeToMinutes(currentLesson['end_time']);
    final endDT = DateTime(now.year, now.month, now.day, endMin ~/ 60, endMin % 60, 0);
    final remainingSec = endDT.difference(now).inSeconds;
    final countdownStr = remainingSec > 0
        ? "${(remainingSec ~/ 60).toString().padLeft(2, '0')}:${(remainingSec % 60).toString().padLeft(2, '0')}"
        : "00:00";

    final bool isAttended = currentLesson['is_attended'] == true || _attendanceConfirmed;
    final lessonOrder = currentLesson['order'] ?? 1;

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: isAttended
            ? const LinearGradient(
                colors: [Color(0xFF10AC84), Color(0xFF0B8767)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : const LinearGradient(
                colors: [Color(0xFFFF4757), Color(0xFFC0392B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: (isAttended ? const Color(0xFF10AC84) : const Color(0xFFFF4757)).withValues(alpha: 0.38),
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
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.12), blurRadius: 4),
                  ],
                ),
                child: Row(
                  children: [
                    Icon(
                      isAttended ? Icons.verified_rounded : Icons.warning_amber_rounded,
                      size: 15,
                      color: isAttended ? const Color(0xFF10AC84) : const Color(0xFFC0392B),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      isAttended ? "DARSDA MAVJUD (Kelgan) ✅" : "DARSGA KIRMAGANSIZ! ⚠️",
                      style: TextStyle(
                        color: isAttended ? const Color(0xFF10AC84) : const Color(0xFFC0392B),
                        fontWeight: FontWeight.w900,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                "Tugashiga: $countdownStr",
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            "${currentLesson['subject_name'] ?? 'Fan'} darsi ketmoqda ($lessonOrder-${ApiService.lessonTermSingular.toLowerCase()})",
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white, fontSize: 18.5, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            "Vaqti: ${currentLesson['start_time']} - ${currentLesson['end_time']} • Xona: ${currentLesson['room'] ?? currentLesson['room_number'] ?? '101-xona'} • Ustoz: ${currentLesson['teacher_name'] ?? 'Ustoz'}",
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: 14),

          if (!isAttended) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.18),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.report_problem_rounded, color: Colors.white, size: 18),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      "Ayni paytda dars ketmoqda! Siz hali davomatdan o'tmadingiz. Agar tezda belgilamasangiz, NB (sababsiz dars qoldirish) hisoblanadi!",
                      style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600, height: 1.3),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: const Color(0xFFC0392B),
                  elevation: 3,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                ),
                onPressed: () => _openLessonQRModal(currentLesson),
                icon: const Icon(Icons.qr_code_scanner_rounded, size: 22),
                label: const Text(
                  "⚡ Hoziroq davomatdan o'tish (QR Kod)",
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                ),
              ),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.22),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle_rounded, color: Colors.white, size: 22),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Siz darsdasiz (Davomat tasdiqlangan)",
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          currentLesson['attendance_time'] != null
                              ? "Soat ${currentLesson['attendance_time']} da ustoz qabul qildi"
                              : "Muvaffaqiyatli qatnashmoqdasiz",
                          style: const TextStyle(color: Colors.white70, fontSize: 11.5),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: const Color(0xFF10AC84),
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(vertical: 13),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => LessonRoomScreen(lessonId: currentLesson['id'] ?? 101)),
                  );
                },
                icon: const Icon(Icons.menu_book_rounded, size: 20),
                label: const Text("Dars xonasiga kirish / Mavzu", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildQuickStatsWidgets() {
    final entryTime = _stats['turnstile_entry'] ?? _buildingEntryTime;
    final exitTime = _stats['turnstile_exit'] ?? "--:--";
    final attendedCount = _stats['today_attended_count'] ?? (_attendanceConfirmed ? 1 : 0);
    final totalCount = _stats['today_total_lessons'] ?? (_lessons.isNotEmpty ? _lessons.length : 5);
    final monthlyPercent = _stats['monthly_attendance_percent'] ?? 94;
    final nbRemaining = _stats['nb_remaining_hours'] ?? 36;
    final nbLimit = _stats['nb_limit_hours'] ?? 36;
    final nbTaken = _stats['nb_taken_hours'] ?? 0;
    final isNbDanger = _stats['is_nb_danger'] == true || nbRemaining <= 8;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Bugungi Statistika & NB Chegarasi", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                title: "Turniket vaqtlari",
                mainValue: "$entryTime  ➔  $exitTime",
                subText: "Kirish: $entryTime (${_isInsideBuilding ? 'Bino ichida' : 'Tashqarida'})",
                icon: Icons.door_front_door_rounded,
                accentColor: AppTheme.primary,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildStatCard(
                title: "Darslarda ishtirok",
                mainValue: "$attendedCount / $totalCount ${ApiService.lessonTermSingular.toLowerCase()}",
                subText: "$attendedCount-${ApiService.lessonTermSingular.toLowerCase()} tasdiqlangan",
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
                title: "Oylik davomat",
                mainValue: "$monthlyPercent%",
                subText: monthlyPercent >= 85 ? "A'lo darajada (Norma)" : "Ogohlantirish darajasida",
                icon: Icons.pie_chart_rounded,
                accentColor: AppTheme.secondaryBlue,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildStatCard(
                title: "NB chegarasi (Xavf)",
                mainValue: "Yana $nbRemaining soat",
                subText: "Limit: $nbLimit soat ($nbTaken olingan)",
                icon: isNbDanger ? Icons.warning_rounded : Icons.shield_outlined,
                accentColor: isNbDanger ? Colors.red.shade600 : AppTheme.secondaryOrange,
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
          BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 3)),
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
                child: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(mainValue, style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w900, color: AppTheme.textDark)),
          const SizedBox(height: 3),
          Text(subText, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 10.5, color: accentColor, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  // 1.4 Haftalik Dars Matritsasi (Weekly Attendance Grid)
  Widget _buildWeeklyAttendanceGrid() {
    final days = ["Dush", "Sesh", "Chor", "Pay", "Juma", "Shan"];
    final gridData = (_weeklyGrid.isNotEmpty && _weeklyGrid.length >= 6)
        ? _weeklyGrid
        : [
            [0, 0, 3],
            [0, 1, 3],
            [0, 2, 3],
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
              const Text("Haftalik Dars Matritsasi", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
              Row(
                children: [
                  _buildLegend(AppTheme.success, "Bor"),
                  const SizedBox(width: 6),
                  _buildLegend(AppTheme.secondaryOrange, "Kech"),
                  const SizedBox(width: 6),
                  _buildLegend(Colors.red.shade600, "NB"),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Grid
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(6, (dayIdx) {
              final dayRow = (dayIdx < gridData.length && gridData[dayIdx] is List)
                  ? (gridData[dayIdx] as List)
                  : [3, 3, 3];
              final slotCount = dayRow.length;

              return Column(
                children: [
                  Text(days[dayIdx], style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                  const SizedBox(height: 8),
                  ...List.generate(slotCount, (pairIdx) {
                    final status = dayRow[pairIdx];
                    Color blockColor;
                    if (status == 0) {
                      blockColor = AppTheme.success;
                    } else if (status == 1) {
                      blockColor = AppTheme.secondaryOrange;
                    } else if (status == 2) {
                      blockColor = Colors.red.shade600;
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

  // Haftaning kunlari karuseli (Dushanba - Shanba, Bugun ajratilgan)
  Widget _buildWeeklyDaySelector() {
    final days = [
      {"num": 1, "short": "Dush", "name": "Dushanba"},
      {"num": 2, "short": "Sesh", "name": "Seshanba"},
      {"num": 3, "short": "Chor", "name": "Chorshanba"},
      {"num": 4, "short": "Pay", "name": "Payshanba"},
      {"num": 5, "short": "Juma", "name": "Juma"},
      {"num": 6, "short": "Shan", "name": "Shanba"},
    ];
    final todayNum = DateTime.now().weekday;

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: days.map((d) {
          final dNum = d['num'] as int;
          final isSelected = _selectedScheduleDay == dNum;
          final isToday = todayNum == dNum;

          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () {
                setState(() => _selectedScheduleDay = dNum);
                if (_dayPageController.hasClients) {
                  _dayPageController.animateToPage(
                    dNum - 1,
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOutCubic,
                  );
                }
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppTheme.primary
                      : (isToday ? AppTheme.primaryLight : Colors.white),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected
                        ? AppTheme.primary
                        : (isToday ? AppTheme.primary.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.05)),
                    width: isToday ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Text(
                      d['short'] as String,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12.5,
                        color: isSelected
                            ? Colors.white
                            : (isToday ? AppTheme.primary : AppTheme.textDark),
                      ),
                    ),
                    if (isToday) ...[
                      const SizedBox(width: 5),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: isSelected ? Colors.white.withValues(alpha: 0.25) : AppTheme.primary,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          "Bugun",
                          style: TextStyle(
                            fontSize: 9.5,
                            fontWeight: FontWeight.w900,
                            color: isSelected ? Colors.white : Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // Tanlangan kunning darslari ro'yxati (Bugun bo'lsa real davomat bilan, boshqa kun bo'lsa jadval bilan)
  Widget _buildWeeklyScheduleCarousel() {
    final days = [
      {"num": 1, "name": "Dushanba"},
      {"num": 2, "name": "Seshanba"},
      {"num": 3, "name": "Chorshanba"},
      {"num": 4, "name": "Payshanba"},
      {"num": 5, "name": "Juma"},
      {"num": 6, "name": "Shanba"},
    ];
    final todayWeekday = DateTime.now().weekday;

    return Column(
      children: [
        SizedBox(
          height: 490,
          child: PageView.builder(
            controller: _dayPageController,
            onPageChanged: (pageIndex) {
              setState(() {
                _selectedScheduleDay = pageIndex + 1;
              });
            },
            itemCount: 6,
            itemBuilder: (context, index) {
              final dayNum = index + 1;
              final dayInfo = days[index];
              final isToday = (dayNum == todayWeekday);

              return _buildDayScheduleCard(dayNum, dayInfo['name'] as String, isToday);
            },
          ),
        ),
        const SizedBox(height: 10),
        // Karusel indikatori (Pagination dots)
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(6, (i) {
            final isCurrent = (_selectedScheduleDay == i + 1);
            final isToday = (todayWeekday == i + 1);
            return AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: isCurrent ? 24 : 8,
              height: 8,
              decoration: BoxDecoration(
                color: isCurrent
                    ? AppTheme.primary
                    : (isToday ? AppTheme.primary.withValues(alpha: 0.4) : Colors.black.withValues(alpha: 0.12)),
                borderRadius: BorderRadius.circular(4),
              ),
            );
          }),
        ),
      ],
    );
  }

  Widget _buildDayScheduleCard(int dayNum, String dayName, bool isToday) {
    List<dynamic> lessonsList = [];
    if (isToday && _loading && _lessons.isEmpty) {
      return const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()));
    }
    if (isToday) {
      lessonsList = _lessons;
    } else {
      final weeklySchedules = (_dashboardData?['weekly_schedules'] as List?) ?? [];
      for (final dayObj in weeklySchedules) {
        if (dayObj['day_of_week'] == dayNum) {
          lessonsList = (dayObj['lessons'] as List?) ?? [];
          break;
        }
      }
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isToday ? AppTheme.primary.withValues(alpha: 0.25) : Colors.black.withValues(alpha: 0.05),
          width: isToday ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: isToday ? AppTheme.primary.withValues(alpha: 0.06) : Colors.black.withValues(alpha: 0.03),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Karta sarlavhasi va surish tugmalari
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isToday ? AppTheme.primaryLight : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.calendar_today_rounded,
                      size: 16,
                      color: isToday ? AppTheme.primary : AppTheme.textMuted,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    dayName,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textDark),
                  ),
                  if (isToday) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        "BUGUN 🌟",
                        style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900),
                      ),
                    ),
                  ],
                ],
              ),
              Row(
                children: [
                  InkWell(
                    onTap: dayNum > 1
                        ? () {
                            if (_dayPageController.hasClients) {
                              _dayPageController.previousPage(
                                duration: const Duration(milliseconds: 280),
                                curve: Curves.easeInOut,
                              );
                            }
                          }
                        : null,
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: dayNum > 1 ? Colors.grey.shade100 : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(Icons.chevron_left_rounded, size: 20, color: dayNum > 1 ? AppTheme.textDark : Colors.grey.shade300),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    "${lessonsList.length} ta dars",
                    style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                  ),
                  const SizedBox(width: 4),
                  InkWell(
                    onTap: dayNum < 6
                        ? () {
                            if (_dayPageController.hasClients) {
                              _dayPageController.nextPage(
                                duration: const Duration(milliseconds: 280),
                                curve: Curves.easeInOut,
                              );
                            }
                          }
                        : null,
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: dayNum < 6 ? Colors.grey.shade100 : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(Icons.chevron_right_rounded, size: 20, color: dayNum < 6 ? AppTheme.textDark : Colors.grey.shade300),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1),
          const SizedBox(height: 12),

          // Darslar ro'yxati
          Expanded(
            child: lessonsList.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.event_busy_rounded, size: 44, color: Colors.grey.shade300),
                        const SizedBox(height: 10),
                        Text(
                          "$dayName kuni uchun darslar belgilanmagan",
                          style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: EdgeInsets.zero,
                    itemCount: lessonsList.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 10),
                    itemBuilder: (ctx, i) {
                      final l = lessonsList[i];
                      if (isToday) {
                        return _buildLessonItem(l);
                      } else {
                        return _buildPlannedLessonItem(l, i + 1);
                      }
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlannedLessonItem(dynamic lesson, int defaultOrder) {
    final order = lesson['order'] ?? lesson['lesson_order'] ?? defaultOrder;
    final subject = (lesson['subject_name'] ?? 'Umumiy Fan').toString();
    final time = (lesson['time'] ?? "${lesson['start_time'] ?? ''} - ${lesson['end_time'] ?? ''}").toString();
    final room = (lesson['room_number'] ?? lesson['room'] ?? '101-xona').toString();
    final teacher = (lesson['teacher_name'] ?? '').toString();
    final topic = (lesson['topic'] ?? '').toString();

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppTheme.primaryLight,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(
                "$order",
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.primary),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  subject,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: AppTheme.textDark),
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Icon(Icons.access_time_rounded, size: 12, color: Colors.grey.shade500),
                    const SizedBox(width: 4),
                    Text(time, style: TextStyle(fontSize: 11, color: Colors.grey.shade600, fontWeight: FontWeight.w600)),
                    const SizedBox(width: 10),
                    Icon(Icons.location_on_outlined, size: 12, color: Colors.grey.shade500),
                    const SizedBox(width: 3),
                    Text(room, style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
                  ],
                ),
                if (teacher.isNotEmpty || topic.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    teacher.isNotEmpty ? "Ustoz: $teacher" : topic,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 10.5, color: AppTheme.textMuted),
                  ),
                ],
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.schedule_rounded, size: 12, color: Colors.blue.shade700),
                const SizedBox(width: 4),
                Text(
                  "Reja",
                  style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Colors.blue.shade700),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLessonItem(dynamic lesson) {
    final bool isAttended = lesson['is_attended'] == true;
    final String status = lesson['status'] ?? 'PENDING';
    final String? attTime = lesson['attendance_time'];
    final bool isUrgentMissed = (status == 'ACTIVE' && !isAttended);

    return InkWell(
      borderRadius: BorderRadius.circular(20),
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => LessonRoomScreen(lessonId: lesson['id'] ?? 101)),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isAttended
                ? AppTheme.success.withValues(alpha: 0.35)
                : (isUrgentMissed
                    ? Colors.red.shade400
                    : Colors.black.withValues(alpha: 0.05)),
            width: (isAttended || isUrgentMissed) ? 1.8 : 1,
          ),
          boxShadow: isUrgentMissed
              ? [BoxShadow(color: Colors.red.withValues(alpha: 0.08), blurRadius: 10, offset: const Offset(0, 4))]
              : null,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isAttended
                    ? AppTheme.success.withValues(alpha: 0.12)
                    : (isUrgentMissed ? Colors.red.shade50 : AppTheme.primaryLight),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(
                isAttended
                    ? Icons.check_circle_rounded
                    : (isUrgentMissed ? Icons.warning_amber_rounded : Icons.menu_book_rounded),
                color: isAttended
                    ? AppTheme.success
                    : (isUrgentMissed ? Colors.red.shade600 : AppTheme.primary),
                size: 22,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          lesson['subject_name'] ?? 'Fan',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5, color: AppTheme.textDark),
                        ),
                      ),
                      const SizedBox(width: 6),
                      if (isAttended)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: AppTheme.success, borderRadius: BorderRadius.circular(6)),
                          child: Text(
                            attTime != null ? "Kelgan ($attTime)" : "Kelgan ✅",
                            style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold),
                          ),
                        )
                      else if (status == 'ACTIVE')
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: Colors.red.shade600, borderRadius: BorderRadius.circular(6)),
                          child: const Text("Kirmadingiz! ⚠️", style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
                        )
                      else if (status == 'COMPLETED')
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: Colors.red.shade700, borderRadius: BorderRadius.circular(6)),
                          child: const Text("NB (Kirmagan)", style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
                        )
                      else
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: Colors.blue.shade600, borderRadius: BorderRadius.circular(6)),
                          child: const Text("Kutilmoqda", style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    "Ustoz: ${lesson['teacher_name'] ?? '-'} • ${lesson['room'] ?? '101-xona'}",
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 11.5),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  "${lesson['start_time']} - ${lesson['end_time']}",
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: isAttended
                        ? AppTheme.success
                        : (isUrgentMissed ? Colors.red.shade600 : AppTheme.primary),
                  ),
                ),
                if (isUrgentMissed)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: InkWell(
                      onTap: () => _openLessonQRModal(lesson),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: Colors.red.shade200),
                        ),
                        child: const Text(
                          "QR ochish",
                          style: TextStyle(color: Colors.red, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
