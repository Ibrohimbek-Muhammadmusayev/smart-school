import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../../services/api_service.dart';
import '../../theme.dart';

class BoardAIWriteScreen extends StatefulWidget {
  final int sessionId;
  final String deviceToken;
  final String geminiApiKey;
  final int initialListIndex;

  const BoardAIWriteScreen({
    super.key,
    required this.sessionId,
    required this.deviceToken,
    this.geminiApiKey = '',
    this.initialListIndex = 0,
  });

  @override
  State<BoardAIWriteScreen> createState() => _BoardAIWriteScreenState();
}

class _BoardAIWriteScreenState extends State<BoardAIWriteScreen> {
  final TextEditingController _questionController = TextEditingController();
  late final TextEditingController _apiKeyController;
  int _selectedListIndex = 0;
  bool _loading = false;
  String? _lastGeneratedAnswer;
  bool _showApiKeyField = false;

  final List<String> _quickPrompts = [
    "Alisher Navoiy hayoti va ijodi haqida qisqacha",
    "Kvadrat tenglama va diskriminant formulasi",
    "Nyutonning harakat qonunlari (1, 2, 3-qonunlar)",
    "Fotosintez jarayoni va uning bosqichlari",
    "Ingliz tilida Present Perfect zamon qoidasi",
  ];

  @override
  void initState() {
    super.initState();
    _selectedListIndex = widget.initialListIndex;
    _apiKeyController = TextEditingController(text: widget.geminiApiKey);
  }

  @override
  void dispose() {
    _questionController.dispose();
    _apiKeyController.dispose();
    super.dispose();
  }

  String _buildFallbackEducationalText(String question) {
    final q = question.trim();
    return "📌 MAVZU: ${q.toUpperCase()}\n\n"
        "1. Asosiy tushuncha:\n"
        "• $q — darsning muhim nazariy va amaliy qismi hisoblanadi.\n\n"
        "2. Muhim qoidalar va nuqtalar:\n"
        "• Ta'rif va asosiy xossalar tahlili;\n"
        "• Amaliy misollar va masalalar yechimi;\n"
        "• Xulosa va mustahkamlash savollari.\n\n"
        "✍️ Vazifa: Doskadagi asosiy qoidalarni daftarga ko'chirib oling.";
  }

  Future<void> _onAskAI() async {
    final question = _questionController.text.trim();
    if (question.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Iltimos, avval savol yoki mavzuni yozing!"),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    setState(() => _loading = true);

    String answer = '';
    final activeKey = _apiKeyController.text.trim();

    try {
      if (activeKey.isNotEmpty) {
        final model = GenerativeModel(
          model: 'gemini-1.5-flash',
          apiKey: activeKey,
        );
        final response = await model.generateContent([
          Content.text(
            'Savol: $question\n\n'
            'Javobni o\'zbek tilida, elektron doskaga sig\'adigan '
            'qisqa va aniq formatda ber. '
            'Maksimum 200 so\'z.',
          ),
        ]);
        answer = (response.text ?? '').trim();
      }
    } catch (e) {
      debugPrint("Gemini API xatoligi: $e");
    }

    if (answer.isEmpty) {
      answer = _buildFallbackEducationalText(question);
    }

    try {
      final listName = 'List ${_selectedListIndex + 1} (AI)';
      final res = await ApiService.saveBoardCanvas(
        sessionId: widget.sessionId,
        deviceToken: widget.deviceToken,
        canvases: [
          {
            'list_index': _selectedListIndex,
            'list_name': listName,
            'canvas_data': jsonEncode({
              'type': 'ai_text',
              'question': question,
              'content': answer,
              'timestamp': DateTime.now().toIso8601String(),
            }),
          }
        ],
      );

      if (!mounted) return;
      setState(() {
        _loading = false;
        _lastGeneratedAnswer = answer;
      });

      if (res['statusCode'] == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle_rounded, color: Colors.white),
                SizedBox(width: 8),
                Expanded(child: Text("AI javobi doskaga yuborildi ✅")),
              ],
            ),
            backgroundColor: AppTheme.success,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res['detail'] ?? "Doskaga yuborishda xatolik yuz berdi"),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Tarmoq xatoligi: $e"),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("AI Yordamchi (Doskaga Yozish)"),
        actions: [
          IconButton(
            tooltip: "Gemini API Key sozlamasi",
            onPressed: () => setState(() => _showApiKeyField = !_showApiKeyField),
            icon: Icon(
              Icons.key_rounded,
              color: _showApiKeyField ? AppTheme.primary : AppTheme.textMuted,
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Banner (StudentDashboard stili)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(26),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withValues(alpha: 0.3),
                    blurRadius: 18,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 30),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "🤖 Gemini AI Doska Yordamchisi",
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        SizedBox(height: 4),
                        Text(
                          "Mavzu yoki savolni yozing — AI qisqa konspekt tayyorlab, to'g'ridan-to'g'ri elektron doskaga chiqaradi.",
                          style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.3),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Ixtiyoriy Gemini API Key kiritish bloki
            if (_showApiKeyField) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.primary.withValues(alpha: 0.2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.vpn_key_rounded, size: 16, color: AppTheme.primary),
                        SizedBox(width: 6),
                        Text(
                          "Gemini API Kaliti (Qurilmadan yoki shaxsiy)",
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _apiKeyController,
                      decoration: const InputDecoration(
                        hintText: "AIzaSy...",
                        isDense: true,
                      ),
                      style: const TextStyle(fontSize: 13),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // List (Sahifa) tanlash
            const Text(
              "Doska sahifasini (List) tanlang:",
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textDark),
            ),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: List.generate(5, (index) {
                  final selected = _selectedListIndex == index;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(12),
                      onTap: () => setState(() => _selectedListIndex = index),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: selected ? AppTheme.primary : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: selected ? AppTheme.primary : Colors.black.withValues(alpha: 0.06),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.layers_rounded,
                              size: 15,
                              color: selected ? Colors.white : AppTheme.textMuted,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              "List ${index + 1}",
                              style: TextStyle(
                                fontSize: 12.5,
                                fontWeight: FontWeight.bold,
                                color: selected ? Colors.white : AppTheme.textDark,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),
            const SizedBox(height: 18),

            // Tezkor shablonlar
            const Text(
              "Tezkor dars mavzulari:",
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textDark),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _quickPrompts.map((prompt) {
                return InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: () {
                    setState(() {
                      _questionController.text = prompt;
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryLight,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      prompt,
                      style: const TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.primary,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 18),

            // Savol yozish maydoni
            const Text(
              "Savol yoki mavzuni yozing:",
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textDark),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _questionController,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: "Masalan: Alisher Navoiy haqida qisqacha ma'lumot va asosiy asarlari...",
              ),
            ),
            const SizedBox(height: 18),

            // Doskaga yozish tugmasi
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _loading ? null : _onAskAI,
                icon: _loading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Icon(Icons.edit_note_rounded, size: 22),
                label: Text(_loading ? "AI javob tayyorlamoqda..." : "📝 Doskaga yozish"),
              ),
            ),

            // Oxirgi yuborilgan javob preyuisi
            if (_lastGeneratedAnswer != null) ...[
              const SizedBox(height: 24),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: AppTheme.success.withValues(alpha: 0.3)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
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
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.success.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            "List ${_selectedListIndex + 1} ga yozildi ✅",
                            style: const TextStyle(
                              color: AppTheme.success,
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                            ),
                          ),
                        ),
                        const Spacer(),
                        const Icon(Icons.tv_rounded, size: 18, color: AppTheme.primary),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _lastGeneratedAnswer!,
                      style: const TextStyle(
                        fontSize: 13.5,
                        color: AppTheme.textDark,
                        height: 1.45,
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
