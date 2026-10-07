import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme.dart';
import 'lesson_room_screen.dart';
import 'grades_screen.dart';
import 'profile_screen.dart';

class StudentDashboard extends StatefulWidget {
  const StudentDashboard({super.key});

  @override
  State<StudentDashboard> createState() => _StudentDashboardState();
}

class _StudentDashboardState extends State<StudentDashboard> {
  int _tabIndex = 0;
  List<dynamic> _lessons = [];
  bool _loading = true;

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
    } catch (e) {
      // debug
    } finally {
      if (mounted) setState(() => _loading = false);
    }
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
            const GradesScreen(),
            const ProfileScreen(),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 16, offset: const Offset(0, -4)),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _tabIndex,
          onTap: (i) => setState(() => _tabIndex = i),
          selectedItemColor: AppTheme.primary,
          unselectedItemColor: AppTheme.textMuted,
          backgroundColor: Colors.white,
          elevation: 0,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: "Bosh sahifa"),
            BottomNavigationBarItem(icon: Icon(Icons.bar_chart_rounded), label: "Baholar"),
            BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: "Profil"),
          ],
        ),
      ),
    );
  }

  Widget _buildHomeTab(String fullName, String className) {
    return RefreshIndicator(
      onRefresh: () async => _fetchLessons(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Bar (Rasmga to'liq mos keladigan Profile Header)
            Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: AppTheme.primaryLight,
                  child: const Icon(Icons.person_rounded, color: AppTheme.primary, size: 28),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Salom, $fullName 👋",
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(color: AppTheme.accentLight, borderRadius: BorderRadius.circular(6)),
                            child: Text(className, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.accent)),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.security, size: 13, color: AppTheme.success),
                          const SizedBox(width: 3),
                          const Text("Sessiya: 10 kun qoldi", style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                        ],
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: _fetchLessons,
                  icon: const Icon(Icons.notifications_none_rounded, color: AppTheme.textDark),
                )
              ],
            ),
            const SizedBox(height: 24),

            // Banner Card (Inspirational / Attention)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFF7E5F), Color(0xFFFEB47B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(color: const Color(0xFFFF7E5F).withOpacity(0.3), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(color: Colors.white.withOpacity(0.25), borderRadius: BorderRadius.circular(10)),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.bolt_rounded, size: 14, color: Colors.white),
                              SizedBox(width: 4),
                              Text("Jonli Davomat", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 10),
                        const Text(
                          "Darsga kirdingizmi?",
                          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          "Ustozga dinamik QR kodni ko'rsatib dars materiallarini oching.",
                          style: TextStyle(color: Colors.white, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                    child: const Icon(Icons.qr_code_scanner_rounded, size: 32, color: AppTheme.primary),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "Bugungi Darslar Jadvali",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                ),
                Text("${_lessons.length} ta dars", style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
              ],
            ),
            const SizedBox(height: 14),

            if (_loading)
              const Center(child: Padding(padding: EdgeInsets.all(30), child: CircularProgressIndicator()))
            else if (_lessons.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(40),
                  child: Text("Bugun darslar rejalashtirilmagan"),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _lessons.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (ctx, i) {
                  final lesson = _lessons[i];
                  return _buildLessonCard(lesson);
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildLessonCard(dynamic lesson) {
    final status = lesson['status'] ?? 'PENDING';
    final isActive = status == 'ACTIVE';

    Color statusColor = Colors.grey;
    String statusLabel = "Kutilmoqda";
    if (isActive) {
      statusColor = AppTheme.success;
      statusLabel = "Boshlangan";
    } else if (status == 'COMPLETED') {
      statusColor = AppTheme.textMuted;
      statusLabel = "Yakunlangan";
    }

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isActive ? AppTheme.primaryLight : const Color(0xFFF0F2F5),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  Icons.menu_book_rounded,
                  color: isActive ? AppTheme.primary : AppTheme.textDark,
                  size: 24,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lesson['subject_name'] ?? 'Fan',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textDark),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      "Ustoz: ${lesson['teacher_name'] ?? '-'}",
                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  statusLabel,
                  style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 11),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              const Icon(Icons.access_time_rounded, size: 14, color: AppTheme.textMuted),
              const SizedBox(width: 4),
              Text("${lesson['start_time']} - ${lesson['end_time']}", style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
              const SizedBox(width: 16),
              const Icon(Icons.room_rounded, size: 14, color: AppTheme.textMuted),
              const SizedBox(width: 4),
              Text(lesson['room_number'] ?? 'Xona', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
            ],
          ),
          const SizedBox(height: 16),

          // Tezkor harakat tugmasi: Davomat uchun QR ochish / Darsga kirish
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: isActive ? AppTheme.primary : const Color(0xFFF1F3F6),
                foregroundColor: isActive ? Colors.white : AppTheme.textDark,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => LessonRoomScreen(lessonId: lesson['id'])),
                );
              },
              icon: Icon(isActive ? Icons.qr_code_2_rounded : Icons.lock_outline_rounded, size: 18),
              label: Text(
                isActive ? "Davomat uchun QR ochish" : "Dars xonasiga kirish",
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ),
          )
        ],
      ),
    );
  }
}
