import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme.dart';

class GradesScreen extends StatefulWidget {
  const GradesScreen({super.key});

  @override
  State<GradesScreen> createState() => _GradesScreenState();
}

class _GradesScreenState extends State<GradesScreen> {
  List<dynamic> _grades = [];
  bool _loading = true;
  String _selectedFilter = 'Barchasi';

  @override
  void initState() {
    super.initState();
    _fetchGrades();
  }

  void _fetchGrades() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getMyGrades();
      setState(() => _grades = list);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Baholar Jurnali", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
          const SizedBox(height: 4),
          const Text("O'zlashtirish va fanlar statistikasi", style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          const SizedBox(height: 18),

          // Fanlar filtri
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: ['Barchasi', 'Matematika', 'Fizika', 'Informatika'].map((cat) {
                final isSelected = _selectedFilter == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(cat),
                    selected: isSelected,
                    onSelected: (val) => setState(() => _selectedFilter = cat),
                    selectedColor: AppTheme.primary,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : AppTheme.textDark,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                    backgroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 20),

          // Baholar ro'yxati
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _grades.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.auto_stories_outlined, size: 64, color: Colors.grey.shade300),
                            const SizedBox(height: 12),
                            const Text("Hozircha baholar mavjud emas", style: TextStyle(color: AppTheme.textMuted)),
                          ],
                        ),
                      )
                    : ListView.separated(
                        itemCount: _grades.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (ctx, i) {
                          final g = _grades[i];
                          return Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8)],
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 46,
                                  height: 46,
                                  decoration: BoxDecoration(
                                    color: AppTheme.primaryLight,
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: Center(
                                    child: Text(
                                      "${g['score']}",
                                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: AppTheme.primary),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(g['subject_name'] ?? 'Fan', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                      const SizedBox(height: 2),
                                      Text(g['topic'] ?? '', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                                      if (g['comment']?.isNotEmpty == true) ...[
                                        const SizedBox(height: 4),
                                        Text("Izoh: ${g['comment']}", style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: AppTheme.accent)),
                                      ]
                                    ],
                                  ),
                                ),
                                Text(
                                  g['date'] ?? '',
                                  style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
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
