import 'package:flutter/services.dart';
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme.dart';

class AttendanceHistoryScreen extends StatefulWidget {
  const AttendanceHistoryScreen({super.key});

  @override
  State<AttendanceHistoryScreen> createState() => _AttendanceHistoryScreenState();
}

class _AttendanceHistoryScreenState extends State<AttendanceHistoryScreen> {
  // Oylik davomat jadvali uchun holatlar
  late int _selectedYear;
  late int _selectedMonth;
  int _selectedDayNumber = 1;
  Map<String, dynamic>? _monthlyData;
  bool _loadingMonthly = true;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _selectedYear = now.year;
    _selectedMonth = now.month;
    _selectedDayNumber = now.day;

    _fetchMonthlyData();
  }

  Future<void> _fetchMonthlyData({bool silent = false}) async {
    if (!silent) {
      setState(() => _loadingMonthly = true);
    }

    try {
      final data = await ApiService.getStudentMonthlyAttendance(year: _selectedYear, month: _selectedMonth);
      if (mounted) {
        setState(() {
          _monthlyData = data;
          final days = (_monthlyData?['days'] as List?) ?? [];
          if (days.isNotEmpty) {
            final exists = days.any((d) => (d['day_number'] ?? 0) == _selectedDayNumber);
            if (!exists) {
              _selectedDayNumber = days.first['day_number'] ?? 1;
            }
          }
        });
        if (silent) HapticFeedback.lightImpact();
      }
    } catch (_) {}

    if (mounted && !silent) {
      setState(() => _loadingMonthly = false);
    }
  }

  Future<void> _changeMonth(int delta) async {
    int newMonth = _selectedMonth + delta;
    int newYear = _selectedYear;

    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }

    setState(() {
      _selectedYear = newYear;
      _selectedMonth = newMonth;
      _loadingMonthly = true;
      _selectedDayNumber = 1;
    });

    try {
      final data = await ApiService.getStudentMonthlyAttendance(year: _selectedYear, month: _selectedMonth);
      if (mounted) {
        setState(() {
          _monthlyData = data;
          _loadingMonthly = false;
          final days = (_monthlyData?['days'] as List?) ?? [];
          final now = DateTime.now();
          if (newYear == now.year && newMonth == now.month) {
            _selectedDayNumber = now.day;
          } else if (days.isNotEmpty) {
            _selectedDayNumber = 1;
          }
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loadingMonthly = false);
    }
  }

  Future<void> _handlePullToRefresh() async {
    await _fetchMonthlyData(silent: true);
    if (mounted) {
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: const [
              Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
              SizedBox(width: 10),
              Text(
                "Oylik davomat jadvali yangilandi ✅",
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          "Davomat Jurnali",
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.textDark),
        ),
        centerTitle: true,
      ),
      body: _buildMonthlyAttendanceTableTab(),
    );
  }

  // =========================================================================
  // 1. Oylik Davomat Jadvali (Taqvim va har bir dars auditi bilan)
  // =========================================================================
  Widget _buildMonthlyAttendanceTableTab() {
    if (_loadingMonthly && _monthlyData == null) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(40),
          child: CircularProgressIndicator(),
        ),
      );
    }

    final summary = _monthlyData?['summary'] as Map<String, dynamic>? ?? {};
    final days = (_monthlyData?['days'] as List?) ?? [];
    final monthName = _monthlyData?['month_name'] ?? 'Oktyabr';

    // Tanlangan kun ma'lumotlari
    final selectedDayData = days.firstWhere(
      (d) => (d['day_number'] ?? 0) == _selectedDayNumber,
      orElse: () => days.isNotEmpty ? days.first : {},
    ) as Map<String, dynamic>;

    final dayLessons = (selectedDayData['lessons'] as List?) ?? [];
    final selectedDayName = selectedDayData['day_name'] ?? '';
    final selectedDate = selectedDayData['date'] ?? '';

    return RefreshIndicator(
      color: AppTheme.primary,
      backgroundColor: Colors.white,
      displacement: 32,
      onRefresh: _handlePullToRefresh,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1.1 Oy tanlagich sarlavhasi
            _buildMonthSwitcher(monthName),
            const SizedBox(height: 14),

            // 1.2 Oylik statistika KPI kartasi
            _buildMonthlyKpiCard(summary),
            const SizedBox(height: 16),

            // 1.3 Oylik interaktiv Taqvim-Jadval (Calendar Grid)
            _buildCalendarTable(days),
            const SizedBox(height: 20),

            // 1.4 Tanlangan kungi darslar sarlavhasi
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryLight,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.view_agenda_outlined, size: 16, color: AppTheme.primary),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "$_selectedDayNumber-$monthName, $selectedDayName",
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppTheme.textDark),
                            ),
                            Text(
                              dayLessons.isNotEmpty ? "${dayLessons.length} ta dars jadvali" : "Darslar mavjud emas",
                              style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.touch_app_rounded, size: 13, color: AppTheme.primary),
                      SizedBox(width: 4),
                      Text("Bosib ko'ring", style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // 1.5 Tanlangan kun darslari ro'yxati (har bir darsga kirgan vaqti bilan)
            if (dayLessons.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
                ),
                child: Column(
                  children: [
                    Icon(
                      selectedDayData['is_weekend'] == true ? Icons.weekend_outlined : Icons.event_busy_rounded,
                      size: 40,
                      color: AppTheme.textMuted.withValues(alpha: 0.4),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      selectedDayData['is_weekend'] == true
                          ? "Dam olish kuni — Darslar belgilanmagan 🏖"
                          : "Ushbu kunga dars jadvali topilmadi",
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.textMuted),
                    ),
                  ],
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: dayLessons.length,
                separatorBuilder: (context, index) => const SizedBox(height: 10),
                itemBuilder: (ctx, idx) {
                  final lesson = dayLessons[idx] as Map<String, dynamic>;
                  return _buildLessonAttendanceCard(lesson, selectedDate, selectedDayName);
                },
              ),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  // 1.1 Oy almashtirish tugmalari va sarlavhasi
  Widget _buildMonthSwitcher(String monthName) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          InkWell(
            onTap: () => _changeMonth(-1),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.chevron_left_rounded, size: 22, color: AppTheme.textDark),
            ),
          ),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppTheme.primaryLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.calendar_month_rounded, size: 18, color: AppTheme.primary),
              ),
              const SizedBox(width: 8),
              Text(
                "$monthName, $_selectedYear",
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textDark),
              ),
            ],
          ),
          InkWell(
            onTap: () => _changeMonth(1),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.chevron_right_rounded, size: 22, color: AppTheme.textDark),
            ),
          ),
        ],
      ),
    );
  }

  // 1.2 Oylik Davomat KPI Ko'rsatkichlari Kartasi
  Widget _buildMonthlyKpiCard(Map<String, dynamic> summary) {
    final attPercent = summary['attendance_percent'] ?? 94;
    final total = summary['total_lessons'] ?? 0;
    final present = summary['present_count'] ?? 0;
    final lateCount = summary['late_count'] ?? 0;
    final absent = summary['absent_count'] ?? 0;
    final nbHours = summary['nb_hours'] ?? 0;
    final nbRemaining = summary['nb_remaining'] ?? 36;
    final isDanger = summary['is_nb_danger'] == true;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppTheme.primaryDark,
            AppTheme.primary,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withValues(alpha: 0.28),
            blurRadius: 14,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Oylik Davomat Ko'rsatkichi", style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        "$attPercent%",
                        style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          attPercent >= 90 ? "A'LO DARAJA ⭐" : (attPercent >= 75 ? "YAXSHI 👍" : "XAVFLI (<75%) ⚠️"),
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.school_rounded, color: Colors.white, size: 28),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(color: Colors.white24, height: 1),
          const SizedBox(height: 12),

          // 4 ta ustun: Jami, Bor, Kechikkan, Kelmagan
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildMiniStat("Jami Dars", "$total", Colors.white),
              _buildMiniStat("Bor (Kelgan)", "$present", const Color(0xFF69F0AE)),
              _buildMiniStat("Kechikkan", "$lateCount", const Color(0xFFFFD54F)),
              _buildMiniStat("Kelmadi (NB)", "$absent", const Color(0xFFFF8A80)),
            ],
          ),
          const SizedBox(height: 10),

          // NB chegarasi qatori
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      isDanger ? Icons.warning_rounded : Icons.shield_outlined,
                      color: isDanger ? const Color(0xFFFF8A80) : Colors.white70,
                      size: 14,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      "NB hisobi: $nbHours soat olingan",
                      style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                Text(
                  "Qoldiq: $nbRemaining soat",
                  style: TextStyle(
                    color: isDanger ? const Color(0xFFFF8A80) : const Color(0xFF69F0AE),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniStat(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10.5, fontWeight: FontWeight.w500)),
      ],
    );
  }

  // 1.3 Oylik Interaktiv Taqvim-Jadval (Calendar Matrix)
  Widget _buildCalendarTable(List<dynamic> days) {
    if (days.isEmpty) return const SizedBox.shrink();

    final weekDaysHeader = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
    final firstDayOfWeek = (days.first['day_of_week'] ?? 1) as int; // 1-7
    final emptyOffset = firstDayOfWeek - 1; // 1-kun oldidan bo'sh kataklar

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        children: [
          // Hafta kunlari qatori
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: weekDaysHeader.map((dName) {
              final isSunday = dName == "Ya";
              return Expanded(
                child: Center(
                  child: Text(
                    dName,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isSunday ? Colors.red.shade400 : AppTheme.textMuted,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 8),
          const Divider(height: 1, color: Colors.black12),
          const SizedBox(height: 8),

          // Kunlar paneli (Grid)
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: emptyOffset + days.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              mainAxisSpacing: 6,
              crossAxisSpacing: 6,
              childAspectRatio: 0.88,
            ),
            itemBuilder: (ctx, index) {
              if (index < emptyOffset) {
                return const SizedBox.shrink();
              }

              final dayData = days[index - emptyOffset] as Map<String, dynamic>;
              final dayNum = dayData['day_number'] ?? 0;
              final isWeekend = dayData['is_weekend'] == true;
              final isToday = dayData['is_today'] == true;
              final isFuture = dayData['is_future'] == true;
              final isSelected = dayNum == _selectedDayNumber;
              final badge = dayData['status_badge'] ?? 'PRESENT';

              // Rangni aniqlash
              Color cellBg = Colors.grey.shade50;
              Color textColor = AppTheme.textDark;
              Widget? statusDot;

              if (isSelected) {
                cellBg = AppTheme.primaryLight;
                textColor = AppTheme.primary;
              } else if (isWeekend) {
                cellBg = Colors.grey.shade100.withValues(alpha: 0.5);
                textColor = Colors.grey.shade400;
              } else if (isFuture) {
                cellBg = Colors.white;
                textColor = Colors.grey.shade400;
              } else {
                if (badge == 'ABSENT') {
                  statusDot = Container(
                    width: 5,
                    height: 5,
                    decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                  );
                } else if (badge == 'LATE') {
                  statusDot = Container(
                    width: 5,
                    height: 5,
                    decoration: const BoxDecoration(color: Colors.amber, shape: BoxShape.circle),
                  );
                } else if (badge == 'PRESENT') {
                  statusDot = Container(
                    width: 5,
                    height: 5,
                    decoration: const BoxDecoration(color: AppTheme.success, shape: BoxShape.circle),
                  );
                }
              }

              return InkWell(
                onTap: () {
                  HapticFeedback.selectionClick();
                  setState(() => _selectedDayNumber = dayNum);
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  decoration: BoxDecoration(
                    color: cellBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected
                          ? AppTheme.primary
                          : (isToday ? AppTheme.primary.withValues(alpha: 0.5) : Colors.black.withValues(alpha: 0.04)),
                      width: isSelected ? 1.8 : 1,
                    ),
                    boxShadow: isSelected
                        ? [BoxShadow(color: AppTheme.primary.withValues(alpha: 0.2), blurRadius: 6, offset: const Offset(0, 2))]
                        : null,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "$dayNum",
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: isSelected || isToday ? FontWeight.w900 : FontWeight.bold,
                          color: isSelected ? AppTheme.primary : (isToday ? AppTheme.primaryDark : textColor),
                        ),
                      ),
                      if (isToday)
                        Container(
                          margin: const EdgeInsets.only(top: 1),
                          padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 0.5),
                          decoration: BoxDecoration(
                            color: AppTheme.primary,
                            borderRadius: BorderRadius.circular(3),
                          ),
                          child: const Text("BUGUN", style: TextStyle(fontSize: 6.5, color: Colors.white, fontWeight: FontWeight.bold)),
                        )
                      else if (statusDot != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 3),
                          child: statusDot,
                        ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // 1.5 Dars Davomat Kartasi (Har bir dars uchun)
  Widget _buildLessonAttendanceCard(Map<String, dynamic> lesson, String dateStr, String dayName) {
    final order = lesson['order'] ?? 1;
    final subject = lesson['subject_name'] ?? 'Fan';
    final timeStr = lesson['time'] ?? '08:30 - 09:15';
    final room = lesson['room_number'] ?? '101-xona';
    final teacher = lesson['teacher_name'] ?? 'Ustoz';
    final attStatus = lesson['attendance_status'] ?? 'PRESENT';
    final checkInTime = lesson['check_in_time'];
    final checkInDiff = lesson['check_in_diff'];

    // Status rangi va nishoni
    Color badgeBg;
    Color badgeText;
    String badgeTitle;
    IconData badgeIcon;

    if (attStatus == 'PRESENT') {
      badgeBg = AppTheme.success.withValues(alpha: 0.12);
      badgeText = AppTheme.success;
      badgeTitle = "Bor";
      badgeIcon = Icons.check_circle_rounded;
    } else if (attStatus == 'LATE') {
      badgeBg = Colors.amber.shade50;
      badgeText = Colors.amber.shade800;
      badgeTitle = "Kechikdi";
      badgeIcon = Icons.access_time_rounded;
    } else if (attStatus == 'ABSENT') {
      badgeBg = Colors.red.shade50;
      badgeText = Colors.red.shade700;
      badgeTitle = "Kelmadi (NB)";
      badgeIcon = Icons.cancel_rounded;
    } else if (attStatus == 'ACTIVE') {
      badgeBg = Colors.blue.shade50;
      badgeText = Colors.blue.shade700;
      badgeTitle = "Dars ketmoqda";
      badgeIcon = Icons.sensors_rounded;
    } else {
      badgeBg = Colors.grey.shade100;
      badgeText = AppTheme.textMuted;
      badgeTitle = "Kutilmoqda";
      badgeIcon = Icons.schedule_rounded;
    }

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _showLessonDetailModal(context, lesson, dateStr, dayName),
        borderRadius: BorderRadius.circular(18),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: attStatus == 'ABSENT'
                  ? Colors.red.shade200
                  : (attStatus == 'LATE' ? Colors.amber.shade200 : Colors.black.withValues(alpha: 0.05)),
            ),
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Para va Holat qatori
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          "$order-${ApiService.lessonTermSingular.toLowerCase()}",
                          style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        timeStr,
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                    decoration: BoxDecoration(
                      color: badgeBg,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(badgeIcon, size: 12, color: badgeText),
                        const SizedBox(width: 4),
                        Text(
                          badgeTitle,
                          style: TextStyle(color: badgeText, fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Fan nomi va xona
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      subject,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppTheme.textDark),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(room, style: const TextStyle(fontSize: 10.5, color: AppTheme.textDark, fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
              const SizedBox(height: 4),

              // O'qituvchi
              Row(
                children: [
                  const Icon(Icons.person_outline_rounded, size: 13, color: AppTheme.textMuted),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      teacher,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 11.5, color: AppTheme.textMuted),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 8),
              const Divider(height: 1, color: Colors.black12),
              const SizedBox(height: 8),

              // ANIQ DARSGA KIRGAN VAQTI AUDITI
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(
                        checkInTime != null ? Icons.fingerprint_rounded : Icons.info_outline_rounded,
                        size: 15,
                        color: checkInTime != null
                            ? (attStatus == 'LATE' ? Colors.amber.shade800 : AppTheme.success)
                            : AppTheme.textMuted,
                      ),
                      const SizedBox(width: 5),
                      if (checkInTime != null) ...[
                        Text(
                          "Kirish vaqti: ",
                          style: const TextStyle(fontSize: 11.5, color: AppTheme.textMuted),
                        ),
                        Text(
                          "$checkInTime",
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w900,
                            color: attStatus == 'LATE' ? Colors.amber.shade900 : AppTheme.success,
                          ),
                        ),
                        if (checkInDiff != null) ...[
                          const SizedBox(width: 4),
                          Text(
                            "($checkInDiff)",
                            style: TextStyle(fontSize: 10.5, color: Colors.grey.shade600),
                          ),
                        ],
                      ] else ...[
                        Text(
                          attStatus == 'ABSENT' ? "Darsga kirish qayd etilmagan" : "Darsga kirish kutilmoqda",
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: attStatus == 'ABSENT' ? Colors.red.shade600 : AppTheme.textMuted,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const Icon(Icons.chevron_right_rounded, size: 18, color: AppTheme.primary),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // =========================================================================
  // 1.6 Dars Davomati Tafsiloti Modali (Bottom Sheet)
  // =========================================================================
  void _showLessonDetailModal(BuildContext context, Map<String, dynamic> lesson, String dateStr, String dayName) {
    final order = lesson['order'] ?? 1;
    final subject = lesson['subject_name'] ?? 'Fan';
    final timeStr = lesson['time'] ?? '08:30 - 09:15';
    final startTime = lesson['start_time'] ?? '08:30';
    final endTime = lesson['end_time'] ?? '09:15';
    final room = lesson['room_number'] ?? '101-xona';
    final teacher = lesson['teacher_name'] ?? 'Fan o\'qituvchisi';
    final topic = lesson['topic'] ?? '';
    final attStatus = lesson['attendance_status'] ?? 'PRESENT';
    final checkInTime = lesson['check_in_time'];
    final checkInFull = lesson['check_in_full'];
    final checkInDiff = lesson['check_in_diff'];
    final entryMethod = lesson['entry_method'] ?? 'Biometrik Face ID (Yuz skaneri)';
    final markedBy = lesson['marked_by'] ?? teacher;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Yuqori tortqich (handle)
              Center(
                child: Container(
                  width: 44,
                  height: 4.5,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Sarlavha
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryLight,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.school_rounded, color: AppTheme.primary, size: 26),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          subject,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: AppTheme.textDark),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          "$order-${ApiService.lessonTermSingular.toLowerCase()} ($timeStr) • $room",
                          style: const TextStyle(fontSize: 12, color: AppTheme.textMuted, fontWeight: FontWeight.w600),
                        ),
                        Text(
                          "$dateStr, $dayName",
                          style: const TextStyle(fontSize: 11.5, color: AppTheme.primary, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // ANIQ DARSGA KIRGAN VAQTI - KATTA MAXSUS AUDIT KARTASI
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: attStatus == 'ABSENT'
                        ? [Colors.red.shade50, Colors.red.shade100.withValues(alpha: 0.5)]
                        : (attStatus == 'LATE'
                            ? [Colors.amber.shade50, Colors.amber.shade100.withValues(alpha: 0.4)]
                            : [AppTheme.primaryLight.withValues(alpha: 0.6), const Color(0xFFE8F5E9)]),
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: attStatus == 'ABSENT'
                        ? Colors.red.shade300
                        : (attStatus == 'LATE' ? Colors.amber.shade400 : AppTheme.success.withValues(alpha: 0.5)),
                    width: 1.5,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(
                              attStatus == 'ABSENT' ? Icons.cancel_rounded : Icons.verified_rounded,
                              color: attStatus == 'ABSENT'
                                  ? Colors.red.shade700
                                  : (attStatus == 'LATE' ? Colors.amber.shade800 : AppTheme.success),
                              size: 18,
                            ),
                            const SizedBox(width: 6),
                            const Text(
                              "DAVOMAT & KIRISH AUDITI",
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 0.5),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            attStatus == 'PRESENT'
                                ? "BOR ✅"
                                : (attStatus == 'LATE' ? "KECHIKDI ⚠️" : (attStatus == 'ABSENT' ? "KELMADI ❌" : "KUTILMOQDA")),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              color: attStatus == 'ABSENT'
                                  ? Colors.red.shade700
                                  : (attStatus == 'LATE' ? Colors.amber.shade800 : AppTheme.success),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    if (checkInTime != null) ...[
                      const Text(
                        "Darsga kirgan aniq vaqti:",
                        style: TextStyle(fontSize: 12, color: AppTheme.textDark, fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            "$checkInTime",
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.w900,
                              color: attStatus == 'LATE' ? Colors.amber.shade900 : AppTheme.primaryDark,
                            ),
                          ),
                          if (checkInDiff != null) ...[
                            const SizedBox(width: 8),
                            Flexible(
                              child: Text(
                                "($checkInDiff)",
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: attStatus == 'LATE' ? Colors.amber.shade900 : AppTheme.success,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 6),
                      if (checkInFull != null)
                        Text(
                          "To'liq sana-vaqt: $checkInFull",
                          style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                        ),
                    ] else ...[
                      Text(
                        attStatus == 'ABSENT'
                            ? "Ushbu darsga talaba kelmagan (2 soat NB sababsiz hisoblangan)"
                            : "Darsga kirish hali qayd etilmagan",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: attStatus == 'ABSENT' ? Colors.red.shade800 : AppTheme.textDark,
                        ),
                      ),
                    ],

                    const SizedBox(height: 10),
                    const Divider(height: 1, color: Colors.black12),
                    const SizedBox(height: 8),

                    Row(
                      children: [
                        const Icon(Icons.fingerprint_rounded, size: 14, color: AppTheme.primary),
                        const SizedBox(width: 4),
                        Text(
                          "Verifikatsiya usuli: $entryMethod",
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.textDark),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // O'qituvchi va Dars tafsilotlari
              _buildDetailItem(Icons.person_rounded, "O'qituvchi", teacher),
              const SizedBox(height: 8),
              _buildDetailItem(Icons.meeting_room_outlined, "Auditoriya / Xona", room),
              const SizedBox(height: 8),
              _buildDetailItem(Icons.access_time_rounded, "Dars oralig'i", "$startTime dan $endTime gacha"),
              if (topic.toString().trim().isNotEmpty) ...[
                const SizedBox(height: 8),
                _buildDetailItem(Icons.menu_book_rounded, "Dars mavzusi", topic),
              ],
              const SizedBox(height: 8),
              _buildDetailItem(Icons.how_to_reg_rounded, "Davomatni qayd etuvchi", markedBy),
              const SizedBox(height: 8),
              _buildDetailItem(Icons.shield_outlined, "Tizim nazorati", "Smart School AI Biometrik Audit"),

              const SizedBox(height: 20),

              // Yopish tugmasi
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text("Tushunarli", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                ),
              ),
              const SizedBox(height: 10),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailItem(IconData icon, String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black.withValues(alpha: 0.03)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: AppTheme.primary),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                const SizedBox(height: 1),
                Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
