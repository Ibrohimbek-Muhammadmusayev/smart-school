import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme.dart';
import 'teacher_scan_screen.dart';
import 'teacher_passwords_screen.dart';
import '../student/profile_screen.dart';

class TeacherDashboard extends StatefulWidget {
  const TeacherDashboard({super.key});

  @override
  State<TeacherDashboard> createState() => _TeacherDashboardState();
}

class _TeacherDashboardState extends State<TeacherDashboard> {
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
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final user = ApiService.currentUser ?? {};
    final canManagePasswords = user['can_manage_passwords'] == true || user['role'] == 'ADMIN';

    return Scaffold(
      body: SafeArea(
        child: IndexedStack(
          index: _tabIndex,
          children: [
            _buildMyLessonsTab(user),    // 1. Darslarim (Tepada navbatdagi faol dars bilan)
            _buildMyGroupsTab(),         // 2. Guruhlarim (Sinflar va o'quvchilar tarkibi)
            _buildMyResultsTab(),        // 3. Natijalarim (Darsini tugatgan guruhlar va davomat tarixi)
            _buildMenuTab(canManagePasswords), // 4. Menu Sahifasi (Barcha amallar, parollar, sozlamalar)
          ],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
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
            BottomNavigationBarItem(icon: Icon(Icons.school_rounded), label: "Darslarim"),
            BottomNavigationBarItem(icon: Icon(Icons.groups_rounded), label: "Guruhlarim"),
            BottomNavigationBarItem(icon: Icon(Icons.assignment_turned_in_rounded), label: "Natijalarim"),
            BottomNavigationBarItem(icon: Icon(Icons.grid_view_rounded), label: "Menu"),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // 1. DARSLARIM SAHIFASI (Boshida tepada kirishi kerak bo'lgan dars chiqadi)
  // =========================================================================
  Widget _buildMyLessonsTab(Map<String, dynamic> user) {
    final fullName = user['full_name'] ?? 'Ustoz';

    // Faol / Kirishi kerak bo'lgan birinchi dars (Active yoki eng birinchi dars)
    dynamic nextLesson;
    final otherLessons = <dynamic>[];

    for (var l in _lessons) {
      if (nextLesson == null && (l['status'] == 'ACTIVE' || l['status'] == 'PENDING')) {
        nextLesson = l;
      } else {
        otherLessons.add(l);
      }
    }

    return RefreshIndicator(
      onRefresh: () async => _fetchLessons(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Bar
            Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppTheme.primaryLight,
                  child: const Icon(Icons.person, color: AppTheme.primary, size: 26),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Assalomu alaykum, $fullName 👋",
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                      ),
                      const SizedBox(height: 2),
                      const Text("O'qituvchi Boshqaruv Markazi", style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                    ],
                  ),
                ),
                IconButton(onPressed: _fetchLessons, icon: const Icon(Icons.refresh_rounded))
              ],
            ),
            const SizedBox(height: 20),

            // 🔥 TEPADA CHIQIB TURGAN KIRISHI KERAK BO'LGAN ASOSIY DARS BLOKI
            if (nextLesson != null) ...[
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFFF5722), Color(0xFFFF8A65)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFFF5722).withValues(alpha: 0.3),
                      blurRadius: 16,
                      offset: const Offset(0, 8),
                    )
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
                              Text("Hozirgi / Navbatdagi Dars", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
                          child: Text(
                            nextLesson['class_name'] ?? '9-A',
                            style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      nextLesson['subject_name'] ?? 'Fan',
                      style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.access_time_rounded, size: 15, color: Colors.white70),
                        const SizedBox(width: 6),
                        Text("${nextLesson['start_time']} - ${nextLesson['end_time']}", style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(width: 16),
                        const Icon(Icons.room_rounded, size: 15, color: Colors.white70),
                        const SizedBox(width: 6),
                        Text(nextLesson['room_number'] ?? 'Xona', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 18),

                    // Katta Harakat Tugmasi: Darsga kirish / Davomat olish
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppTheme.primary,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => TeacherScanScreen(lessonId: nextLesson['id'])),
                          );
                        },
                        icon: const Icon(Icons.qr_code_scanner_rounded, size: 22),
                        label: const Text("Darsni Boshlash (QR Davomat)", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Qolgan darslar ro'yxati
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Kunning Qolgan Darslari", style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
                Text("${otherLessons.length} ta dars", style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
              ],
            ),
            const SizedBox(height: 12),

            if (_loading)
              const Center(child: Padding(padding: EdgeInsets.all(30), child: CircularProgressIndicator()))
            else if (otherLessons.isEmpty)
              const Center(child: Padding(padding: EdgeInsets.all(24), child: Text("Boshqa darslar qolmadi", style: TextStyle(color: AppTheme.textMuted))))
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: otherLessons.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (ctx, i) {
                  final lesson = otherLessons[i];
                  return _buildLessonListItem(lesson);
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildLessonListItem(dynamic lesson) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          )
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppTheme.accentLight, borderRadius: BorderRadius.circular(14)),
            child: const Icon(Icons.menu_book_rounded, color: AppTheme.accent, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(lesson['subject_name'] ?? 'Fan', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 2),
                Text("${lesson['class_name']} • ${lesson['start_time']} • ${lesson['room_number']}", style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
              ],
            ),
          ),
          IconButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => TeacherScanScreen(lessonId: lesson['id'])),
              );
            },
            icon: const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: AppTheme.primary),
          )
        ],
      ),
    );
  }

  // =========================================================================
  // 2. GURUHLARIM SAHIFASI
  // =========================================================================
  Widget _buildMyGroupsTab() {
    final groups = [
      {"name": "9-A Sinf", "subject": "Matematika & Geometriya", "count": "30 nafar", "room": "302-xona", "attendance": "96%"},
      {"name": "9-B Sinf", "subject": "Fizika & Astronomiya", "count": "28 nafar", "room": "204-laboratoriya", "attendance": "92%"},
      {"name": "10-A Sinf", "subject": "Informatika & Dasturlash", "count": "26 nafar", "room": "105-kompyuter", "attendance": "100%"},
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Mening Guruhlarim", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
          const SizedBox(height: 4),
          const Text("Siz dars berayotgan sinflar va o'quvchilar tarkibi", style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          const SizedBox(height: 20),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: groups.length,
            separatorBuilder: (_, __) => const SizedBox(height: 14),
            itemBuilder: (ctx, i) {
              final g = groups[i];
              return Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4))
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(color: AppTheme.primaryLight, borderRadius: BorderRadius.circular(10)),
                          child: Text(g['name']!, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary, fontSize: 13)),
                        ),
                        const Spacer(),
                        const Icon(Icons.people_alt_rounded, size: 16, color: AppTheme.textMuted),
                        const SizedBox(width: 4),
                        Text(g['count']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.textDark)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(g['subject']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textDark)),
                    const SizedBox(height: 4),
                    Text("Xona: ${g['room']} | O'rtacha davomat: ${g['attendance']}", style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
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
  // 3. NATIJALARIM SAHIFASI (Darsini tugatgan guruhlar va davomat natijalari)
  // =========================================================================
  Widget _buildMyResultsTab() {
    final completedLessons = [
      {
        "class": "9-A Sinf",
        "subject": "Matematika",
        "topic": "Kvadrat tenglamalar yechish usullari",
        "date": "Bugun, 08:30",
        "present": "28 nafar",
        "absent": "2 nafar",
        "status": "Yakunlangan ✅",
        "avgScore": "4.8"
      },
      {
        "class": "10-A Sinf",
        "subject": "Informatika",
        "topic": "Python dasturlash: Sikllar va massivlar",
        "date": "Kecha, 11:20",
        "present": "26 nafar",
        "absent": "0 nafar",
        "status": "Yakunlangan ✅",
        "avgScore": "5.0"
      },
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Natijalarim & Yakunlangan Darslar", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
          const SizedBox(height: 4),
          const Text("Darsi yakunlangan guruhlar, davomat va qo'yilgan baholar", style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          const SizedBox(height: 20),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: completedLessons.length,
            separatorBuilder: (_, __) => const SizedBox(height: 14),
            itemBuilder: (ctx, i) {
              final c = completedLessons[i];
              return Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4))
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(c['class']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        const SizedBox(width: 8),
                        Text("• ${c['subject']}", style: const TextStyle(fontWeight: FontWeight.w600, color: AppTheme.textMuted, fontSize: 13)),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8)),
                          child: Text(c['status']!, style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 11)),
                        )
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text("Mavzu: ${c['topic']}", style: const TextStyle(fontSize: 13, color: AppTheme.textDark)),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text("Sana: ${c['date']}", style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                        Text("Keldi: ${c['present']} | Kelmadi: ${c['absent']}", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primary)),
                      ],
                    ),
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
  // 4. MENU SAHIFASI (Sozlamalar, parollar, profil, yordam)
  // =========================================================================
  Widget _buildMenuTab(bool canManagePasswords) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Menu & Qo'shimcha Xizmatlar", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
          const SizedBox(height: 4),
          const Text("O'qituvchi profilining barcha sozlamalari", style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          const SizedBox(height: 20),

          // Menu Tiles
          if (canManagePasswords)
            _buildMenuItem(
              icon: Icons.vpn_key_rounded,
              title: "O'quvchilar Parolini Tiklash",
              subtitle: "Parolini unutgan o'quvchilarga yangi parol berish",
              color: AppTheme.accent,
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const TeacherPasswordsScreen()));
              },
            ),
          
          _buildMenuItem(
            icon: Icons.person_rounded,
            title: "Mening Profilim",
            subtitle: "Shaxsiy ma'lumotlar va Face ID holati",
            color: AppTheme.primary,
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen()));
            },
          ),

          _buildMenuItem(
            icon: Icons.send_to_mobile_rounded,
            title: "Telegram Xabarnomalar Jurnali",
            subtitle: "Ota-onalarga yuborilgan xabarlar hisoboti",
            color: Colors.blue,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Barcha Telegram xabarlari yetkazilmoqda!")));
            },
          ),

          _buildMenuItem(
            icon: Icons.help_outline_rounded,
            title: "Qo'llanma & Yordam",
            subtitle: "QR davomat va Face ID ishlash qoidalari",
            color: Colors.teal,
            onTap: () {},
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
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 3))
        ],
      ),
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(14)),
          child: Icon(icon, color: color, size: 22),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        subtitle: Text(subtitle, style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: AppTheme.textMuted),
      ),
    );
  }
}
