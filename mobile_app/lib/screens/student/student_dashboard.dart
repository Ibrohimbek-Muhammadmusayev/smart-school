import 'dart:async';
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
  List<dynamic> _lessons = [];
  bool _loading = true;

  // Bino maqomi: true = "Bino ichida" (08:14 da qayd etilgan), false = "Tashqarida"
  bool _isInsideBuilding = true;
  String _buildingEntryTime = "08:14";

  // Reaktiv holat testi uchun ssenariy almashgich
  // 0: VARIANT A (Bino ichida + Dars vaqti)
  // 1: VARIANT B (Bino ichida, lekin tanaffus)
  // 2: VARIANT C (Dars vaqti, lekin talaba tashqarida)
  // 3: VARIANT D (Dam olish kuni - dars yo'q)
  int _scenarioMode = 0;

  // Dinamik dars 45s QR token
  String _dynamicLessonQR = "LESSON_QR_INIT";
  int _qrTimerSeconds = 45;
  Timer? _qrTicker;
  bool _attendanceConfirmed = false;

  @override
  void initState() {
    super.initState();
    _fetchLessons();
  }

  void _fetchLessons() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getTodayLessons();
      setState(() => _lessons = list);
    } catch (_) {
    } finally {
      if (mounted) setState(() => _loading = false);
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
                // Sinov uchun: Davomatni tasdiqlash simulatsiyasi
                ElevatedButton.icon(
                  onPressed: () {
                    setModalState(() => _attendanceConfirmed = true);
                    setState(() => _attendanceConfirmed = true);
                  },
                  icon: const Icon(Icons.check_circle_outline, size: 18),
                  label: const Text("Ustoz skanerladi (Simulatsiya)"),
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
                  "08:32 da ustoz tomonidan qabul qilindi",
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
      onRefresh: () async => _fetchLessons(),
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

            // Bugungi darslar ro'yxati
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
              const Center(child: Padding(padding: EdgeInsets.all(24), child: Text("Bugun darslar rejalashtirilmagan")))
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _lessons.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (ctx, i) => _buildLessonItem(_lessons[i]),
              ),
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

                          // Bino maqomi (Yashil: Bino ichida, Kulrang: Tashqarida)
                          Flexible(
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

  // Tezkor Ssenariy Switcher (Talaba holatlarini test qilish uchun)
  Widget _buildScenarioSwitcher() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildScenarioBtn(0, "A: Bino ichida (Dars)"),
          _buildScenarioBtn(1, "B: Tanaffus"),
          _buildScenarioBtn(2, "C: Tashqarida (Qulflangan)"),
          _buildScenarioBtn(3, "D: Dam olish kuni"),
        ],
      ),
    );
  }

  Widget _buildScenarioBtn(int index, String label) {
    final active = _scenarioMode == index;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: () {
          setState(() {
            _scenarioMode = index;
            if (index == 2) {
              _isInsideBuilding = false;
            } else {
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
    // VARIANT D: Bugun dars yo'q
    if (_scenarioMode == 3) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
        ),
        child: const Row(
          children: [
            Icon(Icons.weekend_rounded, color: AppTheme.secondaryOrange, size: 28),
            SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Bugun dam olish kuni 🎉", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  Text("Darslar rejalashtirilmagan. Maroqli hordiq tilaymiz!", style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                ],
              ),
            ),
          ],
        ),
      );
    }

    // VARIANT C: Dars vaqti bo'ldi, lekin talaba tashqarida
    if (_scenarioMode == 2) {
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
                // Qulflangan Darsni boshlash
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
                // Sababli qoldirish arizasi
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red.shade700,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  ),
                  onPressed: () => setState(() => _tabIndex = 2), // Arizalar tabiga o'tadi
                  child: const Text("Ariza yozish", style: TextStyle(fontSize: 12.5)),
                ),
              ],
            ),
          ],
        ),
      );
    }

    // VARIANT B: Bino ichida, lekin tanaffus
    if (_scenarioMode == 1) {
      return Container(
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF48DBFB), Color(0xFF0ABDE3)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(color: const Color(0xFF48DBFB).withValues(alpha: 0.35), blurRadius: 18, offset: const Offset(0, 6)),
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
                  child: const Row(
                    children: [
                      Icon(Icons.coffee_rounded, size: 14, color: Colors.white),
                      SizedBox(width: 4),
                      Text("Hozir Tanaffus", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                    ],
                  ),
                ),
                const Text("Tanaffus tugashiga: 06:45", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              ],
            ),
            const SizedBox(height: 12),
            const Text(
              "Keyingi dars: Fizika (Amaliy)",
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
            ),
            const SizedBox(height: 4),
            const Text("204-laboratoriya xonasi • Boshlanish vaqti: 10:00", style: TextStyle(color: Colors.white70, fontSize: 12)),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white.withValues(alpha: 0.3),
                  foregroundColor: Colors.white,
                  elevation: 0,
                ),
                onPressed: null,
                child: const Text("Darsni boshlash (Tanaffus vaqti nofaol)"),
              ),
            ),
          ],
        ),
      );
    }

    // VARIANT A: Bino ichida + Dars vaqti (Asosiy ssenariy)
    final sampleLesson = _lessons.isNotEmpty ? _lessons[0] : {
      "id": 101,
      "subject_name": "Oliy Matematika",
      "teacher_name": "Dots. Rahimov Akmal",
      "room": "302-auditoriya",
      "time": "08:30 - 09:50",
    };

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(color: AppTheme.primary.withValues(alpha: 0.35), blurRadius: 20, offset: const Offset(0, 8)),
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
                child: const Row(
                  children: [
                    Icon(Icons.bolt_rounded, size: 14, color: Colors.white),
                    SizedBox(width: 4),
                    Text("Dars ketmoqda (1-para)", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                  ],
                ),
              ),
              if (_attendanceConfirmed)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: AppTheme.success, borderRadius: BorderRadius.circular(8)),
                  child: const Row(
                    children: [
                      Icon(Icons.check, size: 12, color: Colors.white),
                      SizedBox(width: 4),
                      Text("Davomat olindi", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            sampleLesson['subject_name'] ?? 'Oliy Matematika',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white, fontSize: 19, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            "Ustoz: ${sampleLesson['teacher_name'] ?? 'Rahimov A.'} • Xona: ${sampleLesson['room'] ?? '302'}",
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white70, fontSize: 12.5),
          ),
          const SizedBox(height: 16),

          if (!_attendanceConfirmed)
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
                onPressed: () => _openLessonQRModal(sampleLesson),
                icon: const Icon(Icons.qr_code_2_rounded, size: 22),
                label: const Text("Darsga kirish / Darsni boshlash", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              ),
            )
          else
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Row(
                children: [
                  Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      "Davomat tasdiqlandi — 08:32 da ustoz qabul qildi",
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  // 1.3 Tezkor Statistika Vidjetlari (Bugungi ko'rsatkichlar)
  Widget _buildQuickStatsWidgets() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Bugungi Statistika & NB Chegarasi", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
        const SizedBox(height: 10),
        Row(
          children: [
            // Turniket kirish-chiqish
            Expanded(
              child: _buildStatCard(
                title: "Turniket vaqtlari",
                mainValue: "08:14  ➔  --:--",
                subText: "Kirish: 08:14 (Asosiy)",
                icon: Icons.door_front_door_rounded,
                accentColor: AppTheme.primary,
              ),
            ),
            const SizedBox(width: 10),
            // Bugungi darslarda ishtirok
            Expanded(
              child: _buildStatCard(
                title: "Darslarda ishtirok",
                mainValue: _attendanceConfirmed ? "1 / 3 para" : "0 / 3 para",
                subText: "1-para tasdiqlangan",
                icon: Icons.checklist_rounded,
                accentColor: AppTheme.success,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            // Oylik davomat foizi
            Expanded(
              child: _buildStatCard(
                title: "Oylik davomat",
                mainValue: "92%",
                subText: "A'lo darajada (Norma)",
                icon: Icons.pie_chart_rounded,
                accentColor: AppTheme.secondaryBlue,
              ),
            ),
            const SizedBox(width: 10),
            // NB chegarasi hisoblagichi
            Expanded(
              child: _buildStatCard(
                title: "NB chegarasi (Xavf)",
                mainValue: "Yana 4 soat",
                subText: "Limit: 36 soat (32 olingan)",
                icon: Icons.warning_amber_rounded,
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
    // 0: Yashil (Darsda bo'lgan), 1: Sariq (Kechikkan), 2: Qizil (NB), 3: Kulrang (Kelgusi)
    final gridData = [
      [0, 0, 3], // Dushanba
      [0, 1, 3], // Seshanba
      [0, 2, 3], // Chorshanba
      [3, 3, 3], // Payshanba
      [3, 3, 3], // Juma
      [3, 3, 3], // Shanba
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
              return Column(
                children: [
                  Text(days[dayIdx], style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                  const SizedBox(height: 8),
                  ...List.generate(3, (pairIdx) {
                    final status = gridData[dayIdx][pairIdx];
                    Color blockColor;
                    if (status == 0) blockColor = AppTheme.success;
                    else if (status == 1) blockColor = AppTheme.secondaryOrange;
                    else if (status == 2) blockColor = Colors.red.shade600;
                    else blockColor = Colors.grey.shade200;

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

  // Dars kartasi
  Widget _buildLessonItem(dynamic lesson) {
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
                    "Ustoz: ${lesson['teacher_name'] ?? '-'}",
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
}
