import 'package:flutter/material.dart';
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

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
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

    final turniketLogs = [
      {"date": "Bugun, 14-okt", "entry": "08:14", "exit": "--:--", "gate": "Turniket #1 (Asosiy)"},
      {"date": "Kecha, 13-okt", "entry": "08:22", "exit": "13:45", "gate": "Turniket #2 (Sharqiy)"},
      {"date": "12-okt (Juma)", "entry": "08:10", "exit": "14:05", "gate": "Turniket #1 (Asosiy)"},
      {"date": "11-okt (Pay)", "entry": "08:29", "exit": "13:30", "gate": "Turniket #3 (Kutubxona)"},
    ];

    return SingleChildScrollView(
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
            separatorBuilder: (_, __) => const SizedBox(height: 12),
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
              separatorBuilder: (_, __) => const Divider(height: 20),
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
    );
  }

  // =========================================================================
  // 2.3. "Haftalik Jadval" Tabi (To‘liq reja)
  // =========================================================================
  Widget _buildWeeklyScheduleTab() {
    final scheduleDays = [
      {
        "day": "Dushanba",
        "date": "14-oktyabr",
        "lessons": [
          {"pair": "1-para (08:30 - 09:50)", "subject": "Oliy Matematika", "room": "302-auditoriya", "teacher": "Dots. Rahimov A.", "building": "1-o'quv binosi"},
          {"pair": "2-para (10:00 - 11:20)", "subject": "Fizika (Amaliy)", "room": "204-lab", "teacher": "Prof. Saidov J.", "building": "2-laboratoriya binosi"},
          {"pair": "3-para (11:40 - 13:00)", "subject": "Informatika & Python", "room": "105-kompyuter zali", "teacher": "Katta o'qit. Mirzayev B.", "building": "IT Hub"},
        ]
      },
      {
        "day": "Seshanba",
        "date": "15-oktyabr",
        "lessons": [
          {"pair": "1-para (08:30 - 09:50)", "subject": "Ma'lumotlar Tuzilmasi", "room": "401-auditoriya", "teacher": "Dots. Xoliqov N.", "building": "1-o'quv binosi"},
          {"pair": "2-para (10:00 - 11:20)", "subject": "Ingliz tili (IELTS prep)", "room": "210-xona", "teacher": "Senior Lecturer Smith J.", "building": "Til markazi"},
        ]
      },
      {
        "day": "Chorshanba",
        "date": "16-oktyabr",
        "lessons": [
          {"pair": "1-para (08:30 - 09:50)", "subject": "Differensial Tenglamalar", "room": "305-auditoriya", "teacher": "Dots. Rahimov A.", "building": "1-o'quv binosi"},
          {"pair": "2-para (10:00 - 11:20)", "subject": "Falsafa va Mantiq", "room": "Katta majlislar zali", "teacher": "Prof. Aliyev Sh.", "building": "Bosh bino"},
          {"pair": "3-para (11:40 - 13:00)", "subject": "Jismoniy Tarbiya", "room": "Sport majmuasi", "teacher": "Murabbiy Qosimov T.", "building": "Stadion"},
        ]
      },
    ];

    return SingleChildScrollView(
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
                      Text("Dars o'zgarishi haqida e'lon", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF996500))),
                      SizedBox(height: 2),
                      Text("Chorshanba kungi 2-para majlislar zalida ochiq ma'ruza shaklida o'tkaziladi.", style: TextStyle(fontSize: 11.5, color: Color(0xFF7A5200))),
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
            itemCount: scheduleDays.length,
            separatorBuilder: (_, __) => const SizedBox(height: 20),
            itemBuilder: (ctx, i) {
              final d = scheduleDays[i];
              final lessons = d['lessons'] as List<Map<String, String>>;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.primary,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text("${d['day']}", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                      const SizedBox(width: 10),
                      Text("${d['date']}", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMuted)),
                    ],
                  ),
                  const SizedBox(height: 10),

                  ...lessons.map((les) {
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
                                les['pair']!,
                                style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 12),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryLight,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(les['room']!, style: const TextStyle(color: AppTheme.primary, fontSize: 11, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            les['subject']!,
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.person_outline, size: 13, color: AppTheme.textMuted),
                              const SizedBox(width: 4),
                              Text(les['teacher']!, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                              const Spacer(),
                              const Icon(Icons.location_on_outlined, size: 13, color: AppTheme.textMuted),
                              const SizedBox(width: 4),
                              Text(les['building']!, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
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
    );
  }
}
