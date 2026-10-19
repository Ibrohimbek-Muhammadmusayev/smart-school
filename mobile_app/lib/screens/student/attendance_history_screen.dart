import 'package:flutter/services.dart';
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme.dart';

class AttendanceHistoryScreen extends StatefulWidget {
  const AttendanceHistoryScreen({super.key});

  @override
  State<AttendanceHistoryScreen> createState() => _AttendanceHistoryScreenState();
}

class _AttendanceHistoryScreenState extends State<AttendanceHistoryScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedSemester = '1-semestr (Kuzgi)';
  String _selectedShift = '1-smena (08:30)';
  List<dynamic> _weeklySchedules = [];
  bool _loadingSchedule = true;
  Map<String, dynamic>? _dashboardSummary;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchAllData();
  }

  Future<void> _fetchAllData({bool silent = false}) async {
    if (!silent) setState(() => _loadingSchedule = true);
    try {
      final results = await Future.wait([
        ApiService.getWeeklySchedule(),
        ApiService.getStudentDashboardSummary(),
      ]);
      if (mounted) {
        setState(() {
          if (results[0] is List) _weeklySchedules = results[0] as List;
          if (results[1] is Map<String, dynamic>) _dashboardSummary = results[1] as Map<String, dynamic>;
        });
        if (silent) HapticFeedback.lightImpact();
      }
    } catch (_) {}
    if (mounted && !silent) setState(() => _loadingSchedule = false);
  }

  Future<void> _handlePullToRefresh() async {
    await _fetchAllData(silent: true);
    if (mounted) {
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: const [
              Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
              SizedBox(width: 10),
              Text(
                "Davomat va haftalik dars jadvali yangilandi ✅",
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
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          "Davomat & Dars Jadvallari",
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.textDark),
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.02),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: TabBar(
              controller: _tabController,
              indicatorSize: TabBarIndicatorSize.tab,
              dividerColor: Colors.transparent,
              indicator: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withValues(alpha: 0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              labelColor: Colors.white,
              unselectedLabelColor: AppTheme.textMuted,
              labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              tabs: const [
                Tab(text: "Davomat Tarixi"),
                Tab(text: "Haftalik Jadval"),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildAttendanceAuditTab(),
          _buildWeeklyScheduleTab(),
        ],
      ),
    );
  }

  // =========================================================================
  // 2.2. "Davomat Tarixi" Tabi (Chuqurlashtirilgan audit)
  // =========================================================================
  Widget _buildAttendanceAuditTab() {
    final subjects = [
      {
        "name": "Matematika (Algebra va Analiz)",
        "totalHours": 60,
        "attendedHours": 54,
        "missedHours": 6,
        "percent": 90,
      },
      {
        "name": "Fizika & Elektrodinamika",
        "totalHours": 54,
        "attendedHours": 48,
        "missedHours": 6,
        "percent": 88,
      },
      {
        "name": "Informatika & Python",
        "totalHours": 72,
        "attendedHours": 70,
        "missedHours": 2,
        "percent": 97,
      },
      {
        "name": "Ingliz tili (Academic English)",
        "totalHours": 48,
        "attendedHours": 34,
        "missedHours": 14,
        "percent": 70, // NB chegarasi xavfi (<75%)
      },
    ];

    final stats = _dashboardSummary?['stats'] ?? {};
    final todayEntry = stats['turnstile_entry'] ?? '08:05';
    final todayExit = stats['turnstile_exit'] ?? '--:--';

    final turniketLogs = [
      {"date": "Bugun", "entry": todayEntry, "exit": todayExit, "gate": "Turniket #1 (Asosiy)"},
      {"date": "Kecha", "entry": "08:22", "exit": "13:45", "gate": "Turniket #2 (Sharqiy)"},
      {"date": "12-okt (Juma)", "entry": "08:10", "exit": "14:05", "gate": "Turniket #1 (Asosiy)"},
      {"date": "11-okt (Pay)", "entry": "08:29", "exit": "13:30", "gate": "Turniket #3 (Kutubxona)"},
    ];

    return RefreshIndicator(
      color: AppTheme.primary,
      backgroundColor: Colors.white,
      displacement: 32,
      onRefresh: _handlePullToRefresh,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Filtrlash paneli & Eksport tugmasi
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedSemester,
                      isExpanded: true,
                      icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppTheme.primary),
                      items: ["1-semestr (Kuzgi)", "2-semestr (Bahorgi)"].map((e) {
                        return DropdownMenuItem(value: e, child: Text(e, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)));
                      }).toList(),
                      onChanged: (v) => setState(() => _selectedSemester = v!),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // PDF Yuklab olish
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryLight,
                  foregroundColor: AppTheme.primary,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Oylik davomat varaqasi (PDF) yuklab olinmoqda...")),
                  );
                },
                icon: const Icon(Icons.picture_as_pdf_rounded, size: 18),
                label: const Text("PDF", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Fanlar kesimidagi davomat
          const Text(
            "Fanlar Kesimidagi Davomat & Imtihon Huquqi",
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
          ),
          const SizedBox(height: 4),
          const Text("75% dan past ko'rsatkich imtihondan chetlashtirishga sabab bo'ladi", style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
          const SizedBox(height: 12),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: subjects.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (ctx, i) {
              final sub = subjects[i];
              final percent = sub['percent'] as int;
              final isAllowed = percent >= 75;

              return Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(
                    color: isAllowed ? Colors.black.withValues(alpha: 0.04) : Colors.red.shade200,
                  ),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 3)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            "${sub['name']}",
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppTheme.textDark),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: isAllowed ? AppTheme.success.withValues(alpha: 0.12) : Colors.red.shade50,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                isAllowed ? Icons.verified_rounded : Icons.warning_amber_rounded,
                                size: 14,
                                color: isAllowed ? AppTheme.success : Colors.red.shade700,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                isAllowed ? "Ruxsat etilgan" : "Xavfli (<75%)",
                                style: TextStyle(
                                  color: isAllowed ? AppTheme.success : Colors.red.shade700,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Progress bar
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: percent / 100.0,
                        minHeight: 7,
                        backgroundColor: Colors.grey.shade100,
                        color: isAllowed ? AppTheme.primary : Colors.red.shade600,
                      ),
                    ),
                    const SizedBox(height: 10),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text("Yuklama: ${sub['totalHours']} soat", style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                        Text("Qatnashgan: ${sub['attendedHours']} soat", style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.success)),
                        Text("Qoldirilgan (NB): ${sub['missedHours']} soat", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isAllowed ? AppTheme.secondaryOrange : Colors.red.shade700)),
                        Text("$percent%", style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: isAllowed ? AppTheme.primary : Colors.red.shade700)),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),

          const SizedBox(height: 24),

          // Bino Turniketi Loglari
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Bino Turniket Kirish-Chiqish Tarixi",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
              ),
              const Icon(Icons.history_rounded, size: 20, color: AppTheme.primary),
            ],
          ),
          const SizedBox(height: 12),

          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
            ),
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: turniketLogs.length,
              separatorBuilder: (context, index) => const Divider(height: 20),
              itemBuilder: (ctx, i) {
                final log = turniketLogs[i];
                return Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryLight,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(Icons.sensor_door_outlined, color: AppTheme.primary, size: 20),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("${log['date']}", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textDark)),
                          const SizedBox(height: 2),
                          Text("${log['gate']}", style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text("Kirish: ${log['entry']}", style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.success)),
                        Text("Chiqish: ${log['exit']}", style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                      ],
                    ),
                  ],
                );
              },
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
      ),
    );
  }

  // =========================================================================
  // 2.3. "Haftalik Jadval" Tabi (To‘liq reja)
  // =========================================================================
  Widget _buildWeeklyScheduleTab() {
    final todayWeekday = DateTime.now().weekday;
    if (_loadingSchedule && _weeklySchedules.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(40),
          child: CircularProgressIndicator(),
        ),
      );
    }

    // Agar bazadan dars jadvali kelgan bo'lsa
    final List<dynamic> daysList = _weeklySchedules.isNotEmpty
        ? _weeklySchedules
        : [
            {"day_name": "Dushanba", "lessons": []},
            {"day_name": "Seshanba", "lessons": []},
            {"day_name": "Chorshanba", "lessons": []},
            {"day_name": "Payshanba", "lessons": []},
            {"day_name": "Juma", "lessons": []},
            {"day_name": "Shanba", "lessons": []},
          ];

    return RefreshIndicator(
      onRefresh: _handlePullToRefresh,
      color: AppTheme.primary,
      backgroundColor: Colors.white,
      displacement: 32,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Smena tanlagich va E'lon
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedShift,
                        isExpanded: true,
                        icon: const Icon(Icons.schedule_rounded, color: AppTheme.primary),
                        items: ["1-smena (08:30)", "2-smena (13:30)"].map((e) {
                          return DropdownMenuItem(value: e, child: Text(e, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)));
                        }).toList(),
                        onChanged: (v) => setState(() => _selectedShift = v!),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // E'lon / Dars o'zgarishi kartasi
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF9E6),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.secondaryOrange.withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.campaign_rounded, color: AppTheme.secondaryOrange, size: 26),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Dars jadvali to'g'ridan-to'g'ri maktab bazasidan sinxronlangan", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF996500))),
                        SizedBox(height: 2),
                        Text("Ma'muriyat tomonidan kiritilgan barcha darslar va xonalar real vaqtda yangilanadi.", style: TextStyle(fontSize: 11.5, color: Color(0xFF7A5200))),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Kunlar bo'yicha paralar
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: daysList.length,
              separatorBuilder: (context, index) => const SizedBox(height: 20),
              itemBuilder: (ctx, i) {
                final d = daysList[i];
                final dayNum = d['day_of_week'] ?? (i + 1);
                final isToday = (dayNum == todayWeekday);
                final dayTitle = d['day_name'] ?? 'Kun';
                final lessons = (d['lessons'] as List?) ?? [];

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            gradient: isToday ? AppTheme.primaryGradient : null,
                            color: isToday ? null : AppTheme.primary,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: isToday
                                ? [BoxShadow(color: AppTheme.primary.withValues(alpha: 0.35), blurRadius: 8, offset: const Offset(0, 3))]
                                : null,
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(dayTitle, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                              if (isToday) ...[
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text("BUGUN", style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w900, fontSize: 9.5)),
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          lessons.isNotEmpty ? "${lessons.length} ta ${ApiService.lessonTermPlural.toLowerCase()}" : "Dam olish",
                          style: TextStyle(
                            fontWeight: FontWeight.bold, 
                            fontSize: 13, 
                            color: isToday ? AppTheme.primary : AppTheme.textMuted,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    if (lessons.isEmpty)
                      Container(
                        width: double.infinity,
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
                        ),
                        child: const Text("Ushbu kunga darslar belgilanmagan", style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                      )
                    else
                      ...lessons.map((les) {
                        final order = les['order'] ?? les['lesson_order'] ?? 1;
                        final sTime = les['start_time'] ?? '';
                        final eTime = les['end_time'] ?? '';
                        final room = les['room_number'] ?? les['room'] ?? '101-xona';
                        final subject = les['subject_name'] ?? 'Fan';
                        final teacher = les['teacher_name'] ?? 'Ustoz';
                        final topic = les['topic'] ?? '';

                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    "$order-${ApiService.lessonTermSingular.toLowerCase()} ($sTime - $eTime)",
                                    style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 12),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppTheme.primaryLight,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(room, style: const TextStyle(color: AppTheme.primary, fontSize: 11, fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                subject,
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                              ),
                              if (topic.toString().trim().isNotEmpty) ...[
                                const SizedBox(height: 3),
                                Text(
                                  topic,
                                  style: const TextStyle(fontSize: 11.5, color: AppTheme.textMuted, fontStyle: FontStyle.italic),
                                ),
                              ],
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  const Icon(Icons.person_outline, size: 13, color: AppTheme.textMuted),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      teacher, 
                                      maxLines: 1, 
                                      overflow: TextOverflow.ellipsis, 
                                      style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      }),
                  ],
                );
              },
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

